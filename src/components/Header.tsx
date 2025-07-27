import React from 'react';
import { Plus, CheckCircle, Clock, Filter } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onAddTask: () => void;
  completedCount: number;
  totalCount: number;
  filter: 'all' | 'pending' | 'completed';
  onFilterChange: (filter: 'all' | 'pending' | 'completed') => void;
}

const Header: React.FC<HeaderProps> = ({
  onAddTask,
  completedCount,
  totalCount,
  filter,
  onFilterChange
}) => {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <header className="header glass">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">
            TaskManager
          </h1>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">
              {completedCount} / {totalCount} 완료
            </span>
          </div>
        </div>

        <div className="header-right">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => onFilterChange('all')}
            >
              <Filter size={16} />
              전체
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => onFilterChange('pending')}
            >
              <Clock size={16} />
              진행중
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => onFilterChange('completed')}
            >
              <CheckCircle size={16} />
              완료
            </button>
          </div>

          <button
            className="btn btn-primary add-task-btn"
            onClick={() => {
              console.log('Add task button clicked');
              onAddTask();
            }}
          >
            <Plus size={20} />
            새 태스크
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 