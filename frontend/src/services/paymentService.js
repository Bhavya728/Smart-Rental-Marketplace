import api from './api';

class PaymentService {
  // Create a new payment
  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Process a payment
  async processPayment(transactionId) {
    try {
      const response = await api.post(`/payments/${transactionId}/process`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get payment by ID
  async getPaymentById(transactionId) {
    try {
      const response = await api.get(`/payments/${transactionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user's transactions
  async getUserTransactions(filters = {}) {
    try {
      const { type = 'all', page = 1, limit = 10 } = filters;
      const response = await api.get('/payments', {
        params: { type, page, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Process a refund
  async processRefund(transactionId, refundAmount, reason) {
    try {
      const response = await api.post(`/payments/${transactionId}/refund`, {
        refund_amount: refundAmount,
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get payment statistics
  async getPaymentStats() {
    try {
      const response = await api.get('/payments/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Calculate fees for an amount
  async calculateFees(amount) {
    try {
      const response = await api.get('/payments/calculate-fees', {
        params: { amount }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get saved payment methods
  async getPaymentMethods() {
    try {
      const response = await api.get('/payments/methods');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Simulate payment scenarios (for testing)
  async simulatePaymentScenario(scenario = 'success') {
    try {
      const response = await api.post('/payments/simulate', { scenario });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Validate card number (basic Luhn algorithm)
  validateCardNumber(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    
    if (!/^\d+$/.test(number)) {
      return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  // Get card brand from number
  getCardBrand(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    
    const cardTypes = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      dinersclub: /^3[068]/,
      jcb: /^35/
    };

    for (const [brand, pattern] of Object.entries(cardTypes)) {
      if (pattern.test(number)) {
        return brand;
      }
    }

    return 'unknown';
  }

  // Format card number with spaces
  formatCardNumber(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    const match = number.match(/.{1,4}/g);
    return match ? match.join(' ') : number;
  }

  // Validate expiry date
  validateExpiryDate(month, year) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(year, 10);

    if (expiryYear < currentYear) {
      return false;
    }

    if (expiryYear === currentYear && expiryMonth < currentMonth) {
      return false;
    }

    return true;
  }

  // Validate CVV
  validateCVV(cvv, cardBrand = 'visa') {
    const cvvLength = cardBrand === 'amex' ? 4 : 3;
    return /^\d+$/.test(cvv) && cvv.length === cvvLength;
  }

  // Format currency
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Format payment status for display
  formatPaymentStatus(status) {
    const statusMap = {
      pending: { label: 'Pending', color: 'yellow', icon: '⏳' },
      processing: { label: 'Processing', color: 'blue', icon: '🔄' },
      completed: { label: 'Completed', color: 'green', icon: '✅' },
      failed: { label: 'Failed', color: 'red', icon: '❌' },
      refunded: { label: 'Refunded', color: 'purple', icon: '🔄' },
      cancelled: { label: 'Cancelled', color: 'gray', icon: '⛔' }
    };

    return statusMap[status] || { label: status, color: 'gray', icon: '❓' };
  }

  // Get payment method icon
  getPaymentMethodIcon(method) {
    const icons = {
      mock_card: '💳',
      mock_paypal: '🅿️',
      mock_bank: '🏦',
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳'
    };

    return icons[method] || '💳';
  }

  // Generate mock payment scenarios for testing
  getMockPaymentScenarios() {
    return [
      {
        id: 'success',
        name: 'Successful Payment',
        description: 'Payment processes successfully',
        successRate: 100
      },
      {
        id: 'network_error',
        name: 'Network Error',
        description: 'Network connection fails during payment',
        successRate: 0
      },
      {
        id: 'insufficient_funds',
        name: 'Insufficient Funds',
        description: 'Card has insufficient balance',
        successRate: 0
      },
      {
        id: 'card_declined',
        name: 'Card Declined',
        description: 'Card is declined by the bank',
        successRate: 0
      },
      {
        id: 'expired_card',
        name: 'Expired Card',
        description: 'Card has expired',
        successRate: 0
      }
    ];
  }

  // Create mock card for testing
  createMockCard(scenario = 'success') {
    const mockCards = {
      success: {
        card_number: '4242424242424242',
        card_brand: 'visa',
        expiry_month: 12,
        expiry_year: 2027,
        cvv: '123',
        cardholder_name: 'Test User'
      },
      declined: {
        card_number: '4000000000000002',
        card_brand: 'visa',
        expiry_month: 12,
        expiry_year: 2027,
        cvv: '123',
        cardholder_name: 'Test User'
      },
      insufficient: {
        card_number: '4000000000009995',
        card_brand: 'visa',
        expiry_month: 12,
        expiry_year: 2027,
        cvv: '123',
        cardholder_name: 'Test User'
      }
    };

    return mockCards[scenario] || mockCards.success;
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'Payment failed';
      const status = error.response.status;
      return new Error(`${message} (${status})`);
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected payment error occurred');
    }
  }

  // Validate payment form data
  validatePaymentForm(formData) {
    const errors = [];

    // Validate card number
    if (!formData.card_number || !this.validateCardNumber(formData.card_number)) {
      errors.push('Invalid card number');
    }

    // Validate expiry date
    if (!this.validateExpiryDate(formData.expiry_month, formData.expiry_year)) {
      errors.push('Invalid or expired date');
    }

    // Validate CVV
    const cardBrand = this.getCardBrand(formData.card_number);
    if (!this.validateCVV(formData.cvv, cardBrand)) {
      errors.push('Invalid security code');
    }

    // Validate cardholder name
    if (!formData.cardholder_name || formData.cardholder_name.length < 2) {
      errors.push('Cardholder name is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new PaymentService();