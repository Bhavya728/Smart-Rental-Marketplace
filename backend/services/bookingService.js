const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');
const User = require('../models/User');

class BookingService {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      const { listing_id, renter_id, start_date, end_date, guest_count, special_requests } = bookingData;

      // Get listing details
      const listing = await Listing.findById(listing_id).populate('owner');
      if (!listing) {
        throw new Error('Listing not found');
      }

      // Check if listing is available
      console.log('🔍 Checking availability for:', {
        listing_id,
        start_date: new Date(start_date),
        end_date: new Date(end_date)
      });
      
      // Clean up old pending bookings by the same user (older than 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      await Booking.updateMany({
        renter_id: renter_id,
        listing_id: listing_id,
        status: 'pending',
        createdAt: { $lt: thirtyMinutesAgo }
      }, {
        status: 'cancelled',
        cancelled_at: new Date(),
        cancellation_reason: 'Automatically cancelled due to timeout'
      });
      
      const isAvailable = await Booking.checkAvailability(listing_id, new Date(start_date), new Date(end_date));
      console.log('🔍 Availability check result:', isAvailable);
      
      if (!isAvailable) {
        // Get conflicting bookings for debugging
        const conflictingBookings = await Booking.find({
          listing_id: listing_id,
          status: { $in: ['pending', 'confirmed', 'active'] },
          $or: [
            {
              start_date: { $lte: new Date(start_date) },
              end_date: { $gt: new Date(start_date) }
            },
            {
              start_date: { $lt: new Date(end_date) },
              end_date: { $gte: new Date(end_date) }
            },
            {
              start_date: { $gte: new Date(start_date) },
              end_date: { $lte: new Date(end_date) }
            }
          ]
        });
        
        console.log('❌ Conflicting bookings found:', conflictingBookings);
        
        // Check if there's an existing pending booking by the same user for the same dates
        const existingUserBooking = conflictingBookings.find(booking => 
          booking.renter_id.toString() === renter_id.toString() &&
          booking.status === 'pending' &&
          booking.start_date.getTime() === new Date(start_date).getTime() &&
          booking.end_date.getTime() === new Date(end_date).getTime()
        );
        
        if (existingUserBooking) {
          throw new Error(`You already have a pending booking for these dates (Reference: ${existingUserBooking.reference_number}). Please complete the existing booking or choose different dates.`);
        }
        
        throw new Error('Selected dates are not available. Please choose different dates.');
      }

      // Calculate duration and costs
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const durationDays = Math.ceil((endDate - startDate) / (1000 * 3600 * 24));

      const basePrice = listing.dailyRate * durationDays;
      const cleaningFee = listing.depositsRequired?.cleaning || 0;
      const serviceFee = Math.round(basePrice * 0.03); // 3% service fee
      const taxAmount = Math.round((basePrice + serviceFee) * 0.08); // 8% tax
      const totalCost = basePrice + cleaningFee + serviceFee + taxAmount;

      // Create booking
      const booking = new Booking({
        listing_id,
        renter_id,
        owner_id: listing.owner._id,
        start_date: startDate,
        end_date: endDate,
        guest_count,
        special_requests,
        base_price: basePrice,
        cleaning_fee: cleaningFee,
        service_fee: serviceFee,
        tax_amount: taxAmount,
        total_cost: totalCost
      });

      await booking.save();

      // Populate the booking with related data
      const populatedBooking = await this.getBookingById(booking._id);
      
      return populatedBooking;
    } catch (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  // Get booking by ID with populated data
  async getBookingById(bookingId, userId = null) {
    try {
      const query = userId ? 
        { _id: bookingId, $or: [{ renter_id: userId }, { owner_id: userId }] } : 
        { _id: bookingId };

      const booking = await Booking.findOne(query)
        .populate('listing_id', 'title images location dailyRate')
        .populate('renter_id', 'name email profile_photo')
        .populate('owner_id', 'name email profile_photo')
        .populate('payment_id');

      if (!booking) {
        throw new Error('Booking not found');
      }

      return booking;
    } catch (error) {
      throw new Error(`Failed to get booking: ${error.message}`);
    }
  }

  // Get bookings for a user (as renter or owner)
  async getUserBookings(userId, role = 'all', status = 'all', page = 1, limit = 10) {
    try {
      let query = {};
      
      if (role === 'renter') {
        query.renter_id = userId;
      } else if (role === 'owner') {
        query.owner_id = userId;
      } else {
        query.$or = [{ renter_id: userId }, { owner_id: userId }];
      }

      if (status !== 'all') {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const bookings = await Booking.find(query)
        .populate('listing_id', 'title images location dailyRate')
        .populate('renter_id', 'name email profile_photo')
        .populate('owner_id', 'name email profile_photo')
        .populate('payment_id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Booking.countDocuments(query);

      return {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user bookings: ${error.message}`);
    }
  }

  // Approve a booking request (owner action)
  async approveBooking(bookingId, ownerId) {
    try {
      const booking = await Booking.findOne({ 
        _id: bookingId, 
        owner_id: ownerId, 
        status: 'pending_approval' 
      });
      
      if (!booking) {
        throw new Error('Booking not found or cannot be approved');
      }

      booking.status = 'approved';
      booking.approved_at = new Date();
      await booking.save();

      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to approve booking: ${error.message}`);
    }
  }

  // Reject a booking request (owner action)
  async rejectBooking(bookingId, ownerId, reason = null) {
    try {
      const booking = await Booking.findOne({ 
        _id: bookingId, 
        owner_id: ownerId, 
        status: 'pending_approval' 
      });
      
      if (!booking) {
        throw new Error('Booking not found or cannot be rejected');
      }

      // Store booking data for notification before deletion
      const bookingData = await this.getBookingById(bookingId);

      // Remove the booking entirely when rejected
      await Booking.findByIdAndDelete(bookingId);
      
      console.log(`Booking ${bookingId} has been rejected and removed from system`);
      
      // Return the booking data for notification purposes
      return {
        ...bookingData.data,
        status: 'rejected',
        rejected_at: new Date(),
        rejection_reason: reason,
        _isDeleted: true
      };
    } catch (error) {
      throw new Error(`Failed to reject booking: ${error.message}`);
    }
  }

  // Confirm a booking after payment (system action)
  async confirmBooking(bookingId, userId) {
    try {
      const booking = await Booking.findOne({ 
        _id: bookingId, 
        $or: [{ renter_id: userId }, { owner_id: userId }],
        status: 'approved' 
      });
      
      if (!booking) {
        throw new Error('Booking not found or cannot be confirmed');
      }

      booking.status = 'confirmed';
      booking.confirmed_at = new Date();
      await booking.save();

      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to confirm booking: ${error.message}`);
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId, userId, reason = null) {
    try {
      const booking = await Booking.findOne({ 
        _id: bookingId, 
        $or: [{ renter_id: userId }, { owner_id: userId }],
        status: { $in: ['pending_approval', 'approved', 'confirmed'] }
      });

      if (!booking) {
        throw new Error('Booking not found or cannot be cancelled');
      }

      booking.status = 'cancelled';
      booking.cancelled_at = new Date();
      booking.cancellation_reason = reason;
      await booking.save();

      // If payment exists, process refund
      if (booking.payment_id) {
        const refundAmount = booking.calculateRefundAmount();
        if (refundAmount > 0) {
          const transaction = await Transaction.findById(booking.payment_id);
          if (transaction) {
            await transaction.processRefund(refundAmount, `Booking cancelled: ${reason || 'No reason provided'}`);
          }
        }
      }

      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }

  // Mark booking as completed
  async completeBooking(bookingId, userId) {
    try {
      const booking = await Booking.findOne({ 
        _id: bookingId, 
        owner_id: userId,
        status: 'active'
      });

      if (!booking) {
        throw new Error('Booking not found or cannot be completed');
      }

      booking.status = 'completed';
      booking.completed_at = new Date();
      await booking.save();

      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to complete booking: ${error.message}`);
    }
  }

  // Check availability for a listing
  async checkListingAvailability(listingId, startDate, endDate) {
    try {
      const isAvailable = await Booking.checkAvailability(listingId, new Date(startDate), new Date(endDate));
      return { available: isAvailable };
    } catch (error) {
      throw new Error(`Failed to check availability: ${error.message}`);
    }
  }

  // Get booking statistics for dashboard
  async getBookingStats(userId) {
    try {
      const stats = await Booking.aggregate([
        {
          $match: {
            $or: [{ renter_id: userId }, { owner_id: userId }]
          }
        },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            completedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            activeBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$total_cost', 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalBookings: 0,
        completedBookings: 0,
        activeBookings: 0,
        totalRevenue: 0
      };
    } catch (error) {
      throw new Error(`Failed to get booking stats: ${error.message}`);
    }
  }

  // Update booking status based on dates (cron job function)
  async updateBookingStatuses() {
    try {
      const now = new Date();
      
      // Mark confirmed bookings as active if start date has passed
      await Booking.updateMany(
        {
          status: 'confirmed',
          start_date: { $lte: now }
        },
        {
          status: 'active'
        }
      );

      // Mark active bookings as completed if end date has passed
      const completedBookings = await Booking.updateMany(
        {
          status: 'active',
          end_date: { $lte: now }
        },
        {
          status: 'completed',
          completed_at: now
        }
      );

      return {
        message: 'Booking statuses updated',
        completedCount: completedBookings.modifiedCount
      };
    } catch (error) {
      throw new Error(`Failed to update booking statuses: ${error.message}`);
    }
  }
}

module.exports = new BookingService();