import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

// Base Input Component
const Input = forwardRef(({ 
  className, 
  type = 'text', 
  label, 
  error, 
  helperText, 
  icon: Icon, 
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  disabled,
  required,
  id,
  name,
  ...props 
}, ref) => {
  // Generate unique id if not provided and label exists
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const inputName = name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const baseStyles = 'w-full rounded-xl border transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 font-medium backdrop-blur-sm';
  
  const sizeStyles = {
    sm: 'px-4 py-2.5 text-sm min-h-[38px]',
    md: 'px-5 py-3.5 text-base min-h-[46px]',
    lg: 'px-6 py-4.5 text-lg min-h-[54px]'
  };
  
  const variantStyles = {
    default: 'border-gray-300/70 bg-white/90 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm hover:shadow-md',
    filled: 'border-gray-200/60 bg-gray-50/80 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white/95 shadow-inner hover:bg-white/90',
    outlined: 'border-2 border-gray-300/70 bg-white/60 backdrop-blur-md text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 shadow-lg hover:shadow-xl',
    glass: 'border border-white/30 bg-white/20 backdrop-blur-xl text-gray-900 placeholder:text-gray-500 focus:border-blue-400/60 focus:ring-blue-400/20 shadow-xl',
  };
  
  const errorStyles = error ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50' : '';
  const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed bg-gray-100/80' : '';
  
  const inputStyles = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    errorStyles,
    disabledStyles,
    Icon && iconPosition === 'left' ? 'pl-12' : '',
    Icon && iconPosition === 'right' ? 'pr-12' : '',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-gray-800 mb-1.5 tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-500 transition-colors duration-200" />
          </div>
        )}
        
        <input
          type={type}
          id={inputId}
          name={inputName}
          className={inputStyles}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-500 transition-colors duration-200" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 font-medium flex items-center mt-2">
          <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Password Input Component
export const PasswordInput = forwardRef(({ 
  showPassword, 
  onTogglePassword, 
  ...props 
}, ref) => {
  const [internalShowPassword, setInternalShowPassword] = React.useState(false);
  
  const isPasswordVisible = showPassword !== undefined ? showPassword : internalShowPassword;
  const togglePassword = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword));

  return (
    <div className="relative">
      <Input
        {...props}
        ref={ref}
        type={isPasswordVisible ? 'text' : 'password'}
      />
      
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
        onClick={togglePassword}
        style={{ top: props.label ? '40px' : '0' }}
      >
        {isPasswordVisible ? (
          <svg className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

// Email Input Component
export const EmailInput = forwardRef((props, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      type="email"
      autoComplete="email"
      placeholder={props.placeholder || "Enter your email"}
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      )}
    />
  );
});

EmailInput.displayName = 'EmailInput';

// Phone Input Component
export const PhoneInput = forwardRef((props, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      type="tel"
      autoComplete="tel"
      placeholder={props.placeholder || "Enter your phone number"}
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';

// Search Input Component
export const SearchInput = forwardRef(({ onSearch, ...props }, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      type="search"
      placeholder={props.placeholder || "Search..."}
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && onSearch) {
          onSearch(e.target.value);
        }
        props.onKeyPress?.(e);
      }}
    />
  );
});

SearchInput.displayName = 'SearchInput';

// Textarea Component
export const Textarea = forwardRef(({ 
  className, 
  label, 
  error, 
  helperText, 
  rows = 4,
  resize = true,
  disabled,
  required,
  id,
  name,
  ...props 
}, ref) => {
  // Generate unique id if not provided and label exists
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const textareaName = name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const baseStyles = 'w-full rounded-xl border transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 px-5 py-4 text-base font-medium backdrop-blur-sm';
  
  const variantStyles = 'border-gray-300/70 bg-white/90 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm hover:shadow-md';
  const errorStyles = error ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50' : '';
  const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed bg-gray-100/80' : '';
  const resizeStyles = resize ? 'resize-y' : 'resize-none';
  
  const textareaStyles = cn(
    baseStyles,
    variantStyles,
    errorStyles,
    disabledStyles,
    resizeStyles,
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        rows={rows}
        id={textareaId}
        name={textareaName}
        className={textareaStyles}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select Component
export const Select = forwardRef(({ 
  className, 
  label, 
  error, 
  helperText, 
  children,
  placeholder,
  disabled,
  required,
  ...props 
}, ref) => {
  const baseStyles = 'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-3 text-base appearance-none bg-white';
  
  const variantStyles = 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500';
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : '';
  
  const selectStyles = cn(
    baseStyles,
    variantStyles,
    errorStyles,
    disabledStyles,
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          className={selectStyles}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Checkbox Component
export const Checkbox = forwardRef(({ 
  className, 
  label, 
  error, 
  helperText,
  children,
  disabled,
  ...props 
}, ref) => {
  const checkboxStyles = cn(
    'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className
  );

  return (
    <div className="space-y-2">
      <div className="flex items-start">
        <input
          type="checkbox"
          className={checkboxStyles}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        
        {(label || children) && (
          <div className="ml-3">
            <label className={cn(
              "text-sm text-gray-700",
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            )}>
              {label || children}
            </label>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Radio Component
export const Radio = forwardRef(({ 
  className, 
  label, 
  error, 
  helperText,
  children,
  disabled,
  ...props 
}, ref) => {
  const radioStyles = cn(
    'h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className
  );

  return (
    <div className="space-y-2">
      <div className="flex items-start">
        <input
          type="radio"
          className={radioStyles}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        
        {(label || children) && (
          <div className="ml-3">
            <label className={cn(
              "text-sm text-gray-700",
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            )}>
              {label || children}
            </label>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

export default Input;