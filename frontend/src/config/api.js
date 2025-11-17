// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// API endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    verifyEmail: '/auth/verify-email',
    sendVerification: '/auth/send-verification',
    sendVerificationCode: '/auth/send-verification-code',
    verifyEmailCode: '/auth/verify-email-code',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    refreshToken: '/auth/refresh-token',
    me: '/auth/me',
    check: '/auth/check',
  },
  
  // User endpoints
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    uploadPhoto: '/users/upload-photo',
    changePassword: '/users/change-password',
    deleteAccount: '/users/delete-account',
  },
  
  // Listing endpoints
  listings: {
    create: '/listings',
    getAll: '/listings',
    getById: (id) => `/listings/${id}`,
    update: (id) => `/listings/${id}`,
    delete: (id) => `/listings/${id}`,
    myListings: '/listings/my-listings',
    uploadImages: '/listings/upload-images',
    search: '/listings/search',
    categories: '/listings/categories',
    featured: '/listings/featured',
  },
  
  // Booking endpoints
  bookings: {
    create: '/bookings',
    getAll: '/bookings',
    getById: (id) => `/bookings/${id}`,
    update: (id) => `/bookings/${id}`,
    cancel: (id) => `/bookings/${id}/cancel`,
    myBookings: '/bookings/my-bookings',
    checkAvailability: '/bookings/check-availability',
  },
  
  // Payment endpoints
  payment: {
    createIntent: '/payments/create-intent',
    confirm: '/payments/confirm',
    refund: '/payments/refund',
    history: '/payments/history',
  },
  
  // Review endpoints
  reviews: {
    create: '/reviews',
    getAll: '/reviews',
    getById: (id) => `/reviews/${id}`,
    update: (id) => `/reviews/${id}`,
    delete: (id) => `/reviews/${id}`,
    getByListing: (listingId) => `/reviews/listing/${listingId}`,
    getByUser: (userId) => `/reviews/user/${userId}`,
  },
  
  // Message endpoints
  messages: {
    conversations: '/messages/conversations',
    getConversation: (id) => `/messages/conversations/${id}`,
    sendMessage: '/messages/send',
    markAsRead: (id) => `/messages/${id}/read`,
  },
  
  // Search endpoints
  search: {
    listings: '/search/listings',
    users: '/search/users',
    suggestions: '/search/suggestions',
  },
  
  // Admin endpoints
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    listings: '/admin/listings',
    bookings: '/admin/bookings',
    analytics: '/admin/analytics',
    auditLogs: '/admin/audit-logs',
  },
  
  // Utility endpoints
  utils: {
    health: '/health',
    geocode: '/utils/geocode',
    uploadFile: '/utils/upload',
    deleteFile: '/utils/delete-file',
  },
}

// Request configuration
export const REQUEST_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
}

// File upload configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxImages: 10,
  imageQuality: 0.8,
}

// API response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a valid file.',
  RATE_LIMITED: 'Too many requests. Please wait before trying again.',
}

export { API_BASE_URL }