import express from 'express';
import { RateLimitLog, DailyStats, RateLimitStatus } from '../models/RateLimitLog.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { catchAsyncErrors } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/admin/rate-limits/overview
 * @desc    Get rate limit dashboard overview
 * @access  Admin
 */
router.get('/overview', isAuthenticatedUser, authorizeRoles('admin'), catchAsyncErrors(async (req, res) => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get today's stats
  const todayStats = await DailyStats.findOne({ date: today }) || {
    totalRequests: 0,
    totalRateLimited: 0,
    uniqueVisitors: 0,
    avgResponseTime: 0,
    statusCodes: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }
  };

  // Get yesterday's stats for comparison
  const yesterdayStats = await DailyStats.findOne({ date: yesterday }) || {
    totalRequests: 0,
    totalRateLimited: 0,
    uniqueVisitors: 0
  };

  // Get last 24 hours hourly breakdown
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const hourlyStats = await RateLimitLog.aggregate([
    { $match: { timestamp: { $gte: last24Hours } } },
    {
      $group: {
        _id: {
          hour: { $hour: '$timestamp' },
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        requests: { $sum: '$requests.total' },
        rateLimited: { $sum: '$requests.rateLimited' },
        avgResponseTime: { $avg: '$responseTime.avg' }
      }
    },
    { $sort: { '_id.date': 1, '_id.hour': 1 } }
  ]);

  // Get endpoint breakdown
  const endpointStats = await RateLimitLog.aggregate([
    { $match: { timestamp: { $gte: last24Hours } } },
    {
      $group: {
        _id: '$endpoint',
        requests: { $sum: '$requests.total' },
        rateLimited: { $sum: '$requests.rateLimited' },
        avgResponseTime: { $avg: '$responseTime.avg' },
        errors: { $sum: { $add: ['$requests.clientErrors', '$requests.serverErrors'] } }
      }
    },
    { $sort: { requests: -1 } }
  ]);

  // Calculate changes
  const requestChange = yesterdayStats.totalRequests > 0
    ? ((todayStats.totalRequests - yesterdayStats.totalRequests) / yesterdayStats.totalRequests * 100).toFixed(1)
    : 0;

  const visitorChange = yesterdayStats.uniqueVisitors > 0
    ? ((todayStats.uniqueVisitors - yesterdayStats.uniqueVisitors) / yesterdayStats.uniqueVisitors * 100).toFixed(1)
    : 0;

  res.json({
    success: true,
    data: {
      summary: {
        totalRequests: todayStats.totalRequests,
        totalRateLimited: todayStats.totalRateLimited,
        uniqueVisitors: todayStats.uniqueVisitors,
        avgResponseTime: Math.round(todayStats.avgResponseTime || 0),
        rateLimitRate: todayStats.totalRequests > 0
          ? ((todayStats.totalRateLimited / todayStats.totalRequests) * 100).toFixed(2)
          : 0,
        requestChange: parseFloat(requestChange),
        visitorChange: parseFloat(visitorChange)
      },
      statusCodes: todayStats.statusCodes,
      hourlyStats: hourlyStats.map(h => ({
        hour: h._id.hour,
        date: h._id.date,
        requests: h.requests,
        rateLimited: h.rateLimited,
        avgResponseTime: Math.round(h.avgResponseTime || 0)
      })),
      endpointStats: endpointStats.map(e => ({
        endpoint: e._id,
        requests: e.requests,
        rateLimited: e.rateLimited,
        avgResponseTime: Math.round(e.avgResponseTime || 0),
        errors: e.errors,
        errorRate: e.requests > 0 ? ((e.errors / e.requests) * 100).toFixed(2) : 0
      }))
    }
  });
}));

/**
 * @route   GET /api/admin/rate-limits/trends
 * @desc    Get rate limit trends over time
 * @access  Admin
 */
router.get('/trends', isAuthenticatedUser, authorizeRoles('admin'), catchAsyncErrors(async (req, res) => {
  const { days = 7 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  const dailyTrends = await DailyStats.find({
    date: { $gte: startDate }
  }).sort({ date: 1 });

  const trends = dailyTrends.map(day => ({
    date: day.date,
    requests: day.totalRequests,
    rateLimited: day.totalRateLimited,
    visitors: day.uniqueVisitors,
    avgResponseTime: Math.round(day.avgResponseTime || 0),
    successRate: day.totalRequests > 0
      ? (((day.statusCodes?.['2xx'] || 0) / day.totalRequests) * 100).toFixed(1)
      : 100
  }));

  res.json({
    success: true,
    data: { trends }
  });
}));

/**
 * @route   GET /api/admin/rate-limits/endpoints
 * @desc    Get detailed endpoint statistics
 * @access  Admin
 */
router.get('/endpoints', isAuthenticatedUser, authorizeRoles('admin'), catchAsyncErrors(async (req, res) => {
  const { hours = 24, endpoint } = req.query;
  const startTime = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);

  const match = { timestamp: { $gte: startTime } };
  if (endpoint) match.endpoint = endpoint;

  const stats = await RateLimitLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: { endpoint: '$endpoint', path: '$path', method: '$method' },
        totalRequests: { $sum: '$requests.total' },
        successful: { $sum: '$requests.successful' },
        clientErrors: { $sum: '$requests.clientErrors' },
        serverErrors: { $sum: '$requests.serverErrors' },
        rateLimited: { $sum: '$requests.rateLimited' },
        avgResponseTime: { $avg: '$responseTime.avg' },
        uniqueIPs: { $max: '$uniqueIPs' }
      }
    },
    { $sort: { totalRequests: -1 } },
    { $limit: 50 }
  ]);

  res.json({
    success: true,
    data: {
      endpoints: stats.map(s => ({
        endpoint: s._id.endpoint,
        path: s._id.path,
        method: s._id.method,
        requests: s.totalRequests,
        successful: s.successful,
        clientErrors: s.clientErrors,
        serverErrors: s.serverErrors,
        rateLimited: s.rateLimited,
        avgResponseTime: Math.round(s.avgResponseTime || 0),
        uniqueIPs: s.uniqueIPs,
        successRate: s.totalRequests > 0
          ? ((s.successful / s.totalRequests) * 100).toFixed(1)
          : 100
      }))
    }
  });
}));

/**
 * @route   GET /api/admin/rate-limits/active
 * @desc    Get currently active rate limits
 * @access  Admin
 */
router.get('/active', isAuthenticatedUser, authorizeRoles('admin'), catchAsyncErrors(async (req, res) => {
  const now = new Date();

  const activeLimits = await RateLimitStatus.find({
    windowEnd: { $gt: now }
  })
    .sort({ requests: -1 })
    .limit(100);

  const limited = activeLimits.filter(l => l.requests >= l.limit * 0.8);

  res.json({
    success: true,
    data: {
      total: activeLimits.length,
      nearLimit: limited.length,
      limits: activeLimits.map(l => ({
        identifier: l.type === 'ip' ? l.identifier : `User: ${l.identifier.slice(-8)}`,
        type: l.type,
        endpoint: l.endpoint,
        requests: l.requests,
        limit: l.limit,
        usage: ((l.requests / l.limit) * 100).toFixed(1),
        windowEnd: l.windowEnd,
        isLimited: l.requests >= l.limit
      }))
    }
  });
}));

/**
 * @route   GET /api/admin/rate-limits/suspicious
 * @desc    Get suspicious activity (high rate limit hits)
 * @access  Admin
 */
router.get('/suspicious', isAuthenticatedUser, authorizeRoles('admin'), catchAsyncErrors(async (req, res) => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get IPs with high rate limit hits
  const suspicious = await RateLimitLog.aggregate([
    { $match: { timestamp: { $gte: last24Hours } } },
    { $unwind: { path: '$topIPs', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: '$topIPs.ip',
        totalRequests: { $sum: '$topIPs.count' },
        rateLimited: { $sum: '$topIPs.rateLimited' },
        endpoints: { $addToSet: '$endpoint' }
      }
    },
    { $match: { rateLimited: { $gt: 5 } } },
    { $sort: { rateLimited: -1 } },
    { $limit: 20 }
  ]);

  // Also check RateLimitStatus for currently limited
  const currentlyLimited = await RateLimitStatus.find({
    windowEnd: { $gt: new Date() },
    $expr: { $gte: ['$requests', '$limit'] }
  }).limit(20);

  res.json({
    success: true,
    data: {
      suspicious: suspicious.map(s => ({
        ip: s._id,
        totalRequests: s.totalRequests,
        rateLimited: s.rateLimited,
        endpoints: s.endpoints,
        severity: s.rateLimited > 50 ? 'high' : s.rateLimited > 20 ? 'medium' : 'low'
      })),
      currentlyLimited: currentlyLimited.map(l => ({
        identifier: l.identifier,
        type: l.type,
        endpoint: l.endpoint,
        requests: l.requests,
        limit: l.limit,
        windowEnd: l.windowEnd
      }))
    }
  });
}));

/**
 * @route   GET /api/admin/rate-limits/realtime
 * @desc    Get real-time metrics (last 5 minutes)
 * @access  Admin
 */
router.get('/realtime', isAuthenticatedUser, authorizeRoles('admin'), catchAsyncErrors(async (req, res) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const recentStats = await RateLimitLog.aggregate([
    { $match: { timestamp: { $gte: fiveMinutesAgo } } },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: '$requests.total' },
        rateLimited: { $sum: '$requests.rateLimited' },
        avgResponseTime: { $avg: '$responseTime.avg' },
        uniqueIPs: { $sum: '$uniqueIPs' }
      }
    }
  ]);

  const stats = recentStats[0] || {
    totalRequests: 0,
    rateLimited: 0,
    avgResponseTime: 0,
    uniqueIPs: 0
  };

  // Calculate requests per second
  const requestsPerSecond = (stats.totalRequests / 300).toFixed(2);

  res.json({
    success: true,
    data: {
      requestsPerSecond: parseFloat(requestsPerSecond),
      totalRequests: stats.totalRequests,
      rateLimited: stats.rateLimited,
      avgResponseTime: Math.round(stats.avgResponseTime || 0),
      activeConnections: stats.uniqueIPs,
      timestamp: new Date()
    }
  });
}));

/**
 * @route   GET /api/admin/rate-limits/config
 * @desc    Get current rate limit configuration
 * @access  Admin
 */
router.get('/config', isAuthenticatedUser, authorizeRoles('admin'), catchAsyncErrors(async (req, res) => {
  // Return current rate limit configurations
  const config = {
    global: { windowMs: 15 * 60 * 1000, max: 100, name: 'Global' },
    auth: { windowMs: 15 * 60 * 1000, max: 5, name: 'Auth (Login)' },
    signup: { windowMs: 60 * 60 * 1000, max: 3, name: 'Signup' },
    passwordReset: { windowMs: 60 * 60 * 1000, max: 3, name: 'Password Reset' },
    api: { windowMs: 1 * 60 * 1000, max: 200, name: 'API' },
    search: { windowMs: 1 * 60 * 1000, max: 30, name: 'Search' },
    order: { windowMs: 1 * 60 * 1000, max: 10, name: 'Order' },
    payment: { windowMs: 1 * 60 * 1000, max: 5, name: 'Payment' },
    review: { windowMs: 1 * 60 * 1000, max: 10, name: 'Review' },
    admin: { windowMs: 1 * 60 * 1000, max: 50, name: 'Admin' },
    ip: { windowMs: 60 * 1000, max: 1000, name: 'IP DDoS Protection' }
  };

  res.json({
    success: true,
    data: {
      limits: Object.entries(config).map(([key, value]) => ({
        id: key,
        name: value.name,
        windowMinutes: value.windowMs / 60000,
        maxRequests: value.max,
        description: `${value.max} requests per ${value.windowMs / 60000} minute(s)`
      }))
    }
  });
}));

export default router;
