/**
 * Single source of truth for walk-in urgencyScore.
 * Used at scraping save time AND refreshed daily by the cron scheduler.
 *
 * Scores:
 *   100 — today
 *    80 — tomorrow
 *    50 — 2–3 days from now
 *    10 — 4+ days from now
 *     0 — past date (should already be expired/closed)
 */
function calculateUrgencyScore(walkInDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(walkInDate);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((target - today) / 86_400_000);

  if (diffDays === 0) return 100;
  if (diffDays === 1) return 80;
  if (diffDays <= 3) return 50;
  if (diffDays > 3)  return 10;
  return 0;
}

module.exports = { calculateUrgencyScore };
