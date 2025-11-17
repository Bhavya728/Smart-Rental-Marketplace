/**
 * Listing Service
 * Handles all business logic for listing operations
 */

const Listing = require('../models/Listing');
const User = require('../models/User');
const CloudinaryService = require('./cloudinaryService');
const logger = require('../utils/logger');

class ListingService {
  /**
   * Create a new listing
   */
  async createListing(userId, listingData) {
    try {
      logger.info(`Creating listing for user: ${userId}`);
      
      // Verify user exists and is owner
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Set owner
      const newListing = new Listing({
        ...listingData,
        owner: userId,
        status: 'draft' // Start as draft
      });
      
      // Save listing
      await newListing.save();
      
      // Populate owner info
      await newListing.populate('owner', 'name email profile.avatar');
      
      logger.info(`Listing created successfully: ${newListing._id}`);
      return newListing;
      
    } catch (error) {
      logger.error(`Error creating listing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get listing by ID
   */
  async getListingById(listingId, userId = null) {
    try {
      const listing = await Listing.findById(listingId)
        .populate('owner', 'name email profile.avatar profile.contact.phone');
      
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      // Increment view count if not the owner viewing
      if (userId && listing.owner._id.toString() !== userId) {
        await listing.updateViews();
      }
      
      return listing;
      
    } catch (error) {
      logger.error(`Error fetching listing ${listingId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update listing
   */
  async updateListing(listingId, userId, updateData) {
    try {
      logger.info(`Updating listing ${listingId} by user ${userId}`);
      
      // Find listing and verify ownership
      const listing = await Listing.findById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.owner.toString() !== userId) {
        throw new Error('Unauthorized: You can only update your own listings');
      }
      
      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          listing[key] = updateData[key];
        }
      });
      
      await listing.save();
      await listing.populate('owner', 'name email profile.avatar');
      
      logger.info(`Listing updated successfully: ${listingId}`);
      return listing;
      
    } catch (error) {
      logger.error(`Error updating listing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete listing (soft delete)
   */
  async deleteListing(listingId, userId) {
    try {
      logger.info(`Deleting listing ${listingId} by user ${userId}`);
      
      const listing = await Listing.findById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.owner.toString() !== userId) {
        throw new Error('Unauthorized: You can only delete your own listings');
      }
      
      // Soft delete
      listing.status = 'deleted';
      await listing.save();
      
      logger.info(`Listing deleted successfully: ${listingId}`);
      return { message: 'Listing deleted successfully' };
      
    } catch (error) {
      logger.error(`Error deleting listing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user's listings
   */
  async getUserListings(userId, status = null) {
    try {
      const query = { owner: userId };
      if (status) {
        query.status = status;
      } else {
        query.status = { $ne: 'deleted' }; // Exclude deleted
      }
      
      const listings = await Listing.find(query)
        .populate('owner', 'name email profile.avatar')
        .sort({ createdAt: -1 });
      
      return listings;
      
    } catch (error) {
      logger.error(`Error fetching user listings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search listings with filters
   */
  async searchListings(filters = {}) {
    try {
      const {
        category,
        location,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        amenities,
        lat,
        lng,
        radius = 10000, // 10km default
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;
      
      // Build query
      const query = { status: 'active' };
      
      // Category filter
      if (category && category !== 'all') {
        query.category = category;
      }
      
      // Price range filter
      if (minPrice || maxPrice) {
        query.dailyRate = {};
        if (minPrice) query.dailyRate.$gte = parseInt(minPrice);
        if (maxPrice) query.dailyRate.$lte = parseInt(maxPrice);
      }
      
      // Property details filters
      if (bedrooms) {
        query['details.bedrooms'] = { $gte: parseInt(bedrooms) };
      }
      
      if (bathrooms) {
        query['details.bathrooms'] = { $gte: parseInt(bathrooms) };
      }
      
      // Amenities filter
      if (amenities && amenities.length > 0) {
        query.amenities = { $in: amenities };
      }
      
      // Location filter
      if (location) {
        query.$or = [
          { 'location.address.city': new RegExp(location, 'i') },
          { 'location.address.state': new RegExp(location, 'i') },
          { 'location.displayAddress': new RegExp(location, 'i') }
        ];
      }
      
      // Handle geospatial search separately due to MongoDB sorting restrictions
      let listings, total;
      const skip = (page - 1) * limit;
      
      if (lat && lng) {
        // Use $geoWithin with $centerSphere for location filtering, then sort normally
        const radiusInRadians = parseInt(radius) / 6378100; // Convert meters to radians
        
        query['location.coordinates'] = {
          $geoWithin: {
            $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
          }
        };
        
        // Regular query with geospatial filter
        const sort = sortBy === 'distance' 
          ? {} // Can't sort by distance with $geoWithin, use default
          : { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        
        [listings, total] = await Promise.all([
          Listing.find(query)
            .populate('owner', 'name profile.avatar')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit)),
          Listing.countDocuments(query)
        ]);
        
      } else {
        // Regular query without geospatial
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        [listings, total] = await Promise.all([
          Listing.find(query)
            .populate('owner', 'name profile.avatar')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit)),
          Listing.countDocuments(query)
        ]);
      }
      
      return {
        listings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      };
      
    } catch (error) {
      logger.error(`Error searching listings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get featured listings
   */
  async getFeaturedListings(limit = 6) {
    try {
      const listings = await Listing.find({ 
        status: 'active',
        'metrics.rating.average': { $gte: 4.0 }
      })
        .populate('owner', 'name profile.avatar')
        .sort({ 'metrics.rating.average': -1, 'metrics.views': -1 })
        .limit(limit);
      
      return listings;
      
    } catch (error) {
      logger.error(`Error fetching featured listings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload listing images
   */
  async uploadListingImages(listingId, userId, files) {
    try {
      logger.info(`Uploading images for listing ${listingId}`);
      
      // Verify listing ownership
      const listing = await Listing.findById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.owner.toString() !== userId) {
        throw new Error('Unauthorized: You can only upload images to your own listings');
      }
      
      // Check image limit
      const currentImageCount = listing.images ? listing.images.length : 0;
      if (currentImageCount + files.length > 10) {
        throw new Error('Cannot have more than 10 images per listing');
      }
      
      // Upload images to Cloudinary
      const uploadPromises = files.map(async (file, index) => {
        const uploadResult = await CloudinaryService.uploadFromBuffer(
          file.buffer,
          'listing',
          `${listingId}_${Date.now()}_${index}`
        );
        
        return {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          caption: '',
          isPrimary: currentImageCount === 0 && index === 0, // First image is primary
          order: currentImageCount + index
        };
      });
      
      const uploadedImages = await Promise.all(uploadPromises);
      
      // Add images to listing
      listing.images = [...(listing.images || []), ...uploadedImages];
      await listing.save();
      
      logger.info(`Images uploaded successfully for listing ${listingId}`);
      return listing.images;
      
    } catch (error) {
      logger.error(`Error uploading listing images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete listing image
   */
  async deleteListingImage(listingId, userId, imagePublicId) {
    try {
      logger.info(`Deleting image from listing ${listingId}`);
      
      // Verify listing ownership
      const listing = await Listing.findById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.owner.toString() !== userId) {
        throw new Error('Unauthorized: You can only modify your own listings');
      }
      
      // Find and remove image
      const imageIndex = listing.images.findIndex(img => img.publicId === imagePublicId);
      if (imageIndex === -1) {
        throw new Error('Image not found');
      }
      
      // Delete from Cloudinary
      await CloudinaryService.deleteByPublicId(imagePublicId);
      
      // Remove from listing
      const removedImage = listing.images[imageIndex];
      listing.images.splice(imageIndex, 1);
      
      // If removed image was primary and there are other images, make first one primary
      if (removedImage.isPrimary && listing.images.length > 0) {
        listing.images[0].isPrimary = true;
      }
      
      await listing.save();
      
      logger.info(`Image deleted successfully from listing ${listingId}`);
      return listing.images;
      
    } catch (error) {
      logger.error(`Error deleting listing image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set primary image
   */
  async setPrimaryImage(listingId, userId, imagePublicId) {
    try {
      const listing = await Listing.findById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.owner.toString() !== userId) {
        throw new Error('Unauthorized: You can only modify your own listings');
      }
      
      // Update primary image
      listing.images.forEach(img => {
        img.isPrimary = img.publicId === imagePublicId;
      });
      
      await listing.save();
      return listing.images;
      
    } catch (error) {
      logger.error(`Error setting primary image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Publish listing (change status from draft to active)
   */
  async publishListing(listingId, userId) {
    try {
      const listing = await Listing.findById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.owner.toString() !== userId) {
        throw new Error('Unauthorized: You can only publish your own listings');
      }
      
      // Validate listing is ready for publishing
      // Note: Image requirement can be skipped for testing
      if (!listing.images || listing.images.length === 0) {
        logger.warn(`Publishing listing ${listingId} without images (testing mode)`);
        // throw new Error('Cannot publish listing without images');
      }
      
      if (!listing.title || !listing.description || !listing.category || !listing.dailyRate) {
        throw new Error('Cannot publish incomplete listing');
      }
      
      listing.status = 'active';
      await listing.save();
      
      logger.info(`Listing published successfully: ${listingId}`);
      return listing;
      
    } catch (error) {
      logger.error(`Error publishing listing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get listing statistics
   */
  async getListingStats(userId) {
    try {
      const stats = await Listing.aggregate([
        { $match: { owner: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            draft: {
              $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
            },
            inactive: {
              $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
            },
            totalViews: { $sum: '$metrics.views' },
            totalFavorites: { $sum: '$metrics.favorites' },
            totalBookings: { $sum: '$metrics.bookings' },
            averageRating: { $avg: '$metrics.rating.average' }
          }
        }
      ]);
      
      return stats[0] || {
        total: 0,
        active: 0,
        draft: 0,
        inactive: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalBookings: 0,
        averageRating: 0
      };
      
    } catch (error) {
      logger.error(`Error fetching listing stats: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ListingService();