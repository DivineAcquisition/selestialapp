-- Add business_id and quote_id columns to message_queue if they don't exist
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS sequence_id UUID REFERENCES sequences(id) ON DELETE SET NULL;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS step_index INTEGER DEFAULT 0;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS from_phone TEXT;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS original_scheduled_for TIMESTAMPTZ;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Rename to_number to to_phone if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_queue' AND column_name = 'to_number') THEN
    ALTER TABLE message_queue RENAME COLUMN to_number TO to_phone;
  END IF;
END $$;

-- Add to_phone if it doesn't exist
ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS to_phone TEXT;

-- Rename last_error to error_message if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_queue' AND column_name = 'last_error') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_queue' AND column_name = 'error_message') THEN
    ALTER TABLE message_queue RENAME COLUMN last_error TO error_message;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_message_queue_pending ON message_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_message_queue_business ON message_queue(business_id);
CREATE INDEX IF NOT EXISTS idx_message_queue_quote ON message_queue(quote_id);

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own message queue" ON message_queue;
DROP POLICY IF EXISTS "Service role full access on message_queue" ON message_queue;

-- Ensure RLS is enabled
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own message queue"
  ON message_queue FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access on message_queue"
  ON message_queue FOR ALL
  USING (true);