/**
 * Audit Logging Middleware
 * Automatically logs admin actions for accountability
 */

import AuditLog from '../models/AuditLog.js';

/**
 * Create audit log entry
 */
export const createAuditLog = async (req, action, options = {}) => {
  const {
    description,
    targetType,
    targetId,
    changes,
    status = 'success',
    error
  } = options;

  const logData = {
    action,
    performedBy: req.user?._id,
    description: description || `Admin performed ${action}`,
    targetType,
    targetId,
    changes,
    status,
    metadata: {
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      endpoint: req.originalUrl,
      method: req.method
    }
  };

  if (error) {
    logData.error = {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }

  return AuditLog.logAction(logData);
};

/**
 * Middleware to auto-log admin actions
 * Use on specific routes that need audit logging
 */
export const auditMiddleware = (action, getOptions = () => ({})) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to capture response
    res.json = async function(data) {
      // Determine status based on response
      const status = data?.success === false ? 'failed' : 'success';

      // Get dynamic options
      const options = typeof getOptions === 'function'
        ? getOptions(req, data)
        : getOptions;

      // Create audit log
      await createAuditLog(req, action, {
        ...options,
        status,
        error: data?.success === false ? { message: data.message } : undefined
      });

      // Call original json
      return originalJson(data);
    };

    next();
  };
};

/**
 * Log product actions
 */
export const logProductAction = (action) => auditMiddleware(action, (req, data) => ({
  targetType: 'Product',
  targetId: req.params.id || data?.product?._id,
  description: `${action}: ${data?.product?.name || req.body?.name || 'Unknown product'}`,
  changes: {
    before: req.originalDocument,
    after: req.body
  }
}));

/**
 * Log order actions
 */
export const logOrderAction = (action) => auditMiddleware(action, (req, data) => ({
  targetType: 'Order',
  targetId: req.params.id || data?.order?._id,
  description: `${action}: Order #${data?.order?.orderNumber || req.params.id}`,
  changes: req.body
}));

/**
 * Log user actions
 */
export const logUserAction = (action) => auditMiddleware(action, (req, data) => ({
  targetType: 'User',
  targetId: req.params.id || req.params.userId,
  description: `${action}: User ${data?.user?.email || req.params.id}`,
  changes: {
    before: req.originalDocument,
    after: req.body
  }
}));

/**
 * Middleware to capture original document before update
 */
export const captureOriginal = (Model) => async (req, res, next) => {
  if (req.params.id) {
    try {
      req.originalDocument = await Model.findById(req.params.id).lean();
    } catch (error) {
      // Silently fail - don't break the main operation
    }
  }
  next();
};

export default {
  createAuditLog,
  auditMiddleware,
  logProductAction,
  logOrderAction,
  logUserAction,
  captureOriginal
};
