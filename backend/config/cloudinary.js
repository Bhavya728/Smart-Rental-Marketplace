const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Cloudinary configuration
const configureCloudinary = () => {
  try {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    };
    
    // Check if all required config values are present
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      throw new Error('Missing Cloudinary configuration. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }
    
    cloudinary.config(config);
    logger.info('Cloudinary configured successfully', {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? 'configured' : 'missing'
    });
  } catch (error) {
    logger.error('Cloudinary configuration error:', error.message);
    throw error;
  }
};

// Upload options for different file types
const uploadOptions = {
  profile: {
    folder: 'smart-rental/profiles',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 5000000, // 5MB
  },
  listing: {
    folder: 'smart-rental/listings',
    transformation: [
      { width: 1200, height: 800, crop: 'fill' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 10000000, // 10MB
  },
  thumbnail: {
    folder: 'smart-rental/thumbnails',
    transformation: [
      { width: 300, height: 200, crop: 'fill' },
      { quality: 'auto:eco' },
      { fetch_format: 'auto' }
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 2000000, // 2MB
  }
};

module.exports = {
  cloudinary,
  configureCloudinary,
  uploadOptions,
};