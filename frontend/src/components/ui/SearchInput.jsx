import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../hooks/useDebounce';
import searchService from '../../services/searchService';
import { cn } from '../../utils/cn';

const SearchInput = ({ 
  value = '', 
  onChange, 
  onSearch,
  placeholder = "Search for items to rent...",
  className = "",
  showSuggestions = true,
  autoFocus = false
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debouncedValue = useDebounce(value, 300);

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 2 && showSuggestions) {
      fetchSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
    }
  }, [debouncedValue, showSuggestions]);

  const fetchSuggestions = async (query) => {
    try {
      setLoading(true);
      const response = await searchService.getSearchSuggestions(query, 6);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    
    if (newValue.length >= 2) {
      setShowSuggestionsList(true);
    } else {
      setShowSuggestionsList(false);
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestionsList) return;

    const allSuggestions = [...(value.length < 2 ? recentSearches : []), ...suggestions];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSuggestionClick(allSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
        
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const searchTerm = suggestion.text || suggestion;
    onChange(searchTerm);
    setShowSuggestionsList(false);
    setSelectedIndex(-1);
    
    // Save to recent searches
    saveRecentSearch(searchTerm);
    
    // Trigger search
    onSearch && onSearch(searchTerm);
  };

  const handleSearch = () => {
    if (value.trim()) {
      saveRecentSearch(value.trim());
      onSearch && onSearch(value.trim());
      setShowSuggestionsList(false);
    }
  };

  const saveRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleFocus = () => {
    if (showSuggestions) {
      if (value.length >= 2) {
        setShowSuggestionsList(true);
      } else if (recentSearches.length > 0) {
        setShowSuggestionsList(true);
      }
    }
  };

  const handleClickOutside = (e) => {
    if (
      inputRef.current && 
      !inputRef.current.contains(e.target) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.target)
    ) {
      setShowSuggestionsList(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'listing': return '📦';
      case 'category': return '🏷️';
      case 'location': return '📍';
      default: return '🔍';
    }
  };

  const allSuggestions = value.length < 2 && recentSearches.length > 0 
    ? recentSearches.map(search => ({ text: search, type: 'recent' }))
    : suggestions;

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-lg 
                     shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
                     transition-all duration-200 text-gray-900 placeholder-gray-500"
        />
        
        {value && (
          <button
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setShowSuggestionsList(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                       hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSuggestionsList && (allSuggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 
                       rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {value.length < 2 && recentSearches.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Recent Searches
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150",
                      selectedIndex === index
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-2 text-gray-400" />
                      {search}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="p-2">
                {value.length >= 2 && (
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Suggestions
                  </div>
                )}
                {suggestions.map((suggestion, index) => {
                  const adjustedIndex = value.length < 2 ? recentSearches.length + index : index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 flex items-center",
                        selectedIndex === adjustedIndex
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <span className="mr-3 text-lg">
                        {getSuggestionIcon(suggestion.type)}
                      </span>
                      <span className="flex-1">{suggestion.text}</span>
                      {suggestion.type === 'category' && (
                        <TrendingUp className="w-3 h-3 text-gray-400 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;