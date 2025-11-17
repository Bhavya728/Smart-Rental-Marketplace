import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventHandlers = new Map();
    this.messageQueue = [];
    
    // Typing indicator tracking
    this.typingTimers = new Map();
    this.typingUsers = new Set();
  }

  // Initialize socket connection
  connect(token) {
    try {
      if (this.socket?.connected) {
        console.log('Socket already connected');
        return Promise.resolve();
      }

      const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      this.socket = io(serverURL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.connectionAttempts = 0;
          console.log('Socket connected:', this.socket.id);
          
          // Process any queued messages
          this.processMessageQueue();
          
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('Socket connection error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error initializing socket connection:', error);
      throw error;
    }
  }

  // Setup socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.connectionAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
      
      // Auto-reconnect if not a manual disconnect
      if (reason !== 'io client disconnect') {
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.emit('connection_error', error);
      this.handleReconnection();
    });

    // Message events
    this.socket.on('new_message', (message) => {
      console.log('New message received:', message);
      this.emit('new_message', message);
    });

    this.socket.on('message_edited', (message) => {
      console.log('Message edited:', message);
      this.emit('message_edited', message);
    });

    this.socket.on('messages_read', (data) => {
      console.log('Messages marked as read:', data);
      this.emit('messages_read', data);
    });

    // Typing indicators
    this.socket.on('user_typing', (data) => {
      console.log('User typing:', data);
      this.handleTypingStart(data);
    });

    this.socket.on('user_stopped_typing', (data) => {
      console.log('User stopped typing:', data);
      this.handleTypingStop(data);
    });

    // User presence
    this.socket.on('user_status_changed', (data) => {
      console.log('User status changed:', data);
      this.emit('user_status_changed', data);
    });

    this.socket.on('user_joined', (data) => {
      console.log('User joined conversation:', data);
      this.emit('user_joined', data);
    });

    this.socket.on('user_left', (data) => {
      console.log('User left conversation:', data);
      this.emit('user_left', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket_error', error);
    });
  }

  // Handle reconnection logic
  handleReconnection() {
    if (this.connectionAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnection_failed');
      return;
    }

    this.connectionAttempts++;
    const delay = this.reconnectDelay * this.connectionAttempts;
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.connectionAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.socket?.connect();
      }
    }, delay);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventHandlers.clear();
      this.messageQueue = [];
      console.log('Socket disconnected manually');
    }
  }

  // Join conversation room
  joinConversation(conversationId) {
    if (!this.isConnected) {
      console.warn('Socket not connected, queueing join conversation');
      this.messageQueue.push({ type: 'join_conversation', data: conversationId });
      return;
    }
    
    console.log('Joining conversation:', conversationId);
    this.socket.emit('join_conversation', conversationId);
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (!this.isConnected) return;
    
    console.log('Leaving conversation:', conversationId);
    this.socket.emit('leave_conversation', conversationId);
    
    // Clear typing state for this conversation
    this.clearTypingForConversation(conversationId);
  }

  // Send message
  sendMessage(conversationId, messageData) {
    if (!this.isConnected) {
      console.warn('Socket not connected, queueing message');
      this.messageQueue.push({ 
        type: 'send_message', 
        data: { conversationId, ...messageData } 
      });
      return;
    }
    
    console.log('Sending message:', { conversationId, messageData });
    this.socket.emit('send_message', {
      conversationId,
      ...messageData
    });
  }

  // Typing indicators
  startTyping(conversationId) {
    if (!this.isConnected) return;
    
    this.socket.emit('typing_start', conversationId);
    
    // Auto-stop typing after 3 seconds
    if (this.typingTimers.has(conversationId)) {
      clearTimeout(this.typingTimers.get(conversationId));
    }
    
    const timer = setTimeout(() => {
      this.stopTyping(conversationId);
    }, 3000);
    
    this.typingTimers.set(conversationId, timer);
  }

  stopTyping(conversationId) {
    if (!this.isConnected) return;
    
    this.socket.emit('typing_stop', conversationId);
    
    if (this.typingTimers.has(conversationId)) {
      clearTimeout(this.typingTimers.get(conversationId));
      this.typingTimers.delete(conversationId);
    }
  }

  // Handle typing events
  handleTypingStart(data) {
    const { userId, conversationId } = data;
    const key = `${conversationId}:${userId}`;
    
    this.typingUsers.add(key);
    this.emit('typing_users_changed', {
      conversationId,
      typingUsers: this.getTypingUsersForConversation(conversationId),
      userStartedTyping: data
    });
    
    // Auto-remove typing indicator after 5 seconds
    setTimeout(() => {
      if (this.typingUsers.has(key)) {
        this.handleTypingStop({ userId, conversationId });
      }
    }, 5000);
  }

  handleTypingStop(data) {
    const { userId, conversationId } = data;
    const key = `${conversationId}:${userId}`;
    
    this.typingUsers.delete(key);
    this.emit('typing_users_changed', {
      conversationId,
      typingUsers: this.getTypingUsersForConversation(conversationId),
      userStoppedTyping: data
    });
  }

  getTypingUsersForConversation(conversationId) {
    return Array.from(this.typingUsers)
      .filter(key => key.startsWith(`${conversationId}:`))
      .map(key => key.split(':')[1]);
  }

  clearTypingForConversation(conversationId) {
    Array.from(this.typingUsers)
      .filter(key => key.startsWith(`${conversationId}:`))
      .forEach(key => this.typingUsers.delete(key));
  }

  // Mark messages as read
  markMessagesAsRead(conversationId) {
    if (!this.isConnected) return;
    
    this.socket.emit('mark_messages_read', conversationId);
  }

  // Edit message
  editMessage(messageId, newContent) {
    if (!this.isConnected) return;
    
    this.socket.emit('edit_message', { messageId, newContent });
  }

  // Event handling
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
    
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Process queued messages when connection is restored
  processMessageQueue() {
    if (!this.isConnected || this.messageQueue.length === 0) return;
    
    console.log(`Processing ${this.messageQueue.length} queued messages`);
    
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    queue.forEach(item => {
      switch (item.type) {
        case 'join_conversation':
          this.joinConversation(item.data);
          break;
        case 'send_message':
          this.sendMessage(item.data.conversationId, item.data);
          break;
        default:
          console.warn('Unknown queued message type:', item.type);
      }
    });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      connectionAttempts: this.connectionAttempts
    };
  }

  // Utility methods for React components
  useTypingDebounce(conversationId, delay = 1000) {
    let timeout;
    
    return () => {
      // Start typing immediately
      this.startTyping(conversationId);
      
      // Clear previous timeout
      if (timeout) clearTimeout(timeout);
      
      // Set new timeout to stop typing
      timeout = setTimeout(() => {
        this.stopTyping(conversationId);
      }, delay);
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

// Auto-connect when user is authenticated (if needed)
if (typeof window !== 'undefined') {
  // Listen for auth state changes
  window.addEventListener('auth-state-changed', (event) => {
    const { user, token } = event.detail || {};
    
    if (user && token) {
      socketService.connect(token).catch(console.error);
    } else {
      socketService.disconnect();
    }
  });
}

export default socketService;