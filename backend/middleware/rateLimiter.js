const rateLimit = require('express-rate-limit');
const { AppError } = require('../utils/errorHandler');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 5000 : 100, // much higher limit in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(new AppError('Too many requests from this IP, please try again later.', 429));
  }
});

// Strict limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res, next) => {
    next(new AppError('Too many authentication attempts from this IP, please try again later.', 429));
  }
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 password reset requests per hour (increased from 3)
  message: {
    error: 'Too many password reset attempts from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many password reset attempts from this IP, please try again later.', 429));
  }
});

// Email verification limiter
const emailVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 3 verification emails per 10 minutes
  message: {
    error: 'Too many email verification requests from this IP, please try again later.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many email verification requests from this IP, please try again later.', 429));
  }
});

// Registration limiter (increased for development)
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (reduced from 1 hour)
  max: 20, // limit each IP to 20 registrations per 15 minutes (increased from 5)
  message: {
    error: 'Too many registration attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many registration attempts from this IP, please try again later.', 429));
  }
});

// Login limiter (more generous than auth limiter for better UX)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 login attempts per 15 minutes (increased from 10)
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res, next) => {
    next(new AppError('Too many login attempts from this IP, please try again later.', 429));
  }
});

// File upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 uploads per hour
  message: {
    error: 'Too many file uploads from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many file uploads from this IP, please try again later.', 429));
  }
});

// Search limiter
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 500 : 30, // much higher limit in development
  message: {
    error: 'Too many search requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many search requests from this IP, please try again later.', 429));
  }
});

// API endpoint limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 1000 : 60, // much higher limit in development
  message: {
    error: 'Too many API requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many API requests from this IP, please try again later.', 429));
  }
});

// Create account limiter (stricter than registration)
const createAccountLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each IP to 3 account creations per day
  message: {
    error: 'Too many account creation attempts from this IP, please try again later.',
    retryAfter: '24 hours'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many account creation attempts from this IP, please try again later.', 429));
  }
});

// Dynamic rate limiter based on user authentication status
const dynamicLimiter = (authenticatedMax = 200, unauthenticatedMax = 50) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
      // Check if user is authenticated
      if (req.user) {
        return authenticatedMax;
      }
      return unauthenticatedMax;
    },
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      const message = req.user
        ? 'Too many requests from your account, please try again later.'
        : 'Too many requests from this IP, please try again later.';
      next(new AppError(message, 429));
    }
  });
};

// Progressive rate limiter (increases with repeated violations)
const progressiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    // Log the violation for monitoring (moved from deprecated onLimitReached)
    console.log(`Rate limit reached for IP: ${req.ip} at ${new Date().toISOString()}`);
    next(new AppError('Too many requests from this IP, please try again later.', 429));
  }
});

// Custom key generator for rate limiting based on user ID instead of IP
const createUserBasedLimiter = (windowMs, maxRequests) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user ? req.user._id.toString() : req.ip;
    },
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(windowMs / (1000 * 60)) + ' minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      const message = req.user
        ? 'Too many requests from your account, please try again later.'
        : 'Too many requests from this IP, please try again later.';
      next(new AppError(message, 429));
    }
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  registrationLimiter,
  loginLimiter,
  uploadLimiter,
  searchLimiter,
  apiLimiter,
  createAccountLimiter,
  dynamicLimiter,
  progressiveLimiter,
  createUserBasedLimiter,
};