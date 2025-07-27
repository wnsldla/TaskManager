import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TaskList from './components/TaskList';
import AddTaskModal from './components/AddTaskModal';
import DateSelector from './components/DateSelector';
import { Task } from './types/Task';
import { taskDB } from './database/supabase';
import { getKoreaTime, toKoreaTime, formatKoreaTime } from './utils/timezone';
import './App.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 날짜 (디버깅용)

  // 전역 디버깅 함수들을 window 객체에 추가
  useEffect(() => {
    // @ts-ignore
    window.debugTaskManager = {
      // 현재 선택된 날짜 확인
      getCurrentDate: () => {
        console.log('현재 선택된 날짜:', selectedDate.toISOString().split('T')[0]);
        return selectedDate;
      },
      
      // 현재 시스템 날짜 확인
      getSystemDate: () => {
        console.log('시스템 현재 날짜:', currentDate.toISOString().split('T')[0]);
        return currentDate;
      },
      
      // 날짜 변경 (디버깅용 - 설정한 날짜를 현재 날짜로 간주)
      setDate: (dateString: string) => {
        const newDate = new Date(dateString);
        if (isNaN(newDate.getTime())) {
          console.error('유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식으로 입력해주세요.');
          return;
        }
        
        // 설정한 날짜를 한국 시간 기준으로 설정
        const [year, month, day] = dateString.split('-').map(Number);
        const targetDate = new Date(year, month - 1, day, 12, 0, 0, 0); // 한국 시간 기준 정오
        
        console.log('디버깅 날짜를 설정합니다:', dateString, '(한국 시간 기준)');
        console.log('설정된 targetDate:', targetDate.toISOString());
        setCurrentDate(targetDate);
        
        // 테스크 관리 규칙 실행
        console.log('테스크 관리 규칙을 실행합니다...');
        moveIncompleteTasksToNextDay();
        checkAndCreateRepeatTasks();
        
        // 실행 후 결과 확인
        setTimeout(() => {
          console.log('테스크 관리 규칙 실행 완료. 현재 테스크:', tasks);
        }, 100);
      },
      
      // 실제 시스템 날짜로 복원
      resetToSystemDate: () => {
        const koreaTime = getKoreaTime();
        console.log('시스템 날짜로 복원합니다:', koreaTime.toISOString().split('T')[0]);
        setCurrentDate(koreaTime);
      },
      
      // 오늘 날짜로 이동 (한국 시간)
      goToToday: () => {
        console.log('오늘 날짜로 이동합니다 (한국 시간)');
        const koreaTime = getKoreaTime();
        setSelectedDate(koreaTime);
      },
      
      // 특정 날짜로 이동 (상대적)
      goToRelativeDate: (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        console.log(`${days}일 ${days > 0 ? '후' : '전'} 날짜로 이동:`, newDate.toISOString().split('T')[0]);
        setSelectedDate(newDate);
      },
      
      // 현재 날짜의 테스크 확인
      getTasksForCurrentDate: () => {
        const tasksForDate = getTasksForSelectedDate();
        console.log('현재 날짜의 테스크:', tasksForDate);
        return tasksForDate;
      },
      
      // 모든 테스크 확인
      getAllTasks: () => {
        console.log('모든 테스크:', tasks);
        return tasks;
      },
      
      // 테스크 상태별 개수 확인
      getTaskCounts: () => {
        const tasksForDate = getTasksForSelectedDate();
        const pending = tasksForDate.filter(t => t.status === 'pending').length;
        const completed = tasksForDate.filter(t => t.status === 'completed').length;
        const total = tasksForDate.length;
        
        console.log('테스크 개수:', {
          전체: total,
          진행중: pending,
          완료: completed
        });
        return { total, pending, completed };
      },
      
      // 미완성 테스크를 다음날로 이동 (수동 실행)
      moveIncompleteTasks: () => {
        console.log('미완성 테스크를 다음날로 이동합니다...');
        moveIncompleteTasksToNextDay();
      },
      
      // 반복 테스크 생성 (수동 실행)
      createRepeatTasks: () => {
        console.log('반복 테스크를 생성합니다...');
        checkAndCreateRepeatTasks();
      },
      
      // 필터 변경
      setFilter: (newFilter: 'all' | 'pending' | 'completed') => {
        console.log('필터를 변경합니다:', newFilter);
        setFilter(newFilter);
      },
      
      // 현재 필터 확인
      getCurrentFilter: () => {
        console.log('현재 필터:', filter);
        return filter;
      },
      
      // 테스크 추가 (디버깅용) - 한국 시간 사용
      addDebugTask: (title: string, deadline?: string) => {
        const now = new Date();
        const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        
        const newTask: Task = {
          id: Date.now().toString(),
          title,
          description: '디버깅용 테스크',
          priority: 'medium',
          status: 'pending',
          deadline: deadline || koreaTime.toISOString(),
          createdAt: koreaTime.toISOString(),
          repeatDays: []
        };
        
        console.log('디버깅용 테스크 추가:', newTask);
        setTasks(prev => [newTask, ...prev]);
      },
      
      // 도움말
      help: () => {
        console.log(`
🔧 TaskManager 디버깅 도구 사용법:

📅 날짜 관련:
  debugTaskManager.getCurrentDate() - 현재 선택된 날짜 확인
  debugTaskManager.getSystemDate() - 시스템 현재 날짜 확인
  debugTaskManager.setDate('2025-07-29') - 디버깅 날짜 설정 (테스크 규칙 적용)
  debugTaskManager.resetToSystemDate() - 시스템 날짜로 복원
  debugTaskManager.goToToday() - 오늘 날짜로 이동 (한국 시간)
  debugTaskManager.goToRelativeDate(7) - 7일 후로 이동
  debugTaskManager.goToRelativeDate(-3) - 3일 전으로 이동

📋 테스크 관련:
  debugTaskManager.getTasksForCurrentDate() - 현재 날짜의 테스크 확인
  debugTaskManager.getAllTasks() - 모든 테스크 확인
  debugTaskManager.getTaskCounts() - 테스크 개수 확인
  debugTaskManager.addDebugTask('테스트', '2024-01-15T10:00:00') - 디버깅용 테스크 추가

⚙️ 관리 기능:
  debugTaskManager.moveIncompleteTasks() - 미완성 테스크 다음날로 이동
  debugTaskManager.createRepeatTasks() - 반복 테스크 생성
  debugTaskManager.setFilter('pending') - 필터 변경 (all/pending/completed)
  debugTaskManager.getCurrentFilter() - 현재 필터 확인

❓ 도움말:
  debugTaskManager.help() - 이 도움말 표시
        `);
      }
    };

    // 초기 도움말 출력
    console.log('🔧 TaskManager 디버깅 도구가 로드되었습니다!');
    console.log('사용법: debugTaskManager.help()');
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      // @ts-ignore
      delete window.debugTaskManager;
    };
  }, [selectedDate, tasks, filter, currentDate]);

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

  // 테스크 관리 규칙 1: 미완성 테스크를 다음날로 이동 (deadline 기준)
  const moveIncompleteTasksToNextDay = () => {
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    console.log('테스크 이동 체크:', {
      currentDate: currentDate.toISOString(),
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
      totalTasks: tasks.length
    });

    const updatedTasks = tasks.map(task => {
      if (task.status === 'pending' && task.deadline) {
        const taskDate = new Date(task.deadline);
        const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        
        console.log(`테스크 "${task.title}" 체크:`, {
          taskDate: taskDateOnly.toISOString(),
          today: today.toISOString(),
          deadline: task.deadline,
          shouldMove: taskDateOnly.getTime() === today.getTime() && 
                     new Date(task.deadline) >= tomorrow
        });
        
        // 오늘 날짜의 테스크이고, 마감일이 내일 또는 그 이후인 경우
        if (taskDateOnly.getTime() === today.getTime() && 
            new Date(task.deadline) >= tomorrow) {
          
          console.log(`테스크 "${task.title}"를 다음날로 이동합니다:`, {
            from: task.deadline,
            to: tomorrow.toISOString()
          });
          
          // 테스크를 다음날로 이동 (deadline 업데이트)
          const newTask = {
            ...task,
            deadline: tomorrow.toISOString(),
          };
          
          // 데이터베이스 업데이트
          taskDB.updateTask(task.id, { deadline: tomorrow.toISOString() });
          
          return newTask;
        }
      }
      return task;
    });

    console.log('업데이트된 테스크:', updatedTasks);
    setTasks(updatedTasks);
  };

  // 매일 자정에 미완성 테스크 이동 체크 (한국 시간 기준)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const koreaTime = getKoreaTime();
      if (koreaTime.getHours() === 0 && koreaTime.getMinutes() === 0) {
        moveIncompleteTasksToNextDay();
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(checkInterval);
  }, [tasks, currentDate]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const koreaTime = getKoreaTime();
    
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: koreaTime.toISOString(),
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

  // 반복 태스크 자동 생성 함수 (한국 시간 기준)
  const checkAndCreateRepeatTasks = () => {
    const today = currentDate.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    tasks.forEach(task => {
      if (task.repeatDays && task.repeatDays.length > 0) {
        // 오늘 요일이 반복 요일에 포함되어 있는지 확인
        if (task.repeatDays.includes(today)) {
          // 마감일이 있는지 확인하고, 마감일이 오늘 이후인지 확인
          if (task.deadline) {
            const taskDeadline = new Date(task.deadline);
            const taskDeadlineDate = new Date(taskDeadline.getFullYear(), taskDeadline.getMonth(), taskDeadline.getDate());
            
            // 마감일이 오늘 이후라면 반복 생성 가능
            if (taskDeadlineDate >= todayStart) {
              // 오늘 날짜에 동일한 반복 테스크가 이미 존재하는지 확인
              const existingTask = tasks.find(t => {
                if (!t.deadline) return false;
                const taskDate = new Date(t.deadline);
                const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
                return taskDateOnly.getTime() === todayStart.getTime() && 
                       t.title === task.title && 
                       t.repeatDays?.join(',') === task.repeatDays?.join(',');
              });
              
              // 오늘 테스크가 없으면 자동 생성 (완료된 테스크도 포함하여 생성)
              if (!existingTask) {
                const newRepeatTask: Task = {
                  ...task,
                  id: Date.now().toString() + Math.random(),
                  createdAt: getKoreaTime().toISOString(),
                  status: 'pending', // 항상 pending으로 생성
                  deadline: todayStart.toISOString(),
                };
                
                console.log(`반복 테스크 생성: ${task.title} (${todayStart.toISOString()})`);
                setTasks(prev => [newRepeatTask, ...prev]);
                
                // 데이터베이스에도 저장
                taskDB.addTask(newRepeatTask).catch(error => {
                  console.error('Failed to add repeat task to database:', error);
                });
              }
            }
          }
        }
      }
    });
  };

  // 매일 자정에 반복 태스크 체크 (한국 시간 기준)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const koreaTime = getKoreaTime();
      if (koreaTime.getHours() === 0 && koreaTime.getMinutes() === 0) {
        console.log('반복 테스크 체크 시작...');
        checkAndCreateRepeatTasks();
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(checkInterval);
  }, [tasks, currentDate]);

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

  // 선택된 날짜에 해당하는 테스크 필터링 (deadline 기준)
  const getTasksForSelectedDate = () => {
    const selectedDateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    return tasks.filter(task => {
      if (!task.deadline) return false;
      
      const taskDate = new Date(task.deadline);
      const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      
      // 생성일 체크: 선택된 날짜가 생성일보다 이르면 표시하지 않음
      const createdAt = new Date(task.createdAt);
      const createdAtOnly = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
      if (selectedDateStart < createdAtOnly) {
        return false;
      }
      
      // 완료된 테스크 체크: 완료일 이후 날짜에서는 표시하지 않음
      if (task.status === 'completed' && task.completedAt) {
        const completedAt = new Date(task.completedAt);
        const completedAtOnly = new Date(completedAt.getFullYear(), completedAt.getMonth(), completedAt.getDate());
        if (selectedDateStart > completedAtOnly) {
          return false;
        }
      }
      
      // 마감일이 선택된 날짜 이후인 테스크를 표시
      return taskDateOnly >= selectedDateStart;
    });
  };

  const tasksForSelectedDate = getTasksForSelectedDate();

  const filteredTasks = tasksForSelectedDate.filter(task => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const completedCount = tasksForSelectedDate.filter(task => task.status === 'completed').length;
  const totalCount = tasksForSelectedDate.length;

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
        <DateSelector 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        
        <TaskList
          key={`${filter}-${selectedDate.toISOString().split('T')[0]}`}
          tasks={filteredTasks}
          onToggleComplete={(id) => updateTask(id, { 
            status: tasks.find(t => t.id === id)?.status === 'completed' ? 'pending' : 'completed',
            completedAt: tasks.find(t => t.id === id)?.status === 'completed' ? undefined : new Date().toISOString()
          })}
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