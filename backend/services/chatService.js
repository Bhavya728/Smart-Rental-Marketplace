const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Booking = require('../models/Booking');

class ChatService {
  // Get user conversations with pagination and filters
  static async getUserConversations(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        archived = false,
        conversationType = 'all'
      } = options;

      const skip = (page - 1) * limit;
      
      // Build query
      let query = {
        participants: userId,
        is_active: true
      };

      // Handle archived conversations
      if (archived) {
        query['archived_by.user_id'] = userId;
      } else {
        query['archived_by.user_id'] = { $ne: userId };
      }

      // Filter by conversation type
      if (conversationType !== 'all') {
        query.conversation_type = conversationType;
      }

      let conversations = await Conversation.find(query)
        .populate('participants', 'first_name last_name profile_image online_status last_seen')
        .populate('last_message', 'content message_type created_at sender_id is_read')
        .populate('metadata.booking_id', 'reference_number status listing_id')
        .populate('metadata.listing_id', 'title images city')
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(limit);

      // Search filter (applied after population)
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        conversations = conversations.filter(conv => {
          const otherParticipant = conv.getOtherParticipant(userId);
          const participantName = `${otherParticipant.first_name} ${otherParticipant.last_name}`;
          return participantName.match(searchRegex) || 
                 conv.title?.match(searchRegex) ||
                 conv.last_message?.content?.match(searchRegex);
        });
      }

      // Add unread count and format for frontend
      const formattedConversations = await Promise.all(
        conversations.map(async (conversation) => {
          const unreadCount = await Message.getUnreadCountByConversation(
            conversation._id,
            userId
          );
          
          return {
            ...conversation.getSummaryForUser(userId),
            unread_count: unreadCount
          };
        })
      );

      const totalConversations = await Conversation.countDocuments(query);

      return {
        conversations: formattedConversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalConversations,
          pages: Math.ceil(totalConversations / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get conversations: ${error.message}`);
    }
  }

  // Get or create conversation between two users
  static async getOrCreateConversation(userId1, userId2, metadata = {}) {
    try {
      // Check if users exist
      const [user1, user2] = await Promise.all([
        User.findById(userId1),
        User.findById(userId2)
      ]);

      if (!user1 || !user2) {
        throw new Error('One or both users not found');
      }

      if (userId1 === userId2) {
        throw new Error('Cannot create conversation with yourself');
      }

      // Find or create conversation
      const conversation = await Conversation.findOrCreateByParticipants(
        userId1, 
        userId2, 
        metadata
      );

      await conversation.populate([
        { path: 'participants', select: 'first_name last_name profile_image online_status' },
        { path: 'last_message', select: 'content message_type created_at sender_id' }
      ]);

      return conversation;
    } catch (error) {
      throw new Error(`Failed to get or create conversation: ${error.message}`);
    }
  }

  // Create booking conversation
  static async createBookingConversation(bookingId) {
    try {
      const booking = await Booking.findById(bookingId)
        .populate('renter_id owner_id listing_id');

      if (!booking) {
        throw new Error('Booking not found');
      }

      const conversation = await Conversation.createBookingConversation(
        bookingId,
        booking.renter_id._id,
        booking.owner_id._id
      );

      // Send welcome message
      const welcomeMessage = new Message({
        conversation_id: conversation._id,
        sender_id: booking.renter_id._id,
        receiver_id: booking.owner_id._id,
        message_type: 'system',
        content: `Booking conversation started for "${booking.listing_id.title}". Reference: ${booking.reference_number}`,
        metadata: {
          booking_id: bookingId,
          listing_id: booking.listing_id._id
        }
      });

      await welcomeMessage.save();

      return conversation;
    } catch (error) {
      throw new Error(`Failed to create booking conversation: ${error.message}`);
    }
  }

  // Get conversation messages with pagination
  static async getConversationMessages(conversationId, userId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;

      // Verify user has access to conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.isParticipant(userId)) {
        throw new Error('Unauthorized access to conversation');
      }

      const messages = await Message.getConversationMessages(
        conversationId, 
        page, 
        limit
      );

      // Reverse to show oldest first
      messages.reverse();

      const totalMessages = await Message.countDocuments({
        conversation_id: conversationId
      });

      return {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }
  }

  // Send message
  static async sendMessage(senderId, conversationId, messageData) {
    try {
      const { content, messageType = 'text', replyTo, fileUrl, fileName, fileSize } = messageData;

      // Verify conversation access
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.isParticipant(senderId)) {
        throw new Error('Unauthorized access to conversation');
      }

      const otherParticipant = conversation.getOtherParticipant(senderId);

      const message = new Message({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: otherParticipant._id,
        message_type: messageType,
        content,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        reply_to: replyTo
      });

      await message.save();
      await message.populate([
        { path: 'sender_id', select: 'first_name last_name profile_image' },
        { path: 'receiver_id', select: 'first_name last_name profile_image' },
        { path: 'reply_to', select: 'content sender_id message_type' }
      ]);

      return message;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId, userId) {
    try {
      const result = await Message.markMessagesAsRead(conversationId, userId);
      return result;
    } catch (error) {
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }
  }

  // Edit message
  static async editMessage(messageId, userId, newContent) {
    try {
      const message = await Message.findById(messageId);
      
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.sender_id.toString() !== userId) {
        throw new Error('Unauthorized to edit this message');
      }

      await message.editContent(newContent);
      await message.populate('sender_id', 'first_name last_name profile_image');

      return message;
    } catch (error) {
      throw new Error(`Failed to edit message: ${error.message}`);
    }
  }

  // Delete message
  static async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.sender_id.toString() !== userId) {
        throw new Error('Unauthorized to delete this message');
      }

      await Message.findByIdAndDelete(messageId);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  // Archive conversation for user
  static async archiveConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation || !conversation.isParticipant(userId)) {
        throw new Error('Conversation not found or unauthorized');
      }

      await conversation.archiveForUser(userId);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to archive conversation: ${error.message}`);
    }
  }

  // Unarchive conversation for user
  static async unarchiveConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation || !conversation.isParticipant(userId)) {
        throw new Error('Conversation not found or unauthorized');
      }

      await conversation.unarchiveForUser(userId);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to unarchive conversation: ${error.message}`);
    }
  }

  // Get user chat statistics
  static async getChatStats(userId) {
    try {
      const [
        totalConversations,
        unreadCount,
        archivedCount,
        totalMessagesSent,
        totalMessagesReceived
      ] = await Promise.all([
        Conversation.countDocuments({
          participants: userId,
          is_active: true,
          'archived_by.user_id': { $ne: userId }
        }),
        Message.getUnreadCount(userId),
        Conversation.countDocuments({
          participants: userId,
          is_active: true,
          'archived_by.user_id': userId
        }),
        Message.countDocuments({ sender_id: userId }),
        Message.countDocuments({ receiver_id: userId })
      ]);

      return {
        totalConversations,
        unreadCount,
        archivedCount,
        totalMessagesSent,
        totalMessagesReceived,
        totalMessages: totalMessagesSent + totalMessagesReceived
      };
    } catch (error) {
      throw new Error(`Failed to get chat stats: ${error.message}`);
    }
  }

  // Search messages across all conversations for a user
  static async searchMessages(userId, searchQuery, options = {}) {
    try {
      const { page = 1, limit = 20, conversationId = null } = options;
      const skip = (page - 1) * limit;

      let query = {
        $or: [
          { sender_id: userId },
          { receiver_id: userId }
        ],
        content: { $regex: searchQuery, $options: 'i' },
        message_type: 'text'
      };

      if (conversationId) {
        query.conversation_id = conversationId;
      }

      const messages = await Message.find(query)
        .populate('sender_id', 'first_name last_name profile_image')
        .populate('receiver_id', 'first_name last_name profile_image')
        .populate('conversation_id', 'participants conversation_type')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Message.countDocuments(query);

      return {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to search messages: ${error.message}`);
    }
  }
}

module.exports = ChatService;