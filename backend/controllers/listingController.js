/**
 * Listing Controller
 * Handles HTTP requests for listing operations
 */

const ListingService = require('../services/listingService');
const ImageService = require('../services/imageService');
const logger = require('../utils/logger');

/**
 * Create a new listing
 * POST /api/listings
 */
const createListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingData = req.body;
    
    logger.info(`Creating listing for user: ${userId}`);
    
    const listing = await ListingService.createListing(userId, listingData);
    
    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
    
  } catch (error) {
    logger.error(`Create listing error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get listing by ID
 * GET /api/listings/:id
 */
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional for view counting
    
    const listing = await ListingService.getListingById(id, userId);
    
    res.json({
      success: true,
      data: listing
    });
    
  } catch (error) {
    logger.error(`Get listing error: ${error.message}`);
    const status = error.message === 'Listing not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update listing
 * PUT /api/listings/:id
 */
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    logger.info(`Updating listing ${id} for user: ${userId}`);
    
    const listing = await ListingService.updateListing(id, userId, updateData);
    
    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
    
  } catch (error) {
    logger.error(`Update listing error: ${error.message}`);
    const status = error.message.includes('Unauthorized') ? 403 : 
                  error.message === 'Listing not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete listing
 * DELETE /api/listings/:id
 */
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    logger.info(`Deleting listing ${id} for user: ${userId}`);
    
    const result = await ListingService.deleteListing(id, userId);
    
    res.json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    logger.error(`Delete listing error: ${error.message}`);
    const status = error.message.includes('Unauthorized') ? 403 : 
                  error.message === 'Listing not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user's listings
 * GET /api/listings/user/me
 */
const getUserListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    
    const listings = await ListingService.getUserListings(userId, status);
    
    res.json({
      success: true,
      data: listings,
      total: listings.length
    });
    
  } catch (error) {
    logger.error(`Get user listings error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Search listings
 * GET /api/listings/search
 */
const searchListings = async (req, res) => {
  try {
    const filters = req.query;
    
    logger.info(`Searching listings with filters:`, filters);
    
    const result = await ListingService.searchListings(filters);
    
    res.json({
      success: true,
      data: result.listings,
      pagination: result.pagination
    });
    
  } catch (error) {
    logger.error(`Search listings error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all listings (with basic filters)
 * GET /api/listings
 */
const getAllListings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filters = {
      page,
      limit,
      category,
      status,
      sortBy,
      sortOrder
    };
    
    const result = await ListingService.searchListings(filters);
    
    res.json({
      success: true,
      data: result.listings,
      pagination: result.pagination
    });
    
  } catch (error) {
    logger.error(`Get all listings error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get featured listings
 * GET /api/listings/featured
 */
const getFeaturedListings = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const listings = await ListingService.getFeaturedListings(parseInt(limit));
    
    res.json({
      success: true,
      data: listings
    });
    
  } catch (error) {
    logger.error(`Get featured listings error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Upload listing images
 * POST /api/listings/:id/images
 */
const uploadListingImages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const files = req.files;
    
    logger.info(`Upload request received for listing ${id} from user ${userId}`);
    
    if (!files || files.length === 0) {
      logger.warn('No files provided in upload request');
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }
    
    logger.info(`Processing ${files.length} images for listing ${id}`);
    
    // Validate files first
    for (const file of files) {
      if (!file.buffer) {
        logger.error('File missing buffer data');
        return res.status(400).json({
          success: false,
          message: 'Invalid file data received'
        });
      }
    }
    
    // Process images before uploading
    const processedFiles = await Promise.all(
      files.map(async (file, index) => {
        try {
          logger.info(`Processing file ${index + 1}: ${file.originalname}, size: ${file.size}`);
          
          const processed = await ImageService.prepareForUpload(file, {
            maxWidth: 1920,
            maxHeight: 1280,
            quality: 85
          });
          
          logger.info(`File ${index + 1} processed successfully`);
          
          return {
            ...file,
            buffer: processed.optimized.buffer,
            originalSize: file.size,
            processedSize: processed.optimized.size
          };
        } catch (error) {
          logger.error(`Image processing failed for file ${index + 1}: ${error.message}`);
          throw new Error(`Failed to process image ${file.originalname}: ${error.message}`);
        }
      })
    );
    
    logger.info(`All ${processedFiles.length} files processed, uploading to Cloudinary...`);
    
    const images = await ListingService.uploadListingImages(id, userId, processedFiles);
    
    logger.info(`Successfully uploaded ${images.length} images for listing ${id}`);
    
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: images
    });
    
  } catch (error) {
    logger.error(`Upload listing images error: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
    
    const status = error.message.includes('Unauthorized') ? 403 : 
                  error.message.includes('not found') ? 404 : 
                  error.message.includes('limit') ? 400 : 500;
    
    res.status(status).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Delete listing image
 * DELETE /api/listings/:id/images/:publicId
 */
const deleteListingImage = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const userId = req.user.id;
    
    // Decode publicId (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const images = await ListingService.deleteListingImage(id, userId, decodedPublicId);
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: images
    });
    
  } catch (error) {
    logger.error(`Delete listing image error: ${error.message}`);
    const status = error.message.includes('Unauthorized') ? 403 : 
                  error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Set primary image
 * PUT /api/listings/:id/images/:publicId/primary
 */
const setPrimaryImage = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const userId = req.user.id;
    
    const decodedPublicId = decodeURIComponent(publicId);
    
    const images = await ListingService.setPrimaryImage(id, userId, decodedPublicId);
    
    res.json({
      success: true,
      message: 'Primary image updated successfully',
      data: images
    });
    
  } catch (error) {
    logger.error(`Set primary image error: ${error.message}`);
    const status = error.message.includes('Unauthorized') ? 403 : 
                  error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Publish listing
 * PUT /api/listings/:id/publish
 */
const publishListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const listing = await ListingService.publishListing(id, userId);
    
    res.json({
      success: true,
      message: 'Listing published successfully',
      data: listing
    });
    
  } catch (error) {
    logger.error(`Publish listing error: ${error.message}`);
    const status = error.message.includes('Unauthorized') ? 403 : 
                  error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get listing statistics
 * GET /api/listings/user/stats
 */
const getListingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await ListingService.getListingStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    logger.error(`Get listing stats error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get listings by category
 * GET /api/listings/category/:category
 */
const getListingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const result = await ListingService.searchListings({
      category,
      page,
      limit,
      status: 'active'
    });
    
    res.json({
      success: true,
      data: result.listings,
      pagination: result.pagination
    });
    
  } catch (error) {
    logger.error(`Get listings by category error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get nearby listings
 * GET /api/listings/nearby
 */
const getNearbyListings = async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const result = await ListingService.searchListings({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseInt(radius),
      status: 'active'
    });
    
    res.json({
      success: true,
      data: result.listings,
      pagination: result.pagination
    });
    
  } catch (error) {
    logger.error(`Get nearby listings error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createListing,
  getListingById,
  updateListing,
  deleteListing,
  getUserListings,
  searchListings,
  getAllListings,
  getFeaturedListings,
  uploadListingImages,
  deleteListingImage,
  setPrimaryImage,
  publishListing,
  getListingStats,
  getListingsByCategory,
  getNearbyListings
};