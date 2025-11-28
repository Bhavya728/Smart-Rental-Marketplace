const winston = require('winston');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Determine log directory
// In Vercel, only /tmp is writable
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

const logsDir = isVercel
  ? path.join(os.tmpdir(), 'logs')        // /tmp/logs on Vercel
  : path.join(__dirname, '../logs');      // local logs folder

// Ensure log directory exists (only where writing is allowed)
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    console.warn("Cannot create log directory:", logsDir, err);
  }
}

// Log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'smart-rental-api' },
  transports: []
});

// -------------------------------
// File logging only if NOT on Vercel
// -------------------------------
if (!isVercel) {
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5
  }));

  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880,
    maxFiles: 5
  }));
}

// Console logging (works everywhere)
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  )
}));

// Morgan HTTP logging support
logger.stream = {
  write: (message) => logger.info(message.trim())
};

module.exports = logger;
