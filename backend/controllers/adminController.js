/**
 * Admin Controller
 * Handles administrative operations and analytics
 */

const AdminService = require('../services/adminService');
const AnalyticsService = require('../services/analyticsService');
const AuditLog = require('../models/AuditLog');

class AdminController {
  /**
   * Get admin dashboard overview
   */
  static async getDashboard(req, res) {
    try {
      const stats = await AdminService.getDashboardStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load dashboard data',
        error: error.message
      });
    }
  }

  /**
   * Get users with pagination and filters
   */
  static async getUsers(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: req.query.search || '',
        role: req.query.role || '',
        status: req.query.status || '',
        sort_by: req.query.sort_by || 'created_at',
        sort_order: req.query.sort_order || 'desc'
      };

      const result = await AdminService.getUsers(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  }

  /**
   * Update user (role, status, etc.)
   */
  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;
      const adminId = req.admin._id;

      const updatedUser = await AdminService.updateUser(userId, updates, adminId);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update user'
      });
    }
  }

  /**
   * Get listings with pagination and filters
   */
  static async getListings(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: req.query.search || '',
        status: req.query.status || '',
        category: req.query.category || '',
        sort_by: req.query.sort_by || 'created_at',
        sort_order: req.query.sort_order || 'desc'
      };

      const result = await AdminService.getListings(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get listings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch listings',
        error: error.message
      });
    }
  }

  /**
   * Moderate listing (approve/reject/suspend)
   */
  static async moderateListing(req, res) {
    try {
      const { listingId } = req.params;
      const { action, reason } = req.body;
      const adminId = req.admin._id;

      if (!['approved', 'rejected', 'suspended'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
      }

      const listing = await AdminService.moderateListing(listingId, action, adminId, reason);

      res.json({
        success: true,
        message: `Listing ${action} successfully`,
        data: listing
      });
    } catch (error) {
      console.error('Moderate listing error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to moderate listing'
      });
    }
  }

  /**
   * Get activity logs
   */
  static async getActivityLogs(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        action: req.query.action || '',
        user_id: req.query.user_id || '',
        severity: req.query.severity || '',
        start_date: req.query.start_date || '',
        end_date: req.query.end_date || ''
      };

      const result = await AdminService.getActivityLogs(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get activity logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch activity logs',
        error: error.message
      });
    }
  }

  /**
   * Bulk user operations
   */
  static async bulkUserOperation(req, res) {
    try {
      const { user_ids, operation } = req.body;
      const adminId = req.admin._id;

      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user IDs'
        });
      }

      if (!['activate', 'suspend', 'delete'].includes(operation)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid operation'
        });
      }

      const results = await AdminService.bulkUserOperation(user_ids, operation, adminId);

      res.json({
        success: true,
        message: 'Bulk operation completed',
        data: results
      });
    } catch (error) {
      console.error('Bulk user operation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk operation',
        error: error.message
      });
    }
  }

  /**
   * Analytics endpoints
   */
  static async getRevenueAnalytics(req, res) {
    try {
      const timeframe = req.query.timeframe || '30d';
      const data = await AnalyticsService.getRevenueAnalytics(timeframe);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Revenue analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue analytics',
        error: error.message
      });
    }
  }

  static async getUserActivityAnalytics(req, res) {
    try {
      const timeframe = req.query.timeframe || '30d';
      const data = await AnalyticsService.getUserActivityAnalytics(timeframe);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('User activity analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user activity analytics',
        error: error.message
      });
    }
  }

  static async getListingAnalytics(req, res) {
    try {
      const timeframe = req.query.timeframe || '30d';
      const data = await AnalyticsService.getListingAnalytics(timeframe);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Listing analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch listing analytics',
        error: error.message
      });
    }
  }

  static async getBookingAnalytics(req, res) {
    try {
      const timeframe = req.query.timeframe || '30d';
      const data = await AnalyticsService.getBookingAnalytics(timeframe);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Booking analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking analytics',
        error: error.message
      });
    }
  }

  static async getGeographicAnalytics(req, res) {
    try {
      const data = await AnalyticsService.getGeographicAnalytics();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Geographic analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch geographic analytics',
        error: error.message
      });
    }
  }

  static async getSystemMetrics(req, res) {
    try {
      const data = await AnalyticsService.getSystemMetrics();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('System metrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system metrics',
        error: error.message
      });
    }
  }

  /**
   * Export data endpoints
   */
  static async exportUsers(req, res) {
    try {
      const { format = 'csv', filters = {} } = req.body;
      const adminId = req.admin._id;

      // Get all users matching filters
      const result = await AdminService.getUsers({
        ...filters,
        limit: 10000 // Large limit for export
      });

      // Log export action
      await AuditLog.logAction({
        userId: adminId,
        action: 'export_generated',
        resource: 'user',
        details: { 
          format,
          filters,
          record_count: result.users.length
        },
        severity: 'medium'
      });

      if (format === 'csv') {
        // Convert to CSV
        const csvData = this.convertToCSV(result.users, [
          'name', 'email', 'role', 'account_status', 'created_at', 'last_login'
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
        res.send(csvData);
      } else {
        res.json({
          success: true,
          data: result.users,
          total: result.users.length
        });
      }
    } catch (error) {
      console.error('Export users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export users',
        error: error.message
      });
    }
  }

  static async exportListings(req, res) {
    try {
      const { format = 'csv', filters = {} } = req.body;
      const adminId = req.admin._id;

      const result = await AdminService.getListings({
        ...filters,
        limit: 10000
      });

      await AuditLog.logAction({
        userId: adminId,
        action: 'export_generated',
        resource: 'listing',
        details: { 
          format,
          filters,
          record_count: result.listings.length
        },
        severity: 'medium'
      });

      if (format === 'csv') {
        const csvData = this.convertToCSV(result.listings, [
          'title', 'category', 'price_per_day', 'status', 'owner_id.name', 'created_at'
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="listings-export.csv"');
        res.send(csvData);
      } else {
        res.json({
          success: true,
          data: result.listings,
          total: result.listings.length
        });
      }
    } catch (error) {
      console.error('Export listings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export listings',
        error: error.message
      });
    }
  }

  /**
   * Helper methods
   */
  static convertToCSV(data, fields) {
    if (!data.length) return '';

    const headers = fields.join(',');
    const rows = data.map(item => {
      return fields.map(field => {
        // Handle nested fields like 'owner_id.name'
        const value = field.split('.').reduce((obj, key) => obj?.[key], item) || '';
        // Escape CSV special characters
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',');
    });

    return [headers, ...rows].join('\n');
  }
}

module.exports = AdminController;