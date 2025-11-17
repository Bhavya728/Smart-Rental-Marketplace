import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, DollarSign, Calendar, Wifi, Car, Coffee, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

const QuickFilters = ({
  category,
  onFilterSelect,
  activeFilters = {},
  className = ""
}) => {

  // Base filters that apply to all categories
  const baseFilters = [
    {
      id: 'price_low',
      label: 'Under $50',
      icon: DollarSign,
      action: () => onFilterSelect('maxPrice', 50),
      isActive: activeFilters.maxPrice === 50
    },
    {
      id: 'highly_rated',
      label: 'Highly Rated',
      icon: Star,
      action: () => onFilterSelect('minRating', 4.5),
      isActive: activeFilters.minRating === 4.5
    },
    {
      id: 'available_today',
      label: 'Available Today',
      icon: Calendar,
      action: () => onFilterSelect('availableToday', true),
      isActive: activeFilters.availableToday === true
    },
    {
      id: 'instant_book',
      label: 'Instant Book',
      icon: Zap,
      action: () => onFilterSelect('instantBook', true),
      isActive: activeFilters.instantBook === true
    }
  ];

  // Category-specific filters
  const categoryFilters = {
    'electronics': [
      {
        id: 'wifi_included',
        label: 'WiFi Ready',
        icon: Wifi,
        action: () => onFilterSelect('features', ['wifi']),
        isActive: activeFilters.features?.includes('wifi')
      },
      {
        id: 'accessories_included',
        label: 'Accessories Included',
        icon: Coffee,
        action: () => onFilterSelect('accessoriesIncluded', true),
        isActive: activeFilters.accessoriesIncluded === true
      }
    ],
    'vehicles': [
      {
        id: 'free_parking',
        label: 'Parking Included',
        icon: Car,
        action: () => onFilterSelect('features', ['parking']),
        isActive: activeFilters.features?.includes('parking')
      },
      {
        id: 'fuel_efficient',
        label: 'Fuel Efficient',
        icon: Zap,
        action: () => onFilterSelect('fuelEfficient', true),
        isActive: activeFilters.fuelEfficient === true
      }
    ],
    'tools': [
      {
        id: 'professional_grade',
        label: 'Professional Grade',
        icon: Star,
        action: () => onFilterSelect('professionalGrade', true),
        isActive: activeFilters.professionalGrade === true
      },
      {
        id: 'safety_gear_included',
        label: 'Safety Gear Included',
        icon: Coffee,
        action: () => onFilterSelect('safetyGearIncluded', true),
        isActive: activeFilters.safetyGearIncluded === true
      }
    ],
    'furniture': [
      {
        id: 'delivery_available',
        label: 'Delivery Available',
        icon: Car,
        action: () => onFilterSelect('deliveryAvailable', true),
        isActive: activeFilters.deliveryAvailable === true
      },
      {
        id: 'assembly_included',
        label: 'Setup Included',
        icon: Coffee,
        action: () => onFilterSelect('assemblyIncluded', true),
        isActive: activeFilters.assemblyIncluded === true
      }
    ],
    'sports': [
      {
        id: 'equipment_included',
        label: 'Equipment Included',
        icon: Coffee,
        action: () => onFilterSelect('equipmentIncluded', true),
        isActive: activeFilters.equipmentIncluded === true
      },
      {
        id: 'beginner_friendly',
        label: 'Beginner Friendly',
        icon: Star,
        action: () => onFilterSelect('beginnerFriendly', true),
        isActive: activeFilters.beginnerFriendly === true
      }
    ]
  };

  // Price range filters
  const priceFilters = [
    {
      id: 'budget',
      label: '$0 - $25',
      icon: DollarSign,
      action: () => onFilterSelect('priceRange', { min: 0, max: 25 }),
      isActive: activeFilters.minPrice === 0 && activeFilters.maxPrice === 25
    },
    {
      id: 'moderate',
      label: '$25 - $75',
      icon: DollarSign,
      action: () => onFilterSelect('priceRange', { min: 25, max: 75 }),
      isActive: activeFilters.minPrice === 25 && activeFilters.maxPrice === 75
    },
    {
      id: 'premium',
      label: '$75+',
      icon: DollarSign,
      action: () => onFilterSelect('minPrice', 75),
      isActive: activeFilters.minPrice === 75 && !activeFilters.maxPrice
    }
  ];

  // Location-based filters (these would be dynamic based on popular locations)
  const locationFilters = [
    {
      id: 'nearby',
      label: 'Within 5 miles',
      icon: MapPin,
      action: () => onFilterSelect('radius', 5),
      isActive: activeFilters.radius === 5
    },
    {
      id: 'city_center',
      label: 'City Center',
      icon: MapPin,
      action: () => onFilterSelect('location', 'city_center'),
      isActive: activeFilters.location === 'city_center'
    },
    {
      id: 'suburbs',
      label: 'Suburbs',
      icon: MapPin,
      action: () => onFilterSelect('location', 'suburbs'),
      isActive: activeFilters.location === 'suburbs'
    }
  ];

  // Combine all filters
  const allFilters = [
    ...baseFilters,
    ...priceFilters,
    ...(categoryFilters[category] || []),
    ...locationFilters
  ];

  // Filter out inactive filters and show only relevant ones
  const displayFilters = allFilters.filter((filter, index) => {
    // Always show first 8 filters
    if (index < 8) return true;
    
    // Show active filters beyond the first 8
    return filter.isActive;
  });

  const handleFilterClick = (filter) => {
    if (filter.isActive) {
      // Remove filter - this would need more complex logic to properly clear the specific filter
      // For now, we'll just call the action which might toggle it
    }
    filter.action();
  };

  if (displayFilters.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {displayFilters.map((filter) => {
        const Icon = filter.icon;
        
        return (
          <motion.button
            key={filter.id}
            onClick={() => handleFilterClick(filter)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              filter.isActive
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            )}
          >
            <Icon className="w-4 h-4 mr-2" />
            {filter.label}
          </motion.button>
        );
      })}

      {/* Show more filters button if there are many */}
      {allFilters.length > displayFilters.length && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-gray-500 border border-gray-300 hover:bg-gray-50"
        >
          +{allFilters.length - displayFilters.length} more
        </motion.button>
      )}
    </motion.div>
  );
};

export default QuickFilters;