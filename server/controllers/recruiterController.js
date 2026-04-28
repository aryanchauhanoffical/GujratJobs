const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

// Get recruiter profile
const getRecruiterProfile = async (req, res, next) => {
  try {
    let profile = await RecruiterProfile.findOne({ user: req.user._id })
      .populate('user', 'name email phone profilePic');

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Recruiter profile not found. Please complete your profile.',
      });
    }

    res.json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
};

// Update recruiter profile
const updateRecruiterProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'companyName', 'companySize', 'industry', 'website',
      'companyDescription', 'address', 'contactEmail', 'contactPhone',
      'socialLinks',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    let profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      data: { profile },
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      newApplications,
      shortlisted,
      hired,
      profile,
    ] = await Promise.all([
      Job.countDocuments({ recruiter: recruiterId }),
      Job.countDocuments({ recruiter: recruiterId, status: 'active' }),
      Application.countDocuments({
        job: { $in: await Job.find({ recruiter: recruiterId }).distinct('_id') },
      }),
      Application.countDocuments({
        job: { $in: await Job.find({ recruiter: recruiterId }).distinct('_id') },
        status: 'applied',
        appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Application.countDocuments({
        job: { $in: await Job.find({ recruiter: recruiterId }).distinct('_id') },
        status: 'shortlisted',
      }),
      Application.countDocuments({
        job: { $in: await Job.find({ recruiter: recruiterId }).distinct('_id') },
        status: 'hired',
      }),
      RecruiterProfile.findOne({ user: recruiterId }),
    ]);

    // Recent applications
    const jobIds = await Job.find({ recruiter: recruiterId }).distinct('_id');
    const recentApplications = await Application.find({ job: { $in: jobIds } })
      .populate('applicant', 'name email profilePic')
      .populate('job', 'title company')
      .sort({ appliedAt: -1 })
      .limit(5);

    // Top performing jobs
    const topJobs = await Job.find({ recruiter: recruiterId, status: 'active' })
      .sort({ applicantCount: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          totalApplications,
          newApplications,
          shortlisted,
          hired,
          totalHired: profile?.totalHired || 0,
        },
        recentApplications,
        topJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all applicants for recruiter's jobs
const getApplicants = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const jobIds = await Job.find({ recruiter: req.user._id }).distinct('_id');

    const query = { job: { $in: jobIds } };
    if (status && status !== 'all') query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email phone profilePic skills experience location bio resume')
        .populate('job', 'title company')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark as hired
const markAsHired = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('job', 'recruiter title company');

    if (!application) {
      return res.status(404).json({ success: false, error: 'Not Found', message: 'Application not found.' });
    }

    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied.' });
    }

    application.status = 'hired';
    application.statusHistory.push({ status: 'hired', changedAt: new Date(), changedBy: req.user._id });
    await application.save({ validateBeforeSave: false });

    // Update recruiter's hire count
    await RecruiterProfile.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalHired: 1 } }
    );

    res.json({ success: true, message: 'Candidate marked as hired.', data: { application } });
  } catch (error) {
    next(error);
  }
};

// Shortlist candidate
const shortlistCandidate = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('job', 'recruiter title');

    if (!application) {
      return res.status(404).json({ success: false, error: 'Not Found', message: 'Application not found.' });
    }

    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied.' });
    }

    application.status = 'shortlisted';
    application.statusHistory.push({ status: 'shortlisted', changedAt: new Date(), changedBy: req.user._id });
    await application.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Candidate shortlisted.', data: { application } });
  } catch (error) {
    next(error);
  }
};

// Upload company logo
const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No File', message: 'Please upload a logo.' });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    const profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.user._id },
      { companyLogo: logoUrl },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: { companyLogo: logoUrl }, message: 'Company logo updated.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecruiterProfile,
  updateRecruiterProfile,
  getDashboardStats,
  getApplicants,
  markAsHired,
  shortlistCandidate,
  uploadCompanyLogo,
};
