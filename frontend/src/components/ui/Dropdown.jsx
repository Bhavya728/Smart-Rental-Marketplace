import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  searchable = false,
  multiple = false,
  clearable = false,
  className = "",
  dropdownClassName = "",
  optionClassName = "",
  renderOption,
  renderSelected,
  maxHeight = "200px",
  position = "bottom", // "bottom" | "top" | "auto"
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(
      searchable && searchTerm
        ? options.filter(option => 
            (option.label || option).toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options
    );
  }, [options, searchTerm, searchable]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleOptionClick = (option) => {
    const optionValue = option.value !== undefined ? option.value : option;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
  };

  const isSelected = (option) => {
    const optionValue = option.value !== undefined ? option.value : option;
    return multiple 
      ? Array.isArray(value) && value.includes(optionValue)
      : value === optionValue;
  };

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const selectedOption = options.find(opt => 
          (opt.value !== undefined ? opt.value : opt) === value[0]
        );
        return selectedOption?.label || selectedOption || value[0];
      }
      return `${value.length} selected`;
    }
    
    if (value !== null && value !== undefined && value !== '') {
      const selectedOption = options.find(opt => 
        (opt.value !== undefined ? opt.value : opt) === value
      );
      return selectedOption?.label || selectedOption || value;
    }
    
    return placeholder;
  };

  const hasValue = multiple 
    ? Array.isArray(value) && value.length > 0
    : value !== null && value !== undefined && value !== '';

  return (
    <div className={`relative ${className}`} ref={dropdownRef} {...props}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-between ${
          isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''
        }`}
      >
        <span className={`truncate ${!hasValue ? 'text-gray-500' : 'text-gray-900'}`}>
          {renderSelected ? renderSelected(value) : getDisplayValue()}
        </span>
        
        <div className="flex items-center space-x-1">
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Clear selection"
            >
              ×
            </button>
          )}
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg ${dropdownClassName}`}>
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div 
            className="py-1 overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'No results found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = option.value !== undefined ? option.value : option;
                const optionLabel = option.label || option;
                const selected = isSelected(option);
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between ${
                      selected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    } ${optionClassName}`}
                  >
                    <span className="truncate">
                      {renderOption ? renderOption(option, selected) : optionLabel}
                    </span>
                    {multiple && selected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;