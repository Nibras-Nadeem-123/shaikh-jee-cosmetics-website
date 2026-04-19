/**
 * Audit Log Model
 * Tracks admin actions for accountability and security
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      // Product actions
      'PRODUCT_CREATE',
      'PRODUCT_UPDATE',
      'PRODUCT_DELETE',
      'PRODUCT_BULK_UPDATE',

      // Order actions
      'ORDER_STATUS_UPDATE',
      'ORDER_CANCEL',
      'ORDER_REFUND',

      // User actions
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_ROLE_CHANGE',
      'USER_SUSPEND',

      // Discount actions
      'DISCOUNT_CREATE',
      'DISCOUNT_UPDATE',
      'DISCOUNT_DELETE',

      // System actions
      'SETTINGS_UPDATE',
      'BULK_EMAIL_SENT',
      'DATA_EXPORT',
      'DATA_IMPORT',

      // Authentication
      'ADMIN_LOGIN',
      'ADMIN_LOGOUT',
      'PASSWORD_RESET_ADMIN'
    ]
  },

  // Who performed the action
  performedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  // Target of the action (if applicable)
  targetType: {
    type: String,
    enum: ['Product', 'Order', 'User', 'Discount', 'Review', 'Settings', 'Other']
  },
  targetId: {
    type: mongoose.Schema.ObjectId
  },

  // Description of the action
  description: {
    type: String,
    required: true
  },

  // Changes made (before/after for updates)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },

  // Request metadata
  metadata: {
    ip: String,
    userAgent: String,
    endpoint: String,
    method: String
  },

  // Status of the action
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },

  // Error details if failed
  error: {
    message: String,
    stack: String
  },

  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for querying
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ status: 1 });

// Static method to log an action
auditLogSchema.statics.logAction = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
    return null;
  }
};

// Static method to get recent admin activities
auditLogSchema.statics.getRecentActivities = async function(limit = 50) {
  return this.find()
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get activities by admin
auditLogSchema.statics.getActivitiesByAdmin = async function(adminId, options = {}) {
  const { page = 1, limit = 20, action } = options;
  const query = { performedBy: adminId };
  if (action) query.action = action;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get activities for a specific target
auditLogSchema.statics.getTargetHistory = async function(targetType, targetId) {
  return this.find({ targetType, targetId })
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 });
};

export default mongoose.model('AuditLog', auditLogSchema);
