import React, { useState } from 'react';
import { X, Calendar, AlertTriangle, Clock, Flag } from 'lucide-react';
import { TaskPriority } from '../types/Task';
import './AddTaskModal.css';

interface AddTaskModalProps {
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  editingTask?: Task;
}

interface Task {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: string;
  repeatDays?: number[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onAddTask, editingTask }) => {
  const [formData, setFormData] = useState<Task>({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    priority: editingTask?.priority || 'medium',
    dueDate: editingTask?.dueDate || '',
    repeatDays: editingTask?.repeatDays || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAddTask(formData);
    }
  };

  const handleInputChange = (field: keyof Task, value: string | TaskPriority | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} />;
      case 'medium': return <Clock size={16} />;
      case 'low': return <Flag size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content glass"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{editingTask ? '태스크 수정' : '새 태스크 추가'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">제목 *</label>
            <input
              id="title"
              type="text"
              className="input"
              placeholder="태스크 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">설명</label>
            <textarea
              id="description"
              className="input textarea"
              placeholder="태스크에 대한 자세한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>우선순위</label>
              <div className="priority-buttons">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    className={`priority-btn ${formData.priority === priority ? 'active' : ''}`}
                    onClick={() => handleInputChange('priority', priority)}
                    style={{
                      borderColor: formData.priority === priority ? getPriorityColor(priority) : 'transparent',
                      color: formData.priority === priority ? getPriorityColor(priority) : 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    {getPriorityIcon(priority)}
                    {priority === 'low' && '낮음'}
                    {priority === 'medium' && '보통'}
                    {priority === 'high' && '높음'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">마감일</label>
              <div className="date-input-wrapper">
                <Calendar size={18} className="date-icon" />
                <input
                  id="dueDate"
                  type="datetime-local"
                  className="input date-input"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>
                          </div>
            </div>

            <div className="form-group">
              <label>반복 요일</label>
              <div className="repeat-days">
                <button
                  type="button"
                  className={`repeat-btn ${formData.repeatDays?.length === 7 ? 'active' : ''}`}
                  onClick={() => {
                    if (formData.repeatDays?.length === 7) {
                      handleInputChange('repeatDays', []);
                    } else {
                      handleInputChange('repeatDays', [0, 1, 2, 3, 4, 5, 6]);
                    }
                  }}
                >
                  매일
                </button>
                <button
                  type="button"
                  className={`repeat-btn ${formData.repeatDays?.includes(1) ? 'active' : ''}`}
                  onClick={() => {
                    const currentDays = formData.repeatDays || [];
                    const newDays = currentDays.includes(1) 
                      ? currentDays.filter(day => day !== 1)
                      : [...currentDays, 1];
                    handleInputChange('repeatDays', newDays);
                  }}
                >
                  월
                </button>
                <button
                  type="button"
                  className={`repeat-btn ${formData.repeatDays?.includes(2) ? 'active' : ''}`}
                  onClick={() => {
                    const currentDays = formData.repeatDays || [];
                    const newDays = currentDays.includes(2) 
                      ? currentDays.filter(day => day !== 2)
                      : [...currentDays, 2];
                    handleInputChange('repeatDays', newDays);
                  }}
                >
                  화
                </button>
                <button
                  type="button"
                  className={`repeat-btn ${formData.repeatDays?.includes(3) ? 'active' : ''}`}
                  onClick={() => {
                    const currentDays = formData.repeatDays || [];
                    const newDays = currentDays.includes(3) 
                      ? currentDays.filter(day => day !== 3)
                      : [...currentDays, 3];
                    handleInputChange('repeatDays', newDays);
                  }}
                >
                  수
                </button>
                <button
                  type="button"
                  className={`repeat-btn ${formData.repeatDays?.includes(4) ? 'active' : ''}`}
                  onClick={() => {
                    const currentDays = formData.repeatDays || [];
                    const newDays = currentDays.includes(4) 
                      ? currentDays.filter(day => day !== 4)
                      : [...currentDays, 4];
                    handleInputChange('repeatDays', newDays);
                  }}
                >
                  목
                </button>
                <button
                  type="button"
                  className={`repeat-btn ${formData.repeatDays?.includes(5) ? 'active' : ''}`}
                  onClick={() => {
                    const currentDays = formData.repeatDays || [];
                    const newDays = currentDays.includes(5) 
                      ? currentDays.filter(day => day !== 5)
                      : [...currentDays, 5];
                    handleInputChange('repeatDays', newDays);
                  }}
                >
                  금
                </button>
                <button
                  type="button"
                  className={`repeat-btn ${formData.repeatDays?.includes(6) ? 'active' : ''}`}
                  onClick={() => {
                    const currentDays = formData.repeatDays || [];
                    const newDays = currentDays.includes(6) 
                      ? currentDays.filter(day => day !== 6)
                      : [...currentDays, 6];
                    handleInputChange('repeatDays', newDays);
                  }}
                >
                  토
                </button>
                <button
                  type="button"
                  className={`repeat-btn ${formData.repeatDays?.includes(0) ? 'active' : ''}`}
                  onClick={() => {
                    const currentDays = formData.repeatDays || [];
                    const newDays = currentDays.includes(0) 
                      ? currentDays.filter(day => day !== 0)
                      : [...currentDays, 0];
                    handleInputChange('repeatDays', newDays);
                  }}
                >
                  일
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                취소
              </button>
              <button type="submit" className="btn btn-primary">
                {editingTask ? '수정 완료' : '태스크 추가'}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal; 