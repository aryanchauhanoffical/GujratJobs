const crypto = require('crypto');
const User = require('../models/User');
const RecruiterProfile = require('../models/RecruiterProfile');
const { generateAccessToken, generateRefreshToken, setTokenCookie, clearTokenCookies } = require('../utils/jwtUtils');
const { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, companyName } = req.body;

    // Normalize email
    if (email) req.body.email = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate Email',
        message: 'An account with this email already exists.',
      });
    }

    // Only allow jobseeker and recruiter roles for self-registration
    const allowedRoles = ['jobseeker', 'recruiter'];
    const userRole = allowedRoles.includes(role) ? role : 'jobseeker';

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      verificationToken,
      verificationTokenExpires,
    });

    // If recruiter, create recruiter profile
    if (userRole === 'recruiter' && companyName) {
      await RecruiterProfile.create({
        user: user._id,
        companyName,
        verificationStatus: 'pending',
      });
    }

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    setTokenCookie(res, accessToken, 'token');
    setTokenCookie(res, refreshToken, 'refreshToken');

    const userProfile = user.toPublicProfile();

    res.status(201).json({
      success: true,
      data: {
        user: userProfile,
        token: accessToken,
      },
      message: 'Registration successful. Please verify your email.',
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Please provide email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user with password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Account Not Found',
        message: 'No account found with this email address.',
      });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Wrong Password',
        message: 'That password doesn\'t match. Please try again.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        error: 'Account Suspended',
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account Inactive',
        message: 'Your account is inactive. Please contact support.',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login and refresh token
    user.lastLogin = new Date();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    setTokenCookie(res, accessToken, 'token');
    setTokenCookie(res, refreshToken, 'refreshToken');

    const userProfile = user.toPublicProfile();

    res.json({
      success: true,
      data: {
        user: userProfile,
        token: accessToken,
      },
      message: 'Login successful.',
    });
  } catch (error) {
    next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    // Clear refresh token from DB
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    clearTokenCookies(res);

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Verify Email
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Token',
        message: 'Email verification link is invalid or has expired.',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      data: { user: user.toPublicProfile() },
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account with that email exists, we sent a password reset link.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: 'Email Error',
        message: 'There was an error sending the email. Try again later.',
      });
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Token',
        message: 'Password reset link is invalid or has expired.',
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const accessToken = generateAccessToken(user._id);
    setTokenCookie(res, accessToken, 'token');

    res.json({
      success: true,
      data: { token: accessToken },
      message: 'Password reset successful.',
    });
  } catch (error) {
    next(error);
  }
};

// Update Password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    const accessToken = generateAccessToken(user._id);
    setTokenCookie(res, accessToken, 'token');

    res.json({
      success: true,
      data: { token: accessToken },
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No refresh token provided.',
      });
    }

    const { verifyRefreshToken, generateAccessToken: genToken, setTokenCookie: setTC } = require('../utils/jwtUtils');
    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid refresh token.',
      });
    }

    const newAccessToken = genToken(user._id);
    setTC(res, newAccessToken, 'token');

    res.json({
      success: true,
      data: { token: newAccessToken },
      message: 'Token refreshed.',
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token.',
      });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  refreshToken,
};
