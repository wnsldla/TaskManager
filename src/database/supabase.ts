import { createClient } from '@supabase/supabase-js';
import { Task } from '../types/Task';

// Supabase 설정 - 임시 하드코딩
const supabaseUrl = 'https://wmlypuoymkgnapeuguce.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbHlwdW95bWtnbmFwZXVndWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjQzNzEsImV4cCI6MjA2OTIwMDM3MX0.wB5p7z2HzUTCjWA4VbJiSB4Oopm6S_lCVB81lz7TCoc';

// 환경 변수 디버깅
console.log('🔍 Environment Variables Debug:');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('Using URL:', supabaseUrl);

// 환경 변수가 설정되지 않은 경우 경고
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  console.warn('예시:');
  console.warn('REACT_APP_SUPABASE_URL=https://your-project.supabase.co');
  console.warn('REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const taskDB = {
  getAllTasks: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data?.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      repeatDays: task.repeat_days ? JSON.parse(task.repeat_days) : []
    })) || [];
  },

  addTask: async (task: Task) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: task.deadline,
        created_at: task.createdAt,
        completed_at: task.completedAt,
        repeat_days: task.repeatDays ? JSON.stringify(task.repeatDays) : null
      }])
      .select();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    }

    return data?.[0];
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;
    if (updates.repeatDays !== undefined) {
      updateData.repeat_days = JSON.stringify(updates.repeatDays);
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return data?.[0];
  },

  deleteTask: async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  getTasksByDate: async (date: Date): Promise<Task[]> => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('deadline', startOfDay.toISOString())
      .lte('deadline', endOfDay.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks by date:', error);
      return [];
    }

    return data?.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      repeatDays: task.repeat_days ? JSON.parse(task.repeat_days) : []
    })) || [];
  },

  getRepeatTasks: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .not('repeat_days', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching repeat tasks:', error);
      return [];
    }

    return data?.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      repeatDays: task.repeat_days ? JSON.parse(task.repeat_days) : []
    })) || [];
  }
}; 