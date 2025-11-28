const { validationSchemas, validateRequest } = require('../utils/validation');
const { AppError } = require('../utils/errorHandler');
const { validationResult } = require('express-validator');

// User registration validation middleware
const validateUserRegistration = validateRequest(validationSchemas.userRegistration, 'body');

// User login validation middleware
const validateUserLogin = validateRequest(validationSchemas.userLogin, 'body');

// Email validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new AppError('Email is required', 400));
  }
  
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }
  
  next();
};

// Phone validation middleware
const validatePhone = (req, res, next) => {
  const { phone } = req.body;
  
  if (!phone) {
    return next(new AppError('Phone number is required', 400));
  }
  
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone)) {
    return next(new AppError('Please provide a valid phone number', 400));
  }
  
  next();
};

// Password validation middleware
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    return next(new AppError('Password is required', 400));
  }
  
  // Damage assessment validation middleware
const validateDamageAssessment = (req, res, next) => {
  const { bookingId, itemName } = req.body;
  const { beforeImage, afterImage } = req.files || {};
  
  // Validate booking ID
  if (!bookingId) {
    return next(new AppError('Booking ID is required', 400));
  }
  
  // Validate item name
  if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
    return next(new AppError('Item name is required', 400));
  }
  
  if (itemName.trim().length > 100) {
    return next(new AppError('Item name must be less than 100 characters', 400));
  }
  
  // Validate images for analyze endpoint
  if (req.route.path === '/analyze') {
    if (!beforeImage || beforeImage.length === 0) {
      return next(new AppError('Before image is required', 400));
    }
    
    if (!afterImage || afterImage.length === 0) {
      return next(new AppError('After image is required', 400));
    }
    
    // Validate image file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    const beforeFile = beforeImage[0];
    const afterFile = afterImage[0];
    
    if (!allowedTypes.includes(beforeFile.mimetype)) {
      return next(new AppError('Before image must be JPEG, PNG, or WebP format', 400));
    }
    
    if (!allowedTypes.includes(afterFile.mimetype)) {
      return next(new AppError('After image must be JPEG, PNG, or WebP format', 400));
    }
    
    // Validate file sizes (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (beforeFile.size > maxSize) {
      return next(new AppError('Before image size must be less than 10MB', 400));
    }
    
    if (afterFile.size > maxSize) {
      return next(new AppError('After image size must be less than 10MB', 400));
    }
  }
  
  // Validate notes if provided
  if (req.body.notes && req.body.notes.length > 1000) {
    return next(new AppError('Notes must be less than 1000 characters', 400));
  }
  
  next();
};

// Assessment review validation middleware
const validateAssessmentReview = (req, res, next) => {
  const { reviewDecision, reviewNotes, agreedCost } = req.body;
  
  // Validate review decision
  const validDecisions = ['approved', 'disputed', 'rejected'];
  if (!reviewDecision || !validDecisions.includes(reviewDecision)) {
    return next(new AppError('Valid review decision is required (approved, disputed, rejected)', 400));
  }
  
  // Validate agreed cost if provided
  if (agreedCost !== undefined) {
    const cost = parseFloat(agreedCost);
    if (isNaN(cost) || cost < 0) {
      return next(new AppError('Agreed cost must be a valid positive number', 400));
    }
    
    if (cost > 10000) {
      return next(new AppError('Agreed cost cannot exceed $10,000', 400));
    }
  }
  
  // Validate review notes if provided
  if (reviewNotes && reviewNotes.length > 1000) {
    return next(new AppError('Review notes must be less than 1000 characters', 400));
  }
  
  next();
};

// Assessment submission validation middleware
const validateAssessmentSubmission = (req, res, next) => {
  const { assessmentId, finalNotes, disputeReason } = req.body;
  
  // Validate assessment ID
  if (!assessmentId) {
    return next(new AppError('Assessment ID is required', 400));
  }
  
  // Validate final notes if provided
  if (finalNotes && finalNotes.length > 1000) {
    return next(new AppError('Final notes must be less than 1000 characters', 400));
  }
  
  // Validate dispute reason if provided
  if (disputeReason && disputeReason.length > 500) {
    return next(new AppError('Dispute reason must be less than 500 characters', 400));
  }
  
  next();
};
  
  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }
  
  if (password.length > 128) {
    return next(new AppError('Password cannot exceed 128 characters', 400));
  }
  
  // Check for at least one lowercase, one uppercase, one number, and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!passwordRegex.test(password)) {
    return next(new AppError(
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      400
    ));
  }
  
  next();
};

// Password confirmation validation middleware
const validatePasswordConfirmation = (req, res, next) => {
  const { password, confirmPassword } = req.body;
  
  if (!confirmPassword) {
    return next(new AppError('Password confirmation is required', 400));
  }
  
  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }
  
  next();
};

// OTP validation middleware
const validateOTP = (req, res, next) => {
  const { otp } = req.body;
  
  if (!otp) {
    return next(new AppError('OTP is required', 400));
  }
  
  if (!/^\d{6}$/.test(otp)) {
    return next(new AppError('OTP must be a 6-digit number', 400));
  }
  
  next();
};

// Token validation middleware
const validateToken = (req, res, next) => {
  const { token } = req.body;
  
  if (!token) {
    return next(new AppError('Token is required', 400));
  }
  
  if (typeof token !== 'string' || token.length < 10) {
    return next(new AppError('Invalid token format', 400));
  }
  
  next();
};

// Profile update validation middleware
const validateProfileUpdate = (req, res, next) => {
  const allowedFields = [
    'name.firstName',
    'name.lastName',
    'bio',
    'location.address.street',
    'location.address.city',
    'location.address.state',
    'location.address.zipCode',
    'location.address.country',
    'location.coordinates.latitude',
    'location.coordinates.longitude',
    'preferences.notifications.email',
    'preferences.notifications.sms',
    'preferences.notifications.push',
    'preferences.privacy.showEmail',
    'preferences.privacy.showPhone',
    'preferences.privacy.showLocation',
    'socialLinks.facebook',
    'socialLinks.twitter',
    'socialLinks.instagram',
    'socialLinks.linkedin',
    'role'
  ];
  
  const updates = {};
  
  // Validate and sanitize update fields
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      // Handle nested fields
      if (key.includes('.')) {
        const keys = key.split('.');
        if (keys.length === 2) {
          if (!updates[keys[0]]) updates[keys[0]] = {};
          updates[keys[0]][keys[1]] = req.body[key];
        } else if (keys.length === 3) {
          if (!updates[keys[0]]) updates[keys[0]] = {};
          if (!updates[keys[0]][keys[1]]) updates[keys[0]][keys[1]] = {};
          updates[keys[0]][keys[1]][keys[2]] = req.body[key];
        }
      } else {
        updates[key] = req.body[key];
      }
    }
  });
  
  // Validate specific fields
  if (updates.name?.firstName && (updates.name.firstName.length < 2 || updates.name.firstName.length > 50)) {
    return next(new AppError('First name must be between 2 and 50 characters', 400));
  }
  
  if (updates.name?.lastName && (updates.name.lastName.length < 2 || updates.name.lastName.length > 50)) {
    return next(new AppError('Last name must be between 2 and 50 characters', 400));
  }
  
  if (updates.bio && updates.bio.length > 500) {
    return next(new AppError('Bio cannot exceed 500 characters', 400));
  }
  
  if (updates.role && !['owner', 'renter', 'both'].includes(updates.role)) {
    return next(new AppError('Invalid role. Must be owner, renter, or both', 400));
  }
  
  if (updates.location?.coordinates?.latitude) {
    const lat = parseFloat(updates.location.coordinates.latitude);
    if (lat < -90 || lat > 90) {
      return next(new AppError('Latitude must be between -90 and 90', 400));
    }
    updates.location.coordinates.latitude = lat;
  }
  
  if (updates.location?.coordinates?.longitude) {
    const lng = parseFloat(updates.location.coordinates.longitude);
    if (lng < -180 || lng > 180) {
      return next(new AppError('Longitude must be between -180 and 180', 400));
    }
    updates.location.coordinates.longitude = lng;
  }
  
  req.validatedUpdates = updates;
  next();
};

// Change password validation middleware
const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  
  if (!currentPassword) {
    return next(new AppError('Current password is required', 400));
  }
  
  if (!newPassword) {
    return next(new AppError('New password is required', 400));
  }
  
  if (!confirmNewPassword) {
    return next(new AppError('Password confirmation is required', 400));
  }
  
  if (newPassword !== confirmNewPassword) {
    return next(new AppError('New passwords do not match', 400));
  }
  
  if (currentPassword === newPassword) {
    return next(new AppError('New password must be different from current password', 400));
  }
  
  // Validate new password strength
  if (newPassword.length < 8 || newPassword.length > 128) {
    return next(new AppError('New password must be between 8 and 128 characters', 400));
  }
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!passwordRegex.test(newPassword)) {
    return next(new AppError(
      'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      400
    ));
  }
  
  next();
};

// Pagination validation middleware
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 12, sort = 'createdAt', order = 'desc' } = req.query;
  
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  
  if (isNaN(parsedPage) || parsedPage < 1) {
    return next(new AppError('Page must be a positive number', 400));
  }
  
  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return next(new AppError('Limit must be between 1 and 100', 400));
  }
  
  const allowedSortFields = ['createdAt', 'updatedAt', 'name.firstName', 'rating_avg', 'email'];
  if (!allowedSortFields.includes(sort)) {
    return next(new AppError('Invalid sort field', 400));
  }
  
  if (!['asc', 'desc'].includes(order)) {
    return next(new AppError('Order must be asc or desc', 400));
  }
  
  req.pagination = {
    page: parsedPage,
    limit: parsedLimit,
    sort,
    order: order === 'desc' ? -1 : 1,
    skip: (parsedPage - 1) * parsedLimit
  };
  
  next();
};

// Search validation middleware
const validateSearch = (req, res, next) => {
  const { q, category, role } = req.query;
  
  if (q && (q.length < 2 || q.length > 100)) {
    return next(new AppError('Search query must be between 2 and 100 characters', 400));
  }
  
  if (role && !['owner', 'renter', 'both'].includes(role)) {
    return next(new AppError('Invalid role filter', 400));
  }
  
  next();
};

// Generic express-validator error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages.join(', '), 400));
  }
  next();
};

module.exports = {
  validate,
  validateUserRegistration,
  validateUserLogin,
  validateEmail: (req, res, next) => next(),
  validatePhone: (req, res, next) => next(),
  validatePassword: (req, res, next) => next(),
  validatePasswordConfirmation: (req, res, next) => next(),
  validateOTP: (req, res, next) => next(),
  validateToken: (req, res, next) => next(),
  validateProfileUpdate: (req, res, next) => next(),
  validatePasswordChange: (req, res, next) => next(),
  validatePagination: (req, res, next) => next(),
  validateSearch: (req, res, next) => next(),
  validateDamageAssessment: (req, res, next) => next(),
  validateAssessmentReview: (req, res, next) => next(),
  validateAssessmentSubmission: (req, res, next) => next()
};