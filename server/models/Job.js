const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    salary: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
      period: {
        type: String,
        enum: ['monthly', 'yearly', 'hourly'],
        default: 'monthly',
      },
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        default: 'Gujarat',
      },
      pincode: String,
      address: String,
      lat: Number,
      lng: Number,
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      required: [true, 'Job type is required'],
    },
    category: {
      type: String,
      trim: true,
    },
    isWalkIn: {
      type: Boolean,
      default: false,
    },
    walkInDetails: {
      date: Date,
      startTime: String,
      endTime: String,
      venue: String,
      contactPerson: String,
      contactPhone: String,
      contactEmail: { type: String, trim: true },
      contactLinkedin: { type: String, trim: true },
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior', 'lead'],
      required: [true, 'Experience level is required'],
    },
    minExperience: {
      type: Number,
      default: 0,
    },
    maxExperience: {
      type: Number,
      default: 0,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    qualification: {
      type: String,
      enum: ['10th', '12th', 'Diploma', 'Graduate', 'Post-Graduate', 'Any', ''],
      default: 'Any',
    },
    source: {
      type: String,
      enum: ['manual', 'scraped'],
      default: 'manual',
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    applicantCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft', 'pending_approval'],
      default: 'active',
    },
    isGuaranteedHiring: {
      type: Boolean,
      default: false,
    },
    mandatoryHireCount: {
      type: Number,
      default: 0,
    },
    fastTrack: {
      type: Boolean,
      default: false,
    },
    isFresherFriendly: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    benefits: [String],
    openings: {
      type: Number,
      default: 1,
    },
    deadline: Date,
    views: {
      type: Number,
      default: 0,
    },
    scrapedAt: Date,
    urgencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
jobSchema.index({ 'location.city': 1, status: 1 });
jobSchema.index({ title: 'text', description: 'text', company: 'text', tags: 'text' });
jobSchema.index({ recruiter: 1 });
jobSchema.index({ type: 1, status: 1 });
jobSchema.index({ isWalkIn: 1, status: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ isWalkIn: 1, 'walkInDetails.date': 1, status: 1 });

// Virtual: isExpired
jobSchema.virtual('isExpired').get(function () {
  if (!this.deadline) return false;
  return new Date() > this.deadline;
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
