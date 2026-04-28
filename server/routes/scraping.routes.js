const express = require('express');
const router = express.Router();
const { triggerScraping, getScrapingStatus, getScrapedJobs } = require('../controllers/scrapingController');
const { protect, restrictTo } = require('../middleware/auth');
const { scrapingRateLimiter } = require('../middleware/rateLimiter');

router.use(protect, restrictTo('admin'));

router.post('/trigger', scrapingRateLimiter, triggerScraping);
router.get('/status', getScrapingStatus);
router.get('/jobs', getScrapedJobs);

module.exports = router;
