-- Add original_start_date column to tasks table
ALTER TABLE tasks 
ADD COLUMN original_start_date TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the column
COMMENT ON COLUMN tasks.original_start_date IS '원래 시작일 (변경되지 않는 원본 날짜)';

-- Update existing tasks to set original_start_date to due_date if not set
UPDATE tasks 
SET original_start_date = due_date
WHERE original_start_date IS NULL AND due_date IS NOT NULL; 