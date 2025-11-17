import api from './api';

class BookingService {
  // Create a new booking
  async createBooking(bookingData) {
    console.log('📞 BookingService.createBooking called');
    try {
      console.log('📤 BookingService - Creating booking with data:', bookingData);
      console.log('🌐 Making API call to /bookings...');
      const response = await api.post('/bookings', bookingData);
      console.log('✅ BookingService - API response received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ BookingService - Create booking error:', error);
      console.error('📋 BookingService - Error response:', error.response?.data);
      console.error('🔍 BookingService - Full error object:', error);
      throw this.handleError(error);
    }
  }

  // Get booking by ID
  async getBookingById(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user's bookings
  async getUserBookings(filters = {}) {
    try {
      const { role = 'all', status = 'all', page = 1, limit = 10 } = filters;
      const response = await api.get('/bookings', {
        params: { role, status, page, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Confirm a booking (owner action)
  async confirmBooking(bookingId) {
    try {
      const response = await api.patch(`/bookings/${bookingId}/confirm`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId, reason = null) {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Complete a booking (owner action)
  async completeBooking(bookingId) {
    try {
      const response = await api.patch(`/bookings/${bookingId}/complete`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check availability for dates
  async checkAvailability(listingId, startDate, endDate) {
    try {
      const response = await api.get(`/bookings/availability/${listingId}`, {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get booking statistics
  async getBookingStats() {
    try {
      const response = await api.get('/bookings/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get bookings for a specific listing (owner view)
  async getListingBookings(listingId, filters = {}) {
    try {
      const { status = 'all', page = 1, limit = 10 } = filters;
      const response = await api.get(`/bookings/listing/${listingId}`, {
        params: { status, page, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Calculate booking cost (frontend utility)
  calculateBookingCost(listing, startDate, endDate, guestCount = 1) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return {
        nights: 0,
        basePrice: 0,
        cleaningFee: 0,
        serviceFee: 0,
        taxAmount: 0,
        totalCost: 0
      };
    }

    const basePrice = listing.dailyRate * nights;
    const cleaningFee = listing.depositsRequired?.cleaning || 0;
    const serviceFee = Math.round(basePrice * 0.03); // 3% service fee
    const taxAmount = Math.round((basePrice + serviceFee) * 0.08); // 8% tax
    const totalCost = basePrice + cleaningFee + serviceFee + taxAmount;

    return {
      nights,
      basePrice,
      cleaningFee,
      serviceFee,
      taxAmount,
      totalCost
    };
  }

  // Format booking status for display
  formatBookingStatus(status) {
    const statusMap = {
      pending: { label: 'Pending', color: 'yellow', icon: '⏳' },
      confirmed: { label: 'Confirmed', color: 'blue', icon: '✅' },
      active: { label: 'Active', color: 'green', icon: '🏠' },
      completed: { label: 'Completed', color: 'gray', icon: '🏁' },
      cancelled: { label: 'Cancelled', color: 'red', icon: '❌' }
    };

    return statusMap[status] || { label: status, color: 'gray', icon: '❓' };
  }

  // Get available dates for a listing (mock implementation)
  async getAvailableDates(listingId, month, year) {
    try {
      // In a real app, this would be a dedicated endpoint
      // For now, we'll use the existing availability check
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      
      // This is a simplified version - in reality you'd want to check each date
      const availability = await this.checkAvailability(
        listingId, 
        startOfMonth.toISOString(), 
        endOfMonth.toISOString()
      );
      
      return {
        available: availability.data.available,
        unavailableDates: [] // Would contain array of unavailable dates
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get booking reference number
  getBookingReference(bookingId) {
    return `BK${bookingId.slice(-8).toUpperCase()}`;
  }

  // Handle API errors
  handleError(error) {
    console.log('=== BookingService Error Debug ===');
    console.log('Full error:', error);
    console.log('error.response:', error.response);
    console.log('error.response?.data:', error.response?.data);
    console.log('error.request:', error.request);
    console.log('error.message:', error.message);
    console.log('================================');
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const status = error.response.status;
      return new Error(`${message} (${status})`);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Validate booking dates
  validateBookingDates(startDate, endDate, minNights = 1, maxNights = 365) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const errors = [];

    // Check if dates are valid
    if (isNaN(start.getTime())) {
      errors.push('Start date is invalid');
    }
    if (isNaN(end.getTime())) {
      errors.push('End date is invalid');
    }

    if (errors.length > 0) return { valid: false, errors };

    // Check if start date is in the past
    if (start < today) {
      errors.push('Start date cannot be in the past');
    }

    // Check if end date is after start date
    if (end <= start) {
      errors.push('End date must be after start date');
    }

    // Check night limits
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (nights < minNights) {
      errors.push(`Minimum stay is ${minNights} night${minNights > 1 ? 's' : ''}`);
    }
    if (nights > maxNights) {
      errors.push(`Maximum stay is ${maxNights} nights`);
    }

    return {
      valid: errors.length === 0,
      errors,
      nights
    };
  }
}

const bookingService = new BookingService();
export { bookingService };
export default bookingService;