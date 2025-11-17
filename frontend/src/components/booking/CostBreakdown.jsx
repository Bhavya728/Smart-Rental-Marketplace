import React, { useState } from 'react';

const CostBreakdown = ({ 
  costData, 
  isLoading = false, 
  showAnimation = true,
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className={`cost-breakdown bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!costData || costData.nights <= 0) {
    return null;
  }

  const {
    nights = 0,
    basePrice = 0,
    cleaningFee = 0,
    serviceFee = 0,
    taxAmount = 0,
    totalCost = 0,
    pricePerNight = 0
  } = costData;

  const breakdownItems = [
    {
      label: `${formatCurrency(pricePerNight || (basePrice / nights))} × ${nights} night${nights !== 1 ? 's' : ''}`,
      amount: basePrice,
      type: 'base'
    },
    ...(cleaningFee > 0 ? [{
      label: 'Cleaning fee',
      amount: cleaningFee,
      type: 'fee'
    }] : []),
    {
      label: 'Service fee',
      amount: serviceFee,
      type: 'fee'
    },
    {
      label: 'Taxes & fees',
      amount: taxAmount,
      type: 'tax'
    }
  ];

  return (
    <div className={`cost-breakdown bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-gray-900">Cost breakdown</h3>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Breakdown Details */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {breakdownItems.map((item, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center text-sm ${
                  showAnimation ? 'animate-fade-in' : ''
                }`}
                style={{
                  animationDelay: showAnimation ? `${index * 100}ms` : '0ms'
                }}
              >
                <span className="text-gray-600 flex items-center">
                  {item.label}
                  {item.type === 'fee' && (
                    <button
                      type="button"
                      className="ml-1 text-gray-400 hover:text-gray-600"
                      title="More information"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </span>
                <span className="font-medium text-gray-900">
                  {item.amount > 0 ? formatCurrency(item.amount) : 'Free'}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className={`flex justify-between items-center ${showAnimation ? 'animate-fade-in' : ''}`}>
              <span className="font-semibold text-gray-900">Total (USD)</span>
              <span className="font-bold text-lg text-gray-900">
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>

          {/* Savings Badge (if applicable) */}
          {costData.savings && costData.savings > 0 && (
            <div className={`mt-3 p-2 bg-green-50 rounded-md border border-green-200 ${showAnimation ? 'animate-fade-in' : ''}`}>
              <div className="flex items-center text-sm text-green-700">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You're saving {formatCurrency(costData.savings)}!
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="text-xs text-blue-700">
              <div className="font-medium mb-1">Payment information</div>
              <div>• No payment required to reserve</div>
              <div>• Payment processed after host confirmation</div>
              <div>• Full refund if cancelled within 24 hours</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default CostBreakdown;