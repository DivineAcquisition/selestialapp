-- Replace merge fields function
CREATE OR REPLACE FUNCTION replace_merge_fields(
  p_content TEXT,
  p_quote_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_quote RECORD;
  v_business RECORD;
  v_result TEXT;
  v_first_name TEXT;
BEGIN
  SELECT * INTO v_quote FROM quotes WHERE id = p_quote_id;
  IF NOT FOUND THEN RETURN p_content; END IF;
  
  SELECT * INTO v_business FROM businesses WHERE id = v_quote.business_id;
  IF NOT FOUND THEN RETURN p_content; END IF;
  
  v_first_name := split_part(v_quote.customer_name, ' ', 1);
  
  v_result := p_content;
  v_result := replace(v_result, '{{customer_name}}', v_quote.customer_name);
  v_result := replace(v_result, '{{customer_first_name}}', v_first_name);
  v_result := replace(v_result, '{{first_name}}', v_first_name);
  v_result := replace(v_result, '{{business_name}}', v_business.name);
  v_result := replace(v_result, '{{owner_name}}', v_business.owner_name);
  v_result := replace(v_result, '{{owner_first_name}}', split_part(v_business.owner_name, ' ', 1));
  v_result := replace(v_result, '{{quote_amount}}', '$' || to_char(v_quote.quote_amount / 100.0, 'FM999,999,999.00'));
  v_result := replace(v_result, '{{service_type}}', COALESCE(v_quote.service_type, 'service'));
  v_result := replace(v_result, '{{business_phone}}', v_business.phone);
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Adjust to business hours function
CREATE OR REPLACE FUNCTION adjust_to_business_hours(
  p_scheduled_time TIMESTAMPTZ,
  p_business_id UUID
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_business RECORD;
  v_adjusted TIMESTAMPTZ;
  v_local_time TIME;
  v_local_date DATE;
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_days_checked INTEGER := 0;
BEGIN
  SELECT * INTO v_business FROM businesses WHERE id = p_business_id;
  
  IF NOT COALESCE(v_business.business_hours_enabled, false) THEN
    RETURN p_scheduled_time;
  END IF;
  
  v_adjusted := p_scheduled_time AT TIME ZONE COALESCE(v_business.timezone, 'America/New_York');
  v_start_time := COALESCE(v_business.business_hours_start, '09:00')::TIME;
  v_end_time := COALESCE(v_business.business_hours_end, '17:00')::TIME;
  
  WHILE v_days_checked < 14 LOOP
    v_local_time := v_adjusted::TIME;
    v_local_date := v_adjusted::DATE;
    v_day_of_week := EXTRACT(DOW FROM v_adjusted)::INTEGER;
    
    IF v_day_of_week = ANY(COALESCE(v_business.business_days, ARRAY[1,2,3,4,5])) THEN
      IF v_local_time >= v_start_time AND v_local_time < v_end_time THEN
        RETURN (v_local_date + v_local_time) AT TIME ZONE COALESCE(v_business.timezone, 'America/New_York');
      ELSIF v_local_time < v_start_time THEN
        RETURN (v_local_date + v_start_time) AT TIME ZONE COALESCE(v_business.timezone, 'America/New_York');
      END IF;
    END IF;
    
    v_adjusted := (v_local_date + INTERVAL '1 day' + v_start_time);
    v_days_checked := v_days_checked + 1;
  END LOOP;
  
  RETURN p_scheduled_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Schedule next message function
CREATE OR REPLACE FUNCTION schedule_next_message(p_quote_id UUID)
RETURNS UUID AS $$
DECLARE
  v_quote RECORD;
  v_business RECORD;
  v_sequence RECORD;
  v_step JSONB;
  v_step_index INTEGER;
  v_content TEXT;
  v_scheduled_for TIMESTAMPTZ;
  v_adjusted_time TIMESTAMPTZ;
  v_queue_id UUID;
  v_delay_days INTEGER;
  v_delay_hours INTEGER;
  v_from_phone TEXT;
BEGIN
  SELECT * INTO v_quote FROM quotes WHERE id = p_quote_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  
  IF v_quote.status NOT IN ('new', 'active') THEN RETURN NULL; END IF;
  IF v_quote.sequence_id IS NULL THEN RETURN NULL; END IF;
  
  SELECT * INTO v_sequence FROM sequences WHERE id = v_quote.sequence_id;
  IF NOT FOUND OR NOT v_sequence.is_active THEN RETURN NULL; END IF;
  
  SELECT * INTO v_business FROM businesses WHERE id = v_quote.business_id;
  
  v_from_phone := v_business.twilio_phone_number;
  IF v_from_phone IS NULL THEN RETURN NULL; END IF;
  
  v_step_index := COALESCE(v_quote.current_step_index, 0);
  
  WHILE v_step_index < jsonb_array_length(v_sequence.steps) LOOP
    v_step := v_sequence.steps->v_step_index;
    IF COALESCE((v_step->>'is_active')::BOOLEAN, true) THEN EXIT; END IF;
    v_step_index := v_step_index + 1;
  END LOOP;
  
  IF v_step_index >= jsonb_array_length(v_sequence.steps) THEN
    UPDATE quotes SET
      status = 'no_response',
      status_changed_at = NOW(),
      next_message_at = NULL
    WHERE id = p_quote_id;
    RETURN NULL;
  END IF;
  
  v_step := v_sequence.steps->v_step_index;
  v_delay_days := COALESCE((v_step->>'delay_days')::INTEGER, 0);
  v_delay_hours := COALESCE((v_step->>'delay_hours')::INTEGER, 0);
  
  v_scheduled_for := NOW() + (v_delay_days || ' days')::INTERVAL + (v_delay_hours || ' hours')::INTERVAL;
  v_adjusted_time := adjust_to_business_hours(v_scheduled_for, v_quote.business_id);
  v_content := replace_merge_fields(v_step->>'message', p_quote_id);
  
  UPDATE message_queue SET status = 'cancelled'
  WHERE quote_id = p_quote_id AND status = 'pending';
  
  INSERT INTO message_queue (
    business_id, quote_id, sequence_id, step_index,
    channel, to_phone, from_phone, content,
    scheduled_for, original_scheduled_for, metadata
  ) VALUES (
    v_quote.business_id, p_quote_id, v_quote.sequence_id, v_step_index,
    COALESCE(v_step->>'channel', 'sms'),
    v_quote.customer_phone, v_from_phone, v_content,
    v_adjusted_time, v_scheduled_for,
    jsonb_build_object('step_id', v_step->>'id', 'customer_name', v_quote.customer_name)
  )
  RETURNING id INTO v_queue_id;
  
  UPDATE quotes SET
    status = CASE WHEN status = 'new' THEN 'active' ELSE status END,
    current_step_index = v_step_index,
    next_message_at = v_adjusted_time
  WHERE id = p_quote_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Advance to next step function
CREATE OR REPLACE FUNCTION advance_to_next_step(p_quote_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE quotes SET current_step_index = COALESCE(current_step_index, 0) + 1 WHERE id = p_quote_id;
  PERFORM schedule_next_message(p_quote_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Quote created trigger function
CREATE OR REPLACE FUNCTION on_quote_created()
RETURNS TRIGGER AS $$
DECLARE
  v_business RECORD;
BEGIN
  SELECT * INTO v_business FROM businesses WHERE id = NEW.business_id;
  
  IF COALESCE(v_business.auto_start_sequence, true) AND NEW.sequence_id IS NOT NULL THEN
    PERFORM schedule_next_message(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_quote_created ON quotes;
CREATE TRIGGER trigger_quote_created
  AFTER INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION on_quote_created();

-- Quote status changed trigger function
CREATE OR REPLACE FUNCTION on_quote_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'paused' AND NEW.status = 'active' THEN
    PERFORM schedule_next_message(NEW.id);
  END IF;
  
  IF OLD.status = 'active' AND NEW.status = 'paused' THEN
    UPDATE message_queue SET status = 'cancelled' WHERE quote_id = NEW.id AND status = 'pending';
    UPDATE quotes SET next_message_at = NULL WHERE id = NEW.id;
  END IF;
  
  IF NEW.status IN ('won', 'lost') AND OLD.status NOT IN ('won', 'lost') THEN
    UPDATE message_queue SET status = 'cancelled' WHERE quote_id = NEW.id AND status = 'pending';
    UPDATE quotes SET next_message_at = NULL WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_quote_status_changed ON quotes;
CREATE TRIGGER trigger_quote_status_changed
  AFTER UPDATE OF status ON quotes
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION on_quote_status_changed();