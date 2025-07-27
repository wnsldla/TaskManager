-- Drop existing tasks table if it exists
DROP TABLE IF EXISTS tasks;

-- Create tasks table with all required columns
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    due_date TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    repeat_days TEXT -- JSON string for repeat days array
);

-- Add comments to explain columns
COMMENT ON TABLE tasks IS '태스크 관리 테이블';
COMMENT ON COLUMN tasks.id IS '태스크 고유 ID';
COMMENT ON COLUMN tasks.title IS '태스크 제목';
COMMENT ON COLUMN tasks.description IS '태스크 설명';
COMMENT ON COLUMN tasks.priority IS '우선순위 (low, medium, high)';
COMMENT ON COLUMN tasks.status IS '상태 (pending, completed)';
COMMENT ON COLUMN tasks.due_date IS '시작 날짜 (테스크가 표시될 날짜)';
COMMENT ON COLUMN tasks.deadline IS '마감일 (테스크의 실제 마감일)';
COMMENT ON COLUMN tasks.created_at IS '생성일시';
COMMENT ON COLUMN tasks.completed_at IS '완료일시';
COMMENT ON COLUMN tasks.repeat_days IS '반복 요일 (JSON 배열 문자열)';

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Allow all operations" ON tasks
    FOR ALL
    USING (true)
    WITH CHECK (true); 