const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
    index: true
  },
  payer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  payment_method: {
    type: String,
    enum: ['mock_card', 'mock_paypal', 'mock_bank'],
    required: true
  },
  // Mock payment details
  mock_payment_details: {
    card_last_four: String,
    card_brand: String,
    transaction_id: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  // Platform fees
  platform_fee: {
    type: Number,
    default: 0
  },
  processing_fee: {
    type: Number,
    default: 0
  },
  net_amount: {
    type: Number,
    required: true // Amount that goes to the owner after fees
  },
  // Transaction timeline
  initiated_at: {
    type: Date,
    default: Date.now
  },
  processed_at: {
    type: Date,
    default: null
  },
  completed_at: {
    type: Date,
    default: null
  },
  failed_at: {
    type: Date,
    default: null
  },
  // Failure details
  failure_reason: {
    type: String,
    default: null
  },
  // Refund details
  refund_amount: {
    type: Number,
    default: 0
  },
  refunded_at: {
    type: Date,
    default: null
  },
  refund_reason: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for transaction reference number
transactionSchema.virtual('reference_number').get(function() {
  return `TXN${this._id.toString().slice(-8).toUpperCase()}`;
});

// Compound indexes for efficient queries
transactionSchema.index({ payer_id: 1, status: 1 });
transactionSchema.index({ recipient_id: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to generate mock transaction ID
transactionSchema.pre('save', function(next) {
  if (!this.mock_payment_details.transaction_id) {
    this.mock_payment_details.transaction_id = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Calculate net amount if not provided
  if (!this.net_amount) {
    this.net_amount = this.amount - this.platform_fee - this.processing_fee;
  }
  
  next();
});

// Static method to simulate payment processing
transactionSchema.statics.simulatePayment = async function(transactionId) {
  const transaction = await this.findById(transactionId);
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 85% success rate for mock payments
  const isSuccess = Math.random() > 0.15;

  if (isSuccess) {
    transaction.status = 'completed';
    transaction.completed_at = new Date();
  } else {
    transaction.status = 'failed';
    transaction.failed_at = new Date();
    transaction.failure_reason = 'Mock payment simulation failed';
  }

  await transaction.save();
  return transaction;
};

// Instance method to process refund
transactionSchema.methods.processRefund = async function(refundAmount, reason) {
  if (this.status !== 'completed') {
    throw new Error('Can only refund completed transactions');
  }

  if (refundAmount > this.amount) {
    throw new Error('Refund amount cannot exceed original transaction amount');
  }

  this.refund_amount = refundAmount;
  this.refunded_at = new Date();
  this.refund_reason = reason;
  this.status = 'refunded';

  await this.save();
  return this;
};

module.exports = mongoose.model('Transaction', transactionSchema);