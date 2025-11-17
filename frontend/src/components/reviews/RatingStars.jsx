import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const RatingStars = ({ 
  rating = 0, 
  size = 'md', 
  showNumber = true, 
  interactive = false, 
  onChange,
  className = "" 
}) => {
  const sizes = {
    xs: { star: 12, text: '0.75rem' },
    sm: { star: 16, text: '0.875rem' },
    md: { star: 20, text: '1rem' },
    lg: { star: 24, text: '1.125rem' },
    xl: { star: 32, text: '1.25rem' }
  };

  const { star: starSize, text: textSize } = sizes[size] || sizes.md;

  const handleStarClick = (starRating) => {
    if (interactive && onChange) {
      onChange(starRating);
    }
  };

  const renderStar = (position) => {
    const starRating = position + 1;
    const fillPercentage = Math.max(0, Math.min(100, (rating - position) * 100));
    const isHovered = interactive && starRating <= Math.ceil(rating);

    return (
      <div
        key={position}
        className={`star-container ${interactive ? 'interactive' : ''}`}
        onClick={() => handleStarClick(starRating)}
        onMouseEnter={() => interactive && onChange && onChange(starRating)}
      >
        <div className="star-background">
          <Star 
            size={starSize} 
            className="star-outline" 
          />
        </div>
        <div 
          className="star-fill"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star 
            size={starSize} 
            className="star-filled" 
            fill="currentColor"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`rating-stars ${className}`}>
      <div className="stars-container">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>
      
      {showNumber && (
        <span className="rating-number">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      )}

      <style jsx>{`
        .rating-stars {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stars-container {
          display: flex;
          align-items: center;
          gap: 0.125rem;
        }

        .star-container {
          position: relative;
          display: inline-block;
          cursor: ${interactive ? 'pointer' : 'default'};
          transition: transform 0.2s ease;
        }

        .star-container.interactive:hover {
          transform: scale(1.1);
        }

        .star-background {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .star-outline {
          color: #e5e7eb;
          transition: color 0.2s ease;
        }

        .star-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .star-filled {
          color: #fbbf24;
          margin-left: 0;
        }

        .rating-number {
          font-size: ${textSize};
          font-weight: 600;
          color: #374151;
          min-width: 2rem;
          text-align: left;
        }

        /* Interactive states */
        .star-container.interactive .star-outline:hover {
          color: #fbbf24;
        }

        /* Accessibility improvements */
        .star-container.interactive {
          border-radius: 0.25rem;
          padding: 0.125rem;
        }

        .star-container.interactive:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .star-outline {
            color: #4b5563;
          }

          .rating-number {
            color: #f3f4f6;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .star-outline {
            color: #000000;
          }

          .star-filled {
            color: #ff6b00;
          }

          .rating-number {
            color: #000000;
            font-weight: 700;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .star-container,
          .star-outline,
          .star-filled {
            transition: none;
          }

          .star-container.interactive:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default RatingStars;