/**
 * Admin Service
 * Handles administrative operations and user management
 */

const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');
const { sendEmail } = require('./emailService');

class AdminService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        totalListings,
        activeListings,
        totalBookings,
        pendingBookings,
        totalReviews,
        recentActivity
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ account_status: 'active' }),
        Listing.countDocuments(),
        Listing.countDocuments({ status: 'active' }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'pending' }),
        Review.countDocuments(),
        AuditLog.getRecentActivity({ limit: 10 })
      ]);

      // Calculate growth rates (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const [
        newUsersLast30,
        newUsersPrevious30,
        newListingsLast30,
        newListingsPrevious30,
        newBookingsLast30,
        newBookingsPrevious30
      ] = await Promise.all([
        User.countDocuments({ created_at: { $gte: thirtyDaysAgo } }),
        User.countDocuments({ 
          created_at: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
        }),
        Listing.countDocuments({ created_at: { $gte: thirtyDaysAgo } }),
        Listing.countDocuments({ 
          created_at: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
        }),
        Booking.countDocuments({ created_at: { $gte: thirtyDaysAgo } }),
        Booking.countDocuments({ 
          created_at: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
        })
      ]);

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          new_last_30_days: newUsersLast30,
          growth_rate: this.calculateGrowthRate(newUsersLast30, newUsersPrevious30)
        },
        listings: {
          total: totalListings,
          active: activeListings,
          new_last_30_days: newListingsLast30,
          growth_rate: this.calculateGrowthRate(newListingsLast30, newListingsPrevious30)
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          new_last_30_days: newBookingsLast30,
          growth_rate: this.calculateGrowthRate(newBookingsLast30, newBookingsPrevious30)
        },
        reviews: {
          total: totalReviews
        },
        recent_activity: recentActivity
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get users with pagination and filters
   */
  static async getUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        role = '',
        status = '',
        sort_by = 'created_at',
        sort_order = 'desc'
      } = options;

      const query = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (role) query.role = role;
      if (status) query.account_status = status;

      const sortOrder = sort_order === 'desc' ? -1 : 1;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password -verification_token')
          .sort({ [sort_by]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(query)
      ]);

      return {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Update user status or role
   */
  static async updateUser(userId, updates, adminId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const previousState = {
        role: user.role,
        account_status: user.account_status,
        verified_status: user.verified_status
      };

      // Update user
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          user[key] = updates[key];
        }
      });

      await user.save();

      // Log the action
      await AuditLog.logAction({
        userId: adminId,
        action: 'user_updated',
        resource: 'user',
        resourceId: userId,
        previousState,
        newState: {
          role: user.role,
          account_status: user.account_status,
          verified_status: user.verified_status
        },
        details: { updated_fields: Object.keys(updates) }
      });

      // Send notification email if status changed
      if (updates.account_status && updates.account_status !== previousState.account_status) {
        await this.sendStatusChangeEmail(user, updates.account_status);
      }

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Get listings with pagination and filters
   */
  static async getListings(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        status = '',
        category = '',
        sort_by = 'created_at',
        sort_order = 'desc'
      } = options;

      const query = {};
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (status) query.status = status;
      if (category) query.category = category;

      const sortOrder = sort_order === 'desc' ? -1 : 1;
      const skip = (page - 1) * limit;

      const [listings, total] = await Promise.all([
        Listing.find(query)
          .populate('owner_id', 'name email')
          .sort({ [sort_by]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        Listing.countDocuments(query)
      ]);

      return {
        listings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting listings:', error);
      throw error;
    }
  }

  /**
   * Moderate listing (approve/reject/suspend)
   */
  static async moderateListing(listingId, action, adminId, reason = '') {
    try {
      const listing = await Listing.findById(listingId).populate('owner_id');
      if (!listing) {
        throw new Error('Listing not found');
      }

      const previousStatus = listing.status;
      
      // Update listing status
      listing.status = action;
      listing.moderation_notes = reason;
      listing.moderated_by = adminId;
      listing.moderated_at = new Date();

      await listing.save();

      // Log the action
      await AuditLog.logAction({
        userId: adminId,
        action: `listing_${action}`,
        resource: 'listing',
        resourceId: listingId,
        details: { 
          reason,
          previous_status: previousStatus,
          new_status: action
        }
      });

      // Send notification email to owner
      await this.sendListingModerationEmail(listing, action, reason);

      return listing;
    } catch (error) {
      console.error('Error moderating listing:', error);
      throw error;
    }
  }

  /**
   * Get system activity logs
   */
  static async getActivityLogs(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        action = '',
        user_id = '',
        severity = '',
        start_date = '',
        end_date = ''
      } = options;

      const query = {};
      
      if (action) query.action = action;
      if (user_id) query.user_id = user_id;
      if (severity) query.severity = severity;
      
      if (start_date || end_date) {
        query.timestamp = {};
        if (start_date) query.timestamp.$gte = new Date(start_date);
        if (end_date) query.timestamp.$lte = new Date(end_date);
      }

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate('user_id', 'name email role')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditLog.countDocuments(query)
      ]);

      return {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting activity logs:', error);
      throw error;
    }
  }

  /**
   * Bulk user operations
   */
  static async bulkUserOperation(userIds, operation, adminId) {
    try {
      const results = {
        successful: [],
        failed: []
      };

      for (const userId of userIds) {
        try {
          let user;
          switch (operation) {
            case 'activate':
              user = await this.updateUser(userId, { account_status: 'active' }, adminId);
              break;
            case 'suspend':
              user = await this.updateUser(userId, { account_status: 'suspended' }, adminId);
              break;
            case 'delete':
              user = await User.findByIdAndDelete(userId);
              await AuditLog.logAction({
                userId: adminId,
                action: 'user_deleted',
                resource: 'user',
                resourceId: userId
              });
              break;
            default:
              throw new Error('Invalid operation');
          }
          results.successful.push({ userId, user });
        } catch (error) {
          results.failed.push({ userId, error: error.message });
        }
      }

      // Log bulk operation
      await AuditLog.logAction({
        userId: adminId,
        action: 'bulk_action_performed',
        resource: 'user',
        details: {
          operation,
          total_users: userIds.length,
          successful_count: results.successful.length,
          failed_count: results.failed.length
        },
        severity: 'critical'
      });

      return results;
    } catch (error) {
      console.error('Error in bulk user operation:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  static calculateGrowthRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  static async sendStatusChangeEmail(user, newStatus) {
    try {
      const templates = {
        active: {
          subject: 'Account Activated',
          template: 'account-activated'
        },
        suspended: {
          subject: 'Account Suspended',
          template: 'account-suspended'
        }
      };

      const emailTemplate = templates[newStatus];
      if (emailTemplate) {
        await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          template: emailTemplate.template,
          data: { user }
        });
      }
    } catch (error) {
      console.error('Error sending status change email:', error);
    }
  }

  static async sendListingModerationEmail(listing, action, reason) {
    try {
      const templates = {
        approved: {
          subject: 'Listing Approved',
          template: 'listing-approved'
        },
        rejected: {
          subject: 'Listing Rejected',
          template: 'listing-rejected'
        },
        suspended: {
          subject: 'Listing Suspended',
          template: 'listing-suspended'
        }
      };

      const emailTemplate = templates[action];
      if (emailTemplate) {
        await sendEmail({
          to: listing.owner_id.email,
          subject: emailTemplate.subject,
          template: emailTemplate.template,
          data: { listing, reason }
        });
      }
    } catch (error) {
      console.error('Error sending listing moderation email:', error);
    }
  }
}

module.exports = AdminService;