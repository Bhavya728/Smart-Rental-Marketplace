import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Flag } from 'lucide-react';

/**
 * RatingDisplay Component
 * Displays star ratings with breakdown and review statistics
 */
const RatingDisplay = ({
  rating = 0,
  totalReviews = 0,
  ratingBreakdown = null, // Object with 1-5 star counts
  size = 'md', // sm, md, lg
  showBreakdown = true,
  showReviews = true,
  reviews = [], // Array of review objects for display
  onViewAllReviews,
  className = ''
}) => {
  const [selectedRating, setSelectedRating] = useState(null);

  // Size configurations
  const sizeConfig = {
    sm: { star: 16, text: 'text-sm', number: 'text-lg' },
    md: { star: 20, text: 'text-base', number: 'text-2xl' },
    lg: { star: 24, text: 'text-lg', number: 'text-3xl' }
  };

  // Generate stars array
  const generateStars = (rating, interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      let starType = 'empty';
      if (i <= fullStars) {
        starType = 'full';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starType = 'half';
      }

      stars.push(
        <motion.div
          key={i}
          whileHover={interactive ? { scale: 1.1 } : {}}
          whileTap={interactive ? { scale: 0.95 } : {}}
          className={interactive ? 'cursor-pointer' : ''}
          onClick={interactive ? () => setSelectedRating(i) : undefined}
        >
          <Star
            size={sizeConfig[size].star}
            className={`
              ${starType === 'full' ? 'text-yellow-400 fill-yellow-400' : ''}
              ${starType === 'half' ? 'text-yellow-400 fill-yellow-400' : ''}
              ${starType === 'empty' ? 'text-gray-300' : ''}
              transition-colors duration-200
            `}
            style={
              starType === 'half'
                ? {
                    background: 'linear-gradient(90deg, #FDE047 50%, #D1D5DB 50%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }
                : {}
            }
          />
        </motion.div>
      );
    }

    return stars;
  };

  // Calculate rating breakdown percentages
  const calculateBreakdownPercentages = () => {
    if (!ratingBreakdown || totalReviews === 0) return {};

    const percentages = {};
    for (let i = 1; i <= 5; i++) {
      const count = ratingBreakdown[i] || 0;
      percentages[i] = Math.round((count / totalReviews) * 100);
    }
    return percentages;
  };

  const breakdownPercentages = calculateBreakdownPercentages();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Rating */}
      <div className="text-center space-y-4">
        <div className={`${sizeConfig[size].number} font-bold text-gray-900`}>
          {rating.toFixed(1)}
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          {generateStars(rating)}
        </div>
        
        <div className={`${sizeConfig[size].text} text-gray-600`}>
          Based on {totalReviews.toLocaleString()} review{totalReviews !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Rating Breakdown */}
      {showBreakdown && ratingBreakdown && totalReviews > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Rating Breakdown</h4>
          
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center space-x-3">
              {/* Stars label */}
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm text-gray-600">{stars}</span>
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
              </div>

              {/* Progress bar */}
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdownPercentages[stars] || 0}%` }}
                  transition={{ duration: 0.8, delay: (5 - stars) * 0.1 }}
                />
              </div>

              {/* Count and percentage */}
              <div className="text-sm text-gray-600 w-12 text-right">
                {breakdownPercentages[stars] || 0}%
              </div>
              
              <div className="text-sm text-gray-500 w-8 text-right">
                {ratingBreakdown[stars] || 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Reviews */}
      {showReviews && reviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Recent Reviews</h4>
            {onViewAllReviews && totalReviews > reviews.length && (
              <button
                onClick={onViewAllReviews}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all {totalReviews} reviews
              </button>
            )}
          </div>

          <div className="space-y-4">
            {reviews.slice(0, 3).map((review, index) => (
              <ReviewCard key={review.id || index} review={review} />
            ))}
          </div>
        </div>
      )}

      {/* No Reviews State */}
      {totalReviews === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">No reviews yet</h4>
          <p className="text-sm">Be the first to leave a review!</p>
        </div>
      )}
    </div>
  );
};

/**
 * ReviewCard Component
 * Individual review display card
 */
const ReviewCard = ({ review, showActions = false, onReport, onLike }) => {
  const [isLiked, setIsLiked] = useState(review.isLiked || false);
  const [likeCount, setLikeCount] = useState(review.likeCount || 0);

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
    
    if (onLike) {
      onLike(review.id, newIsLiked);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-lg p-4 space-y-3"
    >
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {/* Reviewer Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>

          {/* Reviewer Info */}
          <div>
            <div className="font-medium text-gray-900">
              {review.reviewer?.name || 'Anonymous'}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>

        {/* Review Rating */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={16}
              className={`
                ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
              `}
            />
          ))}
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        {review.title && (
          <h5 className="font-medium text-gray-900">{review.title}</h5>
        )}
        
        <p className="text-gray-700 leading-relaxed">
          {review.comment}
        </p>

        {/* Review Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Review Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`
                flex items-center space-x-1 text-sm transition-colors duration-200
                ${isLiked ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}
              `}
            >
              <ThumbsUp size={16} className={isLiked ? 'fill-current' : ''} />
              <span>{likeCount > 0 ? likeCount : ''}</span>
            </button>

            {/* Helpful indicator */}
            {review.helpfulCount > 0 && (
              <span className="text-sm text-gray-500">
                {review.helpfulCount} found this helpful
              </span>
            )}
          </div>

          {/* Report Button */}
          {onReport && (
            <button
              onClick={() => onReport(review.id)}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              <Flag size={16} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

/**
 * RatingInput Component
 * Interactive rating input for leaving reviews
 */
export const RatingInput = ({
  rating = 0,
  onChange,
  size = 'md',
  disabled = false,
  showLabels = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  const sizeConfig = {
    sm: 20,
    md: 28,
    lg: 36
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileHover={!disabled ? { scale: 1.1 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            disabled={disabled}
            onClick={() => !disabled && onChange && onChange(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            className={`
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <Star
              size={sizeConfig[size]}
              className={`
                transition-colors duration-200
                ${(hoverRating || rating) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
                }
              `}
            />
          </motion.button>
        ))}
      </div>

      {/* Rating Label */}
      {showLabels && (hoverRating || rating) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-gray-700"
        >
          {labels[hoverRating || rating]}
        </motion.div>
      )}
    </div>
  );
};

export default RatingDisplay;