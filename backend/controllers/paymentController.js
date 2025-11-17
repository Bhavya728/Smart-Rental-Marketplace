const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

class PaymentController {
  // Create a new payment
  async createPayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const paymentData = {
        ...req.body,
        payer_id: req.user.id
      };

      // Validate payment method
      paymentService.validatePaymentMethod(
        paymentData.payment_method,
        paymentData.mock_card_details
      );

      const transaction = await paymentService.createPayment(paymentData);

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Process payment
  async processPayment(req, res) {
    try {
      const { transactionId } = req.params;

      const transaction = await paymentService.processPayment(transactionId);

      // Send payment confirmation email if successful
      if (transaction.status === 'completed') {
        try {
          await notificationService.sendPaymentConfirmation(
            transaction,
            { 
              first_name: req.user.first_name, 
              last_name: req.user.last_name, 
              email: req.user.email 
            },
            transaction.recipient_id
          );
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Process payment error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get payment by ID
  async getPaymentById(req, res) {
    try {
      const { transactionId } = req.params;
      const transaction = await paymentService.getPaymentById(transactionId, req.user.id);

      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user's transactions
  async getUserTransactions(req, res) {
    try {
      const {
        type = 'all',
        page = 1,
        limit = 10
      } = req.query;

      const result = await paymentService.getUserTransactions(
        req.user.id,
        type,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user transactions error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Process refund
  async processRefund(req, res) {
    try {
      const { transactionId } = req.params;
      const { refund_amount, reason } = req.body;

      if (!refund_amount || refund_amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid refund amount is required'
        });
      }

      const transaction = await paymentService.processRefund(
        transactionId,
        refund_amount,
        reason,
        req.user.id
      );

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Process refund error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get payment statistics
  async getPaymentStats(req, res) {
    try {
      const stats = await paymentService.getPaymentStats(req.user.id);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Calculate fees for a given amount
  async calculateFees(req, res) {
    try {
      const { amount } = req.query;

      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
      }

      const fees = paymentService.calculateFees(parseFloat(amount));

      res.status(200).json({
        success: true,
        data: fees
      });
    } catch (error) {
      console.error('Calculate fees error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Simulate payment scenarios (for testing)
  async simulatePaymentScenario(req, res) {
    try {
      const { scenario = 'success' } = req.body;

      const result = await paymentService.simulatePaymentScenario(scenario);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Simulate payment error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Webhook handler for payment status updates (mock)
  async handlePaymentWebhook(req, res) {
    try {
      const { transaction_id, status, webhook_data } = req.body;

      // In a real implementation, you'd verify the webhook signature
      console.log('Payment webhook received:', { transaction_id, status, webhook_data });

      // Update transaction status based on webhook
      const Transaction = require('../models/Transaction');
      const transaction = await Transaction.findOne({ 
        'mock_payment_details.transaction_id': transaction_id 
      });

      if (transaction) {
        transaction.status = status;
        if (status === 'completed') {
          transaction.completed_at = new Date();
        } else if (status === 'failed') {
          transaction.failed_at = new Date();
          transaction.failure_reason = webhook_data.error_message || 'Payment failed';
        }
        await transaction.save();
      }

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      console.error('Payment webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }

  // Get payment methods for user (mock data)
  async getPaymentMethods(req, res) {
    try {
      // In a real app, this would fetch saved payment methods from the database
      const mockPaymentMethods = [
        {
          id: 'pm_1',
          type: 'mock_card',
          card_brand: 'Visa',
          card_last_four: '1234',
          is_default: true,
          created_at: new Date('2024-01-15')
        },
        {
          id: 'pm_2',
          type: 'mock_card',
          card_brand: 'Mastercard',
          card_last_four: '5678',
          is_default: false,
          created_at: new Date('2024-02-10')
        }
      ];

      res.status(200).json({
        success: true,
        data: mockPaymentMethods
      });
    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PaymentController();