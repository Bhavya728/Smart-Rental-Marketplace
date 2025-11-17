import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isToday, isBefore } from 'date-fns';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const DateSelector = ({ 
  startDate, 
  endDate, 
  onDateChange, 
  listingId,
  unavailableDates = [],
  minNights = 1,
  maxNights = 30,
  className = ""
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [availabilityData, setAvailabilityData] = useState({});
  const [calendarError, setCalendarError] = useState(null);

  // Load availability data for the current month
  useEffect(() => {
    if (listingId) {
      loadAvailabilityData();
    }
  }, [currentMonth, listingId]);

  const loadAvailabilityData = async () => {
    try {
      setIsCheckingAvailability(true);
      setCalendarError(null);

      // Mock availability check - replace with actual API call
      const monthStart = startOfWeek(currentMonth);
      const monthEnd = endOfWeek(addDays(currentMonth, 31));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock availability data - some dates are unavailable
      const mockUnavailable = [
        format(addDays(currentMonth, 5), 'yyyy-MM-dd'),
        format(addDays(currentMonth, 6), 'yyyy-MM-dd'),
        format(addDays(currentMonth, 15), 'yyyy-MM-dd'),
        format(addDays(currentMonth, 16), 'yyyy-MM-dd'),
        format(addDays(currentMonth, 25), 'yyyy-MM-dd')
      ];

      const newAvailabilityData = {};
      eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        newAvailabilityData[dateStr] = {
          available: !mockUnavailable.includes(dateStr) && !unavailableDates.includes(dateStr),
          price: Math.floor(Math.random() * 100) + 50 // Mock price
        };
      });

      setAvailabilityData(newAvailabilityData);
    } catch (error) {
      setCalendarError('Failed to load availability');
      console.error('Error loading availability:', error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const isDateUnavailable = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return !availabilityData[dateStr]?.available || isBefore(date, new Date());
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateRangeStart = (date) => {
    return startDate && isSameDay(date, startDate);
  };

  const isDateRangeEnd = (date) => {
    return endDate && isSameDay(date, endDate);
  };

  const isDateInHoverRange = (date) => {
    if (!startDate || !hoveredDate || endDate) return false;
    const rangeStart = startDate;
    const rangeEnd = hoveredDate;
    return date > rangeStart && date < rangeEnd;
  };

  const handleDateClick = (date) => {
    if (isDateUnavailable(date)) return;

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      onDateChange({ startDate: date, endDate: null });
    } else if (startDate && !endDate) {
      // Complete selection
      if (isBefore(date, startDate)) {
        // Clicked date is before start date, make it the new start
        onDateChange({ startDate: date, endDate: startDate });
      } else {
        // Normal end date selection
        const daysDiff = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24));
        if (daysDiff < minNights) {
          // Too few nights
          return;
        }
        if (daysDiff > maxNights) {
          // Too many nights
          return;
        }
        onDateChange({ startDate, endDate: date });
      }
    }
  };

  const renderCalendarDay = (date) => {
    const dayStr = format(date, 'd');
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isUnavailable = isDateUnavailable(date);
    const inRange = isDateInRange(date);
    const inHoverRange = isDateInHoverRange(date);
    const isRangeStart = isDateRangeStart(date);
    const isRangeEnd = isDateRangeEnd(date);
    const todayDate = isToday(date);

    let dayClasses = `
      relative w-10 h-10 flex items-center justify-center text-sm cursor-pointer
      transition-all duration-200 ease-in-out
    `;

    if (!isCurrentMonth) {
      dayClasses += ' text-gray-300 cursor-not-allowed';
    } else if (isUnavailable) {
      dayClasses += ' text-gray-400 cursor-not-allowed bg-gray-100';
    } else if (isRangeStart || isRangeEnd) {
      dayClasses += ' bg-blue-500 text-white font-semibold z-10';
    } else if (inRange) {
      dayClasses += ' bg-blue-100 text-blue-700';
    } else if (inHoverRange) {
      dayClasses += ' bg-blue-50 text-blue-600';
    } else if (todayDate) {
      dayClasses += ' bg-gray-100 text-gray-900 font-semibold';
    } else {
      dayClasses += ' text-gray-700 hover:bg-gray-50';
    }

    if (isRangeStart) {
      dayClasses += ' rounded-l-lg';
    } else if (isRangeEnd) {
      dayClasses += ' rounded-r-lg';
    } else if (inRange || inHoverRange) {
      dayClasses += ' rounded-none';
    } else {
      dayClasses += ' rounded-lg';
    }

    return (
      <div
        key={dateStr}
        className={dayClasses}
        onClick={() => handleDateClick(date)}
        onMouseEnter={() => setHoveredDate(date)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        <span className="relative z-10">{dayStr}</span>
        
        {/* Price indicator */}
        {isCurrentMonth && !isUnavailable && availabilityData[dateStr]?.price && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
            ${availabilityData[dateStr].price}
          </div>
        )}

        {/* Availability indicators */}
        {isCurrentMonth && (
          <div className="absolute top-1 right-1">
            {isUnavailable ? (
              <XCircle size={8} className="text-red-500" />
            ) : (
              <CheckCircle size={8} className="text-green-500" />
            )}
          </div>
        )}

        {/* Today indicator */}
        {todayDate && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
        )}
      </div>
    );
  };

  const renderCalendar = () => {
    const monthStart = startOfWeek(currentMonth);
    const monthEnd = endOfWeek(addDays(currentMonth, 31));
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="calendar-grid">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(-1)}
            className="calendar-nav-btn"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <h3 className="font-semibold text-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(1)}
            className="calendar-nav-btn"
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(renderCalendarDay)}
        </div>
      </div>
    );
  };

  const getSelectedDatesSummary = () => {
    if (startDate && endDate) {
      const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      return (
        <div className="selected-dates-summary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Selected Dates:</span>
            <span className="text-sm text-gray-600">{nights} night{nights !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>{format(startDate, 'MMM d, yyyy')}</span>
            <span>→</span>
            <span>{format(endDate, 'MMM d, yyyy')}</span>
          </div>
        </div>
      );
    } else if (startDate) {
      return (
        <div className="selected-dates-summary">
          <div className="text-sm font-medium mb-1">Check-in:</div>
          <div className="text-sm text-gray-600">{format(startDate, 'MMM d, yyyy')}</div>
          <div className="text-xs text-gray-500 mt-1">Select checkout date</div>
        </div>
      );
    }
    return (
      <div className="selected-dates-summary">
        <div className="text-sm text-gray-500">Select your check-in date</div>
      </div>
    );
  };

  return (
    <Card className={`date-selector ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold">Select Dates</h2>
        </div>

        {calendarError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{calendarError}</p>
          </div>
        )}

        {isCheckingAvailability && (
          <div className="mb-4 flex items-center justify-center py-8">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-gray-600">Loading availability...</span>
          </div>
        )}

        {!isCheckingAvailability && renderCalendar()}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          {getSelectedDatesSummary()}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle size={12} className="text-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle size={12} className="text-red-500" />
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
        </div>

        {/* Booking constraints */}
        <div className="mt-4 text-xs text-gray-600">
          <div>Minimum stay: {minNights} night{minNights !== 1 ? 's' : ''}</div>
          <div>Maximum stay: {maxNights} nights</div>
        </div>
      </div>

      <style jsx>{`
        .date-selector {
          max-width: 400px;
        }

        .calendar-grid {
          user-select: none;
        }

        .calendar-nav-btn {
          transition: all 0.2s ease;
        }

        .calendar-nav-btn:hover {
          background-color: #f3f4f6;
        }

        .selected-dates-summary {
          min-height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .date-selector {
            max-width: 100%;
          }
          
          .calendar-grid {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </Card>
  );
};

export default DateSelector;