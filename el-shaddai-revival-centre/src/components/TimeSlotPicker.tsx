'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react';
import { TimeSlot } from '@/types/counselling';
import { formatTimeForDisplay } from '@/types/counselling';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
}

export default function TimeSlotPicker({
  slots,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  disabled = false,
}: TimeSlotPickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Start from today or the previous Monday
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek + 1);
    return start;
  });

  // Generate dates for the next 2 weeks (weekdays only)
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(date);
      }
    }
    return dates;
  }, []);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, TimeSlot[]> = {};
    slots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      if (slot.isAvailable) {
        grouped[slot.date].push(slot);
      }
    });
    // Sort slots by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [slots]);

  // Get available times for selected date
  const availableTimes = selectedDate ? slotsByDate[selectedDate] || [] : [];

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const displayDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Get dates for current week view
  const currentWeekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      // Check if it's a weekday
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    return dates;
  }, [currentWeekStart]);

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPreviousWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={disabled}
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800">
          {currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={goToNextWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={disabled}
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-5 gap-2">
        {currentWeekDates.map((date) => {
          const dateStr = formatDate(date);
          const isSelected = selectedDate === dateStr;
          const hasSlots = slotsByDate[dateStr] && slotsByDate[dateStr].length > 0;
          const isPast = new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => {
                if (hasSlots && !isPast) {
                  onDateChange(dateStr);
                }
              }}
              disabled={!hasSlots || isPast || disabled}
              className={`p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-[#C8102E] bg-[#C8102E] text-white'
                  : hasSlots && !isPast
                  ? 'border-gray-200 hover:border-[#C8102E] bg-white text-gray-800'
                  : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="text-xs font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold">{date.getDate()}</div>
              {hasSlots && !isPast && !isSelected && (
                <div className="text-xs text-green-600 mt-1">
                  {slotsByDate[dateStr].length} slots
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={18} />
            Available Times for {displayDate(selectedDate)}
          </h4>
          
          {availableTimes.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {availableTimes.map((slot) => {
                const isSelected = selectedTime === slot.startTime;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onTimeChange(slot.startTime)}
                    disabled={disabled}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-[#C8102E] bg-[#C8102E] text-white'
                        : 'border-gray-200 hover:border-[#003399] bg-white text-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isSelected && <Check size={14} />}
                      <span className="font-medium">{formatTimeForDisplay(slot.startTime)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No available time slots for this date</p>
              <p className="text-sm text-gray-400">Please select another date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

