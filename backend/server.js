const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const http = require('http');
require('dotenv').config();

const logger = require('./utils/logger');
const { globalErrorHandler } = require('./utils/errorHandler');
const { configureCloudinary } = require('./config/cloudinary');
const SocketManager = require('./socket/socketManager');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
const socketManager = new SocketManager(server);
app.locals.socketManager = socketManager;

// CORS configuration MUST come before other middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://localhost:3000',
      'https://smart-rental-marketplace-3f95.vercel.app/',
      'https://smart-rental-marketplace.vercel.app/'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Accept',
    'Accept-Language',
    'Content-Language',
    'Content-Type',
    'Origin',
    'Authorization',
    'X-Requested-With',
    'X-Access-Token',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  exposedHeaders: ['X-Total-Count', 'Authorization'],
  preflightContinue: false
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Security middleware (configured to not interfere with CORS)
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));


// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.get('Origin') || 'unknown origin'}`);
  next();
});

// Rate limiting (after CORS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // allow many more requests in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting conditionally - more lenient in development
if (process.env.NODE_ENV !== 'development') {
  app.use(limiter);
} else {
  // Very lenient rate limiting for development
  const devLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // 1000 requests per minute in development
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(devLimiter);
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Ensure all responses have CORS headers
app.use((req, res, next) => {
  res.on('finish', () => {
    if (!res.getHeader('Access-Control-Allow-Origin')) {
      const origin = req.headers.origin;
      const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://localhost:3000'];
      
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    }
  });
  next();
});

app.get("/",(req,res)=>{
  res.send("Smart Rental Marketplace Backend is running");
})

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// Test CORS endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS is working!',
    origin: req.get('Origin'),
    timestamp: new Date().toISOString(),
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const searchRoutes = require('./routes/searchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use(globalErrorHandler);

// Initialize services
configureCloudinary();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-rental-marketplace')
.then(() => {
  logger.info('Connected to MongoDB');
  server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Socket.io server is ready`);
  });
})
.catch((error) => {
  logger.error('Database connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed.');
    process.exit(0);
  });
});

module.exports = app;