const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { catchAsync, AppError } = require('../utils/errorHandler');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Helper function to create and send token response
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  
  // Save refresh token to user
  user.save({ validateBeforeSave: false });
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('jwt', token, cookieOptions);

  // Create a copy of user object without password for response
  const userResponse = user.toJSON(); // This already excludes password due to toJSON method in User model

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: userResponse,
      token,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRE || '30d',
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = catchAsync(async (req, res, next) => {
  const { email, password, firstName, lastName, role = 'both' } = req.body;

  console.log('Registration request:', { email, firstName, lastName, passwordExists: !!password, role });

  // Check if user already exists by email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Hash password before creating user
  console.log('Original password length:', password.length);
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Hashed password:', hashedPassword.substring(0, 20) + '...');

  // Create new user
  const userData = {
    email,
    password: hashedPassword,
    name: {
      firstName,
      lastName,
    },
    role
  };

  console.log('Creating user with data:', { 
    ...userData, 
    password: hashedPassword ? `[HASHED - ${hashedPassword.length} chars]` : 'MISSING' 
  });
  
  const user = await User.create(userData);
  console.log('User created successfully:', user._id);
  
  // Check if password was actually saved by querying with +password
  const userWithPassword = await User.findById(user._id).select('+password');
  console.log('Password saved in DB:', !!userWithPassword.password);
  console.log('DB password length:', userWithPassword.password ? userWithPassword.password.length : 0);

  // Send verification code using new method
  try {
    const { code } = await emailService.sendVerificationCode(user.email, user.name.firstName);
    
    // Save verification code in database
    const VerificationCode = require('../models/VerificationCode');
    await VerificationCode.create({
      userId: user._id,
      code,
      type: 'email',
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
    });
    
    logger.info(`User registered successfully: ${user.email}`);
  } catch (emailError) {
    logger.error('Failed to send verification email:', emailError);
    // Continue with registration even if email fails
  }

  createSendToken(user, 201, res, 'User registered successfully. Please check your email to verify your account.');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists and get password
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  console.log('Login attempt for:', email);
  console.log('User found:', !!user);
  console.log('User password exists:', user ? !!user.password : 'N/A');
  console.log('User password length:', user && user.password ? user.password.length : 0);

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  if (!user.password) {
    console.log('ERROR: User password is missing from database');
    return next(new AppError('Invalid credentials', 401));
  }

  const passwordMatch = await user.comparePassword(password);
  console.log('Password comparison result:', passwordMatch);

  if (!passwordMatch) {
    // Increment login attempts for existing user
    await user.incLoginAttempts();
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if account is locked
  if (user.isLocked) {
    // Send account locked email notification
    try {
      await emailService.sendAccountLockedEmail(user);
    } catch (emailError) {
      logger.error('Failed to send account locked email:', emailError);
    }
    return next(new AppError('Account temporarily locked due to too many failed login attempts', 423));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // Reset login attempts and update last login
  await user.resetLoginAttempts();
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in successfully: ${user.email}`);
  createSendToken(user, 200, res, 'Logged in successfully');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = catchAsync(async (req, res, next) => {
  // Clear refresh tokens
  req.user.refreshTokens = [];
  await req.user.save({ validateBeforeSave: false });

  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = catchAsync(async (req, res, next) => {
  const updates = req.validatedUpdates;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user,
    },
  });
});

// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Private
const sendEmailVerification = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.verified_status.email) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  await emailService.sendEmailVerification(user, verificationToken);

  res.status(200).json({
    success: true,
    message: 'Verification email sent successfully',
  });
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Verification token is required', 400));
  }

  // Hash token and find user
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Verify the email
  user.verified_status.email = true;
  user.isEmailVerified = true; // Also update the legacy field for consistency
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info(`Email verified successfully: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

// @desc    Send OTP for email verification
// @route   POST /api/auth/send-otp
// @access  Private
const sendEmailOTP = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.verified_status.email) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate OTP
  const otp = emailService.generateOTP(6);
  
  // Store OTP hash in user document (expires in 10 minutes)
  user.emailVerificationToken = crypto.createHash('sha256').update(otp).digest('hex');
  user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Send OTP email
  await emailService.sendEmailOTP(user, otp);

  res.status(200).json({
    success: true,
    message: 'OTP sent to your email successfully',
  });
});

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyEmailOTP = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError('OTP is required', 400));
  }

  // Hash OTP and find user
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    _id: req.user.id,
    emailVerificationToken: hashedOTP,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('OTP is invalid or has expired', 400));
  }

  // Verify the email
  user.verified_status.email = true;
  user.isEmailVerified = true; // Also update the legacy field for consistency
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info(`Email verified with OTP: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Get user based on POSTed email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // Generate the random reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send reset email
  try {
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Failed to send password reset email:', err);
    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError('Token and password are required', 400));
  }

  // Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Hash the new password before saving
  console.log('Resetting password for user:', user.email);
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('New password hashed, length:', hashedPassword.length);

  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Verify password was saved
  const verifyUser = await User.findById(user._id).select('+password');
  console.log('Password saved in DB after reset:', !!verifyUser.password);
  console.log('DB password length after reset:', verifyUser.password ? verifyUser.password.length : 0);

  // Send confirmation email
  try {
    await emailService.sendPasswordChangeConfirmation(user);
  } catch (emailError) {
    logger.error('Failed to send password change confirmation:', emailError);
  }

  logger.info(`Password reset successfully: ${user.email}`);
  createSendToken(user, 200, res, 'Password reset successfully');
});

// @desc    Update password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if POSTed current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Your current password is incorrect', 400));
  }

  // Hash the new password before saving
  console.log('Changing password for user:', user.email);
  const salt = await bcrypt.genSalt(12);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);
  console.log('New password hashed, length:', hashedNewPassword.length);

  // If so, update password
  user.password = hashedNewPassword;
  await user.save();

  // Verify password was saved
  const verifyUser = await User.findById(user._id).select('+password');
  console.log('Password saved in DB after change:', !!verifyUser.password);
  console.log('DB password length after change:', verifyUser.password ? verifyUser.password.length : 0);

  // Send confirmation email
  try {
    await emailService.sendPasswordChangeConfirmation(user);
  } catch (emailError) {
    logger.error('Failed to send password change confirmation:', emailError);
  }

  logger.info(`Password changed successfully: ${user.email}`);
  createSendToken(user, 200, res, 'Password updated successfully');
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = catchAsync(async (req, res, next) => {
  // Middleware verifyRefreshToken should have set req.user
  const user = req.user;

  // Generate new tokens
  const newToken = user.generateAuthToken();
  const newRefreshToken = user.generateRefreshToken();
  
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('jwt', newToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.JWT_EXPIRE || '30d',
    },
  });
});

// @desc    Delete account
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Password is required to delete account', 400));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check password
  if (!(await user.comparePassword(password))) {
    return next(new AppError('Password is incorrect', 400));
  }

  // Deactivate account instead of deleting
  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  user.phone = `deleted_${Date.now()}_${user.phone}`;
  await user.save({ validateBeforeSave: false });

  logger.info(`Account deleted: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// @desc    Check authentication status
// @route   GET /api/auth/check
// @access  Public
const checkAuth = catchAsync(async (req, res, next) => {
  let isAuthenticated = false;
  let user = null;

  if (req.user) {
    isAuthenticated = true;
    user = req.user;
  }

  res.status(200).json({
    success: true,
    data: {
      isAuthenticated,
      user,
    },
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  sendEmailVerification,
  verifyEmail,
  sendEmailOTP,
  verifyEmailOTP,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  deleteAccount,
  checkAuth,
};