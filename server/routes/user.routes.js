const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, uploadResume, uploadProfilePic,
  updateLocation, getUserById, addJobAlert, removeJobAlert,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadResume: multerResume, uploadProfilePic: multerPic, handleMulterError } = require('../middleware/upload');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/resume', protect, multerResume.single('resume'), handleMulterError, uploadResume);
router.post('/profile-pic', protect, multerPic.single('profilePic'), handleMulterError, uploadProfilePic);
router.put('/location', protect, updateLocation);
router.get('/:id', protect, getUserById);
router.post('/job-alerts', protect, addJobAlert);
router.delete('/job-alerts/:alertId', protect, removeJobAlert);

module.exports = router;
