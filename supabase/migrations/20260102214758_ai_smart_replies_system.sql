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
  auto_personalization_enabled BOOLEAN DEFAULT false,
  sentiment_analysis_enabled BOOLEAN DEFAULT false,
  
  -- Tone settings
  tone TEXT DEFAULT 'friendly', -- friendly, professional, casual, formal
  emoji_usage TEXT DEFAULT 'moderate', -- none, minimal, moderate, heavy
  response_length TEXT DEFAULT 'concise', -- brief, concise, detailed
  
  -- Language
  language TEXT DEFAULT 'en',
  include_spanish BOOLEAN DEFAULT false,
  
  -- Business context (helps AI understand the business)
  business_description TEXT,
  unique_selling_points TEXT[],
  common_services JSONB DEFAULT '[]', -- [{name, price, description}]
  common_objections JSONB DEFAULT '[]', -- [{objection, response}]
  
  -- Upsell settings
  suggest_upsells BOOLEAN DEFAULT true,
  upsell_services JSONB DEFAULT '[]', -- Services to suggest
  
  -- Pricing visibility
  include_pricing BOOLEAN DEFAULT true,
  
  -- Custom instructions
  custom_instructions TEXT, -- "Always mention our 100% satisfaction guarantee"
  forbidden_phrases TEXT[], -- Words/phrases to never use
  
  -- Usage limits (per billing cycle)
  monthly_suggestion_limit INTEGER DEFAULT 500,
  suggestions_used_this_month INTEGER DEFAULT 0,
  limit_reset_at TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_settings_business ON ai_settings(business_id);

-- RLS
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI settings"
  ON ai_settings FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Updated_at trigger (reuse existing function)
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
  conversation_id UUID, -- Reference to inbound_messages thread
  
  -- Input
  customer_message TEXT NOT NULL,
  context_data JSONB, -- Full context sent to AI
  
  -- Output
  suggestions JSONB NOT NULL, -- Array of generated suggestions
  model_used TEXT DEFAULT 'claude-3-haiku-20240307',
  
  -- Tokens (for cost tracking)
  input_tokens INTEGER,
  output_tokens INTEGER,
  estimated_cost_cents DECIMAL(10,4),
  
  -- User interaction
  suggestion_selected INTEGER, -- Which suggestion was chosen (1, 2, 3, or null)
  was_edited BOOLEAN DEFAULT false,
  edited_message TEXT, -- Final message if edited
  was_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  
  -- Feedback
  feedback TEXT, -- 'helpful', 'not_helpful', 'offensive', 'inaccurate'
  
  -- Performance
  generation_time_ms INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_business ON ai_suggestions(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_created ON ai_suggestions(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_customer ON ai_suggestions(customer_id);

-- RLS
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI suggestions"
  ON ai_suggestions FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert AI suggestions"
  ON ai_suggestions FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own AI suggestions"
  ON ai_suggestions FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- AI PROMPT TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Template info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'pricing_question', 'scheduling', 'objection', 'general'
  
  -- Industry targeting
  industry_slug TEXT,
  -- NULL = universal
  
  -- Detection patterns
  trigger_keywords TEXT[], -- Keywords that trigger this template
  trigger_patterns TEXT[], -- Regex patterns
  
  -- Response guidance
  response_guidance TEXT NOT NULL, -- Instructions for AI
  example_responses TEXT[], -- Example good responses
  
  -- Priority
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_industry ON ai_prompt_templates(industry_slug);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_category ON ai_prompt_templates(category);

-- Insert common prompt templates
INSERT INTO ai_prompt_templates (name, category, industry_slug, trigger_keywords, response_guidance, example_responses, priority) VALUES

-- Pricing Questions
('Pricing Inquiry', 'pricing_question', NULL, 
 ARRAY['how much', 'price', 'cost', 'rate', 'pricing', 'quote', 'estimate', 'expensive', 'afford', 'budget'],
 'Customer is asking about pricing. Include specific pricing if known from the quote. If asking about add-ons, provide the add-on price and offer to update the quote. Keep response concise.',
 ARRAY['The [service] is $[X]. Want me to add it to your quote?', 'Great question! That service runs $[X]. Your total would be $[Y] with that added.'],
 10),

-- Availability/Scheduling
('Scheduling Question', 'scheduling', NULL,
 ARRAY['available', 'schedule', 'book', 'appointment', 'when can', 'this week', 'tomorrow', 'today', 'time', 'slot'],
 'Customer wants to schedule. Be helpful and suggest moving forward. If asking about specific times, offer to check availability or suggest they call to confirm.',
 ARRAY['I have openings this week! What day works best for you?', 'Let me check our schedule. Would mornings or afternoons work better?'],
 10),

-- Service Details
('Service Details', 'general', NULL,
 ARRAY['include', 'what do you', 'do you clean', 'do you do', 'offer', 'provide', 'cover', 'part of'],
 'Customer is asking what the service includes. Provide clear, specific information about what is/isnt included. Offer add-ons if relevant.',
 ARRAY['Yes, that''s included in our standard service!', 'That''s an add-on service for $[X]. Want me to include it?'],
 8),

-- Objection - Too Expensive
('Price Objection', 'objection', NULL,
 ARRAY['too much', 'too expensive', 'cheaper', 'discount', 'deal', 'lower', 'better price', 'cant afford'],
 'Customer has price concerns. Acknowledge their concern, reinforce value (quality, reliability, insurance, guarantee), and optionally offer alternatives like a smaller scope or payment plans. Do NOT immediately offer discounts.',
 ARRAY['I understand budget matters! Our pricing reflects our [quality/insurance/guarantee]. Many clients find the peace of mind worth it.', 'I hear you! We could adjust the scope to fit your budget. What''s most important to you?'],
 9),

-- Cleaning - Deep Clean Question
('Deep Clean Inquiry', 'general', 'residential_cleaning',
 ARRAY['deep clean', 'deep cleaning', 'thorough', 'move out', 'move in', 'spring clean', 'one time'],
 'Customer asking about deep cleaning. Explain what deep clean includes vs standard, provide pricing difference, and highlight the value.',
 ARRAY['Deep cleans include baseboards, inside cabinets, and appliances - areas we skip in maintenance cleans. It''s $[X] for your home size.'],
 8),

-- Cleaning - Frequency Question  
('Frequency Question', 'general', 'residential_cleaning',
 ARRAY['how often', 'weekly', 'biweekly', 'monthly', 'every week', 'once a month', 'recurring', 'regular'],
 'Customer asking about service frequency. Explain options and pricing for each. Mention that recurring customers often get priority scheduling or discounts.',
 ARRAY['Most clients do biweekly - it keeps the home fresh without overdoing it. Weekly clients save 10%. What sounds right for you?'],
 7),

-- Trust/Credibility Question
('Trust Question', 'general', NULL,
 ARRAY['insured', 'bonded', 'background', 'trust', 'reviews', 'references', 'reliable', 'guarantee', 'licensed'],
 'Customer wants reassurance about trust/quality. Mention relevant credentials (insured, bonded, background-checked, licensed). Reference reviews/ratings if strong.',
 ARRAY['Absolutely! We''re fully insured and bonded, and all team members are background-checked. We have a 4.9 rating with 200+ reviews!'],
 8),

-- HVAC - Emergency
('HVAC Emergency', 'general', 'hvac',
 ARRAY['no ac', 'no heat', 'not working', 'broken', 'emergency', 'urgent', 'freezing', 'hot', 'wont turn on'],
 'Customer has urgent HVAC issue. Express urgency/empathy, confirm you can help quickly, provide next steps (schedule, ETA, emergency line).',
 ARRAY['That sounds uncomfortable! We can get someone out today. What time works - we have a slot at [X]?'],
 10),

-- Pest - Type Question
('Pest Identification', 'general', 'pest_control',
 ARRAY['what kind', 'identify', 'small bugs', 'big bugs', 'flying', 'crawling', 'infestation'],
 'Customer asking about pest identification or severity. Ask clarifying questions if needed, reassure them you can handle it, mention treatment approach.',
 ARRAY['Can you describe what you''re seeing? Size, color, where in the home? That''ll help me recommend the right treatment.'],
 8),

-- General Positive Response
('General Thank You', 'general', NULL,
 ARRAY['thank', 'thanks', 'great', 'perfect', 'awesome', 'sounds good', 'appreciate'],
 'Customer expressing thanks or agreement. Acknowledge warmly, confirm any next steps, keep momentum going.',
 ARRAY['You''re welcome! Let me know if anything else comes up.', 'Happy to help! Ready to get you scheduled?'],
 5)

ON CONFLICT DO NOTHING;

-- ============================================
-- ADD AI FIELDS TO BUSINESSES
-- ============================================

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS ai_tier TEXT DEFAULT 'basic', -- basic, pro, unlimited
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true;

-- ============================================
-- FUNCTION: INCREMENT SUGGESTION COUNT
-- ============================================

CREATE OR REPLACE FUNCTION increment_suggestion_count(p_business_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_settings RECORD;
BEGIN
  -- Get or create settings
  INSERT INTO ai_settings (business_id)
  VALUES (p_business_id)
  ON CONFLICT (business_id) DO NOTHING;
  
  -- Get current settings
  SELECT * INTO v_settings FROM ai_settings WHERE business_id = p_business_id;
  
  -- Reset count if new month
  IF v_settings.limit_reset_at <= NOW() THEN
    UPDATE ai_settings SET
      suggestions_used_this_month = 1,
      limit_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month'
    WHERE business_id = p_business_id;
    RETURN true;
  END IF;
  
  -- Check limit
  IF v_settings.suggestions_used_this_month >= v_settings.monthly_suggestion_limit THEN
    RETURN false;
  END IF;
  
  -- Increment
  UPDATE ai_settings SET
    suggestions_used_this_month = suggestions_used_this_month + 1
  WHERE business_id = p_business_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
