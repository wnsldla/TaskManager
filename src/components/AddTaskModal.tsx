import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Clock, Flag, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Task, TaskPriority } from '../types/Task';
import Calendar from './Calendar';
import './AddTaskModal.css';

interface AddTaskModalProps {
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  editingTask?: Task;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onAddTask, editingTask }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const getDefaultDeadline = () => {
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    return now;
  };

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority || 'medium');
  const [deadline, setDeadline] = useState<Date>(editingTask?.deadline ? parseISO(editingTask.deadline) : getDefaultDeadline());
  const [repeatDays, setRepeatDays] = useState<number[]>(editingTask?.repeatDays || []);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setDeadline(editingTask.deadline ? parseISO(editingTask.deadline) : getDefaultDeadline());
      setRepeatDays(editingTask.repeatDays || []);
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask({
        title,
        description,
        priority,
        deadline: deadline.toISOString(),
        repeatDays,
      });
    }
  };

  const handleDateSelect = (date: Date) => {
    // 선택한 날짜를 그대로 사용 (시간은 00:00:00으로 설정)
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setDeadline(selectedDate);
    setIsCalendarOpen(false);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return '낮음';
      case 'medium': return '보통';
      case 'high': return '높음';
      default: return '보통';
    }
  };

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
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingTask ? '태스크 수정' : '새 태스크 추가'}</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">제목 *</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="태스크 제목" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">설명</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="태스크 설명" rows={3} />
          </div>

          <div className="form-group">
            <label>우선순위</label>
            <div className="priority-selector">
              {(['low', 'medium', 'high'] as TaskPriority[]).map((priorityOption) => (
                <button
                  key={priorityOption}
                  type="button"
                  className={`priority-btn ${priority === priorityOption ? 'active' : ''}`}
                  onClick={() => setPriority(priorityOption)}
                  style={{
                    backgroundColor: priority === priorityOption ? getPriorityColor(priorityOption) : 'transparent',
                    borderColor: getPriorityColor(priorityOption)
                  }}
                >
                  <Flag size={16} />
                  {getPriorityText(priorityOption)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>반복 요일</label>
            <div className="repeat-days">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <button
                  key={index}
                  type="button"
                  className={`repeat-day-btn ${repeatDays.includes(index) ? 'active' : ''}`}
                  onClick={() => {
                    if (repeatDays.includes(index)) {
                      setRepeatDays(repeatDays.filter(d => d !== index));
                    } else {
                      setRepeatDays([...repeatDays, index]);
                    }
                  }}
                >
                  {day}
                </button>
              ))}
              <button
                type="button"
                className={`repeat-day-btn everyday-btn ${repeatDays.length === 7 ? 'active' : ''}`}
                onClick={() => {
                  if (repeatDays.length === 7) {
                    setRepeatDays([]);
                  } else {
                    setRepeatDays([0, 1, 2, 3, 4, 5, 6]);
                  }
                }}
              >
                매일
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>마감일</label>
            <div className="date-picker-wrapper">
              <button type="button" className="date-display-btn" onClick={() => setIsCalendarOpen(true)}>
                <CalendarIcon size={18} />
                <span>{format(deadline, 'yyyy.MM.dd')}</span>
              </button>
              {isCalendarOpen && (
                <div ref={calendarRef} className="calendar-container" onClick={(e) => e.stopPropagation()}>
                  <Calendar selectedDate={deadline} onDateSelect={handleDateSelect} onClose={() => setIsCalendarOpen(false)} />
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="submit-btn">
              {editingTask ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal; 