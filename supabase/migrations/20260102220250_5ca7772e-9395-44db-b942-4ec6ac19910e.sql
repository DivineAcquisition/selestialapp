-- ============================================
-- AI SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Feature toggles
  smart_replies_enabled BOOLEAN DEFAULT true,
  
  -- Tone settings
  tone TEXT DEFAULT 'friendly', -- friendly, professional, casual, formal
  emoji_usage TEXT DEFAULT 'moderate', -- none, minimal, moderate, heavy
  response_length TEXT DEFAULT 'concise', -- brief, concise, detailed
  
  -- Business context
  custom_instructions TEXT,
  
  -- Upsell settings
  suggest_upsells BOOLEAN DEFAULT true,
  include_pricing BOOLEAN DEFAULT true,
  
  -- Usage limits
  monthly_suggestion_limit INTEGER DEFAULT 500,
  suggestions_used_this_month INTEGER DEFAULT 0,
  limit_reset_at TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month')
);

CREATE INDEX IF NOT EXISTS idx_ai_settings_business ON ai_settings(business_id);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI settings"
  ON ai_settings FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AI SUGGESTIONS LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  
  -- Context
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  
  -- Input
  customer_message TEXT NOT NULL,
  context_data JSONB,
  
  -- Output
  suggestions JSONB NOT NULL,
  model_used TEXT DEFAULT 'google/gemini-2.5-flash',
  
  -- User interaction
  suggestion_selected INTEGER,
  was_edited BOOLEAN DEFAULT false,
  edited_message TEXT,
  was_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  
  -- Feedback
  feedback TEXT,
  
  -- Performance
  generation_time_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_business ON ai_suggestions(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_created ON ai_suggestions(created_at);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI suggestions"
  ON ai_suggestions FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- AI PROMPT TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  
  industry_slug TEXT,
  
  trigger_keywords TEXT[],
  response_guidance TEXT NOT NULL,
  example_responses TEXT[],
  
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ============================================
-- FUNCTION: INCREMENT SUGGESTION COUNT
-- ============================================
CREATE OR REPLACE FUNCTION increment_suggestion_count(p_business_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_settings RECORD;
BEGIN
  INSERT INTO ai_settings (business_id)
  VALUES (p_business_id)
  ON CONFLICT (business_id) DO NOTHING;
  
  SELECT * INTO v_settings FROM ai_settings WHERE business_id = p_business_id;
  
  IF v_settings.limit_reset_at <= NOW() THEN
    UPDATE ai_settings SET
      suggestions_used_this_month = 1,
      limit_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month'
    WHERE business_id = p_business_id;
    RETURN true;
  END IF;
  
  IF v_settings.suggestions_used_this_month >= v_settings.monthly_suggestion_limit THEN
    RETURN false;
  END IF;
  
  UPDATE ai_settings SET
    suggestions_used_this_month = suggestions_used_this_month + 1
  WHERE business_id = p_business_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED PROMPT TEMPLATES
-- ============================================
INSERT INTO ai_prompt_templates (name, category, industry_slug, trigger_keywords, response_guidance, example_responses, priority) VALUES
('Pricing Inquiry', 'pricing_question', NULL, 
 ARRAY['how much', 'price', 'cost', 'rate', 'pricing', 'quote', 'estimate', 'expensive', 'afford', 'budget'],
 'Customer is asking about pricing. Include specific pricing if known from the quote. Keep response concise.',
 ARRAY['The service is $X. Want me to add it to your quote?', 'Great question! That runs $X.'],
 10),

('Scheduling Question', 'scheduling', NULL,
 ARRAY['available', 'schedule', 'book', 'appointment', 'when can', 'this week', 'tomorrow', 'today', 'time', 'slot'],
 'Customer wants to schedule. Be helpful and suggest moving forward.',
 ARRAY['I have openings this week! What day works best?', 'Let me check our schedule. Mornings or afternoons?'],
 10),

('Service Details', 'general', NULL,
 ARRAY['include', 'what do you', 'do you clean', 'do you do', 'offer', 'provide', 'cover', 'part of'],
 'Customer asking what service includes. Provide clear info and offer add-ons if relevant.',
 ARRAY['Yes, that is included!', 'That is an add-on for $X. Want me to include it?'],
 8),

('Price Objection', 'objection', NULL,
 ARRAY['too much', 'too expensive', 'cheaper', 'discount', 'deal', 'lower', 'better price', 'cant afford'],
 'Customer has price concerns. Acknowledge concern, reinforce value. Do NOT immediately offer discounts.',
 ARRAY['I understand budget matters! Our pricing reflects quality and insurance.', 'We could adjust scope to fit your budget.'],
 9),

('Trust Question', 'general', NULL,
 ARRAY['insured', 'bonded', 'background', 'trust', 'reviews', 'references', 'reliable', 'guarantee', 'licensed'],
 'Customer wants reassurance. Mention credentials (insured, bonded, licensed). Reference reviews if strong.',
 ARRAY['Absolutely! We are fully insured and bonded with background-checked team members.'],
 8),

('General Thanks', 'general', NULL,
 ARRAY['thank', 'thanks', 'great', 'perfect', 'awesome', 'sounds good', 'appreciate'],
 'Customer expressing thanks. Acknowledge warmly, confirm next steps.',
 ARRAY['You are welcome! Let me know if anything else comes up.', 'Happy to help!'],
 5)
ON CONFLICT DO NOTHING;