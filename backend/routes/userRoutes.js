const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { profilePhotoUpload, validateUpload, handleMulterError } = require('../middleware/upload');
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware/validation');

const router = express.Router();

/**
 * User Profile Routes
 * All routes are protected and require authentication
 */

// Validation schemas
const updateProfileValidation = [
  body('name.firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim(),
  body('name.lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
    .trim(),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[\+]?[\d\s\-\(\)]{10,20}$/)
    .withMessage('Please provide a valid phone number'),
  body('location.address.city')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .trim(),
  body('location.address.state')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters')
    .trim(),
  body('location.address.zipCode')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[A-Za-z0-9\s\-]{3,10}$/)
    .withMessage('Please provide a valid ZIP/postal code'),
  body('location.coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  validate
];

const searchUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('role')
    .optional()
    .isIn(['owner', 'renter', 'both'])
    .withMessage('Role must be owner, renter, or both'),
  validate
];

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  validate
];

/**
 * @route   GET /api/user/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, userController.getProfile);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, updateProfileValidation, userController.updateProfile);

/**
 * @route   GET /api/user/profile/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/profile/stats', protect, userController.getUserStats);

/**
 * @route   GET /api/user/profile/completion
 * @desc    Get profile completion status
 * @access  Private
 */
router.get('/profile/completion', protect, userController.getProfileCompletion);

/**
 * @route   GET /api/user/profile/:userId
 * @desc    Get public user profile
 * @access  Public (but may require auth in future)
 */
router.get('/profile/:userId', userIdValidation, userController.getPublicProfile);

/**
 * @route   POST /api/user/profile/photo
 * @desc    Upload profile photo
 * @access  Private
 */
router.post(
  '/profile/photo',
  protect,
  profilePhotoUpload,
  handleMulterError,
  validateUpload('profile'),
  userController.uploadProfilePhoto
);

/**
 * @route   DELETE /api/user/profile/photo
 * @desc    Delete profile photo
 * @access  Private
 */
router.delete('/profile/photo', protect, userController.deleteProfilePhoto);

/**
 * @route   PUT /api/user/profile/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put(
  '/profile/preferences',
  protect,
  [
    body('preferences')
      .isObject()
      .withMessage('Preferences must be an object'),
    validate
  ],
  userController.updatePreferences
);

/**
 * @route   GET /api/user/search
 * @desc    Search users (public directory)
 * @access  Public
 */
router.get('/search', searchUsersValidation, userController.searchUsers);

/**
 * @route   GET /api/user/upload-signature
 * @desc    Get Cloudinary upload signature for direct uploads
 * @access  Private
 */
router.get('/upload-signature', protect, userController.getUploadSignature);

/**
 * @route   POST /api/user/image/transform
 * @desc    Get transformed image URL
 * @access  Private
 */
router.post(
  '/image/transform',
  protect,
  [
    body('publicId')
      .notEmpty()
      .withMessage('Public ID is required'),
    body('transformations')
      .optional()
      .isObject()
      .withMessage('Transformations must be an object'),
    validate
  ],
  userController.getImageTransformation
);

module.exports = router;