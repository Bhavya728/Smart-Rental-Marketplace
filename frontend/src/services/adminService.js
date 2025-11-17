/**
 * Admin Service - Frontend API Client
 * Handles API calls for admin panel functionality
 */

import api from './api';

class AdminService {
  /**
   * Dashboard Methods
   */
  static async getDashboard() {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard error:', error);
      throw error;
    }
  }

  /**
   * User Management Methods
   */
  static async getUsers(params = {}) {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  static async updateUser(userId, updates) {
    try {
      const response = await api.put(`/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  static async bulkUserOperation(userIds, operation) {
    try {
      const response = await api.post('/admin/users/bulk', {
        user_ids: userIds,
        operation
      });
      return response.data;
    } catch (error) {
      console.error('Bulk user operation error:', error);
      throw error;
    }
  }

  static async exportUsers(filters = {}, format = 'csv') {
    try {
      const response = await api.post('/admin/users/export', {
        filters,
        format
      }, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        // Handle CSV download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true, message: 'Export downloaded successfully' };
      }

      return response.data;
    } catch (error) {
      console.error('Export users error:', error);
      throw error;
    }
  }

  /**
   * Listing Management Methods
   */
  static async getListings(params = {}) {
    try {
      const response = await api.get('/admin/listings', { params });
      return response.data;
    } catch (error) {
      console.error('Get listings error:', error);
      throw error;
    }
  }

  static async moderateListing(listingId, action, reason = '') {
    try {
      const response = await api.put(`/admin/listings/${listingId}/moderate`, {
        action,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Moderate listing error:', error);
      throw error;
    }
  }

  static async exportListings(filters = {}, format = 'csv') {
    try {
      const response = await api.post('/admin/listings/export', {
        filters,
        format
      }, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'listings-export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true, message: 'Export downloaded successfully' };
      }

      return response.data;
    } catch (error) {
      console.error('Export listings error:', error);
      throw error;
    }
  }

  /**
   * Activity Log Methods
   */
  static async getActivityLogs(params = {}) {
    try {
      const response = await api.get('/admin/activity-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Get activity logs error:', error);
      throw error;
    }
  }

  /**
   * Analytics Methods
   */
  static async getRevenueAnalytics(timeframe = '30d') {
    try {
      const response = await api.get('/admin/analytics/revenue', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Get revenue analytics error:', error);
      throw error;
    }
  }

  static async getUserActivityAnalytics(timeframe = '30d') {
    try {
      const response = await api.get('/admin/analytics/users', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Get user activity analytics error:', error);
      throw error;
    }
  }

  static async getListingAnalytics(timeframe = '30d') {
    try {
      const response = await api.get('/admin/analytics/listings', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Get listing analytics error:', error);
      throw error;
    }
  }

  static async getBookingAnalytics(timeframe = '30d') {
    try {
      const response = await api.get('/admin/analytics/bookings', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Get booking analytics error:', error);
      throw error;
    }
  }

  static async getGeographicAnalytics() {
    try {
      const response = await api.get('/admin/analytics/geographic');
      return response.data;
    } catch (error) {
      console.error('Get geographic analytics error:', error);
      throw error;
    }
  }

  static async getSystemMetrics() {
    try {
      const response = await api.get('/admin/analytics/system');
      return response.data;
    } catch (error) {
      console.error('Get system metrics error:', error);
      throw error;
    }
  }

  /**
   * Utility Methods
   */
  static async getAllAnalytics(timeframe = '30d') {
    try {
      const [
        revenueData,
        userActivityData,
        listingData,
        bookingData,
        geographicData,
        systemMetrics
      ] = await Promise.all([
        this.getRevenueAnalytics(timeframe),
        this.getUserActivityAnalytics(timeframe),
        this.getListingAnalytics(timeframe),
        this.getBookingAnalytics(timeframe),
        this.getGeographicAnalytics(),
        this.getSystemMetrics()
      ]);

      return {
        revenue: revenueData.data,
        user_activity: userActivityData.data,
        listings: listingData.data,
        bookings: bookingData.data,
        geographic: geographicData.data,
        system: systemMetrics.data
      };
    } catch (error) {
      console.error('Get all analytics error:', error);
      throw error;
    }
  }

  /**
   * Real-time updates
   */
  static async subscribeToUpdates(callback) {
    // This would typically use WebSockets or Server-Sent Events
    // For now, we'll implement polling
    const interval = setInterval(async () => {
      try {
        const dashboardData = await this.getDashboard();
        callback(dashboardData.data);
      } catch (error) {
        console.error('Real-time update error:', error);
      }
    }, 30000); // Update every 30 seconds

    // Return cleanup function
    return () => clearInterval(interval);
  }

  /**
   * Error handling helper
   */
  static handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      if (status === 403) {
        throw new Error(data.message || 'Access denied');
      }
      
      throw new Error(data.message || 'Server error');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown error occurred');
    }
  }

  /**
   * Cache management
   */
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      // If fetch fails but we have cached data, return it
      if (cached) {
        console.warn('Using stale cached data due to fetch error');
        return cached.data;
      }
      throw error;
    }
  }

  static clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Batch operations helper
   */
  static async batchRequest(requests) {
    try {
      const results = await Promise.allSettled(requests);
      
      return results.map((result, index) => ({
        index,
        status: result.status,
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    } catch (error) {
      console.error('Batch request error:', error);
      throw error;
    }
  }
}

export default AdminService;