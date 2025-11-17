import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const AvailabilityCalendar = ({
  availableFrom = null,
  availableTo = null,
  blockedDates = [],
  onAvailabilityChange,
  minDate = new Date(),
  maxDate = null,
  className = ""
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({
    from: availableFrom ? new Date(availableFrom) : null,
    to: availableTo ? new Date(availableTo) : null
  });
  const [selectingFrom, setSelectingFrom] = useState(true);
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    if (onAvailabilityChange) {
      onAvailabilityChange({
        availableFrom: selectedDates.from,
        availableTo: selectedDates.to
      });
    }
  }, [selectedDates.from, selectedDates.to]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateBlocked = (date) => {
    return blockedDates.some(blocked => 
      date.toDateString() === new Date(blocked).toDateString()
    );
  };

  const isDateBefore = (date, compareDate) => {
    if (!compareDate) return false;
    return date < compareDate;
  };

  const isDateDisabled = (date) => {
    if (isDateBefore(date, minDate)) return true;
    if (maxDate && date > maxDate) return true;
    if (isDateBlocked(date)) return true;
    return false;
  };

  const isDateInRange = (date) => {
    if (!selectedDates.from || !selectedDates.to) return false;
    return date >= selectedDates.from && date <= selectedDates.to;
  };

  const isDateSelected = (date) => {
    if (!selectedDates.from && !selectedDates.to) return false;
    if (selectedDates.from && date.toDateString() === selectedDates.from.toDateString()) return true;
    if (selectedDates.to && date.toDateString() === selectedDates.to.toDateString()) return true;
    return false;
  };

  const isDateHovered = (date) => {
    if (!hoveredDate || !selectedDates.from || selectedDates.to) return false;
    const start = selectedDates.from;
    const end = hoveredDate;
    return date > Math.min(start, end) && date < Math.max(start, end);
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (selectingFrom || !selectedDates.from) {
      setSelectedDates({ from: date, to: null });
      setSelectingFrom(false);
    } else {
      if (date < selectedDates.from) {
        setSelectedDates({ from: date, to: selectedDates.from });
      } else {
        setSelectedDates({ from: selectedDates.from, to: date });
      }
      setSelectingFrom(true);
    }
  };

  const handleDateHover = (date) => {
    if (!isDateDisabled(date)) {
      setHoveredDate(date);
    }
  };

  const clearSelection = () => {
    setSelectedDates({ from: null, to: null });
    setSelectingFrom(true);
    setHoveredDate(null);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const renderCalendarDay = (date, isCurrentMonth = true) => {
    const isDisabled = isDateDisabled(date);
    const isSelected = isDateSelected(date);
    const inRange = isDateInRange(date);
    const isHovered = isDateHovered(date);
    
    let dayClasses = `
      w-8 h-8 text-sm rounded-lg border cursor-pointer transition-colors
      ${!isCurrentMonth ? 'text-gray-400' : ''}
      ${isDisabled ? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' : ''}
      ${isSelected && !isDisabled ? 'bg-blue-600 text-white border-blue-600' : ''}
      ${inRange && !isDisabled && !isSelected ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
      ${isHovered && !isDisabled ? 'bg-blue-50 border-blue-300' : ''}
      ${!isSelected && !inRange && !isHovered && !isDisabled && isCurrentMonth ? 'hover:bg-gray-100 border-gray-200' : ''}
      ${!isCurrentMonth || isDisabled ? 'border-transparent' : ''}
    `.trim();

    return (
      <button
        key={date.toISOString()}
        onClick={() => handleDateClick(date)}
        onMouseEnter={() => handleDateHover(date)}
        disabled={isDisabled}
        className={dayClasses}
        title={isDateBlocked(date) ? 'This date is blocked' : ''}
      >
        {date.getDate()}
      </button>
    );
  };

  const renderMonth = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
      days.push(renderCalendarDay(date, false));
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      days.push(renderCalendarDay(date, true));
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
      days.push(renderCalendarDay(date, false));
    }

    return days;
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString() : 'Not set';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
          <p className="text-sm text-gray-600">Set when your item is available for rent</p>
        </div>
        
        {(selectedDates.from || selectedDates.to) && (
          <button
            onClick={clearSelection}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Clear</span>
          </button>
        )}
      </div>

      {/* Selected Range Display */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Selected Availability</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Available From: </span>
            <span className="font-medium">{formatDate(selectedDates.from)}</span>
          </div>
          <div>
            <span className="text-gray-600">Available To: </span>
            <span className="font-medium">{formatDate(selectedDates.to)}</span>
          </div>
        </div>

        {selectingFrom && selectedDates.from && !selectedDates.to && (
          <p className="text-xs text-blue-600">Now select the end date</p>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {renderMonth()}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
          <span>In Range</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-1">How to use:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click a date to set when your item becomes available</li>
          <li>• Click another date to set when it's no longer available (optional)</li>
          <li>• Leave end date empty for indefinite availability</li>
          <li>• Gray dates are blocked or in the past</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;