/**
 * Listing Routes
 * Defines all API endpoints for listing operations
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect: auth } = require('../middleware/auth');
const { listingPhotosUpload } = require('../middleware/upload');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');

// Debug: Check if middleware is properly imported
console.log('Debug - Middleware:', {
  auth: typeof auth,
  validate: typeof validate,
  listingPhotosUpload: typeof listingPhotosUpload
});

// Controllers
const {
  createListing,
  getListingById,
  updateListing,
  deleteListing,
  getUserListings,
  searchListings,
  getAllListings,
  getFeaturedListings,
  uploadListingImages,
  deleteListingImage,
  setPrimaryImage,
  publishListing,
  getListingStats,
  getListingsByCategory,
  getNearbyListings
} = require('../controllers/listingController');

// Debug: Check if all functions are properly imported
console.log('Debug - Controller functions:', {
  createListing: typeof createListing,
  getListingById: typeof getListingById,
  getAllListings: typeof getAllListings,
  searchListings: typeof searchListings,
  getFeaturedListings: typeof getFeaturedListings,
  validate: typeof validate
});

// Validation schemas
const createListingValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Title must be between 10 and 100 characters')
    .trim(),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters')
    .trim(),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      // Property & Spaces
      'apartment', 'house', 'condo', 'studio', 'room', 'office', 'warehouse', 
      'commercial', 'land', 'parking', 'storage', 'event-space', 'coworking',
      
      // Electronics & Technology
      'laptop', 'desktop', 'tablet', 'smartphone', 'camera', 'audio-equipment',
      'gaming-console', 'tv-monitor', 'projector', 'drone', 'vr-headset', 'smart-device',
      
      // Furniture & Home
      'sofa', 'chair', 'table', 'bed', 'wardrobe', 'appliance', 'home-decor',
      'lighting', 'kitchen-equipment', 'cleaning-equipment',
      
      // Vehicles & Transportation  
      'car', 'motorcycle', 'bicycle', 'scooter', 'boat', 'rv-camper', 'truck', 'trailer', 'parking-spot',
      
      // Sports & Recreation
      'fitness-equipment', 'sports-gear', 'outdoor-gear', 'camping-equipment',
      'water-sports', 'winter-sports', 'musical-instrument', 'hobby-equipment',
      
      // Tools & Equipment
      'construction-tools', 'garden-tools', 'power-tools', 'machinery', 
      'professional-equipment', 'safety-equipment',
      
      // Fashion & Accessories
      'clothing', 'shoes', 'jewelry', 'bags', 'watches', 'formal-wear',
      
      // Events & Services
      'party-supplies', 'wedding-equipment', 'catering-equipment', 'decoration', 'entertainment',
      
      // Books & Education
      'books', 'textbooks', 'educational-materials', 'art-supplies',
      
      // Baby & Kids
      'baby-gear', 'toys', 'kids-furniture', 'stroller', 'car-seat',
      
      // Health & Beauty
      'medical-equipment', 'beauty-equipment', 'wellness-products',
      
      // Other
      'other'
    ])
    .withMessage('Invalid category'),
  
  body('dailyRate')
    .notEmpty()
    .withMessage('Daily rate is required')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Daily rate must be between $1 and $10,000'),
  
  body('weeklyRate')
    .optional()
    .isFloat({ min: 1, max: 50000 })
    .withMessage('Weekly rate must be between $1 and $50,000'),
  
  body('monthlyRate')
    .optional()
    .isFloat({ min: 1, max: 200000 })
    .withMessage('Monthly rate must be between $1 and $200,000'),
  
  // Location validation
  body('location.address.street')
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters')
    .trim(),
  
  body('location.address.city')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters')
    .trim(),
  
  body('location.address.state')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters')
    .trim(),
  
  body('location.address.zipCode')
    .notEmpty()
    .withMessage('ZIP code is required')
    .matches(/^[A-Za-z0-9\s\-]{3,10}$/)
    .withMessage('Invalid ZIP code format')
    .trim(),
  
  body('location.address.country')
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters')
    .trim(),
  
  body('location.coordinates.lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('location.coordinates.lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  // Optional fields validation
  body('details.bedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Bedrooms must be between 0 and 20'),
  
  body('details.bathrooms')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Bathrooms must be between 0 and 20'),
  
  body('details.area')
    .optional()
    .isFloat({ min: 1, max: 50000 })
    .withMessage('Area must be between 1 and 50,000 sq ft'),
  
  body('details.maxOccupancy')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Max occupancy must be between 1 and 50'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('amenities.*')
    .optional()
    .isIn(['wifi', 'parking', 'kitchen', 'laundry', 'ac', 'heating', 'pool', 'gym', 'balcony', 'garden', 'pet-friendly', 'smoking-allowed', 'wheelchair-accessible', 'security', 'elevator', 'storage', 'furnished', 'utilities-included'])
    .withMessage('Invalid amenity')
];

const updateListingValidation = [
  body('title')
    .optional()
    .isLength({ min: 10, max: 100 })
    .withMessage('Title must be between 10 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters')
    .trim(),
  
  body('category')
    .optional()
    .isIn([
      // Property & Spaces
      'apartment', 'house', 'condo', 'studio', 'room', 'office', 'warehouse', 
      'commercial', 'land', 'parking', 'storage', 'event-space', 'coworking',
      
      // Electronics & Technology
      'laptop', 'desktop', 'tablet', 'smartphone', 'camera', 'audio-equipment',
      'gaming-console', 'tv-monitor', 'projector', 'drone', 'vr-headset', 'smart-device',
      
      // Furniture & Home
      'sofa', 'chair', 'table', 'bed', 'wardrobe', 'appliance', 'home-decor',
      'lighting', 'kitchen-equipment', 'cleaning-equipment',
      
      // Vehicles & Transportation  
      'car', 'motorcycle', 'bicycle', 'scooter', 'boat', 'rv-camper', 'truck', 'trailer', 'parking-spot',
      
      // Sports & Recreation
      'fitness-equipment', 'sports-gear', 'outdoor-gear', 'camping-equipment',
      'water-sports', 'winter-sports', 'musical-instrument', 'hobby-equipment',
      
      // Tools & Equipment
      'construction-tools', 'garden-tools', 'power-tools', 'machinery', 
      'professional-equipment', 'safety-equipment',
      
      // Fashion & Accessories
      'clothing', 'shoes', 'jewelry', 'bags', 'watches', 'formal-wear',
      
      // Events & Services
      'party-supplies', 'wedding-equipment', 'catering-equipment', 'decoration', 'entertainment',
      
      // Books & Education
      'books', 'textbooks', 'educational-materials', 'art-supplies',
      
      // Baby & Kids
      'baby-gear', 'toys', 'kids-furniture', 'stroller', 'car-seat',
      
      // Health & Beauty
      'medical-equipment', 'beauty-equipment', 'wellness-products',
      
      // Other
      'other'
    ])
    .withMessage('Invalid category'),
  
  body('dailyRate')
    .optional()
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Daily rate must be between $1 and $10,000'),
  
  body('weeklyRate')
    .optional()
    .isFloat({ min: 1, max: 50000 })
    .withMessage('Weekly rate must be between $1 and $50,000'),
  
  body('monthlyRate')
    .optional()
    .isFloat({ min: 1, max: 200000 })
    .withMessage('Monthly rate must be between $1 and $200,000'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'inactive', 'deleted'])
    .withMessage('Invalid status')
];

const searchValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be non-negative'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be non-negative'),
  
  query('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be non-negative'),
  
  query('bathrooms')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bathrooms must be non-negative'),
  
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  query('radius')
    .optional()
    .isInt({ min: 1, max: 50000 })
    .withMessage('Radius must be between 1 and 50,000 meters'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'dailyRate', 'rating', 'views'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid listing ID')
];

const categoryValidation = [
  param('category')
    .isIn([
      // Property & Spaces
      'apartment', 'house', 'condo', 'studio', 'room', 'office', 'warehouse', 
      'commercial', 'land', 'parking', 'storage', 'event-space', 'coworking',
      
      // Electronics & Technology
      'laptop', 'desktop', 'tablet', 'smartphone', 'camera', 'audio-equipment',
      'gaming-console', 'tv-monitor', 'projector', 'drone', 'vr-headset', 'smart-device',
      
      // Furniture & Home
      'sofa', 'chair', 'table', 'bed', 'wardrobe', 'appliance', 'home-decor',
      'lighting', 'kitchen-equipment', 'cleaning-equipment',
      
      // Vehicles & Transportation  
      'car', 'motorcycle', 'bicycle', 'scooter', 'boat', 'rv-camper', 'truck', 'trailer', 'parking-spot',
      
      // Sports & Recreation
      'fitness-equipment', 'sports-gear', 'outdoor-gear', 'camping-equipment',
      'water-sports', 'winter-sports', 'musical-instrument', 'hobby-equipment',
      
      // Tools & Equipment
      'construction-tools', 'garden-tools', 'power-tools', 'machinery', 
      'professional-equipment', 'safety-equipment',
      
      // Fashion & Accessories
      'clothing', 'shoes', 'jewelry', 'bags', 'watches', 'formal-wear',
      
      // Events & Services
      'party-supplies', 'wedding-equipment', 'catering-equipment', 'decoration', 'entertainment',
      
      // Books & Education
      'books', 'textbooks', 'educational-materials', 'art-supplies',
      
      // Baby & Kids
      'baby-gear', 'toys', 'kids-furniture', 'stroller', 'car-seat',
      
      // Health & Beauty
      'medical-equipment', 'beauty-equipment', 'wellness-products',
      
      // Other
      'other'
    ])
    .withMessage('Invalid category')
];

// Routes

// Public routes (no authentication required)
router.get('/', searchValidation, validate, getAllListings);
router.get('/search', searchValidation, validate, searchListings);
router.get('/featured', getFeaturedListings);
router.get('/category/:category', categoryValidation, validate, getListingsByCategory);
router.get('/nearby', searchValidation, validate, getNearbyListings);
router.get('/:id', idValidation, validate, getListingById);

// Protected routes (authentication required)
router.use(auth); // Apply authentication middleware to all routes below

// User's listings
router.get('/user/me', getUserListings);
router.get('/user/stats', getListingStats);

// CRUD operations
router.post('/', createListingValidation, validate, createListing);
router.put('/:id', idValidation, updateListingValidation, validate, updateListing);
router.delete('/:id', idValidation, validate, deleteListing);

// Listing management
router.put('/:id/publish', idValidation, validate, publishListing);

// Image management
router.post('/:id/images', 
  idValidation, 
  validate,
  listingPhotosUpload, // Upload up to 10 images
  uploadListingImages
);

router.delete('/:id/images/:publicId', 
  idValidation,
  param('publicId').notEmpty().withMessage('Public ID is required'),
  validate,
  deleteListingImage
);

router.put('/:id/images/:publicId/primary',
  idValidation,
  param('publicId').notEmpty().withMessage('Public ID is required'),
  validate,
  setPrimaryImage
);

module.exports = router;