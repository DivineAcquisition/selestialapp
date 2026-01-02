-- ============================================
-- PHASE 1 INDUSTRIES - Quote Follow-Up Templates
-- ============================================

-- Residential Cleaning
INSERT INTO sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('residential_cleaning', 'Standard Cleaning Follow-Up', 'Balanced follow-up for house cleaning quotes', 'quote_followup', true, 
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}, this is {{owner_first_name}} from {{business_name}}! Thanks for your interest in our cleaning services. I''d love to help you with your {{service_type}}. Any questions I can answer?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, just checking in on your cleaning quote. Many of our clients tell us they wish they''d started sooner! Ready to get you on the schedule?", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, I know life gets busy! Your quote is still ready when you are. Would a different day or time work better for you?", "is_active": true},
  {"id": "step_4", "order": 4, "delay_days": 5, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, I haven''t heard back so I wanted to reach out one more time. If you have any concerns about the quote, I''m happy to discuss. We''d love to earn your business! - {{owner_first_name}}", "is_active": true},
  {"id": "step_5", "order": 5, "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, this is my last follow-up. If cleaning is still on your mind, we''re here to help. Just reply anytime and we''ll take great care of you!", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Commercial Cleaning
INSERT INTO sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('commercial_cleaning', 'Professional Commercial Follow-Up', 'Business-appropriate follow-up for commercial clients', 'quote_followup', true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 4, "channel": "sms", "message": "Hi {{customer_first_name}}, this is {{owner_first_name}} from {{business_name}}. Thank you for your interest in our commercial cleaning services. I''ve prepared your customized proposal - would you like to schedule a brief call to review it?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on our commercial cleaning proposal. Happy to adjust the scope or schedule to better fit your facility''s needs. What questions can I answer?", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 4, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, I wanted to check in on your cleaning decision. Our commercial clients often start with a trial period - would that be helpful for your team?", "is_active": true},
  {"id": "step_4", "order": 4, "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, I know evaluating service providers takes time. Your proposal remains valid, and I''m here when you''re ready to discuss next steps. - {{owner_first_name}}, {{business_name}}", "is_active": true},
  {"id": "step_5", "order": 5, "delay_days": 14, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, circling back one final time. If timing isn''t right now, I completely understand. Feel free to reach out whenever your facility needs reliable cleaning services.", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Lawn Care
INSERT INTO sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('lawn_care', 'Standard Lawn Care Follow-Up', 'Friendly follow-up for lawn service quotes', 'quote_followup', true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}! This is {{owner_first_name}} from {{business_name}}. Thanks for reaching out about lawn care. I''d love to get your yard looking great! Any questions about the quote?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, just checking in! Your neighbors will be jealous when they see your lawn. Ready to get started? We have availability this week.", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, hope you''re having a great week! Still interested in lawn service? I''m happy to answer any questions or adjust the service plan.", "is_active": true},
  {"id": "step_4", "order": 4, "delay_days": 5, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, I know you''re busy - just wanted to reach out one more time. We''d love to take lawn care off your to-do list! Let me know if you''d like to move forward. - {{owner_first_name}}", "is_active": true},
  {"id": "step_5", "order": 5, "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "Last check-in, {{customer_first_name}}! Your quote is here whenever you''re ready. Enjoy your week!", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- HVAC (Urgent)
INSERT INTO sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('hvac', 'HVAC Repair Follow-Up (Urgent)', 'Fast follow-up for HVAC repair quotes', 'quote_followup', true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 1, "channel": "sms", "message": "Hi {{customer_first_name}}, this is {{owner_first_name}} from {{business_name}}. I received your HVAC service request. We can get a technician out quickly - would today or tomorrow work better for you?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 0, "delay_hours": 4, "channel": "sms", "message": "{{customer_first_name}}, following up on your HVAC service. I know being without heat/AC is uncomfortable. We have availability today if you''d like to get this resolved. Just reply or call us.", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, checking in on your HVAC issue. Have you been able to get it looked at? We''re still available to help if needed. Let me know! - {{owner_first_name}}", "is_active": true},
  {"id": "step_4", "order": 4, "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, I hope your HVAC situation has improved. If not, we''re here to help. Your comfort is our priority. Reach out anytime!", "is_active": true},
  {"id": "step_5", "order": 5, "delay_days": 4, "delay_hours": 0, "channel": "sms", "message": "Last check-in, {{customer_first_name}}. If you still need HVAC service, we''d love to help. Also happy to schedule a maintenance tune-up if that''s more appropriate now. - {{business_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Plumbing (Emergency)
INSERT INTO sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('plumbing', 'Emergency Plumbing Follow-Up', 'Rapid response for plumbing emergencies', 'quote_followup', true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_first_name}} from {{business_name}} here. I see you have a plumbing issue - we can dispatch a plumber quickly. What''s the best time today to come out?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "{{customer_first_name}}, following up on your plumbing issue. If there''s active leaking, please shut off your water main if you can. We''re available to come out ASAP.", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 0, "delay_hours": 6, "channel": "sms", "message": "Checking in again, {{customer_first_name}}. Plumbing issues can get worse fast - let us help before it becomes a bigger problem. We''re standing by!", "is_active": true},
  {"id": "step_4", "order": 4, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, hope your plumbing situation is under control. If you still need service, we''re here. If you handled it another way, no problem! - {{owner_first_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Electrical
INSERT INTO sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('electrical', 'Electrical Service Follow-Up', 'Follow-up for electrical quotes', 'quote_followup', true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 1, "channel": "sms", "message": "Hi {{customer_first_name}}, this is {{owner_first_name}} from {{business_name}}. Thanks for reaching out about your electrical needs. When would be a good time to schedule your service?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on your electrical service request. Safety is our top priority - happy to answer any questions about the work needed.", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, just checking in. Electrical issues are best addressed sooner rather than later for safety. We''ve got openings this week if you''re ready to proceed.", "is_active": true},
  {"id": "step_4", "order": 4, "delay_days": 5, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, last follow-up on your electrical quote. We''re licensed, insured, and stand behind our work. Reach out whenever you''re ready! - {{owner_first_name}}, {{business_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Pest Control
INSERT INTO sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('pest_control', 'Pest Control Follow-Up', 'Follow-up for pest control quotes', 'quote_followup', true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 1, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_first_name}} from {{business_name}} here. I understand you''re dealing with a pest issue - that''s stressful! We can get out quickly to take care of it. What day works best?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on your pest control request. The sooner we treat, the easier it is to eliminate the problem. Ready to get these pests gone?", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, checking in on your pest situation. Pest problems can multiply quickly - we''d love to help before it gets worse. What questions can I answer?", "is_active": true},
  {"id": "step_4", "order": 4, "delay_days": 4, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, last follow-up! If pests are still bugging you, we''re here to help. Many clients also love our prevention plans. Let me know! - {{owner_first_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Carpet Cleaning
INSERT INTO sequence_templates (industry_slug, name, description, template_type, is_default, steps) VALUES
('carpet_cleaning', 'Carpet Cleaning Follow-Up', 'Follow-up for carpet cleaning quotes', 'quote_followup', true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 3, "channel": "sms", "message": "Hi {{customer_first_name}}! This is {{owner_first_name}} from {{business_name}}. Thanks for your interest in carpet cleaning. I''d love to get your carpets looking fresh and new! When works best for you?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, following up on your carpet cleaning quote. You won''t believe the difference professional cleaning makes! Ready to schedule?", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 4, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, just checking in. If you have stubborn stains you''re worried about, I''m confident we can help. Any questions?", "is_active": true},
  {"id": "step_4", "order": 4, "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, last follow-up on your carpet cleaning quote! We''d love to have you as a customer. Reach out whenever you''re ready. - {{owner_first_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- PHASE 1 INDUSTRIES - Post-Job Templates
-- ============================================

-- Universal Thank You
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
(NULL, 'Simple Thank You', 'Basic post-job thank you message', 'post_job', 'job_completed', 0, false,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}, thank you for choosing {{business_name}}! We hope you''re happy with the service. Questions or feedback? Just reply to this message. - {{owner_first_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Residential Cleaning Post-Job
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('residential_cleaning', 'Cleaning Post-Job + Recurring Offer', 'Thank you with recurring service offer', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}! Thank you for choosing {{business_name}} today! We hope you love walking into your fresh, clean home. Any feedback? Just reply!", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, if you enjoyed today''s cleaning, imagine never having to clean again! Our recurring clients save 10% and get priority scheduling. Want to set up a regular schedule?", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "Quick question, {{customer_first_name}} - if you loved your cleaning, would you mind leaving us a quick review? It helps other families find us! {{review_link}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Lawn Care Post-Job
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('lawn_care', 'Lawn Care Post-Job', 'Thank you with seasonal upsell', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}! {{business_name}} here - hope your lawn is looking great! Let us know if you have any questions about maintaining it until our next visit.", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, if you''re happy with how your yard looks, we''d really appreciate a quick review! It helps us grow: {{review_link}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- HVAC Post-Job
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('hvac', 'HVAC Post-Service + Maintenance', 'Thank you with maintenance plan offer', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here. Thank you for choosing us for your HVAC service! Is everything working properly? Let us know if you have any questions.", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, quick tip: Regular maintenance extends your system''s life and prevents costly breakdowns. Ask us about our maintenance plans - they also include priority emergency service!", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, if we earned your trust, would you mind leaving a quick review? It means a lot to our team! {{review_link}} Thanks! - {{owner_first_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Plumbing Post-Job
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('plumbing', 'Plumbing Post-Service', 'Thank you with follow-up check', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 4, "channel": "sms", "message": "Hi {{customer_first_name}}, {{owner_first_name}} from {{business_name}}. Just wanted to make sure everything is working properly after our visit. Any issues at all?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 2, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, thanks again for choosing {{business_name}}! If we solved your plumbing problem, we''d really appreciate a review: {{review_link}} Have a great day!", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Pest Control Post-Job
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('pest_control', 'Pest Control Post-Treatment', 'Follow-up with prevention plan offer', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 4, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here. Your pest treatment is complete! Remember: it may take a few days to see full results. Call us if you have any concerns.", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, checking in - how''s everything looking? The pests should be gone or significantly reduced by now. Let us know if you''re still seeing activity!", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 14, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, glad we could help with your pest problem! To prevent them from coming back, consider our quarterly prevention plan. Want details? Also, a review would mean a lot: {{review_link}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Carpet Cleaning Post-Job
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('carpet_cleaning', 'Carpet Cleaning Post-Job', 'Thank you with maintenance tips', 'post_job', 'job_completed', 0, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 2, "channel": "sms", "message": "Hi {{customer_first_name}}! Your carpets should be dry in 2-4 hours. Avoid walking on them until then if possible. Enjoy that fresh, clean feeling! - {{business_name}}", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 1, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, how do your carpets look? Pro tip: vacuum regularly to keep them looking great longer. We recommend professional cleaning every 6-12 months!", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 3, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, if you''re happy with your freshly cleaned carpets, we''d love a review! {{review_link}} Thanks for choosing {{business_name}}! - {{owner_first_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- PHASE 1 INDUSTRIES - Re-engagement Templates
-- ============================================

-- Residential Cleaning Re-engagement
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('residential_cleaning', '30-Day Re-engagement', 'Bring back lapsed cleaning clients', 'reengagement', 'days_since_service', 30, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, it''s been a month since your last cleaning with {{business_name}}! Missing that fresh, clean home feeling? We''d love to have you back - reply to schedule!", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, just a friendly reminder - we''re here when you need us! Book your next cleaning and come home to spotless.", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 14, "delay_hours": 0, "channel": "sms", "message": "We miss you, {{customer_first_name}}! As a thank you for being a valued customer, enjoy 15% off your next cleaning. Reply ''BOOK'' to schedule! - {{owner_first_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Lawn Care Re-engagement
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('lawn_care', '3-Week Lawn Care Re-engagement', 'Reconnect with dormant lawn customers', 'reengagement', 'days_since_service', 21, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}! Your lawn misses us! It''s been a few weeks since our last visit. Ready to get back on schedule? - {{business_name}}", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 5, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, your neighbors'' lawns are looking jealous! Let''s get your yard back in shape! Reply to schedule your next service.", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- HVAC Re-engagement (Annual)
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('hvac', 'Annual HVAC Maintenance Reminder', 'Yearly maintenance reminder', 'reengagement', 'days_since_service', 330, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here. It''s been almost a year since your last HVAC service. Time for your annual tune-up! This keeps your system efficient and prevents breakdowns. Ready to schedule?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, reminder: regular HVAC maintenance can save up to 30% on energy bills and prevent costly repairs. Book your tune-up before the busy season!", "is_active": true},
  {"id": "step_3", "order": 3, "delay_days": 14, "delay_hours": 0, "channel": "sms", "message": "Last reminder, {{customer_first_name}}! Your HVAC system works hard - let us make sure it''s ready for the next season. Reply to schedule your maintenance visit. - {{owner_first_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Pest Control Re-engagement
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('pest_control', 'Pest Control Re-engagement', 'Reconnect before pests return', 'reengagement', 'days_since_service', 45, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here! It''s been a while since your last treatment. Pests can return - want to stay protected with a follow-up visit?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 7, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, prevention is easier than elimination! Our quarterly plan keeps pests away year-round. Ask me about it - or just schedule a one-time treatment if you prefer.", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Carpet Cleaning Re-engagement
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('carpet_cleaning', '6-Month Carpet Cleaning Reminder', 'Remind for regular carpet maintenance', 'reengagement', 'days_since_service', 180, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}! {{business_name}} here. It''s been 6 months since your carpet cleaning - pros recommend cleaning every 6-12 months. Ready for a refresh?", "is_active": true},
  {"id": "step_2", "order": 2, "delay_days": 14, "delay_hours": 0, "channel": "sms", "message": "{{customer_first_name}}, regular carpet cleaning extends carpet life and keeps your home healthy. Book now and we''ll take 10% off as a returning customer! - {{owner_first_name}}", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Electrical Re-engagement
INSERT INTO sequence_templates (industry_slug, name, description, template_type, trigger_type, trigger_delay_days, is_default, steps) VALUES
('electrical', 'Electrical Safety Check Reminder', 'Annual electrical inspection reminder', 'reengagement', 'days_since_service', 365, true,
'[
  {"id": "step_1", "order": 1, "delay_days": 0, "delay_hours": 0, "channel": "sms", "message": "Hi {{customer_first_name}}, {{business_name}} here. It''s been about a year since we worked on your electrical system. Time for a safety check? Regular inspections prevent hazards and save money. Let us know if you need us!", "is_active": true}
]'::jsonb)
ON CONFLICT DO NOTHING;