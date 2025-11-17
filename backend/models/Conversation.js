const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  conversation_type: {
    type: String,
    enum: ['direct', 'booking', 'support'],
    default: 'direct'
  },
  title: {
    type: String,
    trim: true
  },
  last_message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  archived_by: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    archived_at: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
conversationSchema.index({ participants: 1, updated_at: -1 });
conversationSchema.index({ 'metadata.booking_id': 1 });
conversationSchema.index({ 'metadata.listing_id': 1 });
conversationSchema.index({ conversation_type: 1, is_active: 1 });

// Ensure participants array has exactly 2 users for direct conversations
conversationSchema.pre('save', function(next) {
  if (this.conversation_type === 'direct' && this.participants.length !== 2) {
    return next(new Error('Direct conversations must have exactly 2 participants'));
  }
  
  // Remove duplicate participants
  this.participants = [...new Set(this.participants.map(id => id.toString()))].map(id => mongoose.Types.ObjectId(id));
  
  next();
});

// Static method to find conversation between two users
conversationSchema.statics.findByParticipants = function(user1Id, user2Id) {
  return this.findOne({
    conversation_type: 'direct',
    participants: { $all: [user1Id, user2Id] },
    is_active: true
  }).populate('participants', 'first_name last_name profile_image')
    .populate('last_message', 'content message_type created_at sender_id');
};

// Static method to find or create conversation between two users
conversationSchema.statics.findOrCreateByParticipants = async function(user1Id, user2Id, metadata = {}) {
  let conversation = await this.findByParticipants(user1Id, user2Id);
  
  if (!conversation) {
    conversation = new this({
      participants: [user1Id, user2Id],
      conversation_type: 'direct',
      metadata: {
        ...metadata,
        created_by: user1Id
      }
    });
    await conversation.save();
    await conversation.populate('participants', 'first_name last_name profile_image');
  }
  
  return conversation;
};

// Static method to get user conversations with pagination
conversationSchema.statics.getUserConversations = async function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const conversations = await this.find({
    participants: userId,
    is_active: true,
    'archived_by.user_id': { $ne: userId }
  })
  .populate('participants', 'first_name last_name profile_image online_status last_seen')
  .populate('last_message', 'content message_type created_at sender_id is_read')
  .populate('metadata.booking_id', 'reference_number status listing_id')
  .populate('metadata.listing_id', 'title images city')
  .sort({ updated_at: -1 })
  .skip(skip)
  .limit(limit);

  const Message = mongoose.model('Message');
  
  // Add unread count for each conversation
  for (let conversation of conversations) {
    conversation.unread_count = await Message.getUnreadCountByConversation(
      conversation._id, 
      userId
    );
  }

  return conversations;
};

// Static method to create booking conversation
conversationSchema.statics.createBookingConversation = async function(bookingId, renterId, ownerId) {
  const Booking = mongoose.model('Booking');
  const booking = await Booking.findById(bookingId).populate('listing_id');
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  const conversation = new this({
    participants: [renterId, ownerId],
    conversation_type: 'booking',
    title: `Booking: ${booking.listing_id.title}`,
    metadata: {
      booking_id: bookingId,
      listing_id: booking.listing_id._id,
      created_by: renterId
    }
  });

  await conversation.save();
  await conversation.populate('participants', 'first_name last_name profile_image');
  
  return conversation;
};

// Instance method to archive for user
conversationSchema.methods.archiveForUser = function(userId) {
  const existingArchive = this.archived_by.find(
    archive => archive.user_id.toString() === userId.toString()
  );
  
  if (!existingArchive) {
    this.archived_by.push({
      user_id: userId,
      archived_at: new Date()
    });
  }
  
  return this.save();
};

// Instance method to unarchive for user
conversationSchema.methods.unarchiveForUser = function(userId) {
  this.archived_by = this.archived_by.filter(
    archive => archive.user_id.toString() !== userId.toString()
  );
  
  return this.save();
};

// Instance method to get other participant
conversationSchema.methods.getOtherParticipant = function(currentUserId) {
  return this.participants.find(
    participant => participant._id.toString() !== currentUserId.toString()
  );
};

// Virtual for conversation display name
conversationSchema.virtual('display_name').get(function() {
  if (this.title) {
    return this.title;
  }
  
  // For direct conversations, use participant names
  if (this.conversation_type === 'direct' && this.participants.length === 2) {
    return this.participants
      .map(p => `${p.first_name} ${p.last_name}`)
      .join(', ');
  }
  
  return 'Conversation';
});

// Virtual for conversation avatar
conversationSchema.virtual('avatar').get(function() {
  if (this.conversation_type === 'direct' && this.participants.length === 2) {
    return this.participants[0].profile_image || this.participants[1].profile_image;
  }
  
  return null;
});

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(
    participant => participant._id.toString() === userId.toString()
  );
};

// Method to get conversation summary for user
conversationSchema.methods.getSummaryForUser = async function(userId) {
  const Message = mongoose.model('Message');
  
  const otherParticipant = this.getOtherParticipant(userId);
  const unreadCount = await Message.getUnreadCountByConversation(this._id, userId);
  
  return {
    _id: this._id,
    conversation_type: this.conversation_type,
    display_name: this.display_name,
    avatar: otherParticipant?.profile_image,
    other_participant: otherParticipant,
    last_message: this.last_message,
    unread_count: unreadCount,
    updated_at: this.updated_at,
    metadata: this.metadata
  };
};

module.exports = mongoose.model('Conversation', conversationSchema);