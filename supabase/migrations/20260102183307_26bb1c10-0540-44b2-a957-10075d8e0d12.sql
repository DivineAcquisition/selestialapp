-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION normalize_phone(p_phone TEXT)
RETURNS TEXT AS $$
DECLARE
  v_digits TEXT;
BEGIN
  v_digits := regexp_replace(p_phone, '[^0-9]', '', 'g');
  
  IF length(v_digits) = 10 THEN
    RETURN '+1' || v_digits;
  ELSIF length(v_digits) = 11 AND v_digits LIKE '1%' THEN
    RETURN '+' || v_digits;
  ELSIF length(v_digits) > 10 THEN
    RETURN '+' || v_digits;
  ELSE
    RETURN v_digits;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION find_or_create_customer(
  p_business_id UUID,
  p_phone TEXT,
  p_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_external_id TEXT DEFAULT NULL,
  p_external_source TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_customer_id UUID;
  v_normalized_phone TEXT;
BEGIN
  v_normalized_phone := normalize_phone(p_phone);
  
  SELECT id INTO v_customer_id
  FROM customers
  WHERE business_id = p_business_id
    AND phone = v_normalized_phone;
  
  IF v_customer_id IS NOT NULL THEN
    UPDATE customers SET
      name = COALESCE(p_name, name),
      email = COALESCE(p_email, email),
      address = COALESCE(p_address, address),
      external_id = COALESCE(p_external_id, external_id),
      external_source = COALESCE(p_external_source, external_source),
      updated_at = NOW()
    WHERE id = v_customer_id;
    
    RETURN v_customer_id;
  END IF;
  
  INSERT INTO customers (
    business_id,
    phone,
    name,
    email,
    address,
    external_id,
    external_source
  ) VALUES (
    p_business_id,
    v_normalized_phone,
    COALESCE(p_name, 'Unknown'),
    p_email,
    p_address,
    p_external_id,
    p_external_source
  )
  RETURNING id INTO v_customer_id;
  
  RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_customer_stats(p_customer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE customers SET
    total_jobs = (
      SELECT COUNT(*) FROM quotes 
      WHERE customer_id = p_customer_id 
      AND job_status = 'completed'
    ),
    total_spent = COALESCE((
      SELECT SUM(COALESCE(final_job_amount, quote_amount)) FROM quotes 
      WHERE customer_id = p_customer_id 
      AND status = 'won'
    ), 0),
    average_job_value = COALESCE((
      SELECT AVG(COALESCE(final_job_amount, quote_amount))::INTEGER FROM quotes 
      WHERE customer_id = p_customer_id 
      AND status = 'won'
    ), 0),
    first_service_at = COALESCE(first_service_at, (
      SELECT MIN(job_completed_at) FROM quotes 
      WHERE customer_id = p_customer_id 
      AND job_status = 'completed'
    )),
    last_service_at = (
      SELECT MAX(job_completed_at) FROM quotes 
      WHERE customer_id = p_customer_id 
      AND job_status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_health_score(p_customer_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_customer RECORD;
  v_score INTEGER := 100;
  v_days_since_service INTEGER;
  v_expected_frequency INTEGER;
BEGIN
  SELECT * INTO v_customer FROM customers WHERE id = p_customer_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  
  IF v_customer.last_service_at IS NOT NULL THEN
    v_days_since_service := EXTRACT(DAY FROM NOW() - v_customer.last_service_at)::INTEGER;
    
    v_expected_frequency := CASE v_customer.recurring_frequency
      WHEN 'weekly' THEN 7
      WHEN 'biweekly' THEN 14
      WHEN 'monthly' THEN 30
      WHEN 'quarterly' THEN 90
      ELSE 60
    END;
    
    IF v_days_since_service > v_expected_frequency * 2 THEN
      v_score := v_score - 50;
    ELSIF v_days_since_service > v_expected_frequency * 1.5 THEN
      v_score := v_score - 30;
    ELSIF v_days_since_service > v_expected_frequency THEN
      v_score := v_score - 15;
    END IF;
  ELSE
    v_score := v_score - 20;
  END IF;
  
  IF v_customer.last_response_at IS NULL AND v_customer.last_contact_at IS NOT NULL THEN
    v_score := v_score - 20;
  END IF;
  
  IF v_customer.total_jobs >= 10 THEN
    v_score := v_score + 10;
  ELSIF v_customer.total_jobs >= 5 THEN
    v_score := v_score + 5;
  END IF;
  
  IF v_customer.is_recurring THEN
    v_score := v_score + 10;
  END IF;
  
  v_score := GREATEST(0, LEAST(100, v_score));
  
  UPDATE customers SET health_score = v_score WHERE id = p_customer_id;
  
  UPDATE customers SET
    customer_type = CASE
      WHEN v_score >= 80 AND total_spent >= 100000 THEN 'vip'
      WHEN v_score >= 80 AND is_recurring THEN 'recurring'
      WHEN v_score <= 30 THEN 'at_risk'
      WHEN v_score <= 10 THEN 'lost'
      ELSE 'one_time'
    END
  WHERE id = p_customer_id;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;