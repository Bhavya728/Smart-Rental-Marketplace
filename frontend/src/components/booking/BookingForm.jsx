import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users, MessageCircle, AlertCircle, Calendar, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const BookingForm = ({ 
  listing,
  startDate,
  endDate,
  totalCost,
  onSubmit,
  loading = false,
  className = ""
}) => {
  const [guestDetails, setGuestDetails] = useState({
    adults: 1,
    children: 0,
    infants: 0
  });
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      guestCount: 1,
      specialRequests: '',
      emergencyContact: '',
      emergencyPhone: '',
      arrivalTime: '',
      purposeOfStay: 'leisure'
    }
  });

  const watchedGuestCount = watch('guestCount');

  const updateGuestCount = (type, increment) => {
    const newDetails = { ...guestDetails };
    const currentCount = newDetails[type];
    const newCount = Math.max(0, currentCount + increment);
    
    // Enforce maximum guests based on listing
    const totalGuests = Object.values(newDetails).reduce((sum, count) => sum + count, 0);
    if (increment > 0 && totalGuests >= listing?.max_guests) {
      return;
    }
    
    newDetails[type] = newCount;
    setGuestDetails(newDetails);
    
    // Update form guest count
    const totalGuestCount = Object.values(newDetails).reduce((sum, count) => sum + count, 0);
    document.querySelector('input[name="guestCount"]').value = totalGuestCount;
  };

  const formatDate = (date) => {
    if (!date) return 'Select date';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  };

  const handleFormSubmit = (data) => {
    const bookingData = {
      ...data,
      guestDetails,
      startDate,
      endDate,
      totalCost,
      listingId: listing._id
    };
    onSubmit(bookingData);
  };

  const totalGuests = Object.values(guestDetails).reduce((sum, count) => sum + count, 0);
  const nights = calculateNights();

  return (
    <Card className={`booking-form ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Booking Summary Header */}
        <div className="booking-header">
          <h2 className="text-xl font-semibold text-gray-900">Complete Your Booking</h2>
          <p className="text-sm text-gray-600 mt-1">Fill in the details below to confirm your reservation</p>
        </div>

        {/* Trip Summary */}
        <div className="trip-summary">
          <h3 className="text-lg font-medium mb-3">Your Trip</h3>
          
          <div className="summary-grid">
            <div className="summary-item">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm font-medium">Dates</span>
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(startDate)} - {formatDate(endDate)}
              </div>
              {nights > 0 && (
                <div className="text-xs text-gray-500 mt-1">{nights} night{nights !== 1 ? 's' : ''}</div>
              )}
            </div>

            <div className="summary-item">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-gray-500" />
                <span className="text-sm font-medium">Guests</span>
              </div>
              <div className="text-sm text-gray-600">
                {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="summary-item">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <div className="text-sm text-gray-600">
                {listing?.city}, {listing?.state}
              </div>
            </div>
          </div>
        </div>

        {/* Guest Count Selection */}
        <div className="guest-selection">
          <h3 className="text-lg font-medium mb-3">Who's coming?</h3>
          
          <div className="guest-types">
            <div className="guest-type">
              <div className="guest-info">
                <div className="font-medium">Adults</div>
                <div className="text-sm text-gray-600">Ages 13 or above</div>
              </div>
              <div className="guest-counter">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateGuestCount('adults', -1)}
                  disabled={guestDetails.adults <= 1}
                  className="counter-btn"
                >
                  -
                </Button>
                <span className="counter-value">{guestDetails.adults}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateGuestCount('adults', 1)}
                  disabled={totalGuests >= listing?.max_guests}
                  className="counter-btn"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="guest-type">
              <div className="guest-info">
                <div className="font-medium">Children</div>
                <div className="text-sm text-gray-600">Ages 2-12</div>
              </div>
              <div className="guest-counter">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateGuestCount('children', -1)}
                  disabled={guestDetails.children <= 0}
                  className="counter-btn"
                >
                  -
                </Button>
                <span className="counter-value">{guestDetails.children}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateGuestCount('children', 1)}
                  disabled={totalGuests >= listing?.max_guests}
                  className="counter-btn"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="guest-type">
              <div className="guest-info">
                <div className="font-medium">Infants</div>
                <div className="text-sm text-gray-600">Under 2</div>
              </div>
              <div className="guest-counter">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateGuestCount('infants', -1)}
                  disabled={guestDetails.infants <= 0}
                  className="counter-btn"
                >
                  -
                </Button>
                <span className="counter-value">{guestDetails.infants}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateGuestCount('infants', 1)}
                  disabled={totalGuests >= listing?.max_guests}
                  className="counter-btn"
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {totalGuests >= listing?.max_guests && (
            <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle size={16} />
              <span>Maximum guest capacity reached ({listing.max_guests} guests)</span>
            </div>
          )}

          {/* Hidden input for form validation */}
          <input
            type="hidden"
            {...register('guestCount', {
              required: 'Guest count is required',
              min: { value: 1, message: 'At least 1 guest is required' },
              max: { value: listing?.max_guests, message: `Maximum ${listing?.max_guests} guests allowed` }
            })}
            value={totalGuests}
          />
          {errors.guestCount && (
            <p className="text-sm text-red-600 mt-1">{errors.guestCount.message}</p>
          )}
        </div>

        {/* Arrival Information */}
        <div className="arrival-info">
          <h3 className="text-lg font-medium mb-3">Arrival Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="arrivalTime" className="form-label">
                Estimated Arrival Time
              </label>
              <select
                {...register('arrivalTime', { required: 'Please select arrival time' })}
                className="form-input"
              >
                <option value="">Select time</option>
                <option value="morning">Morning (8:00 - 12:00)</option>
                <option value="afternoon">Afternoon (12:00 - 17:00)</option>
                <option value="evening">Evening (17:00 - 20:00)</option>
                <option value="night">Night (20:00 - 23:00)</option>
              </select>
              {errors.arrivalTime && (
                <p className="error-message">{errors.arrivalTime.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="purposeOfStay" className="form-label">
                Purpose of Stay
              </label>
              <select
                {...register('purposeOfStay', { required: 'Please select purpose' })}
                className="form-input"
              >
                <option value="leisure">Leisure</option>
                <option value="business">Business</option>
                <option value="family">Family Visit</option>
                <option value="event">Special Event</option>
                <option value="other">Other</option>
              </select>
              {errors.purposeOfStay && (
                <p className="error-message">{errors.purposeOfStay.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="emergency-contact">
          <h3 className="text-lg font-medium mb-3">Emergency Contact</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please provide an emergency contact who can be reached during your stay.
          </p>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="emergencyContact" className="form-label">
                Contact Name
              </label>
              <Input
                {...register('emergencyContact', { 
                  required: 'Emergency contact name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                placeholder="Full name"
                error={errors.emergencyContact?.message}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyPhone" className="form-label">
                Phone Number
              </label>
              <Input
                {...register('emergencyPhone', {
                  required: 'Emergency phone number is required',
                  pattern: {
                    value: /^[\+]?[\d\s\-\(\)]{10,}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                placeholder="+1 (555) 123-4567"
                error={errors.emergencyPhone?.message}
              />
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div className="special-requests">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={20} className="text-gray-500" />
            <h3 className="text-lg font-medium">Special Requests</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Any special requests or requirements for your stay? (Optional)
          </p>
          
          <textarea
            {...register('specialRequests', {
              maxLength: { value: 500, message: 'Maximum 500 characters allowed' }
            })}
            className="form-textarea"
            rows={4}
            placeholder="Early check-in, late check-out, accessibility needs, dietary restrictions, etc."
            maxLength={500}
          />
          {errors.specialRequests && (
            <p className="error-message">{errors.specialRequests.message}</p>
          )}
          
          <div className="text-right text-xs text-gray-500 mt-1">
            {watch('specialRequests')?.length || 0}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!isValid || !startDate || !endDate || totalGuests === 0}
            className="w-full"
          >
            {loading ? 'Processing...' : `Continue to Payment - $${totalCost}`}
          </Button>
          
          <p className="text-xs text-gray-600 text-center mt-3">
            You won't be charged yet. Review your booking details on the next page.
          </p>
        </div>
      </form>

      <style jsx>{`
        .booking-form {
          max-width: 600px;
        }

        .booking-header {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 1rem;
        }

        .trip-summary {
          background-color: #f9fafb;
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .summary-item {
          background: white;
          padding: 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }

        .guest-types {
          space-y: 1rem;
        }

        .guest-type {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: #f9fafb;
        }

        .guest-info {
          flex: 1;
        }

        .guest-counter {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .counter-btn {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .counter-value {
          font-weight: 600;
          min-width: 1.5rem;
          text-align: center;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .form-input,
        .form-textarea {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .error-message {
          color: #dc2626;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .submit-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 1.5rem;
        }

        @media (max-width: 640px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .guest-type {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .guest-counter {
            align-self: stretch;
            justify-content: center;
          }
        }
      `}</style>
    </Card>
  );
};

export default BookingForm;