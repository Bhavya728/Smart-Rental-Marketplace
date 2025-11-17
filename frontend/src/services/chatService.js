import api from './api';
import { io } from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket && this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          console.log('Connected to chat server');
          this.isConnected = true;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from chat server:', reason);
          this.isConnected = false;
          
          // Auto-reconnect if not intentional disconnect
          if (reason === 'io server disconnect') {
            this.socket.connect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('Chat connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('Chat error:', error);
          this.emitToListeners('error', error);
        });

        // Message events
        this.socket.on('new_message', (message) => {
          this.emitToListeners('new_message', message);
        });

        this.socket.on('message_edited', (message) => {
          this.emitToListeners('message_edited', message);
        });

        this.socket.on('messages_read', (data) => {
          this.emitToListeners('messages_read', data);
        });

        // Typing events
        this.socket.on('user_typing', (data) => {
          this.emitToListeners('user_typing', data);
        });

        this.socket.on('user_stopped_typing', (data) => {
          this.emitToListeners('user_stopped_typing', data);
        });

        // User status events
        this.socket.on('user_status_changed', (data) => {
          this.emitToListeners('user_status_changed', data);
        });

        this.socket.on('user_joined', (data) => {
          this.emitToListeners('user_joined', data);
        });

        this.socket.on('user_left', (data) => {
          this.emitToListeners('user_left', data);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Emit to registered listeners
  emitToListeners(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Join conversation room
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Send message via socket
  sendMessageSocket(conversationId, messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        conversationId,
        ...messageData
      });
    }
  }

  // Send typing indicator
  startTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', conversationId);
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', conversationId);
    }
  }

  // Mark messages as read via socket
  markMessagesReadSocket(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_messages_read', conversationId);
    }
  }

  // Edit message via socket
  editMessageSocket(messageId, newContent) {
    if (this.socket && this.isConnected) {
      this.socket.emit('edit_message', { messageId, newContent });
    }
  }

  // HTTP API Methods

  // Get user conversations
  async getConversations(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.search) params.append('search', options.search);
      if (options.archived !== undefined) params.append('archived', options.archived);
      if (options.type) params.append('type', options.type);

      const response = await api.get(`/chat?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get or create conversation
  async getOrCreateConversation(otherUserId, metadata = {}) {
    try {
      const response = await api.post('/chat', {
        otherUserId,
        ...metadata
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create booking conversation
  async createBookingConversation(bookingId) {
    try {
      const response = await api.post(`/chat/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get conversation messages
  async getConversationMessages(conversationId, options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);

      const response = await api.get(`/chat/${conversationId}/messages?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send message via HTTP
  async sendMessage(conversationId, messageData) {
    try {
      const response = await api.post(`/chat/${conversationId}/messages`, messageData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark messages as read via HTTP
  async markMessagesAsRead(conversationId) {
    try {
      const response = await api.post(`/chat/${conversationId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Edit message via HTTP
  async editMessage(messageId, content) {
    try {
      const response = await api.put(`/chat/messages/${messageId}`, { content });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Archive conversation
  async archiveConversation(conversationId) {
    try {
      const response = await api.post(`/chat/${conversationId}/archive`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Unarchive conversation
  async unarchiveConversation(conversationId) {
    try {
      const response = await api.post(`/chat/${conversationId}/unarchive`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get chat statistics
  async getChatStats() {
    try {
      const response = await api.get('/chat/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search messages
  async searchMessages(query, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.conversationId) params.append('conversationId', options.conversationId);

      const response = await api.get(`/chat/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload file for message
  async uploadMessageFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'chat');

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method to handle errors
  handleError(error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  // Validation helpers
  static validateMessage(content, messageType = 'text') {
    const errors = [];

    if (messageType === 'text') {
      if (!content || content.trim().length === 0) {
        errors.push('Message content is required');
      }
      if (content.length > 5000) {
        errors.push('Message content must be less than 5000 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateFile(file) {
    const errors = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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

  // Format helpers
  static formatMessageTime(timestamp) {
    const messageTime = new Date(timestamp);
    const now = new Date();
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

  static getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📝',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️'
    };
    return iconMap[ext] || '📎';
  }
}

export default new ChatService();