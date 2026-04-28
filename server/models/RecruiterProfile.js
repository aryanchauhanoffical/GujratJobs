const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    },
    industry: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    companyLogo: String,
    companyDescription: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    address: {
      street: String,
      city: String,
      state: { type: String, default: 'Gujarat' },
      pincode: String,
    },
    contactEmail: String,
    contactPhone: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationDocs: [
      {
        docType: String,
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    rejectionReason: String,
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    totalJobsPosted: {
      type: Number,
      default: 0,
    },
    totalHired: {
      type: Number,
      default: 0,
    },
    averageResponseTime: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
    },
  },
  {
    timestamps: true,
  }
);

recruiterProfileSchema.index({ user: 1 });
recruiterProfileSchema.index({ isVerified: 1 });
recruiterProfileSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
