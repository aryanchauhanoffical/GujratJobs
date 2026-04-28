const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const RecruiterProfile = require("../models/RecruiterProfile");
const Notification = require("../models/Notification");
const { sendRecruiterApprovedEmail } = require("../utils/emailService");

// Get platform analytics
const getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalJobSeekers,
      totalRecruiters,
      newUsersThisWeek,
      totalJobs,
      activeJobs,
      newJobsThisWeek,
      totalApplications,
      applicationsThisWeek,
      hiredCount,
      pendingRecruiters,
      scrapedJobs,
      walkInJobs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "jobseeker" }),
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ createdAt: { $gte: lastWeek } }),
      Job.countDocuments(),
      Job.countDocuments({ status: "active" }),
      Job.countDocuments({ createdAt: { $gte: lastWeek } }),
      Application.countDocuments(),
      Application.countDocuments({ appliedAt: { $gte: lastWeek } }),
      Application.countDocuments({ status: "hired" }),
      RecruiterProfile.countDocuments({ verificationStatus: "pending" }),
      Job.countDocuments({ source: "scraped" }),
      Job.countDocuments({ isWalkIn: true, status: "active" }),
    ]);

    // Job categories breakdown
    const categoryBreakdown = await Job.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // City breakdown
    const cityBreakdown = await Job.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$location.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Monthly registration trend
    const registrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now - 6 * 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalJobSeekers,
          totalRecruiters,
          newUsersThisWeek,
          totalJobs,
          activeJobs,
          newJobsThisWeek,
          totalApplications,
          applicationsThisWeek,
          hiredCount,
          pendingRecruiters,
          scrapedJobs,
          walkInJobs,
        },
        categoryBreakdown,
        cityBreakdown,
        registrationTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search, isSuspended } = req.query;

    const query = {};
    if (role && role !== "all") query.role = role;
    if (isSuspended !== undefined) query.isSuspended = isSuspended === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          "-password -refreshToken -verificationToken -passwordResetToken",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        users,
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

// Suspend user
const suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Not Found",
          message: "User not found.",
        });
    }

    res.json({ success: true, data: { user }, message: "User suspended." });
  } catch (error) {
    next(error);
  }
};

// Reactivate user
const reactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Not Found",
          message: "User not found.",
        });
    }

    res.json({ success: true, data: { user }, message: "User reactivated." });
  } catch (error) {
    next(error);
  }
};

// Get pending recruiters
const getPendingRecruiters = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [profiles, total] = await Promise.all([
      RecruiterProfile.find({ verificationStatus: "pending" })
        .populate("user", "name email phone createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      RecruiterProfile.countDocuments({ verificationStatus: "pending" }),
    ]);

    res.json({
      success: true,
      data: {
        recruiters: profiles,
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

// Approve recruiter
const approveRecruiter = async (req, res, next) => {
  try {
    const profile = await RecruiterProfile.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "approved",
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
      },
      { new: true },
    ).populate("user", "name email");

    if (!profile) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Not Found",
          message: "Recruiter profile not found.",
        });
    }

    // Create notification
    await Notification.create({
      user: profile.user._id,
      type: "recruiter_approved",
      title: "Account Approved!",
      message:
        "Your recruiter account has been approved. You can now post jobs!",
    });

    // Send email
    try {
      await sendRecruiterApprovedEmail(profile.user);
    } catch (emailError) {
      console.error("Email error:", emailError.message);
    }

    // Socket notification
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${profile.user._id}`).emit("notification", {
        type: "recruiter_approved",
        message: "Your recruiter account has been approved!",
      });
    }

    res.json({
      success: true,
      data: { profile },
      message: "Recruiter approved.",
    });
  } catch (error) {
    next(error);
  }
};

// Reject recruiter
const rejectRecruiter = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const profile = await RecruiterProfile.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "rejected",
        isVerified: false,
        rejectionReason: reason,
      },
      { new: true },
    ).populate("user", "name email");

    if (!profile) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Not Found",
          message: "Recruiter profile not found.",
        });
    }

    res.json({
      success: true,
      data: { profile },
      message: "Recruiter rejected.",
    });
  } catch (error) {
    next(error);
  }
};

// Manage scraped jobs
const manageScrapedJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find({ source: "scraped", status: "pending_approval" })
        .sort({ scrapedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments({ source: "scraped", status: "pending_approval" }),
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

// Approve scraped job
const approveScrapedJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        status: "active",
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true },
    );

    if (!job) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Not Found",
          message: "Job not found.",
        });
    }

    res.json({
      success: true,
      data: { job },
      message: "Scraped job approved.",
    });
  } catch (error) {
    next(error);
  }
};

// Reject scraped job
// Approve all pending scraped jobs
const approveAllScrapedJobs = async (req, res, next) => {
  try {
    const result = await Job.updateMany(
      { source: "scraped", status: "pending_approval" },
      {
        $set: {
          status: "active",
          approvedBy: req.user._id,
          approvedAt: new Date(),
        },
      },
    );

    res.json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} scraped jobs approved.`,
    });
  } catch (error) {
    next(error);
  }
};

const rejectScrapedJob = async (req, res, next) => {
  try {
    await Job.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Scraped job rejected and removed." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getAllUsers,
  suspendUser,
  reactivateUser,
  getPendingRecruiters,
  approveRecruiter,
  rejectRecruiter,
  manageScrapedJobs,
  approveScrapedJob,
  approveAllScrapedJobs,
  rejectScrapedJob,
};
