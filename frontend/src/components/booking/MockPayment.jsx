import React, { useState } from 'react';
import paymentService from '../../services/paymentService';
import Alert from '../ui/Alert';

const MockPayment = ({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  isProcessing = false,
  className = "" 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('mock_card');
  const [cardDetails, setCardDetails] = useState({
    card_number: '',
    cardholder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: ''
  });
  const [selectedScenario, setSelectedScenario] = useState('success');
  const [errors, setErrors] = useState({});
  const [showTestCards, setShowTestCards] = useState(false);

  const testScenarios = paymentService.getMockPaymentScenarios();
  const testCards = {
    success: paymentService.createMockCard('success'),
    declined: paymentService.createMockCard('declined'),
    insufficient: paymentService.createMockCard('insufficient')
  };

  const handleCardDetailsChange = (field, value) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === 'card_number') {
      formattedValue = paymentService.formatCardNumber(value.replace(/\s/g, ''));
    }

    // Limit expiry fields
    if (field === 'expiry_month') {
      formattedValue = value.replace(/\D/g, '').slice(0, 2);
      if (parseInt(formattedValue) > 12) formattedValue = '12';
    }

    if (field === 'expiry_year') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    // Limit CVV
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear field-specific error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const useTestCard = (cardType) => {
    const testCard = testCards[cardType];
    setCardDetails({
      card_number: paymentService.formatCardNumber(testCard.card_number),
      cardholder_name: testCard.cardholder_name,
      expiry_month: testCard.expiry_month.toString().padStart(2, '0'),
      expiry_year: testCard.expiry_year.toString(),
      cvv: testCard.cvv
    });
    setShowTestCards(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'mock_card') {
      const validation = paymentService.validatePaymentForm({
        ...cardDetails,
        card_number: cardDetails.card_number.replace(/\s/g, '')
      });

      if (!validation.valid) {
        validation.errors.forEach(error => {
          if (error.includes('card number')) {
            newErrors.card_number = error;
          } else if (error.includes('expired') || error.includes('expiry')) {
            newErrors.expiry = error;
          } else if (error.includes('security') || error.includes('CVV')) {
            newErrors.cvv = error;
          } else if (error.includes('name')) {
            newErrors.cardholder_name = error;
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const paymentData = {
        amount,
        payment_method: paymentMethod,
        mock_card_details: paymentMethod === 'mock_card' ? {
          ...cardDetails,
          card_number: cardDetails.card_number.replace(/\s/g, ''),
          card_brand: paymentService.getCardBrand(cardDetails.card_number.replace(/\s/g, ''))
        } : {}
      };

      // Simulate payment processing based on selected scenario
      if (selectedScenario !== 'success') {
        await paymentService.simulatePaymentScenario(selectedScenario);
      }

      onPaymentSuccess(paymentData);
    } catch (error) {
      onPaymentError(error.message);
    }
  };

  const getCardBrandIcon = () => {
    const brand = paymentService.getCardBrand(cardDetails.card_number.replace(/\s/g, ''));
    const brandIcons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳'
    };
    return brandIcons[brand] || '💳';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className={`mock-payment bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
        <div className="text-lg font-bold text-blue-600">
          {formatCurrency(amount)}
        </div>
      </div>

      {/* Demo Notice */}
      <Alert 
        type="info" 
        title="Demo Payment System"
        message="This is a demonstration payment system. No real charges will be made."
        className="mb-6"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'mock_card', label: 'Credit Card', icon: '💳' },
              { value: 'mock_paypal', label: 'PayPal', icon: '🅿️' },
              { value: 'mock_bank', label: 'Bank Transfer', icon: '🏦' }
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                  paymentMethod === method.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setPaymentMethod(method.value)}
              >
                <span className="mr-2">{method.icon}</span>
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Test Scenario Selection (Development Only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Scenario (Demo)
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {testScenarios.map(scenario => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name} - {scenario.description}
              </option>
            ))}
          </select>
        </div>

        {/* Card Details (if card payment selected) */}
        {paymentMethod === 'mock_card' && (
          <div className="space-y-4">
            {/* Test Cards Helper */}
            <div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setShowTestCards(!showTestCards)}
              >
                {showTestCards ? 'Hide' : 'Show'} test cards
              </button>
              
              {showTestCards && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-2">Click to use test card:</div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      className="block text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => useTestCard('success')}
                    >
                      ✅ 4242 4242 4242 4242 - Success card
                    </button>
                    <button
                      type="button"
                      className="block text-xs text-red-600 hover:text-red-800"
                      onClick={() => useTestCard('declined')}
                    >
                      ❌ 4000 0000 0000 0002 - Declined card
                    </button>
                    <button
                      type="button"
                      className="block text-xs text-orange-600 hover:text-orange-800"
                      onClick={() => useTestCard('insufficient')}
                    >
                      💸 4000 0000 0000 9995 - Insufficient funds
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardDetails.card_number}
                  onChange={(e) => handleCardDetailsChange('card_number', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.card_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <div className="absolute right-3 top-3 text-lg">
                  {getCardBrandIcon()}
                </div>
              </div>
              {errors.card_number && (
                <p className="text-red-500 text-sm mt-1">{errors.card_number}</p>
              )}
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardDetails.cardholder_name}
                onChange={(e) => handleCardDetailsChange('cardholder_name', e.target.value)}
                placeholder="John Doe"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cardholder_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cardholder_name && (
                <p className="text-red-500 text-sm mt-1">{errors.cardholder_name}</p>
              )}
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <input
                  type="text"
                  value={cardDetails.expiry_month}
                  onChange={(e) => handleCardDetailsChange('expiry_month', e.target.value)}
                  placeholder="12"
                  maxLength={2}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.expiry ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  value={cardDetails.expiry_year}
                  onChange={(e) => handleCardDetailsChange('expiry_year', e.target.value)}
                  placeholder="2027"
                  maxLength={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.expiry ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            {(errors.expiry || errors.cvv) && (
              <p className="text-red-500 text-sm">{errors.expiry || errors.cvv}</p>
            )}
          </div>
        )}

        {/* Other Payment Methods */}
        {paymentMethod === 'mock_paypal' && (
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
            <div className="text-4xl mb-3">🅿️</div>
            <div className="text-lg font-medium text-gray-900 mb-2">PayPal Payment</div>
            <div className="text-sm text-gray-600">
              In a real implementation, this would redirect to PayPal
            </div>
          </div>
        )}

        {paymentMethod === 'mock_bank' && (
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <div className="text-4xl mb-3">🏦</div>
            <div className="text-lg font-medium text-gray-900 mb-2">Bank Transfer</div>
            <div className="text-sm text-gray-600">
              In a real implementation, this would show bank transfer details
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 text-center">
          🔒 This is a secure demo payment system. Your information is safe.
        </div>
      </div>
    </div>
  );
};

export default MockPayment;