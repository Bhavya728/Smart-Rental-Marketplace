const bookingService = require('../services/bookingService');
const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

class BookingController {
  // Create a new booking
  async createBooking(req, res) {
    try {
      console.log('=== Booking Creation Debug ===');
      console.log('req.body:', JSON.stringify(req.body, null, 2));
      console.log('req.user:', req.user);
      console.log('req.headers:', req.headers);
      console.log('============================');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const bookingData = {
        ...req.body,
        renter_id: req.user.id
      };

      console.log('Final bookingData:', bookingData);
      const booking = await bookingService.createBooking(bookingData);

      // Send notification to owner
      try {
        await notificationService.sendNewBookingNotification(
          booking,
          booking.owner_id,
          booking.renter_id
        );
      } catch (emailError) {
        console.error('Failed to send booking notification:', emailError);
        // Don't fail the booking creation if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get booking by ID
  async getBookingById(req, res) {
    try {
      const { bookingId } = req.params;
      const booking = await bookingService.getBookingById(bookingId, req.user.id);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user's bookings
  async getUserBookings(req, res) {
    try {
      const {
        role = 'all',
        status = 'all',
        page = 1,
        limit = 10
      } = req.query;

      const result = await bookingService.getUserBookings(
        req.user.id,
        role,
        status,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Approve booking request (owner only)
  async approveBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const booking = await bookingService.approveBooking(bookingId, req.user.id);

      // Send approval notification to renter
      try {
        await notificationService.sendBookingApproval(
          booking,
          booking.renter_id,
          booking.owner_id
        );
      } catch (emailError) {
        console.error('Failed to send approval notification:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Booking request approved successfully',
        data: booking
      });
    } catch (error) {
      console.error('Approve booking error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Reject booking request (owner only)
  async rejectBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;
      const booking = await bookingService.rejectBooking(bookingId, req.user.id, reason);

      // Send rejection notification to renter
      try {
        await notificationService.sendBookingRejection(
          booking,
          booking.renter_id,
          booking.owner_id,
          reason
        );
      } catch (emailError) {
        console.error('Failed to send rejection notification:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Booking request rejected',
        data: booking
      });
    } catch (error) {
      console.error('Reject booking error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Confirm booking after payment (system only)
  async confirmBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const booking = await bookingService.confirmBooking(bookingId, req.user.id);

      // Send confirmation email to renter
      try {
        await notificationService.sendBookingConfirmation(
          booking,
          booking.renter_id,
          booking.owner_id
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Booking confirmed after payment',
        data: booking
      });
    } catch (error) {
      console.error('Confirm booking error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cancel booking
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;

      const booking = await bookingService.cancelBooking(bookingId, req.user.id, reason);

      // Send cancellation notification
      try {
        const recipient = booking.renter_id._id.toString() === req.user.id.toString() 
          ? booking.owner_id 
          : booking.renter_id;
        
        await notificationService.sendBookingCancellation(
          booking,
          req.user,
          recipient
        );
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Complete booking (owner only)
  async completeBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const booking = await bookingService.completeBooking(bookingId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Booking marked as completed',
        data: booking
      });
    } catch (error) {
      console.error('Complete booking error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Check availability for a listing
  async checkAvailability(req, res) {
    try {
      const { listingId } = req.params;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const availability = await bookingService.checkListingAvailability(
        listingId,
        start_date,
        end_date
      );

      res.status(200).json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get booking statistics
  async getBookingStats(req, res) {
    try {
      const stats = await bookingService.getBookingStats(req.user.id);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get booking stats error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get bookings for a specific listing (owner only)
  async getListingBookings(req, res) {
    try {
      const { listingId } = req.params;
      const { status = 'all', page = 1, limit = 10 } = req.query;

      // Verify the user owns this listing
      const Listing = require('../models/Listing');
      const listing = await Listing.findOne({ _id: listingId, owner_id: req.user.id });
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found or unauthorized'
        });
      }

      const Booking = require('../models/Booking');
      let query = { listing_id: listingId };
      
      if (status !== 'all') {
        query.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const bookings = await Booking.find(query)
        .populate('renter_id', 'first_name last_name email profile_picture')
        .populate('payment_id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Booking.countDocuments(query);

      res.status(200).json({
        success: true,
        data: bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get listing bookings error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update booking status (system use - cron job)
  async updateBookingStatuses(req, res) {
    try {
      const result = await bookingService.updateBookingStatuses();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Update booking statuses error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BookingController();