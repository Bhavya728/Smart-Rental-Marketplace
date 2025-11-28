import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import bookingService from '../../services/bookingService';

const ApprovalStep = ({ booking, onApprovalStatusChange }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const refreshBookingStatus = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const updatedBooking = await bookingService.getBookingById(booking._id);
      onApprovalStatusChange(updatedBooking);
    } catch (error) {
      setError('Failed to refresh booking status');
      console.error('Error refreshing booking:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusDisplay = () => {
    switch (booking.status) {
      case 'pending_approval':
        return {
          icon: <Clock size={48} className="text-yellow-500" />,
          title: 'Awaiting Owner Approval',
          message: 'Your booking request has been sent to the property owner. They typically respond within 24 hours.',
          color: 'yellow'
        };
      case 'approved':
        return {
          icon: <CheckCircle size={48} className="text-green-500" />,
          title: 'Request Approved!',
          message: 'Great news! The owner has approved your booking request. You can now proceed with payment.',
          color: 'green'
        };
      case 'rejected':
        return {
          icon: <XCircle size={48} className="text-red-500" />,
          title: 'Request Declined',
          message: booking.rejection_reason || 'The owner has declined your booking request. You can try booking different dates.',
          color: 'red'
        };
      default:
        return {
          icon: <Clock size={48} className="text-gray-500" />,
          title: 'Processing Request',
          message: 'Processing your booking request...',
          color: 'gray'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="approval-step">
      <Card className="approval-card">
        <div className="approval-content">
          <div className="status-icon">
            {statusDisplay.icon}
          </div>
          
          <h2>{statusDisplay.title}</h2>
          <p className="status-message">{statusDisplay.message}</p>
          
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-item">
              <span>Property:</span>
              <span>{booking.listing_id?.title}</span>
            </div>
            <div className="summary-item">
              <span>Check-in:</span>
              <span>{new Date(booking.start_date).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span>Check-out:</span>
              <span>{new Date(booking.end_date).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span>Total Cost:</span>
              <span>${booking.total_cost}</span>
            </div>
            <div className="summary-item">
              <span>Reference:</span>
              <span className="reference">{booking.reference_number}</span>
            </div>
          </div>

          {booking.status === 'pending_approval' && (
            <div className="approval-actions">
              <Button
                variant="outline"
                onClick={refreshBookingStatus}
                loading={refreshing}
                icon={<RefreshCw size={16} />}
              >
                Check Status
              </Button>
            </div>
          )}

          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </div>
      </Card>

      <style jsx>{`
        .approval-step {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .approval-card {
          text-align: center;
          padding: 3rem 2rem;
        }

        .approval-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
        }

        .status-icon {
          margin-bottom: 1rem;
        }

        .approval-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .status-message {
          color: #6b7280;
          font-size: 1rem;
          line-height: 1.5;
          max-width: 400px;
          margin: 0;
        }

        .booking-summary {
          width: 100%;
          max-width: 400px;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          background: #f9fafb;
          text-align: left;
        }

        .booking-summary h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
          text-align: center;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item span:first-child {
          color: #6b7280;
          font-weight: 500;
        }

        .summary-item span:last-child {
          color: #111827;
          font-weight: 600;
        }

        .reference {
          font-family: monospace;
          background: #e5e7eb;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .approval-actions {
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .approval-card {
            padding: 2rem 1rem;
          }

          .approval-content h2 {
            font-size: 1.25rem;
          }

          .booking-summary {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ApprovalStep;