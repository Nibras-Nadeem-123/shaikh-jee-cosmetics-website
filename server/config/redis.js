import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD // Added password for authentication
});

redisClient.on('error', (err) => {
  console.log('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
if (!redisClient.isOpen) {
  redisClient.connect().catch(console.error);
}

// Cache middleware for GET requests
export const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = `${req.originalUrl}`;
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache response
      res.json = function (data) {
        // Cache the response for the specified duration
        redisClient.setEx(cacheKey, duration, JSON.stringify(data)).catch(console.error);
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache for specific pattern
export const clearCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

// Session storage helpers
export const setSession = async (key, value, expiresIn = 86400) => {
  try {
    await redisClient.setEx(key, expiresIn, JSON.stringify(value));
  } catch (error) {
    console.error('Session storage error:', error);
  }
};

export const getSession = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
};

export const deleteSession = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Session deletion error:', error);
  }
};

export default redisClient;
