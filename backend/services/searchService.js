/**
 * Search Service
 * Handles advanced search and filtering operations
 */

const Listing = require('../models/Listing');
const logger = require('../utils/logger');

class SearchService {
  /**
   * Advanced search with multiple filters
   */
  static async searchListings(filters = {}) {
    try {
      const {
        search,
        category,
        minPrice,
        maxPrice,
        location,
        lat,
        lng,
        radius = 10000, // 10km default
        status = 'active',
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        features,
        availability
      } = filters;

      // Build aggregation pipeline
      const pipeline = [];

      // Match stage - initial filtering
      const matchStage = {
        status: status,
        isDeleted: { $ne: true }
      };

      // Text search - check if text index exists
      let useTextSearch = false;
      if (search && search.trim()) {
        // Check if text index exists
        try {
          const indexes = await Listing.collection.listIndexes().toArray();
          useTextSearch = indexes.some(index => 
            index.key && Object.keys(index.key).some(key => index.key[key] === 'text')
          );
        } catch (error) {
          logger.warn('Could not check indexes, using regex search');
          useTextSearch = false;
        }

        if (useTextSearch) {
          matchStage.$text = { $search: search.trim() };
        } else {
          // Fallback to regex search
          const searchRegex = new RegExp(search.trim().split(' ').join('|'), 'i');
          matchStage.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { 'location.address.city': searchRegex },
            { 'location.address.state': searchRegex }
          ];
        }
      }

      // Category filter
      if (category && category !== 'all') {
        matchStage.category = new RegExp(category, 'i');
      }

      // Price range filter
      if (minPrice || maxPrice) {
        matchStage.dailyRate = {};
        if (minPrice) matchStage.dailyRate.$gte = parseFloat(minPrice);
        if (maxPrice) matchStage.dailyRate.$lte = parseFloat(maxPrice);
      }

      // Location-based search
      if (location && location.trim()) {
        const locationRegex = new RegExp(location.trim(), 'i');
        matchStage.$or = [
          { 'location.address.city': locationRegex },
          { 'location.address.state': locationRegex },
          { 'location.address.zipCode': locationRegex },
          { 'location.address.country': locationRegex }
        ];
      }

      // Geospatial search
      if (lat && lng && radius) {
        matchStage['location.coordinates'] = {
          $geoWithin: {
            $centerSphere: [
              [parseFloat(lng), parseFloat(lat)],
              radius / 6378100 // Convert meters to radians
            ]
          }
        };
      }

      // Features filter
      if (features && Array.isArray(features) && features.length > 0) {
        matchStage['features.name'] = { $in: features };
      }

      pipeline.push({ $match: matchStage });

      // Add score for text search
      if (search && search.trim()) {
        pipeline.push({
          $addFields: {
            score: { $meta: 'textScore' }
          }
        });
      }

      // Lookup owner information
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerInfo',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
                profilePicture: 1,
                rating: 1,
                totalReviews: 1,
                verified: 1
              }
            }
          ]
        }
      });

      // Unwind owner info
      pipeline.push({
        $unwind: {
          path: '$ownerInfo',
          preserveNullAndEmptyArrays: true
        }
      });

      // Calculate average rating from reviews (if reviews exist)
      pipeline.push({
        $addFields: {
          averageRating: { $ifNull: ['$rating.average', 0] },
          totalReviews: { $ifNull: ['$rating.count', 0] },
          imageCount: { $size: { $ifNull: ['$images', []] } }
        }
      });

      // Sort stage
      const sortOptions = {};
      if (search && search.trim()) {
        sortOptions.score = { $meta: 'textScore' };
      }

      switch (sortBy) {
        case 'price':
          sortOptions.dailyRate = sortOrder === 'desc' ? -1 : 1;
          break;
        case 'rating':
          sortOptions.averageRating = -1;
          sortOptions.totalReviews = -1;
          break;
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        case 'popularity':
          sortOptions.views = -1;
          sortOptions.totalReviews = -1;
          break;
        default:
          sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      pipeline.push({ $sort: sortOptions });

      // Facet for pagination and count
      pipeline.push({
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
          ],
          count: [
            { $count: 'total' }
          ]
        }
      });

      const result = await Listing.aggregate(pipeline);
      
      const listings = result[0]?.data || [];
      const total = result[0]?.count?.[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        listings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      logger.error('Search service error:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on partial input
   */
  static async getSearchSuggestions(query, limit = 5) {
    try {
      if (!query || query.length < 2) return [];

      const suggestions = await Listing.aggregate([
        {
          $match: {
            status: 'active',
            isDeleted: { $ne: true },
            $or: [
              { title: new RegExp(query, 'i') },
              { category: new RegExp(query, 'i') },
              { 'location.address.city': new RegExp(query, 'i') }
            ]
          }
        },
        {
          $project: {
            title: 1,
            category: 1,
            'location.address.city': 1,
            type: {
              $cond: [
                { $regexMatch: { input: '$title', regex: new RegExp(query, 'i') } },
                'listing',
                {
                  $cond: [
                    { $regexMatch: { input: '$category', regex: new RegExp(query, 'i') } },
                    'category',
                    'location'
                  ]
                }
              ]
            }
          }
        },
        { $limit: limit }
      ]);

      return suggestions.map(item => ({
        text: item.type === 'listing' ? item.title :
              item.type === 'category' ? item.category :
              item.location.address.city,
        type: item.type,
        id: item._id
      }));

    } catch (error) {
      logger.error('Search suggestions error:', error);
      return [];
    }
  }

  /**
   * Get available categories with listing counts
   */
  static async getCategories() {
    try {
      const categories = await Listing.aggregate([
        {
          $match: {
            status: 'active',
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      return categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }));

    } catch (error) {
      logger.error('Get categories error:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a specific category
   */
  static async getCategoryInfo(categoryName) {
    try {
      if (!categoryName) {
        throw new Error('Category name is required');
      }

      // Normalize category name (replace spaces with hyphens, handle different formats)
      const normalizedCategory = categoryName.toLowerCase().replace(/\s+/g, '-');

      const result = await Listing.aggregate([
        {
          $match: {
            status: 'active',
            isDeleted: { $ne: true },
            $or: [
              { category: categoryName },
              { category: normalizedCategory },
              { category: new RegExp(categoryName.replace(/-/g, ' '), 'i') },
              { category: new RegExp(normalizedCategory.replace(/-/g, ' '), 'i') }
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalListings: { $sum: 1 },
            avgPrice: { $avg: '$dailyRate' },
            minPrice: { $min: '$dailyRate' },
            maxPrice: { $max: '$dailyRate' },
            avgRating: { $avg: '$metrics.rating.average' },
            totalReviews: { $sum: '$metrics.rating.count' }
          }
        }
      ]);

      const stats = result[0] || {
        totalListings: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        avgRating: 0,
        totalReviews: 0
      };

      // Generate category description based on name
      const formatCategoryName = (name) => {
        return name.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      };

      const categoryDescriptions = {
        'camera': 'Professional cameras, lenses, and photography equipment for all your shooting needs',
        'laptop': 'High-performance laptops and computing devices for work and creativity',
        'power-tools': 'Professional-grade power tools and equipment for construction and DIY projects',
        'bicycle': 'Bikes and cycling equipment for transportation and recreation',
        'audio-equipment': 'Professional audio gear, speakers, and music production equipment',
        'gaming-console': 'Gaming consoles, accessories, and entertainment systems',
        'furniture': 'Quality furniture pieces for home, office, and event staging',
        'fitness-equipment': 'Exercise equipment and fitness gear for health and wellness'
      };

      const description = categoryDescriptions[normalizedCategory] || 
                         `Quality ${formatCategoryName(categoryName)} items available for rent`;

      return {
        name: formatCategoryName(categoryName),
        slug: normalizedCategory,
        description,
        totalListings: stats.totalListings,
        avgPrice: Math.round(stats.avgPrice * 100) / 100,
        minPrice: stats.minPrice,
        maxPrice: stats.maxPrice,
        avgRating: Math.round(stats.avgRating * 10) / 10,
        totalReviews: stats.totalReviews
      };

    } catch (error) {
      logger.error('Get category info error:', error);
      
      // Return default info if error occurs
      const formatCategoryName = (name) => {
        return name.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      };

      return {
        name: formatCategoryName(categoryName),
        slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
        description: `Browse ${formatCategoryName(categoryName)} items available for rent`,
        totalListings: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        avgRating: 0,
        totalReviews: 0
      };
    }
  }

  /**
   * Get popular locations with listing counts
   */
  static async getPopularLocations(limit = 10) {
    try {
      const locations = await Listing.aggregate([
        {
          $match: {
            status: 'active',
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: {
              city: '$location.address.city',
              state: '$location.address.state'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            city: '$_id.city',
            state: '$_id.state',
            count: 1,
            _id: 0
          }
        }
      ]);

      return locations;

    } catch (error) {
      logger.error('Get popular locations error:', error);
      return [];
    }
  }

  /**
   * Get price range statistics
   */
  static async getPriceRange(filters = {}) {
    try {
      const matchStage = {
        status: 'active',
        isDeleted: { $ne: true }
      };

      if (filters.category) {
        matchStage.category = new RegExp(filters.category, 'i');
      }

      const result = await Listing.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$dailyRate' },
            maxPrice: { $max: '$dailyRate' },
            avgPrice: { $avg: '$dailyRate' }
          }
        }
      ]);

      return result[0] || { minPrice: 0, maxPrice: 1000, avgPrice: 50 };

    } catch (error) {
      logger.error('Get price range error:', error);
      return { minPrice: 0, maxPrice: 1000, avgPrice: 50 };
    }
  }

  /**
   * Get search analytics (for admin/insights)
   */
  static async getSearchAnalytics(timeframe = '30d') {
    try {
      // This would be enhanced with search tracking in the future
      const stats = await Listing.aggregate([
        {
          $match: {
            status: 'active',
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: null,
            totalListings: { $sum: 1 },
            avgPrice: { $avg: '$dailyRate' },
            categoryCounts: {
              $push: '$category'
            }
          }
        }
      ]);

      return stats[0] || {};

    } catch (error) {
      logger.error('Search analytics error:', error);
      return {};
    }
  }
}

module.exports = SearchService;