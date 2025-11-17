const Review = require('../models/Review');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');

class ReviewService {
  /**
   * Create a new review
   */
  async createReview(reviewData) {
    const {
      property_id,
      reviewer_id,
      booking_id,
      rating,
      title,
      content,
      detailed_ratings,
      images,
      is_anonymous
    } = reviewData;

    // Validate that the booking exists and belongs to the reviewer
    const booking = await Booking.findOne({
      _id: booking_id,
      renter_id: reviewer_id,
      status: 'completed'
    }).populate('listing_id');

    if (!booking) {
      throw new Error('Invalid booking or booking not completed');
    }

    if (booking.listing_id._id.toString() !== property_id.toString()) {
      throw new Error('Booking does not match the property');
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      property_id,
      reviewer_id
    });

    if (existingReview) {
      throw new Error('You have already reviewed this property');
    }

    // Create the review
    const review = new Review({
      property_id,
      reviewer_id,
      booking_id,
      rating,
      title,
      content,
      detailed_ratings: detailed_ratings || {},
      images: images || [],
      is_anonymous: is_anonymous || false,
      status: 'pending' // Reviews require moderation
    });

    await review.save();

    // Update property's average rating
    await this.updatePropertyRating(property_id);

    return await Review.findById(review._id)
      .populate('reviewer_id', 'first_name last_name profile_image')
      .populate('property_id', 'title images location');
  }

  /**
   * Get reviews for a property with filtering and pagination
   */
  async getPropertyReviews(propertyId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = -1,
      rating,
      withImages = false,
      status = 'approved'
    } = options;

    const skip = (page - 1) * limit;
    
    const query = {
      property_id: propertyId,
      status: status
    };

    // Filter by rating
    if (rating) {
      if (Array.isArray(rating)) {
        query.rating = { $in: rating };
      } else {
        query.rating = rating;
      }
    }

    // Filter reviews with images
    if (withImages) {
      query['images.0'] = { $exists: true };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const reviews = await Review.find(query)
      .populate('reviewer_id', 'first_name last_name profile_image verified')
      .populate('host_response.responded_by', 'first_name last_name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments(query);

    return {
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      hasNext: page < Math.ceil(totalReviews / limit),
      hasPrev: page > 1
    };
  }

  /**
   * Get reviews by user
   */
  async getUserReviews(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      status = 'approved'
    } = options;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      reviewer_id: userId,
      status: status
    })
    .populate('property_id', 'title images location owner')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

    const totalReviews = await Review.countDocuments({
      reviewer_id: userId,
      status: status
    });

    return {
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page
    };
  }

  /**
   * Update a review
   */
  async updateReview(reviewId, userId, updateData) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.reviewer_id.toString() !== userId.toString()) {
      throw new Error('Unauthorized to update this review');
    }

    // Only allow updates if review is pending or approved
    if (!['pending', 'approved'].includes(review.status)) {
      throw new Error('Cannot update this review');
    }

    const allowedUpdates = ['rating', 'title', 'content', 'detailed_ratings', 'images'];
    const updates = {};

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    // If significant changes, set status back to pending
    if (updates.rating || updates.content) {
      updates.status = 'pending';
    }

    Object.assign(review, updates);
    await review.save();

    // Update property rating if rating changed
    if (updates.rating) {
      await this.updatePropertyRating(review.property_id);
    }

    return await Review.findById(reviewId)
      .populate('reviewer_id', 'first_name last_name profile_image')
      .populate('property_id', 'title images location');
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId, userId) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.reviewer_id.toString() !== userId.toString()) {
      throw new Error('Unauthorized to delete this review');
    }

    const propertyId = review.property_id;
    await Review.findByIdAndDelete(reviewId);

    // Update property rating
    await this.updatePropertyRating(propertyId);

    return { success: true, message: 'Review deleted successfully' };
  }

  /**
   * Add helpful vote to a review
   */
  async addHelpfulVote(reviewId, userId, voteType) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.reviewer_id.toString() === userId.toString()) {
      throw new Error('Cannot vote on your own review');
    }

    if (!['helpful', 'not_helpful'].includes(voteType)) {
      throw new Error('Invalid vote type');
    }

    await review.addHelpfulVote(userId, voteType);

    return {
      helpful_count: review.helpful_count,
      not_helpful_count: review.not_helpful_count,
      user_vote: voteType
    };
  }

  /**
   * Add host response to a review
   */
  async addHostResponse(reviewId, hostId, content) {
    const review = await Review.findById(reviewId)
      .populate('property_id', 'owner');

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.property_id.owner.toString() !== hostId.toString()) {
      throw new Error('Only property owner can respond to reviews');
    }

    if (review.host_response && review.host_response.content) {
      throw new Error('Host has already responded to this review');
    }

    await review.addHostResponse(content, hostId);

    return await Review.findById(reviewId)
      .populate('reviewer_id', 'first_name last_name profile_image')
      .populate('host_response.responded_by', 'first_name last_name');
  }

  /**
   * Get review statistics for a property
   */
  async getPropertyReviewStats(propertyId) {
    return await Review.getPropertyStats(propertyId);
  }

  /**
   * Get trending reviews
   */
  async getTrendingReviews(limit = 10) {
    return await Review.getTrendingReviews(limit);
  }

  /**
   * Moderate a review (admin only)
   */
  async moderateReview(reviewId, moderatorId, status, reason) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    const validStatuses = ['approved', 'rejected', 'flagged'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid moderation status');
    }

    await review.moderate(status, reason, moderatorId);

    // Update property rating if approved/rejected
    if (['approved', 'rejected'].includes(status)) {
      await this.updatePropertyRating(review.property_id);
    }

    return review;
  }

  /**
   * Get reviews requiring moderation
   */
  async getPendingReviews(options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 1
    } = options;

    const skip = (page - 1) * limit;
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const reviews = await Review.find({ status: 'pending' })
      .populate('reviewer_id', 'first_name last_name profile_image email')
      .populate('property_id', 'title images location owner')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ status: 'pending' });

    return {
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page
    };
  }

  /**
   * Update property's average rating
   */
  async updatePropertyRating(propertyId) {
    const stats = await Review.getPropertyStats(propertyId);
    
    await Listing.findByIdAndUpdate(propertyId, {
      'metrics.rating.average': stats.averageRating,
      'metrics.rating.count': stats.totalReviews,
      'metrics.rating.breakdown': stats.ratingBreakdown
    });

    return stats;
  }

  /**
   * Search reviews
   */
  async searchReviews(searchQuery, options = {}) {
    const {
      page = 1,
      limit = 10,
      propertyId,
      rating,
      sortBy = 'relevance'
    } = options;

    const skip = (page - 1) * limit;

    const query = {
      status: 'approved',
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    if (propertyId) {
      query.property_id = propertyId;
    }

    if (rating) {
      query.rating = rating;
    }

    let sortOptions = {};
    
    if (sortBy === 'relevance') {
      // Text score for relevance
      sortOptions = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'rating') {
      sortOptions = { rating: -1, created_at: -1 };
    } else if (sortBy === 'helpful') {
      sortOptions = { helpful_count: -1, created_at: -1 };
    } else {
      sortOptions = { created_at: -1 };
    }

    const reviews = await Review.find(query)
      .populate('reviewer_id', 'first_name last_name profile_image')
      .populate('property_id', 'title images location')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments(query);

    return {
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      searchQuery
    };
  }

  /**
   * Get review analytics for property owner
   */
  async getPropertyReviewAnalytics(propertyId, ownerId) {
    // Verify property ownership
    const property = await Listing.findOne({
      _id: propertyId,
      owner: ownerId
    });

    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    const [
      stats,
      recentReviews,
      ratingTrends,
      responseRate
    ] = await Promise.all([
      this.getPropertyReviewStats(propertyId),
      this.getPropertyReviews(propertyId, { limit: 5, sortBy: 'created_at', sortOrder: -1 }),
      this.getRatingTrends(propertyId),
      this.getHostResponseRate(propertyId)
    ]);

    return {
      stats,
      recentReviews: recentReviews.reviews,
      ratingTrends,
      responseRate,
      totalEarnings: await this.calculateReviewEarnings(propertyId),
      improvementAreas: await this.getImprovementAreas(propertyId)
    };
  }

  /**
   * Get rating trends over time
   */
  async getRatingTrends(propertyId, months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trends = await Review.aggregate([
      {
        $match: {
          property_id: new mongoose.Types.ObjectId(propertyId),
          status: 'approved',
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    return trends.map(trend => ({
      period: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
      averageRating: Math.round(trend.averageRating * 10) / 10,
      totalReviews: trend.totalReviews
    }));
  }

  /**
   * Get host response rate
   */
  async getHostResponseRate(propertyId) {
    const [totalReviews, respondedReviews] = await Promise.all([
      Review.countDocuments({
        property_id: propertyId,
        status: 'approved'
      }),
      Review.countDocuments({
        property_id: propertyId,
        status: 'approved',
        'host_response.content': { $exists: true, $ne: '' }
      })
    ]);

    return {
      total: totalReviews,
      responded: respondedReviews,
      rate: totalReviews > 0 ? Math.round((respondedReviews / totalReviews) * 100) : 0
    };
  }

  /**
   * Calculate review-based earnings impact
   */
  async calculateReviewEarnings(propertyId) {
    // This would integrate with booking data to show revenue impact
    // For now, return placeholder calculation
    const stats = await this.getPropertyReviewStats(propertyId);
    const baseRate = 100; // Base nightly rate
    
    const ratingMultiplier = stats.averageRating >= 4.5 ? 1.2 : 
                           stats.averageRating >= 4.0 ? 1.1 : 
                           stats.averageRating >= 3.5 ? 1.0 : 0.9;

    return {
      estimatedIncrease: Math.round((ratingMultiplier - 1) * 100),
      potentialRevenue: baseRate * ratingMultiplier * 30 // 30 days estimate
    };
  }

  /**
   * Get improvement areas based on detailed ratings
   */
  async getImprovementAreas(propertyId) {
    const reviews = await Review.find({
      property_id: propertyId,
      status: 'approved',
      'detailed_ratings.cleanliness': { $exists: true }
    }).select('detailed_ratings rating');

    if (reviews.length === 0) {
      return [];
    }

    const categories = ['cleanliness', 'communication', 'location', 'value', 'amenities', 'checkin'];
    const averages = {};

    categories.forEach(category => {
      const ratings = reviews
        .map(r => r.detailed_ratings[category])
        .filter(r => r !== null && r !== undefined);
      
      if (ratings.length > 0) {
        averages[category] = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      }
    });

    // Find categories below overall average
    const overallAverage = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    return Object.entries(averages)
      .filter(([_, avg]) => avg < overallAverage - 0.2)
      .map(([category, average]) => ({
        category,
        average: Math.round(average * 10) / 10,
        improvement: Math.round((overallAverage - average) * 10) / 10
      }))
      .sort((a, b) => b.improvement - a.improvement);
  }
}

module.exports = new ReviewService();