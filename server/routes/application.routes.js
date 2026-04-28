const express = require('express');
const router = express.Router();
const {
  applyToJob, getMyApplications, getJobApplications,
  updateApplicationStatus, withdrawApplication,
} = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/auth');
const { applicationRateLimiter } = require('../middleware/rateLimiter');

router.post('/job/:jobId', protect, restrictTo('jobseeker'), applicationRateLimiter, applyToJob);
router.get('/my', protect, restrictTo('jobseeker'), getMyApplications);
router.get('/job/:jobId', protect, restrictTo('recruiter', 'admin'), getJobApplications);
router.put('/:id/status', protect, restrictTo('recruiter', 'admin'), updateApplicationStatus);
router.delete('/:id/withdraw', protect, restrictTo('jobseeker'), withdrawApplication);

module.exports = router;
