import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Calendar from './Calendar';
import './DateSelector.css';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const goToPreviousDay = () => onDateChange(subDays(selectedDate, 1));
  const goToNextDay = () => onDateChange(addDays(selectedDate, 1));

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setIsCalendarOpen(false);
  };

  // 외부 클릭 시 캘린더 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="date-selector">
      <button className="date-nav-btn" onClick={goToPreviousDay} aria-label="이전 날짜">
        <ChevronLeft size={24} />
      </button>

      <div className="date-display-wrapper">
        <button className="date-display-btn glass" onClick={() => setIsCalendarOpen(true)}>
          <CalendarIcon size={20} className="calendar-icon" />
          <span>{format(selectedDate, 'yy년 M월 d일 (eee)', { locale: ko })}</span>
        </button>
        {isCalendarOpen && (
          <div ref={calendarRef}>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onClose={() => setIsCalendarOpen(false)}
            />
          </div>
        )}
      </div>

      <button className="date-nav-btn" onClick={goToNextDay} aria-label="다음 날짜">
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default DateSelector; 