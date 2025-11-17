const ChatService = require('../services/chatService');
const { validationResult } = require('express-validator');

class ChatController {
  // Get user conversations
  static async getConversations(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: req.query.search || '',
        archived: req.query.archived === 'true',
        conversationType: req.query.type || 'all'
      };

      const result = await ChatService.getUserConversations(userId, options);

      res.json({
        success: true,
        data: result.conversations,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get or create conversation
  static async getOrCreateConversation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { otherUserId, bookingId, listingId } = req.body;

      const metadata = {};
      if (bookingId) metadata.booking_id = bookingId;
      if (listingId) metadata.listing_id = listingId;

      const conversation = await ChatService.getOrCreateConversation(
        userId,
        otherUserId,
        metadata
      );

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to get or create conversation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create booking conversation
  static async createBookingConversation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { bookingId } = req.params;
      
      const conversation = await ChatService.createBookingConversation(bookingId);

      res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('Error creating booking conversation:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create booking conversation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get conversation messages
  static async getConversationMessages(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { conversationId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await ChatService.getConversationMessages(
        conversationId,
        userId,
        options
      );

      res.json({
        success: true,
        data: result.messages,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to get messages',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Send message
  static async sendMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const senderId = req.user.id;
      const { conversationId } = req.params;
      const messageData = {
        content: req.body.content,
        messageType: req.body.messageType || 'text',
        replyTo: req.body.replyTo,
        fileUrl: req.body.fileUrl,
        fileName: req.body.fileName,
        fileSize: req.body.fileSize
      };

      const message = await ChatService.sendMessage(
        senderId,
        conversationId,
        messageData
      );

      // Emit message via socket (handled by socket manager)
      if (req.app.locals.socketManager) {
        req.app.locals.socketManager.sendToConversation(
          conversationId,
          'new_message',
          message
        );
      }

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;

      await ChatService.markMessagesAsRead(conversationId, userId);

      // Emit read receipt via socket
      if (req.app.locals.socketManager) {
        req.app.locals.socketManager.sendToConversation(
          conversationId,
          'messages_read',
          { conversationId, readBy: userId }
        );
      }

      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Edit message
  static async editMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { messageId } = req.params;
      const { content } = req.body;

      const message = await ChatService.editMessage(messageId, userId, content);

      // Emit edited message via socket
      if (req.app.locals.socketManager) {
        req.app.locals.socketManager.sendToConversation(
          message.conversation_id,
          'message_edited',
          message
        );
      }

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Error editing message:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to edit message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete message
  static async deleteMessage(req, res) {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;

      await ChatService.deleteMessage(messageId, userId);

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Archive conversation
  static async archiveConversation(req, res) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;

      await ChatService.archiveConversation(conversationId, userId);

      res.json({
        success: true,
        message: 'Conversation archived successfully'
      });
    } catch (error) {
      console.error('Error archiving conversation:', error);
      
      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to archive conversation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Unarchive conversation
  static async unarchiveConversation(req, res) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;

      await ChatService.unarchiveConversation(conversationId, userId);

      res.json({
        success: true,
        message: 'Conversation unarchived successfully'
      });
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      
      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to unarchive conversation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get chat statistics
  static async getChatStats(req, res) {
    try {
      const userId = req.user.id;
      
      const stats = await ChatService.getChatStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting chat stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search messages
  static async searchMessages(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { query } = req.query;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        conversationId: req.query.conversationId
      };

      const result = await ChatService.searchMessages(userId, query, options);

      res.json({
        success: true,
        data: result.messages,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error searching messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search messages',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = ChatController;