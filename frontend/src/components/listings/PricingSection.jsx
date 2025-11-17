import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Calendar, Percent, Info } from 'lucide-react';
import Switch from '../ui/Switch';

const PricingSection = ({
  pricing = {
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    depositsRequired: {
      security: '',
      cleaning: ''
    }
  },
  onPricingChange,
  showAdvanced = false,
  category = '',
  className = ""
}) => {
  const [localPricing, setLocalPricing] = useState(pricing);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [showDeposits, setShowDeposits] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    setLocalPricing(pricing);
  }, [pricing]);

  const handlePricingUpdate = (updatedPricing) => {
    setLocalPricing(updatedPricing);
    onPricingChange(updatedPricing);
  };

  const handleDailyRateChange = (e) => {
    const dailyRate = parseFloat(e.target.value) || 0;
    const updatedPricing = { ...localPricing, dailyRate };

    if (autoCalculate && dailyRate > 0) {
      // Auto-calculate weekly and monthly rates with discounts
      updatedPricing.weeklyRate = Math.round(dailyRate * 6.5 * 100) / 100; // 7.5% weekly discount
      updatedPricing.monthlyRate = Math.round(dailyRate * 25 * 100) / 100; // 17% monthly discount
    }

    handlePricingUpdate(updatedPricing);
  };

  const handleWeeklyRateChange = (e) => {
    const weeklyRate = parseFloat(e.target.value) || '';
    handlePricingUpdate({
      ...localPricing,
      weeklyRate
    });
  };

  const handleMonthlyRateChange = (e) => {
    const monthlyRate = parseFloat(e.target.value) || '';
    handlePricingUpdate({
      ...localPricing,
      monthlyRate
    });
  };

  const handleDepositChange = (type, value) => {
    const updatedPricing = {
      ...localPricing,
      depositsRequired: {
        ...localPricing.depositsRequired,
        [type]: parseFloat(value) || ''
      }
    };
    handlePricingUpdate(updatedPricing);
  };

  const getSuggestedPricing = () => {
    // Category-based pricing suggestions
    const suggestions = {
      // Electronics
      'laptop': { daily: 25, security: 200 },
      'camera': { daily: 15, security: 150 },
      'gaming-console': { daily: 12, security: 100 },
      'tablet': { daily: 8, security: 50 },
      
      // Vehicles
      'car': { daily: 45, security: 300 },
      'bicycle': { daily: 8, security: 25 },
      'motorcycle': { daily: 35, security: 200 },
      
      // Tools
      'power-tools': { daily: 15, security: 100 },
      'construction-tools': { daily: 20, security: 150 },
      
      // Sports
      'sports-gear': { daily: 10, security: 50 },
      'fitness-equipment': { daily: 12, security: 75 },
      
      // Default
      'default': { daily: 15, security: 100 }
    };

    return suggestions[category] || suggestions['default'];
  };

  const applySuggestedPricing = () => {
    const suggested = getSuggestedPricing();
    const updatedPricing = {
      ...localPricing,
      dailyRate: suggested.daily,
      weeklyRate: Math.round(suggested.daily * 6.5 * 100) / 100,
      monthlyRate: Math.round(suggested.daily * 25 * 100) / 100,
      depositsRequired: {
        ...localPricing.depositsRequired,
        security: suggested.security
      }
    };
    handlePricingUpdate(updatedPricing);
  };

  const calculateStats = () => {
    if (!localPricing.dailyRate) return null;

    const daily = parseFloat(localPricing.dailyRate);
    const weekly = parseFloat(localPricing.weeklyRate) || daily * 7;
    const monthly = parseFloat(localPricing.monthlyRate) || daily * 30;

    const weeklyDiscount = weekly < daily * 7 ? ((daily * 7 - weekly) / (daily * 7)) * 100 : 0;
    const monthlyDiscount = monthly < daily * 30 ? ((daily * 30 - monthly) / (daily * 30)) * 100 : 0;

    return {
      weeklyDiscount: Math.round(weeklyDiscount * 10) / 10,
      monthlyDiscount: Math.round(monthlyDiscount * 10) / 10,
      weeklyEquivalent: Math.round((weekly / 7) * 100) / 100,
      monthlyEquivalent: Math.round((monthly / 30) * 100) / 100
    };
  };

  const stats = calculateStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-slide-in-left">
            Pricing
          </h3>
          <p className="text-lg font-semibold text-gray-600 mt-2 animate-slide-in-left delay-100">
            Set your rental rates and deposits
          </p>
        </div>
        
        {showAdvanced && (
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover-lift animate-fade-in delay-200"
          >
            <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold">Calculator</span>
          </button>
        )}
      </div>

      {/* Pricing Calculator */}
      {showCalculator && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-2xl p-6 space-y-4 shadow-lg animate-slide-in-down">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-blue-900">Pricing Helper</h4>
            <Switch
              checked={autoCalculate}
              onChange={setAutoCalculate}
              size="sm"
              label="Auto-calculate"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-800 font-medium mb-1">Suggested for {category || 'this category'}:</p>
              <p className="text-blue-700">Daily: ${getSuggestedPricing().daily}</p>
              <p className="text-blue-700">Security: ${getSuggestedPricing().security}</p>
            </div>
            <div>
              <button
                onClick={applySuggestedPricing}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors hover-lift"
              >
                Use Suggested Pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in delay-300">
        {/* Daily Rate */}
        <div className="animate-slide-in-up delay-100">
          <label className="block text-lg font-bold text-gray-900 mb-3">
            Daily Rate *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={localPricing.dailyRate}
              onChange={handleDailyRateChange}
              className="w-full pl-16 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 shadow-lg text-gray-900 placeholder-gray-500 font-semibold text-lg hover-lift focus:scale-[1.02]"
              placeholder="25.00"
              required
            />
          </div>
          <p className="text-sm font-medium text-blue-700 mt-2">Base rate per day</p>
        </div>

        {/* Weekly Rate */}
        <div className="animate-slide-in-up delay-200">
          <label className="block text-lg font-bold text-gray-900 mb-3">
            Weekly Rate
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={localPricing.weeklyRate}
              onChange={handleWeeklyRateChange}
              className={`w-full pl-16 pr-6 py-4 border-2 rounded-xl focus:ring-2 transition-all duration-300 shadow-lg font-semibold text-lg hover-lift ${
                autoCalculate 
                  ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-white/80 backdrop-blur-sm border-white/20 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 focus:scale-[1.02]'
              }`}
              placeholder="160.00"
              disabled={autoCalculate}
            />
          </div>
          {stats && (
            <div className="mt-2 p-3 bg-green-100 rounded-lg border border-green-200 animate-scale-in">
              <p className="text-sm font-bold text-green-800">
                ${stats.weeklyEquivalent}/day • {stats.weeklyDiscount > 0 && (
                  <span className="text-green-600">{stats.weeklyDiscount}% discount</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Monthly Rate */}
        <div className="animate-slide-in-up delay-300">
          <label className="block text-lg font-bold text-gray-900 mb-3">
            Monthly Rate
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={localPricing.monthlyRate}
              onChange={handleMonthlyRateChange}
              className={`w-full pl-16 pr-6 py-4 border-2 rounded-xl focus:ring-2 transition-all duration-300 shadow-lg font-semibold text-lg hover-lift ${
                autoCalculate 
                  ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-white/80 backdrop-blur-sm border-white/20 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 focus:scale-[1.02]'
              }`}
              placeholder="625.00"
              disabled={autoCalculate}
            />
          </div>
          {stats && (
            <div className="mt-2 p-3 bg-purple-100 rounded-lg border border-purple-200 animate-scale-in">
              <p className="text-sm font-bold text-purple-800">
                ${stats.monthlyEquivalent}/day • {stats.monthlyDiscount > 0 && (
                  <span className="text-purple-600">{stats.monthlyDiscount}% discount</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Deposits Section */}
      <div className="relative animate-fade-in delay-500">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-3xl blur opacity-60"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">🛡️</span>
              </div>
              <h4 className="text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Deposits</h4>
            </div>
            <Switch
              checked={showDeposits}
              onChange={setShowDeposits}
              size="lg"
              label="Require deposits"
            />
          </div>

          {showDeposits && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-in-up">
              {/* Security Deposit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localPricing.depositsRequired?.security || ''}
                    onChange={(e) => handleDepositChange('security', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover-lift"
                    placeholder="100.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Refundable if no damage</p>
              </div>

              {/* Cleaning Deposit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cleaning Deposit (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localPricing.depositsRequired?.cleaning || ''}
                    onChange={(e) => handleDepositChange('cleaning', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover-lift"
                    placeholder="25.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">For items requiring cleaning</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      {localPricing.dailyRate && (
        <div className="relative animate-fade-in delay-700">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 rounded-3xl blur opacity-60"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pricing Summary</h4>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50 hover-lift">
                <p className="text-blue-700 font-bold text-sm mb-1">Daily Rate</p>
                <p className="text-2xl font-black text-blue-900">${localPricing.dailyRate}</p>
              </div>
            
              {localPricing.weeklyRate && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200/50 hover-lift">
                  <p className="text-green-700 font-bold text-sm mb-1">Weekly Rate</p>
                  <p className="text-2xl font-black text-green-900">
                    ${localPricing.weeklyRate}
                    {stats?.weeklyDiscount > 0 && (
                      <span className="text-green-600 text-sm ml-1">(-{stats.weeklyDiscount}%)</span>
                    )}
                  </p>
                </div>
              )}
            
              {localPricing.monthlyRate && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50 hover-lift">
                  <p className="text-purple-700 font-bold text-sm mb-1">Monthly Rate</p>
                  <p className="text-2xl font-black text-purple-900">
                    ${localPricing.monthlyRate}
                    {stats?.monthlyDiscount > 0 && (
                      <span className="text-purple-600 text-sm ml-1">(-{stats.monthlyDiscount}%)</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {showDeposits && (localPricing.depositsRequired?.security || localPricing.depositsRequired?.cleaning) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 font-medium mb-3">Required Deposits</p>
                <div className="flex space-x-4 text-sm">
                  {localPricing.depositsRequired.security && (
                    <div className="px-3 py-2 bg-orange-100 rounded-lg">
                      <span className="font-medium">Security: ${localPricing.depositsRequired.security}</span>
                    </div>
                  )}
                  {localPricing.depositsRequired.cleaning && (
                    <div className="px-3 py-2 bg-blue-100 rounded-lg">
                      <span className="font-medium">Cleaning: ${localPricing.depositsRequired.cleaning}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-2xl p-6 shadow-lg hover-lift animate-fade-in delay-800">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">💡</span>
          </div>
          <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pricing Tips</h4>
        </div>
        <ul className="space-y-3">
          <li className="flex items-start animate-slide-in-right delay-100">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2 flex-shrink-0"></span>
            <span className="text-blue-800 font-medium">Research similar items in your area to set competitive prices</span>
          </li>
          <li className="flex items-start animate-slide-in-right delay-200">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-3 mt-2 flex-shrink-0"></span>
            <span className="text-blue-800 font-medium">Offer weekly/monthly discounts to encourage longer rentals</span>
          </li>
          <li className="flex items-start animate-slide-in-right delay-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2 flex-shrink-0"></span>
            <span className="text-blue-800 font-medium">Set security deposits to protect against damage or theft</span>
          </li>
          <li className="flex items-start animate-slide-in-right delay-400">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-3 mt-2 flex-shrink-0"></span>
            <span className="text-blue-800 font-medium">Consider the item's value, condition, and replacement cost</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PricingSection;