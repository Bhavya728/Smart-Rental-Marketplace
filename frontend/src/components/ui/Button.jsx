import React, { forwardRef, useState, useRef } from 'react';
import { cn } from '../../utils/cn';

// Base Button Component
const Button = forwardRef(({ 
  className, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  ...props 
}, ref) => {
  
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const createRipple = (event) => {
    if (disabled || loading) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now() + Math.random()
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (event) => {
    createRipple(event);
    props.onClick?.(event);
  };

  const baseStyles = 'relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-3 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl active:shadow-md';
  
  const sizeStyles = {
    xs: 'px-3 py-1.5 text-xs min-h-[28px]',
    sm: 'px-4 py-2 text-sm min-h-[32px]',
    md: 'px-6 py-3 text-sm font-medium min-h-[40px]',
    lg: 'px-8 py-4 text-base font-semibold min-h-[48px]',
    xl: 'px-10 py-5 text-lg font-bold min-h-[56px]'
  };
  
  const variantStyles = {
    // Primary variants with gradients
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-blue-500/25 border-0',
    'primary-outline': 'border-2 border-blue-600 text-blue-600 bg-white/80 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-700 focus:ring-blue-500 shadow-blue-500/10',
    'primary-ghost': 'text-blue-600 bg-blue-50/50 hover:bg-blue-100/70 focus:ring-blue-500 shadow-blue-500/5 border-0',
    
    // Secondary variants with gradients
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 focus:ring-gray-500 shadow-gray-500/25 border-0',
    'secondary-outline': 'border-2 border-gray-600 text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-700 focus:ring-gray-500 shadow-gray-500/10',
    'secondary-ghost': 'text-gray-700 bg-gray-50/50 hover:bg-gray-100/70 focus:ring-gray-500 shadow-gray-500/5 border-0',
    
    // Success variants with gradients
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 shadow-green-500/25 border-0',
    'success-outline': 'border-2 border-green-600 text-green-700 bg-white/80 backdrop-blur-sm hover:bg-green-50 hover:border-green-700 focus:ring-green-500 shadow-green-500/10',
    'success-ghost': 'text-green-700 bg-green-50/50 hover:bg-green-100/70 focus:ring-green-500 shadow-green-500/5 border-0',
    
    // Danger variants with gradients
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 focus:ring-red-500 shadow-red-500/25 border-0',
    'danger-outline': 'border-2 border-red-600 text-red-700 bg-white/80 backdrop-blur-sm hover:bg-red-50 hover:border-red-700 focus:ring-red-500 shadow-red-500/10',
    'danger-ghost': 'text-red-700 bg-red-50/50 hover:bg-red-100/70 focus:ring-red-500 shadow-red-500/5 border-0',
    
    // Warning variants with gradients
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-500 shadow-yellow-500/25 border-0',
    'warning-outline': 'border-2 border-yellow-500 text-yellow-700 bg-white/80 backdrop-blur-sm hover:bg-yellow-50 hover:border-yellow-600 focus:ring-yellow-500 shadow-yellow-500/10',
    'warning-ghost': 'text-yellow-700 bg-yellow-50/50 hover:bg-yellow-100/70 focus:ring-yellow-500 shadow-yellow-500/5 border-0',
    
    // Info variants with gradients
    info: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600 focus:ring-sky-400 shadow-sky-500/25 border-0',
    'info-outline': 'border-2 border-sky-500 text-sky-700 bg-white/80 backdrop-blur-sm hover:bg-sky-50 hover:border-sky-600 focus:ring-sky-400 shadow-sky-500/10',
    'info-ghost': 'text-sky-700 bg-sky-50/50 hover:bg-sky-100/70 focus:ring-sky-400 shadow-sky-500/5 border-0',
    
    // Light variants with subtle gradients
    light: 'bg-gradient-to-r from-gray-50 to-white text-gray-900 hover:from-gray-100 hover:to-gray-50 focus:ring-gray-400 shadow-gray-300/20 border border-gray-200',
    'light-outline': 'border-2 border-gray-300 text-gray-700 bg-white/90 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-400 shadow-gray-300/10',
    
    // Dark variants with gradients
    dark: 'bg-gradient-to-r from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900 focus:ring-gray-600 shadow-gray-900/40 border-0',
    'dark-outline': 'border-2 border-gray-800 text-gray-800 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-900 focus:ring-gray-600 shadow-gray-800/10',
    
    // Premium gradient variant
    premium: 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 focus:ring-purple-500 shadow-purple-500/30 border-0',
    
    // Link variant with better styling
    link: 'text-blue-600 bg-transparent hover:text-blue-800 hover:underline focus:ring-blue-500 p-0 shadow-none hover:shadow-none',
  };
  
  const buttonStyles = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    loading && 'cursor-wait',
    className
  );

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
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
          {loadingText || children}
        </>
      );
    }

    return (
      <>
        {LeftIcon && <LeftIcon className="mr-2 h-4 w-4" />}
        {children}
        {RightIcon && <RightIcon className="ml-2 h-4 w-4" />}
      </>
    );
  };

  return (
    <button
      ref={buttonRef || ref}
      className={buttonStyles}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {renderContent()}
      
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </button>
  );
});

Button.displayName = 'Button';

// Icon Button Component
export const IconButton = forwardRef(({ 
  className, 
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  ...props 
}, ref) => {
  const sizeStyles = {
    xs: 'p-2 min-w-[32px] min-h-[32px]',
    sm: 'p-2.5 min-w-[36px] min-h-[36px]',
    md: 'p-3 min-w-[44px] min-h-[44px]',
    lg: 'p-4 min-w-[52px] min-h-[52px]',
    xl: 'p-5 min-w-[60px] min-h-[60px]'
  };

  const iconSizes = {
    xs: 'h-4 w-4',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  };

  return (
    <Button
      className={cn('rounded-full aspect-square', sizeStyles[size], className)}
      variant={variant}
      size={size}
      ref={ref}
      {...props}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// Button Group Component
export const ButtonGroup = ({ children, className, size = 'md', variant, orientation = 'horizontal', ...props }) => {
  const groupStyles = cn(
    'inline-flex shadow-xl',
    orientation === 'horizontal' ? 'flex-row rounded-xl' : 'flex-col rounded-xl',
    'bg-white/10 backdrop-blur-sm p-1 gap-1',
    className
  );

  return (
    <div className={groupStyles} {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          const isOnly = React.Children.count(children) === 1;
          
          const buttonClassName = cn(
            child.props.className,
            'flex-1 shadow-none hover:shadow-md',
            orientation === 'horizontal' ? (
              isOnly ? 'rounded-lg' :
              isFirst ? 'rounded-l-lg rounded-r-md' :
              isLast ? 'rounded-r-lg rounded-l-md' :
              'rounded-md'
            ) : (
              isOnly ? 'rounded-lg' :
              isFirst ? 'rounded-t-lg rounded-b-md' :
              isLast ? 'rounded-b-lg rounded-t-md' :
              'rounded-md'
            )
          );

          return React.cloneElement(child, {
            className: buttonClassName,
            size: child.props.size || size,
            variant: child.props.variant || variant,
          });
        }
        return child;
      })}
    </div>
  );
};

// Loading Button Component
export const LoadingButton = forwardRef(({ 
  loading,
  loadingText = 'Loading...',
  children,
  ...props 
}, ref) => {
  return (
    <Button
      loading={loading}
      loadingText={loadingText}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

LoadingButton.displayName = 'LoadingButton';

// Submit Button Component (for forms)
export const SubmitButton = forwardRef(({ 
  loading,
  loadingText = 'Submitting...',
  children = 'Submit',
  ...props 
}, ref) => {
  return (
    <Button
      type="submit"
      loading={loading}
      loadingText={loadingText}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

SubmitButton.displayName = 'SubmitButton';

// Social Login Buttons
export const GoogleButton = forwardRef(({ children = 'Continue with Google', className, ...props }, ref) => {
  return (
    <Button
      variant="light"
      className={cn('border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium', className)}
      leftIcon={({ className }) => (
        <svg className={cn(className, 'mr-1')} viewBox="0 0 24 24">
          <path 
            fill="#4285F4" 
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path 
            fill="#34A853" 
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path 
            fill="#FBBC05" 
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path 
            fill="#EA4335" 
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

GoogleButton.displayName = 'GoogleButton';

export const FacebookButton = forwardRef(({ children = 'Continue with Facebook', className, ...props }, ref) => {
  return (
    <Button
      className={cn('bg-[#1877F2] hover:bg-[#166FE5] border-0 font-medium', className)}
      leftIcon={({ className }) => (
        <svg className={cn(className, 'mr-1')} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

FacebookButton.displayName = 'FacebookButton';

export const TwitterButton = forwardRef(({ children = 'Continue with X', className, ...props }, ref) => {
  return (
    <Button
      className={cn('bg-black hover:bg-gray-900 border-0 font-medium', className)}
      leftIcon={({ className }) => (
        <svg className={cn(className, 'mr-1')} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

TwitterButton.displayName = 'TwitterButton';

// Action Buttons
export const SaveButton = forwardRef(({ loading, children = 'Save', ...props }, ref) => {
  return (
    <Button
      variant="success"
      loading={loading}
      loadingText="Saving..."
      leftIcon={loading ? undefined : ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

SaveButton.displayName = 'SaveButton';

export const DeleteButton = forwardRef(({ loading, children = 'Delete', ...props }, ref) => {
  return (
    <Button
      variant="danger"
      loading={loading}
      loadingText="Deleting..."
      leftIcon={loading ? undefined : ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

DeleteButton.displayName = 'DeleteButton';

export const EditButton = forwardRef(({ children = 'Edit', ...props }, ref) => {
  return (
    <Button
      variant="secondary-outline"
      leftIcon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

EditButton.displayName = 'EditButton';

export const CancelButton = forwardRef(({ children = 'Cancel', ...props }, ref) => {
  return (
    <Button
      variant="secondary-outline"
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});

CancelButton.displayName = 'CancelButton';

export default Button;