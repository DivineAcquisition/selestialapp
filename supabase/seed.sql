-- ============================================================================
-- SELESTIAL DATABASE SEED
-- Development and testing data
-- ============================================================================

-- NOTE: This seed file is for LOCAL DEVELOPMENT only.
-- It creates test data that will be available when running `supabase start`

-- ============================================================================
-- SEQUENCE TEMPLATES (Global templates for all businesses)
-- ============================================================================

INSERT INTO sequence_steps (id, sequence_id, step_index, step_type, delay_minutes, delay_days, subject, message_template)
VALUES 
  -- These are template steps that can be copied when creating new sequences
  -- They're not linked to any specific sequence yet
  (gen_random_uuid(), gen_random_uuid(), 0, 'sms', 0, 0, NULL, 'Hi {{customer_name}}! Thanks for your interest in our {{service_type}} service. Your quote of ${{quote_amount}} is ready. Let me know if you have any questions!'),
  (gen_random_uuid(), gen_random_uuid(), 1, 'sms', 0, 1, NULL, 'Hi {{customer_name}}, just checking in on the quote I sent yesterday for {{service_type}}. Any questions I can answer?'),
  (gen_random_uuid(), gen_random_uuid(), 2, 'sms', 0, 3, NULL, 'Hey {{customer_name}}! Wanted to make sure you saw my quote. We''d love to help with your {{service_type}} needs. Ready when you are!'),
  (gen_random_uuid(), gen_random_uuid(), 3, 'sms', 0, 7, NULL, '{{customer_name}}, I''m following up one last time on your {{service_type}} quote. If you''re still interested, we have openings this week. Otherwise, no worries - reach out anytime!')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CLEANING SERVICE TEMPLATES (From booking_pricing_matrix migration)
-- ============================================================================

-- These are already handled by the migration, but let's ensure they exist
INSERT INTO cleaning_service_templates (name, slug, description, base_price, pricing_method, price_per_bedroom, price_per_bathroom, base_multiplier, icon, color, display_order) 
SELECT 'Standard Clean', 'standard', 'Regular maintenance cleaning. Dusting, vacuuming, mopping, bathroom & kitchen surfaces.', 80, 'bedroom_bathroom', 25, 20, 1.0, 'sparkles', 'blue', 1
WHERE NOT EXISTS (SELECT 1 FROM cleaning_service_templates WHERE slug = 'standard');

INSERT INTO cleaning_service_templates (name, slug, description, base_price, pricing_method, price_per_bedroom, price_per_bathroom, base_multiplier, icon, color, display_order) 
SELECT 'Deep Clean', 'deep', 'Thorough top-to-bottom cleaning. Inside cabinets, baseboards, detailed scrubbing.', 120, 'bedroom_bathroom', 35, 30, 1.5, 'sprayCan', 'violet', 2
WHERE NOT EXISTS (SELECT 1 FROM cleaning_service_templates WHERE slug = 'deep');

INSERT INTO cleaning_service_templates (name, slug, description, base_price, pricing_method, price_per_bedroom, price_per_bathroom, base_multiplier, icon, color, display_order) 
SELECT 'Move-In/Move-Out', 'move', 'Complete cleaning for empty homes. Inside appliances, closets, garage sweep.', 150, 'bedroom_bathroom', 45, 40, 2.0, 'truck', 'emerald', 3
WHERE NOT EXISTS (SELECT 1 FROM cleaning_service_templates WHERE slug = 'move');

INSERT INTO cleaning_service_templates (name, slug, description, base_price, pricing_method, price_per_bedroom, price_per_bathroom, base_multiplier, icon, color, display_order) 
SELECT 'Post-Construction', 'construction', 'Heavy-duty cleaning after renovation. Dust removal, debris, detailed surfaces.', 200, 'bedroom_bathroom', 55, 50, 2.5, 'hardHat', 'amber', 4
WHERE NOT EXISTS (SELECT 1 FROM cleaning_service_templates WHERE slug = 'construction');

INSERT INTO cleaning_service_templates (name, slug, description, base_price, pricing_method, price_per_bedroom, price_per_bathroom, base_multiplier, icon, color, display_order) 
SELECT 'Airbnb Turnover', 'airbnb', 'Quick turnover cleaning between guests. Linens, restock, sanitize.', 90, 'bedroom_bathroom', 30, 25, 1.2, 'home', 'pink', 5
WHERE NOT EXISTS (SELECT 1 FROM cleaning_service_templates WHERE slug = 'airbnb');

-- ============================================================================
-- AI PROMPT TEMPLATES
-- ============================================================================

INSERT INTO ai_prompt_templates (id, category, name, response_guidance, trigger_keywords, example_responses, industry_slug, is_active, priority)
VALUES
  (gen_random_uuid(), 'pricing', 'Quote Follow-up', 
   'Be helpful and address pricing concerns. Emphasize value over price. Offer to explain what''s included.',
   ARRAY['price', 'cost', 'expensive', 'cheaper', 'budget', 'afford'],
   ARRAY['I understand budget is important. Our pricing reflects the quality materials and experienced team we bring. Would you like me to break down what''s included?'],
   'home_services', true, 10),
   
  (gen_random_uuid(), 'scheduling', 'Appointment Setting',
   'Be accommodating with scheduling. Offer multiple options. Confirm all details clearly.',
   ARRAY['schedule', 'appointment', 'available', 'time', 'date', 'when', 'book'],
   ARRAY['I have openings this week on Tuesday afternoon or Thursday morning. Which works better for you?'],
   'home_services', true, 10),
   
  (gen_random_uuid(), 'objection', 'Thinking It Over',
   'Acknowledge their need to think. Offer to answer questions. Create gentle urgency without pressure.',
   ARRAY['think', 'consider', 'later', 'not sure', 'maybe', 'decide'],
   ARRAY['Absolutely, take your time! Is there anything specific I can clarify to help with your decision? I''m here when you''re ready.'],
   'home_services', true, 8),
   
  (gen_random_uuid(), 'service', 'Service Questions',
   'Provide detailed, knowledgeable answers. Show expertise. Offer to provide more information.',
   ARRAY['how', 'what', 'include', 'process', 'work', 'do you'],
   ARRAY['Great question! Our service includes... Would you like more details about any specific part?'],
   'home_services', true, 7),
   
  (gen_random_uuid(), 'positive', 'Ready to Book',
   'Express enthusiasm. Make booking easy. Confirm next steps clearly.',
   ARRAY['yes', 'book', 'schedule', 'ready', 'let''s do it', 'sounds good'],
   ARRAY['Excellent! I''m excited to work with you. Let me get you scheduled - what day works best?'],
   'home_services', true, 10)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO/TEST DATA (Only for development)
-- ============================================================================

-- The following creates demo data for testing purposes
-- This will only work if there's a test user in auth.users

-- Uncomment and modify the following to create test data for a specific user:

/*
-- Create a test business
INSERT INTO businesses (
  id,
  user_id,
  name,
  owner_name,
  email,
  phone,
  industry,
  timezone,
  subscription_status,
  subscription_plan
)
VALUES (
  'demo-business-00000000-0000-0000-0000-000000000001',
  'YOUR_AUTH_USER_ID', -- Replace with actual auth.users id
  'Demo Cleaning Co',
  'John Demo',
  'demo@example.com',
  '(555) 123-4567',
  'cleaning',
  'America/New_York',
  'active',
  'pro'
);

-- Create test customers
INSERT INTO customers (business_id, name, email, phone, customer_type, health_score)
VALUES 
  ('demo-business-00000000-0000-0000-0000-000000000001', 'Alice Johnson', 'alice@example.com', '(555) 234-5678', 'recurring', 95),
  ('demo-business-00000000-0000-0000-0000-000000000001', 'Bob Smith', 'bob@example.com', '(555) 345-6789', 'residential', 80),
  ('demo-business-00000000-0000-0000-0000-000000000001', 'Carol Davis', 'carol@example.com', '(555) 456-7890', 'at_risk', 45);

-- Create test quotes
INSERT INTO quotes (business_id, customer_name, customer_phone, customer_email, service_type, quote_amount, status)
VALUES
  ('demo-business-00000000-0000-0000-0000-000000000001', 'Alice Johnson', '(555) 234-5678', 'alice@example.com', 'Standard Clean', 150.00, 'new'),
  ('demo-business-00000000-0000-0000-0000-000000000001', 'Bob Smith', '(555) 345-6789', 'bob@example.com', 'Deep Clean', 275.00, 'pending'),
  ('demo-business-00000000-0000-0000-0000-000000000001', 'Carol Davis', '(555) 456-7890', 'carol@example.com', 'Move-Out Clean', 400.00, 'won');
*/

-- ============================================================================
-- END OF SEED
-- ============================================================================
