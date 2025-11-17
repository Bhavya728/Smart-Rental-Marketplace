/**
 * AnimatedCounter Component
 * Smooth counting animation for numbers
 */

import React, { useState, useEffect, useRef } from 'react';
import { DURATION, EASING } from '../../utils/animations';

const AnimatedCounter = ({
  value = 0,
  duration = DURATION.SLOW,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  easingFn = 'easeOutCubic',
  startOnMount = true,
  className = '',
  onComplete,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(startOnMount ? 0 : value);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);

  // Easing functions
  const easingFunctions = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    easeOutBounce: (t) => {
      if (t < (1 / 2.75)) {
        return 7.5625 * t * t;
      } else if (t < (2 / 2.75)) {
        return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
      } else if (t < (2.5 / 2.75)) {
        return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
      } else {
        return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
      }
    }
  };

  const formatNumber = (num) => {
    const fixed = parseFloat(num).toFixed(decimals);
    const parts = fixed.split('.');
    
    // Add thousand separators
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    return parts.join('.');
  };

  const animate = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    
    const easingFunction = easingFunctions[easingFn] || easingFunctions.easeOutCubic;
    const easedProgress = easingFunction(progress);
    
    const currentValue = startValueRef.current + (value - startValueRef.current) * easedProgress;
    setDisplayValue(currentValue);

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      startTimeRef.current = null;
      onComplete?.();
    }
  };

  const startAnimation = () => {
    if (isAnimating) {
      cancelAnimationFrame(frameRef.current);
    }

    startValueRef.current = displayValue;
    setIsAnimating(true);
    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (startOnMount || displayValue !== value) {
      startAnimation();
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration, easingFn]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <span className={className} {...props}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

// Preset counter components
export const CurrencyCounter = ({ value, currency = 'USD', locale = 'en-US', ...props }) => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  });

  return (
    <AnimatedCounter
      value={value}
      prefix=""
      suffix=""
      decimals={2}
      {...props}
    >
      {(displayValue) => formatter.format(displayValue)}
    </AnimatedCounter>
  );
};

export const PercentageCounter = ({ value, ...props }) => (
  <AnimatedCounter
    value={value}
    suffix="%"
    decimals={1}
    {...props}
  />
);

export const CompactCounter = ({ value, ...props }) => {
  const formatCompact = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <AnimatedCounter
      value={value}
      {...props}
    >
      {(displayValue) => formatCompact(displayValue)}
    </AnimatedCounter>
  );
};

export default AnimatedCounter;