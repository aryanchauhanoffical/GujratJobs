const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'application_received',
        'application_viewed',
        'application_shortlisted',
        'application_rejected',
        'application_hired',
        'interview_scheduled',
        'job_posted',
        'job_closed',
        'new_job_alert',
        'account_verified',
        'recruiter_approved',
        'system',
        'walk_in_reminder',
        'walk_in_today',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('Notification', notificationSchema);
