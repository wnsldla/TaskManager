-- Remove due_date column from tasks table
ALTER TABLE tasks DROP COLUMN IF EXISTS due_date;

-- Update table comments
COMMENT ON COLUMN tasks.deadline IS '마감일 (테스크의 실제 마감일)';

-- Remove due_date index if it exists
DROP INDEX IF EXISTS idx_tasks_due_date; 