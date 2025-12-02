import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Get booking data from navigation state
    const { booking: bookingData, transaction: transactionData } = location.state || {};
    
    if (!bookingData || !transactionData) {
      navigate('/my-bookings');
      return;
    }

    setBooking(bookingData);
    setTransaction(transactionData);
    setShowConfetti(true);

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000);
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'green',
      pending: 'yellow',
      active: 'blue',
      completed: 'gray',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  if (!booking || !transaction) {
    return (
      <div className="confirmation-loading">
        <div className="spinner"></div>
        <p>Loading confirmation details...</p>
      </div>
    );
  }

  return (
    <div className="booking-confirmation">
      {showConfetti && <ConfettiAnimation />}
      
      <div className="confirmation-container">
        <div className="confirmation-header">
          <div className="success-icon">
            <svg className="checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1>Booking Confirmed!</h1>
          <p className="confirmation-message">
            Your reservation is confirmed. You'll receive a confirmation email shortly.
          </p>
          
          <div className="booking-reference">
            <span className="reference-label">Booking Reference</span>
            <span className="reference-number">{booking.reference_number}</span>
          </div>
        </div>

        <div className="confirmation-content">
          <div className="main-content">
            <Card className="booking-details-card">
              <div className="card-header">
                <h2>Booking Details</h2>
                <Badge color={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>

              <div className="property-info">
                <img
                  src={booking.listing_id?.images?.[0]?.secureUrl || booking.listing_id?.images?.[0]?.url || '/placeholder-image.jpg'}
                  alt={booking.listing_id?.title}
                  className="property-image"
                />
                <div className="property-details">
                  <h3>{booking.listing_id?.title}</h3>
                  <p className="property-address">
                    {booking.listing_id?.address}, {booking.listing_id?.city}, {booking.listing_id?.state}
                  </p>
                  <div className="host-info">
                    <span>Host: {booking.owner_id?.first_name} {booking.owner_id?.last_name}</span>
                  </div>
                </div>
              </div>

              <div className="trip-details">
                <div className="detail-row">
                  <span className="label">Check-in</span>
                  <span className="value">{formatDate(booking.start_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Check-out</span>
                  <span className="value">{formatDate(booking.end_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Duration</span>
                  <span className="value">{booking.duration_days} night{booking.duration_days !== 1 ? 's' : ''}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Guests</span>
                  <span className="value">{booking.guest_count} guest{booking.guest_count !== 1 ? 's' : ''}</span>
                </div>
                {booking.special_requests && (
                  <div className="detail-row">
                    <span className="label">Special Requests</span>
                    <span className="value">{booking.special_requests}</span>
                  </div>
                )}
              </div>

              <div className="payment-summary">
                <h3>Payment Summary</h3>
                <div className="payment-details">
                  <div className="payment-row">
                    <span>${booking.listing_id?.price} × {booking.duration_days} night{booking.duration_days !== 1 ? 's' : ''}</span>
                    <span>${booking.base_price}</span>
                  </div>
                  {booking.cleaning_fee > 0 && (
                    <div className="payment-row">
                      <span>Cleaning fee</span>
                      <span>${booking.cleaning_fee}</span>
                    </div>
                  )}
                  <div className="payment-row">
                    <span>Service fee</span>
                    <span>${booking.service_fee}</span>
                  </div>
                  <div className="payment-row">
                    <span>Taxes</span>
                    <span>${booking.tax_amount}</span>
                  </div>
                  <div className="payment-total">
                    <span>Total Paid</span>
                    <span>${booking.total_cost}</span>
                  </div>
                </div>
              </div>

              <Alert type="info" className="cancellation-policy">
                <strong>Cancellation Policy:</strong> Free cancellation up to 24 hours before check-in. 
                After that, you may receive a partial refund based on our cancellation policy.
              </Alert>
            </Card>

            <div className="action-buttons">
              <Button
                variant="outline"
                onClick={() => navigate('/my-bookings')}
                className="view-bookings-btn"
              >
                View All Bookings
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="print-btn"
              >
                Print Confirmation
              </Button>
              
              <Button
                onClick={() => navigate('/messages')}
                className="contact-host-btn"
              >
                Contact Host
              </Button>
            </div>
          </div>

          <div className="sidebar-content">
            <Card className="next-steps-card">
              <h3>What's Next?</h3>
              <div className="next-steps">
                <div className="step">
                  <div className="step-icon">📧</div>
                  <div className="step-content">
                    <h4>Check Your Email</h4>
                    <p>We've sent confirmation details to {user?.email}</p>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-icon">💬</div>
                  <div className="step-content">
                    <h4>Contact Your Host</h4>
                    <p>Coordinate check-in details with {booking.owner_id?.first_name}</p>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-icon">🗺️</div>
                  <div className="step-content">
                    <h4>Plan Your Trip</h4>
                    <p>Explore local attractions and amenities</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="support-card">
              <h3>Need Help?</h3>
              <p>Our support team is here to assist you.</p>
              <Button variant="outline" size="sm" className="support-btn">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .booking-confirmation {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 0;
          position: relative;
        }

        .confirmation-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .confirmation-header {
          text-align: center;
          color: white;
          margin-bottom: 3rem;
        }

        .success-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .checkmark {
          width: 2rem;
          height: 2rem;
          stroke-width: 3;
        }

        .confirmation-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .confirmation-message {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .booking-reference {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
        }

        .reference-label {
          font-size: 0.875rem;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .reference-number {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .confirmation-content {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
        }

        .main-content {
          space-y: 2rem;
        }

        .booking-details-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .card-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .property-info {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .property-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .property-details h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .property-address {
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .host-info {
          font-size: 0.875rem;
          color: #374151;
        }

        .trip-details {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .detail-row .label {
          color: #6b7280;
        }

        .detail-row .value {
          font-weight: 600;
          color: #111827;
        }

        .payment-summary h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
        }

        .payment-total {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          font-weight: 700;
          font-size: 1rem;
          color: #111827;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .next-steps-card, .support-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .next-steps-card h3, .support-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }

        .step {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .step:last-child {
          margin-bottom: 0;
        }

        .step-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .step-content h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .step-content p {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .support-card p {
          color: #6b7280;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .confirmation-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: white;
        }

        .spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .confirmation-content {
            grid-template-columns: 1fr;
          }

          .sidebar-content {
            order: -1;
          }

          .action-buttons {
            flex-direction: column;
          }

          .confirmation-header h1 {
            font-size: 2rem;
          }
        }

        @media print {
          .action-buttons, .sidebar-content {
            display: none;
          }
          
          .booking-confirmation {
            background: white;
            padding: 0;
          }
          
          .confirmation-header {
            color: black;
          }
        }
      `}</style>
    </div>
  );
};

// Confetti Animation Component
const ConfettiAnimation = () => {
  return (
    <div className="confetti-container">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}

      <style jsx>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 2px;
          animation: confetti-fall linear forwards;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingConfirmation;