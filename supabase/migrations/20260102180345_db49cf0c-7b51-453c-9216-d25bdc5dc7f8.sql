-- Create trigger functions for quote automation

-- Function to handle new quote creation
CREATE OR REPLACE FUNCTION public.handle_quote_created()
RETURNS TRIGGER AS $$
DECLARE
  v_business RECORD;
BEGIN
  -- Get business settings
  SELECT * INTO v_business FROM businesses WHERE id = NEW.business_id;
  
  -- Log the quote creation
  PERFORM log_activity(
    NEW.business_id,
    'quote_created',
    'New quote created for ' || NEW.customer_name || ' - ' || COALESCE(NEW.service_type, 'Service'),
    NEW.id,
    jsonb_build_object('quote_amount', NEW.quote_amount, 'customer_phone', NEW.customer_phone)
  );
  
  -- If auto_start_sequence is enabled and we have a sequence, schedule the first message
  IF COALESCE(v_business.auto_start_sequence, true) AND NEW.sequence_id IS NOT NULL THEN
    -- Mark sequence as started
    NEW.sequence_started_at := NOW();
    NEW.status := 'active';
    NEW.status_changed_at := NOW();
    
    -- Schedule the first message (will be done after insert)
    PERFORM schedule_next_message(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to handle quote status changes
CREATE OR REPLACE FUNCTION public.handle_quote_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Update status_changed_at
  NEW.status_changed_at := NOW();
  
  -- Handle status transitions
  CASE NEW.status
    WHEN 'active' THEN
      -- Resuming from paused - reschedule messages
      IF OLD.status = 'paused' THEN
        NEW.sequence_paused_at := NULL;
        PERFORM schedule_next_message(NEW.id);
        PERFORM log_activity(NEW.business_id, 'quote_resumed', 'Quote resumed for ' || NEW.customer_name, NEW.id, NULL);
      END IF;
      
    WHEN 'paused' THEN
      -- Pausing - cancel pending messages
      NEW.sequence_paused_at := NOW();
      UPDATE message_queue SET status = 'cancelled' WHERE quote_id = NEW.id AND status = 'pending';
      PERFORM log_activity(NEW.business_id, 'quote_paused', 'Quote paused for ' || NEW.customer_name, NEW.id, NULL);
      
    WHEN 'won' THEN
      -- Won - cancel pending messages, record win
      NEW.won_at := NOW();
      NEW.sequence_completed_at := NOW();
      NEW.next_message_at := NULL;
      UPDATE message_queue SET status = 'cancelled' WHERE quote_id = NEW.id AND status = 'pending';
      PERFORM log_activity(
        NEW.business_id, 
        'quote_won', 
        'Quote won for ' || NEW.customer_name || ' - $' || (COALESCE(NEW.final_job_amount, NEW.quote_amount) / 100.0)::TEXT, 
        NEW.id,
        jsonb_build_object('final_amount', COALESCE(NEW.final_job_amount, NEW.quote_amount))
      );
      
    WHEN 'lost' THEN
      -- Lost - cancel pending messages, record loss
      NEW.lost_at := NOW();
      NEW.sequence_completed_at := NOW();
      NEW.next_message_at := NULL;
      UPDATE message_queue SET status = 'cancelled' WHERE quote_id = NEW.id AND status = 'pending';
      PERFORM log_activity(
        NEW.business_id, 
        'quote_lost', 
        'Quote lost for ' || NEW.customer_name || COALESCE(' - ' || NEW.lost_reason, ''), 
        NEW.id,
        jsonb_build_object('lost_reason', NEW.lost_reason)
      );
      
    WHEN 'no_response' THEN
      -- No response - sequence completed with no reply
      NEW.sequence_completed_at := NOW();
      NEW.next_message_at := NULL;
      PERFORM log_activity(NEW.business_id, 'sequence_completed', 'Sequence completed with no response for ' || NEW.customer_name, NEW.id, NULL);
      
    ELSE
      NULL;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
DROP TRIGGER IF EXISTS on_quote_created ON quotes;
CREATE TRIGGER on_quote_created
  AFTER INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION handle_quote_created();

DROP TRIGGER IF EXISTS on_quote_status_changed ON quotes;
CREATE TRIGGER on_quote_status_changed
  BEFORE UPDATE OF status ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION handle_quote_status_changed();

-- Update conversation triggers if they don't exist
DROP TRIGGER IF EXISTS update_quote_on_outbound_message ON messages;
CREATE TRIGGER update_quote_on_outbound_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_outbound();

DROP TRIGGER IF EXISTS update_quote_on_inbound_message ON inbound_messages;
CREATE TRIGGER update_quote_on_inbound_message
  AFTER INSERT ON inbound_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_inbound();