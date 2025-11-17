/**
 * Image Service
 * Handles image processing, optimization, and manipulation for listings
 */

const sharp = require('sharp');
const logger = require('../utils/logger');

class ImageService {
  constructor() {
    // Image processing configuration
    this.config = {
      // Supported image formats
      supportedFormats: ['jpeg', 'jpg', 'png', 'webp'],
      
      // Maximum file size (5MB)
      maxFileSize: 5 * 1024 * 1024,
      
      // Image dimensions
      dimensions: {
        thumbnail: { width: 300, height: 200 },
        small: { width: 600, height: 400 },
        medium: { width: 1200, height: 800 },
        large: { width: 1920, height: 1280 }
      },
      
      // Quality settings
      quality: {
        jpeg: 85,
        webp: 80,
        png: 90
      }
    };
  }

  /**
   * Validate image file
   */
  validateImage(file) {
    try {
      // Check file size
      if (file.size > this.config.maxFileSize) {
        throw new Error(`File size too large. Maximum allowed: ${this.config.maxFileSize / (1024 * 1024)}MB`);
      }

      // Check file type
      const fileType = file.mimetype.split('/')[1];
      if (!this.config.supportedFormats.includes(fileType)) {
        throw new Error(`Unsupported file format. Allowed: ${this.config.supportedFormats.join(', ')}`);
      }

      return true;
    } catch (error) {
      logger.error(`Image validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process image for different sizes
   */
  async processImage(buffer, options = {}) {
    try {
      const {
        format = 'jpeg',
        quality = this.config.quality.jpeg,
        width,
        height,
        maintainAspectRatio = true
      } = options;

      let processor = sharp(buffer);

      // Get original image metadata
      const metadata = await processor.metadata();
      logger.info(`Processing image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

      // Resize if dimensions specified
      if (width || height) {
        const resizeOptions = {};
        if (width) resizeOptions.width = width;
        if (height) resizeOptions.height = height;
        
        if (maintainAspectRatio) {
          resizeOptions.fit = 'inside';
          resizeOptions.withoutEnlargement = true;
        }

        processor = processor.resize(resizeOptions);
      }

      // Auto-rotate based on EXIF data
      processor = processor.rotate();

      // Apply format and quality
      switch (format) {
        case 'jpeg':
        case 'jpg':
          processor = processor.jpeg({ 
            quality,
            progressive: true,
            mozjpeg: true 
          });
          break;
        case 'webp':
          processor = processor.webp({ 
            quality: this.config.quality.webp,
            effort: 6 
          });
          break;
        case 'png':
          processor = processor.png({ 
            quality: this.config.quality.png,
            compressionLevel: 9 
          });
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      const processedBuffer = await processor.toBuffer();
      
      logger.info(`Image processed successfully. Size reduced from ${buffer.length} to ${processedBuffer.length} bytes`);
      
      return {
        buffer: processedBuffer,
        originalSize: buffer.length,
        processedSize: processedBuffer.length,
        compressionRatio: ((buffer.length - processedBuffer.length) / buffer.length * 100).toFixed(2)
      };

    } catch (error) {
      logger.error(`Image processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate multiple image sizes
   */
  async generateImageSizes(buffer, baseFilename) {
    try {
      const sizes = {};
      
      // Generate different sizes
      for (const [sizeName, dimensions] of Object.entries(this.config.dimensions)) {
        const processed = await this.processImage(buffer, {
          width: dimensions.width,
          height: dimensions.height,
          format: 'jpeg',
          maintainAspectRatio: true
        });
        
        sizes[sizeName] = {
          buffer: processed.buffer,
          filename: `${baseFilename}_${sizeName}.jpg`,
          width: dimensions.width,
          height: dimensions.height,
          size: processed.processedSize
        };
      }

      // Also create WebP versions for modern browsers
      for (const [sizeName, dimensions] of Object.entries(this.config.dimensions)) {
        const processed = await this.processImage(buffer, {
          width: dimensions.width,
          height: dimensions.height,
          format: 'webp',
          maintainAspectRatio: true
        });
        
        sizes[`${sizeName}_webp`] = {
          buffer: processed.buffer,
          filename: `${baseFilename}_${sizeName}.webp`,
          width: dimensions.width,
          height: dimensions.height,
          size: processed.processedSize
        };
      }

      logger.info(`Generated ${Object.keys(sizes).length} image sizes for ${baseFilename}`);
      return sizes;

    } catch (error) {
      logger.error(`Failed to generate image sizes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Optimize image for web
   */
  async optimizeForWeb(buffer, options = {}) {
    try {
      const {
        maxWidth = 1920,
        maxHeight = 1280,
        quality = 85,
        format = 'jpeg'
      } = options;

      return await this.processImage(buffer, {
        width: maxWidth,
        height: maxHeight,
        format,
        quality,
        maintainAspectRatio: true
      });

    } catch (error) {
      logger.error(`Web optimization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(buffer, options = {}) {
    try {
      const {
        width = 300,
        height = 200,
        quality = 80,
        format = 'jpeg'
      } = options;

      return await this.processImage(buffer, {
        width,
        height,
        format,
        quality,
        maintainAspectRatio: true
      });

    } catch (error) {
      logger.error(`Thumbnail creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract image metadata
   */
  async getImageMetadata(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
        colorSpace: metadata.space,
        channels: metadata.channels,
        aspectRatio: (metadata.width / metadata.height).toFixed(2)
      };

    } catch (error) {
      logger.error(`Failed to extract metadata: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add watermark to image
   */
  async addWatermark(buffer, watermarkBuffer, options = {}) {
    try {
      const {
        position = 'southeast',
        opacity = 0.5,
        margin = 10
      } = options;

      // Create semi-transparent watermark
      const watermark = await sharp(watermarkBuffer)
        .resize(200, 50, { fit: 'inside' })
        .png({ quality: 90 })
        .composite([{
          input: Buffer.alloc(4, Math.floor(255 * opacity)),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in'
        }])
        .toBuffer();

      const watermarkedImage = await sharp(buffer)
        .composite([{
          input: watermark,
          gravity: position,
          blend: 'over'
        }])
        .jpeg({ quality: 85 })
        .toBuffer();

      logger.info('Watermark added successfully');
      return watermarkedImage;

    } catch (error) {
      logger.error(`Watermark addition failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert image format
   */
  async convertFormat(buffer, targetFormat, options = {}) {
    try {
      const { quality = 85 } = options;

      const converted = await this.processImage(buffer, {
        format: targetFormat,
        quality
      });

      logger.info(`Image converted to ${targetFormat}`);
      return converted;

    } catch (error) {
      logger.error(`Format conversion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch process images
   */
  async batchProcess(images, processingOptions = {}) {
    try {
      logger.info(`Starting batch processing of ${images.length} images`);
      
      const results = await Promise.all(
        images.map(async (image, index) => {
          try {
            const result = await this.processImage(image.buffer, {
              ...processingOptions,
              ...image.options
            });
            
            return {
              index,
              success: true,
              data: result,
              filename: image.filename || `image_${index}`
            };
          } catch (error) {
            logger.error(`Failed to process image ${index}: ${error.message}`);
            return {
              index,
              success: false,
              error: error.message,
              filename: image.filename || `image_${index}`
            };
          }
        })
      );

      const successful = results.filter(r => r.success).length;
      logger.info(`Batch processing completed: ${successful}/${images.length} successful`);
      
      return results;

    } catch (error) {
      logger.error(`Batch processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate and prepare image for upload
   */
  async prepareForUpload(file, options = {}) {
    try {
      // Validate the image
      this.validateImage(file);
      
      // Extract metadata
      const metadata = await this.getImageMetadata(file.buffer);
      
      // Optimize for web upload
      const optimized = await this.optimizeForWeb(file.buffer, options);
      
      // Create thumbnail
      const thumbnail = await this.createThumbnail(file.buffer);
      
      return {
        original: {
          buffer: file.buffer,
          size: file.size,
          mimetype: file.mimetype
        },
        optimized: {
          buffer: optimized.buffer,
          size: optimized.processedSize,
          compressionRatio: optimized.compressionRatio
        },
        thumbnail: {
          buffer: thumbnail.buffer,
          size: thumbnail.processedSize
        },
        metadata
      };

    } catch (error) {
      logger.error(`Image preparation failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ImageService();