const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    status: {
      type: String,
      enum: ['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'rejected', 'hired', 'withdrawn'],
      default: 'applied',
    },
    coverLetter: {
      type: String,
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
    },
    expectedSalary: {
      type: Number,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    recruiterNotes: {
      type: String,
      maxlength: [500, 'Recruiter notes cannot exceed 500 characters'],
    },
    interviewSchedule: {
      date: Date,
      time: String,
      mode: {
        type: String,
        enum: ['in-person', 'phone', 'video'],
      },
      location: String,
      meetingLink: String,
      notes: String,
    },
    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    resumeSnapshot: {
      filename: String,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });

// Pre-save: track status changes
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
