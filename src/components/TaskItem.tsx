import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Trash2, 
  Edit,
  Calendar
} from 'lucide-react';
import { Task, TaskPriority } from '../types/Task';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleComplete = () => {
    const updates: Partial<Task> = {
      status: task.status === 'completed' ? 'pending' : 'completed',
      completedAt: task.status === 'completed' ? undefined : new Date().toISOString()
    };
    onUpdate(task.id, updates);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'HIGH';
      case 'medium': return 'MID';
      case 'low': return 'LOW';
      default: return 'MID';
    }
  };

  const getRepeatText = (repeatDays: number[]) => {
    if (!repeatDays || repeatDays.length === 0) return '';
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 매일 반복인 경우
    if (repeatDays.length === 7) {
      return '매일 반복';
    }
    
    // 특정 요일들 반복인 경우 - 월~일 순서로 정렬
    const sortedDays = [...repeatDays].sort((a, b) => {
      // 월요일(1)부터 시작하도록 조정
      const adjustedA = a === 0 ? 7 : a; // 일요일을 7로 변경
      const adjustedB = b === 0 ? 7 : b;
      return adjustedA - adjustedB;
    });
    const selectedDays = sortedDays.map(day => dayNames[day]).join(', ');
    return `${selectedDays}마다 반복`;
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';

  return (
    <div 
      className={`task-item card ${task.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
    >
      <div className="task-header">
        <div className="task-main">
          <button 
            className="complete-btn"
            onClick={toggleComplete}
            aria-label={task.status === 'completed' ? '완료 취소' : '완료'}
          >
            {task.status === 'completed' ? (
              <CheckCircle size={24} className="completed-icon" />
            ) : (
              <Circle size={24} />
            )}
          </button>

          <div className="task-content" onClick={() => setIsExpanded(!isExpanded)}>
            <h3 className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`task-description ${task.status === 'completed' ? 'completed' : ''}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="task-actions">
          <div className="task-meta">
            <div 
              className="priority-badge"
              style={{ color: getPriorityColor(task.priority) }}
              title={`우선순위: ${task.priority}`}
            >
              {getPriorityText(task.priority)}
            </div>
            
            {task.dueDate && (
              <div className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                <Calendar size={16} />
                <span>
                  {format(new Date(task.dueDate), 'MMM dd', { locale: ko })}
                </span>
              </div>
            )}
            {task.repeatDays && task.repeatDays.length > 0 && (
              <div className="repeat-indicator">
                <span>{getRepeatText(task.repeatDays)}</span>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button 
              className="edit-btn"
              onClick={() => onEdit(task)}
              aria-label="수정"
            >
              <Edit size={18} />
            </button>
            <button 
              className="delete-btn"
              onClick={() => onDelete(task.id)}
              aria-label="삭제"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && task.description && (
        <div className="task-details">
          <div className="task-description-full">
            {task.description}
          </div>
          <div className="task-timestamps">
            <span>생성: {format(new Date(task.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</span>
            {task.completedAt && (
              <span>완료: {format(new Date(task.completedAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem; 