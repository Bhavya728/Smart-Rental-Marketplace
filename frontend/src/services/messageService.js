import apiClient from './apiClient';

class MessageService {
  constructor() {
    this.baseURL = '/chat';
  }

  // Get user conversations with pagination and filters
  async getConversations(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        archived = false,
        type = 'all'
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(archived && { archived: 'true' }),
        ...(type !== 'all' && { type })
      });

      const response = await apiClient.get(`${this.baseURL}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw this.handleError(error);
    }
  }

  // Get or create conversation with another user
  async getOrCreateConversation(otherUserId, metadata = {}) {
    try {
      const response = await apiClient.post(this.baseURL, {
        otherUserId,
        ...metadata
      });
      return response.data;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      throw this.handleError(error);
    }
  }

  // Create conversation for a booking
  async createBookingConversation(bookingId) {
    try {
      const response = await apiClient.post(`${this.baseURL}/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error creating booking conversation:', error);
      throw this.handleError(error);
    }
  }

  // Get messages for a conversation
  async getConversationMessages(conversationId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await apiClient.get(
        `${this.baseURL}/${conversationId}/messages?${params}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw this.handleError(error);
    }
  }

  // Send message to conversation
  async sendMessage(conversationId, messageData) {
    try {
      const response = await apiClient.post(
        `${this.baseURL}/${conversationId}/messages`,
        messageData
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw this.handleError(error);
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId) {
    try {
      const response = await apiClient.post(
        `${this.baseURL}/${conversationId}/read`
      );
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw this.handleError(error);
    }
  }

  // Edit message
  async editMessage(messageId, newContent) {
    try {
      const response = await apiClient.put(
        `${this.baseURL}/messages/${messageId}`,
        { content: newContent }
      );
      return response.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw this.handleError(error);
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const response = await apiClient.delete(
        `${this.baseURL}/messages/${messageId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw this.handleError(error);
    }
  }

  // Archive conversation
  async archiveConversation(conversationId) {
    try {
      const response = await apiClient.post(
        `${this.baseURL}/${conversationId}/archive`
      );
      return response.data;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw this.handleError(error);
    }
  }

  // Unarchive conversation
  async unarchiveConversation(conversationId) {
    try {
      const response = await apiClient.post(
        `${this.baseURL}/${conversationId}/unarchive`
      );
      return response.data;
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      throw this.handleError(error);
    }
  }

  // Get chat statistics
  async getChatStats() {
    try {
      const response = await apiClient.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat stats:', error);
      throw this.handleError(error);
    }
  }

  // Search messages
  async searchMessages(query, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        conversationId = null 
      } = options;

      const params = new URLSearchParams({
        query,
        page: page.toString(),
        limit: limit.toString(),
        ...(conversationId && { conversationId })
      });

      const response = await apiClient.get(`${this.baseURL}/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw this.handleError(error);
    }
  }

  // Upload file for message
  async uploadMessageFile(file, conversationId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      const response = await apiClient.post(
        '/upload/message-file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading message file:', error);
      throw this.handleError(error);
    }
  }

  // Validation helpers
  validateMessage(content, type = 'text') {
    const errors = [];

    if (type === 'text') {
      if (!content || content.trim().length === 0) {
        errors.push('Message content is required');
      }
      if (content.length > 5000) {
        errors.push('Message content must be less than 5000 characters');
      }
    }

    if (type === 'file' || type === 'image') {
      if (!content) {
        errors.push('File is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateFile(file) {
    const errors = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format message for display
  formatMessage(message) {
    return {
      ...message,
      formatted_time: this.formatMessageTime(message.created_at),
      is_own_message: false, // Will be set by component
      display_name: this.getDisplayName(message.sender_id)
    };
  }

  formatMessageTime(timestamp) {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return messageTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 7 * 24) {
      return messageTime.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return messageTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  }

  getDisplayName(user) {
    if (!user) return 'Unknown User';
    return `${user.first_name} ${user.last_name}`.trim() || user.email || 'User';
  }

  // Format conversation for display
  formatConversation(conversation, currentUserId) {
    const otherParticipant = conversation.participants?.find(
      p => p._id !== currentUserId
    );

    return {
      ...conversation,
      display_name: this.getConversationDisplayName(conversation, currentUserId),
      display_avatar: otherParticipant?.profile_image,
      other_participant: otherParticipant,
      last_message_preview: this.getLastMessagePreview(conversation.last_message),
      is_online: otherParticipant?.online_status || false
    };
  }

  getConversationDisplayName(conversation, currentUserId) {
    if (conversation.title) {
      return conversation.title;
    }

    if (conversation.conversation_type === 'direct') {
      const otherParticipant = conversation.participants?.find(
        p => p._id !== currentUserId
      );
      return this.getDisplayName(otherParticipant);
    }

    return 'Conversation';
  }

  getLastMessagePreview(lastMessage) {
    if (!lastMessage) return 'No messages yet';

    switch (lastMessage.message_type) {
      case 'text':
        return lastMessage.content.length > 50 
          ? `${lastMessage.content.substring(0, 50)}...`
          : lastMessage.content;
      case 'image':
        return '📷 Image';
      case 'file':
        return '📎 File';
      case 'system':
        return lastMessage.content;
      default:
        return 'Message';
    }
  }

  // Error handling
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred');
  }
}

// Create singleton instance
const messageService = new MessageService();
export { messageService };
export default messageService;