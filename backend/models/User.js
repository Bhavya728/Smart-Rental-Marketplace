const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ],
  },
  
  phone: {
    type: String,
    required: false,
    trim: true,
    default: null,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please provide a valid phone number'
    ],
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  
  name: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    }
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true,
    default: '',
  },
  
  profile_photo: {
    url: {
      type: String,
      default: '',
    },
    public_id: {
      type: String,
      default: '',
    }
  },
  
  location: {
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'US' },
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      }
    }
  },
  
  rating_avg: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    set: function(val) {
      return Math.round(val * 10) / 10; // Round to 1 decimal place
    }
  },
  
  rating_count: {
    type: Number,
    default: 0,
    min: [0, 'Rating count cannot be negative'],
  },
  
  // Verification Status (simplified)
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verified_status: {
    email: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: Boolean,
      default: false,
    },
    identity: {
      type: Boolean,
      default: false,
    }
  },
  
  role: {
    type: String,
    enum: ['owner', 'renter', 'both', 'admin', 'super_admin'],
    default: 'both',
    required: [true, 'User role is required'],
  },
  
  // Admin permissions (only for admin users)
  permissions: {
    type: [String],
    default: [],
    enum: [
      'view_users', 'edit_users', 'delete_users',
      'view_listings', 'moderate_listings', 'delete_listings',
      'view_bookings', 'manage_bookings',
      'view_analytics', 'view_logs', 'view_system_metrics',
      'export_data', 'system_maintenance'
    ]
  },
  
  // Authentication related fields
  emailVerificationToken: {
    type: String,
    select: false,
  },
  
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  
  passwordResetToken: {
    type: String,
    select: false,
  },
  
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  
  loginAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
  
  lockUntil: {
    type: Date,
    select: false,
  },
  
  refreshTokens: [{
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800, // 7 days
    }
  }],
  
  // User preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true },
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  lastLogin: {
    type: Date,
  },
  
  // Social links (optional)
  socialLinks: {
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
  }
}, {
  timestamps: true, // This creates createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance (phone index removed to avoid duplicate key issues)
userSchema.index({ email: 1 }, { unique: true });
// Note: Phone uniqueness is handled in application logic, not database index
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ createdAt: -1 });
userSchema.index({ rating_avg: -1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware for phone field only
userSchema.pre('save', async function(next) {
  try {
    // Handle phone field - convert empty strings to null for sparse index
    if (this.isModified('phone')) {
      if (!this.phone || this.phone.trim() === '') {
        this.phone = null;
      }
    }
    
    next();
  } catch (error) {
    console.error('Pre-save error:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  
  // Add to refreshTokens array
  this.refreshTokens.push({
    token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
  });
  
  return refreshToken;
};

// Generate email verification token (legacy - for backward compatibility)
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Generate simple 6-digit verification code (new approach)
userSchema.methods.generateEmailVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1,
      },
      $set: {
        loginAttempts: 1,
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 10 failed attempts for 1 hour (increased from 5 attempts, reduced lock time)
  if (this.loginAttempts + 1 >= 10 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 1 * 60 * 60 * 1000, // 1 hour (reduced from 2 hours)
    };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1,
    }
  });
};

// Update rating
userSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating_avg * this.rating_count) + newRating;
  this.rating_count += 1;
  this.rating_avg = totalRating / this.rating_count;
  return this.save();
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  delete userObject.refreshTokens;
  delete userObject.__v;
  
  return userObject;
};

// Static method to find by email or phone
userSchema.statics.findByEmailOrPhone = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { phone: identifier }
    ]
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;