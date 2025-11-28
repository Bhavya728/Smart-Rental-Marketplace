const express = require('express');
const mongoose = require('mongoose');
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

/* ======================================================
   CORRECT CORS CONFIG (FULLY VERCEL-SAFE)
====================================================== */

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://smart-rental-marketplace-3f95.vercel.app",   // FRONTEND
  "https://smart-rental-marketplace-9ue157.vercel.app"  // BACKEND
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ======================================================
   SECURITY MIDDLEWARE
====================================================== */
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false
  })
);

/* ======================================================
   SOCKET.IO INITIALIZATION
====================================================== */

const socketManager = new SocketManager(server);
app.locals.socketManager = socketManager;

/* ======================================================
   REQUEST LOGGING
====================================================== */
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.get("Origin") || "unknown"}`);
  next();
});

/* ======================================================
   RATE LIMITING
====================================================== */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 10000 : 200,
  message: "Too many requests, slow down.",
  standardHeaders: true
});

if (process.env.NODE_ENV !== "development") {
  app.use(limiter);
}

/* ======================================================
   BODY PARSING
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

/* ======================================================
   BASIC ROUTES
====================================================== */

app.get("/", (req, res) => {
  res.send("Smart Rental Marketplace Backend is running 🚀");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    time: new Date().toISOString()
  });
});

/* ======================================================
   API ROUTES
====================================================== */

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");
const searchRoutes = require("./routes/searchRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

/* ======================================================
   ERROR HANDLER
====================================================== */
app.use(globalErrorHandler);

/* ======================================================
   INITIALIZE CLOUDINARY
====================================================== */
configureCloudinary();

/* ======================================================
   MONGODB CONNECTION + START SERVER
====================================================== */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB");

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info("Socket.io is ready");
    });
  })
  .catch((err) => {
    logger.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

/* ======================================================
   GRACEFUL SHUTDOWN
====================================================== */
process.on("SIGTERM", () => {
  logger.info("SIGTERM received… shutting down gracefully");

  mongoose.connection.close(() => {
    logger.info("MongoDB connection closed");
    process.exit(0);
  });
});

module.exports = app;
