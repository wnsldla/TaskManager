import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TaskList from './components/TaskList';
import AddTaskModal from './components/AddTaskModal';
import { Task } from './types/Task';
import { taskDB } from './database/supabase';
import './App.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Load tasks from database on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        console.log('Loading tasks from Supabase...');
        const dbTasks = await taskDB.getAllTasks();
        console.log('Tasks loaded successfully:', dbTasks);
        setTasks(dbTasks);
      } catch (error) {
        console.error('Failed to load tasks from database:', error);
      }
    };
    loadTasks();
  }, []);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    
    try {
      await taskDB.addTask(newTask);
      setTasks(prev => [newTask, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add task to database:', error);
    }
  };

  // 반복 태스크 자동 생성 함수
  const checkAndCreateRepeatTasks = () => {
    const now = new Date();
    const today = now.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    
    tasks.forEach(task => {
      if (task.repeatDays && task.repeatDays.length > 0) {
        // 오늘 요일이 반복 요일에 포함되어 있는지 확인
        if (task.repeatDays.includes(today)) {
          // 오늘 날짜의 00시를 기준으로 태스크가 이미 존재하는지 확인
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
          
          const existingTask = tasks.find(t => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return taskDate >= todayStart && taskDate < todayEnd && 
                   t.title === task.title && 
                   t.repeatDays?.join(',') === task.repeatDays?.join(',');
          });
          
          // 오늘 태스크가 없으면 자동 생성
          if (!existingTask) {
            const newRepeatTask: Task = {
              ...task,
              id: Date.now().toString() + Math.random(),
              createdAt: new Date().toISOString(),
              status: 'pending',
              dueDate: todayStart.toISOString(),
            };
            setTasks(prev => [newRepeatTask, ...prev]);
          }
        }
      }
    });
  };

  // 매일 자정에 반복 태스크 체크
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        checkAndCreateRepeatTasks();
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(checkInterval);
  }, [tasks]);

  const editTask = (task: Task) => {
    setEditingTask(task);
  };

  const updateTaskFromModal = async (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    if (editingTask) {
      const updatedTask: Task = {
        ...task,
        id: editingTask.id,
        createdAt: editingTask.createdAt,
        status: editingTask.status,
      };
      
      try {
        await taskDB.updateTask(editingTask.id, task);
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
        setEditingTask(null);
      } catch (error) {
        console.error('Failed to update task in database:', error);
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await taskDB.updateTask(id, updates);
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Failed to update task in database:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskDB.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task from database:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const totalCount = tasks.length;

  return (
    <div className="app">
      <Header 
        onAddTask={() => {
          console.log('Setting modal open to true');
          setIsModalOpen(true);
        }}
        completedCount={completedCount}
        totalCount={totalCount}
        filter={filter}
        onFilterChange={setFilter}
      />
      
      <main className="main-content">
        <TaskList
          key={filter}
          tasks={filteredTasks}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onEditTask={editTask}
        />
      </main>

      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onAddTask={addTask}
        />
      )}
      {editingTask && (
        <AddTaskModal
          onClose={() => setEditingTask(null)}
          onAddTask={updateTaskFromModal}
          editingTask={editingTask}
        />
      )}
    </div>
  );
};

export default App; 