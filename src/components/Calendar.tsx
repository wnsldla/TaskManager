import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Calendar.css';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const renderHeader = () => (
    <div className="calendar-header">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="calendar-nav-btn">
        <ChevronLeft size={20} />
      </button>
      <span className="calendar-month-year">
        {format(currentMonth, 'yyyy년 M월', { locale: ko })}
      </span>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="calendar-nav-btn">
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const date = ['일', '월', '화', '수', '목', '금', '토'];
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className={`calendar-day-label ${i === 0 ? 'sunday' : ''} ${i === 6 ? 'saturday' : ''}`} key={i}>
          {date[i]}
        </div>
      );
    }
    return <div className="calendar-days-grid">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        days.push(
          <div
            className={`calendar-cell ${
              !isSameMonth(day, monthStart)
                ? 'disabled'
                : isSameDay(day, selectedDate)
                ? 'selected'
                : ''
            } ${getDay(day) === 0 ? 'sunday' : ''} ${getDay(day) === 6 ? 'saturday' : ''}`}
            key={day.toString()}
            onClick={() => {
              onDateSelect(cloneDay);
              onClose();
            }}
          >
            <span className="number">{format(day, 'd')}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="calendar-row" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  return (
    <div className="calendar-popup">
      <div className="calendar-content glass">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
};

export default Calendar;