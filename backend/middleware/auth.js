const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const catchAsync = require('../utils/catchAsync');
const APP_CONSTANTS = require('../config/constants');

// Protect routes - verify JWT token
const protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }
  
  // 2) Verify token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    return next(new AppError('Token verification failed', 401));
  }
  
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+loginAttempts +lockUntil');
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }
  
  // 4) Check if user account is locked
  if (currentUser.isLocked) {
    return next(new AppError('Account is temporarily locked due to too many failed login attempts.', 423));
  }
  
  // 5) Check if user account is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }
  
  // 6) Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Check if user is logged in (for rendered pages, doesn't throw errors)
const isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies?.jwt || (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))) {
    try {
      const token = req.cookies?.jwt || req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser || !currentUser.isActive) {
        return next();
      }
      
      // There is a logged-in user
      req.user = currentUser;
      res.locals.user = currentUser;
    } catch (err) {
      // Token is invalid, continue without user
      return next();
    }
  }
  next();
});

// Restrict to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Check if email is verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user.verified_status.email) {
    return next(new AppError('Please verify your email address to continue.', 403));
  }
  next();
};

// Check if phone is verified
const requirePhoneVerification = (req, res, next) => {
  if (!req.user.verified_status.phone) {
    return next(new AppError('Please verify your phone number to continue.', 403));
  }
  next();
};

// Verify refresh token
const verifyRefreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }
  
  // Hash the provided refresh token to compare with stored hash
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  
  // Find user with this refresh token
  const user = await User.findOne({
    'refreshTokens.token': hashedToken,
    'refreshTokens.createdAt': { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days
  });
  
  if (!user) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
  
  // Remove the used refresh token
  user.refreshTokens = user.refreshTokens.filter(
    tokenObj => tokenObj.token !== hashedToken
  );
  await user.save();
  
  req.user = user;
  next();
});

// API Key authentication (for future use)
const authenticateApiKey = catchAsync(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new AppError('API key is required', 401));
  }
  
  // Verify API key (implement your API key logic here)
  // For now, we'll skip this implementation
  next();
});

// Rate limiting based on user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) return next();
    
    const userId = req.user._id.toString();
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Remove requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return next(new AppError(`Too many requests. Maximum ${maxRequests} requests per ${windowMs / 60000} minutes.`, 429));
    }
    
    validRequests.push(now);
    requests.set(userId, validRequests);
    
    next();
  };
};

// Check ownership of resource
const checkOwnership = (Model, paramName = 'id') => {
  return catchAsync(async (req, res, next) => {
    const resourceId = req.params[paramName];
    const resource = await Model.findById(resourceId);
    
    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }
    
    // Check if user owns the resource or is admin
    if (resource.owner?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to access this resource', 403));
    }
    
    req.resource = resource;
    next();
  });
};

// Conditional authentication (optional auth)
const optionalAuth = catchAsync(async (req, res, next) => {
  try {
    await protect(req, res, () => {});
  } catch (error) {
    // Continue without authentication
  }
  next();
});

module.exports = {
  protect,
  isLoggedIn,
  restrictTo,
  requireEmailVerification,
  requirePhoneVerification,
  verifyRefreshToken,
  authenticateApiKey,
  userRateLimit,
  checkOwnership,
  optionalAuth,
};