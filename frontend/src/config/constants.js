// Application constants and configuration

// App metadata
export const APP_INFO = {
  name: 'Smart Rental Marketplace',
  description: 'Rent anything, anywhere, anytime',
  version: '1.0.0',
  author: 'Smart Rental Team',
}

// Environment
export const ENVIRONMENT = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  isTest: import.meta.env.MODE === 'test',
}

// Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // Authentication
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  
  // User
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  SETTINGS: '/settings',
  
  // Listings
  LISTINGS: '/listings',
  LISTING_DETAIL: '/listings/:id',
  CREATE_LISTING: '/listings/create',
  EDIT_LISTING: '/listings/:id/edit',
  MY_LISTINGS: '/my-listings',
  
  // Search
  SEARCH: '/search',
  CATEGORY: '/category/:category',
  
  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings/:id',
  CHECKOUT: '/checkout',
  BOOKING_CONFIRMATION: '/booking-confirmation',
  
  // Messages
  MESSAGES: '/messages',
  CONVERSATION: '/messages/:id',
  
  // Reviews
  LEAVE_REVIEW: '/review/:bookingId',
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_LISTINGS: '/admin/listings',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_ANALYTICS: '/admin/analytics',
  
  // Legal
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
}

// User roles and permissions
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
}

export const PERMISSIONS = {
  CREATE_LISTING: ['user', 'admin', 'moderator'],
  EDIT_LISTING: ['user', 'admin', 'moderator'],
  DELETE_LISTING: ['user', 'admin', 'moderator'],
  MODERATE_CONTENT: ['admin', 'moderator'],
  MANAGE_USERS: ['admin'],
  VIEW_ANALYTICS: ['admin', 'moderator'],
}

// Listing categories
export const LISTING_CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'furniture', name: 'Furniture', icon: '🪑' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'tools', name: 'Tools', icon: '🔧' },
  { id: 'books', name: 'Books', icon: '📚' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'home-appliances', name: 'Home Appliances', icon: '🏠' },
  { id: 'musical-instruments', name: 'Musical Instruments', icon: '🎸' },
  { id: 'other', name: 'Other', icon: '📦' },
]

// Listing status
export const LISTING_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  REJECTED: 'rejected',
  DELETED: 'deleted',
}

// Booking status
export const BOOKING_STATUS = {
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

// Validation rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 2000,
  },
  PRICE: {
    MIN: 0.01,
    MAX: 10000,
  },
}

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
  DEFAULT_PAGE: 1,
}

// Search configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
  MAX_SUGGESTIONS: 5,
}

// Date and time formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  RELATIVE: 'relative',
}

// File upload limits
export const FILE_LIMITS = {
  PROFILE_IMAGE: 5 * 1024 * 1024, // 5MB
  LISTING_IMAGE: 10 * 1024 * 1024, // 10MB
  MAX_LISTING_IMAGES: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
}

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
}

// Breakpoints (matches Tailwind CSS)
export const BREAKPOINTS = {
  XS: 475,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  SEARCH_HISTORY: 'search_history',
  THEME: 'theme',
  LANGUAGE: 'language',
}

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_MAP_VIEW: true,
  ENABLE_CHAT: true,
  ENABLE_REVIEWS: true,
  ENABLE_PAYMENT: true,
  ENABLE_PUSH_NOTIFICATIONS: false,
  ENABLE_ANALYTICS: true,
}

// Social media links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/smartrental',
  TWITTER: 'https://twitter.com/smartrental',
  INSTAGRAM: 'https://instagram.com/smartrental',
  LINKEDIN: 'https://linkedin.com/company/smartrental',
}

// Contact information
export const CONTACT_INFO = {
  EMAIL: 'contact@smartrental.com',
  PHONE: '+1 (555) 123-4567',
  ADDRESS: '123 Main St, City, State 12345',
  SUPPORT_EMAIL: 'support@smartrental.com',
}

// Error retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BACKOFF_MULTIPLIER: 2,
}

// Toast notification configuration
export const TOAST_CONFIG = {
  POSITION: 'top-right',
  DURATION: 4000,
  MAX_TOASTS: 3,
}

// Map configuration (for future map features)
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 }, // New York City
  DEFAULT_ZOOM: 10,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
}

// Rating system
export const RATING = {
  MIN: 1,
  MAX: 5,
  PRECISION: 0.5,
}

// Currency configuration
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  LOCALE: 'en-US',
}

export default {
  APP_INFO,
  ENVIRONMENT,
  ROUTES,
  USER_ROLES,
  PERMISSIONS,
  LISTING_CATEGORIES,
  LISTING_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  VALIDATION_RULES,
  PAGINATION,
  SEARCH_CONFIG,
  DATE_FORMATS,
  FILE_LIMITS,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
  STORAGE_KEYS,
  FEATURE_FLAGS,
  SOCIAL_LINKS,
  CONTACT_INFO,
  RETRY_CONFIG,
  TOAST_CONFIG,
  MAP_CONFIG,
  RATING,
  CURRENCY,
}