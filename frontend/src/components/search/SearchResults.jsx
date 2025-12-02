import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, MapPin, Star, Heart, Eye } from 'lucide-react';
import ListingCard from '../listings/ListingCard';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

// Skeleton component for loading state
const ListingCardSkeleton = () => (
  <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-pulse group">
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-transparent opacity-60"></div>
    
    {/* Animated Background */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl"></div>
    
    <div className="relative z-10">
      <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl h-52"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4"></div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3"></div>
        </div>
      </div>
    </div>
  </div>
);

const SearchResults = forwardRef(({ 
  listings = [],
  loading = false,
  error = null,
  totalResults = 0,
  hasMore = false,
  onLoadMore,
  viewMode = 'grid', // 'grid' or 'list'
  onViewModeChange,
  sortBy = 'relevance',
  onSortChange,
  searchQuery = '',
  className = "",
  showViewToggle = true,
  showSortOptions = true
}, ref) => {

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'distance', label: 'Distance' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <div className={cn("bg-white rounded-lg p-8 text-center", className)}>
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onLoadMore} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!loading && listings.length === 0) {
    return (
      <div className={cn("bg-white rounded-lg p-8 text-center", className)}>
        <div className="text-gray-400 text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchQuery ? `No results for "${searchQuery}"` : 'No listings found'}
        </h3>
        <p className="text-gray-600">
          {searchQuery 
            ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
            : 'Be the first to add a listing in this area!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {totalResults > 0 && (
              <span className="text-gray-600 font-normal">
                {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sort Options */}
          {showSortOptions && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Toggle */}
          {showViewToggle && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange?.('grid')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'grid' 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange?.('list')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list' 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid/List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        )}
      >
        {listings.map((listing, index) => (
          <motion.div
            key={listing._id}
            variants={itemVariants}
            transition={{ delay: index * 0.05 }}
            className={cn(
              viewMode === 'list' && "relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            )}
          >
            {viewMode === 'grid' ? (
              <ListingCard listing={listing} />
            ) : (
              <ListListingCard listing={listing} />
            )}
          </motion.div>
        ))}

        {/* Loading Skeletons */}
        {loading && (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                variants={itemVariants}
                transition={{ delay: index * 0.05 }}
              >
                <ListingCardSkeleton />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>

      {/* Load More / Infinite Scroll Trigger */}
      {(hasMore || loading) && (
        <div className="flex justify-center py-8">
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span>Loading more results...</span>
            </div>
          ) : hasMore ? (
            <div ref={ref} className="h-10">
              <Button
                onClick={onLoadMore}
                variant="outline"
                className="px-8"
              >
                Load More Results
              </Button>
            </div>
          ) : listings.length > 0 ? (
            <p className="text-gray-500">You've seen all results</p>
          ) : null}
        </div>
      )}
    </div>
  );
});

// List view component for listings
const ListListingCard = ({ listing }) => {
  return (
    <div className="flex flex-col sm:flex-row">
      {/* Image */}
      <div className="sm:w-64 sm:flex-shrink-0">
        <div className="aspect-w-16 aspect-h-10 sm:aspect-w-4 sm:aspect-h-3">
          <img
            src={listing.images?.[0] || '/placeholder-image.jpg'}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between h-full">
          <div className="flex-1">
            {/* Category & Location */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {listing.category}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {listing.location?.city}, {listing.location?.state}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {listing.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {listing.description}
            </p>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {listing.features.slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {feature}
                  </span>
                ))}
                {listing.features.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{listing.features.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Rating & Reviews */}
            {listing.rating && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="font-medium">{listing.rating}</span>
                {listing.reviewCount && (
                  <span className="ml-1">({listing.reviewCount} reviews)</span>
                )}
              </div>
            )}
          </div>

          {/* Price & Actions */}
          <div className="sm:ml-6 sm:flex-shrink-0 sm:w-32 flex sm:flex-col sm:justify-between sm:items-end">
            <div className="text-right mb-4">
              <div className="text-2xl font-bold text-gray-900">
                ${listing.price}
                <span className="text-sm font-normal text-gray-500">/day</span>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Heart className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SearchResults.displayName = 'SearchResults';

export default SearchResults;