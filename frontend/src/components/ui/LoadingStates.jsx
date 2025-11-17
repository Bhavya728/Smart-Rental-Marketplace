/**
 * LoadingStates Component
 * Various loading indicators and skeleton components
 */

import React from 'react';
import { cn } from '../../utils/cn';

// Main Loading Spinner
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className,
  ...props 
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    pink: 'border-pink-600',
    indigo: 'border-indigo-600'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200',
        sizeClasses[size],
        `border-t-transparent ${colorClasses[color]}`,
        className
      )}
      {...props}
    />
  );
};

// Dots Loading
export const LoadingDots = ({ 
  size = 'md', 
  color = 'blue', 
  className,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600'
  };

  return (
    <div className={cn('flex space-x-1', className)} {...props}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
};

// Pulse Loading
export const LoadingPulse = ({ 
  size = 'md', 
  color = 'blue', 
  className,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600'
  };

  return (
    <div
      className={cn(
        'rounded-full animate-pulse',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    />
  );
};

// Bar Loading
export const LoadingBars = ({ 
  color = 'blue', 
  className,
  ...props 
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600'
  };

  return (
    <div className={cn('flex items-end space-x-1', className)} {...props}>
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={cn(
            'w-1 rounded-sm animate-pulse',
            colorClasses[color]
          )}
          style={{
            height: `${Math.random() * 20 + 10}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Skeleton Components
export const Skeleton = ({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  ...props 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
            )}
            style={{ width, height }}
            {...props}
          />
        ))}
      </div>
    );
  }
  
  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full', className)}
        style={{ 
          width: width || height || '40px', 
          height: height || width || '40px' 
        }}
        {...props}
      />
    );
  }
  
  return (
    <div
      className={cn(baseClasses, className)}
      style={{ width, height }}
      {...props}
    />
  );
};

// Card Skeleton
export const CardSkeleton = ({ className, ...props }) => (
  <div className={cn('p-4 space-y-4', className)} {...props}>
    <Skeleton variant="rectangular" height="200px" />
    <div className="space-y-2">
      <Skeleton variant="text" />
      <Skeleton variant="text" lines={2} />
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton variant="circular" width="40px" height="40px" />
      <div className="flex-1 space-y-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton = ({ items = 3, className, ...props }) => (
  <div className={cn('space-y-3', className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="75%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  className,
  ...props 
}) => (
  <div className={cn('space-y-4', className)} {...props}>
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {/* Header */}
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} variant="text" height="20px" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div 
        key={`row-${rowIndex}`}
        className="grid gap-4" 
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" height="16px" />
        ))}
      </div>
    ))}
  </div>
);

// Progress Bar Loading
export const ProgressBar = ({ 
  progress = 0, 
  color = 'blue', 
  size = 'md',
  showLabel = false,
  label,
  className,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-700 mb-1">
          <span>{label}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full', sizeClasses[size])}>
        <div
          className={cn('rounded-full transition-all duration-300', 
            sizeClasses[size], 
            colorClasses[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

// Shimmer Effect
export const ShimmerEffect = ({ 
  width = '100%',
  height = '20px',
  className,
  ...props 
}) => (
  <div
    className={cn(
      'animate-shimmer rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
      className
    )}
    style={{ 
      width, 
      height,
      backgroundSize: '200px 100%'
    }}
    {...props}
  />
);

// Loading Overlay
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  spinner = <LoadingSpinner size="lg" />,
  text = "Loading...",
  className,
  ...props 
}) => {
  if (!isLoading) {
    return children;
  }

  return (
    <div className={cn('relative', className)} {...props}>
      {children && (
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      )}
      
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-3">
          {spinner}
          {text && (
            <p className="text-sm text-gray-600 font-medium">{text}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Full Page Loading
export const FullPageLoading = ({ 
  spinner = <LoadingSpinner size="xl" />,
  text = "Loading...",
  className,
  ...props 
}) => (
  <div 
    className={cn(
      'fixed inset-0 flex items-center justify-center bg-white z-50',
      className
    )} 
    {...props}
  >
    <div className="flex flex-col items-center space-y-4">
      {spinner}
      {text && (
        <p className="text-lg text-gray-600 font-medium">{text}</p>
      )}
    </div>
  </div>
);

// Lazy Loading Placeholder
export const LazyLoadingPlaceholder = ({ 
  width = '100%',
  height = '200px',
  className,
  ...props 
}) => (
  <div
    className={cn(
      'flex items-center justify-center bg-gray-100 animate-pulse rounded',
      className
    )}
    style={{ width, height }}
    {...props}
  >
    <div className="text-gray-400">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
);

export default {
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
  LoadingBars,
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  ProgressBar,
  ShimmerEffect,
  LoadingOverlay,
  FullPageLoading,
  LazyLoadingPlaceholder
};