-- ============================================
-- INDUSTRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.industries (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  urgency_level TEXT NOT NULL DEFAULT 'standard', -- emergency, high, standard, patient
  first_contact_hours INTEGER DEFAULT 4,
  decision_days INTEGER DEFAULT 7,
  cycle_type TEXT DEFAULT 'one_time', -- one_time, recurring
  review_delay_hours INTEGER DEFAULT 24,
  deposit_common BOOLEAN DEFAULT false,
  typical_deposit_percent INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

-- Industries are publicly readable
CREATE POLICY "Industries are publicly readable" 
ON public.industries FOR SELECT 
USING (true);

-- ============================================
-- SEQUENCE TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.sequence_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  industry_slug TEXT REFERENCES public.industries(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- quote_followup, post_job, reengagement
  
  trigger_type TEXT, -- job_completed, days_since_service
  trigger_delay_days INTEGER DEFAULT 0,
  
  steps JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.sequence_templates ENABLE ROW LEVEL SECURITY;

-- Templates are publicly readable
CREATE POLICY "Sequence templates are publicly readable" 
ON public.sequence_templates FOR SELECT 
USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sequence_templates_industry ON public.sequence_templates(industry_slug);
CREATE INDEX IF NOT EXISTS idx_sequence_templates_type ON public.sequence_templates(template_type);

-- ============================================
-- INDUSTRY SERVICE TYPES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.industry_service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_slug TEXT REFERENCES public.industries(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  typical_price_low INTEGER,
  typical_price_high INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.industry_service_types ENABLE ROW LEVEL SECURITY;

-- Service types are publicly readable
CREATE POLICY "Industry service types are publicly readable" 
ON public.industry_service_types FOR SELECT 
USING (true);

CREATE INDEX IF NOT EXISTS idx_industry_service_types_industry ON public.industry_service_types(industry_slug);

-- ============================================
-- SEED INDUSTRIES DATA
-- ============================================

INSERT INTO public.industries (slug, name, urgency_level, first_contact_hours, decision_days, cycle_type, review_delay_hours, deposit_common, typical_deposit_percent, sort_order) VALUES
-- Phase 1 Industries
('hvac', 'HVAC', 'high', 1, 3, 'one_time', 4, false, 0, 1),
('plumbing', 'Plumbing', 'emergency', 0, 1, 'one_time', 4, false, 0, 2),
('electrical', 'Electrical', 'high', 1, 3, 'one_time', 4, false, 0, 3),
('residential_cleaning', 'Residential Cleaning', 'standard', 2, 5, 'recurring', 24, false, 0, 4),
('commercial_cleaning', 'Commercial Cleaning', 'standard', 4, 7, 'recurring', 24, false, 0, 5),
('lawn_care', 'Lawn Care', 'standard', 2, 5, 'recurring', 24, false, 0, 6),
('pest_control', 'Pest Control', 'high', 1, 2, 'recurring', 24, false, 0, 7),
('carpet_cleaning', 'Carpet Cleaning', 'standard', 3, 5, 'one_time', 24, false, 0, 8),
-- Phase 2 Industries
('painting', 'Painting', 'patient', 4, 21, 'one_time', 48, true, 25, 9),
('roofing', 'Roofing', 'patient', 4, 30, 'one_time', 48, true, 30, 10),
('pool_service', 'Pool Service', 'standard', 2, 5, 'recurring', 24, false, 0, 11),
('moving', 'Moving', 'high', 1, 5, 'one_time', 24, true, 25, 12),
('window_cleaning', 'Window Cleaning', 'patient', 3, 7, 'recurring', 24, false, 0, 13),
('junk_removal', 'Junk Removal', 'high', 1, 3, 'one_time', 4, false, 0, 14),
('garage_door', 'Garage Door', 'high', 1, 3, 'one_time', 4, false, 0, 15),
('pressure_washing', 'Pressure Washing', 'standard', 3, 7, 'one_time', 24, false, 0, 16),
('general_contractor', 'General Contractor', 'patient', 4, 21, 'one_time', 48, true, 30, 17),
('other', 'Other', 'standard', 4, 7, 'one_time', 24, false, 0, 99)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED SERVICE TYPES - PHASE 2 INDUSTRIES
-- ============================================

-- PAINTING
INSERT INTO public.industry_service_types (industry_slug, name, description, typical_price_low, typical_price_high, is_recurring, sort_order) VALUES
('painting', 'Interior - Single Room', 'One room painting', 30000, 80000, false, 1),
('painting', 'Interior - Whole House', 'Full interior repaint', 300000, 800000, false, 2),
('painting', 'Exterior Painting', 'Full exterior paint job', 400000, 1200000, false, 3),
('painting', 'Cabinet Painting', 'Kitchen or bathroom cabinets', 200000, 600000, false, 4),
('painting', 'Deck/Fence Staining', 'Outdoor wood treatment', 50000, 200000, false, 5),
('painting', 'Accent Wall', 'Single feature wall', 20000, 50000, false, 6),
('painting', 'Touch-Up/Repair', 'Minor paint repairs', 15000, 40000, false, 7),
('painting', 'Commercial Painting', 'Office/retail space', 500000, 2000000, false, 8);

-- ROOFING
INSERT INTO public.industry_service_types (industry_slug, name, description, typical_price_low, typical_price_high, is_recurring, sort_order) VALUES
('roofing', 'Roof Inspection', 'Full roof assessment', 10000, 30000, false, 1),
('roofing', 'Roof Repair', 'Fix leaks and damage', 30000, 150000, false, 2),
('roofing', 'Shingle Replacement', 'Replace damaged shingles', 20000, 80000, false, 3),
('roofing', 'Full Roof Replacement', 'Complete new roof', 500000, 2500000, false, 4),
('roofing', 'Flat Roof Repair', 'Commercial/flat roof fix', 40000, 200000, false, 5),
('roofing', 'Gutter Installation', 'New gutter system', 100000, 300000, false, 6),
('roofing', 'Gutter Cleaning', 'Clean and flush gutters', 10000, 30000, false, 7),
('roofing', 'Emergency Tarp', 'Emergency leak protection', 20000, 60000, false, 8);

-- POOL SERVICE
INSERT INTO public.industry_service_types (industry_slug, name, description, typical_price_low, typical_price_high, is_recurring, sort_order) VALUES
('pool_service', 'Weekly Pool Service', 'Regular maintenance', 12000, 25000, true, 1),
('pool_service', 'Bi-Weekly Service', 'Every other week', 15000, 30000, true, 2),
('pool_service', 'Pool Opening', 'Spring startup service', 20000, 40000, false, 3),
('pool_service', 'Pool Closing', 'Winterization', 20000, 40000, false, 4),
('pool_service', 'Green Pool Cleanup', 'Algae treatment', 30000, 80000, false, 5),
('pool_service', 'Equipment Repair', 'Pump, filter, heater repair', 20000, 100000, false, 6),
('pool_service', 'Leak Detection', 'Find and diagnose leaks', 20000, 50000, false, 7);

-- MOVING
INSERT INTO public.industry_service_types (industry_slug, name, description, typical_price_low, typical_price_high, is_recurring, sort_order) VALUES
('moving', 'Local Move - Studio/1BR', 'Small apartment move', 30000, 60000, false, 1),
('moving', 'Local Move - 2-3BR', 'Medium home move', 60000, 150000, false, 2),
('moving', 'Local Move - 4+BR', 'Large home move', 150000, 300000, false, 3),
('moving', 'Long Distance Move', 'Interstate/cross-country', 200000, 1000000, false, 4),
('moving', 'Packing Services', 'Professional packing', 30000, 100000, false, 5),
('moving', 'Loading/Unloading Only', 'Labor only', 20000, 60000, false, 6),
('moving', 'Piano Moving', 'Specialty piano move', 30000, 80000, false, 7),
('moving', 'Commercial/Office Move', 'Business relocation', 200000, 1000000, false, 8);

-- WINDOW CLEANING
INSERT INTO public.industry_service_types (industry_slug, name, description, typical_price_low, typical_price_high, is_recurring, sort_order) VALUES
('window_cleaning', 'Interior Windows', 'Inside window cleaning', 10000, 25000, false, 1),
('window_cleaning', 'Exterior Windows', 'Outside window cleaning', 10000, 30000, false, 2),
('window_cleaning', 'Interior + Exterior', 'Complete window service', 15000, 45000, false, 3),
('window_cleaning', 'Screen Cleaning', 'Window screen washing', 5000, 15000, false, 4),
('window_cleaning', 'Commercial Windows', 'Office/storefront', 20000, 100000, true, 5),
('window_cleaning', 'Construction Cleanup', 'Post-construction', 30000, 80000, false, 6);

-- JUNK REMOVAL
INSERT INTO public.industry_service_types (industry_slug, name, description, typical_price_low, typical_price_high, is_recurring, sort_order) VALUES
('junk_removal', 'Single Item Pickup', 'Couch, mattress, appliance', 7500, 20000, false, 1),
('junk_removal', 'Partial Load', '1/4 to 1/2 truck', 20000, 40000, false, 2),
('junk_removal', 'Full Truck Load', 'Complete truck fill', 40000, 80000, false, 3),
('junk_removal', 'Garage Cleanout', 'Full garage clearing', 30000, 70000, false, 4),
('junk_removal', 'Estate Cleanout', 'Whole property clearing', 80000, 300000, false, 5),
('junk_removal', 'Construction Debris', 'Renovation cleanup', 30000, 100000, false, 6),
('junk_removal', 'Yard Waste Removal', 'Branches, leaves, debris', 15000, 40000, false, 7);

-- GARAGE DOOR
INSERT INTO public.industry_service_types (industry_slug, name, description, typical_price_low, typical_price_high, is_recurring, sort_order) VALUES
('garage_door', 'Spring Replacement', 'Torsion/extension spring', 20000, 40000, false, 1),
('garage_door', 'Opener Repair', 'Motor/mechanism repair', 15000, 35000, false, 2),
('garage_door', 'Opener Installation', 'New garage door opener', 30000, 60000, false, 3),
('garage_door', 'Cable Replacement', 'Lift cable repair', 15000, 30000, false, 4),
('garage_door', 'Panel Replacement', 'Replace damaged panel', 20000, 50000, false, 5),
('garage_door', 'Full Door Replacement', 'New garage door', 80000, 300000, false, 6),
('garage_door', 'Tune-Up/Maintenance', 'Preventive service', 10000, 20000, false, 7),
('garage_door', 'Emergency Service', 'After-hours repair', 25000, 60000, false, 8);

-- PRESSURE WASHING
INSERT INTO public.industry_service_types (industry_slug, name, description, typical_price_low, typical_price_high, is_recurring, sort_order) VALUES
('pressure_washing', 'Driveway Cleaning', 'Concrete driveway wash', 10000, 25000, false, 1),
('pressure_washing', 'Sidewalk/Walkway', 'Path cleaning', 5000, 15000, false, 2),
('pressure_washing', 'Patio/Deck', 'Outdoor living space', 10000, 30000, false, 3),
('pressure_washing', 'House Washing', 'Exterior siding wash', 20000, 50000, false, 4),
('pressure_washing', 'Roof Soft Wash', 'Gentle roof cleaning', 25000, 60000, false, 5),
('pressure_washing', 'Fence Cleaning', 'Wood/vinyl fence wash', 10000, 30000, false, 6),
('pressure_washing', 'Commercial Building', 'Storefront/building wash', 30000, 150000, false, 7);

-- ============================================
-- SEED SEQUENCE TEMPLATES - QUOTE FOLLOW-UP
-- ============================================

-- PAINTING
INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('painting', 'Painting Quote Follow-Up', 'Patient, consultative follow-up for painting projects', 'quote_followup', true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 4, "channel": "sms", "message": "Hi {{customer_first_name}}, this is {{owner_name}} from {{business_name}}. Thanks for considering us for your painting project! Take your time reviewing the estimate - any questions at all, I''m here to help.", "is_active": true},
  {"id": "step_2", "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on your painting quote. I know this is a big decision - happy to discuss paint options, timeline, or adjust the scope if needed. What questions can I answer?", "is_active": true},
  {"id": "step_3", "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, checking in on your painting project. Many clients compare 2-3 quotes, which I encourage! If you''d like me to walk through what''s included in ours, I''m happy to chat.", "is_active": true},
  {"id": "step_4", "delay_days": 14, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, just a friendly check-in. Our calendar is filling up, but we''d love to work with you when the timing is right. Your quote is valid for 30 days.", "is_active": true},
  {"id": "step_5", "delay_days": 21, "delay_hours": 0, "channel": "sms", "message": "Last follow-up, {{customer_first_name}}! If now isn''t the right time for your painting project, no worries at all. Keep our info - we''d love to help whenever you''re ready. - {{owner_name}}", "is_active": true}
]'::jsonb);

-- ROOFING
INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('roofing', 'Roofing Quote Follow-Up', 'Expert, patient follow-up for roofing projects', 'quote_followup', true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 4, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_name}} from {{business_name}} here. Thank you for trusting us with your roofing estimate. I know this is a significant investment - take your time reviewing. I''m here for any questions.", "is_active": true},
  {"id": "step_2", "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on your roofing quote. Would you like me to walk through the materials, warranty, or timeline? Happy to answer any questions.", "is_active": true},
  {"id": "step_3", "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, checking in on your roof project. Getting multiple quotes is smart for a big decision like this. If you have questions about how we compare, I''m happy to discuss.", "is_active": true},
  {"id": "step_4", "delay_days": 14, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, friendly reminder - our quote is valid for 30 days. Weather and material costs can change, so I wanted to keep you posted. Any questions?", "is_active": true},
  {"id": "step_5", "delay_days": 28, "delay_hours": 0, "channel": "sms", "message": "Last check-in, {{customer_first_name}}. When you''re ready to move forward with your roof, we''d be honored to earn your business. Feel free to reach out anytime. - {{owner_name}}", "is_active": true}
]'::jsonb);

-- POOL SERVICE
INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('pool_service', 'Pool Service Follow-Up', 'Friendly follow-up for pool service quotes', 'quote_followup', true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}! {{owner_name}} from {{business_name}} here. Thanks for reaching out about pool service! I''d love to keep your pool crystal clear and swim-ready. Any questions about the quote?", "is_active": true},
  {"id": "step_2", "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on your pool service quote. Consistent care prevents costly repairs and keeps your water safe. Ready to dive in?", "is_active": true},
  {"id": "step_3", "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, checking in! Pool season is here and spots are filling up. Would love to get you on the schedule.", "is_active": true},
  {"id": "step_4", "delay_days": 5, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, last follow-up on your pool service quote. Whether weekly or bi-weekly, we''ll keep your pool perfect. Reply when you''re ready! - {{owner_name}}", "is_active": true}
]'::jsonb);

-- MOVING
INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('moving', 'Moving Quote Follow-Up', 'Reassuring, time-sensitive follow-up for moves', 'quote_followup', true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 1, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_name}} from {{business_name}} here. Thanks for considering us for your move! I know moving is stressful - we''re here to make it easy. Questions about the quote?", "is_active": true},
  {"id": "step_2", "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on your moving quote. Our calendar fills quickly, especially for weekends. Would you like me to pencil in your date while you decide?", "is_active": true},
  {"id": "step_3", "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, checking in. Moving day will be here before you know it! We''d love to handle the heavy lifting so you can focus on settling in.", "is_active": true},
  {"id": "step_4", "delay_days": 4, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, last follow-up! If you have concerns about our quote or the move itself, I''m happy to chat. Our team treats your belongings like our own. - {{owner_name}}", "is_active": true}
]'::jsonb);

-- WINDOW CLEANING
INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('window_cleaning', 'Window Cleaning Follow-Up', 'Professional follow-up for window cleaning', 'quote_followup', true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 3, "channel": "sms", "message": "Hi {{customer_first_name}}! {{owner_name}} from {{business_name}}. Thanks for your interest in window cleaning! You won''t believe how much brighter your home will feel. Any questions?", "is_active": true},
  {"id": "step_2", "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on your window cleaning quote. We''re meticulous - streak-free guarantee! Ready to let the sunshine in?", "is_active": true},
  {"id": "step_3", "delay_days": 5, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, just checking in. Many customers schedule quarterly cleanings to keep windows sparkling year-round. Would that interest you?", "is_active": true},
  {"id": "step_4", "delay_days": 10, "delay_hours": 0, "channel": "sms", "message": "Last follow-up, {{customer_first_name}}! When you''re ready for crystal clear windows, we''re here. Reach out anytime! - {{owner_name}}", "is_active": true}
]'::jsonb);

-- JUNK REMOVAL
INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('junk_removal', 'Junk Removal Follow-Up', 'Quick, can-do follow-up for junk removal', 'quote_followup', true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 1, "channel": "sms", "message": "Hi {{customer_first_name}}! {{owner_name}} from {{business_name}}. Ready to get that junk gone? We can usually come out same-day or next-day. When works for you?", "is_active": true},
  {"id": "step_2", "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up! Imagine that space cleared out - no more clutter. We handle everything, including donation of usable items. Ready to schedule?", "is_active": true},
  {"id": "step_3", "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, checking in on your junk removal. We''re fast, friendly, and won''t damage your property. Want that stuff gone this week?", "is_active": true},
  {"id": "step_4", "delay_days": 5, "delay_hours": 0, "channel": "sms", "message": "Last reminder, {{customer_first_name}}! That junk isn''t going to remove itself. Reply when you''re ready and we''ll make it disappear. - {{owner_name}}", "is_active": true}
]'::jsonb);

-- GARAGE DOOR
INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('garage_door', 'Garage Door Follow-Up', 'Responsive follow-up for garage door service', 'quote_followup', true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 1, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_name}} from {{business_name}}. I received your garage door request. A broken door is a security issue - we can get out quickly. What time works today or tomorrow?", "is_active": true},
  {"id": "step_2", "delay_days": 0, "delay_hours": 6, "channel": "sms", "message": "{{customer_first_name}}, following up on your garage door. I don''t want to leave you with a door that won''t close properly - it''s a safety concern. We have same-day availability!", "is_active": true},
  {"id": "step_3", "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "Checking in, {{customer_first_name}}. Is your garage door still giving you trouble? Most repairs take under 2 hours. Let''s get it fixed!", "is_active": true},
  {"id": "step_4", "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "Last follow-up, {{customer_first_name}}! If you still need garage door service, we''re here. If you got it handled, great! Keep us in mind for the future. - {{owner_name}}", "is_active": true}
]'::jsonb);

-- PRESSURE WASHING
INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('pressure_washing', 'Pressure Washing Follow-Up', 'Results-focused follow-up for pressure washing', 'quote_followup', true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 3, "channel": "sms", "message": "Hi {{customer_first_name}}! {{owner_name}} from {{business_name}}. Thanks for your interest in pressure washing! You won''t believe the transformation. Any questions about the quote?", "is_active": true},
  {"id": "step_2", "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on your pressure washing quote. Our customers love the instant curb appeal boost! Ready to make your property shine?", "is_active": true},
  {"id": "step_3", "delay_days": 5, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, checking in. Great weather coming up - perfect for pressure washing! Want to get on the schedule?", "is_active": true},
  {"id": "step_4", "delay_days": 10, "delay_hours": 0, "channel": "sms", "message": "Last follow-up, {{customer_first_name}}! When you''re ready to transform your driveway/patio/house, we''re here. The results speak for themselves! - {{owner_name}}", "is_active": true}
]'::jsonb);

-- ============================================
-- SEED SEQUENCE TEMPLATES - POST-JOB
-- ============================================

INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('painting', 'Painting Post-Job', 'Quality check and referral request', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_name}} from {{business_name}}. Your painting project is complete! How does everything look now that it''s had time to dry? Any touch-ups needed?", "is_active": true},
  {"id": "step_2", "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, hope you''re enjoying your freshly painted space! Quick reminder: keep leftover paint for touch-ups. If you need the color codes, just ask!", "is_active": true},
  {"id": "step_3", "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, thank you for choosing {{business_name}}! If you''re happy with the results, we''d really appreciate a review. And if friends need painting, we''d love the referral! - {{owner_name}}", "is_active": true}
]'::jsonb),

('roofing', 'Roofing Post-Job', 'Warranty info and review request', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_name}} from {{business_name}}. Your roof project is complete! Everything look good from the ground? We''ve emailed your warranty documents.", "is_active": true},
  {"id": "step_2", "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, checking in after your roof work. Had any rain yet? Everything holding up well? Let us know if you notice anything.", "is_active": true},
  {"id": "step_3", "delay_days": 14, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, thank you for trusting {{business_name}} with your roof! If we exceeded expectations, a review would mean the world. Your roof is covered under warranty - keep our number handy!", "is_active": true}
]'::jsonb),

('pool_service', 'Pool Service Post-Visit', 'Thank you with upgrade offer', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here! Your pool is all set. Water chemistry is balanced and looking crystal clear. Enjoy your swim!", "is_active": true},
  {"id": "step_2", "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, hope you''ve been enjoying your pool! If you''re happy with our service, we''d love a review. Thanks for choosing us! - {{owner_name}}", "is_active": true}
]'::jsonb),

('moving', 'Moving Post-Job', 'Settling in check', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_name}} from {{business_name}}. Hope you''re settling into your new place! Everything arrive in good condition? Let us know if you have any concerns.", "is_active": true},
  {"id": "step_2", "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, how''s unpacking going? If we made your move easier, we''d really appreciate a review. Thanks for trusting us with your belongings! - {{owner_name}}", "is_active": true}
]'::jsonb),

('window_cleaning', 'Window Cleaning Post-Job', 'Recurring offer', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here! Your windows are sparkling clean. Enjoy that crystal clear view! Let us know if you have any questions.", "is_active": true},
  {"id": "step_2", "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, if you loved your window cleaning, we offer quarterly maintenance to keep them spotless year-round. Want me to set up a recurring schedule? Also, a review would mean a lot!", "is_active": true}
]'::jsonb),

('junk_removal', 'Junk Removal Post-Job', 'Space enjoyment', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here! All that junk is GONE. Enjoy your clean space! If we donated anything, you''ll receive a receipt via email.", "is_active": true},
  {"id": "step_2", "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, hope you''re loving your clutter-free space! If we did a great job, a quick review would help us a lot. Thanks! - {{owner_name}}", "is_active": true}
]'::jsonb),

('garage_door', 'Garage Door Post-Service', 'Safety check', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 4, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_name}} from {{business_name}}. Just wanted to make sure your garage door is working smoothly. Everything operating properly?", "is_active": true},
  {"id": "step_2", "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, glad we could help with your garage door! If you''re satisfied with the repair, a review would mean a lot to our small business. Thanks! - {{owner_name}}", "is_active": true}
]'::jsonb),

('pressure_washing', 'Pressure Washing Post-Job', 'Results celebration', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here! Your property is looking amazing. Enjoy that fresh, clean curb appeal! Let us know if you have any questions.", "is_active": true},
  {"id": "step_2", "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, hope you''re loving the transformation! We recommend annual pressure washing to keep things looking great. If you''re happy, a review would help us grow! - {{owner_name}}", "is_active": true}
]'::jsonb);

-- ============================================
-- SEED SEQUENCE TEMPLATES - RE-ENGAGEMENT
-- ============================================

INSERT INTO public.sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('pool_service', 'Pool Service Re-engagement', 'Win back dormant pool customers', 'reengagement', 'days_since_service', 30, true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, it''s been a while since your last pool service with {{business_name}}! Is your pool still sparkling? We''d love to have you back.", "is_active": true},
  {"id": "step_2", "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, pools need consistent care to stay swim-ready. Ready to get back on our schedule? We have openings! - {{owner_name}}", "is_active": true}
]'::jsonb),

('window_cleaning', 'Window Cleaning Re-engagement', 'Quarterly reminder', 'reengagement', 'days_since_service', 90, true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here! It''s been about 3 months since your window cleaning. Time for a refresh? Your windows will thank you!", "is_active": true},
  {"id": "step_2", "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, clean windows make such a difference! Ready to schedule your next cleaning? We have availability this week. - {{owner_name}}", "is_active": true}
]'::jsonb),

('garage_door', 'Garage Door Annual Maintenance', 'Yearly checkup reminder', 'reengagement', 'days_since_service', 365, true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_name}} from {{business_name}}. It''s been a year since we serviced your garage door. Time for an annual tune-up to keep it running smoothly!", "is_active": true},
  {"id": "step_2", "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, regular maintenance prevents costly repairs and extends your door''s life. Want to schedule a tune-up? Takes less than an hour!", "is_active": true}
]'::jsonb),

('pressure_washing', 'Annual Pressure Washing Reminder', 'Yearly refresh', 'reengagement', 'days_since_service', 365, true,
'[
  {"id": "step_1", "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}! {{business_name}} here. It''s been a year since your pressure washing - time for an annual refresh? Your driveway/patio would love it!", "is_active": true},
  {"id": "step_2", "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, annual pressure washing keeps your property looking great and prevents buildup. Ready to book your refresh? - {{owner_name}}", "is_active": true}
]'::jsonb);