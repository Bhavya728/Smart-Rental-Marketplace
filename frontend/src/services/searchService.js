/**
 * Search Service
 * Handles search and discovery API calls
 */

import api from './api';

class SearchService {
  /**
   * Advanced search with filters
   */
  async searchListings(filters = {}, options = {}) {
    try {
      const params = new URLSearchParams();
      
      // Map frontend filter names to backend parameter names
      const paramMapping = {
        search: 'search',
        category: 'category', 
        minPrice: 'minPrice',
        maxPrice: 'maxPrice',
        location: 'location',
        checkIn: 'checkIn',
        checkOut: 'checkOut',
        guests: 'guests',
        features: 'features',
        page: 'page',
        limit: 'limit',
        sortBy: 'sortBy',
        sortOrder: 'sortOrder'
      };
      
      // Add search parameters with proper mapping
      Object.keys(filters).forEach(key => {
        const mappedKey = paramMapping[key] || key;
        const value = filters[key];
        
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach(v => params.append(mappedKey, v));
          } else if (!Array.isArray(value)) {
            params.append(mappedKey, value);
          }
        }
      });
      
      const response = await api.get(`/search/listings?${params.toString()}`, options);
      return response.data;
    } catch (error) {
      // Don't log canceled requests as errors
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error; // Re-throw to be handled by component
      }
      
      // If it's a network error, provide more helpful messaging
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || !error.response) {
        
        // For demo purposes, return sample data if backend is unreachable
        return {
          success: true,
          data: {
            listings: [],
            total: 0,
            pagination: {
              page: 1,
              limit: 12,
              pages: 0
            }
          },
          message: 'Backend server is not responding. Please ensure the server is running on localhost:5000'
        };
      }
      
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query, category = null, limit = 5) {
    try {
      if (!query || query.trim().length < 2) return { data: [] };
      
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      if (category) {
        params.append('category', category);
      }
      
      const response = await api.get(`/search/suggestions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return { data: [] };
    }
  }

  /**
   * Get categories with counts
   */
  async getCategories() {
    try {
      const response = await api.get('/search/categories');
      return response.data;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific category
   */
  async getCategoryInfo(categoryName) {
    try {
      if (!categoryName) {
        throw new Error('Category name is required');
      }

      const response = await api.get(`/search/categories/${encodeURIComponent(categoryName)}`);
      return response.data;
    } catch (error) {
      console.error('Error getting category info:', error);
      
      // Return mock data for development if the backend endpoint doesn't exist yet
      return {
        success: true,
        data: {
          name: categoryName,
          description: `Browse ${categoryName.replace('-', ' ')} items available for rent`,
          totalListings: 0,
          avgPrice: 0,
          avgRating: 0
        }
      };
    }
  }

  /**
   * Get popular locations
   */
  async getPopularLocations(limit = 10) {
    try {
      const response = await api.get(`/search/locations?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting popular locations:', error);
      throw error;
    }
  }

  /**
   * Get price range for category
   */
  async getPriceRange(category = null) {
    try {
      const url = category ? `/search/price-range?category=${encodeURIComponent(category)}` : '/search/price-range';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error getting price range:', error);
      throw error;
    }
  }

  /**
   * Get search analytics (admin)
   */
  async getSearchAnalytics(timeframe = '30d') {
    try {
      const response = await api.get(`/search/analytics?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error getting search analytics:', error);
      throw error;
    }
  }
}

export default new SearchService();