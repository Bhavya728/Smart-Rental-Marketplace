// Application constants
const APP_CONSTANTS = {
  // Server configuration
  DEFAULT_PORT: 5000,
  API_VERSION: 'v1',
  
  // Authentication
  JWT_EXPIRE_TIME: '30d',
  REFRESH_TOKEN_EXPIRE: '7d',
  BCRYPT_SALT_ROUNDS: 12,
  
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    AUTH_MAX_REQUESTS: 5, // For auth routes
  },
  
  // File upload limits
  FILE_LIMITS: {
    PROFILE_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    LISTING_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_LISTING_IMAGES: 10,
  },
  
  // User roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
  },
  
  // Listing status
  LISTING_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    REJECTED: 'rejected',
    DELETED: 'deleted',
  },
  
  // Booking status
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },
  
  // Payment status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
  
  // Categories
  LISTING_CATEGORIES: [
    'electronics',
    'furniture',
    'vehicles',
    'tools',
    'books',
    'sports',
    'clothing',
    'home-appliances',
    'musical-instruments',
    'other'
  ],
  
  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 50,
    DEFAULT_PAGE: 1,
  },
  
  // Search
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
  },
  
  // Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_TITLE_LENGTH: 100,
  },
  
  // Error messages
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid credentials provided',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Not authorized to access this resource',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error',
    RESOURCE_NOT_FOUND: 'Resource not found',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    USER_REGISTERED: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    LISTING_CREATED: 'Listing created successfully',
    BOOKING_CREATED: 'Booking created successfully',
  },
};

module.exports = APP_CONSTANTS;