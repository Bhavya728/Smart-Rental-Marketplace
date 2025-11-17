import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Filter, 
  Grid, 
  List, 
  MapPin, 
  Home, 
  Car, 
  Camera, 
  Laptop, 
  Gamepad2,
  Music,
  Wrench,
  Bike,
  Baby,
  Book,
  ArrowRight
} from 'lucide-react';
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import SearchResults from '../components/search/SearchResults';
import QuickFilters from '../components/search/QuickFilters';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import searchService from '../services/searchService';
import { cn } from '../utils/cn';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Categories data for the overview page
  const categories = [
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      icon: Home,
      description: 'Furniture, appliances, and garden equipment',
      color: 'bg-green-100 text-green-600',
      items: ['Furniture', 'Appliances', 'Garden Tools', 'Cleaning Equipment']
    },
    {
      name: 'Vehicles',
      slug: 'vehicles',
      icon: Car,
      description: 'Cars, motorcycles, bikes, and transportation',
      color: 'bg-blue-100 text-blue-600',
      items: ['Cars', 'Motorcycles', 'Bicycles', 'Scooters']
    },
    {
      name: 'Electronics',
      slug: 'electronics',
      icon: Laptop,
      description: 'Laptops, phones, cameras, and gadgets',
      color: 'bg-purple-100 text-purple-600',
      items: ['Laptops', 'Cameras', 'Gaming', 'Audio Equipment']
    },
    {
      name: 'Photography',
      slug: 'photography',
      icon: Camera,
      description: 'Cameras, lenses, lighting, and accessories',
      color: 'bg-orange-100 text-orange-600',
      items: ['DSLR Cameras', 'Lenses', 'Tripods', 'Lighting Equipment']
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      icon: Gamepad2,
      description: 'Consoles, games, and gaming accessories',
      color: 'bg-red-100 text-red-600',
      items: ['Game Consoles', 'Games', 'Controllers', 'VR Equipment']
    },
    {
      name: 'Music & Audio',
      slug: 'music-audio',
      icon: Music,
      description: 'Instruments, audio equipment, and accessories',
      color: 'bg-pink-100 text-pink-600',
      items: ['Musical Instruments', 'Speakers', 'Microphones', 'DJ Equipment']
    },
    {
      name: 'Tools & Equipment',
      slug: 'tools-equipment',
      icon: Wrench,
      description: 'Power tools, hand tools, and workshop equipment',
      color: 'bg-gray-100 text-gray-600',
      items: ['Power Tools', 'Hand Tools', 'Workshop Equipment', 'Measuring Tools']
    },
    {
      name: 'Sports & Recreation',
      slug: 'sports-recreation',
      icon: Bike,
      description: 'Sports equipment, outdoor gear, and recreation',
      color: 'bg-teal-100 text-teal-600',
      items: ['Fitness Equipment', 'Outdoor Gear', 'Water Sports', 'Team Sports']
    },
    {
      name: 'Baby & Kids',
      slug: 'baby-kids',
      icon: Baby,
      description: 'Baby gear, toys, and children\'s equipment',
      color: 'bg-yellow-100 text-yellow-600',
      items: ['Baby Gear', 'Toys', 'Strollers', 'Car Seats']
    },
    {
      name: 'Books & Education',
      slug: 'books-education',
      icon: Book,
      description: 'Books, educational materials, and resources',
      color: 'bg-indigo-100 text-indigo-600',
      items: ['Textbooks', 'Reference Books', 'Educational Tools', 'Art Supplies']
    }
  ];

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: categoryName || '',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : null,
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')) : 1,
    features: searchParams.get('features')?.split(',').filter(Boolean) || [],
    sortBy: searchParams.get('sort') || 'relevance'
  });

  const [listings, setListings] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [totalResults, setTotalResults] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedFilters = useDebounce(filters, 300);

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.location) params.set('location', filters.location);
    if (filters.checkIn) params.set('checkIn', filters.checkIn);
    if (filters.checkOut) params.set('checkOut', filters.checkOut);
    if (filters.guests > 1) params.set('guests', filters.guests.toString());
    if (filters.features?.length) params.set('features', filters.features.join(','));
    if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);

    setSearchParams(params);
  }, [searchQuery, filters, setSearchParams]);

  // Load category info and perform search when category or filters change
  useEffect(() => {
    loadCategoryInfo();
    handleSearch(true);
  }, [categoryName, debouncedSearchQuery, debouncedFilters]);

  // Load suggestions for search input
  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  const loadCategoryInfo = async () => {
    if (!categoryName) return;
    
    try {
      const response = await searchService.getCategoryInfo(categoryName);
      if (response.success) {
        setCategoryInfo(response.data);
      }
    } catch (err) {
      console.error('Error loading category info:', err);
    }
  };

  const handleSearch = async (reset = false) => {
    if (reset) {
      setPage(1);
      setListings([]);
      setHasMore(true);
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        query: debouncedSearchQuery,
        category: categoryName,
        ...debouncedFilters,
        page: reset ? 1 : page,
        limit: 12,
      };

      // Remove empty values
      Object.keys(searchParams).forEach(key => {
        if (!searchParams[key] || 
            (Array.isArray(searchParams[key]) && searchParams[key].length === 0)) {
          delete searchParams[key];
        }
      });

      const response = await searchService.searchListings(searchParams);
      
      if (response.success) {
        const newListings = response.data.listings || [];
        
        if (reset) {
          setListings(newListings);
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
      if (reset) {
        setListings([]);
        setTotalResults(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await searchService.getSearchSuggestions(debouncedSearchQuery, categoryName);
      if (response.success) {
        setSuggestions(response.data || []);
      }
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const { isIntersecting } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: handleLoadMore,
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: categoryName || '',
      minPrice: null,
      maxPrice: null,
      location: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      features: [],
      sortBy: 'relevance'
    });
  };

  const handleQuickFilter = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const formatCategoryName = (name) => {
    return name?.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Category';
  };

  const categoryDisplayName = formatCategoryName(categoryName);

  // If no categoryName, show categories overview
  if (!categoryName) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Categories</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover thousands of items available for rent across various categories. 
              Find exactly what you need from trusted community members.
            </p>
          </motion.div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    to={`/category/${category.slug}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 h-full">
                      
                      {/* Icon and Title */}
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-lg ${category.color} mr-4`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {category.name}
                          </h3>
                        </div>
                        <ArrowRight 
                          size={20} 
                          className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" 
                        />
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-4">
                        {category.description}
                      </p>

                      {/* Popular Items */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Popular Items:</p>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
              <p className="text-xl mb-6 opacity-90">
                Use our advanced search to find specific items or browse all available listings.
              </p>
              <div className="space-x-4">
                <Link
                  to="/search"
                  className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Advanced Search
                </Link>
                <Link
                  to="/listings"
                  className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Browse All Items
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-primary-200 mb-6">
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              All Categories
            </button>
            <span>/</span>
            <span className="text-white">{categoryDisplayName}</span>
          </div>

          {/* Category Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-8 lg:mb-0">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl lg:text-5xl font-bold mb-4"
              >
                {categoryDisplayName}
              </motion.h1>
              {categoryInfo && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-primary-100 mb-4"
                >
                  {categoryInfo.description}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4 text-primary-100"
              >
                <span>{totalResults} available items</span>
                {categoryInfo?.avgPrice && (
                  <>
                    <span>•</span>
                    <span>Avg. ${categoryInfo.avgPrice}/day</span>
                  </>
                )}
              </motion.div>
            </div>

            {/* Category Stats */}
            {categoryInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4 lg:gap-6"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">{categoryInfo.totalListings || 0}</div>
                  <div className="text-sm text-primary-200">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{categoryInfo.avgRating || 0}</div>
                  <div className="text-sm text-primary-200">Avg. Rating</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchBar
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onShowFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            suggestions={suggestions}
            loading={loading}
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <QuickFilters
          category={categoryName}
          onFilterSelect={handleQuickFilter}
          activeFilters={filters}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <FilterPanel
                filters={filters}
                onChange={handleFiltersChange}
                onClear={handleClearFilters}
                isCollapsed={!showFilters}
                onToggle={() => setShowFilters(!showFilters)}
                className={cn(
                  "lg:block",
                  showFilters ? "block" : "hidden"
                )}
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <SearchResults
              ref={isIntersecting}
              listings={listings}
              loading={loading}
              error={error}
              totalResults={totalResults}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={filters.sortBy}
              onSortChange={(sortBy) => handleFiltersChange({ sortBy })}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;