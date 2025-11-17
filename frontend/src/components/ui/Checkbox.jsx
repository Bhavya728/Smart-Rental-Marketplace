import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const Checkbox = ({ 
  id,
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
      onChange(e.target.checked);
    }
  };

  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <div className="flex items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={cn(
            "relative cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div
            className={cn(
              "border-2 rounded-md transition-all duration-200 flex items-center justify-center",
              sizes[size],
              checked
                ? "bg-primary border-primary text-white"
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
            >
              <Check className={cn(
                "text-white",
                size === "sm" && "w-3 h-3",
                size === "md" && "w-4 h-4",
                size === "lg" && "w-5 h-5"
              )} />
            </motion.div>
          </div>
        </label>
      </div>
      
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "block text-sm font-medium text-gray-900 cursor-pointer",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn(
              "text-sm text-gray-500 mt-0.5",
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

export default Checkbox;