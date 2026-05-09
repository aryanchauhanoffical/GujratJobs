/**
 * ScrapeGraphAI optional enrichment layer.
 *
 * Sits AFTER Apify scraping. Takes a raw normalized job, sends its sourceUrl
 * to ScrapeGraphAI for AI-powered structured extraction, and merges the
 * higher-quality fields back. Apify remains the source of truth — this only
 * fills gaps (missing walk-in dates, thin descriptions, etc).
 *
 * Non-blocking by design: any failure (timeout, missing key, API error)
 * returns the original job unchanged so the scraping pipeline never breaks.
 */

const axios = require("axios");

const SCRAPEGRAPH_API_URL = "https://api.scrapegraphai.com/v1/smartscraper";
const TIMEOUT_MS = 15000;

const ENRICHMENT_PROMPT = `Extract the following structured fields from this job posting page and return as JSON only (no prose):
{
  "job_title": "string",
  "company_name": "string",
  "location": "string in 'City, State' format",
  "job_type": "walk-in" or "apply",
  "walk_in_date": "YYYY-MM-DD or null if not mentioned",
  "deadline": "YYYY-MM-DD or null if not mentioned",
  "description": "cleaned plain-text job description with no HTML tags"
}
Set walk_in_date and deadline to null if not explicitly stated. Set job_type to "walk-in" only if the page explicitly mentions a walk-in interview, walk-in drive, or hiring drive.`;

/**
 * Pick the longer/more complete value when merging.
 * Falsy / very short strings lose to anything meaningful.
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
 * Parse a date string from SGAI ('YYYY-MM-DD' expected) into a Date.
 * Returns null on any failure — never throws.
 */
const parseDate = (str) => {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  if (trimmed.toLowerCase() === "null" || !trimmed) return null;
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Enrich a single raw job using ScrapeGraphAI.
 * Always returns a job object — original on any failure.
 */
async function enrichJobData(rawJob) {
  if (!rawJob || typeof rawJob !== "object") return rawJob;

  const apiKey = process.env.SCRAPEGRAPH_API_KEY;
  if (!apiKey) {
    console.warn("[scrapegraph] SCRAPEGRAPH_API_KEY not set — skipping enrichment");
    return rawJob;
  }

  // Need a URL to crawl; without it there's nothing for SGAI to scrape
  if (!rawJob.sourceUrl || !rawJob.sourceUrl.startsWith("http")) {
    return rawJob;
  }

  const startedAt = Date.now();

  try {
    const response = await axios.post(
      SCRAPEGRAPH_API_URL,
      {
        website_url: rawJob.sourceUrl,
        user_prompt: ENRICHMENT_PROMPT,
      },
      {
        headers: {
          "SGAI-APIKEY": apiKey,
          "Content-Type": "application/json",
        },
        timeout: TIMEOUT_MS,
      },
    );

    // SGAI returns either { result: {...} } or the JSON directly depending
    // on the actor — handle both shapes
    const enriched = response.data?.result || response.data || {};
    const elapsed = Date.now() - startedAt;
    console.log(
      `[scrapegraph] Enriched job (${elapsed}ms): ${rawJob.sourceUrl.slice(0, 80)}`,
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
    return rawJob; // Non-blocking: caller continues with original data
  }
}

module.exports = { enrichJobData };
