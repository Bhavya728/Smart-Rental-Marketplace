const express = require('express');
const { body, param, query } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { protect: authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const createPaymentValidation = [
  body('booking_id')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  body('payment_method')
    .isIn(['mock_card', 'mock_paypal', 'mock_bank'])
    .withMessage('Valid payment method is required'),
  body('mock_card_details')
    .optional()
    .isObject()
    .withMessage('Card details must be an object'),
  body('mock_card_details.card_number')
    .if(body('payment_method').equals('mock_card'))
    .notEmpty()
    .isLength({ min: 13, max: 19 })
    .withMessage('Valid card number is required'),
  body('mock_card_details.card_brand')
    .if(body('payment_method').equals('mock_card'))
    .notEmpty()
    .withMessage('Card brand is required'),
  body('mock_card_details.expiry_month')
    .if(body('payment_method').equals('mock_card'))
    .isInt({ min: 1, max: 12 })
    .withMessage('Valid expiry month is required'),
  body('mock_card_details.expiry_year')
    .if(body('payment_method').equals('mock_card'))
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 })
    .withMessage('Valid expiry year is required'),
  body('mock_card_details.cvv')
    .if(body('payment_method').equals('mock_card'))
    .isLength({ min: 3, max: 4 })
    .isNumeric()
    .withMessage('Valid CVV is required')
];

const transactionIdValidation = [
  param('transactionId').isMongoId().withMessage('Valid transaction ID is required')
];

const refundValidation = [
  body('refund_amount')
    .isFloat({ min: 0.01 })
    .withMessage('Valid refund amount is required'),
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Refund reason cannot exceed 200 characters')
];

// All routes except webhook require authentication
router.post('/webhook', paymentController.handlePaymentWebhook);

router.use(authMiddleware);

// Create a new payment
router.post(
  '/',
  createPaymentValidation,
  paymentController.createPayment
);

// Get user's transactions
router.get(
  '/',
  paymentController.getUserTransactions
);

// Get payment statistics
router.get(
  '/stats',
  paymentController.getPaymentStats
);

// Calculate fees for an amount
router.get(
  '/calculate-fees',
  [
    query('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Valid amount is required')
  ],
  paymentController.calculateFees
);

// Get user's saved payment methods
router.get(
  '/methods',
  paymentController.getPaymentMethods
);

// Simulate payment scenarios (for testing)
router.post(
  '/simulate',
  [
    body('scenario')
      .optional()
      .isIn(['success', 'network_error', 'insufficient_funds', 'card_declined', 'expired_card'])
      .withMessage('Invalid payment scenario')
  ],
  paymentController.simulatePaymentScenario
);

// Get specific transaction by ID
router.get(
  '/:transactionId',
  transactionIdValidation,
  paymentController.getPaymentById
);

// Process a payment
router.post(
  '/:transactionId/process',
  transactionIdValidation,
  paymentController.processPayment
);

// Process a refund
router.post(
  '/:transactionId/refund',
  [
    ...transactionIdValidation,
    ...refundValidation
  ],
  paymentController.processRefund
);

module.exports = router;