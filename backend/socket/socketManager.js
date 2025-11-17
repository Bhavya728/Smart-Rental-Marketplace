const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

class SocketManager {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.first_name} connected: ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);
      
      // Update user online status
      this.updateUserOnlineStatus(socket.userId, true);
      
      // Join user to their personal room for notifications
      socket.join(`user:${socket.userId}`);
      
      // Emit user online status to friends/contacts
      this.broadcastUserStatus(socket.userId, true);

      // Handle joining conversation rooms
      socket.on('join_conversation', async (conversationId) => {
        try {
          const conversation = await Conversation.findById(conversationId);
          
          if (!conversation || !conversation.isParticipant(socket.userId)) {
            socket.emit('error', { message: 'Unauthorized to join this conversation' });
            return;
          }
          
          socket.join(`conversation:${conversationId}`);
          
          // Mark messages as read when joining conversation
          await Message.markMessagesAsRead(conversationId, socket.userId);
          
          // Notify other participants that user joined
          socket.to(`conversation:${conversationId}`).emit('user_joined', {
            userId: socket.userId,
            user: {
              _id: socket.user._id,
              first_name: socket.user.first_name,
              last_name: socket.user.last_name,
              profile_image: socket.user.profile_image
            }
          });
          
          console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        } catch (error) {
          console.error('Error joining conversation:', error);
          socket.emit('error', { message: 'Failed to join conversation' });
        }
      });

      // Handle leaving conversation rooms
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        
        // Notify other participants that user left
        socket.to(`conversation:${conversationId}`).emit('user_left', {
          userId: socket.userId
        });
        
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const { conversationId, content, messageType, replyTo, fileUrl, fileName, fileSize } = data;
          
          // Validate conversation access
          const conversation = await Conversation.findById(conversationId);
          if (!conversation || !conversation.isParticipant(socket.userId)) {
            socket.emit('error', { message: 'Unauthorized to send message to this conversation' });
            return;
          }
          
          // Get other participant
          const otherParticipant = conversation.getOtherParticipant(socket.userId);
          
          // Create message
          const message = new Message({
            conversation_id: conversationId,
            sender_id: socket.userId,
            receiver_id: otherParticipant._id,
            message_type: messageType || 'text',
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
          
          // Emit message to all participants in the conversation
          this.io.to(`conversation:${conversationId}`).emit('new_message', message);
          
          // Send push notification to offline users
          const receiverSocketId = this.connectedUsers.get(otherParticipant._id.toString());
          if (!receiverSocketId) {
            // User is offline, send push notification
            this.sendPushNotification(otherParticipant._id, {
              title: `${socket.user.first_name} ${socket.user.last_name}`,
              body: messageType === 'text' ? content : `Sent ${messageType}`,
              conversationId
            });
          }
          
          console.log(`Message sent in conversation ${conversationId}`);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (conversationId) => {
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId: socket.userId,
          user: {
            _id: socket.user._id,
            first_name: socket.user.first_name,
            last_name: socket.user.last_name
          }
        });
      });

      socket.on('typing_stop', (conversationId) => {
        socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
          userId: socket.userId
        });
      });

      // Handle message read receipts
      socket.on('mark_messages_read', async (conversationId) => {
        try {
          await Message.markMessagesAsRead(conversationId, socket.userId);
          
          // Notify sender that messages were read
          socket.to(`conversation:${conversationId}`).emit('messages_read', {
            conversationId,
            readBy: socket.userId
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Handle message editing
      socket.on('edit_message', async (data) => {
        try {
          const { messageId, newContent } = data;
          
          const message = await Message.findById(messageId);
          if (!message || message.sender_id.toString() !== socket.userId) {
            socket.emit('error', { message: 'Unauthorized to edit this message' });
            return;
          }
          
          await message.editContent(newContent);
          await message.populate('sender_id', 'first_name last_name profile_image');
          
          // Emit updated message to conversation participants
          this.io.to(`conversation:${message.conversation_id}`).emit('message_edited', message);
        } catch (error) {
          console.error('Error editing message:', error);
          socket.emit('error', { message: 'Failed to edit message' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.first_name} disconnected: ${socket.id}`);
        
        // Remove user connection
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);
        
        // Update user online status after delay (in case of reconnection)
        setTimeout(() => {
          if (!this.connectedUsers.has(socket.userId)) {
            this.updateUserOnlineStatus(socket.userId, false);
            this.broadcastUserStatus(socket.userId, false);
          }
        }, 5000); // 5 second delay
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  // Update user online status in database
  async updateUserOnlineStatus(userId, isOnline) {
    try {
      const updateData = {
        online_status: isOnline
      };
      
      if (!isOnline) {
        updateData.last_seen = new Date();
      }
      
      await User.findByIdAndUpdate(userId, updateData);
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  // Broadcast user online status to their contacts
  broadcastUserStatus(userId, isOnline) {
    this.io.emit('user_status_changed', {
      userId,
      isOnline,
      lastSeen: isOnline ? null : new Date()
    });
  }

  // Send push notification to offline users
  async sendPushNotification(userId, notification) {
    try {
      // This would integrate with your push notification service
      // For now, we'll just log it
      console.log(`Push notification for user ${userId}:`, notification);
      
      // You can integrate with services like Firebase Cloud Messaging,
      // Apple Push Notification Service, etc.
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId.toString());
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Send message to conversation
  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = SocketManager;