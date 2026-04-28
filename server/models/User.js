const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
    },
    location: {
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        default: 'Gujarat',
      },
      pincode: {
        type: String,
        trim: true,
      },
      lat: Number,
      lng: Number,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: Number,
      default: 0,
      min: 0,
      max: 50,
    },
    resume: {
      filename: String,
      url: String,
      uploadedAt: Date,
    },
    profilePic: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    qualification: {
      type: String,
      enum: ['10th', '12th', 'Diploma', 'Graduate', 'Post-Graduate', 'PhD', 'Other'],
    },
    currentSalary: {
      type: Number,
    },
    expectedSalary: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: {
      type: String,
      enum: ['jobseeker', 'recruiter', 'admin'],
      default: 'jobseeker',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    refreshToken: String,
    jobAlerts: [
      {
        keywords: [String],
        city: String,
        jobType: String,
        minSalary: Number,
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (remove sensitive fields)
userSchema.methods.toPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.verificationTokenExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.refreshToken;
  return obj;
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('User', userSchema);
