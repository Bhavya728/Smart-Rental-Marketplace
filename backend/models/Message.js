const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message_type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  content: {
    type: String,
    required: function() {
      return this.message_type === 'text' || this.message_type === 'system';
    }
  },
  file_url: {
    type: String,
    required: function() {
      return this.message_type === 'image' || this.message_type === 'file';
    }
  },
  file_name: {
    type: String
  },
  file_size: {
    type: Number
  },
  is_read: {
    type: Boolean,
    default: false
  },
  read_at: {
    type: Date
  },
  is_edited: {
    type: Boolean,
    default: false
  },
  edited_at: {
    type: Date
  },
  reply_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  metadata: {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ conversation_id: 1, created_at: -1 });
messageSchema.index({ sender_id: 1, created_at: -1 });
messageSchema.index({ receiver_id: 1, is_read: 1 });

// Virtual for formatted timestamp
messageSchema.virtual('formatted_time').get(function() {
  const now = new Date();
  const messageTime = this.created_at;
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
});

// Static method to get conversation messages with pagination
messageSchema.statics.getConversationMessages = function(conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ conversation_id: conversationId })
    .populate('sender_id', 'first_name last_name profile_image')
    .populate('receiver_id', 'first_name last_name profile_image')
    .populate('reply_to', 'content sender_id message_type')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to mark messages as read
messageSchema.statics.markMessagesAsRead = function(conversationId, userId) {
  return this.updateMany(
    {
      conversation_id: conversationId,
      receiver_id: userId,
      is_read: false
    },
    {
      $set: {
        is_read: true,
        read_at: new Date()
      }
    }
  );
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiver_id: userId,
    is_read: false
  });
};

// Static method to get unread count by conversation
messageSchema.statics.getUnreadCountByConversation = function(conversationId, userId) {
  return this.countDocuments({
    conversation_id: conversationId,
    receiver_id: userId,
    is_read: false
  });
};

// Instance method to mark as read
messageSchema.methods.markAsRead = function() {
  this.is_read = true;
  this.read_at = new Date();
  return this.save();
};

// Instance method to edit message
messageSchema.methods.editContent = function(newContent) {
  if (this.message_type !== 'text') {
    throw new Error('Only text messages can be edited');
  }
  
  this.content = newContent;
  this.is_edited = true;
  this.edited_at = new Date();
  return this.save();
};

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // Validate file requirements
  if (this.message_type === 'image' || this.message_type === 'file') {
    if (!this.file_url) {
      return next(new Error('File URL is required for file messages'));
    }
  }
  
  // Set read timestamp if marking as read
  if (this.is_read && !this.read_at) {
    this.read_at = new Date();
  }
  
  next();
});

// Post-save middleware to update conversation last_message
messageSchema.post('save', async function(doc) {
  try {
    const Conversation = mongoose.model('Conversation');
    await Conversation.findByIdAndUpdate(
      doc.conversation_id,
      {
        last_message: doc._id,
        updated_at: new Date()
      }
    );
  } catch (error) {
    console.error('Error updating conversation last message:', error);
  }
});

module.exports = mongoose.model('Message', messageSchema);