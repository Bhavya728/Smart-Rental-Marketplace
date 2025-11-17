import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Reply, MoreHorizontal, Flag, Edit, Trash2 } from 'lucide-react';
import RatingStars from './RatingStars';
import { useAuth } from '../../contexts/AuthContext';

const ReviewCard = ({ 
  review, 
  onVoteHelpful, 
  onReply, 
  onEdit, 
  onDelete, 
  onFlag,
  showProperty = false,
  className = "" 
}) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.not_helpful_count || 0);

  const {
    _id,
    reviewer_id,
    property_id,
    rating,
    title,
    content,
    detailed_ratings,
    images,
    host_response,
    is_anonymous,
    created_at,
    helpful_votes = []
  } = review;

  // Check if current user has voted
  const currentUserVote = helpful_votes.find(vote => 
    vote.user_id === user?.id || vote.user_id?._id === user?.id
  );

  React.useEffect(() => {
    if (currentUserVote) {
      setUserVote(currentUserVote.vote);
    }
  }, [currentUserVote]);

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please log in to vote on reviews');
      return;
    }

    try {
      const result = await onVoteHelpful(_id, voteType);
      setHelpfulCount(result.helpful_count);
      setNotHelpfulCount(result.not_helpful_count);
      setUserVote(voteType);
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to record vote. Please try again.');
    }
  };

  const formatDate = (date) => {
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
    } else {
      return reviewDate.toLocaleDateString();
    }
  };

  const canEdit = user?.id === reviewer_id?._id || user?.id === reviewer_id;
  const canDelete = canEdit || user?.role === 'admin';
  const isPropertyOwner = user?.id === property_id?.owner_id;

  const shouldTruncate = content.length > 200;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.substring(0, 200) + '...' 
    : content;

  const detailedRatingCategories = {
    cleanliness: 'Cleanliness',
    communication: 'Communication',
    location: 'Location',
    value: 'Value',
    amenities: 'Amenities',
    checkin: 'Check-in'
  };

  return (
    <div 
      className={`review-card ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Review Header */}
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            <img 
              src={
                is_anonymous 
                  ? '/default-avatar.png' 
                  : reviewer_id?.profile_image || '/default-avatar.png'
              } 
              alt={
                is_anonymous 
                  ? 'Anonymous user' 
                  : `${reviewer_id?.first_name} ${reviewer_id?.last_name}`
              }
            />
          </div>
          <div className="reviewer-details">
            <div className="reviewer-name">
              {is_anonymous 
                ? 'Anonymous User' 
                : `${reviewer_id?.first_name} ${reviewer_id?.last_name}`
              }
            </div>
            <div className="review-date">{formatDate(created_at)}</div>
          </div>
        </div>

        <div className="review-rating">
          <RatingStars rating={rating} size="sm" showNumber={true} />
        </div>

        {showActions && (
          <div className="review-actions">
            {canEdit && (
              <button onClick={() => onEdit(review)} className="action-button">
                <Edit size={16} />
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(_id)} className="action-button delete">
                <Trash2 size={16} />
              </button>
            )}
            {!canEdit && (
              <button onClick={() => onFlag(_id)} className="action-button">
                <Flag size={16} />
              </button>
            )}
            <button className="action-button">
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Property Info (if showing multiple properties) */}
      {showProperty && property_id && (
        <div className="property-info">
          <img 
            src={property_id.images?.[0]?.url || '/placeholder-property.png'} 
            alt={property_id.title}
            className="property-image"
          />
          <div className="property-details">
            <h4>{property_id.title}</h4>
            <p>{property_id.location?.city}, {property_id.location?.country}</p>
          </div>
        </div>
      )}

      {/* Review Content */}
      <div className="review-content">
        <h3 className="review-title">{title}</h3>
        
        <div className="review-text">
          {displayContent}
          {shouldTruncate && (
            <button 
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Detailed Ratings */}
        {detailed_ratings && Object.keys(detailed_ratings).some(key => detailed_ratings[key]) && (
          <div className="detailed-ratings">
            <div className="detailed-ratings-grid">
              {Object.entries(detailed_ratings).map(([category, categoryRating]) => 
                categoryRating ? (
                  <div key={category} className="detailed-rating-item">
                    <span className="category-label">
                      {detailedRatingCategories[category] || category}
                    </span>
                    <RatingStars 
                      rating={categoryRating} 
                      size="xs" 
                      showNumber={false} 
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Review Images */}
        {images && images.length > 0 && (
          <div className="review-images">
            {images.slice(0, 3).map((image, index) => (
              <div key={index} className="review-image">
                <img 
                  src={image.url} 
                  alt={image.caption || 'Review image'}
                />
                {images.length > 3 && index === 2 && (
                  <div className="more-images-overlay">
                    +{images.length - 3} more
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Host Response */}
      {host_response && host_response.content && (
        <div className="host-response">
          <div className="response-header">
            <div className="response-avatar">
              <img 
                src={host_response.responded_by?.profile_image || '/default-avatar.png'}
                alt={`${host_response.responded_by?.first_name} ${host_response.responded_by?.last_name}`}
              />
            </div>
            <div className="response-info">
              <div className="response-author">
                Response from {host_response.responded_by?.first_name}
              </div>
              <div className="response-date">
                {formatDate(host_response.responded_at)}
              </div>
            </div>
          </div>
          <div className="response-content">
            {host_response.content}
          </div>
        </div>
      )}

      {/* Review Footer */}
      <div className="review-footer">
        <div className="helpful-votes">
          <button 
            className={`vote-button ${userVote === 'helpful' ? 'active' : ''}`}
            onClick={() => handleVote('helpful')}
            disabled={!user}
          >
            <ThumbsUp size={16} />
            {helpfulCount > 0 && <span>{helpfulCount}</span>}
          </button>
          
          <button 
            className={`vote-button ${userVote === 'not_helpful' ? 'active' : ''}`}
            onClick={() => handleVote('not_helpful')}
            disabled={!user}
          >
            <ThumbsDown size={16} />
            {notHelpfulCount > 0 && <span>{notHelpfulCount}</span>}
          </button>
        </div>

        {isPropertyOwner && !host_response?.content && (
          <button 
            className="reply-button"
            onClick={() => onReply(review)}
          >
            <Reply size={16} />
            Reply
          </button>
        )}
      </div>

      <style jsx>{`
        .review-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          position: relative;
          transition: all 0.2s ease;
        }

        .review-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          position: relative;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .reviewer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .reviewer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .reviewer-name {
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
        }

        .review-date {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .review-rating {
          flex-shrink: 0;
        }

        .review-actions {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          gap: 0.25rem;
          background: white;
          border-radius: 0.375rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          padding: 0.25rem;
          z-index: 10;
        }

        .action-button {
          padding: 0.375rem;
          border: none;
          background: transparent;
          border-radius: 0.25rem;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .action-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .action-button.delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .property-info {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .property-image {
          width: 60px;
          height: 60px;
          border-radius: 0.5rem;
          object-fit: cover;
        }

        .property-details h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
        }

        .property-details p {
          margin: 0;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .review-content {
          margin-bottom: 1rem;
        }

        .review-title {
          margin: 0 0 0.75rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
        }

        .review-text {
          font-size: 0.875rem;
          line-height: 1.6;
          color: #374151;
          margin-bottom: 1rem;
        }

        .expand-button {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0;
          margin-left: 0.5rem;
        }

        .expand-button:hover {
          text-decoration: underline;
        }

        .detailed-ratings {
          margin-bottom: 1rem;
        }

        .detailed-ratings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .detailed-rating-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .category-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .review-images {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .review-image {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 0.5rem;
          overflow: hidden;
          cursor: pointer;
        }

        .review-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .review-image:hover img {
          transform: scale(1.05);
        }

        .more-images-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .host-response {
          background: #f9fafb;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
          border-left: 3px solid #3b82f6;
        }

        .response-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .response-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
        }

        .response-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .response-author {
          font-weight: 600;
          font-size: 0.8125rem;
          color: #111827;
        }

        .response-date {
          font-size: 0.6875rem;
          color: #6b7280;
        }

        .response-content {
          font-size: 0.875rem;
          line-height: 1.5;
          color: #374151;
        }

        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .helpful-votes {
          display: flex;
          gap: 1rem;
        }

        .vote-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .vote-button:hover:not(:disabled) {
          background: #f3f4f6;
          color: #374151;
        }

        .vote-button.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .vote-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .reply-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          border: 1px solid #3b82f6;
          background: white;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #3b82f6;
          transition: all 0.2s ease;
        }

        .reply-button:hover {
          background: #3b82f6;
          color: white;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .review-card {
            background: #1f2937;
            border-color: #374151;
          }

          .reviewer-name,
          .review-title {
            color: #f9fafb;
          }

          .review-date,
          .category-label {
            color: #9ca3af;
          }

          .review-text,
          .response-content {
            color: #e5e7eb;
          }

          .property-info,
          .host-response {
            background: #374151;
          }

          .response-author {
            color: #f9fafb;
          }

          .response-date {
            color: #9ca3af;
          }

          .review-footer {
            border-top-color: #374151;
          }

          .vote-button {
            background: #374151;
            border-color: #4b5563;
            color: #9ca3af;
          }

          .vote-button:hover:not(:disabled) {
            background: #4b5563;
            color: #f3f4f6;
          }

          .vote-button.active {
            background: #1e40af;
            border-color: #60a5fa;
            color: #60a5fa;
          }

          .reply-button {
            background: #374151;
            border-color: #60a5fa;
            color: #60a5fa;
          }

          .reply-button:hover {
            background: #3b82f6;
            color: white;
          }

          .review-actions {
            background: #1f2937;
          }

          .action-button:hover {
            background: #374151;
            color: #f3f4f6;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .review-card {
            padding: 1rem;
          }

          .review-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .detailed-ratings-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }

          .review-images {
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }

          .review-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .helpful-votes {
            justify-content: center;
          }

          .review-actions {
            position: static;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewCard;