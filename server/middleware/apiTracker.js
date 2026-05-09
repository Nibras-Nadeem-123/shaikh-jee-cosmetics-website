/**
 * API Usage Tracking Middleware
 * Tracks all API requests for rate limit dashboard analytics
 */

// In-memory buffer for batching writes
const requestBuffer = {
  data: new Map(),
  ipSet: new Set(),
  userSet: new Set(),
  responseTimes: [],
  lastFlush: Date.now()
};

// Configuration
const CONFIG = {
  FLUSH_INTERVAL: 60000, // Flush to DB every minute
  BUFFER_SIZE: 1000,     // Max buffer size before forced flush
  SAMPLE_RATE: 1.0       // Sample 100% of requests (reduce for high traffic)
};

/**
 * Categorize endpoint based on path
 */
const categorizeEndpoint = (path) => {
  if (!path) return 'other';

  if (path.includes('/auth')) return 'auth';
  if (path.includes('/admin')) return 'admin';
  if (path.includes('/order')) return 'order';
  if (path.includes('/payment')) return 'payment';
  if (path.includes('/search')) return 'search';
  if (path.includes('/review')) return 'review';
  if (path.includes('/api')) return 'api';

  return 'global';
};

/**
 * Get hour bucket for timestamp
 */
const getHourBucket = (date = new Date()) => {
  const bucket = new Date(date);
  bucket.setMinutes(0, 0, 0);
  return bucket;
};

/**
 * Generate buffer key
 */
const getBufferKey = (path, method, hourBucket) => {
  return `${hourBucket.toISOString()}_${method}_${path}`;
};

/**
 * Flush buffer to database
 */
const flushBuffer = async () => {
  if (requestBuffer.data.size === 0) return;

  try {
    const { RateLimitLog, DailyStats } = await import('../models/RateLimitLog.js');

    const operations = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process buffered data
    for (const [key, data] of requestBuffer.data) {
      operations.push({
        updateOne: {
          filter: {
            timestamp: data.timestamp,
            path: data.path,
            method: data.method
          },
          update: {
            $inc: {
              'requests.total': data.requests.total,
              'requests.successful': data.requests.successful,
              'requests.clientErrors': data.requests.clientErrors,
              'requests.serverErrors': data.requests.serverErrors,
              'requests.rateLimited': data.requests.rateLimited
            },
            $set: {
              endpoint: data.endpoint,
              'responseTime.avg': data.responseTime.avg,
              uniqueIPs: data.uniqueIPs,
              uniqueUsers: data.uniqueUsers
            }
          },
          upsert: true
        }
      });
    }

    if (operations.length > 0) {
      await RateLimitLog.bulkWrite(operations);
    }

    // Update daily stats
    const dailyTotals = {
      totalRequests: 0,
      totalRateLimited: 0,
      statusCodes: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }
    };

    for (const [, data] of requestBuffer.data) {
      dailyTotals.totalRequests += data.requests.total;
      dailyTotals.totalRateLimited += data.requests.rateLimited;
      dailyTotals.statusCodes['2xx'] += data.requests.successful;
      dailyTotals.statusCodes['4xx'] += data.requests.clientErrors;
      dailyTotals.statusCodes['5xx'] += data.requests.serverErrors;
    }

    await DailyStats.findOneAndUpdate(
      { date: today },
      {
        $inc: {
          totalRequests: dailyTotals.totalRequests,
          totalRateLimited: dailyTotals.totalRateLimited,
          'statusCodes.2xx': dailyTotals.statusCodes['2xx'],
          'statusCodes.4xx': dailyTotals.statusCodes['4xx'],
          'statusCodes.5xx': dailyTotals.statusCodes['5xx']
        },
        $set: {
          uniqueVisitors: requestBuffer.ipSet.size
        }
      },
      { upsert: true }
    );

    // Clear buffer
    requestBuffer.data.clear();
    requestBuffer.ipSet.clear();
    requestBuffer.userSet.clear();
    requestBuffer.responseTimes = [];
    requestBuffer.lastFlush = Date.now();

  } catch (error) {
    console.error('Error flushing API tracking buffer:', error);
  }
};

// Set up periodic flush
setInterval(flushBuffer, CONFIG.FLUSH_INTERVAL);

/**
 * API Tracking Middleware
 */
export const apiTracker = (req, res, next) => {
  // Skip tracking for certain paths
  if (req.path === '/health' || req.path.startsWith('/static')) {
    return next();
  }

  // Sample rate check
  if (Math.random() > CONFIG.SAMPLE_RATE) {
    return next();
  }

  const startTime = Date.now();
  const hourBucket = getHourBucket();
  const endpoint = categorizeEndpoint(req.path);
  const bufferKey = getBufferKey(req.path, req.method, hourBucket);
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userId = req.user?._id?.toString();

  // Track IP and user
  requestBuffer.ipSet.add(ip);
  if (userId) requestBuffer.userSet.add(userId);

  // Initialize buffer entry if needed
  if (!requestBuffer.data.has(bufferKey)) {
    requestBuffer.data.set(bufferKey, {
      timestamp: hourBucket,
      endpoint,
      path: req.path,
      method: req.method,
      requests: {
        total: 0,
        successful: 0,
        clientErrors: 0,
        serverErrors: 0,
        rateLimited: 0
      },
      responseTime: { avg: 0, count: 0 },
      uniqueIPs: 0,
      uniqueUsers: 0,
      ipCounts: new Map()
    });
  }

  // Capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const data = requestBuffer.data.get(bufferKey);

    if (data) {
      // Update request counts
      data.requests.total++;

      if (statusCode >= 200 && statusCode < 300) {
        data.requests.successful++;
      } else if (statusCode >= 400 && statusCode < 500) {
        data.requests.clientErrors++;
        if (statusCode === 429) {
          data.requests.rateLimited++;
        }
      } else if (statusCode >= 500) {
        data.requests.serverErrors++;
      }

      // Update response time (running average)
      const oldAvg = data.responseTime.avg;
      const oldCount = data.responseTime.count;
      data.responseTime.avg = (oldAvg * oldCount + responseTime) / (oldCount + 1);
      data.responseTime.count++;

      // Track IP counts
      const ipCount = data.ipCounts.get(ip) || 0;
      data.ipCounts.set(ip, ipCount + 1);
      data.uniqueIPs = data.ipCounts.size;
      data.uniqueUsers = requestBuffer.userSet.size;
    }

    // Force flush if buffer is too large
    if (requestBuffer.data.size >= CONFIG.BUFFER_SIZE) {
      flushBuffer();
    }

    return originalEnd.apply(res, args);
  };

  next();
};

/**
 * Get current rate limit status for an identifier
 */
export const getRateLimitStatus = async (identifier, type = 'ip') => {
  try {
    const { RateLimitStatus } = await import('../models/RateLimitLog.js');
    return await RateLimitStatus.findOne({
      identifier,
      type,
      windowEnd: { $gt: new Date() }
    });
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return null;
  }
};

/**
 * Update rate limit status
 */
export const updateRateLimitStatus = async (identifier, type, endpoint, limit, windowMs) => {
  try {
    const { RateLimitStatus } = await import('../models/RateLimitLog.js');
    const now = new Date();
    const windowEnd = new Date(now.getTime() + windowMs);
    const key = `${type}_${identifier}_${endpoint}`;

    await RateLimitStatus.findOneAndUpdate(
      { key },
      {
        $inc: { requests: 1 },
        $set: {
          type,
          identifier,
          endpoint,
          limit,
          lastRequest: now
        },
        $setOnInsert: {
          windowStart: now,
          windowEnd
        }
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating rate limit status:', error);
  }
};

/**
 * Force flush (for graceful shutdown)
 */
export const forceFlush = flushBuffer;

export default apiTracker;
