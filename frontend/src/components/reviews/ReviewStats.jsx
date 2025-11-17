import React from 'react';
import RatingStars from './RatingStars';

const ReviewStats = ({ 
  stats, 
  className = "" 
}) => {
  const {
    totalReviews = 0,
    averageRating = 0,
    ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    averageDetailedRatings = {}
  } = stats || {};

  const getRatingPercentage = (rating) => {
    return totalReviews > 0 
      ? Math.round((ratingBreakdown[rating] / totalReviews) * 100)
      : 0;
  };

  const detailedRatingLabels = {
    cleanliness: 'Cleanliness',
    communication: 'Communication', 
    location: 'Location',
    value: 'Value',
    amenities: 'Amenities',
    checkin: 'Check-in'
  };

  if (totalReviews === 0) {
    return (
      <div className={`review-stats empty ${className}`}>
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Be the first to leave a review!</p>
        </div>

        <style jsx>{`
          .review-stats.empty {
            padding: 2rem;
            text-align: center;
            background: #f9fafb;
            border-radius: 0.5rem;
            border: 2px dashed #d1d5db;
          }

          .empty-state {
            color: #6b7280;
          }

          .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }

          .empty-state h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
          }

          .empty-state p {
            margin: 0;
            font-size: 0.875rem;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .review-stats.empty {
              background: #374151;
              border-color: #4b5563;
            }

            .empty-state h3 {
              color: #f3f4f6;
            }

            .empty-state {
              color: #9ca3af;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`review-stats ${className}`}>
      {/* Overall Rating Summary */}
      <div className="overall-rating">
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            <div className="rating-stars">
              <RatingStars rating={averageRating} size="lg" showNumber={false} />
            </div>
          </div>
          <div className="review-count">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="rating-bar">
              <span className="rating-label">{rating}</span>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${getRatingPercentage(rating)}%` 
                  }}
                />
              </div>
              <span className="rating-count">
                {ratingBreakdown[rating] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Ratings */}
      {Object.keys(averageDetailedRatings).length > 0 && (
        <div className="detailed-ratings">
          <h4>Detailed Ratings</h4>
          <div className="detailed-grid">
            {Object.entries(averageDetailedRatings).map(([category, rating]) => (
              <div key={category} className="detailed-item">
                <div className="detailed-label">
                  {detailedRatingLabels[category] || category}
                </div>
                <div className="detailed-rating">
                  <RatingStars 
                    rating={rating} 
                    size="sm" 
                    showNumber={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .review-stats {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .overall-rating {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .rating-summary {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 120px;
        }

        .average-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .rating-number {
          font-size: 3rem;
          font-weight: 700;
          color: #111827;
          line-height: 1;
        }

        .review-count {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .rating-distribution {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .rating-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .rating-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          min-width: 12px;
          text-align: right;
        }

        .bar-container {
          flex: 1;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .rating-count {
          font-size: 0.875rem;
          color: #6b7280;
          min-width: 24px;
          text-align: right;
        }

        .detailed-ratings {
          border-top: 1px solid #e5e7eb;
          padding-top: 1.5rem;
        }

        .detailed-ratings h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .detailed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detailed-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .detailed-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .detailed-rating {
          flex-shrink: 0;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .review-stats {
            background: #1f2937;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          }

          .rating-number {
            color: #f9fafb;
          }

          .review-count,
          .rating-count {
            color: #9ca3af;
          }

          .rating-label,
          .detailed-label {
            color: #e5e7eb;
          }

          .bar-container {
            background: #374151;
          }

          .detailed-ratings {
            border-top-color: #374151;
          }

          .detailed-ratings h4 {
            color: #f9fafb;
          }

          .detailed-item {
            background: #374151;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .review-stats {
            padding: 1rem;
          }

          .overall-rating {
            flex-direction: column;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .rating-summary {
            min-width: auto;
          }

          .rating-number {
            font-size: 2.5rem;
          }

          .detailed-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .detailed-item {
            padding: 0.625rem;
          }
        }

        @media (max-width: 480px) {
          .rating-bar {
            gap: 0.5rem;
          }

          .bar-container {
            min-width: 100px;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .bar-fill {
            background: #ff6b00;
          }

          .rating-number {
            color: #000000;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
          }

          .detailed-item {
            border: 1px solid currentColor;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewStats;