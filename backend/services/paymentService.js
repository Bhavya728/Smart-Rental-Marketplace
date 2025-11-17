const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const User = require('../models/User');

class PaymentService {
  // Create a new payment transaction
  async createPayment(paymentData) {
    try {
      const { booking_id, payer_id, payment_method, mock_card_details } = paymentData;

      // Get booking details
      const booking = await Booking.findById(booking_id).populate('owner_id');
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.payment_id) {
        throw new Error('Payment already exists for this booking');
      }

      // Calculate fees
      const platformFee = Math.round(booking.total_cost * 0.03); // 3% platform fee
      const processingFee = Math.round(booking.total_cost * 0.029 + 30); // 2.9% + $0.30 processing fee
      const netAmount = booking.total_cost - platformFee - processingFee;

      // Create transaction
      const transaction = new Transaction({
        booking_id,
        payer_id,
        recipient_id: booking.owner_id._id,
        amount: booking.total_cost,
        payment_method,
        platform_fee: platformFee,
        processing_fee: processingFee,
        net_amount: netAmount,
        mock_payment_details: {
          card_last_four: mock_card_details?.card_number?.slice(-4) || '1234',
          card_brand: mock_card_details?.card_brand || 'Visa'
        }
      });

      await transaction.save();

      // Link transaction to booking
      booking.payment_id = transaction._id;
      await booking.save();

      return transaction;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  // Process a payment (simulate payment processing)
  async processPayment(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId).populate('booking_id');
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'pending') {
        throw new Error('Transaction is not in pending status');
      }

      // Update status to processing
      transaction.status = 'processing';
      transaction.processed_at = new Date();
      await transaction.save();

      // Simulate payment processing
      const result = await Transaction.simulatePayment(transactionId);

      // If payment successful, update booking status
      if (result.status === 'completed') {
        const booking = await Booking.findById(transaction.booking_id);
        if (booking && booking.status === 'pending') {
          // Auto-confirm booking after successful payment
          booking.status = 'confirmed';
          booking.confirmed_at = new Date();
          await booking.save();
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to process payment: ${error.message}`);
    }
  }

  // Get payment/transaction by ID
  async getPaymentById(transactionId, userId = null) {
    try {
      let query = { _id: transactionId };
      
      if (userId) {
        query.$or = [{ payer_id: userId }, { recipient_id: userId }];
      }

      const transaction = await Transaction.findOne(query)
        .populate('booking_id')
        .populate('payer_id', 'first_name last_name email')
        .populate('recipient_id', 'first_name last_name email');

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    } catch (error) {
      throw new Error(`Failed to get payment: ${error.message}`);
    }
  }

  // Get user transactions
  async getUserTransactions(userId, type = 'all', page = 1, limit = 10) {
    try {
      let query = {};
      
      if (type === 'payments') {
        query.payer_id = userId;
      } else if (type === 'earnings') {
        query.recipient_id = userId;
      } else {
        query.$or = [{ payer_id: userId }, { recipient_id: userId }];
      }

      const skip = (page - 1) * limit;

      const transactions = await Transaction.find(query)
        .populate('booking_id', 'reference_number start_date end_date')
        .populate('payer_id', 'first_name last_name email')
        .populate('recipient_id', 'first_name last_name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Transaction.countDocuments(query);

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user transactions: ${error.message}`);
    }
  }

  // Process refund
  async processRefund(transactionId, refundAmount, reason, userId) {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify user has permission to process refund
      if (transaction.recipient_id.toString() !== userId.toString()) {
        throw new Error('Unauthorized to process refund');
      }

      const refundedTransaction = await transaction.processRefund(refundAmount, reason);
      return refundedTransaction;
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  // Get payment statistics
  async getPaymentStats(userId) {
    try {
      const stats = await Transaction.aggregate([
        {
          $match: {
            $or: [{ payer_id: userId }, { recipient_id: userId }]
          }
        },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalPaid: {
              $sum: {
                $cond: [
                  { $eq: ['$payer_id', userId] },
                  '$amount',
                  0
                ]
              }
            },
            totalEarned: {
              $sum: {
                $cond: [
                  { $eq: ['$recipient_id', userId] },
                  '$net_amount',
                  0
                ]
              }
            },
            totalRefunded: { $sum: '$refund_amount' },
            completedTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalTransactions: 0,
        totalPaid: 0,
        totalEarned: 0,
        totalRefunded: 0,
        completedTransactions: 0
      };
    } catch (error) {
      throw new Error(`Failed to get payment stats: ${error.message}`);
    }
  }

  // Simulate different payment scenarios for testing
  async simulatePaymentScenario(scenario = 'success') {
    const scenarios = {
      success: () => ({ success: true, message: 'Payment processed successfully' }),
      network_error: () => { throw new Error('Network connection failed'); },
      insufficient_funds: () => { throw new Error('Insufficient funds'); },
      card_declined: () => { throw new Error('Card was declined'); },
      expired_card: () => { throw new Error('Card has expired'); }
    };

    if (!scenarios[scenario]) {
      throw new Error('Invalid payment scenario');
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return scenarios[scenario]();
  }

  // Calculate platform fees
  calculateFees(amount) {
    const platformFee = Math.round(amount * 0.03); // 3%
    const processingFee = Math.round(amount * 0.029 + 30); // 2.9% + $0.30
    const netAmount = amount - platformFee - processingFee;

    return {
      gross_amount: amount,
      platform_fee: platformFee,
      processing_fee: processingFee,
      net_amount: netAmount
    };
  }

  // Validate payment method
  validatePaymentMethod(paymentMethod, cardDetails = null) {
    const validMethods = ['mock_card', 'mock_paypal', 'mock_bank'];
    
    if (!validMethods.includes(paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    if (paymentMethod === 'mock_card' && cardDetails) {
      if (!cardDetails.card_number || cardDetails.card_number.length < 13) {
        throw new Error('Invalid card number');
      }
      if (!cardDetails.expiry_month || !cardDetails.expiry_year) {
        throw new Error('Invalid expiry date');
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        throw new Error('Invalid CVV');
      }
    }

    return true;
  }
}

module.exports = new PaymentService();