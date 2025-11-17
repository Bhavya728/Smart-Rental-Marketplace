import React, { useState, useEffect, useCallback } from 'react';
import { Save, ChevronRight, ChevronLeft, Check, X, AlertTriangle } from 'lucide-react';
import CategorySelector from './CategorySelector';
import ImageUploader from './ImageUploader';
import PricingSection from './PricingSection';
import AvailabilityCalendar from './AvailabilityCalendar';
import Dropdown from '../ui/Dropdown';
import Tag, { FeatureTag } from '../ui/Tag';
import listingService from '../../services/listingService';

const ListingForm = ({
  listing = null,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
  className = ""
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    images: [],
    pricing: {
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      depositsRequired: {
        security: '',
        cleaning: ''
      }
    },
    location: {
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      },
      coordinates: {
        lat: null,
        lng: null
      }
    },
    availability: {
      availableFrom: null,
      availableTo: null
    },
    features: [],
    details: {},
    deliveryOptions: {
      pickup: true,
      delivery: false,
      shipping: false
    },
    rules: []
  });
  const [errors, setErrors] = useState({});
  const [newFeature, setNewFeature] = useState('');
  const [newRule, setNewRule] = useState('');

  const steps = [
    { id: 1, title: 'Category', description: 'What are you renting?' },
    { id: 2, title: 'Details', description: 'Describe your item' },
    { id: 3, title: 'Photos', description: 'Add images' },
    { id: 4, title: 'Location', description: 'Where to pick up' },
    { id: 5, title: 'Pricing', description: 'Set your rates' },
    { id: 6, title: 'Availability', description: 'When is it available?' },
    { id: 7, title: 'Review', description: 'Review and publish' }
  ];

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category || '',
        images: listing.images || [],
        pricing: listing.pricing || formData.pricing,
        location: listing.location || formData.location,
        availability: listing.availability || formData.availability,
        features: listing.features || [],
        details: listing.details || {},
        deliveryOptions: listing.deliveryOptions || formData.deliveryOptions,
        rules: listing.rules || []
      });
    }
  }, [listing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleNestedInputChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleAvailabilityChange = useCallback((availability) => {
    handleInputChange('availability', availability);
  }, []);

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: {
          ...prev.location.address,
          [field]: value
        }
      }
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const handleAddRule = () => {
    if (newRule.trim() && !formData.rules.includes(newRule.trim())) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const handleRemoveRule = (ruleToRemove) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule !== ruleToRemove)
    }));
  };

  const validateStep = (step) => {
    const stepErrors = {};
    
    switch (step) {
      case 1: // Category
        if (!formData.category) {
          stepErrors.category = 'Please select a category';
        }
        break;
        
      case 2: // Details
        if (!formData.title?.trim()) {
          stepErrors.title = 'Title is required';
        } else if (formData.title.length < 10) {
          stepErrors.title = 'Title must be at least 10 characters';
        }
        
        if (!formData.description?.trim()) {
          stepErrors.description = 'Description is required';
        } else if (formData.description.length < 50) {
          stepErrors.description = 'Description must be at least 50 characters';
        }
        break;
        
      case 3: // Photos
        if (!formData.images || formData.images.length === 0) {
          stepErrors.images = 'Please add at least one image';
        }
        break;
        
      case 4: // Location
        if (!formData.location.address.street?.trim()) {
          stepErrors['location.street'] = 'Street address is required';
        }
        if (!formData.location.address.city?.trim()) {
          stepErrors['location.city'] = 'City is required';
        }
        if (!formData.location.address.state?.trim()) {
          stepErrors['location.state'] = 'State is required';
        }
        if (!formData.location.address.zipCode?.trim()) {
          stepErrors['location.zipCode'] = 'ZIP code is required';
        }
        break;
        
      case 5: // Pricing
        if (!formData.pricing.dailyRate || formData.pricing.dailyRate <= 0) {
          stepErrors['pricing.dailyRate'] = 'Daily rate is required';
        }
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    // Validate all steps
    let allValid = true;
    for (let i = 1; i <= 6; i++) {
      if (!validateStep(i)) {
        allValid = false;
        break;
      }
    }

    if (allValid) {
      onSubmit(formData);
    } else {
      // Go back to first invalid step
      for (let i = 1; i <= 6; i++) {
        if (!validateStep(i)) {
          setCurrentStep(i);
          break;
        }
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-12">
      <div className="relative">
        {/* Background Progress Line */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"></div>
        <div 
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        <div className="relative flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center group">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`relative w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 hover:scale-110 ${
                  currentStep === step.id
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : currentStep > step.id
                    ? 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                    : 'border-gray-300 bg-white/80 backdrop-blur-sm text-gray-500 hover:border-gray-400 hover:bg-white'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-6 h-6 animate-pulse" />
                ) : (
                  <span className="font-black">{step.id}</span>
                )}
              </button>
              
              <div className="mt-3 text-center max-w-[120px]">
                <p className={`text-sm font-bold transition-colors duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                    : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className={`text-xs mt-1 transition-colors duration-300 ${
                  currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What are you renting?</h2>
              <p className="text-gray-600">Choose the category that best describes your item.</p>
            </div>
            
            <CategorySelector
              selectedCategory={formData.category}
              onCategoryChange={(category) => handleInputChange('category', category)}
              layout="grid"
              showAllOption={false}
            />
            
            {errors.category && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors.category}</span>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe your item</h2>
              <p className="text-gray-600">Provide clear details to help renters understand what you're offering.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Professional DSLR Camera with Lenses"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100 characters
              </p>
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your item in detail. Include condition, features, what's included, and any special instructions..."
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/2000 characters
              </p>
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features (Optional)
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a feature (e.g., WiFi, GPS, Waterproof)"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <FeatureTag
                      key={index}
                      feature={feature}
                      removable
                      onRemove={() => handleRemoveFeature(feature)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rules & Restrictions (Optional)
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a rule (e.g., No smoking, Must return clean)"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {formData.rules.length > 0 && (
                <div className="space-y-2">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm">{rule}</span>
                      <button
                        onClick={() => handleRemoveRule(rule)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add photos</h2>
              <p className="text-gray-600">Great photos help your listing get noticed and rented faster.</p>
            </div>
            
            <ImageUploader
              images={formData.images}
              onImagesChange={(images) => handleInputChange('images', images)}
              maxImages={10}
            />
            
            {errors.images && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors.images}</span>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Where can renters pick this up?</h2>
              <p className="text-gray-600">Provide the pickup location for your item.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.location.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
                {errors['location.street'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['location.street']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.location.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="San Francisco"
                />
                {errors['location.city'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['location.city']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.location.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="CA"
                />
                {errors['location.state'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['location.state']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.location.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="94105"
                />
                {errors['location.zipCode'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['location.zipCode']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.location.address.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <PricingSection
              pricing={formData.pricing}
              onPricingChange={(pricing) => handleInputChange('pricing', pricing)}
              category={formData.category}
              showAdvanced={true}
            />
            
            {errors['pricing.dailyRate'] && (
              <div className="flex items-center space-x-2 text-red-600 text-sm mt-4">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors['pricing.dailyRate']}</span>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div>
            <AvailabilityCalendar
              availableFrom={formData.availability.availableFrom}
              availableTo={formData.availability.availableTo}
              onAvailabilityChange={handleAvailabilityChange}
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review your listing</h2>
              <p className="text-gray-600">Make sure everything looks good before publishing.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              {/* Preview similar to ListingCard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {formData.images.length > 0 && (
                    <img
                      src={formData.images[0].url || formData.images[0].secureUrl}
                      alt={formData.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{formData.title}</h3>
                    <p className="text-gray-600">{formData.category}</p>
                  </div>
                  
                  <p className="text-gray-700 line-clamp-3">{formData.description}</p>
                  
                  <div className="text-lg font-bold text-gray-900">
                    {listingService.formatPrice(formData.pricing.dailyRate, 'day')}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    📍 {formData.location.address.city}, {formData.location.address.state}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Before you publish</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Make sure your photos are clear, your description is accurate, and your pricing is competitive. 
                    You can always edit your listing after publishing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-400/20 to-orange-600/20 blur-3xl"></div>
      </div>

      {renderStepIndicator()}
      
      {/* Enhanced Form Container */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur opacity-60"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 min-h-[600px]">
          {renderStep()}
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="group flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-all duration-300 rounded-xl hover:bg-white/80 backdrop-blur-sm border border-transparent hover:border-white/20 hover:shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-semibold">{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
        </button>

        <div className="flex space-x-4">
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="group flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
            >
              <span className="font-semibold">Next</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-semibold">{loading ? 'Publishing...' : isEditing ? 'Update Listing' : 'Publish Listing'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingForm;