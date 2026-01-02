-- Phone numbers table for Twilio numbers
CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  phone_sid TEXT NOT NULL,
  friendly_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  sms_enabled BOOLEAN NOT NULL DEFAULT true,
  mms_enabled BOOLEAN NOT NULL DEFAULT false,
  voice_enabled BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(phone_number),
  UNIQUE(business_id)
);

ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own phone numbers" ON phone_numbers;
CREATE POLICY "Users can view own phone numbers" ON phone_numbers FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own phone numbers" ON phone_numbers;
CREATE POLICY "Users can insert own phone numbers" ON phone_numbers FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own phone numbers" ON phone_numbers;
CREATE POLICY "Users can update own phone numbers" ON phone_numbers FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_phone_numbers_business_id ON phone_numbers(business_id);

-- Inbound messages from customers
CREATE TABLE IF NOT EXISTS inbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  from_phone TEXT NOT NULL,
  to_phone TEXT NOT NULL,
  content TEXT NOT NULL,
  external_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ
);

ALTER TABLE inbound_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own inbound messages" ON inbound_messages;
CREATE POLICY "Users can view own inbound messages" ON inbound_messages FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own inbound messages" ON inbound_messages;
CREATE POLICY "Users can update own inbound messages" ON inbound_messages FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_inbound_messages_business ON inbound_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_inbound_messages_quote ON inbound_messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_inbound_messages_from ON inbound_messages(from_phone);

-- Function to replace merge fields in message content
CREATE OR REPLACE FUNCTION public.replace_merge_fields(p_content TEXT, p_quote_id UUID)
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
  v_result := replace(v_result, '{{business_name}}', v_business.name);
  v_result := replace(v_result, '{{owner_name}}', v_business.owner_name);
  v_result := replace(v_result, '{{quote_amount}}', '$' || to_char(v_quote.quote_amount / 100.0, 'FM999,999,999.00'));
  v_result := replace(v_result, '{{service_type}}', v_quote.service_type);
  v_result := replace(v_result, '{{business_phone}}', v_business.phone);
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to adjust scheduled time to business hours
CREATE OR REPLACE FUNCTION public.adjust_to_business_hours(p_scheduled_time TIMESTAMPTZ, p_business_id UUID)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_business RECORD;
  v_adjusted TIMESTAMPTZ;
  v_local_time TIME;
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_days_checked INTEGER := 0;
BEGIN
  SELECT * INTO v_business FROM businesses WHERE id = p_business_id;
  
  IF NOT v_business.business_hours_enabled THEN
    RETURN p_scheduled_time;
  END IF;
  
  v_adjusted := p_scheduled_time AT TIME ZONE v_business.timezone;
  v_start_time := v_business.business_hours_start;
  v_end_time := v_business.business_hours_end;
  
  WHILE v_days_checked < 14 LOOP
    v_local_time := v_adjusted::TIME;
    v_day_of_week := EXTRACT(DOW FROM v_adjusted)::INTEGER;
    
    IF v_day_of_week = ANY(v_business.business_days) THEN
      IF v_local_time >= v_start_time AND v_local_time < v_end_time THEN
        RETURN v_adjusted AT TIME ZONE v_business.timezone AT TIME ZONE 'UTC';
      ELSIF v_local_time < v_start_time THEN
        v_adjusted := date_trunc('day', v_adjusted) + v_start_time;
        RETURN v_adjusted AT TIME ZONE v_business.timezone AT TIME ZONE 'UTC';
      END IF;
    END IF;
    
    v_adjusted := date_trunc('day', v_adjusted) + INTERVAL '1 day' + v_start_time;
    v_days_checked := v_days_checked + 1;
  END LOOP;
  
  RETURN p_scheduled_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to schedule the next message in a sequence
CREATE OR REPLACE FUNCTION public.schedule_next_message(p_quote_id UUID)
RETURNS UUID AS $$
DECLARE
  v_quote RECORD;
  v_business RECORD;
  v_sequence RECORD;
  v_phone_number RECORD;
  v_step JSONB;
  v_step_index INTEGER;
  v_content TEXT;
  v_scheduled_for TIMESTAMPTZ;
  v_adjusted_time TIMESTAMPTZ;
  v_queue_id UUID;
BEGIN
  SELECT * INTO v_quote FROM quotes WHERE id = p_quote_id;
  IF NOT FOUND OR v_quote.status NOT IN ('new', 'active') THEN RETURN NULL; END IF;
  
  IF v_quote.sequence_id IS NULL THEN RETURN NULL; END IF;
  
  SELECT * INTO v_sequence FROM sequences WHERE id = v_quote.sequence_id;
  IF NOT FOUND OR NOT v_sequence.is_active THEN RETURN NULL; END IF;
  
  SELECT * INTO v_business FROM businesses WHERE id = v_quote.business_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  
  SELECT * INTO v_phone_number FROM phone_numbers 
  WHERE business_id = v_quote.business_id AND status = 'active' LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  
  v_step_index := COALESCE(v_quote.current_step_index, 0);
  
  WHILE v_step_index < jsonb_array_length(v_sequence.steps) LOOP
    v_step := v_sequence.steps->v_step_index;
    IF (v_step->>'is_active')::BOOLEAN THEN EXIT; END IF;
    v_step_index := v_step_index + 1;
  END LOOP;
  
  IF v_step_index >= jsonb_array_length(v_sequence.steps) THEN
    UPDATE quotes SET status = 'no_response', status_changed_at = NOW(), 
      sequence_completed_at = NOW(), next_message_at = NULL WHERE id = p_quote_id;
    RETURN NULL;
  END IF;
  
  v_step := v_sequence.steps->v_step_index;
  
  IF v_quote.sequence_started_at IS NULL THEN
    v_scheduled_for := NOW() + (COALESCE((v_step->>'delay_days')::INTEGER, 0) * INTERVAL '1 day') +
      (COALESCE((v_step->>'delay_hours')::INTEGER, 0) * INTERVAL '1 hour');
  ELSE
    v_scheduled_for := v_quote.sequence_started_at + (COALESCE((v_step->>'delay_days')::INTEGER, 0) * INTERVAL '1 day') +
      (COALESCE((v_step->>'delay_hours')::INTEGER, 0) * INTERVAL '1 hour');
  END IF;
  
  v_adjusted_time := public.adjust_to_business_hours(v_scheduled_for, v_quote.business_id);
  v_content := public.replace_merge_fields(v_step->>'message', p_quote_id);
  
  INSERT INTO message_queue (business_id, quote_id, sequence_id, step_index, channel, to_phone, 
    from_phone, content, scheduled_for, original_scheduled_for, metadata)
  VALUES (v_quote.business_id, p_quote_id, v_quote.sequence_id, v_step_index,
    COALESCE(v_step->>'channel', 'sms'), v_quote.customer_phone, v_phone_number.phone_number,
    v_content, v_adjusted_time, v_scheduled_for,
    jsonb_build_object('step_id', v_step->>'id', 'customer_name', v_quote.customer_name))
  RETURNING id INTO v_queue_id;
  
  UPDATE quotes SET status = CASE WHEN status = 'new' THEN 'active' ELSE status END,
    sequence_started_at = COALESCE(sequence_started_at, NOW()),
    current_step_index = v_step_index, next_message_at = v_adjusted_time
  WHERE id = p_quote_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to advance quote to next step after message sent
CREATE OR REPLACE FUNCTION public.advance_to_next_step(p_quote_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE quotes SET current_step_index = COALESCE(current_step_index, 0) + 1 WHERE id = p_quote_id;
  PERFORM public.schedule_next_message(p_quote_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to start sequence when quote is created
CREATE OR REPLACE FUNCTION public.on_quote_created()
RETURNS TRIGGER AS $$
DECLARE
  v_business RECORD;
BEGIN
  SELECT * INTO v_business FROM businesses WHERE id = NEW.business_id;
  IF v_business.auto_start_sequence AND NEW.sequence_id IS NOT NULL THEN
    PERFORM public.schedule_next_message(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_quote_created ON quotes;
CREATE TRIGGER trigger_quote_created AFTER INSERT ON quotes 
  FOR EACH ROW EXECUTE FUNCTION public.on_quote_created();

-- Trigger to handle quote status changes
CREATE OR REPLACE FUNCTION public.on_quote_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'paused' AND NEW.status = 'active' THEN
    PERFORM public.schedule_next_message(NEW.id);
  END IF;
  
  IF NEW.status IN ('won', 'lost', 'paused') AND OLD.status NOT IN ('won', 'lost', 'paused') THEN
    UPDATE message_queue SET status = 'cancelled' WHERE quote_id = NEW.id AND status = 'pending';
    UPDATE quotes SET next_message_at = NULL WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_quote_status_changed ON quotes;
CREATE TRIGGER trigger_quote_status_changed AFTER UPDATE OF status ON quotes
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.on_quote_status_changed();