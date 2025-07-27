import React from 'react';
import TaskItem from './TaskItem';
import { Task } from '../types/Task';
import { ClipboardList } from 'lucide-react';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTask, onDeleteTask, onEditTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <ClipboardList size={64} />
        </div>
        <h3>태스크가 없습니다</h3>
        <p>새로운 태스크를 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task, index) => (
        <div key={task.id}>
                      <TaskItem
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
        </div>
      ))}
    </div>
  );
};

export default TaskList; 