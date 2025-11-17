/**
 * AuditLog Model
 * Tracks all admin actions and system events for security and compliance
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // User who performed the action
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Action performed
  action: {
    type: String,
    required: true,
    enum: [
      // User management actions
      'user_created',
      'user_updated',
      'user_deleted',
      'user_suspended',
      'user_activated',
      'user_role_changed',
      'user_permissions_changed',
      'users_viewed',
      'users_exported',
      'bulk_user_operation',
      
      // Listing management actions
      'listing_approved',
      'listing_rejected',
      'listing_suspended',
      'listing_deleted',
      'listing_featured',
      'listing_unfeatured',
      'listing_moderated',
      'listings_viewed',
      'listings_exported',
      
      // Booking management actions
      'booking_cancelled_admin',
      'booking_refund_processed',
      'booking_dispute_resolved',
      
      // System actions
      'admin_login',
      'admin_logout',
      'settings_updated',
      'bulk_action_performed',
      'export_generated',
      'report_viewed',
      'dashboard_viewed',
      'activity_logs_viewed',
      'system_error',
      
      // Analytics actions
      'revenue_analytics_viewed',
      'user_analytics_viewed',
      'listing_analytics_viewed',
      'booking_analytics_viewed',
      'geographic_analytics_viewed',
      'system_metrics_viewed',
      
      // Security actions
      'password_reset_admin',
      'account_locked',
      'suspicious_activity_flagged',
      
      // Content moderation
      'review_removed',
      'message_flagged',
      'content_moderated',
      
      // Financial actions
      'payment_refunded',
      'fee_adjusted',
      'payout_processed',
      
      // Other
      'other'
    ],
    index: true
  },

  // Resource type and ID that was affected
  resource: {
    type: String,
    required: true,
    index: true
  },
  
  resource_id: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },

  // Additional details about the action
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Previous state (for updates/changes)
  previous_state: {
    type: mongoose.Schema.Types.Mixed
  },

  // New state (for updates/changes)
  new_state: {
    type: mongoose.Schema.Types.Mixed
  },

  // Request information
  ip_address: {
    type: String,
    required: true,
    index: true
  },

  user_agent: {
    type: String,
    required: true
  },

  request_method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    default: 'POST'
  },

  request_body: {
    type: mongoose.Schema.Types.Mixed
  },

  // Response information
  response_status: {
    type: Number,
    required: true
  },

  // Severity level for filtering
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },

  // Tags for categorization
  tags: [{
    type: String,
    index: true
  }],

  // Additional metadata
  metadata: {
    session_id: String,
    transaction_id: String,
    affected_users_count: Number,
    amount: Number,
    currency: String
  },

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Retention flag (for important logs that shouldn't be auto-deleted)
  retain: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  // Optimize for time-series queries
  timeseries: {
    timeField: 'timestamp',
    metaField: 'user_id',
    granularity: 'hours'
  }
});

// Indexes for efficient querying
auditLogSchema.index({ user_id: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resource_id: 1, timestamp: -1 });
auditLogSchema.index({ ip_address: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // For recent activity queries

// TTL index to automatically delete old logs (keep for 2 years by default)
auditLogSchema.index(
  { timestamp: 1 }, 
  { 
    expireAfterSeconds: 63072000, // 2 years in seconds
    partialFilterExpression: { retain: { $ne: true } }
  }
);

// Virtual for formatted timestamp
auditLogSchema.virtual('formatted_timestamp').get(function() {
  return this.timestamp.toISOString();
});

// Virtual for human-readable action
auditLogSchema.virtual('action_description').get(function() {
  const descriptions = {
    'user_created': 'Created user account',
    'user_updated': 'Updated user information',
    'user_deleted': 'Deleted user account',
    'user_suspended': 'Suspended user account',
    'user_activated': 'Activated user account',
    'user_role_changed': 'Changed user role',
    'listing_approved': 'Approved listing',
    'listing_rejected': 'Rejected listing',
    'listing_suspended': 'Suspended listing',
    'booking_cancelled_admin': 'Cancelled booking (admin action)',
    'admin_login': 'Admin logged in',
    'admin_logout': 'Admin logged out',
    'settings_updated': 'Updated system settings'
  };
  
  return descriptions[this.action] || this.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
});

// Static method to log admin action
auditLogSchema.statics.logAction = function(actionData) {
  return this.create({
    user_id: actionData.userId,
    action: actionData.action,
    resource: actionData.resource,
    resource_id: actionData.resourceId,
    details: actionData.details || {},
    previous_state: actionData.previousState,
    new_state: actionData.newState,
    ip_address: actionData.ipAddress,
    user_agent: actionData.userAgent,
    request_method: actionData.method || 'POST',
    request_body: actionData.requestBody,
    response_status: actionData.responseStatus || 200,
    severity: actionData.severity || 'medium',
    tags: actionData.tags || [],
    metadata: actionData.metadata || {}
  });
};

// Static method to get recent activity
auditLogSchema.statics.getRecentActivity = function(options = {}) {
  const {
    limit = 50,
    userId = null,
    action = null,
    severity = null,
    startDate = null,
    endDate = null
  } = options;

  const query = {};
  
  if (userId) query.user_id = userId;
  if (action) query.action = action;
  if (severity) query.severity = severity;
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return this.find(query)
    .populate('user_id', 'name email role')
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method to get activity statistics
auditLogSchema.statics.getActivityStats = function(timeframe = '24h') {
  const now = new Date();
  let startDate;

  switch (timeframe) {
    case '1h':
      startDate = new Date(now - 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now - 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        latest: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Pre-save middleware to set severity based on action
auditLogSchema.pre('save', function(next) {
  const highSeverityActions = [
    'user_deleted', 'user_suspended', 'user_role_changed',
    'listing_deleted', 'booking_cancelled_admin',
    'account_locked', 'suspicious_activity_flagged'
  ];
  
  const criticalSeverityActions = [
    'bulk_action_performed', 'settings_updated',
    'payment_refunded', 'payout_processed'
  ];

  if (criticalSeverityActions.includes(this.action)) {
    this.severity = 'critical';
  } else if (highSeverityActions.includes(this.action)) {
    this.severity = 'high';
  } else if (!this.severity) {
    this.severity = 'medium';
  }

  next();
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;