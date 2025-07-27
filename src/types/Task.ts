export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string; // 마감일
  createdAt: string;
  completedAt?: string;
  repeatDays?: number[]; // 0=일요일, 1=월요일, ..., 6=토요일
} 