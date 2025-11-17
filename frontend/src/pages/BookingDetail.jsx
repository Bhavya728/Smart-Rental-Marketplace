import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';

const BookingDetail = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookingDetail();
  }, [bookingId]);

  const loadBookingDetail = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(bookingId);
      setBooking(response.data);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error loading booking detail:', error);
      
      // If booking not found, redirect back to bookings
      if (error.status === 404) {
        setTimeout(() => navigate('/my-bookings'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      setActionLoading(true);
      await bookingService.cancelBooking(bookingId, cancellationReason);
      await loadBookingDetail(); // Reload booking data
      setShowCancelModal(false);
      setCancellationReason('');
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setActionLoading(true);
      await bookingService.confirmBooking(bookingId);
      await loadBookingDetail(); // Reload booking data
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBooking = async () => {
    try {
      setActionLoading(true);
      await bookingService.completeBooking(bookingId);
      await loadBookingDetail(); // Reload booking data
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const downloadReceipt = async () => {
    try {
      const response = await paymentService.downloadReceipt(booking.transaction_id._id);
      // Handle PDF download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${booking.reference_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to download receipt: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <Alert type="error">
            {error || 'Booking not found'}
          </Alert>
          {error?.includes('not found') && (
            <p className="mt-4 text-gray-600 font-medium">Redirecting to your bookings...</p>
          )}
        </div>
      </div>
    );
  }

  const isOwner = booking.owner_id._id === user.id;
  const isRenter = booking.renter_id._id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/10 to-indigo-400/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full -translate-x-48 -translate-y-48 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-300/20 to-indigo-300/20 rounded-full translate-x-48 translate-y-48 blur-3xl" />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <Button
              variant="ghost"
              onClick={() => navigate('/my-bookings')}
              className="mb-6 bg-white/60 border-white/30 hover:bg-white/80 hover:shadow-lg transition-all duration-300"
            >
              ← Back to Bookings
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {booking.listing_id.title}
                </h1>
                <p className="text-gray-600 bg-white/50 px-3 py-1 rounded-full inline-block font-medium">
                  📋 Booking #{booking.reference_number}
                </p>
              </div>
              <Badge color={getStatusColor(booking.status)} size="lg" className="shadow-lg">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="detail-content">
          {/* Property Information */}
          <Card className="property-card">
            <div className="property-content">
              <div className="property-images">
                <img
                  src={booking.listing_id.images?.[0] || '/placeholder-image.jpg'}
                  alt={booking.listing_id.title}
                  className="main-image"
                />
                {booking.listing_id.images?.slice(1, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${booking.listing_id.title} ${index + 2}`}
                    className="thumb-image"
                  />
                ))}
              </div>

              <div className="property-info">
                <h3>Property Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Location:</span>
                    <span>{booking.listing_id.address}, {booking.listing_id.city}, {booking.listing_id.state}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Property Type:</span>
                    <span>{booking.listing_id.property_type}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Bedrooms:</span>
                    <span>{booking.listing_id.bedrooms}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Bathrooms:</span>
                    <span>{booking.listing_id.bathrooms}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Max Guests:</span>
                    <span>{booking.listing_id.max_guests}</span>
                  </div>
                </div>

                <div className="amenities">
                  <h4>Amenities</h4>
                  <div className="amenity-list">
                    {booking.listing_id.amenities?.slice(0, 6).map((amenity, index) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                    {booking.listing_id.amenities?.length > 6 && (
                      <span className="amenity-tag">+{booking.listing_id.amenities.length - 6} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="detail-grid">
            {/* Booking Information */}
            <Card className="booking-info-card">
              <h3>Booking Information</h3>
              
              <div className="info-section">
                <h4>Stay Details</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Check-in:</span>
                    <span className="value">{formatDate(booking.start_date)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Check-out:</span>
                    <span className="value">{formatDate(booking.end_date)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Duration:</span>
                    <span className="value">{calculateNights(booking.start_date, booking.end_date)} nights</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Guests:</span>
                    <span className="value">{booking.guest_count}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Contact Information</h4>
                <div className="contact-info">
                  {isRenter && (
                    <div className="contact-person">
                      <strong>Your Host:</strong>
                      <p>{booking.owner_id.first_name} {booking.owner_id.last_name}</p>
                      <p>{booking.owner_id.email}</p>
                      {booking.owner_id.phone && <p>{booking.owner_id.phone}</p>}
                    </div>
                  )}
                  {isOwner && (
                    <div className="contact-person">
                      <strong>Your Guest:</strong>
                      <p>{booking.renter_id.first_name} {booking.renter_id.last_name}</p>
                      <p>{booking.renter_id.email}</p>
                      {booking.renter_id.phone && <p>{booking.renter_id.phone}</p>}
                    </div>
                  )}
                </div>
              </div>

              {booking.special_requests && (
                <div className="info-section">
                  <h4>Special Requests</h4>
                  <p className="special-requests">{booking.special_requests}</p>
                </div>
              )}
            </Card>

            {/* Payment Information */}
            <Card className="payment-card">
              <h3>Payment Summary</h3>
              
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Base Rate ({calculateNights(booking.start_date, booking.end_date)} nights)</span>
                  <span>${(booking.total_cost - (booking.service_fee || 0) - (booking.tax_amount || 0)).toFixed(2)}</span>
                </div>
                {booking.service_fee > 0 && (
                  <div className="cost-item">
                    <span>Service Fee</span>
                    <span>${booking.service_fee.toFixed(2)}</span>
                  </div>
                )}
                {booking.tax_amount > 0 && (
                  <div className="cost-item">
                    <span>Taxes</span>
                    <span>${booking.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="cost-item total">
                  <span>Total Cost</span>
                  <span>${booking.total_cost}</span>
                </div>
              </div>

              {booking.transaction_id && (
                <div className="payment-info">
                  <h4>Payment Details</h4>
                  <div className="info-item">
                    <span className="label">Payment Method:</span>
                    <span>{booking.transaction_id.payment_method || 'Credit Card'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Transaction ID:</span>
                    <span className="transaction-id">{booking.transaction_id._id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Payment Date:</span>
                    <span>{formatDate(booking.transaction_id.created_at)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <Badge color="green" size="sm">{booking.transaction_id.status}</Badge>
                  </div>
                </div>
              )}

              <div className="payment-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReceiptModal(true)}
                >
                  View Receipt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadReceipt}
                >
                  Download PDF
                </Button>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <Card className="actions-card">
            <h3>Manage Booking</h3>
            <div className="action-buttons">
              {booking.status === 'pending' && isOwner && (
                <Button
                  variant="primary"
                  onClick={handleConfirmBooking}
                  loading={actionLoading}
                >
                  Confirm Booking
                </Button>
              )}

              {booking.status === 'active' && isOwner && (
                <Button
                  variant="success"
                  onClick={handleCompleteBooking}
                  loading={actionLoading}
                >
                  Mark as Complete
                </Button>
              )}

              {['pending', 'confirmed'].includes(booking.status) && (
                <Button
                  variant="danger"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Booking
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate('/messages')}
              >
                {isOwner ? 'Message Guest' : 'Message Host'}
              </Button>

              {booking.status === 'completed' && isRenter && (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/review/${bookingId}`)}
                >
                  Write Review
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => navigate(`/listing/${booking.listing_id._id}`)}
              >
                View Property
              </Button>
            </div>
          </Card>
        </div>

        {/* Cancel Booking Modal */}
        {showCancelModal && (
          <Modal
            title="Cancel Booking"
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
          >
            <div className="cancel-modal">
              <p>Are you sure you want to cancel this booking?</p>
              <p className="warning">This action cannot be undone. Cancellation fees may apply.</p>
              
              <div className="cancel-form">
                <label htmlFor="reason">Reason for cancellation:</label>
                <textarea
                  id="reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  rows={4}
                  required
                />
              </div>

              <div className="modal-actions">
                <Button
                  variant="ghost"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Booking
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelBooking}
                  loading={actionLoading}
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Receipt Modal */}
        {showReceiptModal && booking.transaction_id && (
          <Modal
            title="Booking Receipt"
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
            size="lg"
          >
            <ReceiptView booking={booking} onPrint={printReceipt} />
          </Modal>
        )}
      </div>

      <style jsx>{`
        .booking-detail {
          min-height: 100vh;
          background-color: #f9fafb;
          padding: 2rem 0;
        }

        .detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .detail-header {
          margin-bottom: 2rem;
        }

        .back-button {
          margin-bottom: 1rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 1rem;
        }

        .header-info h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .reference {
          color: #6b7280;
          font-family: monospace;
          font-weight: 600;
        }

        .booking-loading,
        .booking-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }

        .booking-loading p,
        .booking-error p {
          margin-top: 1rem;
          color: #6b7280;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .property-card {
          padding: 2rem;
        }

        .property-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
        }

        .property-images {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 200px 60px;
          gap: 0.5rem;
        }

        .main-image {
          grid-column: 1 / -1;
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .thumb-image {
          width: 100%;
          height: 60px;
          object-fit: cover;
          border-radius: 0.25rem;
        }

        .property-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .info-section {
          margin-bottom: 2rem;
        }

        .info-section h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label {
          color: #6b7280;
          font-weight: 500;
        }

        .value {
          font-weight: 600;
          color: #111827;
        }

        .amenities {
          margin-top: 1.5rem;
        }

        .amenity-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .amenity-tag {
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: #374151;
        }

        .contact-person {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .contact-person strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #111827;
        }

        .contact-person p {
          margin: 0.25rem 0;
          color: #6b7280;
        }

        .special-requests {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          color: #374151;
          font-style: italic;
        }

        .cost-breakdown {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .cost-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .cost-item:last-child {
          border-bottom: none;
        }

        .cost-item.total {
          background: #f9fafb;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .payment-info {
          margin-top: 1.5rem;
        }

        .transaction-id {
          font-family: monospace;
          font-size: 0.875rem;
        }

        .payment-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .actions-card {
          padding: 2rem;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .cancel-modal .warning {
          color: #dc2626;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .cancel-form {
          margin: 1.5rem 0;
        }

        .cancel-form label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #111827;
        }

        .cancel-form textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-family: inherit;
          resize: vertical;
        }

        .cancel-form textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: start;
          }

          .property-content {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

// Receipt Component
const ReceiptView = ({ booking, onPrint }) => {
  return (
    <div className="receipt">
      <div className="receipt-header">
        <h2>Booking Receipt</h2>
        <Button variant="outline" size="sm" onClick={onPrint}>
          Print Receipt
        </Button>
      </div>

      <div className="receipt-content">
        <div className="receipt-section">
          <h3>Booking Details</h3>
          <div className="receipt-info">
            <div className="info-row">
              <span>Booking Reference:</span>
              <span>{booking.reference_number}</span>
            </div>
            <div className="info-row">
              <span>Property:</span>
              <span>{booking.listing_id.title}</span>
            </div>
            <div className="info-row">
              <span>Check-in:</span>
              <span>{formatDate(booking.start_date)}</span>
            </div>
            <div className="info-row">
              <span>Check-out:</span>
              <span>{formatDate(booking.end_date)}</span>
            </div>
            <div className="info-row">
              <span>Guests:</span>
              <span>{booking.guest_count}</span>
            </div>
          </div>
        </div>

        <div className="receipt-section">
          <h3>Payment Summary</h3>
          <div className="receipt-costs">
            <div className="cost-row">
              <span>Base Cost:</span>
              <span>${(booking.total_cost - (booking.service_fee || 0) - (booking.tax_amount || 0)).toFixed(2)}</span>
            </div>
            {booking.service_fee > 0 && (
              <div className="cost-row">
                <span>Service Fee:</span>
                <span>${booking.service_fee.toFixed(2)}</span>
              </div>
            )}
            {booking.tax_amount > 0 && (
              <div className="cost-row">
                <span>Taxes:</span>
                <span>${booking.tax_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="cost-row total">
              <span>Total Paid:</span>
              <span>${booking.total_cost}</span>
            </div>
          </div>
        </div>

        {booking.transaction_id && (
          <div className="receipt-section">
            <h3>Transaction Information</h3>
            <div className="receipt-info">
              <div className="info-row">
                <span>Transaction ID:</span>
                <span>{booking.transaction_id._id}</span>
              </div>
              <div className="info-row">
                <span>Payment Date:</span>
                <span>{formatDate(booking.transaction_id.created_at)}</span>
              </div>
              <div className="info-row">
                <span>Payment Method:</span>
                <span>{booking.transaction_id.payment_method || 'Credit Card'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .receipt {
          background: white;
          max-width: 600px;
          margin: 0 auto;
        }

        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .receipt-header h2 {
          margin: 0;
          color: #111827;
        }

        .receipt-section {
          margin-bottom: 2rem;
        }

        .receipt-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }

        .receipt-info,
        .receipt-costs {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .info-row,
        .cost-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-row:last-child,
        .cost-row:last-child {
          border-bottom: none;
        }

        .cost-row.total {
          background: #f9fafb;
          font-weight: 600;
          font-size: 1.1rem;
        }

        @media print {
          .receipt-header button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    active: 'green',
    completed: 'gray',
    cancelled: 'red'
  };
  return colors[status] || 'gray';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateNights = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default BookingDetail;