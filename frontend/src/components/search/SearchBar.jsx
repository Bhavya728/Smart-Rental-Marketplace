import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Calendar, Users, SlidersHorizontal } from 'lucide-react';
import Button from '../ui/Button';
import SearchInput from '../ui/SearchInput';
import { cn } from '../../utils/cn';

const SearchBar = ({ 
  searchQuery, 
  onSearch, 
  filters, 
  onFiltersChange,
  onShowFilters,
  showFilters = false,
  suggestions = [],
  loading = false,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    ...filters
  });

  useEffect(() => {
    setLocalFilters(prev => ({ ...prev, ...filters }));
  }, [filters]);

  const handleQuickSearch = (query) => {
    onSearch(query);
    // Also apply current filters when searching
    onFiltersChange(localFilters);
  };

  const handleLocationChange = (location) => {
    const newFilters = { ...localFilters, location };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleGuestsChange = (guests) => {
    const newFilters = { ...localFilters, guests };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const hasActiveFilters = () => {
    return localFilters.location || 
           localFilters.checkIn || 
           localFilters.checkOut || 
           localFilters.guests > 1 ||
           localFilters.category ||
           localFilters.minPrice ||
           localFilters.maxPrice ||
           (localFilters.features && localFilters.features.length > 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinCheckOutDate = () => {
    if (!localFilters.checkIn) return getMinDate();
    const checkIn = new Date(localFilters.checkIn);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Main Search Bar */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <SearchInput
              value={searchQuery}
              onChange={onSearch}
              placeholder="Search for anything..."
              suggestions={suggestions}
              loading={loading}
              showIcon={false}
              className="border-0 rounded-none"
              inputClassName="px-6 py-4 text-lg"
            />
          </div>

          {/* Location Filter */}
          <div className="border-l border-gray-200 px-6 py-4 min-w-0 flex-1">
            <div className="flex items-center text-gray-500 mb-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">WHERE</span>
            </div>
            <input
              type="text"
              value={localFilters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="Add location"
              className="w-full text-sm border-0 outline-0 placeholder-gray-400"
            />
          </div>

          {/* Check-in Date */}
          <div className="border-l border-gray-200 px-6 py-4 min-w-0 flex-1">
            <div className="flex items-center text-gray-500 mb-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">CHECK-IN</span>
            </div>
            <input
              type="date"
              value={localFilters.checkIn}
              onChange={(e) => handleDateChange('checkIn', e.target.value)}
              min={getMinDate()}
              className="w-full text-sm border-0 outline-0 text-gray-700"
            />
          </div>

          {/* Check-out Date */}
          <div className="border-l border-gray-200 px-6 py-4 min-w-0 flex-1">
            <div className="flex items-center text-gray-500 mb-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">CHECK-OUT</span>
            </div>
            <input
              type="date"
              value={localFilters.checkOut}
              onChange={(e) => handleDateChange('checkOut', e.target.value)}
              min={getMinCheckOutDate()}
              className="w-full text-sm border-0 outline-0 text-gray-700"
            />
          </div>

          {/* Guests */}
          <div className="border-l border-gray-200 px-6 py-4 min-w-0 flex-1">
            <div className="flex items-center text-gray-500 mb-1">
              <Users className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">GUESTS</span>
            </div>
            <select
              value={localFilters.guests}
              onChange={(e) => handleGuestsChange(parseInt(e.target.value))}
              className="w-full text-sm border-0 outline-0 text-gray-700"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} guest{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Search & Filter Buttons */}
          <div className="flex items-center px-6 py-4 space-x-2">
            <Button
              onClick={onShowFilters}
              variant="outline"
              size="sm"
              className={cn(
                "relative",
                showFilters && "bg-gray-100"
              )}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              Filters
              {hasActiveFilters() && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
            <Button
              onClick={() => handleQuickSearch(searchQuery)}
              disabled={loading}
              className="px-6"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Collapsed State */}
          <div 
            className="flex items-center p-4 cursor-pointer"
            onClick={toggleExpanded}
          >
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={onSearch}
                placeholder="Where are you going?"
                suggestions={suggestions}
                loading={loading}
                showIcon={false}
                className="border-0"
                inputClassName="text-lg"
                readOnly={true}
              />
            </div>
            <div className="ml-4 flex items-center space-x-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowFilters();
                }}
                variant="outline"
                size="sm"
                className="relative"
              >
                <Filter className="w-4 h-4" />
                {hasActiveFilters() && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Mobile State */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  {/* Search Input */}
                  <div>
                    <SearchInput
                      value={searchQuery}
                      onChange={onSearch}
                      placeholder="Search for anything..."
                      suggestions={suggestions}
                      loading={loading}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={localFilters.location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        placeholder="Where to?"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={localFilters.checkIn}
                        onChange={(e) => handleDateChange('checkIn', e.target.value)}
                        min={getMinDate()}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={localFilters.checkOut}
                        onChange={(e) => handleDateChange('checkOut', e.target.value)}
                        min={getMinCheckOutDate()}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guests
                    </label>
                    <select
                      value={localFilters.guests}
                      onChange={(e) => handleGuestsChange(parseInt(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>
                          {num} guest{num !== 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-2">
                    <Button
                      onClick={toggleExpanded}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        handleQuickSearch(searchQuery);
                        setIsExpanded(false);
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick Filters Pills */}
      {(localFilters.location || localFilters.checkIn || localFilters.checkOut || localFilters.guests > 1) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mt-3"
        >
          {localFilters.location && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              {localFilters.location}
            </div>
          )}
          {localFilters.checkIn && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(localFilters.checkIn)}
            </div>
          )}
          {localFilters.checkOut && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(localFilters.checkOut)}
            </div>
          )}
          {localFilters.guests > 1 && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
              <Users className="w-3 h-3 mr-1" />
              {localFilters.guests} guests
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;