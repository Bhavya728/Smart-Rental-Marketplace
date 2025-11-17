const userService = require('../services/userService');
const cloudinaryService = require('../services/cloudinaryService');
const logger = require('../utils/logger');

/**
 * User Profile Controller
 * Handles all user profile related operations
 */

/**
 * Get current user profile
 * GET /api/user/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message
    });
  }
};

/**
 * Get public user profile (limited info)
 * GET /api/user/profile/:userId
 */
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.getPublicUserProfile(userId);
    
    res.status(200).json({
      success: true,
      message: 'Public profile retrieved successfully',
      data: user
    });
  } catch (error) {
    logger.error('Get public profile error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve public profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * PUT /api/user/profile
 */
const updateProfile = async (req, res) => {
  try {
    const updateData = req.body;
    const user = await userService.updateUserProfile(req.user.id, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Upload profile photo
 * POST /api/user/profile/photo
 */
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }



    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadFromBuffer(
      req.file.buffer,
      'profile',
      req.user.id
    );

    // Update user profile with new photo
    const user = await userService.updateProfilePhoto(
      req.user.id,
      uploadResult.url,
      uploadResult.public_id
    );

    // Generate image variants
    const variants = cloudinaryService.generateImageVariants(uploadResult.public_id);

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        user,
        photo: {
          ...uploadResult,
          variants
        }
      }
    });
  } catch (error) {
    logger.error('Upload profile photo error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message
    });
  }
};

/**
 * Delete profile photo
 * DELETE /api/user/profile/photo
 */
const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await userService.deleteProfilePhoto(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Profile photo deleted successfully',
      data: user
    });
  } catch (error) {
    logger.error('Delete profile photo error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile photo',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 * GET /api/user/profile/stats
 */
const getUserStats = async (req, res) => {
  try {
    // Guard: ensure authenticated user id exists
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userId = req.user.id || req.user._id;
    const stats = await userService.getUserStats(userId);
    
    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics',
      error: error.message
    });
  }
};

/**
 * Get profile completion status
 * GET /api/user/profile/completion
 */
const getProfileCompletion = async (req, res) => {
  try {
    // Guard: ensure authenticated user id exists
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userId = req.user.id || req.user._id;
    const completion = await userService.getProfileCompletion(userId);
    
    res.status(200).json({
      success: true,
      message: 'Profile completion retrieved successfully',
      data: completion
    });
  } catch (error) {
    logger.error('Get profile completion error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile completion',
      error: error.message
    });
  }
};

/**
 * Search users (public directory)
 * GET /api/user/search
 */
const searchUsers = async (req, res) => {
  try {
    const { name, role, location, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (name) query.name = name;
    if (role) query.role = role;
    if (location) query.location = location;
    
    const result = await userService.searchUsers(
      query,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Search users error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
};

/**
 * Generate upload signature for direct Cloudinary uploads
 * GET /api/user/upload-signature
 */
const getUploadSignature = async (req, res) => {
  try {
    const { folder = 'profile' } = req.query;
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const signature = cloudinaryService.generateUploadSignature(
      `smart-rental/${folder}/${req.user.id}`,
      timestamp
    );
    
    res.status(200).json({
      success: true,
      message: 'Upload signature generated successfully',
      data: signature
    });
  } catch (error) {
    logger.error('Generate upload signature error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature',
      error: error.message
    });
  }
};

/**
 * Update user preferences
 * PUT /api/user/profile/preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferences data'
      });
    }
    
    const user = await userService.updateUserProfile(req.user.id, { preferences });
    
    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

/**
 * Get image transformation URL
 * POST /api/user/image/transform
 */
const getImageTransformation = async (req, res) => {
  try {
    const { publicId, transformations } = req.body;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }
    
    const transformedUrl = cloudinaryService.getTransformedUrl(publicId, transformations);
    
    res.status(200).json({
      success: true,
      message: 'Image transformation URL generated successfully',
      data: { url: transformedUrl }
    });
  } catch (error) {
    logger.error('Image transformation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate image transformation',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  getPublicProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  getUserStats,
  getProfileCompletion,
  searchUsers,
  getUploadSignature,
  updatePreferences,
  getImageTransformation
};