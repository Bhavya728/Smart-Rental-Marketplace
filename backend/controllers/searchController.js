/**
 * Search Controller
 * Handles search and discovery endpoints
 */

const SearchService = require('../services/searchService');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

/**
 * Advanced search listings
 * GET /api/search/listings
 */
const searchListings = catchAsync(async (req, res) => {
  const filters = req.query;
  
  logger.info(`Advanced search with filters:`, filters);
  
  const result = await SearchService.searchListings(filters);
  
  res.json({
    success: true,
    data: {
      listings: result.listings,
      total: result.pagination.total,
      pagination: result.pagination
    },
    filters: filters
  });
});

/**
 * Get search suggestions
 * GET /api/search/suggestions
 */
const getSearchSuggestions = catchAsync(async (req, res) => {
  const { q: query, limit = 5 } = req.query;
  
  if (!query || query.trim().length < 2) {
    return res.json({
      success: true,
      data: []
    });
  }
  
  const suggestions = await SearchService.getSearchSuggestions(query.trim(), parseInt(limit));
  
  res.json({
    success: true,
    data: suggestions
  });
});

/**
 * Get available categories with counts
 * GET /api/search/categories
 */
const getCategories = catchAsync(async (req, res) => {
  const categories = await SearchService.getCategories();
  
  res.json({
    success: true,
    data: categories
  });
});

/**
 * Get detailed information about a specific category
 * GET /api/search/categories/:categoryName
 */
const getCategoryInfo = catchAsync(async (req, res) => {
  const { categoryName } = req.params;
  
  if (!categoryName) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required'
    });
  }
  
  logger.info(`Getting category info for: ${categoryName}`);
  
  const categoryInfo = await SearchService.getCategoryInfo(categoryName);
  
  res.json({
    success: true,
    data: categoryInfo
  });
});

/**
 * Get popular locations
 * GET /api/search/locations
 */
const getPopularLocations = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const locations = await SearchService.getPopularLocations(parseInt(limit));
  
  res.json({
    success: true,
    data: locations
  });
});

/**
 * Get price range for filters
 * GET /api/search/price-range
 */
const getPriceRange = catchAsync(async (req, res) => {
  const { category } = req.query;
  
  const priceRange = await SearchService.getPriceRange({ category });
  
  res.json({
    success: true,
    data: priceRange
  });
});

/**
 * Get search analytics
 * GET /api/search/analytics
 */
const getSearchAnalytics = catchAsync(async (req, res) => {
  const { timeframe = '30d' } = req.query;
  
  const analytics = await SearchService.getSearchAnalytics(timeframe);
  
  res.json({
    success: true,
    data: analytics
  });
});

module.exports = {
  searchListings,
  getSearchSuggestions,
  getCategories,
  getCategoryInfo,
  getPopularLocations,
  getPriceRange,
  getSearchAnalytics
};