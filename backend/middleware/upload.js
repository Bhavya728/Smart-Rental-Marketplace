const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');
const cloudinaryService = require('../services/cloudinaryService');

/**
 * Multer configuration for file uploads
 */

// Memory storage configuration (files stored in memory as Buffer)
const memoryStorage = multer.memoryStorage();

// Disk storage configuration (files stored temporarily on disk)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use temp directory for temporary storage
    cb(null, path.join(__dirname, '../temp/uploads/'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

/**
 * File filter function to validate file types
 */
const fileFilter = (allowedTypes = ['image']) => {
  return (req, file, cb) => {
    try {
      const fileType = file.mimetype.split('/')[0];
      
      if (allowedTypes.includes(fileType)) {
        cb(null, true);
      } else {
        cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed`), false);
      }
    } catch (error) {
      cb(error, false);
    }
  };
};

/**
 * Create multer instance with custom configuration
 */
const createMulterInstance = (options = {}) => {
  const {
    storage = 'memory', // 'memory' or 'disk'
    fileSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image'],
    fileCount = 1
  } = options;

  const multerConfig = {
    storage: storage === 'disk' ? diskStorage : memoryStorage,
    limits: {
      fileSize: fileSize,
      files: fileCount
    },
    fileFilter: fileFilter(allowedTypes)
  };

  return multer(multerConfig);
};

/**
 * Profile photo upload middleware
 */
const profilePhotoUpload = createMulterInstance({
  storage: 'memory',
  fileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image'],
  fileCount: 1
});

/**
 * Listing photos upload middleware (for future use)
 */
const listingPhotosUpload = createMulterInstance({
  storage: 'memory',
  fileSize: 10 * 1024 * 1024, // 10MB per file
  allowedTypes: ['image'],
  fileCount: 10 // Allow up to 10 photos per listing
});

/**
 * Document upload middleware (for future use)
 */
const documentUpload = createMulterInstance({
  storage: 'memory',
  fileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image', 'application'], // Allow images and PDFs
  fileCount: 5
});

/**
 * Middleware to validate uploaded files
 */
const validateUpload = (type = 'profile') => {
  return (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const files = req.files || [req.file];
      const errors = [];

      files.forEach((file, index) => {
        const validation = cloudinaryService.validateImageFile(file, type);
        if (!validation.isValid) {
          errors.push(`File ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'File validation failed',
          errors
        });
      }

      next();
    } catch (error) {
      logger.error('File validation error:', error);
      res.status(500).json({
        success: false,
        message: 'File validation error',
        error: error.message
      });
    }
  };
};

/**
 * Error handling middleware for multer
 */
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size is too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many form fields';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name is too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value is too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many form fields';
        break;
      default:
        message = error.message;
    }

    logger.error('Multer error:', error);
    return res.status(400).json({
      success: false,
      message,
      error: error.code
    });
  }

  // Handle other errors
  if (error.message.includes('Only') && error.message.includes('files are allowed')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

/**
 * Cleanup temporary files middleware
 */
const cleanupTempFiles = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Cleanup temporary files if they exist
    if (req.file && req.file.path) {
      const fs = require('fs');
      fs.unlink(req.file.path, (err) => {
        if (err) logger.warn('Failed to cleanup temp file:', req.file.path);
      });
    }
    
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (file.path) {
          const fs = require('fs');
          fs.unlink(file.path, (err) => {
            if (err) logger.warn('Failed to cleanup temp file:', file.path);
          });
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Create upload directory if it doesn't exist
 */
const ensureUploadDir = () => {
  const fs = require('fs');
  const uploadDir = path.join(__dirname, '../temp/uploads/');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info('Upload directory created:', uploadDir);
  }
};

// Initialize upload directory
ensureUploadDir();

module.exports = {
  // Multer instances
  profilePhotoUpload: profilePhotoUpload.single('profilePhoto'),
  listingPhotosUpload: listingPhotosUpload.array('listingPhotos', 10),
  documentUpload: documentUpload.array('documents', 5),
  
  // Custom multer instance creator
  createMulterInstance,
  
  // Validation middleware
  validateUpload,
  
  // Error handling
  handleMulterError,
  
  // Cleanup
  cleanupTempFiles,
  
  // Utility
  ensureUploadDir
};