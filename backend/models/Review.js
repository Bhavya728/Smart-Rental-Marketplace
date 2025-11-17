const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: function(value) {
        return Number.isInteger(value * 2); // Allow half stars (1, 1.5, 2, etc.)
      },
      message: 'Rating must be in increments of 0.5'
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  
  // Detailed ratings
  detailed_ratings: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    location: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    amenities: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    checkin: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    }
  },
  
  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: 200
    },
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Review status and moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
    index: true
  },
  moderation_reason: {
    type: String,
    maxlength: 500
  },
  moderated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderated_at: {
    type: Date
  },
  
  // Interaction metrics
  helpful_count: {
    type: Number,
    default: 0,
    min: 0
  },
  not_helpful_count: {
    type: Number,
    default: 0,
    min: 0
  },
  helpful_votes: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'not_helpful']
    },
    voted_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Host response
  host_response: {
    content: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    responded_at: {
      type: Date
    },
    responded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Review visibility and settings
  is_anonymous: {
    type: Boolean,
    default: false
  },
  show_on_profile: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  
  // Auto-calculated review score
  review_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
reviewSchema.index({ property_id: 1, status: 1, created_at: -1 });
reviewSchema.index({ reviewer_id: 1, created_at: -1 });
reviewSchema.index({ rating: 1, status: 1 });
reviewSchema.index({ status: 1, created_at: -1 });
reviewSchema.index({ property_id: 1, reviewer_id: 1 }, { unique: true }); // One review per user per property

// Virtual for overall helpfulness ratio
reviewSchema.virtual('helpfulness_ratio').get(function() {
  const total = this.helpful_count + this.not_helpful_count;
  return total > 0 ? (this.helpful_count / total) : 0;
});

// Virtual for review age in days
reviewSchema.virtual('age_in_days').get(function() {
  return Math.floor((Date.now() - this.created_at) / (1000 * 60 * 60 * 24));
});

// Virtual for detailed ratings average
reviewSchema.virtual('detailed_average').get(function() {
  const ratings = this.detailed_ratings;
  const validRatings = Object.values(ratings).filter(r => r !== null && r !== undefined);
  return validRatings.length > 0 
    ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
    : this.rating;
});

// Pre-save middleware to update the updated_at field
reviewSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  
  // Calculate review score based on various factors
  this.calculateReviewScore();
  
  next();
});

// Method to calculate review score (0-100)
reviewSchema.methods.calculateReviewScore = function() {
  let score = 0;
  
  // Base score from rating (0-50 points)
  score += (this.rating / 5) * 50;
  
  // Bonus for detailed ratings (0-10 points)
  const detailedRatings = Object.values(this.detailed_ratings).filter(r => r !== null);
  if (detailedRatings.length >= 3) {
    score += Math.min(detailedRatings.length * 2, 10);
  }
  
  // Bonus for content length (0-10 points)
  if (this.content.length >= 100) {
    score += Math.min(Math.floor(this.content.length / 50), 10);
  }
  
  // Bonus for images (0-5 points)
  score += Math.min(this.images.length * 2, 5);
  
  // Bonus for helpfulness (0-15 points)
  if (this.helpful_count + this.not_helpful_count >= 5) {
    score += Math.min(this.helpfulness_ratio * 15, 15);
  }
  
  // Penalty for age (newer reviews score higher)
  const ageInDays = this.age_in_days;
  if (ageInDays > 30) {
    score -= Math.min((ageInDays - 30) / 10, 10);
  }
  
  // Bonus for host response (0-10 points)
  if (this.host_response && this.host_response.content) {
    score += 10;
  }
  
  this.review_score = Math.max(0, Math.min(100, Math.round(score)));
};

// Method to add helpful vote
reviewSchema.methods.addHelpfulVote = function(userId, voteType) {
  // Remove existing vote from this user
  this.helpful_votes = this.helpful_votes.filter(
    vote => vote.user_id.toString() !== userId.toString()
  );
  
  // Add new vote
  this.helpful_votes.push({
    user_id: userId,
    vote: voteType,
    voted_at: new Date()
  });
  
  // Recalculate counts
  this.helpful_count = this.helpful_votes.filter(v => v.vote === 'helpful').length;
  this.not_helpful_count = this.helpful_votes.filter(v => v.vote === 'not_helpful').length;
  
  return this.save();
};

// Method to add host response
reviewSchema.methods.addHostResponse = function(content, hostUserId) {
  this.host_response = {
    content: content,
    responded_at: new Date(),
    responded_by: hostUserId
  };
  
  return this.save();
};

// Method to moderate review
reviewSchema.methods.moderate = function(status, reason, moderatorId) {
  this.status = status;
  this.moderation_reason = reason;
  this.moderated_by = moderatorId;
  this.moderated_at = new Date();
  
  return this.save();
};

// Static method to get review statistics for a property
reviewSchema.statics.getPropertyStats = async function(propertyId) {
  const pipeline = [
    {
      $match: {
        property_id: new mongoose.Types.ObjectId(propertyId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        averageDetailedRatings: {
          $avg: {
            cleanliness: { $ifNull: ['$detailed_ratings.cleanliness', '$rating'] },
            communication: { $ifNull: ['$detailed_ratings.communication', '$rating'] },
            location: { $ifNull: ['$detailed_ratings.location', '$rating'] },
            value: { $ifNull: ['$detailed_ratings.value', '$rating'] },
            amenities: { $ifNull: ['$detailed_ratings.amenities', '$rating'] },
            checkin: { $ifNull: ['$detailed_ratings.checkin', '$rating'] }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingBreakdown: {
          5: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $gte: ['$$this', 4.5] }
              }
            }
          },
          4: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $and: [{ $gte: ['$$this', 3.5] }, { $lt: ['$$this', 4.5] }] }
              }
            }
          },
          3: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $and: [{ $gte: ['$$this', 2.5] }, { $lt: ['$$this', 3.5] }] }
              }
            }
          },
          2: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $and: [{ $gte: ['$$this', 1.5] }, { $lt: ['$$this', 2.5] }] }
              }
            }
          },
          1: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $lt: ['$$this', 1.5] }
              }
            }
          }
        },
        averageDetailedRatings: 1
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    averageDetailedRatings: {
      cleanliness: 0,
      communication: 0,
      location: 0,
      value: 0,
      amenities: 0,
      checkin: 0
    }
  };
};

// Static method to get trending reviews
reviewSchema.statics.getTrendingReviews = async function(limit = 10) {
  return this.find({
    status: 'approved',
    created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  })
  .sort({ review_score: -1, helpful_count: -1 })
  .limit(limit)
  .populate('reviewer_id', 'first_name last_name profile_image')
  .populate('property_id', 'title images location');
};

module.exports = mongoose.model('Review', reviewSchema);