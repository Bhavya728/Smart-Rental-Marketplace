import React, { useState, useEffect, useRef } from 'react';
import './DateRangePicker.css';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onDateChange, 
  minDate = new Date(),
  maxDate = null,
  unavailableDates = [],
  placeholder = "Select dates",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const pickerRef = useRef(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    if (disabled || !date) return;

    // Check if date is available
    if (isDateUnavailable(date)) return;

    if (selectingStart) {
      onDateChange(date, endDate);
      setSelectingStart(false);
    } else {
      if (date < startDate) {
        // If selected end date is before start date, swap them
        onDateChange(date, startDate);
      } else {
        onDateChange(startDate, date);
      }
      setIsOpen(false);
      setSelectingStart(true);
    }
  };

  const isDateUnavailable = (date) => {
    const dateStr = date.toDateString();
    
    // Check if date is before min date
    if (minDate && date < minDate) return true;
    
    // Check if date is after max date
    if (maxDate && date > maxDate) return true;
    
    // Check if date is in unavailable dates
    return unavailableDates.some(unavailableDate => 
      new Date(unavailableDate).toDateString() === dateStr
    );
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (date) => {
    const dateStr = date.toDateString();
    return (startDate && startDate.toDateString() === dateStr) ||
           (endDate && endDate.toDateString() === dateStr);
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    } else if (startDate) {
      return `${formatDisplayDate(startDate)} - Select end date`;
    }
    return placeholder;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className={`date-range-picker ${className}`} ref={pickerRef}>
      <button
        type="button"
        className={`date-picker-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="date-picker-text">
          {getDisplayText()}
        </span>
        <svg className="date-picker-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="date-picker-dropdown">
          <div className="calendar-header">
            <button
              type="button"
              className="nav-button"
              onClick={() => navigateMonth(-1)}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="month-year">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              type="button"
              className="nav-button"
              onClick={() => navigateMonth(1)}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="calendar-grid">
            {dayNames.map(day => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
            
            {calendarDays.map((date, index) => (
              <button
                key={index}
                type="button"
                className={`calendar-day ${
                  !date ? 'empty' : ''
                } ${
                  date && isDateUnavailable(date) ? 'unavailable' : ''
                } ${
                  date && isDateSelected(date) ? 'selected' : ''
                } ${
                  date && isDateInRange(date) ? 'in-range' : ''
                } ${
                  date && selectingStart && date.toDateString() === new Date().toDateString() ? 'today' : ''
                }`}
                onClick={() => handleDateClick(date)}
                disabled={!date || isDateUnavailable(date)}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>

          <div className="calendar-footer">
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                onDateChange(null, null);
                setSelectingStart(true);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;