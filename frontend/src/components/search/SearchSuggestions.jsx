import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, TrendingUp, MapPin, Tag, Star, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const SearchSuggestions = ({
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  isVisible = false,
  onSelect,
  onClear,
  onRemoveRecent,
  loading = false,
  className = "",
  maxHeight = "400px"
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions, isVisible]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isVisible) return;

      const totalItems = getAllItems().length;
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
          break;
        case 'Enter':
          event.preventDefault();
          const items = getAllItems();
          if (selectedIndex >= 0 && items[selectedIndex]) {
            handleSelect(items[selectedIndex]);
          }
          break;
        case 'Escape':
          onClear?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedIndex, suggestions, recentSearches, popularSearches]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  const getAllItems = () => {
    const items = [];
    
    // Add suggestions first
    suggestions.forEach(item => items.push({ ...item, type: 'suggestion' }));
    
    // Add recent searches
    recentSearches.forEach(item => items.push({ 
      query: item, 
      type: 'recent',
      icon: Clock 
    }));
    
    // Add popular searches
    popularSearches.forEach(item => items.push({ 
      ...item, 
      type: 'popular',
      icon: TrendingUp 
    }));
    
    return items;
  };

  const handleSelect = (item) => {
    if (item.type === 'suggestion') {
      onSelect?.(item.query || item.text, item);
    } else {
      onSelect?.(item.query || item.text, item);
    }
  };

  const getSuggestionIcon = (suggestion) => {
    switch (suggestion.type) {
      case 'location':
        return MapPin;
      case 'category':
        return Tag;
      case 'listing':
        return Star;
      default:
        return Search;
    }
  };

  const formatSuggestionText = (suggestion) => {
    if (suggestion.type === 'location') {
      return `${suggestion.text} - ${suggestion.count} listings`;
    }
    if (suggestion.type === 'category') {
      return `${suggestion.text} (${suggestion.count})`;
    }
    if (suggestion.type === 'listing') {
      return suggestion.text;
    }
    return suggestion.text || suggestion.query;
  };

  const allItems = getAllItems();

  if (!isVisible || (allItems.length === 0 && !loading)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden",
          className
        )}
        style={{ maxHeight }}
      >
        <div className="overflow-y-auto" style={{ maxHeight }}>
          {loading ? (
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-gray-500">Searching...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Suggestions
                    </span>
                  </div>
                  {suggestions.map((suggestion, index) => {
                    const Icon = getSuggestionIcon(suggestion);
                    const globalIndex = index;
                    
                    return (
                      <motion.button
                        key={`suggestion-${index}`}
                        ref={el => itemRefs.current[globalIndex] = el}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelect(suggestion)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                          selectedIndex === globalIndex && "bg-primary-50 text-primary-700"
                        )}
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {formatSuggestionText(suggestion)}
                          </div>
                          {suggestion.subtitle && (
                            <div className="text-xs text-gray-500 truncate">
                              {suggestion.subtitle}
                            </div>
                          )}
                        </div>
                        {suggestion.type === 'listing' && suggestion.price && (
                          <div className="text-sm font-medium text-gray-600">
                            ${suggestion.price}/day
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Recent Searches
                    </span>
                    <button
                      onClick={() => onClear?.('recent')}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((query, index) => {
                    const globalIndex = suggestions.length + index;
                    
                    return (
                      <motion.div
                        key={`recent-${index}`}
                        ref={el => itemRefs.current[globalIndex] = el}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (suggestions.length + index) * 0.05 }}
                        className={cn(
                          "flex items-center group",
                          selectedIndex === globalIndex && "bg-primary-50"
                        )}
                      >
                        <button
                          onClick={() => handleSelect({ query, type: 'recent' })}
                          className={cn(
                            "flex-1 flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                            selectedIndex === globalIndex && "text-primary-700"
                          )}
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 truncate">{query}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveRecent?.(query);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Popular Searches */}
              {popularSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Popular Searches
                    </span>
                  </div>
                  {popularSearches.map((item, index) => {
                    const globalIndex = suggestions.length + recentSearches.length + index;
                    
                    return (
                      <motion.button
                        key={`popular-${index}`}
                        ref={el => itemRefs.current[globalIndex] = el}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (suggestions.length + recentSearches.length + index) * 0.05 }}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                          selectedIndex === globalIndex && "bg-primary-50 text-primary-700"
                        )}
                      >
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-700">{item.query}</span>
                          {item.count && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({item.count} searches)
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* No Results */}
              {allItems.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No suggestions found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {allItems.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Use ↑↓ to navigate, Enter to select</span>
              <span>{allItems.length} result{allItems.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchSuggestions;