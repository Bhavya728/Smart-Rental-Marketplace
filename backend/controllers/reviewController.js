const reviewService = require('../services/reviewService');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for review image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/reviews');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `review-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed'));
    }
  }
});

class ReviewController {
  /**
   * Create a new review
   */
  async createReview(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        property_id,
        booking_id,
        rating,
        title,
        content,
        detailed_ratings,
        is_anonymous
      } = req.body;

      // Process uploaded images
      let images = [];
      if (req.files && req.files.length > 0) {
        images = req.files.map(file => ({
          url: `/uploads/reviews/${file.filename}`,
          caption: req.body[`image_caption_${file.fieldname}`] || ''
        }));
      }

      const reviewData = {
        property_id,
        reviewer_id: req.user.id,
        booking_id,
        rating: parseFloat(rating),
        title,
        content,
        detailed_ratings: detailed_ratings ? JSON.parse(detailed_ratings) : {},
        images,
        is_anonymous: is_anonymous === 'true'
      };

      const review = await reviewService.createReview(reviewData);

      res.status(201).json({
        success: true,
        message: 'Review created successfully and is pending approval',
        data: { review }
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create review'
      });
    }
  }

  /**
   * Get reviews for a property
   */
  async getPropertyReviews(req, res) {
    try {
      const { propertyId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = -1,
        rating,
        withImages = false
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder: parseInt(sortOrder),
        rating: rating ? (Array.isArray(rating) ? rating.map(Number) : Number(rating)) : undefined,
        withImages: withImages === 'true'
      };

      const result = await reviewService.getPropertyReviews(propertyId, options);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get property reviews error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch reviews'
      });
    }
  }

  /**
   * Get property review statistics
   */
  async getPropertyReviewStats(req, res) {
    try {
      const { propertyId } = req.params;
      const stats = await reviewService.getPropertyReviewStats(propertyId);

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Get property review stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch review statistics'
      });
    }
  }

  /**
   * Get reviews by user
   */
  async getUserReviews(req, res) {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 10,
        status = 'approved'
      } = req.query;

      // Users can only see their own reviews, admins can see any
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access these reviews'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      };

      const result = await reviewService.getUserReviews(userId, options);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch user reviews'
      });
    }
  }

  /**
   * Update a review
   */
  async updateReview(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { reviewId } = req.params;
      const updateData = req.body;

      // Handle detailed ratings if provided as string
      if (updateData.detailed_ratings && typeof updateData.detailed_ratings === 'string') {
        updateData.detailed_ratings = JSON.parse(updateData.detailed_ratings);
      }

      const review = await reviewService.updateReview(reviewId, req.user.id, updateData);

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: { review }
      });

    } catch (error) {
      console.error('Update review error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update review'
      });
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const result = await reviewService.deleteReview(reviewId, req.user.id);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete review'
      });
    }
  }

  /**
   * Add helpful vote to a review
   */
  async voteHelpful(req, res) {
    try {
      const { reviewId } = req.params;
      const { vote } = req.body; // 'helpful' or 'not_helpful'

      if (!['helpful', 'not_helpful'].includes(vote)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vote type. Must be "helpful" or "not_helpful"'
        });
      }

      const result = await reviewService.addHelpfulVote(reviewId, req.user.id, vote);

      res.json({
        success: true,
        message: 'Vote recorded successfully',
        data: result
      });

    } catch (error) {
      console.error('Vote helpful error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to record vote'
      });
    }
  }

  /**
   * Add host response to a review
   */
  async addHostResponse(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { reviewId } = req.params;
      const { content } = req.body;

      const review = await reviewService.addHostResponse(reviewId, req.user.id, content);

      res.json({
        success: true,
        message: 'Host response added successfully',
        data: { review }
      });

    } catch (error) {
      console.error('Add host response error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add host response'
      });
    }
  }

  /**
   * Get trending reviews
   */
  async getTrendingReviews(req, res) {
    try {
      const { limit = 10 } = req.query;
      const reviews = await reviewService.getTrendingReviews(parseInt(limit));

      res.json({
        success: true,
        data: { reviews }
      });

    } catch (error) {
      console.error('Get trending reviews error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch trending reviews'
      });
    }
  }

  /**
   * Search reviews
   */
  async searchReviews(req, res) {
    try {
      const {
        q: searchQuery,
        page = 1,
        limit = 10,
        propertyId,
        rating,
        sortBy = 'relevance'
      } = req.query;

      if (!searchQuery || searchQuery.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        propertyId,
        rating: rating ? Number(rating) : undefined,
        sortBy
      };

      const result = await reviewService.searchReviews(searchQuery.trim(), options);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Search reviews error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search reviews'
      });
    }
  }

  /**
   * Get property review analytics (for property owners)
   */
  async getPropertyReviewAnalytics(req, res) {
    try {
      const { propertyId } = req.params;
      const analytics = await reviewService.getPropertyReviewAnalytics(propertyId, req.user.id);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get property review analytics error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch review analytics'
      });
    }
  }

  // Admin-only endpoints

  /**
   * Get pending reviews for moderation
   */
  async getPendingReviews(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 1
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder: parseInt(sortOrder)
      };

      const result = await reviewService.getPendingReviews(options);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get pending reviews error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch pending reviews'
      });
    }
  }

  /**
   * Moderate a review (approve, reject, flag)
   */
  async moderateReview(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { reviewId } = req.params;
      const { status, reason } = req.body;

      const review = await reviewService.moderateReview(reviewId, req.user.id, status, reason);

      res.json({
        success: true,
        message: `Review ${status} successfully`,
        data: { review }
      });

    } catch (error) {
      console.error('Moderate review error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to moderate review'
      });
    }
  }

  /**
   * Get review by ID (with proper authorization)
   */
  async getReviewById(req, res) {
    try {
      const { reviewId } = req.params;
      const Review = require('../models/Review');

      const review = await Review.findById(reviewId)
        .populate('reviewer_id', 'first_name last_name profile_image')
        .populate('property_id', 'title images location owner_id')
        .populate('host_response.responded_by', 'first_name last_name');

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check authorization
      const canView = review.status === 'approved' ||
                     review.reviewer_id._id.toString() === req.user.id ||
                     review.property_id.owner_id.toString() === req.user.id ||
                     req.user.role === 'admin';

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this review'
        });
      }

      res.json({
        success: true,
        data: { review }
      });

    } catch (error) {
      console.error('Get review by ID error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch review'
      });
    }
  }
}

// Export controller instance and upload middleware
const reviewController = new ReviewController();

module.exports = {
  reviewController,
  upload
};