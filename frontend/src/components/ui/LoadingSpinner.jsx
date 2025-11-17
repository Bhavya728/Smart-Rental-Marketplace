import React from 'react';
import { cn } from '../../utils/cn';

// Base Loading Spinner Component
const LoadingSpinner = ({ 
  size = 'md',
  color = 'blue',
  className,
  ...props 
}) => {
  const sizeStyles = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4', 
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
    '2xl': 'h-16 w-16'
  };

  const colorStyles = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    red: 'text-red-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    indigo: 'text-indigo-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
    white: 'text-white'
  };

  const spinnerStyles = cn(
    'animate-spin',
    sizeStyles[size],
    colorStyles[color],
    className
  );

  return (
    <svg 
      className={spinnerStyles} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      {...props}
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Dots Loading Spinner
export const DotsSpinner = ({ 
  size = 'md',
  color = 'blue',
  className,
  ...props 
}) => {
  const sizeStyles = {
    xs: 'h-1 w-1',
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4'
  };

  const colorStyles = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600',
    white: 'bg-white'
  };

  const dotStyles = cn(
    'rounded-full animate-bounce',
    sizeStyles[size],
    colorStyles[color]
  );

  return (
    <div className={cn('flex space-x-1', className)} {...props}>
      <div className={cn(dotStyles, 'animation-delay-0')} />
      <div className={cn(dotStyles, 'animation-delay-150')} />
      <div className={cn(dotStyles, 'animation-delay-300')} />
    </div>
  );
};

// Pulse Loading Spinner
export const PulseSpinner = ({ 
  size = 'md',
  color = 'blue',
  className,
  ...props 
}) => {
  const sizeStyles = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const colorStyles = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600',
    white: 'bg-white'
  };

  const pulseStyles = cn(
    'rounded-full animate-pulse',
    sizeStyles[size],
    colorStyles[color],
    className
  );

  return <div className={pulseStyles} {...props} />;
};

// Ring Loading Spinner
export const RingSpinner = ({ 
  size = 'md',
  color = 'blue',
  className,
  ...props 
}) => {
  const sizeStyles = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4'
  };

  const colorStyles = {
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    red: 'border-red-600 border-t-transparent',
    green: 'border-green-600 border-t-transparent',
    yellow: 'border-yellow-600 border-t-transparent',
    indigo: 'border-indigo-600 border-t-transparent',
    purple: 'border-purple-600 border-t-transparent',
    pink: 'border-pink-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  const ringStyles = cn(
    'rounded-full animate-spin',
    sizeStyles[size],
    colorStyles[color],
    className
  );

  return <div className={ringStyles} {...props} />;
};

// Bars Loading Spinner
export const BarsSpinner = ({ 
  size = 'md',
  color = 'blue',
  className,
  ...props 
}) => {
  const sizeStyles = {
    xs: { container: 'h-4 w-6', bar: 'w-0.5' },
    sm: { container: 'h-6 w-8', bar: 'w-1' },
    md: { container: 'h-8 w-12', bar: 'w-1' },
    lg: { container: 'h-12 w-16', bar: 'w-1.5' },
    xl: { container: 'h-16 w-20', bar: 'w-2' }
  };

  const colorStyles = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600',
    white: 'bg-white'
  };

  const barStyles = cn(
    'h-full rounded-sm animate-pulse',
    sizeStyles[size].bar,
    colorStyles[color]
  );

  return (
    <div 
      className={cn(
        'flex items-end justify-center space-x-1',
        sizeStyles[size].container,
        className
      )} 
      {...props}
    >
      <div className={cn(barStyles, 'animation-delay-0')} />
      <div className={cn(barStyles, 'animation-delay-150')} />
      <div className={cn(barStyles, 'animation-delay-300')} />
      <div className={cn(barStyles, 'animation-delay-450')} />
    </div>
  );
};

// Full Page Loading Component
export const PageLoader = ({ 
  message = 'Loading...',
  size = 'xl',
  color = 'blue',
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90',
        className
      )}
      {...props}
    >
      <LoadingSpinner size={size} color={color} />
      {message && (
        <p className="mt-4 text-sm text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
};

// Overlay Loading Component
export const OverlayLoader = ({ 
  message = 'Loading...',
  size = 'lg',
  color = 'blue',
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'absolute inset-0 z-10 flex flex-col items-center justify-center bg-white bg-opacity-80 rounded-lg',
        className
      )}
      {...props}
    >
      <LoadingSpinner size={size} color={color} />
      {message && (
        <p className="mt-3 text-sm text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
};

// Inline Loading Component
export const InlineLoader = ({ 
  message = 'Loading...',
  size = 'sm',
  color = 'blue',
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'flex items-center justify-center space-x-2 py-4',
        className
      )}
      {...props}
    >
      <LoadingSpinner size={size} color={color} />
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  );
};

// Button Loading Component
export const ButtonLoader = ({ 
  size = 'sm',
  color = 'white',
  className,
  ...props 
}) => {
  return (
    <LoadingSpinner 
      size={size} 
      color={color} 
      className={cn('-ml-1 mr-2', className)}
      {...props}
    />
  );
};

// Content Loading Component (Skeleton-like)
export const ContentLoader = ({ 
  lines = 3,
  className,
  ...props 
}) => {
  return (
    <div className={cn('space-y-3 animate-pulse', className)} {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

// Card Loading Component
export const CardLoader = ({ className, ...props }) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-6 animate-pulse',
        className
      )}
      {...props}
    >
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
};

// Table Loading Component
export const TableLoader = ({ 
  rows = 5,
  columns = 4,
  className,
  ...props 
}) => {
  return (
    <div className={cn('space-y-2 animate-pulse', className)} {...props}>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="h-8 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Image Loading Component
export const ImageLoader = ({ className, ...props }) => {
  return (
    <div 
      className={cn(
        'bg-gray-200 rounded animate-pulse flex items-center justify-center',
        className
      )}
      {...props}
    >
      <svg 
        className="w-8 h-8 text-gray-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
    </div>
  );
};

// Loading with Progress
export const ProgressLoader = ({ 
  progress = 0,
  message = 'Loading...',
  className,
  ...props 
}) => {
  return (
    <div className={cn('w-full max-w-md mx-auto', className)} {...props}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{message}</span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;