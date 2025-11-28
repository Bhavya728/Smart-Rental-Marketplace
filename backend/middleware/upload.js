const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');
const logger = require('../utils/logger');
const cloudinaryService = require('../services/cloudinaryService');

// Detect Vercel serverless
const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

// Upload directory
const uploadDir = isVercel
  ? path.join(os.tmpdir(), "uploads")                   // /tmp/uploads on Vercel
  : path.join(__dirname, "../temp/uploads/");           // local folder

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info("Created upload directory:", uploadDir);
  } catch (err) {
    console.warn("Could not create upload directory:", uploadDir, err);
  }
}

/**
 * MULTER SETUP
 */

// Memory storage (safe for cloud uploads)
const memoryStorage = multer.memoryStorage();

// Disk storage (ONLY safe locally or within /tmp)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

/**
 * File filter
 */
const fileFilter = (allowedTypes = ['image']) => (req, file, cb) => {
  try {
    const fileType = file.mimetype.split('/')[0];
    if (allowedTypes.includes(fileType)) cb(null, true);
    else cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed`), false);
  } catch (error) {
    cb(error, false);
  }
};

/**
 * Create a Multer instance with custom configuration
 */
const createMulterInstance = ({
  storage = 'memory',
  fileSize = 5 * 1024 * 1024,
  allowedTypes = ['image'],
  fileCount = 1
} = {}) => {
  return multer({
    storage: storage === 'disk' ? diskStorage : memoryStorage,
    limits: { fileSize, files: fileCount },
    fileFilter: fileFilter(allowedTypes)
  });
};

// Pre-configured upload middlewares
const profilePhotoUpload = createMulterInstance({
  storage: 'memory',
  fileSize: 5 * 1024 * 1024,
  allowedTypes: ['image'],
  fileCount: 1
});

const listingPhotosUpload = createMulterInstance({
  storage: 'memory',
  fileSize: 10 * 1024 * 1024,
  allowedTypes: ['image'],
  fileCount: 10
});

const documentUpload = createMulterInstance({
  storage: 'memory',
  fileSize: 5 * 1024 * 1024,
  allowedTypes: ['image', 'application'],
  fileCount: 5
});

/**
 * File validation middleware
 */
const validateUpload = (type = 'profile') => (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const files = req.files || [req.file];
    const errors = [];

    files.forEach((file, index) => {
      const validation = cloudinaryService.validateImageFile(file, type);
      if (!validation.isValid) {
        errors.push(`File ${index + 1}: ${validation.errors.join(", ")}`);
      }
    });

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors
      });
    }

    next();
  } catch (error) {
    logger.error("File validation error:", error);
    res.status(500).json({
      success: false,
      message: "File validation error",
      error: error.message
    });
  }
};

/**
 * Multer error handler middleware
 */
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = error.message;
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
    }
    return res.status(400).json({ success: false, message, error: error.code });
  }

  if (error.message.includes("Only") && error.message.includes("files are allowed")) {
    return res.status(400).json({ success: false, message: error.message });
  }

  next(error);
};

/**
 * Cleanup temp files
 */
const cleanupTempFiles = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    const remove = file => {
      if (file?.path) {
        fs.unlink(file.path, err => {
          if (err) logger.warn("Failed to cleanup temp file:", file.path);
        });
      }
    };

    if (req.file) remove(req.file);
    if (Array.isArray(req.files)) req.files.forEach(remove);

    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  profilePhotoUpload: profilePhotoUpload.single("profilePhoto"),
  listingPhotosUpload: listingPhotosUpload.array("listingPhotos", 10),
  documentUpload: documentUpload.array("documents", 5),

  createMulterInstance,
  validateUpload,
  handleMulterError,
  cleanupTempFiles
};
