import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../services/bookingService';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && (user.role === 'owner' || user.role === 'both')) {
      loadPendingBookings();
      // Refresh every 30 seconds
      const interval = setInterval(loadPendingBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadPendingBookings = async () => {
    try {
      setLoading(true);
      console.log('Loading pending bookings for notification center...');
      
      // Use the direct API call instead of the service method to avoid issues
      const response = await bookingService.getUserBookings({ 
        role: 'owner',
        status: 'pending_approval',
        limit: 50
      });
      
      console.log('API Response:', response);
      
      if (response && response.success) {
        const pendingBookings = response.data || [];
        console.log('Pending bookings:', pendingBookings);
        
        const notificationData = pendingBookings.map(booking => ({
          id: booking._id || booking.id,
          type: 'booking_request',
          title: 'New Booking Request',
          message: `${booking.renter_id?.name?.firstName || booking.renter_id?.first_name || 'Guest'} wants to book "${booking.listing_id?.title || 'your listing'}"`,
          timestamp: booking.createdAt,
          booking: booking,
          unread: true
        }));
        
        setNotifications(notificationData);
      } else {
        console.log('No bookings found or invalid response format');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load pending bookings:', error);
      console.error('Error details:', error.response?.data || error.message);
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      console.log('Approving booking:', bookingId);
      const response = await bookingService.approveBooking(bookingId);
      console.log('Approve response:', response);
      
      if (response && response.success) {
        // Remove from notifications
        setNotifications(prev => prev.filter(n => n.booking?._id !== bookingId && n.booking?.id !== bookingId));
        // Show success message
        alert('Booking approved successfully!');
        // Reload notifications to get updated data
        loadPendingBookings();
      } else {
        throw new Error(response?.message || 'Failed to approve booking');
      }
    } catch (error) {
      console.error('Approve booking error:', error);
      alert(`Failed to approve booking: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      const reason = prompt('Please provide a reason for rejection (optional):');
      console.log('Rejecting booking:', bookingId, 'with reason:', reason);
      
      const response = await bookingService.rejectBooking(bookingId, reason);
      console.log('Reject response:', response);
      
      if (response && response.success) {
        // Remove from notifications
        setNotifications(prev => prev.filter(n => n.booking?._id !== bookingId && n.booking?.id !== bookingId));
        // Show success message
        alert('Booking rejected successfully!');
        // Reload notifications to get updated data
        loadPendingBookings();
      } else {
        throw new Error(response?.message || 'Failed to reject booking');
      }
    } catch (error) {
      console.error('Reject booking error:', error);
      alert(`Failed to reject booking: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!user || (user.role !== 'owner' && user.role !== 'both')) {
    return null;
  }

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">({unreadCount} new)</span>
                )}
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 text-sm mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No pending booking requests</p>
                  <p className="text-sm">You'll see new booking requests here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.timestamp)}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          {notification.booking && (
                            <div className="mt-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-4">
                                <span>
                                  📅 {new Date(notification.booking.start_date).toLocaleDateString()} - 
                                  {new Date(notification.booking.end_date).toLocaleDateString()}
                                </span>
                                <span>💰 ${notification.booking.total_cost}</span>
                              </div>
                            </div>
                          )}
                          
                          {notification.type === 'booking_request' && notification.booking && (
                            <div className="flex items-center space-x-2 mt-3">
                              <button
                                onClick={() => handleApproveBooking(notification.booking._id || notification.booking.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              
                              <button
                                onClick={() => handleRejectBooking(notification.booking._id || notification.booking.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setShowNotifications(false);
                                  window.location.href = `/bookings/${notification.booking._id || notification.booking.id}`;
                                }}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                              >
                                <User className="w-3 h-3" />
                                <span>View Details</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    window.location.href = '/my-bookings';
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View all bookings →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;