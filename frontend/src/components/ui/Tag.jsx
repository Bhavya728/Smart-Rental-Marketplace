import React from 'react';
import { X } from 'lucide-react';

const Tag = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  removable = false,
  onRemove,
  onClick,
  className = "",
  ...props 
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full transition-colors";
  
  const variants = {
    default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    primary: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    success: "bg-green-100 text-green-800 hover:bg-green-200",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    danger: "bg-red-100 text-red-800 hover:bg-red-200",
    info: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    dark: "bg-gray-800 text-gray-100 hover:bg-gray-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    'outline-primary': "border border-blue-300 text-blue-700 hover:bg-blue-50",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm", 
    lg: "px-4 py-2 text-base",
  };

  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.md;

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(e);
    }
  };

  const classes = `${baseClasses} ${variantClass} ${sizeClass} ${
    onClick ? 'cursor-pointer' : ''
  } ${className}`;

  return (
    <span
      className={classes}
      onClick={handleClick}
      {...props}
    >
      <span className={removable ? 'mr-1' : ''}>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 -mr-1 p-0.5 hover:bg-black/10 rounded-full transition-colors"
          aria-label="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

// Predefined tag components for common use cases
export const CategoryTag = ({ category, ...props }) => {
  const getCategoryColor = (cat) => {
    const colors = {
      // Properties
      'apartment': 'primary',
      'house': 'primary', 
      'condo': 'primary',
      'studio': 'primary',
      'room': 'primary',
      'office': 'info',
      'warehouse': 'info',
      'commercial': 'info',
      'land': 'success',
      'parking': 'default',
      'storage': 'default',
      
      // Electronics
      'laptop': 'dark',
      'desktop': 'dark',
      'tablet': 'dark',
      'smartphone': 'dark',
      'camera': 'dark',
      'audio-equipment': 'dark',
      'gaming-console': 'dark',
      'tv-monitor': 'dark',
      
      // Vehicles
      'car': 'danger',
      'motorcycle': 'danger',
      'bicycle': 'success',
      'scooter': 'success',
      'boat': 'info',
      'rv-camper': 'warning',
      
      // Sports
      'fitness-equipment': 'success',
      'sports-gear': 'success',
      'outdoor-gear': 'success',
      'musical-instrument': 'primary',
      
      // Tools
      'construction-tools': 'warning',
      'garden-tools': 'success',
      'power-tools': 'warning',
      'machinery': 'danger',
      
      // Fashion
      'clothing': 'primary',
      'shoes': 'primary',
      'jewelry': 'warning',
      'bags': 'primary',
      
      // Other
      'other': 'default'
    };
    
    return colors[cat] || 'default';
  };
  
  return (
    <Tag variant={getCategoryColor(category)} {...props}>
      {category}
    </Tag>
  );
};

export const StatusTag = ({ status, ...props }) => {
  const getStatusVariant = (status) => {
    const variants = {
      active: 'success',
      draft: 'default',
      rented: 'info',
      paused: 'warning',
      archived: 'danger',
    };
    return variants[status] || 'default';
  };

  return (
    <Tag variant={getStatusVariant(status)} {...props}>
      {status}
    </Tag>
  );
};

export const PriceTag = ({ price, period = 'day', ...props }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Tag variant="success" {...props}>
      {formatPrice(price)}/{period}
    </Tag>
  );
};

export const FeatureTag = ({ feature, ...props }) => {
  return (
    <Tag variant="outline" size="sm" {...props}>
      {feature}
    </Tag>
  );
};

export default Tag;