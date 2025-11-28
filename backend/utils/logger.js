const winston = require("winston");

// Determine if running on Vercel serverless
const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

// Base logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: []
});

// --------------------------------------
// NEVER write files on Vercel
// --------------------------------------
if (!isVercel) {
  const path = require("path");
  const fs = require("fs");

  const logsDir = path.join(__dirname, "../logs");

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880,
      maxFiles: 5
    })
  );
}

// Console transport ALWAYS enabled
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
      })
    )
  })
);

// Morgan integration
logger.stream = {
  write: (message) => logger.info(message.trim())
};

module.exports = logger;
