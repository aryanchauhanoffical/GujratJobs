const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendApplicationReceivedEmail, sendApplicationStatusEmail } = require('../utils/emailService');

// Apply to a job
const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, expectedSalary } = req.body;

    const job = await Job.findById(jobId).populate('recruiter', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Job not found.',
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Job Closed',
        message: 'This job is no longer accepting applications.',
      });
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        error: 'Already Applied',
        message: 'You have already applied to this job.',
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      expectedSalary,
      statusHistory: [{ status: 'applied', changedAt: new Date() }],
      resumeSnapshot: req.user.resume,
    });

    // Update job applicant count
    await Job.findByIdAndUpdate(jobId, {
      $addToSet: { applicants: req.user._id },
      $inc: { applicantCount: 1 },
    });

    // Create notification for recruiter
    const recruiterNotification = await Notification.create({
      user: job.recruiter._id,
      type: 'application_received',
      title: 'New Application Received',
      message: `${req.user.name} applied for ${job.title}`,
      relatedJob: job._id,
      relatedApplication: application._id,
      actionUrl: `/recruiter/jobs/${job._id}/applicants`,
    });

    // Send socket notification to recruiter
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${job.recruiter._id}`).emit('notification', {
        type: 'application_received',
        message: `${req.user.name} applied for ${job.title}`,
        notification: recruiterNotification,
      });
    }

    // Send email to recruiter
    try {
      await sendApplicationReceivedEmail(job.recruiter, job, req.user);
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }

    res.status(201).json({
      success: true,
      data: { application },
      message: 'Application submitted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get my applications (job seeker)
const getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { applicant: req.user._id };
    if (status && status !== 'all') query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({
          path: 'job',
          select: 'title company location type salary isWalkIn walkInDetails experienceLevel status',
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        applications,
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

// Get job applicants (recruiter)
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, recruiter: req.user._id });

    if (!job && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to view these applications.',
      });
    }

    const query = { job: jobId };
    if (status && status !== 'all') query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email phone profilePic skills experience location bio qualification resume')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(query),
    ]);

    // Mark applications as viewed
    await Application.updateMany(
      { job: jobId, status: 'applied' },
      { $set: { status: 'viewed', isRead: true } }
    );

    res.json({
      success: true,
      data: {
        applications,
        job: { title: job?.title, company: job?.company },
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

// Update application status (recruiter)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, recruiterNotes, interviewSchedule } = req.body;

    const allowedStatuses = ['viewed', 'shortlisted', 'interview_scheduled', 'rejected', 'hired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Status',
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(id)
      .populate('job', 'title company recruiter')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Application not found.',
      });
    }

    // Check recruiter owns the job
    if (
      application.job.recruiter.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only manage applications for your own jobs.',
      });
    }

    const previousStatus = application.status;

    application.status = status;
    if (recruiterNotes) application.recruiterNotes = recruiterNotes;
    if (interviewSchedule) application.interviewSchedule = interviewSchedule;

    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      note: recruiterNotes,
    });

    await application.save({ validateBeforeSave: false });

    // Determine notification type
    const notificationTypeMap = {
      shortlisted: 'application_shortlisted',
      rejected: 'application_rejected',
      hired: 'application_hired',
      interview_scheduled: 'interview_scheduled',
      viewed: 'application_viewed',
    };

    const notificationType = notificationTypeMap[status] || 'application_viewed';

    const notificationMessages = {
      shortlisted: `Congratulations! You've been shortlisted for ${application.job.title} at ${application.job.company}`,
      rejected: `Your application for ${application.job.title} at ${application.job.company} was not selected`,
      hired: `You have been hired for ${application.job.title} at ${application.job.company}! 🎉`,
      interview_scheduled: `Interview scheduled for ${application.job.title} at ${application.job.company}`,
      viewed: `Your application for ${application.job.title} was viewed by the recruiter`,
    };

    // Create notification for applicant
    const notification = await Notification.create({
      user: application.applicant._id,
      type: notificationType,
      title: notificationMessages[status] ? 'Application Update' : 'Application Viewed',
      message: notificationMessages[status] || `Application status updated to ${status}`,
      relatedJob: application.job._id,
      relatedApplication: application._id,
      actionUrl: '/applications',
    });

    // Socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${application.applicant._id}`).emit('notification', {
        type: notificationType,
        message: notificationMessages[status],
        notification,
      });
    }

    // Send email
    try {
      await sendApplicationStatusEmail(application.applicant, application.job, status);
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }

    res.json({
      success: true,
      data: { application },
      message: `Application ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw application (job seeker)
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Application not found.',
      });
    }

    if (['hired', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot Withdraw',
        message: 'You cannot withdraw this application.',
      });
    }

    application.status = 'withdrawn';
    application.statusHistory.push({ status: 'withdrawn', changedAt: new Date() });
    await application.save({ validateBeforeSave: false });

    // Update job applicant count
    await Job.findByIdAndUpdate(application.job, {
      $pull: { applicants: req.user._id },
      $inc: { applicantCount: -1 },
    });

    res.json({
      success: true,
      message: 'Application withdrawn successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
};
