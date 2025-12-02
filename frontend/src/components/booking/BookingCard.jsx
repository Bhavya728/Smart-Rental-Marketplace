import React from 'react';
import { format } from 'date-fns';
import { Calendar, Users, MapPin, Star, Clock, MessageCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const BookingCard = ({ 
  booking, 
  onViewDetails, 
  onCancel, 
  onContact,
  onLeaveReview,
  showActions = true,
  compact = false,
  className = ""
}) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

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

  const calculateNights = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const isUpcoming = () => {
    return new Date(booking.start_date) > new Date();
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    return now >= start && now <= end;
  };

  const canCancel = () => {
    return ['pending_approval', 'approved', 'confirmed'].includes(booking.status) && isUpcoming();
  };

  const canLeaveReview = () => {
    return booking.status === 'completed' && !booking.review_left;
  };

  if (compact) {
    return (
      <Card className={`booking-card-compact ${className}`}>
        <div className="compact-content">
          <div className="compact-image">
            <img
              src={booking.listing_id?.images?.[0]?.secureUrl || booking.listing_id?.images?.[0]?.url || '/placeholder-image.jpg'}
              alt={booking.listing_id?.title}
            />
            <Badge 
              color={getStatusColor(booking.status)}
              className="status-badge"
            >
              {getStatusText(booking.status)}
            </Badge>
          </div>
          
          <div className="compact-details">
            <h4 className="property-title">{booking.listing_id?.title}</h4>
            <p className="property-location">
              {booking.listing_id?.city}, {booking.listing_id?.state}
            </p>
            <div className="booking-dates">
              {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
            </div>
            <div className="booking-cost">${booking.total_cost}</div>
          </div>
          
          {showActions && (
            <div className="compact-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(booking._id)}
              >
                View
              </Button>
            </div>
          )}
        </div>

        <style jsx>{`
          .booking-card-compact {
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .booking-card-compact:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }

          .compact-content {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
          }

          .compact-image {
            position: relative;
            width: 80px;
            height: 60px;
            border-radius: 0.5rem;
            overflow: hidden;
            flex-shrink: 0;
          }

          .compact-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .status-badge {
            position: absolute;
            top: 0.25rem;
            right: 0.25rem;
            font-size: 0.625rem;
            padding: 0.125rem 0.25rem;
          }

          .compact-details {
            flex: 1;
            min-width: 0;
          }

          .property-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .property-location {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
          }

          .booking-dates {
            font-size: 0.75rem;
            color: #9ca3af;
          }

          .booking-cost {
            font-weight: 600;
            color: #059669;
            margin-top: 0.25rem;
          }

          .compact-actions {
            flex-shrink: 0;
          }
        `}</style>
      </Card>
    );
  }

  return (
    <Card className={`booking-card ${className}`}>
      <div className="card-content">
        <div className=\"booking-image\">\n          <img\n            src={booking.listing_id?.images?.[0]?.secureUrl || booking.listing_id?.images?.[0]?.url || '/placeholder-image.jpg'}\n            alt={booking.listing_id?.title}", "oldString"
          />
          <div className="image-overlay">
            <Badge color={getStatusColor(booking.status)}>
              {getStatusText(booking.status)}
            </Badge>
          </div>
        </div>

        <div className="booking-content">
          <div className="booking-header">
            <div className="property-info">
              <h3 className="property-title">{booking.listing_id?.title}</h3>
              <div className="property-location">
                <MapPin size={14} />
                <span>{booking.listing_id?.city}, {booking.listing_id?.state}</span>
              </div>
              {booking.listing_id?.rating && (
                <div className="property-rating">
                  <Star size={14} className="star-filled" />
                  <span>{booking.listing_id.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="booking-cost">
              <div className="cost-amount">${booking.total_cost}</div>
              <div className="cost-label">Total</div>
            </div>
          </div>

          <div className="booking-details">
            <div className="detail-item">
              <Calendar size={16} className="detail-icon" />
              <div className="detail-content">
                <div className="detail-label">Dates</div>
                <div className="detail-value">
                  {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                </div>
                <div className="detail-meta">
                  {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="detail-item">
              <Users size={16} className="detail-icon" />
              <div className="detail-content">
                <div className="detail-label">Guests</div>
                <div className="detail-value">{booking.guest_count}</div>
              </div>
            </div>

            <div className="detail-item">
              <Clock size={16} className="detail-icon" />
              <div className="detail-content">
                <div className="detail-label">Booking Date</div>
                <div className="detail-value">
                  {format(new Date(booking.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>

          {booking.reference_number && (
            <div className="reference-number">
              Reference: <span className="reference-code">{booking.reference_number}</span>
            </div>
          )}

          {/* Status-specific information */}
          {isActive() && (
            <div className="status-info active-status">
              <div className="status-icon">🏠</div>
              <div>
                <div className="status-title">Currently Active</div>
                <div className="status-description">Enjoy your stay!</div>
              </div>
            </div>
          )}

          {booking.status === 'pending' && (
            <div className="status-info pending-status">
              <div className="status-icon">⏳</div>
              <div>
                <div className="status-title">Awaiting Confirmation</div>
                <div className="status-description">The host will respond within 24 hours</div>
              </div>
            </div>
          )}

          {booking.status === 'completed' && !booking.review_left && (
            <div className="status-info review-status">
              <div className="status-icon">⭐</div>
              <div>
                <div className="status-title">How was your stay?</div>
                <div className="status-description">Leave a review to help other travelers</div>
              </div>
            </div>
          )}
        </div>

        {showActions && (
          <div className="booking-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(booking._id)}
              className="action-btn"
            >
              View Details
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onContact(booking)}
              className="action-btn"
            >
              <MessageCircle size={16} />
              Message Host
            </Button>

            {canLeaveReview() && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onLeaveReview(booking._id)}
                className="action-btn"
              >
                <Star size={16} />
                Leave Review
              </Button>
            )}

            {canCancel() && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancel(booking._id)}
                className="action-btn"
              >
                Cancel Booking
              </Button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .booking-card {
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .booking-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .booking-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .booking-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .booking-card:hover .booking-image img {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }

        .booking-content {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1.5rem;
        }

        .property-info {
          flex: 1;
        }

        .property-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .property-location {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .property-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
        }

        .star-filled {
          color: #fbbf24;
        }

        .booking-cost {
          text-align: right;
        }

        .cost-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
        }

        .cost-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .booking-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: start;
          gap: 0.75rem;
        }

        .detail-icon {
          color: #6b7280;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.125rem;
        }

        .detail-meta {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .reference-number {
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .reference-code {
          font-family: monospace;
          font-weight: 600;
          color: #111827;
        }

        .status-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .active-status {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }

        .pending-status {
          background: #fffbeb;
          border: 1px solid #fde68a;
        }

        .review-status {
          background: #fef3c7;
          border: 1px solid #fcd34d;
        }

        .status-icon {
          font-size: 1.25rem;
        }

        .status-title {
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
        }

        .status-description {
          color: #6b7280;
          font-size: 0.75rem;
          margin-top: 0.125rem;
        }

        .booking-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .action-btn {
          flex: 1;
          min-width: fit-content;
        }

        @media (max-width: 768px) {
          .booking-header {
            flex-direction: column;
            gap: 1rem;
          }

          .booking-cost {
            text-align: left;
          }

          .booking-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }
        }
      `}</style>
    </Card>
  );
};

export default BookingCard;