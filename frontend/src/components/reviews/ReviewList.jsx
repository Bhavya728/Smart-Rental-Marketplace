import React, { useState } from 'react';
import { Filter, SortDesc, Search, X } from 'lucide-react';
import ReviewCard from './ReviewCard';
import RatingStars from './RatingStars';
import ScrollArea from '../ui/ScrollArea';

const ReviewList = ({ 
  reviews = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  onVoteHelpful,
  onReply,
  onEdit,
  onDelete,
  onFlag,
  showFilters = true,
  showProperty = false,
  className = "" 
}) => {
  const [filters, setFilters] = useState({
    rating: null,
    sortBy: 'created_at',
    sortOrder: -1,
    withImages: false,
    searchQuery: ''
  });
  
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filteredReviews, setFilteredReviews] = useState(reviews);

  // Apply filters whenever reviews or filters change
  React.useEffect(() => {
    let filtered = [...reviews];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.title?.toLowerCase().includes(query) ||
        review.content?.toLowerCase().includes(query) ||
        `${review.reviewer_id?.first_name} ${review.reviewer_id?.last_name}`
          .toLowerCase().includes(query)
      );
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(review => review.rating >= filters.rating);
    }

    // Images filter
    if (filters.withImages) {
      filtered = filtered.filter(review => review.images && review.images.length > 0);
    }

    // Sort
    filtered.sort((a, b) => {
      const getValue = (review, field) => {
        switch (field) {
          case 'rating':
            return review.rating;
          case 'helpful_count':
            return review.helpful_count || 0;
          case 'created_at':
            return new Date(review.created_at).getTime();
          case 'review_score':
            return review.review_score || 0;
          default:
            return 0;
        }
      };

      const aVal = getValue(a, filters.sortBy);
      const bVal = getValue(b, filters.sortBy);
      
      return filters.sortOrder === 1 ? aVal - bVal : bVal - aVal;
    });

    setFilteredReviews(filtered);
  }, [reviews, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      rating: null,
      sortBy: 'created_at',
      sortOrder: -1,
      withImages: false,
      searchQuery: ''
    });
  };

  const hasActiveFilters = filters.rating || filters.withImages || filters.searchQuery;

  const sortOptions = [
    { value: 'created_at', label: 'Most Recent', order: -1 },
    { value: 'created_at', label: 'Oldest First', order: 1 },
    { value: 'rating', label: 'Highest Rating', order: -1 },
    { value: 'rating', label: 'Lowest Rating', order: 1 },
    { value: 'helpful_count', label: 'Most Helpful', order: -1 },
    { value: 'review_score', label: 'Highest Score', order: -1 }
  ];

  if (loading && reviews.length === 0) {
    return (
      <div className="review-list-loading">
        <div className="loading-spinner" />
        <p>Loading reviews...</p>
        
        <style jsx>{`
          .review-list-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: #6b7280;
          }

          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="review-list-empty">
        <div className="empty-icon">📝</div>
        <h3>No reviews yet</h3>
        <p>Be the first to share your experience!</p>
        
        <style jsx>{`
          .review-list-empty {
            text-align: center;
            padding: 3rem;
            color: #6b7280;
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }

          .review-list-empty h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            font-weight: 600;
            color: #374151;
          }

          .review-list-empty p {
            margin: 0;
            font-size: 1rem;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .review-list-empty h3 {
              color: #f3f4f6;
            }
            
            .review-list-empty {
              color: #9ca3af;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`review-list ${className}`}>
      {/* Filters and Controls */}
      {showFilters && (
        <div className="review-controls">
          <div className="controls-header">
            <h3>
              {filteredReviews.length} Review{filteredReviews.length !== 1 ? 's' : ''}
              {hasActiveFilters && (
                <span className="filter-indicator">
                  (filtered from {reviews.length})
                </span>
              )}
            </h3>
            
            <div className="controls-actions">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`filter-button ${showFilterPanel ? 'active' : ''}`}
              >
                <Filter size={16} />
                Filters
                {hasActiveFilters && <span className="active-dot" />}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="search-input"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => handleFilterChange('searchQuery', '')}
                  className="clear-search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="filter-panel">
              <div className="filter-section">
                <label className="filter-label">Sort by</label>
                <select
                  value={`${filters.sortBy}:${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split(':');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', parseInt(sortOrder));
                  }}
                  className="filter-select"
                >
                  {sortOptions.map(option => (
                    <option 
                      key={`${option.value}:${option.order}`}
                      value={`${option.value}:${option.order}`}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-section">
                <label className="filter-label">Minimum rating</label>
                <div className="rating-filter">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', 
                        filters.rating === rating ? null : rating
                      )}
                      className={`rating-filter-button ${
                        filters.rating === rating ? 'active' : ''
                      }`}
                    >
                      <RatingStars rating={rating} size="xs" showNumber={false} />
                      <span>& up</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <label className="checkbox-filter">
                  <input
                    type="checkbox"
                    checked={filters.withImages}
                    onChange={(e) => handleFilterChange('withImages', e.target.checked)}
                  />
                  <span>Reviews with photos only</span>
                </label>
              </div>

              {hasActiveFilters && (
                <div className="filter-section">
                  <button onClick={clearFilters} className="clear-filters-button">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <ScrollArea className="reviews-scroll-area">
        <div className="reviews-container">
          {filteredReviews.length === 0 ? (
            <div className="no-results">
              <Search size={48} />
              <h3>No reviews match your criteria</h3>
              <p>Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="clear-filters-button">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onVoteHelpful={onVoteHelpful}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onFlag={onFlag}
                  showProperty={showProperty}
                  className="review-list-item"
                />
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="load-more-container">
                  <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="load-more-button"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner" />
                        Loading...
                      </>
                    ) : (
                      'Load More Reviews'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <style jsx>{`
        .review-list {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .review-controls {
          background: white;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 0.75rem 0.75rem 0 0;
        }

        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .controls-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .filter-indicator {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 400;
        }

        .controls-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #374151;
          transition: all 0.2s ease;
          position: relative;
        }

        .filter-button:hover {
          background: #f3f4f6;
        }

        .filter-button.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .active-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #dc2626;
          border-radius: 50%;
        }

        .search-container {
          margin-bottom: 1rem;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: #9ca3af;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 0.75rem;
          border: none;
          background: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.2s ease;
        }

        .clear-search:hover {
          color: #6b7280;
        }

        .filter-panel {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .rating-filter {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .rating-filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.8125rem;
          color: #374151;
          transition: all 0.2s ease;
          text-align: left;
        }

        .rating-filter-button:hover {
          background: #f3f4f6;
        }

        .rating-filter-button.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .checkbox-filter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #374151;
        }

        .clear-filters-button {
          padding: 0.5rem 1rem;
          border: 1px solid #dc2626;
          background: white;
          color: #dc2626;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .clear-filters-button:hover {
          background: #dc2626;
          color: white;
        }

        .reviews-scroll-area {
          flex: 1;
          min-height: 0;
        }

        .reviews-container {
          padding: 1rem;
        }

        .review-list-item {
          margin-bottom: 1.5rem;
        }

        .review-list-item:last-child {
          margin-bottom: 0;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .no-results h3 {
          margin: 1rem 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
        }

        .no-results p {
          margin: 0 0 1.5rem 0;
          font-size: 0.875rem;
        }

        .load-more-container {
          text-align: center;
          padding: 2rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 1rem;
        }

        .load-more-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          border: 1px solid #3b82f6;
          background: white;
          color: #3b82f6;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .load-more-button:hover:not(:disabled) {
          background: #3b82f6;
          color: white;
        }

        .load-more-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .review-controls {
            background: #1f2937;
            border-bottom-color: #374151;
          }

          .controls-header h3 {
            color: #f9fafb;
          }

          .filter-indicator {
            color: #9ca3af;
          }

          .filter-button {
            background: #374151;
            border-color: #4b5563;
            color: #e5e7eb;
          }

          .filter-button:hover {
            background: #4b5563;
          }

          .filter-button.active {
            background: #1e40af;
            border-color: #60a5fa;
            color: #60a5fa;
          }

          .search-input {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .search-input:focus {
            background: #374151;
            border-color: #60a5fa;
          }

          .filter-panel {
            background: #374151;
            border-color: #4b5563;
          }

          .filter-label {
            color: #e5e7eb;
          }

          .filter-select {
            background: #1f2937;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .rating-filter-button {
            background: #1f2937;
            border-color: #4b5563;
            color: #e5e7eb;
          }

          .rating-filter-button:hover {
            background: #374151;
          }

          .rating-filter-button.active {
            background: #1e40af;
            border-color: #60a5fa;
            color: #60a5fa;
          }

          .checkbox-filter {
            color: #e5e7eb;
          }

          .no-results h3 {
            color: #f3f4f6;
          }

          .no-results {
            color: #9ca3af;
          }

          .load-more-container {
            border-top-color: #374151;
          }

          .load-more-button {
            background: #374151;
            border-color: #60a5fa;
            color: #60a5fa;
          }

          .load-more-button:hover:not(:disabled) {
            background: #3b82f6;
            color: white;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .review-controls {
            padding: 1rem;
          }

          .controls-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .filter-panel {
            grid-template-columns: 1fr;
            padding: 0.75rem;
          }

          .rating-filter {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .reviews-container {
            padding: 0.5rem;
          }

          .review-list-item {
            margin-bottom: 1rem;
          }

          .load-more-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewList;