-- Create publishing_logs table
CREATE TABLE IF NOT EXISTS publishing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id),
  run_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  success BOOLEAN NOT NULL,
  error TEXT,
  platform_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Add indexes for common queries
  CONSTRAINT fk_content
    FOREIGN KEY (content_id)
    REFERENCES content(id)
    ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_publishing_logs_content_id ON publishing_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_publishing_logs_run_id ON publishing_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_publishing_logs_timestamp ON publishing_logs(timestamp);

-- Add retry column to content table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'content' 
    AND column_name = 'retry'
  ) THEN
    ALTER TABLE content ADD COLUMN retry BOOLEAN DEFAULT false;
  END IF;
END $$;
