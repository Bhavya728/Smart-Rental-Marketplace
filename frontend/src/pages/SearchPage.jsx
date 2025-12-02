import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, Filter } from 'lucide-react';
import FilterPanel from '../components/search/FilterPanel';
import ListingCard from '../components/listings/ListingCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import searchService from '../services/searchService';
import { cn } from '../utils/cn';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : null,
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')) : 1,
    features: searchParams.get('features')?.split(',').filter(Boolean) || [],
  });

  const [listings, setListings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Use a single debounce duration for both search and filters to keep them in sync
  const DEBOUNCE_MS = 600;
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_MS);
  const debouncedFilters = useDebounce(filters, DEBOUNCE_MS);

  // Single ref to prevent duplicate calls
  const searchInProgress = useRef(false);
  const lastSearchParamsRef = useRef('');

  // Simple, clean search function
  const performSearch = useCallback(async (resetPage = false, customPage = null) => {
    if (searchInProgress.current) return;
    
    const currentPage = resetPage ? 1 : (customPage !== null ? customPage : page);
    const searchParams = {
      search: debouncedSearchQuery,
      ...debouncedFilters,
      page: currentPage,
      limit: 12,
    };

    // Check if we're making the same request
    const searchParamsString = JSON.stringify(searchParams);
    if (searchParamsString === lastSearchParamsRef.current && !resetPage) {
      return; // Skip duplicate request
    }
    lastSearchParamsRef.current = searchParamsString;
    
    searchInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      // Clean up empty values
      Object.keys(searchParams).forEach(key => {
        const value = searchParams[key];
        if (value === null || value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          delete searchParams[key];
        }
      });

      const response = await searchService.searchListings(searchParams);
      
      if (response.success) {
        const newListings = response.data.listings || [];
        
        if (resetPage) {
          setListings(newListings);
          setPage(1);
        } else {
          setListings(prev => [...prev, ...newListings]);
        }
        
        setTotalResults(response.data.total || 0);
        setHasMore(newListings.length === 12);
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search listings');
      if (resetPage) {
        setListings([]);
        setTotalResults(0);
      }
    } finally {
      setLoading(false);
      searchInProgress.current = false;
    }
  }, [debouncedSearchQuery, debouncedFilters]); // Removed page to break circular dependency



  // Effect for initial search and when search parameters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    performSearch(true).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearchQuery, debouncedFilters]);

  // Effect for suggestions - simplified to avoid circular dependencies
  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      const loadSuggestions = async () => {
        try {
          const response = await searchService.getSearchSuggestions(debouncedSearchQuery);
          if (response.success) {
            setSuggestions(response.data || []);
          }
        } catch (err) {
          console.error('Error loading suggestions:', err);
        }
      };
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  // Effect for pagination - simplified to avoid circular dependencies
  useEffect(() => {
    if (page > 1) {
      // Create inline pagination search to avoid circular dependency
      const loadMoreResults = async () => {
        if (searchInProgress.current) return;
        
        searchInProgress.current = true;
        setLoading(true);

        try {
          const searchParams = {
            search: debouncedSearchQuery,
            ...debouncedFilters,
            page: page,
            limit: 12,
          };

          Object.keys(searchParams).forEach(key => {
            const value = searchParams[key];
            if (value === null || value === undefined || value === '' || 
                (Array.isArray(value) && value.length === 0)) {
              delete searchParams[key];
            }
          });

          const response = await searchService.searchListings(searchParams);
          
          if (response.success) {
            const newListings = response.data.listings || [];
            setListings(prev => [...prev, ...newListings]);
            setHasMore(newListings.length === 12);
          }
        } catch (err) {
          console.error('Pagination error:', err);
        } finally {
          setLoading(false);
          searchInProgress.current = false;
        }
      };

      loadMoreResults();
    }
  }, [page, debouncedSearchQuery, debouncedFilters]);

  // Update URL params (separate effect to avoid loops) - debounced to prevent rapid updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      
      if (searchQuery) params.set('q', searchQuery);
      if (filters.category) params.set('category', filters.category);
      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.location) params.set('location', filters.location);
      if (filters.checkIn) params.set('checkIn', filters.checkIn);
      if (filters.checkOut) params.set('checkOut', filters.checkOut);
      if (filters.guests > 1) params.set('guests', filters.guests.toString());
      if (filters.features?.length) params.set('features', filters.features.join(','));

      setSearchParams(params, { replace: true });
    }, 300); // Small debounce for URL updates

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, setSearchParams]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const { isIntersecting } = useInfiniteScroll({
    hasMore,
    isLoading: loading,
    onLoadMore: handleLoadMore,
  });

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    performSearch(true);
  }, [performSearch]);

  // Only update filters if they actually changed, to avoid unnecessary resets
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => {
      const isSame = JSON.stringify(prev) === JSON.stringify(newFilters);
      if (!isSame) {
        setPage(1);
        return newFilters;
      }
      return prev;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      category: '',
      minPrice: null,
      maxPrice: null,
      location: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      features: [],
    });
    setSearchQuery('');
    setPage(1);
  }, []);

  // Memoize the listings grid to prevent unnecessary re-renders
  const listingsGrid = useMemo(() => 
    listings.map((listing, index) => (
      <motion.div
        key={listing._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <ListingCard listing={listing} />
      </motion.div>
    )), [listings]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-16">
      {/* Enhanced Header Section with Mobile-First Design */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-16 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-4">
            {/* Page Title - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                {debouncedSearchQuery ? `Results for "${debouncedSearchQuery}"` : 'Discover Rentals'}
              </h1>
              {totalResults > 0 && (
                <span className="text-sm sm:text-base text-gray-600 font-medium">
                  {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Enhanced Search Bar with Better Mobile UX */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
                <input
                  id="searchQuery"
                  name="searchQuery"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for tools, equipment, or anything you need..."
                  className="w-full pl-12 sm:pl-14 pr-4 py-4 sm:py-5 text-base sm:text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 placeholder-gray-500"
                  aria-label="Search rental items"
                />
                
                {/* Enhanced Suggestions with Mobile Optimization */}
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 max-h-64 overflow-y-auto z-50"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-blue-50/80 transition-colors border-b border-gray-100/50 last:border-b-0 focus:bg-blue-50 focus:outline-none first:rounded-t-xl last:rounded-b-xl"
                          onClick={() => {
                            setSearchQuery(suggestion.title || suggestion);
                            setSuggestions([]);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-700 text-base sm:text-lg">{suggestion.title || suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Filter Toggle and Active Filters - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center justify-center space-x-2 transition-all duration-200 min-h-[44px] w-full sm:w-auto",
                  showFilters && "bg-blue-50 border-blue-200 text-blue-700"
                )}
                aria-expanded={showFilters}
                aria-label="Toggle search filters"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </Button>

              {/* Active Filters Display */}
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                    <span className="font-medium">{filters.category}</span>
                    <button
                      onClick={() => handleFiltersChange({ ...filters, category: '' })}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.minPrice && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                    <span className="font-medium">Min: ${filters.minPrice}</span>
                    <button
                      onClick={() => handleFiltersChange({ ...filters, minPrice: null })}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 border border-orange-200">
                    <span className="font-medium">Max: ${filters.maxPrice}</span>
                    <button
                      onClick={() => handleFiltersChange({ ...filters, maxPrice: null })}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.location && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200">
                    <span className="font-medium">Location: {filters.location}</span>
                    <button
                      onClick={() => handleFiltersChange({ ...filters, location: '' })}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}

                {(filters.category || filters.minPrice || filters.maxPrice || filters.location || filters.features?.length > 0) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Results Count */}
              {totalResults > 0 && (
                <div className="text-sm text-gray-600 ml-auto">
                  {totalResults.toLocaleString()} {totalResults === 1 ? 'result' : 'results'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Mobile Filter Panel - Collapsible */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <FilterPanel
                  filters={filters}
                  onChange={handleFiltersChange}
                  onClear={handleClearFilters}
                  className="mb-6"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Filter Panel - Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block lg:w-80 flex-shrink-0"
              >
                <FilterPanel
                  filters={filters}
                  onChange={handleFiltersChange}
                  onClear={handleClearFilters}
                  className="sticky top-32"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content with Enhanced Mobile Layout */}
          <div className="flex-1 min-w-0">
            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Search Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Enhanced Results Grid with Mobile-First Layout */}
            {listings.length > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                  {listingsGrid}
                </motion.div>
                
                {/* Enhanced Loading Indicator */}
                {loading && (
                  <div className="flex justify-center items-center mt-6 sm:mt-8">
                    <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-gray-700 font-medium">Loading more results...</span>
                    </div>
                  </div>
                )}
              </>
            ) : loading ? (
              /* Enhanced Loading Skeletons with Mobile Responsive Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 animate-pulse shadow-lg border border-gray-200/50">
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mt-3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No listings found"
                description="Try adjusting your search criteria or filters to find more results."
                action={handleClearFilters}
                actionLabel="Clear Filters"
              />
            )}

            {/* Load More */}
            {hasMore && listings.length > 0 && (
              <div className="mt-8 text-center">
                {loading ? (
                  <div className="inline-flex items-center space-x-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading more...</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    Load More Results
                  </Button>
                )}
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={isIntersecting} className="h-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;