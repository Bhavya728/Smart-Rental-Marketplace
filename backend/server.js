const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
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
   FIXED CORS (THE ONLY CORRECT VERSION)
====================================================== */

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",

  "https://smart-rental-marketplace-3f95.vercel.app",   // FRONTEND
  "https://smart-rental-marketplace.vercel.app"  // BACKEND (optional)
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ======================================================
   SECURITY
====================================================== */
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false
  })
);

/* ======================================================
   LOGGING
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
  max: 200,
  standardHeaders: true
});

app.use(limiter);

/* ======================================================
   PARSERS
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

/* ======================================================
   BASIC ROUTES
====================================================== */

app.get("/", (req, res) => {
  res.send("Smart Rental Marketplace Backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server healthy" });
});

/* ======================================================
   API ROUTES
====================================================== */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

/* ======================================================
   ERRORS
====================================================== */
app.use(globalErrorHandler);

/* ======================================================
   CLOUDINARY
====================================================== */
configureCloudinary();

/* ======================================================
   DATABASE + START SERVER
====================================================== */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB");

    server.listen(PORT, () => {
      logger.info("Server running on port " + PORT);
    });
  })
  .catch((err) => {
    logger.error("DB Connection Error:", err);
    process.exit(1);
  });

module.exports = app;
