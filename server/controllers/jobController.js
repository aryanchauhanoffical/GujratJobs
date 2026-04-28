const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// Get all jobs with filters
const getAllJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      city,
      type,
      experienceLevel,
      minSalary,
      maxSalary,
      isWalkIn,
      isGuaranteedHiring,
      fastTrack,
      isFresherFriendly,
      search,
      category,
      sort = '-createdAt',
    } = req.query;

    const query = { status: 'active' };

    // City filter
    if (city && city !== 'all') {
      query['location.city'] = { $regex: new RegExp(city, 'i') };
    }

    // Job type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Experience level filter
    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel;
    }

    // Salary range filter
    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary) };
    }

    // Walk-in filter
    if (isWalkIn === 'true') {
      query.isWalkIn = true;
    }

    // Guaranteed hiring filter
    if (isGuaranteedHiring === 'true') {
      query.isGuaranteedHiring = true;
    }

    // Fast track filter
    if (fastTrack === 'true') {
      query.fastTrack = true;
    }

    // Fresher friendly filter
    if (isFresherFriendly === 'true') {
      query.isFresherFriendly = true;
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build sort
    let sortQuery = {};
    if (search) {
      sortQuery = { score: { $meta: 'textScore' }, ...parseSortQuery(sort) };
    } else {
      sortQuery = parseSortQuery(sort);
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('recruiter', 'name email')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single job
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name email profilePic');

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Job not found.',
      });
    }

    // Increment views
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Check if current user applied
    let hasApplied = false;
    if (req.user) {
      const application = await Application.findOne({
        job: job._id,
        applicant: req.user._id,
      });
      hasApplied = !!application;
    }

    res.json({
      success: true,
      data: { job, hasApplied },
    });
  } catch (error) {
    next(error);
  }
};

// Create job
const createJob = async (req, res, next) => {
  try {
    const {
      title, company, description, requirements, responsibilities,
      salary, location, type, category, isWalkIn, walkInDetails,
      experienceLevel, minExperience, maxExperience, skills, qualification,
      isGuaranteedHiring, mandatoryHireCount, fastTrack, isFresherFriendly,
      tags, benefits, openings, deadline,
    } = req.body;

    const job = await Job.create({
      title,
      company,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      salary: salary || { min: 0, max: 0, currency: 'INR' },
      location,
      type,
      category,
      isWalkIn: isWalkIn || false,
      walkInDetails: isWalkIn ? walkInDetails : undefined,
      experienceLevel,
      minExperience: minExperience || 0,
      maxExperience: maxExperience || 0,
      skills: skills || [],
      qualification: qualification || 'Any',
      isGuaranteedHiring: isGuaranteedHiring || false,
      mandatoryHireCount: isGuaranteedHiring ? mandatoryHireCount : 0,
      fastTrack: fastTrack || false,
      isFresherFriendly: isFresherFriendly || experienceLevel === 'fresher',
      tags: tags || [],
      benefits: benefits || [],
      openings: openings || 1,
      deadline: deadline || null,
      recruiter: req.user._id,
      source: 'manual',
      status: 'active',
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('new_job', {
        jobId: job._id,
        title: job.title,
        company: job.company,
        city: job.location.city,
      });
    }

    res.status(201).json({
      success: true,
      data: { job },
      message: 'Job posted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Update job
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Job not found.',
      });
    }

    // Check ownership
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only update your own job postings.',
      });
    }

    const allowedUpdates = [
      'title', 'description', 'requirements', 'responsibilities',
      'salary', 'location', 'type', 'category', 'isWalkIn', 'walkInDetails',
      'experienceLevel', 'minExperience', 'maxExperience', 'skills', 'qualification',
      'isGuaranteedHiring', 'mandatoryHireCount', 'fastTrack', 'isFresherFriendly',
      'tags', 'benefits', 'openings', 'deadline', 'status',
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: { job: updatedJob },
      message: 'Job updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Delete job
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Job not found.',
      });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only delete your own job postings.',
      });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.json({
      success: true,
      message: 'Job deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get my posted jobs (recruiter)
const getMyPostedJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { recruiter: req.user._id };
    if (status && status !== 'all') query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get walk-in jobs
const getWalkInJobs = async (req, res, next) => {
  try {
    const { city, page = 1, limit = 20 } = req.query;

    const query = {
      status: 'active',
      isWalkIn: true,
      'walkInDetails.date': { $gte: new Date() },
    };

    if (city && city !== 'all') {
      query['location.city'] = { $regex: new RegExp(city, 'i') };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('recruiter', 'name')
        .sort({ 'walkInDetails.date': 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
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

// Close a job
const closeJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Not Found', message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied.' });
    }

    job.status = 'closed';
    await job.save();

    res.json({ success: true, message: 'Job closed successfully.' });
  } catch (error) {
    next(error);
  }
};

// Helper to parse sort query
const parseSortQuery = (sort) => {
  const sortMap = {
    '-createdAt': { createdAt: -1 },
    'createdAt': { createdAt: 1 },
    '-salary.max': { 'salary.max': -1 },
    'salary.min': { 'salary.min': 1 },
    '-views': { views: -1 },
  };
  return sortMap[sort] || { createdAt: -1 };
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyPostedJobs,
  getWalkInJobs,
  closeJob,
};
