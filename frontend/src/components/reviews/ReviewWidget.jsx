import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import RatingStars from './RatingStars';

const ReviewWidget = ({ 
  propertyId, 
  stats, 
  showViewAll = true, 
  showWriteReview = true,
  className = "",
  size = "default" 
}) => {
  if (!stats || stats.total_reviews === 0) {
    return (
      <div className={`review-widget no-reviews ${className}`}>
        <div className="no-reviews-content">
          <Star className="no-reviews-icon" />
          <h3 className="no-reviews-title">No reviews yet</h3>
          <p className="no-reviews-text">Be the first to share your experience!</p>
          {showWriteReview && (
            <Link
              to={`/properties/${propertyId}/reviews?write=true`}
              className="write-review-link"
            >
              Write a Review
            </Link>
          )}
        </div>
        
        <style jsx>{`
          .review-widget.no-reviews {
            text-align: center;
            padding: ${size === 'compact' ? '1.5rem' : '2rem'};
            background: white;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
          }

          .no-reviews-icon {
            width: ${size === 'compact' ? '2rem' : '3rem'};
            height: ${size === 'compact' ? '2rem' : '3rem'};
            color: #d1d5db;
            margin: 0 auto ${size === 'compact' ? '0.75rem' : '1rem'};
          }

          .no-reviews-title {
            font-size: ${size === 'compact' ? '1rem' : '1.125rem'};
            font-weight: 600;
            color: #111827;
            margin: 0 0 ${size === 'compact' ? '0.25rem' : '0.5rem'} 0;
          }

          .no-reviews-text {
            font-size: ${size === 'compact' ? '0.8125rem' : '0.875rem'};
            color: #6b7280;
            margin: 0 0 ${size === 'compact' ? '0.75rem' : '1rem'} 0;
          }

          .write-review-link {
            display: inline-flex;
            align-items: center;
            padding: ${size === 'compact' ? '0.5rem 0.75rem' : '0.625rem 1rem'};
            background: #3b82f6;
            color: white;
            border-radius: 0.375rem;
            text-decoration: none;
            font-size: ${size === 'compact' ? '0.8125rem' : '0.875rem'};
            font-weight: 500;
            transition: background-color 0.2s ease;
          }

          .write-review-link:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`review-widget has-reviews ${className}`}>
      <div className="widget-header">
        <h3 className="widget-title">Reviews</h3>
        {showViewAll && (
          <Link to={`/properties/${propertyId}/reviews`} className="view-all-link">
            <span>View all {stats.total_reviews}</span>
            <ChevronRight className="view-all-icon" />
          </Link>
        )}
      </div>

      <div className="rating-summary">
        <div className="rating-main">
          <div className="rating-score">{stats.average_rating.toFixed(1)}</div>
          <div className="rating-details">
            <RatingStars 
              rating={stats.average_rating} 
              size={size === 'compact' ? 'sm' : 'md'} 
              showNumber={false}
            />
            <div className="rating-count">
              {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {size !== 'compact' && stats.rating_breakdown && (
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.rating_breakdown[rating] || 0;
              const percentage = stats.total_reviews > 0 
                ? (count / stats.total_reviews) * 100 
                : 0;
              
              return (
                <div key={rating} className="breakdown-row">
                  <div className="breakdown-label">
                    <span>{rating}</span>
                    <Star className="breakdown-star" />
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="breakdown-count">{count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showWriteReview && (
        <div className="widget-actions">
          <Link
            to={`/properties/${propertyId}/reviews?write=true`}
            className="write-review-button"
          >
            Write a Review
          </Link>
        </div>
      )}

      <style jsx>{`
        .review-widget.has-reviews {
          background: white;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          padding: ${size === 'compact' ? '1rem' : '1.5rem'};
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${size === 'compact' ? '0.75rem' : '1rem'};
        }

        .widget-title {
          font-size: ${size === 'compact' ? '1rem' : '1.125rem'};
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #3b82f6;
          text-decoration: none;
          font-size: ${size === 'compact' ? '0.8125rem' : '0.875rem'};
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-all-link:hover {
          color: #2563eb;
        }

        .view-all-icon {
          width: 0.875rem;
          height: 0.875rem;
        }

        .rating-summary {
          display: flex;
          flex-direction: column;
          gap: ${size === 'compact' ? '0.75rem' : '1rem'};
        }

        .rating-main {
          display: flex;
          align-items: center;
          gap: ${size === 'compact' ? '0.75rem' : '1rem'};
        }

        .rating-score {
          font-size: ${size === 'compact' ? '1.75rem' : '2.5rem'};
          font-weight: 700;
          color: #111827;
          line-height: 1;
        }

        .rating-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .rating-count {
          font-size: ${size === 'compact' ? '0.75rem' : '0.8125rem'};
          color: #6b7280;
        }

        .rating-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .breakdown-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
        }

        .breakdown-label {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          min-width: 2rem;
          color: #374151;
        }

        .breakdown-star {
          width: 0.75rem;
          height: 0.75rem;
          color: #fbbf24;
          fill: currentColor;
        }

        .breakdown-bar {
          flex: 1;
          height: 0.375rem;
          background: #f3f4f6;
          border-radius: 0.1875rem;
          overflow: hidden;
        }

        .breakdown-fill {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          border-radius: 0.1875rem;
          transition: width 0.3s ease;
        }

        .breakdown-count {
          min-width: 1.5rem;
          text-align: right;
          color: #6b7280;
        }

        .widget-actions {
          margin-top: ${size === 'compact' ? '0.75rem' : '1rem'};
          padding-top: ${size === 'compact' ? '0.75rem' : '1rem'};
          border-top: 1px solid #f3f4f6;
        }

        .write-review-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: ${size === 'compact' ? '0.5rem 0.75rem' : '0.75rem 1rem'};
          background: #f8fafc;
          color: #3b82f6;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: ${size === 'compact' ? '0.8125rem' : '0.875rem'};
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .write-review-button:hover {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .review-widget.has-reviews,
          .review-widget.no-reviews {
            background: #1f2937;
            border-color: #374151;
          }

          .widget-title,
          .no-reviews-title,
          .rating-score {
            color: #f9fafb;
          }

          .rating-count,
          .no-reviews-text,
          .breakdown-count {
            color: #9ca3af;
          }

          .breakdown-label {
            color: #e5e7eb;
          }

          .breakdown-bar {
            background: #374151;
          }

          .widget-actions {
            border-color: #374151;
          }

          .write-review-button {
            background: #374151;
            border-color: #4b5563;
            color: #60a5fa;
          }

          .write-review-button:hover {
            background: #4b5563;
            border-color: #60a5fa;
          }

          .write-review-link {
            background: #3b82f6;
          }

          .write-review-link:hover {
            background: #2563eb;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .rating-main {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 0.5rem;
          }

          .breakdown-row {
            gap: 0.375rem;
          }

          .breakdown-label {
            min-width: 1.5rem;
          }

          .breakdown-count {
            min-width: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewWidget;