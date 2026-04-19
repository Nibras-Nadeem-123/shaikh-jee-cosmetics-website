import { createClient } from 'redis';

// Create Redis client lazily
let _redisClient = null;
let redisConnected = false;

export const getRedisClient = () => {
  if (!_redisClient) {
    _redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
      socket: {
        reconnectStrategy: 3000,
        connectTimeout: 5000
      }
    });

    _redisClient.on('error', (err) => {
      redisConnected = false;
    });

    _redisClient.on('connect', () => {
      redisConnected = true;
    });

    _redisClient.on('end', () => {
      redisConnected = false;
    });
  }
  return _redisClient;
};

// Lazy connection - don't block server startup
export const connectRedis = async () => {
  const client = getRedisClient();
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (error) {
    redisConnected = false;
  }
};

export const isRedisConnected = () => redisConnected;

// Cache middleware for GET requests
export const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    if (req.method !== 'GET' || !redisConnected) {
      return next();
    }

    try {
      const client = getRedisClient();
      const cacheKey = `${req.originalUrl}`;
      const cachedData = await client.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json.bind(res);

      res.json = function (data) {
        client.setEx(cacheKey, duration, JSON.stringify(data)).catch(() => {});
        return originalJson(data);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

// Simple cache get/set helpers
export const getCache = async (key) => {
  if (!redisConnected) return null;
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

export const setCache = async (key, value, duration = 3600) => {
  if (!redisConnected) return false;
  try {
    const client = getRedisClient();
    await client.setEx(key, duration, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
};

export const clearCache = async (pattern) => {
  if (!redisConnected) return;
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    // Silent fail
  }
};

// Session storage helpers
export const setSession = async (userId, sessionData, expiresIn = 86400) => {
  if (!redisConnected) return false;
  try {
    const client = getRedisClient();
    const key = `session:${userId}`;
    await client.setEx(key, expiresIn, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error('Session storage error:', error);
    return false;
  }
};

export const getSession = async (userId) => {
  if (!redisConnected) return null;
  try {
    const client = getRedisClient();
    const key = `session:${userId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
};

export const deleteSession = async (userId) => {
  if (!redisConnected) return;
  try {
    const client = getRedisClient();
    const key = `session:${userId}`;
    await client.del(key);
  } catch (error) {
    console.error('Session deletion error:', error);
  }
};

// Cart caching helpers
export const cacheCart = async (userId, cartData, expiresIn = 604800) => { // 7 days
  if (!redisConnected) return false;
  try {
    const client = getRedisClient();
    const key = `cart:${userId}`;
    await client.setEx(key, expiresIn, JSON.stringify(cartData));
    return true;
  } catch (error) {
    console.error('Cart cache error:', error);
    return false;
  }
};

export const getCachedCart = async (userId) => {
  if (!redisConnected) return null;
  try {
    const client = getRedisClient();
    const key = `cart:${userId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cart retrieval error:', error);
    return null;
  }
};

export const clearCartCache = async (userId) => {
  if (!redisConnected) return;
  try {
    const client = getRedisClient();
    const key = `cart:${userId}`;
    await client.del(key);
  } catch (error) {
    console.error('Cart cache clear error:', error);
  }
};

// User session token blacklist (for logout)
export const blacklistToken = async (token, expiresIn = 604800) => { // 7 days
  if (!redisConnected) return false;
  try {
    const client = getRedisClient();
    const key = `blacklist:${token}`;
    await client.setEx(key, expiresIn, '1');
    return true;
  } catch (error) {
    console.error('Token blacklist error:', error);
    return false;
  }
};

export const isTokenBlacklisted = async (token) => {
  if (!redisConnected) return false;
  try {
    const client = getRedisClient();
    const key = `blacklist:${token}`;
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    return false;
  }
};

// Rate limiting helpers with Redis
export const checkRateLimit = async (key, limit, windowSeconds) => {
  if (!redisConnected) return { allowed: true, remaining: limit };
  try {
    const client = getRedisClient();
    const current = await client.incr(key);
    if (current === 1) {
      await client.expire(key, windowSeconds);
    }
    const ttl = await client.ttl(key);
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetIn: ttl
    };
  } catch (error) {
    return { allowed: true, remaining: limit };
  }
};

export default getRedisClient;
