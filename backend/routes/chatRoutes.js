const express = require('express');
const { body, param, query } = require('express-validator');
const ChatController = require('../controllers/chatController');
const { protect: auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation middleware
const validateConversationId = [
  param('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID')
];

const validateMessageId = [
  param('messageId')
    .isMongoId()
    .withMessage('Invalid message ID')
];

const validateBookingId = [
  param('bookingId')
    .isMongoId()
    .withMessage('Invalid booking ID')
];

const validateCreateConversation = [
  body('otherUserId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('bookingId')
    .optional()
    .isMongoId()
    .withMessage('Invalid booking ID'),
  body('listingId')
    .optional()
    .isMongoId()
    .withMessage('Invalid listing ID')
];

const validateSendMessage = [
  body('content')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'system'])
    .withMessage('Invalid message type'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid reply message ID'),
  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('Invalid file URL'),
  body('fileName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('File name too long'),
  body('fileSize')
    .optional()
    .isInt({ min: 0, max: 50 * 1024 * 1024 }) // 50MB max
    .withMessage('Invalid file size')
];

const validateEditMessage = [
  body('content')
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateSearch = [
  query('query')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  ...validatePagination
];

// Routes

// Get user conversations
router.get('/', 
  validatePagination,
  ChatController.getConversations
);

// Get or create conversation
router.post('/',
  validateCreateConversation,
  ChatController.getOrCreateConversation
);

// Create booking conversation
router.post('/booking/:bookingId',
  validateBookingId,
  ChatController.createBookingConversation
);

// Get conversation messages
router.get('/:conversationId/messages',
  validateConversationId,
  validatePagination,
  ChatController.getConversationMessages
);

// Send message to conversation
router.post('/:conversationId/messages',
  validateConversationId,
  validateSendMessage,
  ChatController.sendMessage
);

// Mark messages as read
router.post('/:conversationId/read',
  validateConversationId,
  ChatController.markMessagesAsRead
);

// Archive conversation
router.post('/:conversationId/archive',
  validateConversationId,
  ChatController.archiveConversation
);

// Unarchive conversation
router.post('/:conversationId/unarchive',
  validateConversationId,
  ChatController.unarchiveConversation
);

// Edit message
router.put('/messages/:messageId',
  validateMessageId,
  validateEditMessage,
  ChatController.editMessage
);

// Delete message
router.delete('/messages/:messageId',
  validateMessageId,
  ChatController.deleteMessage
);

// Get chat statistics
router.get('/stats',
  ChatController.getChatStats
);

// Search messages
router.get('/search',
  validateSearch,
  ChatController.searchMessages
);

module.exports = router;