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
   OPEN CORS FOR ALL ORIGINS
====================================================== */

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow ANY origin dynamically
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }

  // Allow cookies + credentials
  res.header("Access-Control-Allow-Credentials", "true");

  // Allowed headers
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Allowed methods
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  // Preflight handling
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ======================================================
   SECURITY (Helmet)
====================================================== */

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false
  })
);
// 404 favicon
app.use(express.static("public"));

app.get("/favicon.ico", (req, res) => res.status(204).end());
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
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
});

app.use(limiter);

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
  res.json({ success: true, message: "Server is healthy", time: new Date() });
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
   GLOBAL ERROR HANDLER
====================================================== */

app.use(globalErrorHandler);

/* ======================================================
   CLOUDINARY INITIALIZATION
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
      logger.info(`Server running on port ${PORT}`);
      logger.info("Socket.io ready.");
    });
  })
  .catch((err) => {
    logger.error("MongoDB Error:", err);
    process.exit(1);
  });

module.exports = app;
