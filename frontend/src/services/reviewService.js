import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ReviewService {
  /**
   * Create a new review
   */
  async createReview(reviewData, images = []) {
    try {
      const formData = new FormData();
      
      // Add text data
      Object.keys(reviewData).forEach(key => {
        if (key === 'detailed_ratings' && typeof reviewData[key] === 'object') {
          formData.append(key, JSON.stringify(reviewData[key]));
        } else {
          formData.append(key, reviewData[key]);
        }
      });
      
      // Add images
      images.forEach((image, index) => {
        formData.append('images', image.file);
        if (image.caption) {
          formData.append(`image_caption_images`, image.caption);
        }
      });

      const response = await apiClient.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get reviews for a property
   */
  async getPropertyReviews(propertyId, options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== null) {
          if (Array.isArray(options[key])) {
            options[key].forEach(value => params.append(key, value));
          } else {
            params.set(key, options[key]);
          }
        }
      });

      const response = await apiClient.get(`/reviews/property/${propertyId}?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get review statistics for a property
   */
  async getPropertyReviewStats(propertyId) {
    try {
      const response = await apiClient.get(`/reviews/property/${propertyId}/stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId) {
    try {
      const response = await apiClient.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a review
   */
  async updateReview(reviewId, updateData) {
    try {
      const response = await apiClient.put(`/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId) {
    try {
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Vote on review helpfulness
   */
  async voteHelpful(reviewId, voteType) {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/vote`, {
        vote: voteType
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add host response to review
   */
  async addHostResponse(reviewId, content) {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/response`, {
        content
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get reviews by user
   */
  async getUserReviews(userId, options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== null) {
          params.set(key, options[key]);
        }
      });

      const response = await apiClient.get(`/reviews/user/${userId}?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get trending reviews
   */
  async getTrendingReviews(limit = 10) {
    try {
      const response = await apiClient.get(`/reviews/trending?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search reviews
   */
  async searchReviews(query, options = {}) {
    try {
      const params = new URLSearchParams();
      params.set('q', query);
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== null) {
          params.set(key, options[key]);
        }
      });

      const response = await apiClient.get(`/reviews/search?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get property review analytics (for property owners)
   */
  async getPropertyReviewAnalytics(propertyId) {
    try {
      const response = await apiClient.get(`/reviews/property/${propertyId}/analytics`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin methods

  /**
   * Get pending reviews for moderation
   */
  async getPendingReviews(options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== null) {
          params.set(key, options[key]);
        }
      });

      const response = await apiClient.get(`/reviews/admin/pending?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Moderate a review
   */
  async moderateReview(reviewId, status, reason) {
    try {
      const response = await apiClient.put(`/reviews/${reviewId}/moderate`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods

  /**
   * Validate review data before submission
   */
  validateReview(reviewData) {
    const errors = [];

    if (!reviewData.property_id) {
      errors.push('Property ID is required');
    }

    if (!reviewData.booking_id) {
      errors.push('Booking ID is required');
    }

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }

    if (!reviewData.title || reviewData.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }

    if (reviewData.title && reviewData.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    if (!reviewData.content || reviewData.content.trim().length < 10) {
      errors.push('Review content must be at least 10 characters long');
    }

    if (reviewData.content && reviewData.content.length > 2000) {
      errors.push('Review content must be less than 2000 characters');
    }

    // Validate detailed ratings if provided
    if (reviewData.detailed_ratings) {
      const validCategories = ['cleanliness', 'communication', 'location', 'value', 'amenities', 'checkin'];
      Object.keys(reviewData.detailed_ratings).forEach(category => {
        if (!validCategories.includes(category)) {
          errors.push(`Invalid rating category: ${category}`);
        }
        
        const rating = reviewData.detailed_ratings[category];
        if (rating !== null && (rating < 1 || rating > 5)) {
          errors.push(`${category} rating must be between 1 and 5`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format review data for display
   */
  formatReviewForDisplay(review) {
    return {
      ...review,
      created_at: new Date(review.created_at),
      updated_at: new Date(review.updated_at),
      formatted_date: this.formatDate(review.created_at),
      time_ago: this.getTimeAgo(review.created_at),
      rating_percentage: (review.rating / 5) * 100,
      helpfulness_ratio: review.helpful_count + review.not_helpful_count > 0 
        ? (review.helpful_count / (review.helpful_count + review.not_helpful_count)) * 100 
        : 0
    };
  }

  /**
   * Calculate average rating from detailed ratings
   */
  calculateDetailedAverage(detailedRatings) {
    const ratings = Object.values(detailedRatings || {}).filter(r => r !== null && r !== undefined);
    return ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;
  }

  /**
   * Get rating distribution percentages
   */
  getRatingDistribution(stats) {
    const total = stats.totalReviews || 0;
    if (total === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    const distribution = {};
    [5, 4, 3, 2, 1].forEach(rating => {
      distribution[rating] = Math.round(((stats.ratingBreakdown?.[rating] || 0) / total) * 100);
    });

    return distribution;
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else if (diffDays <= 30) {
      return `${Math.ceil(diffDays / 7)} weeks ago`;
    } else if (diffDays <= 365) {
      return `${Math.ceil(diffDays / 30)} months ago`;
    } else {
      return reviewDate.toLocaleDateString();
    }
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffTime = now - reviewDate;
    
    const minutes = Math.floor(diffTime / (1000 * 60));
    const hours = Math.floor(diffTime / (1000 * 60 * 60));
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (data?.message) {
        return new Error(data.message);
      } else if (data?.errors) {
        return new Error(data.errors.map(err => err.msg).join(', '));
      } else {
        return new Error(`HTTP ${status}: ${error.response.statusText}`);
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection and try again.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Generate review summary
   */
  generateReviewSummary(reviews) {
    if (!reviews || reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        highlights: [],
        improvements: []
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    
    // Rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const roundedRating = Math.round(review.rating);
      distribution[roundedRating] = (distribution[roundedRating] || 0) + 1;
    });

    // Convert to percentages
    Object.keys(distribution).forEach(rating => {
      distribution[rating] = Math.round((distribution[rating] / totalReviews) * 100);
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      distribution,
      highlights: this.extractHighlights(reviews),
      improvements: this.extractImprovements(reviews)
    };
  }

  /**
   * Extract positive highlights from reviews
   */
  extractHighlights(reviews) {
    const highRatingReviews = reviews.filter(r => r.rating >= 4);
    if (highRatingReviews.length === 0) return [];

    // Extract common positive keywords
    const positiveWords = {};
    const commonPhrases = [
      'clean', 'comfortable', 'spacious', 'beautiful', 'excellent', 'amazing',
      'perfect', 'convenient', 'friendly', 'helpful', 'quiet', 'peaceful'
    ];

    highRatingReviews.forEach(review => {
      const words = review.content.toLowerCase().split(/\W+/);
      commonPhrases.forEach(phrase => {
        if (words.includes(phrase)) {
          positiveWords[phrase] = (positiveWords[phrase] || 0) + 1;
        }
      });
    });

    return Object.entries(positiveWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count, percentage: Math.round((count / highRatingReviews.length) * 100) }));
  }

  /**
   * Extract improvement areas from reviews
   */
  extractImprovements(reviews) {
    const lowRatingReviews = reviews.filter(r => r.rating <= 3);
    if (lowRatingReviews.length === 0) return [];

    // Extract common negative keywords
    const negativeWords = {};
    const commonIssues = [
      'dirty', 'noise', 'noisy', 'small', 'uncomfortable', 'broken', 'outdated',
      'rude', 'unfriendly', 'expensive', 'overpriced', 'difficult', 'problem'
    ];

    lowRatingReviews.forEach(review => {
      const words = review.content.toLowerCase().split(/\W+/);
      commonIssues.forEach(issue => {
        if (words.includes(issue)) {
          negativeWords[issue] = (negativeWords[issue] || 0) + 1;
        }
      });
    });

    return Object.entries(negativeWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word, count]) => ({ word, count, percentage: Math.round((count / lowRatingReviews.length) * 100) }));
  }
}

export const reviewService = new ReviewService();
export default reviewService;