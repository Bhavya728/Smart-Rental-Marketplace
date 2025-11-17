import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const RangeSlider = ({ 
  min = 0, 
  max = 100, 
  value = [0, 100], 
  onChange,
  step = 1,
  className = "",
  formatValue,
  label,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(-1);
  const sliderRef = useRef(null);

  const [minVal, maxVal] = value;
  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  const handleMouseDown = (index) => (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setDragIndex(index);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || dragIndex === -1 || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = min + (percent / 100) * (max - min);
    const roundedValue = Math.round(newValue / step) * step;

    if (dragIndex === 0) {
      // Dragging min handle
      const newMin = Math.min(roundedValue, maxVal - step);
      onChange([Math.max(min, newMin), maxVal]);
    } else {
      // Dragging max handle
      const newMax = Math.max(roundedValue, minVal + step);
      onChange([minVal, Math.min(max, newMax)]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragIndex(-1);
  };

  const handleTrackClick = (e) => {
    if (disabled) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const newValue = min + (percent / 100) * (max - min);
    const roundedValue = Math.round(newValue / step) * step;

    // Determine which handle is closer
    const distToMin = Math.abs(roundedValue - minVal);
    const distToMax = Math.abs(roundedValue - maxVal);

    if (distToMin < distToMax) {
      onChange([Math.max(min, Math.min(roundedValue, maxVal - step)), maxVal]);
    } else {
      onChange([minVal, Math.min(max, Math.max(roundedValue, minVal + step))]);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragIndex, minVal, maxVal]);

  const formatDisplayValue = (val) => {
    return formatValue ? formatValue(val) : val.toString();
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div className="text-sm text-gray-500">
            {formatDisplayValue(minVal)} - {formatDisplayValue(maxVal)}
          </div>
        </div>
      )}
      
      <div className="relative">
        {/* Track */}
        <div
          ref={sliderRef}
          onClick={handleTrackClick}
          className={cn(
            "relative h-2 bg-gray-200 rounded-full cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Active track */}
          <div
            className="absolute h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
          
          {/* Min handle */}
          <motion.div
            className={cn(
              "absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md cursor-grab",
              "flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2",
              "hover:scale-110 transition-all duration-200",
              isDragging && dragIndex === 0 && "cursor-grabbing scale-110",
              disabled && "cursor-not-allowed opacity-50"
            )}
            style={{
              left: `${minPercent}%`,
              top: '50%',
            }}
            onMouseDown={handleMouseDown(0)}
            whileHover={!disabled ? { scale: 1.1 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            <div className="w-2 h-2 bg-primary rounded-full" />
          </motion.div>
          
          {/* Max handle */}
          <motion.div
            className={cn(
              "absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md cursor-grab",
              "flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2",
              "hover:scale-110 transition-all duration-200",
              isDragging && dragIndex === 1 && "cursor-grabbing scale-110",
              disabled && "cursor-not-allowed opacity-50"
            )}
            style={{
              left: `${maxPercent}%`,
              top: '50%',
            }}
            onMouseDown={handleMouseDown(1)}
            whileHover={!disabled ? { scale: 1.1 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            <div className="w-2 h-2 bg-primary rounded-full" />
          </motion.div>
        </div>
        
        {/* Value tooltips when dragging */}
        {isDragging && (
          <>
            {dragIndex === 0 && (
              <div
                className="absolute -top-10 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                style={{ left: `${minPercent}%` }}
              >
                {formatDisplayValue(minVal)}
              </div>
            )}
            {dragIndex === 1 && (
              <div
                className="absolute -top-10 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                style={{ left: `${maxPercent}%` }}
              >
                {formatDisplayValue(maxVal)}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Min/Max labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{formatDisplayValue(min)}</span>
        <span>{formatDisplayValue(max)}</span>
      </div>
    </div>
  );
};

export default RangeSlider;