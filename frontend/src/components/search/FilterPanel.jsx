import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';
import RangeSlider from '../ui/RangeSlider';
import Checkbox from '../ui/Checkbox';
import Radio from '../ui/Radio';
import { cn } from '../../utils/cn';
import searchService from '../../services/searchService';
import listingService from '../../services/listingService';

const FilterPanel = ({ 
  filters, 
  onChange, 
  onClear,
  className = "",
  isCollapsed = false,
  onToggle
}) => {
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000, avg: 50 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    location: false,
    features: false,
  });

  useEffect(() => {
    loadCategories();
    loadPriceRange();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await searchService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPriceRange = async () => {
    try {
      const response = await searchService.getPriceRange();
      if (response.data) {
        setPriceRange(response.data);
      }
    } catch (error) {
      console.error('Error loading price range:', error);
    }
  };

  const handlePriceChange = (newRange) => {
    onChange({
      ...filters,
      minPrice: newRange[0],
      maxPrice: newRange[1]
    });
  };

  const handleCategoryChange = (category) => {
    onChange({
      ...filters,
      category: filters.category === category ? '' : category
    });
  };

  const handleFeatureToggle = (feature) => {
    const currentFeatures = filters.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    onChange({
      ...filters,
      features: newFeatures
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasActiveFilters = () => {
    return filters.category || 
           (filters.minPrice && filters.minPrice > priceRange.min) ||
           (filters.maxPrice && filters.maxPrice < priceRange.max) ||
           (filters.features && filters.features.length > 0) ||
           filters.location;
  };

  const commonFeatures = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'parking', label: 'Parking' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'washer', label: 'Washer' },
    { value: 'air_conditioning', label: 'Air Conditioning' },
    { value: 'heating', label: 'Heating' },
    { value: 'tv', label: 'TV' },
    { value: 'workspace', label: 'Workspace' },
  ];

  const FilterSection = ({ title, isExpanded, onToggle, children, count }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 text-left hover:bg-gray-50 transition-colors duration-200 min-h-[44px] touch-manipulation"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} filter section`}
      >
        <div className="flex items-center">
          <span className="font-medium text-gray-900 text-sm sm:text-base">{title}</span>
          {count && count > 0 && (
            <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-3 sm:pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isCollapsed) {
    return (
      <div className={cn("lg:hidden", className)}>
        <Button
          onClick={onToggle}
          variant="outline"
          className="w-full flex items-center justify-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters() && (
            <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
              {[
                filters.category,
                filters.minPrice && filters.minPrice > priceRange.min,
                filters.maxPrice && filters.maxPrice < priceRange.max,
                filters.features && filters.features.length
              ].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
        className
      )}
    >
      {/* Enhanced Mobile-Responsive Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Filters
        </h3>
        
        {hasActiveFilters() && (
          <Button
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 min-h-[40px] px-3 sm:px-4"
          >
            <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Clear</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection
        title="Category"
        isExpanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
        count={filters.category ? 1 : 0}
      >
        <div className="space-y-3">
          <Radio
            id="category-all"
            name="category"
            value=""
            checked={!filters.category}
            onChange={() => handleCategoryChange('')}
            label="All Categories"
          />
          {categories.slice(0, 10).map((cat) => (
            <Radio
              key={cat.name}
              id={`category-${cat.name}`}
              name="category"
              value={cat.name}
              checked={filters.category === cat.name}
              onChange={() => handleCategoryChange(cat.name)}
              label={
                <div className="flex items-center justify-between w-full">
                  <span className="capitalize">{cat.name}</span>
                  <span className="text-sm text-gray-500">({cat.count})</span>
                </div>
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection
        title="Price Range"
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
        count={
          (filters.minPrice && filters.minPrice > priceRange.min) ||
          (filters.maxPrice && filters.maxPrice < priceRange.max) ? 1 : 0
        }
      >
        <div className="space-y-4">
          <RangeSlider
            min={priceRange.min || 0}
            max={priceRange.max || 1000}
            value={[
              filters.minPrice || priceRange.min || 0,
              filters.maxPrice || priceRange.max || 1000
            ]}
            onChange={handlePriceChange}
            step={5}
            formatValue={formatPrice}
            label="Daily Rate"
          />
        </div>
      </FilterSection>

      {/* Enhanced Features Filter with Mobile-Responsive Grid */}
      <FilterSection
        title="Features"
        isExpanded={expandedSections.features}
        onToggle={() => toggleSection('features')}
        count={filters.features?.length || 0}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {commonFeatures.map((feature) => (
            <Checkbox
              key={feature.value}
              id={`feature-${feature.value}`}
              checked={filters.features?.includes(feature.value) || false}
              onChange={() => handleFeatureToggle(feature.value)}
              label={feature.label}
              className="min-h-[44px] touch-manipulation"
            />
          ))}
        </div>
      </FilterSection>

      {/* Enhanced Mobile Apply Button */}
      <div className="lg:hidden p-4 sm:p-6 border-t border-gray-200">
        <Button
          onClick={onToggle}
          className="w-full min-h-[48px] text-base font-medium"
          size="lg"
        >
          Apply Filters {hasActiveFilters() && `(${Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length})`}
        </Button>
      </div>
    </motion.div>
  );
};

export default React.memo(FilterPanel);