/**
 * Admin Routes
 * Routes for admin panel functionality
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminAuth, requirePermissions, auditLogger } = require('../middleware/adminAuth');

// Apply auth middleware to all admin routes
router.use(protect);
router.use(adminAuth);

/**
 * Dashboard Routes
 */
router.get('/dashboard', 
  auditLogger('dashboard_viewed'),
  AdminController.getDashboard
);

/**
 * User Management Routes
 */
router.get('/users', 
  requirePermissions(['view_users']),
  auditLogger('users_viewed'),
  AdminController.getUsers
);

router.put('/users/:userId', 
  requirePermissions(['edit_users']),
  auditLogger('user_updated'),
  AdminController.updateUser
);

router.post('/users/bulk',
  requirePermissions(['edit_users']),
  auditLogger('bulk_user_operation'),
  AdminController.bulkUserOperation
);

router.post('/users/export',
  requirePermissions(['export_data']),
  auditLogger('users_exported'),
  AdminController.exportUsers
);

/**
 * Listing Management Routes
 */
router.get('/listings',
  requirePermissions(['view_listings']),
  auditLogger('listings_viewed'),
  AdminController.getListings
);

router.put('/listings/:listingId/moderate',
  requirePermissions(['moderate_listings']),
  auditLogger('listing_moderated'),
  AdminController.moderateListing
);

router.post('/listings/export',
  requirePermissions(['export_data']),
  auditLogger('listings_exported'),
  AdminController.exportListings
);

/**
 * Activity Log Routes
 */
router.get('/activity-logs',
  requirePermissions(['view_logs']),
  auditLogger('activity_logs_viewed'),
  AdminController.getActivityLogs
);

/**
 * Analytics Routes
 */
router.get('/analytics/revenue',
  requirePermissions(['view_analytics']),
  auditLogger('revenue_analytics_viewed'),
  AdminController.getRevenueAnalytics
);

router.get('/analytics/users',
  requirePermissions(['view_analytics']),
  auditLogger('user_analytics_viewed'),
  AdminController.getUserActivityAnalytics
);

router.get('/analytics/listings',
  requirePermissions(['view_analytics']),
  auditLogger('listing_analytics_viewed'),
  AdminController.getListingAnalytics
);

router.get('/analytics/bookings',
  requirePermissions(['view_analytics']),
  auditLogger('booking_analytics_viewed'),
  AdminController.getBookingAnalytics
);

router.get('/analytics/geographic',
  requirePermissions(['view_analytics']),
  auditLogger('geographic_analytics_viewed'),
  AdminController.getGeographicAnalytics
);

router.get('/analytics/system',
  requirePermissions(['view_system_metrics']),
  auditLogger('system_metrics_viewed'),
  AdminController.getSystemMetrics
);

/**
 * Error handling middleware for admin routes
 */
router.use((error, req, res, next) => {
  console.error('Admin route error:', error);
  
  // Log critical errors
  if (error.status >= 500) {
    const AuditLog = require('../models/AuditLog');
    AuditLog.logAction({
      userId: req.admin?._id || req.user?.id,
      action: 'system_error',
      resource: 'admin_panel',
      details: {
        error_message: error.message,
        stack_trace: error.stack,
        route: req.route?.path || req.path,
        method: req.method
      },
      severity: 'critical'
    }).catch(console.error);
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = router;