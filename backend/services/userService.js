const User = require('../models/User');
const logger = require('../utils/logger');
const { cloudinary } = require('../config/cloudinary');

/**
 * User Service - Handles user profile operations
 */
class UserService {
  
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID (public view - limited info)
   */
  async getPublicUserProfile(userId) {
    try {
      const user = await User.findById(userId)
        .select('name profile_photo bio location rating_avg rating_count role createdAt socialLinks')
        .lean();
      
      if (!user) {
        throw new Error('User not found');
      }

      // Filter location based on privacy settings
      const userWithPrivacy = await User.findById(userId).select('preferences.privacy');
      if (!userWithPrivacy?.preferences?.privacy?.showLocation) {
        delete user.location;
      }

      return user;
    } catch (error) {
      logger.error('Get public user profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    try {
      // Define allowed fields for profile update
      const allowedFields = [
        'name.firstName', 'name.lastName', 'bio', 'phone', 
        'location', 'preferences', 'socialLinks'
      ];

      // Simplified update object - use direct object updates instead of dot notation
      const updateObject = {};
      
      // Handle allowed top-level fields
      const directFields = ['bio', 'phone'];
      directFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateObject[field] = updateData[field];
        }
      });

      // First check if user exists and get current data
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Handle nested objects as complete objects (safer for MongoDB)
      if (updateData.name && (updateData.name.firstName !== undefined || updateData.name.lastName !== undefined)) {
        updateObject.name = {
          firstName: updateData.name.firstName || existingUser.name?.firstName || '',
          lastName: updateData.name.lastName || existingUser.name?.lastName || ''
        };
      }

      if (updateData.location) {
        updateObject.location = { ...existingUser.location?.toObject() || {} };
        
        if (updateData.location.address) {
          updateObject.location.address = {
            ...updateObject.location.address,
            ...updateData.location.address
          };
        }
        
        if (updateData.location.coordinates) {
          updateObject.location.coordinates = updateData.location.coordinates;
        }
      }

      if (updateData.preferences) {
        updateObject.preferences = { ...existingUser.preferences?.toObject() || {} };
        Object.keys(updateData.preferences).forEach(category => {
          if (typeof updateData.preferences[category] === 'object' && updateData.preferences[category] !== null) {
            updateObject.preferences[category] = {
              ...updateObject.preferences[category],
              ...updateData.preferences[category]
            };
          }
        });
      }

      if (updateData.socialLinks) {
        updateObject.socialLinks = {
          ...existingUser.socialLinks?.toObject() || {},
          ...updateData.socialLinks
        };
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateObject },
        { 
          new: true, 
          runValidators: true,
          select: '-password'
        }
      );

      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`User profile updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile photo
   */
  async updateProfilePhoto(userId, photoUrl, publicId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Delete old profile photo from Cloudinary if exists
      if (user.profile_photo?.public_id) {
        try {
          await cloudinary.uploader.destroy(user.profile_photo.public_id);
        } catch (error) {
          logger.warn('Failed to delete old profile photo:', error);
        }
      }

      // Update user with new photo
      user.profile_photo = {
        url: photoUrl,
        public_id: publicId
      };

      await user.save();
      
      logger.info(`Profile photo updated for user: ${user.email}`);
      return user.toJSON();
    } catch (error) {
      logger.error('Update profile photo error:', error);
      throw error;
    }
  }

  /**
   * Delete user profile photo
   */
  async deleteProfilePhoto(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Delete photo from Cloudinary if exists
      if (user.profile_photo?.public_id) {
        try {
          await cloudinary.uploader.destroy(user.profile_photo.public_id);
        } catch (error) {
          logger.warn('Failed to delete profile photo from Cloudinary:', error);
        }
      }

      // Remove photo from user document
      user.profile_photo = {
        url: '',
        public_id: ''
      };

      await user.save();
      
      logger.info(`Profile photo deleted for user: ${user.email}`);
      return user.toJSON();
    } catch (error) {
      logger.error('Delete profile photo error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics for profile
   */
  async getUserStats(userId) {
    try {
      // This will be expanded when we have listings and bookings
      // For now, return basic stats
      const user = await User.findById(userId).select('rating_avg rating_count createdAt');
      
      if (!user) {
        throw new Error('User not found');
      }

      const stats = {
        rating: {
          average: user.rating_avg || 0,
          count: user.rating_count || 0
        },
        memberSince: user.createdAt,
        // These will be populated in future phases
        totalListings: 0,
        totalBookings: 0,
        completedBookings: 0,
        totalEarnings: 0
      };

      return stats;
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Search users (for admin or public directory)
   */
  async searchUsers(query = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      // Build search criteria
      const searchCriteria = { isActive: true };
      
      if (query.name) {
        searchCriteria.$or = [
          { 'name.firstName': new RegExp(query.name, 'i') },
          { 'name.lastName': new RegExp(query.name, 'i') }
        ];
      }

      if (query.role) {
        searchCriteria.role = query.role;
      }

      if (query.location) {
        searchCriteria['location.address.city'] = new RegExp(query.location, 'i');
      }

      const users = await User.find(searchCriteria)
        .select('name profile_photo bio location rating_avg rating_count role createdAt')
        .sort({ rating_avg: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await User.countDocuments(searchCriteria);

      return {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }

  /**
   * Calculate profile completion percentage
   */
  async getProfileCompletion(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }

      let completedFields = 0;
      const totalFields = 10; // Total fields we consider for completion

      // Check required fields (always completed if user exists)
      if (user.email) completedFields++;
      if (user.name?.firstName && user.name?.lastName) completedFields++;

      // Check optional profile fields
      if (user.bio && user.bio.length > 10) completedFields++;
      if (user.phone) completedFields++;
      if (user.profile_photo?.url) completedFields++;
      
      // Check location
      if (user.location?.address?.city && user.location?.address?.state) completedFields++;
      
      // Check verification status
      if (user.verified_status?.email) completedFields++;
      if (user.verified_status?.phone) completedFields++;
      
      // Check social links (at least one)
      const socialLinks = user.socialLinks || {};
      if (Object.values(socialLinks).some(link => link && link.length > 0)) {
        completedFields++;
      }

      // Check preferences are set
      if (user.preferences) completedFields++;

      const percentage = Math.round((completedFields / totalFields) * 100);

      return {
        percentage,
        completedFields,
        totalFields,
        missingFields: this.getMissingFields(user)
      };
    } catch (error) {
      logger.error('Get profile completion error:', error);
      throw error;
    }
  }

  /**
   * Get missing fields for profile completion
   */
  getMissingFields(user) {
    const missing = [];

    if (!user.bio || user.bio.length <= 10) missing.push('bio');
    if (!user.phone) missing.push('phone');
    if (!user.profile_photo?.url) missing.push('profile_photo');
    if (!user.location?.address?.city || !user.location?.address?.state) missing.push('location');
    if (!user.verified_status?.email) missing.push('email_verification');
    if (!user.verified_status?.phone && user.phone) missing.push('phone_verification');

    const socialLinks = user.socialLinks || {};
    if (!Object.values(socialLinks).some(link => link && link.length > 0)) {
      missing.push('social_links');
    }

    return missing;
  }
}

module.exports = new UserService();