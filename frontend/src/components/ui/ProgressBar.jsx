import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * ProgressBar Component
 * Animated progress bar with various styles and features
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md', // sm, md, lg
  variant = 'default', // default, success, warning, danger, info
  showPercentage = true,
  showLabel = true,
  label,
  animated = true,
  striped = false,
  className = '',
  gradient = false,
  backgroundColor = 'bg-gray-200',
  duration = 1000 // Animation duration in ms
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Animate value changes
  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const startValue = displayValue;
      const endValue = percentage;
      const difference = endValue - startValue;
      const startTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutCubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = startValue + (difference * easeProgress);
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated, duration]);

  // Size configurations
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Variant colors
  const variantClasses = {
    default: gradient 
      ? 'bg-gradient-to-r from-primary-500 to-primary-600' 
      : 'bg-primary-500',
    success: gradient 
      ? 'bg-gradient-to-r from-green-500 to-green-600' 
      : 'bg-green-500',
    warning: gradient 
      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
      : 'bg-yellow-500',
    danger: gradient 
      ? 'bg-gradient-to-r from-red-500 to-red-600' 
      : 'bg-red-500',
    info: gradient 
      ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
      : 'bg-blue-500'
  };

  // Text colors for contrast
  const textColors = {
    default: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label and Percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && (
            <span className={`${textSizes[size]} font-medium text-gray-700`}>
              {label || 'Progress'}
            </span>
          )}
          {showPercentage && (
            <span className={`${textSizes[size]} font-medium ${textColors[variant]}`}>
              {Math.round(displayValue)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={`relative w-full ${sizeClasses[size]} ${backgroundColor} rounded-full overflow-hidden`}>
        {/* Striped Background Pattern */}
        {striped && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 8px,
                rgba(255,255,255,0.3) 8px,
                rgba(255,255,255,0.3) 16px
              )`
            }}
          />
        )}

        {/* Progress Bar Fill */}
        <motion.div
          className={`
            h-full rounded-full transition-all duration-300
            ${variantClasses[variant]}
            ${striped && animated ? 'animate-pulse' : ''}
          `}
          initial={{ width: 0 }}
          animate={{ 
            width: `${displayValue}%`,
            transition: { 
              duration: animated ? duration / 1000 : 0,
              ease: "easeOut"
            }
          }}
        />

        {/* Glow effect */}
        {gradient && (
          <div 
            className={`
              absolute top-0 left-0 h-full rounded-full opacity-50 blur-sm
              ${variantClasses[variant]}
            `}
            style={{ width: `${displayValue}%` }}
          />
        )}

        {/* Animation overlay for striped bars */}
        {striped && animated && displayValue > 0 && (
          <div
            className="absolute inset-0 opacity-20 animate-slide"
            style={{
              width: `${displayValue}%`,
              backgroundImage: `repeating-linear-gradient(
                45deg,
                rgba(255,255,255,0.1),
                rgba(255,255,255,0.1) 8px,
                transparent 8px,
                transparent 16px
              )`,
              animation: 'slide 2s linear infinite'
            }}
          />
        )}
      </div>

      {/* Value indicator for screenreaders */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(displayValue)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="sr-only"
      />
    </div>
  );
};

/**
 * Circular Progress Component
 * Circular/radial progress indicator
 */
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showPercentage = true,
  label,
  animated = true,
  className = '',
  duration = 1000
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Animate value changes
  useEffect(() => {
    if (animated) {
      const startValue = displayValue;
      const endValue = percentage;
      const difference = endValue - startValue;
      const startTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (difference * easeProgress);
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated, duration]);

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  // Variant colors
  const strokeColors = {
    default: '#3B82F6', // blue-500
    success: '#10B981', // green-500
    warning: '#F59E0B', // yellow-500
    danger: '#EF4444',  // red-500
    info: '#06B6D4'     // cyan-500
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-gray-800">
            {Math.round(displayValue)}%
          </span>
        )}
        {label && (
          <span className="text-sm text-gray-600 text-center">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Multi-step Progress Component
 * Progress indicator for multi-step processes
 */
export const StepProgress = ({
  steps = [],
  currentStep = 0,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: { circle: 'w-6 h-6 text-xs', line: 'h-0.5' },
    md: { circle: 'w-8 h-8 text-sm', line: 'h-1' },
    lg: { circle: 'w-10 h-10 text-base', line: 'h-1.5' }
  };

  const variantClasses = {
    default: {
      completed: 'bg-primary-500 text-white',
      current: 'bg-primary-100 text-primary-600 border-2 border-primary-500',
      pending: 'bg-gray-200 text-gray-500',
      line: 'bg-primary-500'
    },
    success: {
      completed: 'bg-green-500 text-white',
      current: 'bg-green-100 text-green-600 border-2 border-green-500',
      pending: 'bg-gray-200 text-gray-500',
      line: 'bg-green-500'
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        let stepClasses = variantClasses[variant].pending;
        if (isCompleted) stepClasses = variantClasses[variant].completed;
        if (isCurrent) stepClasses = variantClasses[variant].current;

        return (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  ${sizeClasses[size].circle}
                  rounded-full flex items-center justify-center
                  font-medium transition-all duration-300
                  ${stepClasses}
                `}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              {step.label && (
                <span className="mt-2 text-xs text-gray-600 text-center max-w-20">
                  {step.label}
                </span>
              )}
            </div>

            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 mx-2 ${sizeClasses[size].line}
                  ${isCompleted ? variantClasses[variant].line : 'bg-gray-200'}
                  transition-all duration-300
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Add slide animation CSS
const slideStyles = `
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-slide {
    animation: slide 2s linear infinite;
  }
`;

// Inject styles if not present
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('progress-slide');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'progress-slide';
    style.textContent = slideStyles;
    document.head.appendChild(style);
  }
}

export default ProgressBar;