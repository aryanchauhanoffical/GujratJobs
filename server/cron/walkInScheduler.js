/**
 * Walk-in Drive Automation — Daily Cron Scheduler
 *
 * Fires at 01:00 UTC = 06:30 AM IST every day (IST = UTC+5:30, no DST).
 * Cron expression: '0 0 1 * * *'  (6-field: sec min hour day month weekday)
 *
 * Each run performs four steps in order:
 *   A — expire past walk-in drives (status → 'closed')
 *   B — refresh urgencyScore for all upcoming drives
 *   C — notify all active jobseekers about today's drives
 *   D — trigger fresh scraping focused on walk-in keywords
 */

const cron = require('node-cron');
const Job = require('../models/Job');
const { calculateUrgencyScore } = require('../utils/walkInUrgency');
const { sendTodayWalkInNotifications } = require('../utils/walkInNotifier');

function initWalkInScheduler(io) {
  // 01:00 UTC daily = 06:30 AM IST
  cron.schedule('0 0 1 * * *', async () => {
    console.log('[cron] Walk-in scheduler fired');

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    try {
      // A — auto-expire past walk-in drives
      const expireResult = await Job.updateMany(
        { isWalkIn: true, status: 'active', 'walkInDetails.date': { $lt: startOfToday } },
        { $set: { status: 'closed' } }
      );
      console.log(`[cron] Expired ${expireResult.modifiedCount} past walk-in drives`);

      // B — refresh urgencyScore for all upcoming active drives
      const upcoming = await Job.find({
        isWalkIn: true,
        status: 'active',
        'walkInDetails.date': { $gte: startOfToday },
      }).select('_id walkInDetails.date').lean();

      if (upcoming.length) {
        await Job.bulkWrite(
          upcoming.map((j) => ({
            updateOne: {
              filter: { _id: j._id },
              update: { $set: { urgencyScore: calculateUrgencyScore(j.walkInDetails.date) } },
            },
          }))
        );
        console.log(`[cron] Refreshed urgencyScore for ${upcoming.length} upcoming drives`);
      }

      // C — notify jobseekers about today's drives (urgencyScore 100 = today)
      const todaysJobs = await Job.find({
        isWalkIn: true,
        status: 'active',
        urgencyScore: 100,
      }).select('_id title company walkInDetails location').lean();

      await sendTodayWalkInNotifications(io, todaysJobs);

      // D — trigger fresh scraping (fire-and-forget; scrapingStatus guards concurrent runs)
      if (process.env.ENABLE_SCRAPER !== 'true') {
        console.log('[cron] Scraping skipped — ENABLE_SCRAPER not set');
      } else {
        const { runScrapingJob, scrapingStatus } = require('../controllers/scrapingController');
        if (!scrapingStatus.isRunning) {
          runScrapingJob(
            ['walk in interview Gujarat', 'walkin drive Ahmedabad', 'hiring drive Gujarat'],
            'Gujarat, India'
          );
          console.log('[cron] Scraping triggered for walk-in keywords');
        } else {
          console.log('[cron] Skipped scraping — already running');
        }
      }
    } catch (err) {
      console.error('[cron] Walk-in scheduler error:', err.message);
    }
  });

  console.log('[cron] Walk-in scheduler initialized — fires daily at 06:30 IST (01:00 UTC)');
}

module.exports = { initWalkInScheduler };
