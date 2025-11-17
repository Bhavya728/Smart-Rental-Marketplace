const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-rental-marketplace');
      
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      
      // Connection event handlers
      mongoose.connection.on('connected', () => {
        logger.info('Mongoose connected to MongoDB');
      });
      
      mongoose.connection.on('error', (err) => {
        logger.error('Mongoose connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose disconnected');
      });
      
      return conn;
    } catch (error) {
      logger.error(`MongoDB connection attempt failed. Retries left: ${retries - 1}`, error);
      retries -= 1;
      
      if (retries === 0) {
        logger.error('All MongoDB connection attempts failed');
        process.exit(1);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  });
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = {
  connectDB,
  gracefulShutdown,
};