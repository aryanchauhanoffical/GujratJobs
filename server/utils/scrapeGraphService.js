/**
 * ScrapeGraphAI optional enrichment layer (v2 /api/extract).
 *
 * Sits AFTER Apify scraping. Sends each raw job's sourceUrl to SGAI's
 * extract endpoint with a structured prompt; SGAI fetches the page,
 * runs an LLM to pull out the requested fields, and returns JSON.
 *
 * Apify stays the source of truth — this only fills gaps in description
 * and walk-in dates, never overrides good data.
 *
 * Non-blocking by design: any failure (timeout, missing key, soft-fail,
 * blocked URL, network error) returns the original job unchanged so the
 * scraping pipeline never breaks.
 *
 * Known limitations:
 *   - Naukri blocks SGAI's fetcher even with stealth → those URLs are
 *     skipped to avoid wasted credits.
 *   - LinkedIn often requires stealth (+5 credits/req).
 *
 * Free tier:
 *   - 500 credits / month
 *   - 10 requests / minute
 *   - 1 concurrent request
 * We serialize calls and add a 6.5s inter-call floor so we stay under.
 */

const axios = require("axios");

const SCRAPEGRAPH_API_URL = "https://v2-api.scrapegraphai.com/api/extract";
const TIMEOUT_MS = 60000;
const MIN_INTERVAL_MS = 6500;

const ENRICHMENT_PROMPT =
  "Extract these structured fields from the job posting page and return JSON. Use null for any field not explicitly stated. Do not invent values.\n\n" +
  "Fields:\n" +
  "- job_title: string\n" +
  "- company_name: string\n" +
  '- location: string in "City, State" format\n' +
  '- job_type: "walk-in" or "apply"\n' +
  "- walk_in_date: ISO date YYYY-MM-DD or null\n" +
  "- deadline: ISO date YYYY-MM-DD or null\n" +
  "- description: cleaned plain-text description, no HTML";

// SGAI's fetcher is blocked by these domains — skip to save credits.
const BLOCKED_DOMAINS = [/naukri\.com/i];

// Domains that need stealth (+5 credits/req) to bypass anti-bot.
const STEALTH_DOMAINS = [/linkedin\.com/i];

let lastCallAt = 0;
let inflight = Promise.resolve();

const throttle = async () => {
  const elapsed = Date.now() - lastCallAt;
  const wait = Math.max(0, MIN_INTERVAL_MS - elapsed);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastCallAt = Date.now();
};

const pickBetter = (original, enriched) => {
  if (!enriched) return original;
  if (!original) return enriched;
  if (typeof original === "string" && typeof enriched === "string") {
    return enriched.length > original.length + 20 ? enriched : original;
  }
  return original;
};

const parseDate = (str) => {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return null;
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

const isBlockedDomain = (url) => BLOCKED_DOMAINS.some((re) => re.test(url));
const needsStealth = (url) => STEALTH_DOMAINS.some((re) => re.test(url));

async function enrichJobData(rawJob) {
  if (!rawJob || typeof rawJob !== "object") return rawJob;

  const apiKey = process.env.SCRAPEGRAPH_API_KEY;
  if (!apiKey) {
    console.warn("[scrapegraph] SCRAPEGRAPH_API_KEY not set — skipping enrichment");
    return rawJob;
  }

  if (!rawJob.sourceUrl || !rawJob.sourceUrl.startsWith("http")) {
    return rawJob;
  }

  if (isBlockedDomain(rawJob.sourceUrl)) {
    console.log(
      `[scrapegraph] Skipping blocked domain: ${rawJob.sourceUrl.slice(0, 80)}`,
    );
    return rawJob;
  }

  // Serialize across the batch so we stay at concurrency=1.
  inflight = inflight.then(() => callSGAI(rawJob, apiKey)).catch(() => rawJob);
  return inflight;
}

async function callSGAI(rawJob, apiKey) {
  await throttle();

  const startedAt = Date.now();
  const stealth = needsStealth(rawJob.sourceUrl);

  try {
    const response = await axios.post(
      SCRAPEGRAPH_API_URL,
      {
        url: rawJob.sourceUrl,
        prompt: ENRICHMENT_PROMPT,
        ...(stealth ? { stealth: true } : {}),
      },
      {
        headers: {
          "SGAI-APIKEY": apiKey,
          "Content-Type": "application/json",
        },
        timeout: TIMEOUT_MS,
      },
    );

    const elapsed = Date.now() - startedAt;
    const body = response.data || {};

    // v2 returns { error: { type, message } } on soft failures (e.g.,
    // fetch_failed when a site blocks SGAI's fetcher).
    if (body.error) {
      const errMsg =
        typeof body.error === "string"
          ? body.error
          : body.error.message || JSON.stringify(body.error);
      console.error(
        `[scrapegraph] Soft-fail (${elapsed}ms) for ${rawJob.sourceUrl.slice(0, 80)}: ${errMsg}`,
      );
      return rawJob;
    }

    // v2 returns extracted data in `json` field.
    const enriched = body.json || {};

    // If the LLM returned nothing useful, treat as no-op.
    if (!enriched || Object.keys(enriched).length === 0) {
      console.log(
        `[scrapegraph] Empty extraction (${elapsed}ms) for ${rawJob.sourceUrl.slice(0, 80)}`,
      );
      return rawJob;
    }

    console.log(
      `[scrapegraph] Enriched (${elapsed}ms${stealth ? ", stealth" : ""}): ${rawJob.sourceUrl.slice(0, 80)}`,
    );

    const walkInDate = parseDate(enriched.walk_in_date);
    const deadlineDate = parseDate(enriched.deadline);

    return {
      ...rawJob,
      title: rawJob.title || enriched.job_title || "",
      company: rawJob.company || enriched.company_name || "",
      description: pickBetter(rawJob.description, enriched.description),
      isWalkIn:
        rawJob.isWalkIn === true ||
        (typeof enriched.job_type === "string" &&
          enriched.job_type.toLowerCase().includes("walk")),
      walkInDetails: {
        ...(rawJob.walkInDetails || {}),
        ...(walkInDate ? { date: walkInDate } : {}),
      },
      ...(deadlineDate ? { applicationDeadline: deadlineDate } : {}),
      _enrichedBy: "scrapegraphai",
      _enrichedAt: new Date(),
    };
  } catch (error) {
    const elapsed = Date.now() - startedAt;
    const apiResp = error.response?.data;
    console.error(
      `[scrapegraph] Enrichment failed (${elapsed}ms) for ${rawJob.sourceUrl?.slice(0, 80)}: ${error.message}`,
    );
    if (apiResp) {
      console.error(
        `  → SGAI response:`,
        JSON.stringify(apiResp).slice(0, 300),
      );
    }
    return rawJob;
  }
}

module.exports = { enrichJobData };
