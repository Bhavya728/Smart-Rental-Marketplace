/**
 * MicroInteractions Component
 * Small UI interactions and feedback components
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

// Button with ripple effect
export const RippleButton = ({ 
  children, 
  className, 
  onClick, 
  disabled = false,
  variant = 'primary',
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const createRipple = (event) => {
    if (disabled) return;

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

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (event) => {
    createRipple(event);
    onClick?.(event);
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden px-4 py-2 rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        variantClasses[variant],
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
      
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white opacity-25 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            pointerEvents: 'none'
          }}
        />
      ))}
    </button>
  );
};

// Floating Action Button
export const FloatingActionButton = ({ 
  children, 
  className, 
  position = 'bottom-right',
  onClick,
  tooltip,
  ...props 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  return (
    <div className="relative">
      <button
        className={cn(
          'w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg',
          'flex items-center justify-center transition-all duration-200',
          'hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300',
          positionClasses[position],
          className
        )}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        {...props}
      >
        {children}
      </button>
      
      {tooltip && showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
};

// Toggle Switch with smooth animation
export const AnimatedToggle = ({ 
  checked = false, 
  onChange, 
  disabled = false,
  size = 'md',
  color = 'blue',
  label,
  className,
  ...props 
}) => {
  const sizeClasses = {
    sm: {
      track: 'w-8 h-5',
      thumb: 'w-3 h-3',
      translate: 'translate-x-3'
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5'
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-5 h-5',
      translate: 'translate-x-7'
    }
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
  };

  return (
    <label className={cn('flex items-center cursor-pointer', className)} {...props}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'rounded-full transition-all duration-200 ease-in-out',
            sizeClasses[size].track,
            checked 
              ? colorClasses[color] 
              : 'bg-gray-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div
            className={cn(
              'absolute top-1 left-1 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out',
              sizeClasses[size].thumb,
              checked && sizeClasses[size].translate
            )}
          />
        </div>
      </div>
      
      {label && (
        <span className={cn(
          'ml-3 text-sm font-medium text-gray-700',
          disabled && 'opacity-50'
        )}>
          {label}
        </span>
      )}
    </label>
  );
};

// Checkbox with custom animation
export const AnimatedCheckbox = ({ 
  checked = false, 
  onChange, 
  disabled = false,
  label,
  indeterminate = false,
  className,
  ...props 
}) => {
  return (
    <label className={cn('flex items-center cursor-pointer', className)} {...props}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center',
            checked || indeterminate
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-300 bg-white hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {checked && (
            <svg 
              className="w-3 h-3 text-white animate-scale-in" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
          
          {indeterminate && !checked && (
            <div className="w-2 h-0.5 bg-white animate-scale-in" />
          )}
        </div>
      </div>
      
      {label && (
        <span className={cn(
          'ml-3 text-sm font-medium text-gray-700',
          disabled && 'opacity-50'
        )}>
          {label}
        </span>
      )}
    </label>
  );
};

// Radio button with animation
export const AnimatedRadio = ({ 
  checked = false, 
  onChange, 
  disabled = false,
  label,
  name,
  value,
  className,
  ...props 
}) => {
  return (
    <label className={cn('flex items-center cursor-pointer', className)} {...props}>
      <div className="relative">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          name={name}
          value={value}
          className="sr-only"
        />
        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
            checked
              ? 'bg-blue-50 border-blue-600'
              : 'border-gray-300 bg-white hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {checked && (
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-scale-in" />
          )}
        </div>
      </div>
      
      {label && (
        <span className={cn(
          'ml-3 text-sm font-medium text-gray-700',
          disabled && 'opacity-50'
        )}>
          {label}
        </span>
      )}
    </label>
  );
};

// Heart/Like animation
export const HeartButton = ({ 
  liked = false, 
  onToggle, 
  size = 'md',
  className,
  ...props 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle?.(!liked);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <button
      className={cn(
        'p-1 rounded-full hover:bg-gray-100 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-pink-500',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <svg 
        className={cn(
          sizeClasses[size],
          'transition-all duration-200',
          liked ? 'text-red-500 fill-current' : 'text-gray-400',
          isAnimating && 'animate-bounce scale-110'
        )}
        stroke="currentColor" 
        fill={liked ? 'currentColor' : 'none'} 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </button>
  );
};

// Star Rating with hover effects
export const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  maxRating = 5,
  size = 'md',
  readonly = false,
  className,
  ...props 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn('flex space-x-1', className)} {...props}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);
        
        return (
          <button
            key={index}
            type="button"
            className={cn(
              'transition-all duration-150 focus:outline-none',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
            onClick={() => !readonly && onRatingChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
          >
            <svg 
              className={cn(
                sizeClasses[size],
                isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300',
                'transition-colors duration-150'
              )}
              fill={isFilled ? 'currentColor' : 'none'}
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

// Copy to clipboard with feedback
export const CopyButton = ({ 
  text, 
  children, 
  onCopy,
  className,
  ...props 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.(text);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      className={cn(
        'p-2 rounded-md hover:bg-gray-100 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
      onClick={handleCopy}
      {...props}
    >
      {copied ? (
        <div className="flex items-center space-x-1 text-green-600">
          <svg className="w-4 h-4 animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {children || <span className="text-sm">Copied!</span>}
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {children || <span className="text-sm">Copy</span>}
        </div>
      )}
    </button>
  );
};

export default {
  RippleButton,
  FloatingActionButton,
  AnimatedToggle,
  AnimatedCheckbox,
  AnimatedRadio,
  HeartButton,
  StarRating,
  CopyButton
};