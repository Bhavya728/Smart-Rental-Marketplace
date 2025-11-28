import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, Home, Calendar, XCircle, Package } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";
import bookingService from '../services/bookingService';
import { messageService } from '../services/messageService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Alert from '../components/ui/Alert';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});

  const tabs = [
    { id: 'all', label: 'All Bookings', count: stats.totalBookings || 0 },
    { id: 'pending', label: 'Pending', count: 0 },
    { id: 'confirmed', label: 'Confirmed', count: 0 },
    { id: 'active', label: 'Active', count: stats.activeBookings || 0 },
    { id: 'completed', label: 'Completed', count: stats.completedBookings || 0 },
    { id: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  useEffect(() => {
    loadBookings();
    loadStats();
  }, [activeTab]);

  const loadBookings = async (page = 1) => {
    try {
      setLoading(true);
      const filters = {
        role: 'all', // Show both renter and owner bookings
        status: activeTab === 'all' ? 'all' : activeTab,
        page,
        limit: 10
      };

      const response = await bookingService.getUserBookings(filters);
      setBookings(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await bookingService.getBookingStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const reason = prompt('Please provide a reason for cancellation:');
      if (reason === null) return; // User clicked cancel

      await bookingService.cancelBooking(bookingId, reason);
      loadBookings(); // Reload bookings
      loadStats(); // Reload stats
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await bookingService.approveBooking(bookingId);
      loadBookings(); // Reload bookings
      loadStats(); // Reload stats
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await bookingService.rejectBooking(bookingId, reason);
      loadBookings(); // Reload bookings
      loadStats(); // Reload stats
    } catch (error) {
      alert(error.message);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingService.confirmBooking(bookingId);
      loadBookings(); // Reload bookings
      loadStats(); // Reload stats
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await bookingService.completeBooking(bookingId);
      loadBookings(); // Reload bookings
      loadStats(); // Reload stats
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMessageUser = async (booking) => {
    try {
      console.log('handleMessageUser called with booking:', booking);
      console.log('Current user:', user);
      
      const isOwner = booking.owner_id._id === user.id;
      const otherUserId = isOwner ? booking.renter_id._id : booking.owner_id._id;
      
      console.log('Is owner:', isOwner, 'Other user ID:', otherUserId);
      
      // Create or get conversation with the other user
      console.log('Creating conversation...');
      const response = await messageService.getOrCreateConversation(otherUserId, {
        bookingId: booking._id,
        listingId: booking.listing_id._id
      });
      
      console.log('Conversation response:', response);
      const conversation = response.data;
      
      // Navigate to messages with the conversation data
      console.log('Navigating to messages...');
      navigate('/messages', {
        state: {
          openConversation: conversation,
          fromBooking: true
        }
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(`Failed to start conversation: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/80 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-xl">
            <LoadingSpinner size="lg" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading your bookings...</h3>
          <p className="text-gray-600 font-medium">Please wait while we fetch your reservation details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-green-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            Your bookings
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">My Bookings</h1>
          <p className="text-xl md:text-2xl text-gray-700/90 font-medium leading-relaxed max-w-3xl mx-auto">
            Manage your reservations and rental properties
          </p>
        </div>

        {error && (
          <div className="mb-8">
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-200/60 p-2 mb-10 overflow-x-auto">
          <div className="flex space-x-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`relative px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center space-x-3 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge 
                    variant={activeTab === tab.id ? 'light' : 'secondary'} 
                    size="sm"
                    className={activeTab === tab.id ? 'bg-white/20 text-white' : ''}
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bookings-content">
          {bookings.length === 0 ? (
            <EmptyBookingsState activeTab={activeTab} />
          ) : (
            <div className="bookings-list">
              {bookings.map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  currentUser={user}
                  onCancel={handleCancelBooking}
                  onApprove={handleApproveBooking}
                  onReject={handleRejectBooking}
                  onConfirm={handleConfirmBooking}
                  onComplete={handleCompleteBooking}
                  onViewDetails={(id) => navigate(`/booking-details/${id}`)}
                  onMessageUser={handleMessageUser}
                />
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="pagination">
              {[...Array(pagination.pages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`page-button ${pagination.page === index + 1 ? 'active' : ''}`}
                  onClick={() => loadBookings(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .my-bookings {
          min-height: 100vh;
          background-color: #f9fafb;
          padding: 2rem 0;
        }

        .bookings-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .bookings-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .bookings-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .bookings-header p {
          color: #6b7280;
          font-size: 1.125rem;
        }

        .bookings-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .tab.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .bookings-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }

        .bookings-loading p {
          margin-top: 1rem;
          color: #6b7280;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .page-button {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-button:hover {
          background: #f9fafb;
        }

        .page-button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        @media (max-width: 768px) {
          .bookings-header h1 {
            font-size: 2rem;
          }

          .bookings-tabs {
            justify-content: flex-start;
          }

          .tab {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

// BookingCard Component
const BookingCard = ({ booking, currentUser, onCancel, onApprove, onReject, onConfirm, onComplete, onViewDetails, onMessageUser }) => {
  const isOwner = booking.owner_id._id === currentUser.id;
  const isRenter = booking.renter_id._id === currentUser.id;

  const getStatusColor = (status) => {
    const colors = {
      pending_approval: 'yellow',
      approved: 'blue',
      rejected: 'red', 
      confirmed: 'green', 
      active: 'green',
      completed: 'gray',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending_approval: 'Awaiting Approval',
      approved: 'Approved - Pending Payment',
      rejected: 'Request Declined',
      confirmed: 'Confirmed',
      active: 'Active Stay',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canCancel = ['pending_approval', 'approved', 'confirmed'].includes(booking.status);
  const canApprove = booking.status === 'pending_approval' && isOwner;
  const canReject = booking.status === 'pending_approval' && isOwner;
  const canComplete = booking.status === 'active' && isOwner;

  return (
    <Card className="booking-card">
      <div className="booking-card-content">
        <div className="booking-image">
          <img
            src={booking.listing_id?.images?.[0] || '/placeholder-image.jpg'}
            alt={booking.listing_id?.title}
          />
        </div>

        <div className="booking-details">
          <div className="booking-header">
            <h3>{booking.listing_id?.title}</h3>
            <Badge color={getStatusColor(booking.status)}>
              {getStatusText(booking.status)}
            </Badge>
          </div>

          <p className="booking-location">
            {booking.listing_id?.city}, {booking.listing_id?.state}
          </p>

          <div className="booking-info">
            <div className="info-item">
              <span className="label">Check-in:</span>
              <span className="value">{formatDate(booking.start_date)}</span>
            </div>
            <div className="info-item">
              <span className="label">Check-out:</span>
              <span className="value">{formatDate(booking.end_date)}</span>
            </div>
            <div className="info-item">
              <span className="label">Guests:</span>
              <span className="value">{booking.guest_count}</span>
            </div>
            <div className="info-item">
              <span className="label">Total:</span>
              <span className="value price">${booking.total_cost}</span>
            </div>
          </div>

          <div className="booking-parties">
            {isRenter && (
              <div className="party-info">
                <span className="party-label">Host:</span>
                <span>{booking.owner_id.first_name} {booking.owner_id.last_name}</span>
              </div>
            )}
            {isOwner && (
              <div className="party-info">
                <span className="party-label">Guest:</span>
                <span>{booking.renter_id.first_name} {booking.renter_id.last_name}</span>
              </div>
            )}
            <div className="party-info">
              <span className="party-label">Reference:</span>
              <span className="reference">{booking.reference_number}</span>
            </div>
          </div>
        </div>

        <div className="booking-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(booking._id)}
          >
            View Details
          </Button>

          {canApprove && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onApprove(booking._id)}
            >
              Approve Request
            </Button>
          )}

          {canReject && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onReject(booking._id)}
            >
              Reject Request
            </Button>
          )}

          {canComplete && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onComplete(booking._id)}
            >
              Mark Complete
            </Button>
          )}

          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(booking._id)}
            >
              Cancel Booking
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessageUser(booking)}
          >
            {isOwner ? 'Message Guest' : 'Message Host'}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .booking-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.2s ease;
        }

        .booking-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .booking-card-content {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          gap: 1.5rem;
          align-items: start;
        }

        .booking-image {
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .booking-image img {
          width: 100%;
          height: 80px;
          object-fit: cover;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.5rem;
        }

        .booking-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .booking-location {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .booking-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .label {
          color: #6b7280;
        }

        .value {
          font-weight: 600;
          color: #111827;
        }

        .value.price {
          color: #059669;
        }

        .booking-parties {
          margin-bottom: 1rem;
        }

        .party-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .party-label {
          color: #6b7280;
        }

        .reference {
          font-family: monospace;
          font-weight: 600;
        }

        .booking-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 120px;
        }

        @media (max-width: 768px) {
          .booking-card-content {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .booking-image {
            order: -1;
          }

          .booking-image img {
            height: 150px;
          }

          .booking-actions {
            flex-direction: row;
            flex-wrap: wrap;
            min-width: auto;
          }

          .booking-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Card>
  );
};

// EmptyBookingsState Component
const EmptyBookingsState = ({ activeTab }) => {
  const navigate = useNavigate();

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'pending':
        return {
          icon: Clock,
          title: 'No pending bookings',
          description: 'You don\'t have any bookings waiting for confirmation.',
          action: { text: 'Browse listings', onClick: () => navigate('/search') }
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          title: 'No confirmed bookings',
          description: 'You don\'t have any confirmed bookings at the moment.',
          action: { text: 'Browse listings', onClick: () => navigate('/search') }
        };
      case 'active':
        return {
          icon: Home,
          title: 'No active bookings',
          description: 'You don\'t have any ongoing stays or rentals.',
          action: { text: 'Browse listings', onClick: () => navigate('/search') }
        };
      case 'completed':
        return {
          icon: CheckCircle,
          title: 'No completed bookings',
          description: 'You haven\'t completed any stays yet.',
          action: { text: 'Browse listings', onClick: () => navigate('/search') }
        };
      case 'cancelled':
        return {
          icon: XCircle,
          title: 'No cancelled bookings',
          description: 'You don\'t have any cancelled bookings.',
          action: null
        };
      default:
        return {
          icon: Calendar,
          title: 'No bookings yet',
          description: 'Start exploring amazing places to stay and create your first booking.',
          action: { text: 'Browse listings', onClick: () => navigate('/search') }
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <EmptyState
      icon={content.icon}
      title={content.title}
      description={content.description}
      action={content.action?.onClick || content.action}
      actionLabel={content.action?.text}
    />
  );
};

export default MyBookings;
