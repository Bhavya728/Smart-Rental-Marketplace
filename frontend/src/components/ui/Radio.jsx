import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Radio = ({ 
  id,
  name,
  value,
  checked = false, 
  onChange, 
  label, 
  description,
  disabled = false,
  className = "",
  size = "md"
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <div className="flex items-center">
        <input
          id={id}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={cn(
            "relative cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div
            className={cn(
              "border-2 rounded-full transition-all duration-200 flex items-center justify-center",
              sizes[size],
              checked
                ? "bg-primary border-primary"
                : "bg-white border-gray-300 hover:border-primary",
              disabled && "cursor-not-allowed"
            )}
          >
            <motion.div
              initial={false}
              animate={{
                scale: checked ? 1 : 0,
                opacity: checked ? 1 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              className={cn(
                "bg-white rounded-full",
                size === "sm" && "w-1.5 h-1.5",
                size === "md" && "w-2 h-2",
                size === "lg" && "w-2.5 h-2.5"
              )}
            />
          </div>
        </label>
      </div>
      
      {(label || description) && (
        <div className="flex-1 min-w-0 py-2">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "block text-sm sm:text-base font-medium text-gray-900 cursor-pointer leading-relaxed touch-manipulation",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn(
              "text-sm text-gray-500 mt-0.5 leading-relaxed",
              disabled && "opacity-50"
            )}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Radio;