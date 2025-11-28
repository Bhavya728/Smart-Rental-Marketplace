const express = require('express');
const { body, param, query } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { protect: authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const createBookingValidation = [
  body('listing_id')
    .isMongoId()
    .withMessage('Valid listing ID is required'),
  body('start_date')
    .isISO8601()
    .withMessage('Valid start date is required')
    .custom((value, { req }) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('end_date')
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.start_date);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('guest_count')
    .isInt({ min: 1, max: 20 })
    .withMessage('Guest count must be between 1 and 20'),
  body('special_requests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters')
];

const bookingIdValidation = [
  param('bookingId').isMongoId().withMessage('Valid booking ID is required')
];

const listingIdValidation = [
  param('listingId').isMongoId().withMessage('Valid listing ID is required')
];

const availabilityValidation = [
  param('listingId').isMongoId().withMessage('Valid listing ID is required'),
  query('start_date').isISO8601().withMessage('Valid start date is required'),
  query('end_date').isISO8601().withMessage('Valid end date is required')
];

// All routes require authentication
router.use(authMiddleware);

// Create a new booking
router.post(
  '/',
  createBookingValidation,
  bookingController.createBooking
);

// Get user's bookings with filters
router.get(
  '/',
  bookingController.getUserBookings
);

// Get booking statistics
router.get(
  '/stats',
  bookingController.getBookingStats
);

// Check availability for a listing
router.get(
  '/availability/:listingId',
  availabilityValidation,
  bookingController.checkAvailability
);

// Get specific booking by ID
router.get(
  '/:bookingId',
  bookingIdValidation,
  bookingController.getBookingById
);

// Approve a booking request (owner only)
router.patch(
  '/:bookingId/approve',
  bookingIdValidation,
  bookingController.approveBooking
);

// Reject a booking request (owner only)
router.patch(
  '/:bookingId/reject',
  [
    ...bookingIdValidation,
    body('reason')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Rejection reason cannot exceed 200 characters')
  ],
  bookingController.rejectBooking
);

// Confirm a booking after payment (system only)
router.patch(
  '/:bookingId/confirm',
  bookingIdValidation,
  bookingController.confirmBooking
);

// Cancel a booking
router.patch(
  '/:bookingId/cancel',
  [
    ...bookingIdValidation,
    body('reason')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Cancellation reason cannot exceed 200 characters')
  ],
  bookingController.cancelBooking
);

// Complete a booking (owner only)
router.patch(
  '/:bookingId/complete',
  bookingIdValidation,
  bookingController.completeBooking
);

// Get all bookings for a specific listing (owner only)
router.get(
  '/listing/:listingId',
  listingIdValidation,
  bookingController.getListingBookings
);

// System route to update booking statuses (for cron jobs)
router.post(
  '/system/update-statuses',
  bookingController.updateBookingStatuses
);

module.exports = router;