/**
 * Winston Logger Configuration
 * Provides structured logging for the application
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    return logMessage;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && process.env.NODE_ENV === 'development') {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return logMessage;
  })
);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : process.env.LOG_LEVEL || 'info';
};

// Create transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat
  })
];

// Skip file transports on cloud platforms (Railway, Vercel, Render, Heroku)
// These platforms don't allow filesystem writes and use their own logging
const isCloudPlatform = !!(
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.VERCEL ||
  process.env.RENDER ||
  process.env.HEROKU ||
  process.env.DYNO // Heroku
);

// File logging disabled for cloud platforms - use console only

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent']?.substring(0, 100)
    };

    // Add user ID if authenticated
    if (req.user?._id) {
      logData.userId = req.user._id.toString();
    }

    // Log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });

  next();
};

// Error logging helper
export const logError = (error, context = {}) => {
  logger.error(error.message, {
    ...context,
    stack: error.stack,
    name: error.name
  });
};

// Audit logging helper
export const logAudit = (action, userId, details = {}) => {
  logger.info(`AUDIT: ${action}`, {
    userId: userId?.toString(),
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Performance logging helper
export const logPerformance = (operation, duration, details = {}) => {
  logger.debug(`PERF: ${operation}`, {
    duration: `${duration}ms`,
    ...details
  });
};

export default logger;
