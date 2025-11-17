import React, { useState, useRef } from 'react';

const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  color = 'blue',
  label,
  description,
  className = "",
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const switchRef = useRef(null);

  const sizes = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      switch: 'w-14 h-8',
      thumb: 'w-6 h-6',
      translate: 'translate-x-6'
    }
  };

  const colors = {
    blue: {
      on: 'bg-blue-600',
      off: 'bg-gray-200',
      focus: 'ring-blue-500'
    },
    green: {
      on: 'bg-green-600',
      off: 'bg-gray-200',
      focus: 'ring-green-500'
    },
    red: {
      on: 'bg-red-600',
      off: 'bg-gray-200',
      focus: 'ring-red-500'
    },
    purple: {
      on: 'bg-purple-600',
      off: 'bg-gray-200',
      focus: 'ring-purple-500'
    },
    yellow: {
      on: 'bg-yellow-500',
      off: 'bg-gray-200',
      focus: 'ring-yellow-500'
    }
  };

  const sizeConfig = sizes[size] || sizes.md;
  const colorConfig = colors[color] || colors.blue;

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  const switchClasses = `
    relative inline-flex items-center ${sizeConfig.switch} 
    ${checked ? colorConfig.on : colorConfig.off}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    rounded-full border-2 border-transparent transition-colors ease-in-out duration-200
    ${focused ? `ring-2 ${colorConfig.focus} ring-offset-2` : ''}
  `.trim();

  const thumbClasses = `
    ${sizeConfig.thumb} bg-white rounded-full shadow-lg transform ring-0 transition ease-in-out duration-200
    ${checked ? sizeConfig.translate : 'translate-x-0'}
  `.trim();

  if (label || description) {
    return (
      <div className={`flex items-start space-x-3 ${className}`}>
        <button
          ref={switchRef}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={switchClasses}
          {...props}
        >
          <span className="sr-only">
            {label || 'Toggle switch'}
          </span>
          <span className={thumbClasses} />
        </button>
        
        <div className="flex-1 min-w-0">
          {label && (
            <label 
              className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'} cursor-pointer`}
              onClick={() => !disabled && switchRef.current?.focus()}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      ref={switchRef}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${switchClasses} ${className}`}
      {...props}
    >
      <span className="sr-only">Toggle switch</span>
      <span className={thumbClasses} />
    </button>
  );
};

// Controlled switch with internal state for simpler usage
export const UncontrolledSwitch = ({ 
  defaultChecked = false, 
  onChange, 
  ...props 
}) => {
  const [checked, setChecked] = useState(defaultChecked);

  const handleChange = (newChecked) => {
    setChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    <Switch
      checked={checked}
      onChange={handleChange}
      {...props}
    />
  );
};

export default Switch;