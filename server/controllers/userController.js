const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { isGujaratLocation } = require('../utils/locationUtils');

// Get profile
const getProfile = async (req, res, next) => {
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

// Update profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'phone', 'skills', 'experience', 'bio',
      'qualification', 'currentSalary', 'expectedSalary',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: { user: user.toPublicProfile() },
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Upload resume
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No File',
        message: 'Please upload a resume file.',
      });
    }

    // Delete old resume if exists
    const user = await User.findById(req.user._id);
    if (user.resume && user.resume.filename) {
      const oldPath = path.join(__dirname, '../uploads/resumes', user.resume.filename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const resumeData = {
      filename: req.file.filename,
      url: `/uploads/resumes/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { resume: resumeData },
      { new: true }
    );

    res.json({
      success: true,
      data: { resume: resumeData },
      message: 'Resume uploaded successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile picture
const uploadProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No File',
        message: 'Please upload a profile picture.',
      });
    }

    // Delete old profile pic if exists
    const user = await User.findById(req.user._id);
    if (user.profilePic) {
      const filename = user.profilePic.split('/').pop();
      const oldPath = path.join(__dirname, '../uploads/profiles', filename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const profilePicUrl = `/uploads/profiles/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: profilePicUrl },
      { new: true }
    );

    res.json({
      success: true,
      data: { profilePic: profilePicUrl },
      message: 'Profile picture updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Update location
const updateLocation = async (req, res, next) => {
  try {
    const { city, state, pincode, lat, lng } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'City is required.',
      });
    }

    const location = {
      city,
      state: state || 'Gujarat',
      pincode,
      lat,
      lng,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { location },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: { location: user.location },
      message: 'Location updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID (public profile)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name profilePic skills experience location bio qualification'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Add job alert
const addJobAlert = async (req, res, next) => {
  try {
    const { keywords, city, jobType, minSalary } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          jobAlerts: { keywords, city, jobType, minSalary, isActive: true },
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      data: { jobAlerts: user.jobAlerts },
      message: 'Job alert added successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Remove job alert
const removeJobAlert = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { jobAlerts: { _id: req.params.alertId } },
      },
      { new: true }
    );

    res.json({
      success: true,
      data: { jobAlerts: user.jobAlerts },
      message: 'Job alert removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  uploadProfilePic,
  updateLocation,
  getUserById,
  addJobAlert,
  removeJobAlert,
};
