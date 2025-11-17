const { cloudinary, uploadOptions } = require('../config/cloudinary');
const logger = require('../utils/logger');

/**
 * Cloudinary Service - Handles image upload, delete, and management
 */
class CloudinaryService {

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(file, type = 'profile', userId = null) {
    try {
      if (!file) {
        throw new Error('No file provided for upload');
      }

      // Get upload options based on type
      const options = uploadOptions[type] || uploadOptions.profile;
      
      // Add unique identifier to folder structure
      if (userId) {
        options.folder = `${options.folder}/${userId}`;
      }

      // Generate unique public_id
      options.public_id = `${type}_${Date.now()}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path || file.buffer, {
        ...options,
        resource_type: 'image'
      });

      logger.info(`Image uploaded successfully: ${result.public_id}`);

      return {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at
      };

    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Upload image from buffer
   */
  async uploadFromBuffer(buffer, type = 'profile', customPublicId = null) {
    try {
      if (!buffer) {
        throw new Error('No buffer provided for upload');
      }

      // Get upload options based on type
      const options = { ...uploadOptions[type] } || { ...uploadOptions.profile };
      
      // Generate unique public_id
      if (customPublicId) {
        options.public_id = customPublicId;
      } else {
        options.public_id = `${type}_${Date.now()}`;
      }

      // Convert buffer to base64 data URI
      const dataURI = `data:image/jpeg;base64,${buffer.toString('base64')}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        ...options,
        resource_type: 'image'
      });

      logger.info(`Image uploaded from buffer successfully: ${result.public_id}`);

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at
      };

    } catch (error) {
      logger.error('Cloudinary buffer upload error:', {
        message: error.message,
        name: error.name,
        http_code: error.http_code,
        error: error.error
      });
      
      // Provide more specific error messages
      let errorMessage = 'Image upload failed';
      if (error.message.includes('Invalid image file')) {
        errorMessage = 'Invalid image file format';
      } else if (error.message.includes('File size too large')) {
        errorMessage = 'File size exceeds maximum allowed limit';
      } else if (error.http_code === 401) {
        errorMessage = 'Cloudinary authentication failed';
      } else if (error.http_code === 400) {
        errorMessage = 'Invalid upload parameters';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId) {
    try {
      if (!publicId) {
        throw new Error('Public ID is required for deletion');
      }

      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        logger.info(`Image deleted successfully: ${publicId}`);
        return { success: true, result: result.result };
      } else {
        logger.warn(`Image deletion failed or image not found: ${publicId}`);
        return { success: false, result: result.result };
      }

    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple images from Cloudinary
   */
  async deleteMultipleImages(publicIds) {
    try {
      if (!Array.isArray(publicIds) || publicIds.length === 0) {
        throw new Error('Public IDs array is required for deletion');
      }

      const result = await cloudinary.api.delete_resources(publicIds);
      
      logger.info(`Multiple images deletion completed for: ${publicIds.join(', ')}`);
      return result;

    } catch (error) {
      logger.error('Cloudinary multiple delete error:', error);
      throw new Error(`Multiple images deletion failed: ${error.message}`);
    }
  }

  /**
   * Get image transformation URL
   */
  getTransformedUrl(publicId, transformations = {}) {
    try {
      if (!publicId) {
        throw new Error('Public ID is required for transformation');
      }

      const url = cloudinary.url(publicId, {
        ...transformations,
        secure: true
      });

      return url;

    } catch (error) {
      logger.error('Cloudinary transformation error:', error);
      throw new Error(`Image transformation failed: ${error.message}`);
    }
  }

  /**
   * Generate different size variants of an image
   */
  generateImageVariants(publicId) {
    try {
      if (!publicId) {
        throw new Error('Public ID is required for variants');
      }

      return {
        thumbnail: this.getTransformedUrl(publicId, {
          width: 150,
          height: 150,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto:eco'
        }),
        small: this.getTransformedUrl(publicId, {
          width: 300,
          height: 300,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto:good'
        }),
        medium: this.getTransformedUrl(publicId, {
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto:good'
        }),
        large: this.getTransformedUrl(publicId, {
          width: 800,
          height: 800,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto:best'
        }),
        original: this.getTransformedUrl(publicId, {
          quality: 'auto:best'
        })
      };

    } catch (error) {
      logger.error('Image variants generation error:', error);
      throw new Error(`Image variants generation failed: ${error.message}`);
    }
  }

  /**
   * Get upload signature for direct client uploads
   */
  generateUploadSignature(folder, timestamp) {
    try {
      const params = {
        timestamp: timestamp || Math.round(new Date().getTime() / 1000),
        folder: folder || 'smart-rental/temp'
      };

      const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

      return {
        signature,
        timestamp: params.timestamp,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        folder: params.folder
      };

    } catch (error) {
      logger.error('Cloudinary signature generation error:', error);
      throw new Error(`Upload signature generation failed: ${error.message}`);
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file, type = 'profile') {
    const options = uploadOptions[type] || uploadOptions.profile;
    const errors = [];

    // Check file type
    if (file.mimetype && !file.mimetype.startsWith('image/')) {
      errors.push('File must be an image');
    }

    // Check file extension
    if (file.originalname) {
      const ext = file.originalname.split('.').pop().toLowerCase();
      if (!options.allowed_formats.includes(ext)) {
        errors.push(`Allowed formats: ${options.allowed_formats.join(', ')}`);
      }
    }

    // Check file size
    if (file.size > options.max_file_size) {
      const maxSizeMB = (options.max_file_size / (1024 * 1024)).toFixed(1);
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get folder statistics
   */
  async getFolderStats(folder) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 500
      });

      const totalSize = result.resources.reduce((sum, resource) => sum + resource.bytes, 0);

      return {
        count: result.resources.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        resources: result.resources.map(r => ({
          public_id: r.public_id,
          url: r.secure_url,
          size: r.bytes,
          created_at: r.created_at
        }))
      };

    } catch (error) {
      logger.error('Cloudinary folder stats error:', error);
      throw new Error(`Folder statistics retrieval failed: ${error.message}`);
    }
  }
}

module.exports = new CloudinaryService();