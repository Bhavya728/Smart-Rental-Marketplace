import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

// Base Badge Component
const Badge = forwardRef(({ 
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props 
}, ref) => {
  
  const baseStyles = 'inline-flex items-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 shadow-sm hover:shadow-md backdrop-blur-sm';
  
  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs min-h-[20px]',
    sm: 'px-3 py-1.5 text-xs min-h-[24px]',
    md: 'px-4 py-2 text-sm min-h-[28px]',
    lg: 'px-5 py-2.5 text-sm min-h-[32px]',
    xl: 'px-6 py-3 text-base min-h-[36px]'
  };
  
  const variantStyles = {
    // Default variants with modern styling
    default: 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 focus:ring-gray-500/30 shadow-gray-200/40',
    'default-outline': 'border-2 border-gray-300/60 text-gray-700 bg-white/80 backdrop-blur-sm focus:ring-gray-500/20 hover:border-gray-400',
    
    // Primary variants with gradients
    primary: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 focus:ring-blue-500/30 shadow-blue-200/40',
    'primary-solid': 'bg-gradient-to-r from-blue-600 to-blue-700 text-white focus:ring-blue-500/30 shadow-blue-500/30',
    'primary-outline': 'border-2 border-blue-300/70 text-blue-700 bg-blue-50/50 backdrop-blur-sm focus:ring-blue-500/20 hover:border-blue-400',
    
    // Secondary variants with gradients
    secondary: 'bg-gradient-to-r from-gray-100 to-slate-50 text-gray-700 focus:ring-gray-500/30 shadow-gray-200/40',
    'secondary-solid': 'bg-gradient-to-r from-gray-600 to-gray-700 text-white focus:ring-gray-500/30 shadow-gray-500/30',
    'secondary-outline': 'border-2 border-gray-300/70 text-gray-600 bg-gray-50/50 backdrop-blur-sm focus:ring-gray-500/20 hover:border-gray-400',
    
    // Success variants with gradients
    success: 'bg-gradient-to-r from-emerald-100 to-green-50 text-emerald-800 focus:ring-emerald-500/30 shadow-emerald-200/40',
    'success-solid': 'bg-gradient-to-r from-emerald-600 to-green-600 text-white focus:ring-emerald-500/30 shadow-emerald-500/30',
    'success-outline': 'border-2 border-emerald-300/70 text-emerald-700 bg-emerald-50/50 backdrop-blur-sm focus:ring-emerald-500/20 hover:border-emerald-400',
    
    // Warning variants with gradients
    warning: 'bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-800 focus:ring-amber-500/30 shadow-amber-200/40',
    'warning-solid': 'bg-gradient-to-r from-amber-500 to-orange-500 text-white focus:ring-amber-500/30 shadow-amber-500/30',
    'warning-outline': 'border-2 border-amber-300/70 text-amber-700 bg-amber-50/50 backdrop-blur-sm focus:ring-amber-500/20 hover:border-amber-400',
    
    // Danger variants with gradients
    danger: 'bg-gradient-to-r from-red-100 to-rose-50 text-red-800 focus:ring-red-500/30 shadow-red-200/40',
    'danger-solid': 'bg-gradient-to-r from-red-600 to-rose-600 text-white focus:ring-red-500/30 shadow-red-500/30',
    'danger-outline': 'border-2 border-red-300/70 text-red-700 bg-red-50/50 backdrop-blur-sm focus:ring-red-500/20 hover:border-red-400',
    
    // Info variants with gradients
    info: 'bg-gradient-to-r from-sky-100 to-blue-50 text-sky-800 focus:ring-sky-500/30 shadow-sky-200/40',
    'info-solid': 'bg-gradient-to-r from-sky-500 to-blue-500 text-white focus:ring-sky-400/30 shadow-sky-500/30',
    'info-outline': 'border-2 border-sky-300/70 text-sky-600 bg-sky-50/50 backdrop-blur-sm focus:ring-sky-400/20 hover:border-sky-400',
    
    // Special variants
    gradient: 'bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 text-white focus:ring-purple-500/30 shadow-purple-500/40',
    'gradient-warm': 'bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 text-white focus:ring-pink-500/30 shadow-pink-500/40',
    'gradient-cool': 'bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white focus:ring-blue-500/30 shadow-blue-500/40',
    dark: 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 focus:ring-gray-700/30 shadow-gray-900/40',
    light: 'bg-gradient-to-r from-white to-gray-50 text-gray-800 border border-gray-200/60 focus:ring-gray-500/20 shadow-white/60',
    glass: 'bg-white/20 backdrop-blur-xl border border-white/30 text-gray-800 focus:ring-white/20 shadow-white/20'
  };
  
  const badgeStyles = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  return (
    <span
      className={badgeStyles}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

// Status Badge Component
export const StatusBadge = ({ status, size = 'md', className, ...props }) => {
  const statusConfig = {
    active: { variant: 'success', text: 'Active' },
    inactive: { variant: 'secondary', text: 'Inactive' },
    pending: { variant: 'warning', text: 'Pending' },
    suspended: { variant: 'danger', text: 'Suspended' },
    draft: { variant: 'secondary-outline', text: 'Draft' },
    published: { variant: 'success', text: 'Published' },
    archived: { variant: 'secondary', text: 'Archived' },
    verified: { variant: 'success-solid', text: 'Verified' },
    unverified: { variant: 'danger-outline', text: 'Unverified' },
    approved: { variant: 'success', text: 'Approved' },
    rejected: { variant: 'danger', text: 'Rejected' },
    processing: { variant: 'warning', text: 'Processing' },
    completed: { variant: 'success-solid', text: 'Completed' },
    failed: { variant: 'danger-solid', text: 'Failed' },
    cancelled: { variant: 'secondary', text: 'Cancelled' }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Badge 
      variant={config.variant} 
      size={size} 
      className={className}
      {...props}
    >
      {config.text}
    </Badge>
  );
};

// Role Badge Component
export const RoleBadge = ({ role, size = 'md', className, ...props }) => {
  const roleConfig = {
    admin: { variant: 'danger-solid', text: 'Admin' },
    moderator: { variant: 'warning-solid', text: 'Moderator' },
    user: { variant: 'primary', text: 'User' },
    guest: { variant: 'secondary', text: 'Guest' },
    owner: { variant: 'success-solid', text: 'Owner' },
    renter: { variant: 'info', text: 'Renter' },
    both: { variant: 'gradient', text: 'Owner & Renter' },
    editor: { variant: 'info-solid', text: 'Editor' },
    viewer: { variant: 'secondary-outline', text: 'Viewer' },
    contributor: { variant: 'primary-outline', text: 'Contributor' }
  };

  const config = roleConfig[role] || roleConfig.user;

  return (
    <Badge 
      variant={config.variant} 
      size={size} 
      className={className}
      {...props}
    >
      {config.text}
    </Badge>
  );
};

// Priority Badge Component
export const PriorityBadge = ({ priority, size = 'md', className, ...props }) => {
  const priorityConfig = {
    low: { variant: 'success-outline', text: 'Low' },
    medium: { variant: 'warning', text: 'Medium' },
    high: { variant: 'danger', text: 'High' },
    urgent: { variant: 'danger-solid', text: 'Urgent' },
    critical: { variant: 'gradient', text: 'Critical' }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <Badge 
      variant={config.variant} 
      size={size} 
      className={className}
      {...props}
    >
      {config.text}
    </Badge>
  );
};

// Category Badge Component
export const CategoryBadge = ({ category, size = 'md', className, ...props }) => {
  const categoryConfig = {
    technology: { variant: 'primary', text: 'Technology' },
    business: { variant: 'success', text: 'Business' },
    design: { variant: 'info', text: 'Design' },
    marketing: { variant: 'warning', text: 'Marketing' },
    finance: { variant: 'success-solid', text: 'Finance' },
    health: { variant: 'danger', text: 'Health' },
    education: { variant: 'info-solid', text: 'Education' },
    entertainment: { variant: 'gradient', text: 'Entertainment' },
    sports: { variant: 'success-outline', text: 'Sports' },
    travel: { variant: 'primary-outline', text: 'Travel' },
    food: { variant: 'warning-solid', text: 'Food' },
    lifestyle: { variant: 'secondary', text: 'Lifestyle' }
  };

  const config = categoryConfig[category] || { variant: 'default', text: category };

  return (
    <Badge 
      variant={config.variant} 
      size={size} 
      className={className}
      {...props}
    >
      {config.text}
    </Badge>
  );
};

// Count Badge Component
export const CountBadge = ({ 
  count, 
  max = 99,
  showZero = false,
  size = 'sm', 
  variant = 'danger-solid',
  className, 
  ...props 
}) => {
  if (!showZero && count === 0) return null;
  
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge 
      variant={variant} 
      size={size} 
      className={cn('min-w-[1.5rem] justify-center', className)}
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

// Notification Badge Component
export const NotificationBadge = ({ 
  count, 
  size = 'xs', 
  className,
  ...props 
}) => {
  if (count === 0) return null;

  return (
    <CountBadge 
      count={count}
      size={size}
      variant="danger-solid"
      className={cn('absolute -top-1 -right-1', className)}
      {...props}
    />
  );
};

// Feature Badge Component
export const FeatureBadge = ({ 
  feature = 'new',
  size = 'xs', 
  className,
  ...props 
}) => {
  const featureConfig = {
    new: { variant: 'success-solid', text: 'New' },
    hot: { variant: 'gradient-warm', text: 'Hot' },
    popular: { variant: 'warning-solid', text: 'Popular' },
    trending: { variant: 'gradient', text: 'Trending' },
    featured: { variant: 'primary-solid', text: 'Featured' },
    premium: { variant: 'gradient-cool', text: 'Premium' },
    pro: { variant: 'gradient', text: 'Pro' },
    beta: { variant: 'info', text: 'Beta' },
    alpha: { variant: 'warning', text: 'Alpha' },
    experimental: { variant: 'danger-outline', text: 'Experimental' }
  };

  const config = featureConfig[feature] || featureConfig.new;

  return (
    <Badge 
      variant={config.variant} 
      size={size} 
      className={className}
      {...props}
    >
      {config.text}
    </Badge>
  );
};

// Interactive Badge Component
export const InteractiveBadge = ({ 
  onRemove,
  removable = false,
  onClick,
  clickable = false,
  children,
  className,
  ...props 
}) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.();
  };

  const handleClick = (e) => {
    if (clickable) {
      onClick?.(e);
    }
  };

  return (
    <Badge 
      className={cn(
        clickable && 'cursor-pointer hover:opacity-80',
        'select-none',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-2 hover:text-red-600 focus:outline-none"
          type="button"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </Badge>
  );
};

// Dot Badge Component (for indicators)
export const DotBadge = ({ 
  variant = 'primary',
  size = 'md',
  pulse = false,
  className,
  ...props 
}) => {
  const sizeStyles = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  const variantStyles = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-400'
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        sizeStyles[size],
        variantStyles[variant],
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    />
  );
};

// Online Status Badge
export const OnlineStatusBadge = ({ 
  isOnline = false,
  size = 'sm',
  showText = false,
  className,
  ...props 
}) => {
  if (showText) {
    return (
      <Badge
        variant={isOnline ? 'success' : 'secondary'}
        size={size}
        className={className}
        {...props}
      >
        <DotBadge 
          variant={isOnline ? 'success' : 'secondary'} 
          size="xs" 
          className="mr-1.5"
        />
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
    );
  }

  return (
    <DotBadge
      variant={isOnline ? 'success' : 'secondary'}
      size={size}
      pulse={isOnline}
      className={cn('absolute bottom-0 right-0 ring-2 ring-white', className)}
      {...props}
    />
  );
};

// Badge Group Component
export const BadgeGroup = ({ 
  badges = [],
  maxDisplay = 3,
  className,
  ...props 
}) => {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className={cn('flex flex-wrap gap-1', className)} {...props}>
      {displayBadges.map((badge, index) => (
        <Badge key={index} {...badge} />
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" size="sm">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};

export default Badge;