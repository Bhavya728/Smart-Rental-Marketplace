/**
 * Analytics Service
 * Provides data analytics and reporting for admin dashboard
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');

class AnalyticsService {
  /**
   * Get revenue analytics
   */
  static async getRevenueAnalytics(timeframe = '30d') {
    try {
      const { startDate, endDate, groupBy } = this.getTimeframeParams(timeframe);

      const pipeline = [
        {
          $match: {
            status: 'completed',
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'transactions',
            localField: 'transaction_id',
            foreignField: '_id',
            as: 'transaction'
          }
        },
        {
          $unwind: '$transaction'
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy.format,
                date: '$created_at'
              }
            },
            total_revenue: { $sum: '$transaction.amount' },
            booking_count: { $sum: 1 },
            avg_booking_value: { $avg: '$transaction.amount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ];

      const results = await Booking.aggregate(pipeline);

      // Calculate totals
      const totals = results.reduce((acc, item) => ({
        total_revenue: acc.total_revenue + item.total_revenue,
        total_bookings: acc.total_bookings + item.booking_count,
        avg_booking_value: (acc.total_revenue + item.total_revenue) / (acc.total_bookings + item.booking_count)
      }), { total_revenue: 0, total_bookings: 0 });

      return {
        timeframe,
        data: results,
        totals,
        period_start: startDate,
        period_end: endDate
      };
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Get user activity analytics
   */
  static async getUserActivityAnalytics(timeframe = '30d') {
    try {
      const { startDate, endDate, groupBy } = this.getTimeframeParams(timeframe);

      // New user registrations
      const newUsersData = await User.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy.format,
                date: '$created_at'
              }
            },
            new_users: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Active users (users who made bookings or listings)
      const activeUsersData = await Booking.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: groupBy.format,
                  date: '$created_at'
                }
              },
              user: '$renter_id'
            }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            active_users: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // User retention (users who return within 30 days)
      const retentionData = await this.calculateUserRetention(startDate, endDate);

      return {
        timeframe,
        new_users: newUsersData,
        active_users: activeUsersData,
        retention: retentionData,
        period_start: startDate,
        period_end: endDate
      };
    } catch (error) {
      console.error('Error getting user activity analytics:', error);
      throw error;
    }
  }

  /**
   * Get listing performance analytics
   */
  static async getListingAnalytics(timeframe = '30d') {
    try {
      const { startDate, endDate } = this.getTimeframeParams(timeframe);

      // New listings
      const newListingsData = await Listing.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$created_at'
              }
            },
            new_listings: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Listing performance by category
      const categoryPerformance = await Booking.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'listings',
            localField: 'listing_id',
            foreignField: '_id',
            as: 'listing'
          }
        },
        {
          $unwind: '$listing'
        },
        {
          $group: {
            _id: '$listing.category',
            booking_count: { $sum: 1 },
            total_revenue: { $sum: '$total_amount' }
          }
        },
        {
          $sort: { booking_count: -1 }
        }
      ]);

      // Top performing listings
      const topListings = await Booking.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$listing_id',
            booking_count: { $sum: 1 },
            total_revenue: { $sum: '$total_amount' },
            avg_rating: { $avg: '$rating' }
          }
        },
        {
          $lookup: {
            from: 'listings',
            localField: '_id',
            foreignField: '_id',
            as: 'listing'
          }
        },
        {
          $unwind: '$listing'
        },
        {
          $sort: { booking_count: -1 }
        },
        {
          $limit: 10
        }
      ]);

      return {
        timeframe,
        new_listings: newListingsData,
        category_performance: categoryPerformance,
        top_listings: topListings,
        period_start: startDate,
        period_end: endDate
      };
    } catch (error) {
      console.error('Error getting listing analytics:', error);
      throw error;
    }
  }

  /**
   * Get booking analytics
   */
  static async getBookingAnalytics(timeframe = '30d') {
    try {
      const { startDate, endDate, groupBy } = this.getTimeframeParams(timeframe);

      // Booking trends
      const bookingTrends = await Booking.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: groupBy.format,
                  date: '$created_at'
                }
              },
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            statuses: {
              $push: {
                status: '$_id.status',
                count: '$count'
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Conversion funnel
      const conversionData = await this.getBookingConversionFunnel(startDate, endDate);

      // Average booking duration and value
      const bookingMetrics = await Booking.aggregate([
        {
          $match: {
            status: { $in: ['completed', 'confirmed'] },
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            avg_duration: {
              $avg: {
                $divide: [
                  { $subtract: ['$end_date', '$start_date'] },
                  1000 * 60 * 60 * 24 // Convert to days
                ]
              }
            },
            avg_value: { $avg: '$total_amount' },
            total_bookings: { $sum: 1 }
          }
        }
      ]);

      return {
        timeframe,
        booking_trends: bookingTrends,
        conversion_funnel: conversionData,
        metrics: bookingMetrics[0] || {},
        period_start: startDate,
        period_end: endDate
      };
    } catch (error) {
      console.error('Error getting booking analytics:', error);
      throw error;
    }
  }

  /**
   * Get geographic analytics
   */
  static async getGeographicAnalytics() {
    try {
      // Listings by location
      const listingsByLocation = await Listing.aggregate([
        {
          $group: {
            _id: {
              city: '$location.city',
              state: '$location.state',
              country: '$location.country'
            },
            listing_count: { $sum: 1 }
          }
        },
        {
          $sort: { listing_count: -1 }
        },
        {
          $limit: 20
        }
      ]);

      // Bookings by location
      const bookingsByLocation = await Booking.aggregate([
        {
          $lookup: {
            from: 'listings',
            localField: 'listing_id',
            foreignField: '_id',
            as: 'listing'
          }
        },
        {
          $unwind: '$listing'
        },
        {
          $group: {
            _id: {
              city: '$listing.location.city',
              state: '$listing.location.state',
              country: '$listing.location.country'
            },
            booking_count: { $sum: 1 },
            total_revenue: { $sum: '$total_amount' }
          }
        },
        {
          $sort: { booking_count: -1 }
        },
        {
          $limit: 20
        }
      ]);

      return {
        listings_by_location: listingsByLocation,
        bookings_by_location: bookingsByLocation
      };
    } catch (error) {
      console.error('Error getting geographic analytics:', error);
      throw error;
    }
  }

  /**
   * Get system performance metrics
   */
  static async getSystemMetrics() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Error rates and response times would typically come from monitoring systems
      // For now, we'll get audit log data
      const systemActivity = await AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: oneDayAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d %H:00:00',
                date: '$timestamp'
              }
            },
            total_requests: { $sum: 1 },
            error_count: {
              $sum: {
                $cond: [{ $gte: ['$response_status', 400] }, 1, 0]
              }
            }
          }
        },
        {
          $addFields: {
            error_rate: {
              $multiply: [
                { $divide: ['$error_count', '$total_requests'] },
                100
              ]
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Database performance metrics (simplified)
      const dbMetrics = {
        total_collections: 6, // Users, Listings, Bookings, Reviews, AuditLogs, Transactions
        total_documents: await this.getTotalDocuments(),
        avg_query_time: Math.random() * 100 + 50, // Simulated - would come from monitoring
        connection_count: Math.floor(Math.random() * 20) + 5 // Simulated
      };

      return {
        system_activity: systemActivity,
        database_metrics: dbMetrics,
        generated_at: new Date()
      };
    } catch (error) {
      console.error('Error getting system metrics:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  static getTimeframeParams(timeframe) {
    const now = new Date();
    let startDate, groupBy;

    switch (timeframe) {
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        groupBy = { format: '%Y-%m-%d' };
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        groupBy = { format: '%Y-%m-%d' };
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        groupBy = { format: '%Y-%U' }; // Weekly
        break;
      case '1y':
        startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
        groupBy = { format: '%Y-%m' }; // Monthly
        break;
      default:
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        groupBy = { format: '%Y-%m-%d' };
    }

    return {
      startDate,
      endDate: now,
      groupBy
    };
  }

  static async calculateUserRetention(startDate, endDate) {
    try {
      // Get users who signed up in the period
      const newUsers = await User.find({
        created_at: { $gte: startDate, $lte: endDate }
      }).select('_id created_at');

      // Check how many returned within 30 days
      let returnedUsers = 0;

      for (const user of newUsers) {
        const thirtyDaysAfter = new Date(user.created_at.getTime() + 30 * 24 * 60 * 60 * 1000);
        const hasActivity = await Booking.exists({
          renter_id: user._id,
          created_at: { $gte: user.created_at, $lte: thirtyDaysAfter }
        });

        if (hasActivity) returnedUsers++;
      }

      const retentionRate = newUsers.length > 0 ? (returnedUsers / newUsers.length) * 100 : 0;

      return {
        total_new_users: newUsers.length,
        returned_users: returnedUsers,
        retention_rate: Math.round(retentionRate)
      };
    } catch (error) {
      console.error('Error calculating user retention:', error);
      return { total_new_users: 0, returned_users: 0, retention_rate: 0 };
    }
  }

  static async getBookingConversionFunnel(startDate, endDate) {
    try {
      // This is a simplified funnel - in reality you'd track page views, etc.
      const totalListingViews = Math.floor(Math.random() * 10000) + 5000; // Simulated
      
      const bookingAttempts = await Booking.countDocuments({
        created_at: { $gte: startDate, $lte: endDate }
      });

      const completedBookings = await Booking.countDocuments({
        created_at: { $gte: startDate, $lte: endDate },
        status: { $in: ['completed', 'confirmed'] }
      });

      return {
        listing_views: totalListingViews,
        booking_attempts: bookingAttempts,
        completed_bookings: completedBookings,
        conversion_rates: {
          view_to_booking: ((bookingAttempts / totalListingViews) * 100).toFixed(2),
          booking_to_completion: bookingAttempts > 0 ? ((completedBookings / bookingAttempts) * 100).toFixed(2) : 0
        }
      };
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      return {};
    }
  }

  static async getTotalDocuments() {
    try {
      const [users, listings, bookings, reviews, auditLogs] = await Promise.all([
        User.countDocuments(),
        Listing.countDocuments(),
        Booking.countDocuments(),
        Review.countDocuments(),
        AuditLog.countDocuments()
      ]);

      return users + listings + bookings + reviews + auditLogs;
    } catch (error) {
      console.error('Error getting total documents:', error);
      return 0;
    }
  }
}

module.exports = AnalyticsService;