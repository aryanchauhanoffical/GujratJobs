const express = require('express');
const router = express.Router();
const {
  register, login, logout, verifyEmail, getMe,
  forgotPassword, resetPassword, updatePassword, refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password/:token', authRateLimiter, resetPassword);
router.put('/update-password', protect, updatePassword);
router.post('/refresh-token', refreshToken);

module.exports = router;
