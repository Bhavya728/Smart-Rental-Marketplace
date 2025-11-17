/**
 * Admin Authentication Middleware
 * Verifies that the user has admin role permissions
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify admin role
 * Requires authentication middleware to run first
 */
const adminAuth = async (req, res, next) => {
  try {
    // Check if user is already authenticated (from auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user from database with fresh data
    const user = await User.findById(req.user.id).select('+role +permissions');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Check if admin account is active
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is not active'
      });
    }

    // Attach admin user to request
    req.admin = user;
    next();

  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin authentication'
    });
  }
};

/**
 * Middleware to check specific admin permissions
 * @param {Array} requiredPermissions - Array of required permissions
 */
const requirePermissions = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const user = req.admin || req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super admin has all permissions
      if (user.role === 'super_admin') {
        return next();
      }

      // Check if user has required permissions
      const userPermissions = user.permissions || [];
      const hasPermission = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermissions,
          current: userPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in permission check'
      });
    }
  };
};

/**
 * Middleware to log admin actions for audit trail
 */
const auditLogger = (action) => {
  return async (req, res, next) => {
    try {
      // Import here to avoid circular dependencies
      const AuditLog = require('../models/AuditLog');
      
      const originalSend = res.send;
      res.send = function(data) {
        // Log the admin action after response is sent
        setImmediate(async () => {
          try {
            await AuditLog.create({
              user_id: req.admin?._id || req.user?.id,
              action: action,
              resource: req.route?.path || req.path,
              resource_id: req.params.id || null,
              ip_address: req.ip,
              user_agent: req.get('User-Agent'),
              request_method: req.method,
              request_body: req.method !== 'GET' ? req.body : null,
              response_status: res.statusCode,
              timestamp: new Date()
            });
          } catch (auditError) {
            console.error('Audit log error:', auditError);
          }
        });
        
        originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Audit logger error:', error);
      next(); // Continue even if audit logging fails
    }
  };
};

module.exports = {
  adminAuth,
  requirePermissions,
  auditLogger
};