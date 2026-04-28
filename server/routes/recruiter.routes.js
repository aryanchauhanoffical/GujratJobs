const express = require('express');
const router = express.Router();
const {
  getRecruiterProfile, updateRecruiterProfile, getDashboardStats,
  getApplicants, markAsHired, shortlistCandidate, uploadCompanyLogo,
} = require('../controllers/recruiterController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadCompanyLogo: multerLogo, handleMulterError } = require('../middleware/upload');

router.use(protect, restrictTo('recruiter', 'admin'));

router.get('/profile', getRecruiterProfile);
router.put('/profile', updateRecruiterProfile);
router.post('/logo', multerLogo.single('logo'), handleMulterError, uploadCompanyLogo);
router.get('/dashboard', getDashboardStats);
router.get('/applicants', getApplicants);
router.put('/applicants/:applicationId/hire', markAsHired);
router.put('/applicants/:applicationId/shortlist', shortlistCandidate);

module.exports = router;
