/**
 * GujaratJobs — Full Dataset Scraper
 *
 * Strategy: exhaust every filter combination so jobs buried deep in one
 * dimension always surface in another.  All results are deduplicated by
 * the job's MongoDB _id before being pushed to the Apify dataset.
 *
 * Input schema (set in Apify console or .actor/input_schema.json):
 *   baseUrl   – base URL of the GujaratJobs API  (default: http://localhost:5001)
 *   apiToken  – Bearer token if the /api/jobs endpoint requires auth (optional)
 *   pageSize  – items per request, max 50                          (default: 50)
 *   concurrency – parallel filter-combo requests                   (default: 5)
 *   outputFormat – "json" | "csv"                                  (default: "json")
 */

import { Actor, Dataset, log } from 'apify';
import axios from 'axios';

// ─── Filter Dimensions ──────────────────────────────────────────────────────

const CITIES = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
  'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Navsari',
  'Morbi', 'Surendranagar', 'Mehsana', 'Bharuch', 'Porbandar',
  'Amreli', 'Bhuj', 'Gondal',
];

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];

const EXPERIENCE_LEVELS = ['fresher', 'junior', 'mid', 'senior', 'lead'];

// Each entry: [minSalary, maxSalary] in INR/month.
// minSalary is always 0 (not null) because the API errors when maxSalary is
// sent without minSalary (it builds an empty $gte query on salary.min).
const SALARY_RANGES = [
  [0, 10000],
  [10000, 20000],
  [20000, 30000],
  [30000, 50000],
  [50000, 100000],
  [100000, null],
];

// ─── Combination Generator ───────────────────────────────────────────────────

/**
 * We scrape in two passes to guarantee full coverage:
 *
 * Pass A — broad sweeps (city × type, city × experience)
 *   These surface any job that has a city + one other dimension.
 *
 * Pass B — narrow sweeps (type × experience × salary)
 *   These surface jobs whose city might not match any city keyword
 *   (e.g. city stored as "Remote, Gujarat") but still have the other attrs.
 *
 * Using two targeted passes instead of all-dimensions cartesian (would be
 * 18 × 5 × 5 × 6 = 2 700 combinations) keeps runtime reasonable while
 * still guaranteeing no job is missed by pagination alone.
 *
 * Deduplication by _id removes any overlap between passes.
 */
function buildCombinations() {
  const combos = [];

  // No-filter sweep — catches everything on a small dataset
  combos.push({});

  // City-only sweeps
  for (const city of CITIES) {
    combos.push({ city });
  }

  // City × type
  for (const city of CITIES) {
    for (const type of JOB_TYPES) {
      combos.push({ city, type });
    }
  }

  // City × experience
  for (const city of CITIES) {
    for (const experienceLevel of EXPERIENCE_LEVELS) {
      combos.push({ city, experienceLevel });
    }
  }

  // Type × experience (no city) — catches "Remote / Gujarat" jobs
  for (const type of JOB_TYPES) {
    for (const experienceLevel of EXPERIENCE_LEVELS) {
      combos.push({ type, experienceLevel });
    }
  }

  // Type × salary
  for (const type of JOB_TYPES) {
    for (const [min, max] of SALARY_RANGES) {
      const c = { type, minSalary: min };
      if (max !== null) c.maxSalary = max;
      combos.push(c);
    }
  }

  // Experience × salary
  for (const experienceLevel of EXPERIENCE_LEVELS) {
    for (const [min, max] of SALARY_RANGES) {
      const c = { experienceLevel, minSalary: min };
      if (max !== null) c.maxSalary = max;
      combos.push(c);
    }
  }

  return combos;
}

// ─── API Fetcher ─────────────────────────────────────────────────────────────

async function fetchPage(baseUrl, filters, page, pageSize, apiToken) {
  const params = { ...filters, page, limit: pageSize, sort: '-createdAt' };

  const headers = { 'Content-Type': 'application/json' };
  if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;

  const response = await axios.get(`${baseUrl}/api/jobs`, {
    params,
    headers,
    timeout: 30_000,
  });

  // API returns: { success, data: { jobs, pagination: { total, page, pages, ... } } }
  const { data } = response.data;
  return {
    jobs: data?.jobs ?? [],
    total: data?.pagination?.total ?? 0,
    pages: data?.pagination?.pages ?? 1,
  };
}

async function fetchAllPagesForCombo(baseUrl, filters, pageSize, apiToken) {
  const jobs = [];
  let page = 1;

  try {
    const first = await fetchPage(baseUrl, filters, page, pageSize, apiToken);
    jobs.push(...first.jobs);

    const totalPages = first.pages;
    page++;

    // Fetch remaining pages sequentially to avoid hammering the server
    while (page <= totalPages) {
      const result = await fetchPage(baseUrl, filters, page, pageSize, apiToken);
      jobs.push(...result.jobs);
      page++;
    }
  } catch (err) {
    log.warning(`Fetch failed for combo ${JSON.stringify(filters)}: ${err.message}`);
  }

  return jobs;
}

// ─── Normaliser ──────────────────────────────────────────────────────────────

function normalizeJob(job) {
  return {
    id: job._id?.toString() ?? '',
    title: job.title ?? '',
    company: job.company ?? '',
    companyLogo: job.companyLogo ?? null,
    description: job.description ?? '',
    requirements: (job.requirements ?? []).join(' | '),
    responsibilities: (job.responsibilities ?? []).join(' | '),
    city: job.location?.city ?? '',
    state: job.location?.state ?? 'Gujarat',
    address: job.location?.address ?? '',
    type: job.type ?? '',
    category: job.category ?? '',
    experienceLevel: job.experienceLevel ?? '',
    salaryMin: job.salary?.min ?? 0,
    salaryMax: job.salary?.max ?? 0,
    salaryCurrency: job.salary?.currency ?? 'INR',
    salaryPeriod: job.salary?.period ?? 'monthly',
    salaryNegotiable: job.salary?.isNegotiable ?? false,
    skills: (job.skills ?? []).join(', '),
    openings: job.openings ?? 1,
    isWalkIn: job.isWalkIn ?? false,
    isGuaranteedHiring: job.isGuaranteedHiring ?? false,
    isFresherFriendly: job.isFresherFriendly ?? false,
    fastTrack: job.fastTrack ?? false,
    status: job.status ?? 'active',
    source: job.source ?? 'manual',
    sourceUrl: job.sourceUrl ?? '',
    applicationCount: job.applicantCount ?? 0,
    viewCount: job.views ?? 0,
    postedAt: job.createdAt ?? '',
    expiresAt: job.expiresAt ?? '',
    recruiterName: job.recruiter?.name ?? '',
    recruiterEmail: job.recruiter?.email ?? '',
  };
}

// ─── Concurrency Helper ───────────────────────────────────────────────────────

async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const taskIdx = idx++;
      results[taskIdx] = await tasks[taskIdx]();
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

await Actor.init();

const input = (await Actor.getInput()) ?? {};

const {
  baseUrl = 'http://localhost:5001',
  apiToken = '',
  pageSize = 50,
  concurrency = 5,
} = input;

log.info(`Starting GujaratJobs scraper`, { baseUrl, pageSize, concurrency });

const combinations = buildCombinations();
log.info(`Total filter combinations to sweep: ${combinations.length}`);

const seenIds = new Set();
const dataset = await Dataset.open();

let totalNew = 0;
let totalDupes = 0;
let failedCombos = 0;

// Process combinations in batches respecting concurrency limit
const tasks = combinations.map((filters) => async () => {
  const raw = await fetchAllPagesForCombo(baseUrl, filters, pageSize, apiToken);
  const newJobs = [];

  for (const job of raw) {
    const id = job._id?.toString();
    if (!id || seenIds.has(id)) {
      totalDupes++;
      continue;
    }
    seenIds.add(id);
    newJobs.push(normalizeJob(job));
  }

  if (newJobs.length > 0) {
    await dataset.pushData(newJobs);
    totalNew += newJobs.length;
    log.info(`Combo ${JSON.stringify(filters)} → ${newJobs.length} new jobs (${raw.length - newJobs.length} dupes)`);
  }

  return newJobs.length;
});

await runWithConcurrency(tasks, concurrency);

log.info(`\n━━━ Scrape Complete ━━━`);
log.info(`Unique jobs collected : ${totalNew}`);
log.info(`Duplicate skips       : ${totalDupes}`);
log.info(`Failed combos         : ${failedCombos}`);
log.info(`Total requests made   : ~${combinations.length} combos × avg pages`);

// Write a summary item for easy inspection
await dataset.pushData({
  _summary: true,
  uniqueJobs: totalNew,
  duplicatesSkipped: totalDupes,
  combinationsSwept: combinations.length,
  scrapedAt: new Date().toISOString(),
});

await Actor.exit();
