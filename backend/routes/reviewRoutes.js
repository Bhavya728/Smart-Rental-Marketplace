const express = require('express');
const { body, param, query } = require('express-validator');
const { reviewController, upload } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for review operations
const reviewRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    message: 'Too many review requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const helpfulVoteRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 votes per window
  message: {
    success: false,
    message: 'Too many voting requests. Please try again later.'
  }
});

// Validation middleware
const validateCreateReview = [
  body('property_id')
    .isMongoId()
    .withMessage('Invalid property ID'),
  body('booking_id')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .isString()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .isString()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review content must be between 10 and 2000 characters'),
  body('detailed_ratings')
    .optional()
    .isJSON()
    .withMessage('Detailed ratings must be valid JSON'),
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('Anonymous flag must be boolean')
];

const validateUpdateReview = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID'),
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review content must be between 10 and 2000 characters'),
  body('detailed_ratings')
    .optional()
    .isJSON()
    .withMessage('Detailed ratings must be valid JSON')
];

const validateHostResponse = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID'),
  body('content')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Response content must be between 10 and 1000 characters')
];

const validateModerateReview = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID'),
  body('status')
    .isIn(['approved', 'rejected', 'flagged'])
    .withMessage('Status must be approved, rejected, or flagged'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Public routes (no authentication required)

/**
 * @route GET /api/reviews/property/:propertyId
 * @desc Get reviews for a property
 * @access Public
 */
router.get(
  '/property/:propertyId',
  [
    param('propertyId').isMongoId().withMessage('Invalid property ID'),
    ...validatePagination,
    query('rating')
      .optional()
      .custom(value => {
        if (Array.isArray(value)) {
          return value.every(r => /^[1-5]$/.test(r));
        }
        return /^[1-5]$/.test(value);
      })
      .withMessage('Rating must be between 1 and 5'),
    query('sortBy')
      .optional()
      .isIn(['created_at', 'rating', 'helpful_count', 'review_score'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['-1', '1'])
      .withMessage('Sort order must be -1 or 1'),
    query('withImages')
      .optional()
      .isBoolean()
      .withMessage('withImages must be boolean')
  ],
  reviewController.getPropertyReviews
);

/**
 * @route GET /api/reviews/property/:propertyId/stats
 * @desc Get review statistics for a property
 * @access Public
 */
router.get(
  '/property/:propertyId/stats',
  [
    param('propertyId').isMongoId().withMessage('Invalid property ID')
  ],
  reviewController.getPropertyReviewStats
);

/**
 * @route GET /api/reviews/trending
 * @desc Get trending reviews
 * @access Public
 */
router.get(
  '/trending',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Limit must be between 1 and 20')
  ],
  reviewController.getTrendingReviews
);

/**
 * @route GET /api/reviews/search
 * @desc Search reviews
 * @access Public
 */
router.get(
  '/search',
  [
    query('q')
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
    ...validatePagination,
    query('propertyId')
      .optional()
      .isMongoId()
      .withMessage('Invalid property ID'),
    query('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    query('sortBy')
      .optional()
      .isIn(['relevance', 'rating', 'helpful', 'created_at'])
      .withMessage('Invalid sort field')
  ],
  reviewController.searchReviews
);

// Protected routes (authentication required)

/**
 * @route POST /api/reviews
 * @desc Create a new review
 * @access Private
 */
router.post(
  '/',
  protect,
  reviewRateLimit,
  upload.array('images', 5), // Allow up to 5 images
  validateCreateReview,
  reviewController.createReview
);

/**
 * @route GET /api/reviews/:reviewId
 * @desc Get review by ID
 * @access Private
 */
router.get(
  '/:reviewId',
  protect,
  [
    param('reviewId').isMongoId().withMessage('Invalid review ID')
  ],
  reviewController.getReviewById
);

/**
 * @route PUT /api/reviews/:reviewId
 * @desc Update a review
 * @access Private (review owner only)
 */
router.put(
  '/:reviewId',
  protect,
  reviewRateLimit,
  validateUpdateReview,
  reviewController.updateReview
);

/**
 * @route DELETE /api/reviews/:reviewId
 * @desc Delete a review
 * @access Private (review owner only)
 */
router.delete(
  '/:reviewId',
  protect,
  reviewRateLimit,
  [
    param('reviewId').isMongoId().withMessage('Invalid review ID')
  ],
  reviewController.deleteReview
);

/**
 * @route POST /api/reviews/:reviewId/vote
 * @desc Vote on review helpfulness
 * @access Private
 */
router.post(
  '/:reviewId/vote',
  protect,
  helpfulVoteRateLimit,
  [
    param('reviewId').isMongoId().withMessage('Invalid review ID'),
    body('vote')
      .isIn(['helpful', 'not_helpful'])
      .withMessage('Vote must be helpful or not_helpful')
  ],
  reviewController.voteHelpful
);

/**
 * @route POST /api/reviews/:reviewId/response
 * @desc Add host response to review
 * @access Private (property owner only)
 */
router.post(
  '/:reviewId/response',
  protect,
  reviewRateLimit,
  validateHostResponse,
  reviewController.addHostResponse
);

/**
 * @route GET /api/reviews/user/:userId
 * @desc Get reviews by user
 * @access Private (own reviews or admin)
 */
router.get(
  '/user/:userId',
  protect,
  [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    ...validatePagination,
    query('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'flagged'])
      .withMessage('Invalid status')
  ],
  reviewController.getUserReviews
);

/**
 * @route GET /api/reviews/property/:propertyId/analytics
 * @desc Get property review analytics
 * @access Private (property owner only)
 */
router.get(
  '/property/:propertyId/analytics',
  protect,
  [
    param('propertyId').isMongoId().withMessage('Invalid property ID')
  ],
  reviewController.getPropertyReviewAnalytics
);

// Admin-only routes

/**
 * @route GET /api/reviews/admin/pending
 * @desc Get pending reviews for moderation
 * @access Admin
 */
router.get(
  '/admin/pending',
  protect,
  restrictTo('admin'),
  [
    ...validatePagination,
    query('sortBy')
      .optional()
      .isIn(['created_at', 'rating', 'review_score'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['-1', '1'])
      .withMessage('Sort order must be -1 or 1')
  ],
  reviewController.getPendingReviews
);

/**
 * @route PUT /api/reviews/:reviewId/moderate
 * @desc Moderate a review (approve, reject, flag)
 * @access Admin
 */
router.put(
  '/:reviewId/moderate',
  protect,
  restrictTo('admin'),
  validateModerateReview,
  reviewController.moderateReview
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 images allowed.'
      });
    }
  }

  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router;
