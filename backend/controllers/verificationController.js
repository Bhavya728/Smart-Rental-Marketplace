const crypto = require('crypto');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const { catchAsync, AppError } = require('../utils/errorHandler');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// @desc    Send email verification code (new improved method)
// @route   POST /api/auth/send-verification-code
// @access  Private
const sendEmailVerificationCode = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check if email is already verified
  if (user.isEmailVerified || user.verified_status.email) {
    return next(new AppError('Email is already verified', 400));
  }
  
  // Generate and send verification code
  const { code } = await emailService.sendVerificationCode(user.email, user.name.firstName);
  
  // Save verification code in database with 10 minute expiry
  await VerificationCode.create({
    userId: user._id,
    code,
    type: 'email',
    expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
  });
  
  res.status(200).json({
    success: true,
    message: 'Verification code sent to email'
  });
});

// @desc    Verify email with code (new improved method)
// @route   POST /api/auth/verify-email-code
// @access  Private
const verifyEmailWithCode = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  const userId = req.user.id;
  
  // Validate code format
  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    return next(new AppError('Invalid verification code format', 400));
  }
  
  // Get user details
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check if email is already verified
  if (user.isEmailVerified || user.verified_status.email) {
    return next(new AppError('Email is already verified', 400));
  }
  
  // Find verification code
  const verificationCode = await VerificationCode.findOne({
    userId: user._id,
    code,
    type: 'email',
    expiresAt: { $gt: new Date() }
  });
  
  if (!verificationCode) {
    return next(new AppError('Invalid or expired verification code', 400));
  }
  
  // Mark email as verified (both new and legacy fields)
  user.isEmailVerified = true;
  user.verified_status.email = true;
  await user.save({ validateBeforeSave: false });
  
  // Delete used verification code
  await VerificationCode.deleteMany({ userId: user._id, type: 'email' });
  
  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(user);
  } catch (emailError) {
    logger.error('Failed to send welcome email:', emailError);
    // Continue even if welcome email fails
  }
  
  logger.info(`Email verified successfully: ${user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Check verification status
// @route   GET /api/auth/verification-status
// @access  Private
const checkVerificationStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: {
      isEmailVerified: user.isEmailVerified || user.verified_status.email,
      isPhoneVerified: user.verified_status.phone,
      email: user.email,
      phone: user.phone
    }
  });
});

module.exports = {
  sendEmailVerificationCode,
  verifyEmailWithCode,
  checkVerificationStatus
};