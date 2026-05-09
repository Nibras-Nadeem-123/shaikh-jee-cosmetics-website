import mongoose from 'mongoose';

const rateLimitLogSchema = new mongoose.Schema({
  // Time bucket for aggregation (hourly)
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  // Endpoint category
  endpoint: {
    type: String,
    required: true,
    enum: ['global', 'auth', 'api', 'search', 'order', 'payment', 'review', 'admin', 'other'],
    index: true
  },
  // Specific path
  path: {
    type: String,
    required: true
  },
  // HTTP method
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: true
  },
  // Request counts
  requests: {
    total: { type: Number, default: 0 },
    successful: { type: Number, default: 0 },  // 2xx responses
    clientErrors: { type: Number, default: 0 }, // 4xx responses
    serverErrors: { type: Number, default: 0 }, // 5xx responses
    rateLimited: { type: Number, default: 0 }   // 429 responses
  },
  // Response time stats (in ms)
  responseTime: {
    avg: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    p95: { type: Number, default: 0 }
  },
  // Unique identifiers
  uniqueIPs: { type: Number, default: 0 },
  uniqueUsers: { type: Number, default: 0 },
  // Top IPs hitting this endpoint (for abuse detection)
  topIPs: [{
    ip: String,
    count: Number,
    rateLimited: Number
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
rateLimitLogSchema.index({ timestamp: -1, endpoint: 1 });
rateLimitLogSchema.index({ timestamp: -1, path: 1 });

// Daily aggregated stats
const dailyStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  totalRequests: { type: Number, default: 0 },
  totalRateLimited: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  avgResponseTime: { type: Number, default: 0 },
  // Breakdown by endpoint
  endpointStats: [{
    endpoint: String,
    requests: Number,
    rateLimited: Number,
    avgResponseTime: Number
  }],
  // Breakdown by status code
  statusCodes: {
    '2xx': { type: Number, default: 0 },
    '3xx': { type: Number, default: 0 },
    '4xx': { type: Number, default: 0 },
    '5xx': { type: Number, default: 0 }
  },
  // Peak hours (0-23)
  peakHours: [{
    hour: Number,
    requests: Number
  }],
  // Suspicious activity
  suspiciousIPs: [{
    ip: String,
    requests: Number,
    rateLimited: Number,
    blocked: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Real-time rate limit status (in-memory cache backed by DB)
const rateLimitStatusSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['ip', 'user'],
    required: true
  },
  identifier: String, // IP or user ID
  endpoint: String,
  requests: { type: Number, default: 0 },
  limit: { type: Number, required: true },
  windowStart: { type: Date, required: true },
  windowEnd: { type: Date, required: true },
  isLimited: { type: Boolean, default: false },
  lastRequest: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// TTL index - automatically remove old status entries
rateLimitStatusSchema.index({ windowEnd: 1 }, { expireAfterSeconds: 0 });

export const RateLimitLog = mongoose.model('RateLimitLog', rateLimitLogSchema);
export const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);
export const RateLimitStatus = mongoose.model('RateLimitStatus', rateLimitStatusSchema);

export default RateLimitLog;
