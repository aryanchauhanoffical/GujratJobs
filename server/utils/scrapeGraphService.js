/**
 * ScrapeGraphAI optional enrichment layer (v1 smartscraper).
 *
 * Sits AFTER Apify scraping. For each raw job, sends the job's sourceUrl
 * to ScrapeGraphAI's smartscraper endpoint with a strict JSON schema for
 * the fields we want (title, company, location, walk-in date, deadline,
 * description). Merges the higher-quality fields back; Apify stays the
 * source of truth.
 *
 * Non-blocking by design: any failure (timeout, missing key, soft-failure
 * status, network error) returns the original job so the scraping pipeline
 * never breaks.
 *
 * Constraints (SGAI free tier):
 *   - 500 credits / month
 *   - 10 requests / minute
 *   - 1 concurrent request
 * We enforce concurrency=1 + a small inter-call delay so we never trip the
 * rate limit when enriching a batch of 20-30 scraped jobs.
 */

const axios = require("axios");

const SCRAPEGRAPH_API_URL = "https://api.scrapegraphai.com/v1/smartscraper";
const TIMEOUT_MS = 60000; // SGAI is synchronous and can take 5-25s per page
const MIN_INTERVAL_MS = 6500; // ~9 req/min — under the 10 req/min ceiling

const ENRICHMENT_PROMPT =
  "Extract the job posting details from this page. Return null for any field that is not explicitly mentioned. Do not invent dates.";

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    job_title: { type: "string" },
    company_name: { type: "string" },
    location: { type: "string", description: "City, State" },
    job_type: {
      type: "string",
      description: "Either 'walk-in' or 'apply'",
    },
    walk_in_date: {
      type: "string",
      description: "ISO date YYYY-MM-DD if a walk-in date is mentioned, else null",
    },
    deadline: {
      type: "string",
      description: "ISO date YYYY-MM-DD application deadline if shown, else null",
    },
    description: {
      type: "string",
      description: "Cleaned plain-text description without HTML tags",
    },
  },
  required: ["job_title", "company_name"],
};

// Serialize calls to respect the free-tier rate limit (10 req/min, 1 concurrent).
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

/**
 * Pick the longer/more complete value when merging.
 */
const pickBetter = (original, enriched) => {
  if (!enriched) return original;
  if (!original) return enriched;
  if (typeof original === "string" && typeof enriched === "string") {
    return enriched.length > original.length + 20 ? enriched : original;
  }
  return original;
};

/**
 * Parse a date string into a Date — null on any failure.
 */
const parseDate = (str) => {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return null;
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * LinkedIn aggressively blocks unauth scraping — enable stealth for those.
 * Costs +5 credits per call but actually returns data.
 */
const needsStealth = (url) => /linkedin\.com/i.test(url);

/**
 * Enrich a single raw job using ScrapeGraphAI smartscraper.
 * Always returns a job object — original on any failure.
 */
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

  // Chain so concurrency stays at 1 across the whole batch (free-tier limit).
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
        website_url: rawJob.sourceUrl,
        user_prompt: ENRICHMENT_PROMPT,
        output_schema: OUTPUT_SCHEMA,
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

    // SGAI returns 200 with status:"failed" on soft errors — treat as failure
    if (body.status && body.status !== "completed") {
      console.error(
        `[scrapegraph] Soft-fail (${body.status}, ${elapsed}ms) for ${rawJob.sourceUrl.slice(0, 80)}: ${body.error || "no error message"}`,
      );
      return rawJob;
    }

    const enriched = body.result || {};
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
