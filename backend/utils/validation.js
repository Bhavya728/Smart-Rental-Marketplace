const Joi = require('joi');
const APP_CONSTANTS = require('../config/constants');

// Common validation schemas
const validationSchemas = {
  // User registration validation
  userRegistration: Joi.object({
    firstName: Joi.string()
      .min(APP_CONSTANTS.VALIDATION.MIN_NAME_LENGTH)
      .max(APP_CONSTANTS.VALIDATION.MAX_NAME_LENGTH)
      .required()
      .messages({
        'string.min': `First name must be at least ${APP_CONSTANTS.VALIDATION.MIN_NAME_LENGTH} characters`,
        'string.max': `First name cannot exceed ${APP_CONSTANTS.VALIDATION.MAX_NAME_LENGTH} characters`,
        'any.required': 'First name is required',
      }),
    
    lastName: Joi.string()
      .min(APP_CONSTANTS.VALIDATION.MIN_NAME_LENGTH)
      .max(APP_CONSTANTS.VALIDATION.MAX_NAME_LENGTH)
      .required()
      .messages({
        'string.min': `Last name must be at least ${APP_CONSTANTS.VALIDATION.MIN_NAME_LENGTH} characters`,
        'string.max': `Last name cannot exceed ${APP_CONSTANTS.VALIDATION.MAX_NAME_LENGTH} characters`,
        'any.required': 'Last name is required',
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    

    
    role: Joi.string()
      .valid('owner', 'renter', 'both')
      .default('both'),
    
    password: Joi.string()
      .min(APP_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH)
      .max(APP_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': `Password must be at least ${APP_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters`,
        'string.max': `Password cannot exceed ${APP_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH} characters`,
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
  }),

  // User login validation
  userLogin: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  // Listing creation validation
  listingCreation: Joi.object({
    title: Joi.string()
      .min(5)
      .max(APP_CONSTANTS.VALIDATION.MAX_TITLE_LENGTH)
      .required()
      .messages({
        'string.min': 'Title must be at least 5 characters',
        'string.max': `Title cannot exceed ${APP_CONSTANTS.VALIDATION.MAX_TITLE_LENGTH} characters`,
        'any.required': 'Title is required',
      }),
    
    description: Joi.string()
      .min(20)
      .max(APP_CONSTANTS.VALIDATION.MAX_DESCRIPTION_LENGTH)
      .required()
      .messages({
        'string.min': 'Description must be at least 20 characters',
        'string.max': `Description cannot exceed ${APP_CONSTANTS.VALIDATION.MAX_DESCRIPTION_LENGTH} characters`,
        'any.required': 'Description is required',
      }),
    
    category: Joi.string()
      .valid(...APP_CONSTANTS.LISTING_CATEGORIES)
      .required()
      .messages({
        'any.only': 'Please select a valid category',
        'any.required': 'Category is required',
      }),
    
    pricePerDay: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.positive': 'Price must be a positive number',
        'any.required': 'Daily price is required',
      }),
    
    location: Joi.object({
      address: Joi.string().required().messages({
        'any.required': 'Address is required',
      }),
      city: Joi.string().required().messages({
        'any.required': 'City is required',
      }),
      state: Joi.string().required().messages({
        'any.required': 'State is required',
      }),
      zipCode: Joi.string().required().messages({
        'any.required': 'ZIP code is required',
      }),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
      }),
    }).required(),
  }),

  // Search query validation
  searchQuery: Joi.object({
    q: Joi.string()
      .min(APP_CONSTANTS.SEARCH.MIN_QUERY_LENGTH)
      .max(APP_CONSTANTS.SEARCH.MAX_QUERY_LENGTH)
      .allow('')
      .messages({
        'string.min': `Search query must be at least ${APP_CONSTANTS.SEARCH.MIN_QUERY_LENGTH} characters`,
        'string.max': `Search query cannot exceed ${APP_CONSTANTS.SEARCH.MAX_QUERY_LENGTH} characters`,
      }),
    
    category: Joi.string()
      .valid(...APP_CONSTANTS.LISTING_CATEGORIES)
      .allow(''),
    
    minPrice: Joi.number().positive().allow(0),
    maxPrice: Joi.number().positive(),
    
    page: Joi.number().integer().min(1).default(APP_CONSTANTS.PAGINATION.DEFAULT_PAGE),
    limit: Joi.number().integer().min(1).max(APP_CONSTANTS.PAGINATION.MAX_LIMIT).default(APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT),
    
    sortBy: Joi.string().valid('price', 'createdAt', 'rating', 'title').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

// Validation middleware factory
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    req[property] = value;
    next();
  };
};

// Sanitize input to prevent XSS
const sanitizeInput = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Basic XSS prevention - remove potentially dangerous characters
        sanitized[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>?/gm, '')
          .trim();
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeInput(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }
  return sanitized;
};

module.exports = {
  validationSchemas,
  validateRequest,
  sanitizeInput,
};