-- Add conversation tracking columns to quotes (including unread_count)
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_message_preview TEXT,
ADD COLUMN IF NOT EXISTS last_message_direction TEXT,
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;

-- Indexes for inbox queries
CREATE INDEX IF NOT EXISTS idx_quotes_last_message ON quotes(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_quotes_unread ON quotes(unread_count) WHERE unread_count > 0;
CREATE INDEX IF NOT EXISTS idx_inbound_unread ON inbound_messages(is_read) WHERE is_read = false;

-- Function to update conversation summary after outbound message
CREATE OR REPLACE FUNCTION update_conversation_on_outbound()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quotes SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    last_message_direction = 'outbound'
  WHERE id = NEW.quote_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_conversation_outbound ON messages;
CREATE TRIGGER trigger_update_conversation_outbound
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_outbound();

-- Function to update conversation summary after inbound message
CREATE OR REPLACE FUNCTION update_conversation_on_inbound()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quotes SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    last_message_direction = 'inbound',
    unread_count = COALESCE(unread_count, 0) + 1
  WHERE id = NEW.quote_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_conversation_inbound ON inbound_messages;
CREATE TRIGGER trigger_update_conversation_inbound
  AFTER INSERT ON inbound_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_inbound();

-- Function to mark messages as read and reset unread count
CREATE OR REPLACE FUNCTION mark_conversation_read(p_quote_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Mark all inbound messages as read
  UPDATE inbound_messages SET
    is_read = true,
    read_at = NOW()
  WHERE quote_id = p_quote_id AND is_read = false;
  
  -- Reset unread count on quote
  UPDATE quotes SET unread_count = 0 WHERE id = p_quote_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;