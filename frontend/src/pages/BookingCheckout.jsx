import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import listingService from '../services/listingService';
import Stepper from '../components/ui/Stepper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MockPayment from '../components/booking/MockPayment';

const BookingCheckout = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Debug URL and params
  console.log('=== BookingCheckout Debug ===');
  console.log('Current URL:', window.location.href);
  console.log('Location pathname:', location.pathname);
  console.log('useParams result:', useParams());
  console.log('listingId from params:', listingId);
  console.log('==========================')

  const [currentStep, setCurrentStep] = useState(1);
  const [listing, setListing] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [booking, setBooking] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    special_requests: '',
    payment_method: 'mock_card',
    card_details: {
      card_number: '',
      cardholder_name: '',
      expiry_month: '',
      expiry_year: '',
      cvv: ''
    },
    billing_address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US'
    }
  });

  const steps = [
    {
      title: 'Review & Book',
      description: 'Confirm your booking details'
    },
    {
      title: 'Payment',
      description: 'Secure payment processing'
    },
    {
      title: 'Confirmation',
      description: 'Booking confirmed'
    }
  ];

  useEffect(() => {
    
    // Check if listingId is valid
    if (!listingId || listingId === 'undefined') {
      console.error('No valid listingId found in URL parameters. Got:', listingId);
      setError('Invalid listing ID. Please start from a listing page.');
      setLoading(false);
      // Redirect to search page
      navigate('/search');
      return;
    }
    
    // Get booking data from navigation state
    const { bookingData: bookingInfo, costBreakdown: passedCostBreakdown } = location.state || {};
    if (!bookingInfo) {
      console.log('No booking data found in navigation state');
      console.log('This usually happens when accessing URL directly or after refresh');
      console.log('Redirecting to listing page to start booking flow properly');
      if (listingId && listingId !== 'undefined') {
        navigate(`/listings/${listingId}`);
      } else {
        navigate('/search');
      }
      return;
    }

    setBookingData(bookingInfo);
    // Store the cost breakdown for display purposes
    if (passedCostBreakdown) {
      console.log('Using passed cost breakdown:', passedCostBreakdown);
    }
    loadListing();
  }, [listingId, location.state, navigate]);

  const loadListing = async () => {
    try {
      setLoading(true);
      
      if (!listingId) {
        throw new Error('No listing ID provided');
      }
      
      console.log('Loading listing with ID:', listingId);
      const response = await listingService.getListingById(listingId);
      console.log('Listing loaded successfully:', response.data);
      setListing(response.data);
    } catch (error) {
      setError('Failed to load listing details');
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    console.log('🔄 handleCreateBooking called');
    try {
      setSubmitting(true);
      setError(null);

      if (!bookingData) {
        throw new Error('No booking data available');
      }

      console.log('🔍 Raw bookingData from state:', bookingData);
      console.log('🔍 bookingData.listing_id:', bookingData.listing_id);
      console.log('🔍 listingId from params:', listingId);

      // Clean booking data to only send required fields
      const bookingPayload = {
        listing_id: bookingData.listing_id || listingId,
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        guest_count: bookingData.guest_count,
        special_requests: formData.special_requests
      };

      console.log('=== Booking Payload Debug ===');
      console.log('bookingPayload:', bookingPayload);
      console.log('bookingData:', bookingData);
      console.log('user:', user);
      console.log('auth token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');
      console.log('===========================');

      console.log('🚀 About to call bookingService.createBooking...');
      const response = await bookingService.createBooking(bookingPayload);
      console.log('✅ Booking creation successful:', response);
      setBooking(response.data);
      setCurrentStep(2);
    } catch (error) {
      console.error('Booking creation error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Full error object:', error.response);
      console.error('Error message:', error.message);
      console.error('Error cause:', error.cause);
      
      // Try to extract the actual error from the nested error
      let actualError = error;
      if (error.cause && typeof error.cause === 'object') {
        actualError = error.cause;
      }
      
      // Show detailed validation errors
      if (actualError.response?.data?.errors) {
        console.error('Validation errors:', actualError.response.data.errors);
        const errorMessages = actualError.response.data.errors.map(err => err.msg || err.message).join(', ');
        setError(`Validation failed: ${errorMessages}`);
      } else if (actualError.response?.data?.message) {
        setError(actualError.response.data.message);
      } else {
        setError(actualError.message || error.message || 'Booking creation failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (paymentData) => {
    try {
      setSubmitting(true);
      setError(null);

      console.log('💳 Processing payment for booking:', booking._id);
      console.log('💳 Payment data:', paymentData);
      
      // For the demo, let's simulate a successful payment without creating a separate payment record
      console.log('💳 Processing mock payment...');
      
      // Simulate payment processing
      const mockTransaction = {
        _id: `pay_${booking._id}`,
        booking_id: booking._id,
        amount: booking.total_cost,
        status: 'completed',
        payment_method: paymentData.payment_method,
        reference_number: `PAY${booking._id.slice(-8).toUpperCase()}`,
        created_at: new Date(),
        processed_at: new Date()
      };
      
      setTransaction(mockTransaction);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Since we're using mock payment, always consider it successful
      setCurrentStep(3);
      
      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        navigate(`/booking-confirmation/${booking._id}`, {
          state: { 
            booking: booking,
            transaction: mockTransaction 
          }
        });
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <LoadingSpinner size="lg" />
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (!listing || !bookingData) {
    return (
      <div className="checkout-error">
        <Alert type="error">
          Unable to load booking information. Please try again.
        </Alert>
      </div>
    );
  }

  return (
    <div className="booking-checkout">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Complete your booking</h1>
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="checkout-content">
          <div className="checkout-main">
            {currentStep === 1 && (
              <BookingReview
                listing={listing}
                bookingData={bookingData}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateBooking}
                submitting={submitting}
              />
            )}

            {currentStep === 2 && (
              <PaymentStep
                booking={booking}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handlePayment}
                onError={(errorMessage) => setError(errorMessage)}
                submitting={submitting}
              />
            )}

            {currentStep === 3 && (
              <BookingSuccess
                booking={booking}
                transaction={transaction}
              />
            )}
          </div>

          <div className="checkout-sidebar">
            <BookingSummary
              listing={listing}
              bookingData={bookingData}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .booking-checkout {
          min-height: 100vh;
          background-color: #f9fafb;
          padding: 2rem 0;
        }

        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .checkout-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .checkout-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2rem;
        }

        .checkout-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          align-items: start;
        }

        .checkout-main {
          background: white;
          border-radius: 0.75rem;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .checkout-sidebar {
          position: sticky;
          top: 2rem;
        }

        .checkout-loading, .checkout-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }

        .checkout-loading p {
          margin-top: 1rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .checkout-content {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .checkout-sidebar {
            position: static;
            order: -1;
          }

          .checkout-main {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// BookingReview Component
const BookingReview = ({ listing, bookingData, formData, setFormData, onSubmit, submitting }) => {
  const costBreakdown = bookingService.calculateBookingCost(
    listing,
    new Date(bookingData.start_date),
    new Date(bookingData.end_date),
    bookingData.guest_count
  );

  return (
    <div className="booking-review">
      <h2>Review your booking</h2>

      <div className="booking-details">
        <div className="detail-section">
          <h3>Your trip</h3>
          <div className="detail-item">
            <span className="label">Dates</span>
            <span className="value">
              {new Date(bookingData.start_date).toLocaleDateString()} - {new Date(bookingData.end_date).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Guests</span>
            <span className="value">{bookingData.guest_count} guest{bookingData.guest_count !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Special requests</h3>
          <textarea
            className="special-requests"
            placeholder="Any special requests or notes for the host?"
            value={formData.special_requests}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              special_requests: e.target.value
            }))}
            rows={3}
          />
        </div>

        <div className="detail-section">
          <h3>Cancellation policy</h3>
          <p className="policy-text">
            Free cancellation for 48 hours after booking. After that, cancel up to 7 days before check-in and get a 50% refund, minus service fees.
          </p>
        </div>
      </div>

      <Button
        onClick={() => {
          console.log('🖱️ Confirm and pay button clicked!');
          onSubmit();
        }}
        loading={submitting}
        size="lg"
        className="confirm-button"
      >
        Confirm and pay
      </Button>

      <style jsx>{`
        .booking-review h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2rem;
        }

        .detail-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .detail-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .label {
          color: #6b7280;
        }

        .value {
          font-weight: 600;
          color: #111827;
        }

        .special-requests {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          resize: vertical;
        }

        .special-requests:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .policy-text {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .confirm-button {
          width: 100%;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

// PaymentStep Component
const PaymentStep = ({ booking, formData, setFormData, onSubmit, submitting, onError }) => {
  return (
    <div className="payment-step">
      <h2>Payment information</h2>
      <MockPayment
        amount={booking.total_cost}
        onPaymentSuccess={onSubmit}
        onPaymentError={onError}
        isProcessing={submitting}
      />
    </div>
  );
};

// BookingSuccess Component
const BookingSuccess = ({ booking, transaction }) => {
  return (
    <div className="booking-success">
      <div className="success-icon">
        🎉
      </div>
      <h2>Booking confirmed!</h2>
      <p>Your booking has been successfully created and payment processed.</p>
      
      <div className="booking-info">
        <div className="info-item">
          <span className="label">Booking Reference:</span>
          <span className="value">{booking.reference_number}</span>
        </div>
        <div className="info-item">
          <span className="label">Transaction ID:</span>
          <span className="value">{transaction?.reference_number}</span>
        </div>
      </div>

      <style jsx>{`
        .booking-success {
          text-align: center;
          padding: 2rem;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .booking-success h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #059669;
          margin-bottom: 1rem;
        }

        .booking-success p {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .booking-info {
          background: #f9fafb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          text-align: left;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .label {
          color: #6b7280;
        }

        .value {
          font-weight: 600;
          color: #111827;
        }
      `}</style>
    </div>
  );
};

// BookingSummary Component
const BookingSummary = ({ listing, bookingData }) => {
  const costBreakdown = bookingService.calculateBookingCost(
    listing,
    new Date(bookingData.start_date),
    new Date(bookingData.end_date),
    bookingData.guest_count
  );

  return (
    <Card className="booking-summary">
      <div className="summary-header">
        <img
          src={listing.images?.[0] || '/placeholder-image.jpg'}
          alt={listing.title}
          className="listing-image"
        />
        <div className="listing-info">
          <h3>{listing.title}</h3>
          <p>{listing.city}, {listing.state}</p>
          {listing.rating && (
            <div className="rating">
              ⭐ {listing.rating} ({listing.review_count || 0} reviews)
            </div>
          )}
        </div>
      </div>

      <div className="summary-details">
        <div className="detail-item">
          <span>Check-in</span>
          <span>{new Date(bookingData.start_date).toLocaleDateString()}</span>
        </div>
        <div className="detail-item">
          <span>Check-out</span>
          <span>{new Date(bookingData.end_date).toLocaleDateString()}</span>
        </div>
        <div className="detail-item">
          <span>Guests</span>
          <span>{bookingData.guest_count}</span>
        </div>
      </div>

      <div className="price-breakdown">
        <div className="price-item">
          <span>${listing.price} × {costBreakdown.nights} night{costBreakdown.nights !== 1 ? 's' : ''}</span>
          <span>${costBreakdown.basePrice}</span>
        </div>
        {costBreakdown.cleaningFee > 0 && (
          <div className="price-item">
            <span>Cleaning fee</span>
            <span>${costBreakdown.cleaningFee}</span>
          </div>
        )}
        <div className="price-item">
          <span>Service fee</span>
          <span>${costBreakdown.serviceFee}</span>
        </div>
        <div className="price-item">
          <span>Taxes</span>
          <span>${costBreakdown.taxAmount}</span>
        </div>
        <div className="price-total">
          <span>Total (USD)</span>
          <span>${costBreakdown.totalCost}</span>
        </div>
      </div>

      <style jsx>{`
        .summary-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .listing-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .listing-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .listing-info p {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .rating {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .summary-details {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .price-breakdown {
          margin-bottom: 1rem;
        }

        .price-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #374151;
        }

        .price-total {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          font-weight: 700;
          font-size: 1rem;
          color: #111827;
        }
      `}</style>
    </Card>
  );
};

export default BookingCheckout;