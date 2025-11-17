const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  listing_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
    index: true
  },
  renter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  start_date: {
    type: Date,
    required: true,
    index: true
  },
  end_date: {
    type: Date,
    required: true,
    index: true,
    validate: {
      validator: function(value) {
        return value > this.start_date;
      },
      message: 'End date must be after start date'
    }
  },
  total_cost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  confirmed_at: {
    type: Date,
    default: null
  },
  completed_at: {
    type: Date,
    default: null
  },
  cancelled_at: {
    type: Date,
    default: null
  },
  cancellation_reason: {
    type: String,
    default: null
  },
  // Additional booking details
  guest_count: {
    type: Number,
    required: true,
    min: 1
  },
  special_requests: {
    type: String,
    maxlength: 500
  },
  // Pricing breakdown
  base_price: {
    type: Number,
    required: true
  },
  cleaning_fee: {
    type: Number,
    default: 0
  },
  service_fee: {
    type: Number,
    default: 0
  },
  tax_amount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // This adds created_at and updated_at
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration in days
bookingSchema.virtual('duration_days').get(function() {
  if (this.start_date && this.end_date) {
    const timeDiff = this.end_date.getTime() - this.start_date.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  return 0;
});

// Virtual for booking reference number
bookingSchema.virtual('reference_number').get(function() {
  return `BK${this._id.toString().slice(-8).toUpperCase()}`;
});

// Compound indexes for efficient queries
bookingSchema.index({ renter_id: 1, status: 1 });
bookingSchema.index({ owner_id: 1, status: 1 });
bookingSchema.index({ listing_id: 1, start_date: 1, end_date: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to calculate total cost if not provided
bookingSchema.pre('save', function(next) {
  if (!this.total_cost && this.base_price) {
    this.total_cost = this.base_price + this.cleaning_fee + this.service_fee + this.tax_amount;
  }
  next();
});

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(listingId, startDate, endDate, excludeBookingId = null) {
  const query = {
    listing_id: listingId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      {
        start_date: { $lte: startDate },
        end_date: { $gt: startDate }
      },
      {
        start_date: { $lt: endDate },
        end_date: { $gte: endDate }
      },
      {
        start_date: { $gte: startDate },
        end_date: { $lte: endDate }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await this.find(query);
  return conflictingBookings.length === 0;
};

// Instance method to calculate refund amount
bookingSchema.methods.calculateRefundAmount = function() {
  const now = new Date();
  const startDate = this.start_date;
  const daysUntilStart = Math.ceil((startDate - now) / (1000 * 3600 * 24));
  
  if (daysUntilStart > 7) {
    return this.total_cost * 0.9; // 90% refund for cancellations 7+ days before
  } else if (daysUntilStart > 3) {
    return this.total_cost * 0.5; // 50% refund for cancellations 3-7 days before
  } else {
    return 0; // No refund for cancellations within 3 days
  }
};

module.exports = mongoose.model('Booking', bookingSchema);