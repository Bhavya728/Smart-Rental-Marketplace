import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Calendar, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';

const RenterNotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && (user.role === 'renter' || user.role === 'both')) {
      loadRenterNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(loadRenterNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadRenterNotifications = async () => {
    try {
      setLoading(true);
      console.log('Loading renter notifications...');
      
      // Get recent bookings for renter
      const response = await bookingService.getUserBookings({ 
        role: 'renter',
        limit: 20
      });
      
      console.log('Renter bookings API Response:', response);
      
      if (response && response.success) {
        const recentBookings = response.data || [];
        console.log('Recent bookings for renter:', recentBookings);
        console.log('Processing', recentBookings.length, 'bookings for notifications');
        
        // Create notifications for different booking statuses
        const notificationData = [];
        
        recentBookings.forEach((booking, index) => {
          console.log(`Processing booking ${index + 1}:`, {
            id: booking._id || booking.id,
            status: booking.status,
            title: booking.listing_id?.title,
            updatedAt: booking.updatedAt,
            hoursSinceUpdate: ((new Date() - new Date(booking.updatedAt)) / (1000 * 60 * 60)).toFixed(1)
          });
          
          const createdAt = new Date(booking.createdAt);
          const updatedAt = new Date(booking.updatedAt);
          const now = new Date();
          const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
          const hoursSinceUpdated = (now - updatedAt) / (1000 * 60 * 60);
          
          // Filter out completed, cancelled, and rejected bookings - they shouldn't appear in notifications
          // Note: Rejected bookings are automatically removed from database, so they won't appear in API response
          if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
            console.log(`Skipping ${booking.status} booking:`, booking._id);
            return; // Skip these statuses entirely
          }
          
          // Only show recent notifications (within last 168 hours = 7 days for status updates)
          if (hoursSinceUpdated <= 168) {
            if (booking.status === 'approved') {
              console.log(`Creating approval notification for booking ${booking._id}:`, {
                title: booking.listing_id?.title,
                hoursSinceUpdate: hoursSinceUpdated.toFixed(1),
                hasListingId: !!booking.listing_id,
                listingIdFormat: booking.listing_id?._id || booking.listing_id?.id
              });
              
              notificationData.push({
                id: `approval_${booking._id || booking.id}`,
                type: 'booking_approved',
                title: 'Booking Approved! 🎉',
                message: `Your booking for "${booking.listing_id?.title || 'listing'}" has been approved by the owner`,
                timestamp: booking.updatedAt,
                booking: booking,
                unread: true,
                priority: 'high'
              });
            } 
            // Note: Rejected bookings are automatically deleted from the system,
            // so rejection notifications are not needed as the booking no longer exists
          }
          
          // Show confirmed bookings for 48 hours after confirmation, but only if payment is pending
          if (booking.status === 'confirmed' && hoursSinceUpdated <= 48) {
            notificationData.push({
              id: `confirmed_${booking._id || booking.id}`,
              type: 'booking_confirmed',
              title: 'Booking Confirmed! ✅',
              message: `Your booking for "${booking.listing_id?.title || 'listing'}" is confirmed and ready`,
              timestamp: booking.updatedAt,
              booking: booking,
              unread: true,
              priority: 'high'
            });
          }
          
          // Don't show notifications for cancelled, completed, or very old bookings
        });
        
        // Sort by timestamp (most recent first)
        notificationData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log(`Final notifications created: ${notificationData.length}`);
        notificationData.forEach((notification, index) => {
          console.log(`Notification ${index + 1}:`, {
            type: notification.type,
            title: notification.title,
            bookingStatus: notification.booking?.status,
            hasPaymentButton: notification.booking?.status === 'approved'
          });
        });
        
        setNotifications(notificationData);
      } else {
        console.log('No bookings found or invalid response format');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load renter notifications:', error);
      console.error('Error details:', error.response?.data || error.message);
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
    );
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_approved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'booking_confirmed':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'booking_rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_approved':
        return 'bg-green-100';
      case 'booking_confirmed':
        return 'bg-blue-100';
      case 'booking_rejected':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (!user || (user.role !== 'renter' && user.role !== 'both')) {
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
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
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
                  <p>No recent notifications</p>
                  <p className="text-sm">We'll notify you about booking updates</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        notification.unread ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.timestamp)}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          {notification.booking && (
                            <div className="mt-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-4 mb-2">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(notification.booking.start_date).toLocaleDateString()} - 
                                  {new Date(notification.booking.end_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  💰 ${notification.booking.total_cost}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  notification.booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  notification.booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                  notification.booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {notification.booking.status}
                                </span>
                              </div>
                              
                              {/* Action buttons based on booking status */}
                              {notification.booking.status === 'approved' && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowNotifications(false);
                                      navigate(`/my-bookings`);
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    <Calendar className="w-3 h-3" />
                                    <span>View Details</span>
                                  </button>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowNotifications(false);
                                      const listingId = notification.booking.listing_id?.id || notification.booking.listing_id?._id;
                                      const bookingId = notification.booking._id || notification.booking.id;
                                      console.log(`Navigating to payment for booking ${bookingId}, listing ${listingId}`);
                                      if (listingId && bookingId) {
                                        navigate(`/listings/${listingId}/book?bookingId=${bookingId}`);
                                      } else {
                                        console.error('Missing listing ID or booking ID for payment navigation');
                                        alert('Unable to proceed to payment. Missing booking information.');
                                      }
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Complete Payment</span>
                                  </button>
                                </div>
                              )}
                              
                              {notification.booking.status === 'confirmed' && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowNotifications(false);
                                      navigate(`/my-bookings`);
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                                  >
                                    <Calendar className="w-3 h-3" />
                                    <span>View Booking</span>
                                  </button>
                                </div>
                              )}
                              
                              {notification.booking.status === 'rejected' && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowNotifications(false);
                                      navigate(`/listings/${notification.booking.listing_id._id || notification.booking.listing_id.id}`);
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors"
                                  >
                                    <Calendar className="w-3 h-3" />
                                    <span>Book Again</span>
                                  </button>
                                </div>
                              )}
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
                    navigate('/my-bookings');
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

export default RenterNotificationCenter;