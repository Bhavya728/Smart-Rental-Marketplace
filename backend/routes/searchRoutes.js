/**
 * Search Routes
 * Routes for search and discovery functionality
 */

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Public routes
router.get('/listings', searchController.searchListings);
router.get('/suggestions', searchController.getSearchSuggestions);
router.get('/categories', searchController.getCategories);
router.get('/categories/:categoryName', searchController.getCategoryInfo);
router.get('/locations', searchController.getPopularLocations);
router.get('/price-range', searchController.getPriceRange);

// Protected routes - will add later when auth is needed
// const { auth } = require('../middleware/auth');
// router.get('/analytics', auth, searchController.getSearchAnalytics);

module.exports = router;