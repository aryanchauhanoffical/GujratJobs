const Job = require('../models/Job');
const { scrapeGujaratJobs } = require('../utils/apifyIntegration');
const { filterDuplicates } = require('../utils/duplicateChecker');
const { decideJobStatus, calculateConfidenceScore, isValidScrapedJob } = require('../utils/jobStatusHelper');
const { calculateUrgencyScore } = require('../utils/walkInUrgency');

let scrapingStatus = {
  isRunning: false,
  lastRun: null,
  lastRunStatus: null,
  jobsFound: 0,
  jobsSaved: 0,
  duplicatesFiltered: 0,
  errors: [],
};

// Trigger scraping
const triggerScraping = async (req, res, next) => {
  try {
    if (scrapingStatus.isRunning) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Scraping is already running. Please wait for it to complete.',
      });
    }

    const { keywords, location } = req.body;

    // Start scraping in background
    scrapingStatus.isRunning = true;
    scrapingStatus.errors = [];
    scrapingStatus.lastRun = new Date();
    scrapingStatus.lastRunStatus = 'running';

    // Return immediately, run scraping in background
    res.json({
      success: true,
      message: 'Scraping started in background. Check /api/scraping/status for updates.',
      data: { startedAt: scrapingStatus.lastRun },
    });

    // Run scraping asynchronously
    runScrapingJob(keywords, location);
  } catch (error) {
    next(error);
  }
};

// Background scraping job
const runScrapingJob = async (keywords, location) => {
  try {
    console.log('Starting background scraping job...');

    const scrapedJobs = await scrapeGujaratJobs(
      keywords || ['fresher jobs Gujarat', 'entry level jobs', 'jobs in Ahmedabad'],
      location || 'Gujarat, India'
    );

    scrapingStatus.jobsFound = scrapedJobs.length;

    // Filter duplicates
    const { uniqueJobs, duplicates } = await filterDuplicates(scrapedJobs);
    scrapingStatus.duplicatesFiltered = duplicates.length;

    // Find admin user for recruiter field (scraped jobs need a recruiter ref)
    const User = require('../models/User');
    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      throw new Error('No admin user found to associate with scraped jobs');
    }

    // Save unique jobs to database
    let savedCount = 0;
    let autoApprovedCount = 0;
    let pendingCount = 0;
    let discardedCount = 0;

    for (const jobData of uniqueJobs) {
      // Discard jobs missing title or description
      if (!isValidScrapedJob(jobData)) {
        discardedCount++;
        continue;
      }

      try {
        const status = decideJobStatus(jobData);
        const confidenceScore = calculateConfidenceScore(jobData);
        const urgencyScore = (jobData.isWalkIn && jobData.walkInDetails?.date)
          ? calculateUrgencyScore(new Date(jobData.walkInDetails.date))
          : null;

        await Job.create({
          ...jobData,
          recruiter: adminUser._id,
          status,
          confidenceScore,
          urgencyScore,
        });

        savedCount++;
        if (status === 'active') autoApprovedCount++;
        else pendingCount++;
      } catch (saveError) {
        console.error('Error saving job:', saveError.message);
        scrapingStatus.errors.push(saveError.message);
      }
    }

    scrapingStatus.jobsSaved = savedCount;
    scrapingStatus.isRunning = false;
    scrapingStatus.lastRunStatus = 'completed';

    console.log(
      `Scraping completed: ${savedCount} saved ` +
      `(${autoApprovedCount} auto-approved, ${pendingCount} pending review, ` +
      `${discardedCount} discarded), ${duplicates.length} duplicates filtered`
    );
  } catch (error) {
    console.error('Scraping job failed:', error.message);
    scrapingStatus.isRunning = false;
    scrapingStatus.lastRunStatus = 'failed';
    scrapingStatus.errors.push(error.message);
  }
};

// Get scraping status
const getScrapingStatus = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { status: scrapingStatus },
    });
  } catch (error) {
    next(error);
  }
};

// Get scraped jobs (pending approval)
const getScrapedJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'pending_approval' } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const query = { source: 'scraped' };
    if (status !== 'all') query.status = status;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ scrapedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { triggerScraping, getScrapingStatus, getScrapedJobs, runScrapingJob, scrapingStatus };
