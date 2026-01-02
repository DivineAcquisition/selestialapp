-- ============================================
-- SYSTEM HEALTH CHECK FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.system_health_check(p_business_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB := '{}';
  v_business RECORD;
  v_count INTEGER;
BEGIN
  -- Get business
  SELECT * INTO v_business FROM businesses WHERE id = p_business_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Business not found');
  END IF;

  -- Business setup
  v_result := v_result || jsonb_build_object(
    'business', jsonb_build_object(
      'exists', true,
      'name', v_business.name,
      'industry', v_business.industry,
      'subscription', v_business.subscription_status
    )
  );

  -- Customers
  SELECT COUNT(*) INTO v_count FROM customers WHERE business_id = p_business_id;
  v_result := v_result || jsonb_build_object(
    'customers', jsonb_build_object(
      'count', v_count,
      'has_data', v_count > 0
    )
  );

  -- Quotes
  SELECT COUNT(*) INTO v_count FROM quotes WHERE business_id = p_business_id;
  v_result := v_result || jsonb_build_object(
    'quotes', jsonb_build_object(
      'count', v_count,
      'has_data', v_count > 0
    )
  );

  -- Sequences
  SELECT COUNT(*) INTO v_count FROM sequences WHERE business_id = p_business_id;
  v_result := v_result || jsonb_build_object(
    'sequences', jsonb_build_object(
      'count', v_count,
      'has_data', v_count > 0
    )
  );

  -- Messages
  SELECT COUNT(*) INTO v_count FROM messages WHERE business_id = p_business_id;
  v_result := v_result || jsonb_build_object(
    'messages', jsonb_build_object(
      'count', v_count,
      'has_data', v_count > 0
    )
  );

  -- AI Settings
  SELECT COUNT(*) INTO v_count FROM ai_settings WHERE business_id = p_business_id;
  v_result := v_result || jsonb_build_object(
    'ai_settings', jsonb_build_object(
      'configured', v_count > 0
    )
  );

  -- Campaigns
  SELECT COUNT(*) INTO v_count FROM seasonal_campaigns WHERE business_id = p_business_id;
  v_result := v_result || jsonb_build_object(
    'campaigns', jsonb_build_object(
      'count', v_count
    )
  );

  -- Overall status
  v_result := v_result || jsonb_build_object(
    'status', 'healthy',
    'checked_at', NOW()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFY ALL TABLES EXIST
-- ============================================

CREATE OR REPLACE FUNCTION public.verify_database_schema()
RETURNS JSONB AS $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'businesses', 'customers', 'quotes', 'sequences', 'sequence_steps',
    'messages', 'message_queue', 'seasonal_campaigns',
    'campaign_recipients', 'campaign_templates',
    'business_metrics', 'ai_settings', 'ai_suggestions', 'ai_prompt_templates',
    'review_requests', 'activity_logs'
  ];
  v_table TEXT;
  v_exists BOOLEAN;
  v_results JSONB := '{}';
  v_missing INTEGER := 0;
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = v_table
    ) INTO v_exists;
    
    v_results := v_results || jsonb_build_object(v_table, v_exists);
    
    IF NOT v_exists THEN
      v_missing := v_missing + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'tables', v_results,
    'total_expected', array_length(v_tables, 1),
    'missing_count', v_missing,
    'all_present', v_missing = 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED TEST DATA FOR A BUSINESS
-- ============================================

CREATE OR REPLACE FUNCTION public.seed_test_data(p_business_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_customer_id UUID;
  v_quote_id UUID;
  v_sequence_id UUID;
  v_customers_created INTEGER := 0;
BEGIN
  -- Create test customers
  INSERT INTO customers (business_id, name, email, phone, source, status)
  VALUES 
    (p_business_id, 'Test Customer 1', 'test1@example.com', '+15551234567', 'manual', 'active'),
    (p_business_id, 'Test Customer 2', 'test2@example.com', '+15551234568', 'manual', 'active'),
    (p_business_id, 'Test Customer 3', 'test3@example.com', '+15551234569', 'website', 'active')
  ON CONFLICT DO NOTHING;
  
  GET DIAGNOSTICS v_customers_created = ROW_COUNT;

  -- Get first customer
  SELECT id INTO v_customer_id FROM customers 
  WHERE business_id = p_business_id LIMIT 1;

  -- Create test quote if customer exists
  IF v_customer_id IS NOT NULL THEN
    INSERT INTO quotes (business_id, customer_name, customer_phone, service_type, quote_amount, status)
    VALUES (p_business_id, 'Test Customer 1', '+15551234567', 'Standard Service', 15000, 'new')
    RETURNING id INTO v_quote_id;
  END IF;

  -- Create test sequence
  INSERT INTO sequences (business_id, name, is_active)
  VALUES (p_business_id, 'Test Follow-Up Sequence', true)
  RETURNING id INTO v_sequence_id;

  -- Initialize AI settings
  INSERT INTO ai_settings (business_id, smart_replies_enabled, tone, emoji_usage)
  VALUES (p_business_id, true, 'friendly', 'moderate')
  ON CONFLICT (business_id) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'created', jsonb_build_object(
      'customers', v_customers_created,
      'quotes', CASE WHEN v_quote_id IS NOT NULL THEN 1 ELSE 0 END,
      'sequences', CASE WHEN v_sequence_id IS NOT NULL THEN 1 ELSE 0 END
    ),
    'test_customer_id', v_customer_id,
    'test_quote_id', v_quote_id,
    'test_sequence_id', v_sequence_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;