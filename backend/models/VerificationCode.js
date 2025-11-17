const mongoose = require('mongoose');

/**
 * Schema for verification codes
 */
const verificationCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  code: {
    type: String,
    required: [true, 'Verification code is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    required: [true, 'Verification type is required']
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: { expires: 0 } // This will automatically delete the document when expiresAt is reached
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient lookups
verificationCodeSchema.index({ userId: 1, type: 1 });

// Add method to check if code is expired
verificationCodeSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Add method to increment attempts
verificationCodeSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return await this.save();
};

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

module.exports = VerificationCode;