const express = require('express');
const router = express.Router();
const {
  getAllJobs, getJob, createJob, updateJob, deleteJob,
  getMyPostedJobs, getWalkInJobs, closeJob,
} = require('../controllers/jobController');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');
const { jobPostRateLimiter } = require('../middleware/rateLimiter');

router.get('/', optionalAuth, getAllJobs);
router.get('/walk-ins', optionalAuth, getWalkInJobs);
router.get('/my-jobs', protect, restrictTo('recruiter', 'admin'), getMyPostedJobs);
router.get('/:id', optionalAuth, getJob);
router.post('/', protect, restrictTo('recruiter', 'admin'), jobPostRateLimiter, createJob);
router.put('/:id', protect, restrictTo('recruiter', 'admin'), updateJob);
router.patch('/:id/close', protect, restrictTo('recruiter', 'admin'), closeJob);
router.delete('/:id', protect, restrictTo('recruiter', 'admin'), deleteJob);

module.exports = router;
