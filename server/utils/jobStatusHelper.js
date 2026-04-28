/**
 * Centralized job status constants and auto-approval logic for scraped jobs.
 *
 * Auto-approval rule (Option B):
 *   Trusted platform (LinkedIn / Indeed) + meaningful data → active immediately
 *   Everything else → pending_approval (admin review queue)
 */

const JOB_STATUS = {
  ACTIVE: 'active',
  PENDING_APPROVAL: 'pending_approval',
  DRAFT: 'draft',
  CLOSED: 'closed',
};

// Platforms whose jobs can be auto-approved when data quality is sufficient
const TRUSTED_PLATFORMS = ['linkedin', 'indeed'];

/**
 * Scores 0–100 based on data completeness.
 * Extensible: add new criteria by appending to each block.
 */
function calculateConfidenceScore(job) {
  let score = 0;

  if (job.title && job.title.length >= 5)       score += 20;
  if (job.description) {
    if (job.description.length > 100)            score += 25;
    if (job.description.length > 300)            score += 10;
  }
  if (job.salary?.min > 0 || job.salary?.max > 0) score += 20;

  const url = (job.sourceUrl || '').toLowerCase();
  if (TRUSTED_PLATFORMS.some((p) => url.includes(`${p}.com`))) score += 15;

  if (job.skills && job.skills.length > 0)       score += 5;
  if (job.location?.city)                        score += 5;

  return Math.min(score, 100);
}

/**
 * Decides the initial status for a scraped job.
 *
 * Rules (add future rules here):
 *   1. Trusted platform + (salary present OR description > 100 chars) → active
 *   2. All other scraped jobs → pending_approval
 */
function decideJobStatus(job) {
  const url = (job.sourceUrl || '').toLowerCase();
  const isFromTrustedPlatform = TRUSTED_PLATFORMS.some((p) => url.includes(`${p}.com`));

  const hasMeaningfulData =
    job.salary?.min > 0 ||
    job.salary?.max > 0 ||
    (typeof job.description === 'string' && job.description.length > 100);

  if (isFromTrustedPlatform && hasMeaningfulData) {
    return JOB_STATUS.ACTIVE;
  }

  return JOB_STATUS.PENDING_APPROVAL;
}

/**
 * Validates that a scraped job has the minimum required fields.
 * Invalid jobs are discarded before insertion.
 */
function isValidScrapedJob(job) {
  return !!(job.title?.trim() && job.description?.trim());
}

module.exports = { JOB_STATUS, calculateConfidenceScore, decideJobStatus, isValidScrapedJob };
