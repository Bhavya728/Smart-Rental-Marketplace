import React from 'react';
import { Check, Clock, AlertCircle, Calendar, CreditCard, Home, Star } from 'lucide-react';

const BookingTimeline = ({ 
  booking, 
  currentStep = 'confirmed',
  showEstimatedDates = true,
  className = ""
}) => {
  const getTimelineSteps = () => {
    const steps = [
      {
        id: 'created',
        title: 'Request Submitted',
        description: 'Your booking request has been submitted',
        icon: Calendar,
        status: 'completed',
        date: booking.created_at
      },
      {
        id: 'approval',
        title: 'Owner Review',
        description: 'Waiting for owner to review your request',
        icon: Clock,
        status: booking.status === 'pending_approval' ? 'pending' :
               ['approved', 'confirmed', 'active', 'completed'].includes(booking.status) ? 'completed' :
               booking.status === 'rejected' ? 'cancelled' : 'pending',
        date: booking.approved_at || booking.rejected_at
      },
      {
        id: 'payment',
        title: 'Payment Processing',
        description: 'Complete your payment to confirm booking',
        icon: CreditCard,
        status: booking.status === 'approved' && !booking.transaction_id ? 'pending' :
               booking.transaction_id ? 'completed' : 'upcoming',
        date: booking.transaction_id?.created_at
      },
      {
        id: 'confirmed',
        title: 'Booking Confirmed',
        description: 'Payment processed and booking confirmed',
        icon: Check,
        status: ['confirmed', 'active', 'completed'].includes(booking.status) ? 'completed' : 
               booking.status === 'approved' ? 'pending' : 'upcoming',
        date: booking.confirmed_at
      },
      {
        id: 'checkin',
        title: 'Check-in',
        description: 'Start of your stay',
        icon: Home,
        status: booking.status === 'active' || booking.status === 'completed' ? 'completed' :
               new Date() >= new Date(booking.start_date) ? 'active' : 'upcoming',
        date: booking.start_date,
        isCheckpoint: true
      },
      {
        id: 'checkout',
        title: 'Check-out',
        description: 'End of your stay',
        icon: Home,
        status: booking.status === 'completed' ? 'completed' :
               new Date() > new Date(booking.end_date) ? 'active' : 'upcoming',
        date: booking.end_date,
        isCheckpoint: true
      },
      {
        id: 'completed',
        title: 'Stay Completed',
        description: 'Leave a review of your experience',
        icon: Star,
        status: booking.status === 'completed' ? 'completed' : 'upcoming',
        date: booking.completed_at
      }
    ];

    // Filter out cancelled steps if booking is cancelled
    if (booking.status === 'cancelled') {
      return steps.slice(0, steps.findIndex(step => step.status === 'cancelled') + 1);
    }

    return steps;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatEstimatedDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStepIcon = (step) => {
    const IconComponent = step.icon;
    const baseClasses = "w-6 h-6 transition-all duration-300";
    
    switch (step.status) {
      case 'completed':
        return <IconComponent className={`${baseClasses} text-green-600`} />;
      case 'active':
        return <IconComponent className={`${baseClasses} text-blue-600 animate-pulse`} />;
      case 'pending':
        return <Clock className={`${baseClasses} text-yellow-600`} />;
      case 'cancelled':
        return <AlertCircle className={`${baseClasses} text-red-600`} />;
      default:
        return <IconComponent className={`${baseClasses} text-gray-400`} />;
    }
  };

  const getStepClasses = (step, index, steps) => {
    const baseClasses = "timeline-step";
    let statusClasses = "";
    
    switch (step.status) {
      case 'completed':
        statusClasses = "completed";
        break;
      case 'active':
        statusClasses = "active";
        break;
      case 'pending':
        statusClasses = "pending";
        break;
      case 'cancelled':
        statusClasses = "cancelled";
        break;
      default:
        statusClasses = "upcoming";
    }

    return `${baseClasses} ${statusClasses}`;
  };

  const steps = getTimelineSteps();

  return (
    <div className={`booking-timeline ${className}`}>
      <div className="timeline-header">
        <h3 className="timeline-title">Booking Progress</h3>
        <div className="timeline-reference">
          Booking #{booking.reference_number}
        </div>
      </div>

      <div className="timeline-container">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className={getStepClasses(step, index, steps)}>
              <div className="step-connector-container">
                <div className="step-icon-container">
                  <div className="step-icon">
                    {getStepIcon(step)}
                  </div>
                </div>
                {!isLast && (
                  <div className={`step-connector ${step.status === 'completed' ? 'completed' : ''}`} />
                )}
              </div>
              
              <div className="step-content">
                <div className="step-header">
                  <h4 className="step-title">{step.title}</h4>
                  <div className="step-status">
                    {step.status === 'completed' && (
                      <span className="status-badge completed">Completed</span>
                    )}
                    {step.status === 'active' && (
                      <span className="status-badge active">In Progress</span>
                    )}
                    {step.status === 'pending' && (
                      <span className="status-badge pending">Pending</span>
                    )}
                    {step.status === 'cancelled' && (
                      <span className="status-badge cancelled">Cancelled</span>
                    )}
                    {step.status === 'upcoming' && showEstimatedDates && step.isCheckpoint && (
                      <span className="status-badge upcoming">
                        {formatEstimatedDate(step.date)}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="step-description">{step.description}</p>
                
                {step.date && step.status === 'completed' && (
                  <div className="step-timestamp">
                    {formatDate(step.date)}
                  </div>
                )}

                {/* Special content for specific steps */}
                {step.id === 'payment' && booking.transaction_id && (
                  <div className="step-details">
                    <div className="detail-item">
                      <span>Transaction ID:</span>
                      <span className="transaction-id">{booking.transaction_id._id}</span>
                    </div>
                    <div className="detail-item">
                      <span>Amount:</span>
                      <span className="amount">${booking.total_cost}</span>
                    </div>
                  </div>
                )}

                {step.id === 'approval' && booking.status === 'pending_approval' && (
                  <div className="step-details">
                    <p className="pending-message">
                      The owner typically responds within 24 hours.
                    </p>
                  </div>
                )}

                {step.id === 'approval' && booking.status === 'rejected' && (
                  <div className="step-details">
                    <p className="rejection-message">
                      Request declined: {booking.rejection_reason || 'No reason provided'}
                    </p>
                  </div>
                )}

                {step.id === 'payment' && booking.status === 'approved' && (
                  <div className="step-details">
                    <p className="approval-message">
                      Your request has been approved! Complete payment to confirm your booking.
                    </p>
                  </div>
                )}

                {step.id === 'checkin' && step.status === 'upcoming' && (
                  <div className="step-details">
                    <p className="upcoming-message">
                      Check-in instructions will be provided 24 hours before arrival.
                    </p>
                  </div>
                )}

                {step.id === 'completed' && step.status === 'completed' && !booking.review_left && (
                  <div className="step-details">
                    <button className="review-button">
                      Leave a Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .booking-timeline {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .timeline-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .timeline-reference {
          font-family: monospace;
          font-size: 0.875rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
        }

        .timeline-container {
          position: relative;
        }

        .timeline-step {
          position: relative;
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .timeline-step:last-child {
          margin-bottom: 0;
        }

        .step-connector-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .step-icon-container {
          position: relative;
          z-index: 10;
        }

        .step-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid;
          background: white;
          transition: all 0.3s ease;
        }

        .timeline-step.completed .step-icon {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .timeline-step.active .step-icon {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .timeline-step.pending .step-icon {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .timeline-step.cancelled .step-icon {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .timeline-step.upcoming .step-icon {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .step-connector {
          position: absolute;
          top: 3rem;
          left: 50%;
          width: 2px;
          height: calc(100% + 2rem);
          background: #e5e7eb;
          transform: translateX(-50%);
          transition: background-color 0.3s ease;
        }

        .step-connector.completed {
          background: #10b981;
        }

        .step-content {
          flex: 1;
          padding-top: 0.5rem;
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.5rem;
        }

        .step-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.completed {
          background: #ecfdf5;
          color: #065f46;
        }

        .status-badge.active {
          background: #eff6ff;
          color: #1e40af;
          animation: pulse 2s infinite;
        }

        .status-badge.pending {
          background: #fffbeb;
          color: #92400e;
        }

        .status-badge.cancelled {
          background: #fef2f2;
          color: #991b1b;
        }

        .status-badge.upcoming {
          background: #f3f4f6;
          color: #374151;
        }

        .step-description {
          color: #6b7280;
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }

        .step-timestamp {
          font-size: 0.875rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .step-details {
          margin-top: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .transaction-id {
          font-family: monospace;
          color: #374151;
          font-weight: 600;
        }

        .amount {
          color: #059669;
          font-weight: 600;
        }

        .pending-message,
        .upcoming-message {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
          font-style: italic;
        }

        .review-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .review-button:hover {
          background: #2563eb;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 640px) {
          .timeline-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .step-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }

          .timeline-step {
            gap: 0.75rem;
          }

          .step-icon {
            width: 2.5rem;
            height: 2.5rem;
          }

          .step-connector {
            top: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingTimeline;