import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DateRangePicker from '../ui/DateRangePicker';
import bookingService from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const BookingWidget = ({ listing, className = "" }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guestCount, setGuestCount] = useState(1);

  // Debug: Check what listing data we receive
  console.log('=== BookingWidget Props Debug ===');
  console.log('listing prop:', listing);
  console.log('listing._id:', listing?._id);
  console.log('listing.id:', listing?.id);
  console.log('================================');
  const [isAvailable, setIsAvailable] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [errors, setErrors] = useState({});
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate cost breakdown when dates change
  useEffect(() => {
    if (startDate && endDate && listing) {
      const breakdown = bookingService.calculateBookingCost(listing, startDate, endDate, guestCount);
      setCostBreakdown(breakdown);
      
      // Check availability
      checkAvailability();
    } else {
      setCostBreakdown(null);
      setIsAvailable(null);
    }
  }, [startDate, endDate, guestCount, listing]);

  const checkAvailability = async () => {
    const listingId = listing?._id || listing?.id;
    if (!startDate || !endDate || !listingId) return;

    setIsCheckingAvailability(true);
    try {
      const response = await bookingService.checkAvailability(
        listingId,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setIsAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking availability:', error);
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setErrors({});
  };

  const handleGuestCountChange = (count) => {
    setGuestCount(Math.max(1, Math.min(count, listing?.max_guests || 10)));
  };

  const validateBooking = () => {
    const newErrors = {};

    if (!user) {
      newErrors.auth = 'Please sign in to make a booking';
    }

    if (!startDate || !endDate) {
      newErrors.dates = 'Please select check-in and check-out dates';
    } else {
      const validation = bookingService.validateBookingDates(startDate, endDate);
      if (!validation.valid) {
        newErrors.dates = validation.errors[0];
      }
    }

    if (guestCount < 1 || guestCount > (listing?.max_guests || 10)) {
      newErrors.guests = `Guest count must be between 1 and ${listing?.max_guests || 10}`;
    }

    if (isAvailable === false) {
      newErrors.availability = 'Selected dates are not available';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookNow = () => {
    if (!validateBooking()) return;

    if (!user) {
      navigate('/login', { 
        state: { 
          returnTo: `/listing/${listing._id}`,
          message: 'Please sign in to complete your booking'
        }
      });
      return;
    }

    // Validate listing ID before navigation
    const listingId = listing?._id || listing?.id;
    if (!listingId) {
      console.error('❌ Cannot navigate: Listing ID is missing');
      alert('Error: Listing data is not fully loaded. Please wait and try again.');
      return;
    }

    // Navigate to checkout with booking details
    const bookingData = {
      listing_id: listingId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      guest_count: guestCount
    };

    console.log('=== BookingWidget Navigation ===');
    console.log('listing._id:', listing._id);
    console.log('listing.id:', listing?.id);
    console.log('listing object:', listing);
    console.log('Navigation URL:', `/listings/${listingId}/book`);
    console.log('bookingData:', bookingData);
    console.log('==============================');

    navigate(`/listings/${listingId}/book`, { state: { bookingData, listing, costBreakdown } });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className={`booking-widget bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(listing?.dailyRate)}
            </span>
            <span className="text-gray-600 ml-1">/ night</span>
          </div>
          {listing?.rating && (
            <div className="flex items-center mt-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <span className="text-sm text-gray-600 ml-1">
                {listing.rating} ({listing.review_count || 0} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Check-in / Check-out
        </label>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          placeholder="Select your dates"
          unavailableDates={[]} // TODO: Implement from API
        />
        {errors.dates && (
          <p className="text-red-500 text-sm mt-1">{errors.dates}</p>
        )}
      </div>

      {/* Guest Count */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Guests
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => handleGuestCountChange(guestCount - 1)}
            disabled={guestCount <= 1}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="mx-4 min-w-[3rem] text-center font-medium">
            {guestCount} guest{guestCount !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => handleGuestCountChange(guestCount + 1)}
            disabled={guestCount >= (listing?.max_guests || 10)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        {errors.guests && (
          <p className="text-red-500 text-sm mt-1">{errors.guests}</p>
        )}
      </div>

      {/* Availability Status */}
      {startDate && endDate && (
        <div className="mb-4">
          {isCheckingAvailability ? (
            <div className="flex items-center text-blue-600">
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking availability...
            </div>
          ) : isAvailable === true ? (
            <div className="flex items-center text-green-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Available
            </div>
          ) : isAvailable === false ? (
            <div className="flex items-center text-red-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Not available
            </div>
          ) : null}
          {errors.availability && (
            <p className="text-red-500 text-sm mt-1">{errors.availability}</p>
          )}
        </div>
      )}

      {/* Cost Breakdown */}
      {costBreakdown && costBreakdown.nights > 0 && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{formatCurrency(listing?.dailyRate)} × {costBreakdown.nights} night{costBreakdown.nights !== 1 ? 's' : ''}</span>
              <span>{formatCurrency(costBreakdown.basePrice)}</span>
            </div>
            {costBreakdown.cleaningFee > 0 && (
              <div className="flex justify-between">
                <span>Cleaning fee</span>
                <span>{formatCurrency(costBreakdown.cleaningFee)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>{formatCurrency(costBreakdown.serviceFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>{formatCurrency(costBreakdown.taxAmount)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-3">
            <span className="font-semibold">Total</span>
            <span className="font-semibold text-lg">{formatCurrency(costBreakdown.totalCost)}</span>
          </div>
        </div>
      )}

      {/* Book Button */}
      <button
        type="button"
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isAvailable === false || isCheckingAvailability
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        onClick={handleBookNow}
        disabled={isAvailable === false || isCheckingAvailability}
      >
        {!user ? 'Sign in to Book' : 'Reserve'}
      </button>

      {/* Auth Error */}
      {errors.auth && (
        <p className="text-red-500 text-sm mt-2 text-center">{errors.auth}</p>
      )}

      {/* Footer Note */}
      <p className="text-xs text-gray-500 text-center mt-3">
        You won't be charged yet
      </p>
    </div>
  );
};

export default BookingWidget;