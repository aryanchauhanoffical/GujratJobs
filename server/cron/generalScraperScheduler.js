const cron = require('node-cron');
const { runScrapingJob, scrapingStatus } = require('../controllers/scrapingController');

const DEFAULT_KEYWORDS = [
  'fresher jobs Gujarat',
  'entry level jobs Ahmedabad',
  'jobs in Surat',
  'jobs in Vadodara',
  'walk in interview Gujarat',
];
const DEFAULT_LOCATION = 'Gujarat, India';

function kickScrape(reason) {
  if (scrapingStatus.isRunning) {
    console.log(`[scraper] Skipped (${reason}) — already running`);
    return;
  }
  console.log(`[scraper] Triggered (${reason})`);
  runScrapingJob(DEFAULT_KEYWORDS, DEFAULT_LOCATION);
}

function initGeneralScraper() {
  if (process.env.ENABLE_SCRAPER !== 'true') {
    console.log('[scraper] Disabled (set ENABLE_SCRAPER=true to enable)');
    return;
  }

  // Every 6 hours at minute 0
  cron.schedule('0 */6 * * *', () => kickScrape('6h cron'));

  // Startup kick — delay 30s so DB connection and routes are warm
  setTimeout(() => kickScrape('startup'), 30_000);

  console.log('[scraper] General scraper initialized — every 6h + 30s after startup');
}

module.exports = { initGeneralScraper };
