/**
 * Sequence Templates Library
 * 
 * Pre-built automation sequences organized by business bucket type:
 * - Emergency (HVAC, Plumbing, Electrical, Garage Door, Locksmith)
 * - Scheduled (Roofing, Flooring, Landscaping, Painting, Remodeling)
 * - Recurring (Cleaning, Pest Control, Window Cleaning, Pool Service, Lawn Care)
 */

// ============================================================================
// TYPES
// ============================================================================

export type BusinessBucket = 'emergency' | 'scheduled' | 'recurring'

export type SequenceType = 
  | 'lead_capture' 
  | 'speed_to_lead'
  | 'missed_call_recovery'
  | 'after_hours'
  | 'quote_followup' 
  | 'pipeline_nurture'
  | 'estimate_expiry'
  | 'booking_reminder' 
  | 'review_request' 
  | 'referral_request'
  | 'reactivation' 
  | 'at_risk' 
  | 'rebooking_reminder'
  | 'win_back'
  | 'seasonal_campaign'
  | 'upsell'
  | 'payment_followup'
  | 'customer_feedback'
  | 'contract_renewal'
  | 'subscription_conversion'
  | 'custom'

export type TriggerType = 'event' | 'schedule' | 'manual' | 'condition'

export type ActionType = 'sms' | 'email' | 'internal_task' | 'webhook' | 'wait_for_reply'

export type DelayType = 'immediate' | 'minutes' | 'hours' | 'days'

export interface SequenceStep {
  order: number
  name?: string
  delay: {
    type: DelayType
    value?: number
  }
  action: ActionType
  conditions?: Array<{
    type: string
    value?: string | number
    since_step?: number
  }>
  // SMS/Email content
  message?: string
  subject?: string
  body?: string
  // Task config
  config?: {
    title?: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    assign_to?: string
  }
  exit_on?: string[]
}

export interface SequenceTemplate {
  id: string
  name: string
  description: string
  type: SequenceType
  bucket: BusinessBucket | 'universal'
  trigger: {
    type: TriggerType
    event?: string
    condition?: string
    delay_minutes?: number
  }
  steps: SequenceStep[]
  exit_on: string[]
  metrics?: {
    target_conversion?: number
    avg_completion_days?: number
  }
}

// ============================================================================
// INDUSTRY DEFINITIONS
// ============================================================================

export interface Industry {
  id: string
  name: string
  icon: string
  bucket: BusinessBucket
  defaultServices?: string[]
}

export const INDUSTRIES: Industry[] = [
  // Emergency Services
  { id: 'hvac', name: 'HVAC', icon: 'snowflake', bucket: 'emergency' },
  { id: 'plumbing', name: 'Plumbing', icon: 'droplet', bucket: 'emergency' },
  { id: 'electrical', name: 'Electrical', icon: 'bolt', bucket: 'emergency' },
  { id: 'garage_door', name: 'Garage Door', icon: 'warehouse', bucket: 'emergency' },
  { id: 'locksmith', name: 'Locksmith', icon: 'key', bucket: 'emergency' },
  
  // Scheduled Estimate Services
  { id: 'roofing', name: 'Roofing', icon: 'home', bucket: 'scheduled' },
  { id: 'flooring', name: 'Flooring', icon: 'grid', bucket: 'scheduled' },
  { id: 'landscaping', name: 'Landscaping', icon: 'tree', bucket: 'scheduled' },
  { id: 'painting', name: 'Painting', icon: 'brush', bucket: 'scheduled' },
  { id: 'remodeling', name: 'Remodeling', icon: 'hammer', bucket: 'scheduled' },
  
  // Recurring Services
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles', bucket: 'recurring' },
  { id: 'pest_control', name: 'Pest Control', icon: 'bug', bucket: 'recurring' },
  { id: 'window_cleaning', name: 'Window Cleaning', icon: 'layers', bucket: 'recurring' },
  { id: 'pool_service', name: 'Pool Service', icon: 'waves', bucket: 'recurring' },
  { id: 'lawn_care', name: 'Lawn Care', icon: 'leaf', bucket: 'recurring' },
]

export const BUSINESS_TYPES = [
  {
    id: 'emergency' as BusinessBucket,
    name: 'Emergency Jobs',
    description: 'Same-day service, speed matters most',
    examples: 'Burst pipes, AC failures, lockouts',
    icon: 'bolt',
    color: 'red',
    heroMetrics: [
      { name: 'Response Time', target: '< 5 minutes', impact: '21x more likely to convert' },
      { name: 'Missed Call Recovery', target: '> 40%', impact: 'First responder wins 78%' },
      { name: 'After-Hours Capture', target: '> 30%', impact: 'Capture leads 24/7' },
    ],
  },
  {
    id: 'scheduled' as BusinessBucket,
    name: 'Scheduled Estimates',
    description: 'Quote-based projects, longer sales cycles',
    examples: 'Roof replacements, flooring installs, remodels',
    icon: 'calendar',
    color: 'blue',
    heroMetrics: [
      { name: 'Quote-to-Close', target: '30-40%', impact: 'Follow-up is key' },
      { name: 'Follow-up Compliance', target: '5+ touches', impact: '80% close after 5th' },
      { name: 'Pipeline Velocity', target: '< 60 days', impact: 'Faster cash flow' },
    ],
  },
  {
    id: 'recurring' as BusinessBucket,
    name: 'Recurring Service',
    description: 'Repeat customers, subscription-style',
    examples: 'Weekly cleaning, quarterly pest control',
    icon: 'refresh',
    color: 'green',
    heroMetrics: [
      { name: 'Monthly Churn', target: '< 5%', impact: '3x lifetime value' },
      { name: 'Recurring Revenue', target: '> 50%', impact: 'Predictable income' },
      { name: 'Customer LTV', target: '$2,500+', impact: 'Compound growth' },
    ],
  },
]

// ============================================================================
// SEQUENCE TEMPLATES - EMERGENCY BUCKET
// ============================================================================

export const SPEED_TO_LEAD_SEQUENCE: SequenceTemplate = {
  id: 'speed_to_lead',
  name: 'Speed-to-Lead',
  description: 'Respond to new leads in under 60 seconds. First responder wins 78% of jobs.',
  type: 'speed_to_lead',
  bucket: 'emergency',
  trigger: { type: 'event', event: 'new_lead', delay_minutes: 0 },
  steps: [
    {
      order: 1,
      name: 'Instant Response',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}, thanks for reaching out to {{business_name}}! I'm {{owner_name}} and I'd love to help with your {{service_type}} needs. When's a good time to chat?",
    },
    {
      order: 2,
      name: 'Create Call Task',
      delay: { type: 'minutes', value: 5 },
      action: 'internal_task',
      conditions: [{ type: 'no_reply' }],
      config: { 
        title: 'Call new lead: {{first_name}} {{last_name}}', 
        priority: 'high',
        description: 'Lead has not replied after 5 minutes. Call immediately.',
      },
    },
    {
      order: 3,
      name: '1-Hour Follow-up',
      delay: { type: 'hours', value: 1 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Hey {{first_name}}, just following up! Would tomorrow work for a quick call about your {{service_type}} project? Let me know what time works best.",
    },
    {
      order: 4,
      name: 'Day 1 Email',
      delay: { type: 'days', value: 1 },
      action: 'email',
      conditions: [{ type: 'no_reply' }],
      subject: 'Still interested in {{service_type}} help?',
      body: `Hi {{first_name}},

I wanted to follow up on your inquiry about {{service_type}}. I know life gets busy, so I wanted to make sure your message didn't slip through the cracks.

We'd love to help you with:
• Fast, reliable service
• Upfront pricing (no surprises)
• Satisfaction guaranteed

Just reply to this email or give us a call at {{business_phone}} when you're ready.

Best,
{{owner_name}}
{{business_name}}`,
    },
    {
      order: 5,
      name: 'Final SMS',
      delay: { type: 'days', value: 3 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Hi {{first_name}}, I don't want to be a pest! 😊 If you're still looking for {{service_type}} help, I'm here. If not, no worries at all. Just reply STOP and I'll remove you from my list.",
    },
  ],
  exit_on: ['replied', 'booked', 'unsubscribed'],
  metrics: { target_conversion: 25, avg_completion_days: 3 },
}

export const MISSED_CALL_RECOVERY_SEQUENCE: SequenceTemplate = {
  id: 'missed_call_recovery',
  name: 'Missed Call Recovery',
  description: 'Automatically text back when you miss a call. Recover 40%+ of missed opportunities.',
  type: 'missed_call_recovery',
  bucket: 'emergency',
  trigger: { type: 'event', event: 'missed_call', delay_minutes: 0 },
  steps: [
    {
      order: 1,
      name: 'Instant Text Back',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi, this is {{business_name}}. Sorry we missed your call! How can I help you today? 📱",
    },
    {
      order: 2,
      name: 'Follow-up if No Reply',
      delay: { type: 'minutes', value: 15 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Just checking in - were you calling about an emergency or to schedule service? Either way, I'm here to help!",
    },
    {
      order: 3,
      name: 'Create Task',
      delay: { type: 'minutes', value: 30 },
      action: 'internal_task',
      conditions: [{ type: 'no_reply' }],
      config: {
        title: 'Call back missed call: {{phone}}',
        priority: 'high',
        description: 'Missed call with no text reply. Attempt callback.',
      },
    },
  ],
  exit_on: ['replied', 'callback_completed', 'booked'],
  metrics: { target_conversion: 40, avg_completion_days: 1 },
}

export const AFTER_HOURS_SEQUENCE: SequenceTemplate = {
  id: 'after_hours',
  name: 'After-Hours Capture',
  description: 'Capture and nurture leads that come in outside business hours.',
  type: 'after_hours',
  bucket: 'emergency',
  trigger: { type: 'event', event: 'new_lead', delay_minutes: 0 },
  steps: [
    {
      order: 1,
      name: 'After-Hours Auto-Reply',
      delay: { type: 'immediate' },
      action: 'sms',
      conditions: [{ type: 'time_window', value: 'outside_hours' }],
      message: "Hi {{first_name}}, thanks for reaching out to {{business_name}}! We're currently closed but your message is important to us. We'll get back to you first thing in the morning. For emergencies, call {{emergency_phone}}.",
    },
    {
      order: 2,
      name: 'Morning Follow-up',
      delay: { type: 'hours', value: 8 }, // Will be scheduled for 8 AM next day
      action: 'sms',
      conditions: [{ type: 'time_window', value: '08:00-09:00' }],
      message: "Good morning {{first_name}}! Following up on your message from last night. How can I help you with your {{service_type}} needs today?",
    },
    {
      order: 3,
      name: 'Create Priority Task',
      delay: { type: 'hours', value: 8 },
      action: 'internal_task',
      config: {
        title: 'Call after-hours lead: {{first_name}}',
        priority: 'high',
        description: 'Lead came in after hours. Follow up first thing.',
      },
    },
  ],
  exit_on: ['replied', 'booked', 'unsubscribed'],
  metrics: { target_conversion: 30, avg_completion_days: 1 },
}

// ============================================================================
// SEQUENCE TEMPLATES - SCHEDULED ESTIMATE BUCKET
// ============================================================================

export const QUOTE_FOLLOWUP_SEQUENCE: SequenceTemplate = {
  id: 'quote_followup',
  name: 'Quote Follow-Up (21-Day)',
  description: 'Convert estimates to booked jobs with 6-touch nurture sequence. Target: 30-40% close rate.',
  type: 'quote_followup',
  bucket: 'scheduled',
  trigger: { type: 'event', event: 'quote_sent', delay_minutes: 10 },
  steps: [
    {
      order: 1,
      name: 'Quote Sent Confirmation',
      delay: { type: 'minutes', value: 10 },
      action: 'sms',
      message: "Hi {{first_name}}, I just sent over your estimate for {{service_description}}. Take a look when you get a chance and let me know if you have any questions! - {{owner_name}}",
    },
    {
      order: 2,
      name: 'Day 2 Check-in',
      delay: { type: 'days', value: 2 },
      action: 'sms',
      conditions: [{ type: 'quote_not_accepted' }],
      message: "Hey {{first_name}}, just checking in on your {{service_type}} estimate. Any questions I can answer? Happy to hop on a quick call if that's easier.",
    },
    {
      order: 3,
      name: 'Day 5 Email',
      delay: { type: 'days', value: 5 },
      action: 'email',
      conditions: [{ type: 'quote_not_accepted' }],
      subject: 'Your {{service_type}} estimate - any questions?',
      body: `Hi {{first_name}},

I wanted to follow up on the estimate I sent for {{service_description}}.

I know choosing the right contractor is a big decision, so I wanted to address a few common questions:

**Why choose us?**
• Licensed and insured
• 5-star reviews on Google
• Workmanship warranty included
• Flexible scheduling

**What's included:**
{{quote_summary}}

**Total: {{quote_amount}}**

If you have any questions or want to discuss options, just reply to this email or call me at {{business_phone}}.

Best,
{{owner_name}}`,
    },
    {
      order: 4,
      name: 'Day 8 Urgency',
      delay: { type: 'days', value: 8 },
      action: 'sms',
      conditions: [{ type: 'quote_not_accepted' }],
      message: "{{first_name}}, your estimate expires in a few days. I've got availability next week if you'd like to get on the schedule. Want me to hold a spot?",
    },
    {
      order: 5,
      name: 'Day 12 Final Follow-up',
      delay: { type: 'days', value: 12 },
      action: 'sms',
      conditions: [{ type: 'quote_not_accepted' }],
      message: "Hi {{first_name}}, this is my last follow-up on your {{service_type}} estimate. If the timing isn't right, totally understand! If anything changes, I'm here. 👍",
    },
    {
      order: 6,
      name: 'Day 21 Close Out',
      delay: { type: 'days', value: 21 },
      action: 'email',
      conditions: [{ type: 'quote_not_accepted' }],
      subject: 'Closing out your estimate',
      body: `Hi {{first_name}},

I'm closing out open estimates and wanted to check one more time on your {{service_type}} project.

If you've decided to go a different direction, no hard feelings! If there's something I could have done better, I'd love to know.

If you're still considering it, I'm happy to:
• Update the estimate if anything's changed
• Answer any remaining questions
• Work with your timeline

Just let me know either way so I can update my records.

Thanks,
{{owner_name}}`,
    },
  ],
  exit_on: ['quote_accepted', 'booked', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 35, avg_completion_days: 21 },
}

export const ESTIMATE_EXPIRY_SEQUENCE: SequenceTemplate = {
  id: 'estimate_expiry',
  name: 'Estimate Expiring',
  description: 'Create urgency when estimates are about to expire.',
  type: 'estimate_expiry',
  bucket: 'scheduled',
  trigger: { type: 'condition', condition: 'quote_expires_in_days <= 3' },
  steps: [
    {
      order: 1,
      name: '3-Day Warning',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}, heads up - your {{service_type}} estimate expires in 3 days. I'd hate for you to have to get re-quoted. Ready to move forward? 📋",
    },
    {
      order: 2,
      name: '1-Day Warning',
      delay: { type: 'days', value: 2 },
      action: 'sms',
      conditions: [{ type: 'quote_not_accepted' }],
      message: "Last day! Your estimate for {{service_description}} expires tomorrow. Lock in the price now: {{booking_link}}",
    },
    {
      order: 3,
      name: 'Expiry Day',
      delay: { type: 'days', value: 3 },
      action: 'email',
      conditions: [{ type: 'quote_not_accepted' }],
      subject: 'Your estimate expires today',
      body: `Hi {{first_name}},

Your estimate for {{service_description}} expires today.

If you'd like to proceed, let me know and I can honor this pricing. After today, I'll need to provide a new quote (which could be higher depending on material costs).

Just reply "YES" to lock in your spot!

{{owner_name}}`,
    },
  ],
  exit_on: ['quote_accepted', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 20, avg_completion_days: 3 },
}

export const PIPELINE_NURTURE_SEQUENCE: SequenceTemplate = {
  id: 'pipeline_nurture',
  name: 'Long-Cycle Nurture',
  description: 'For 60-180 day sales cycles. Stay top of mind without being pushy.',
  type: 'pipeline_nurture',
  bucket: 'scheduled',
  trigger: { type: 'manual' },
  steps: [
    {
      order: 1,
      name: 'Week 2 Value Email',
      delay: { type: 'days', value: 14 },
      action: 'email',
      subject: '3 things to know before your {{service_type}} project',
      body: `Hi {{first_name}},

Since you're planning a {{service_type}} project, I wanted to share a few tips that might help:

1. **Timing matters** - {{seasonal_tip}}
2. **Questions to ask** - {{questions_tip}}
3. **What to expect** - {{expectations_tip}}

No pressure - just wanted to be helpful. Let me know if you have questions!

{{owner_name}}`,
    },
    {
      order: 2,
      name: 'Month 1 Check-in',
      delay: { type: 'days', value: 30 },
      action: 'sms',
      message: "Hi {{first_name}}, just checking in on your {{service_type}} project. Any update on timing? I'm here when you're ready! 👍",
    },
    {
      order: 3,
      name: 'Month 2 Case Study',
      delay: { type: 'days', value: 60 },
      action: 'email',
      subject: 'See our recent {{service_type}} project',
      body: `Hi {{first_name}},

Thought you might like to see a {{service_type}} project we just completed near you.

[Before/After photos]

Similar scope to what we discussed for your project. Happy to answer any questions!

{{owner_name}}`,
    },
    {
      order: 4,
      name: 'Month 3 Final Touch',
      delay: { type: 'days', value: 90 },
      action: 'sms',
      message: "{{first_name}}, I know it's been a while since we talked about your {{service_type}} project. Just wanted you to know - I'm still here if you need me. No rush! 🙂",
    },
  ],
  exit_on: ['booked', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 15, avg_completion_days: 90 },
}

// ============================================================================
// SEQUENCE TEMPLATES - RECURRING BUCKET
// ============================================================================

export const REBOOKING_REMINDER_SEQUENCE: SequenceTemplate = {
  id: 'rebooking_reminder',
  name: 'Recurring Rebooking',
  description: 'Remind recurring customers before their next service is due.',
  type: 'rebooking_reminder',
  bucket: 'recurring',
  trigger: { type: 'condition', condition: 'days_until_next_service <= 7' },
  steps: [
    {
      order: 1,
      name: '7-Day Reminder',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}! Your {{service_type}} is coming up next week. Same time works? Reply YES to confirm or let me know what works better.",
    },
    {
      order: 2,
      name: '3-Day Reminder',
      delay: { type: 'days', value: 4 },
      action: 'sms',
      conditions: [{ type: 'not_confirmed' }],
      message: "Quick reminder - your {{service_type}} is in 3 days. Should I keep you on the schedule for {{next_service_date}}?",
    },
    {
      order: 3,
      name: '1-Day Reminder',
      delay: { type: 'days', value: 6 },
      action: 'sms',
      conditions: [{ type: 'not_confirmed' }],
      message: "{{first_name}}, tomorrow is your scheduled {{service_type}}. If you need to reschedule, just reply with a better time!",
    },
  ],
  exit_on: ['confirmed', 'rescheduled', 'cancelled'],
  metrics: { target_conversion: 85, avg_completion_days: 7 },
}

export const AT_RISK_INTERVENTION_SEQUENCE: SequenceTemplate = {
  id: 'at_risk_intervention',
  name: 'At-Risk Intervention',
  description: 'Detect and save at-risk customers before they churn.',
  type: 'at_risk',
  bucket: 'recurring',
  trigger: { type: 'condition', condition: "health_score < 50 AND customer_type = 'recurring'" },
  steps: [
    {
      order: 1,
      name: 'Create Urgent Task',
      delay: { type: 'immediate' },
      action: 'internal_task',
      config: {
        title: 'At-risk customer: {{first_name}} {{last_name}}',
        description: 'Health score dropped to {{health_score}}. Review account and reach out personally.',
        priority: 'high',
      },
    },
    {
      order: 2,
      name: 'Personal Outreach',
      delay: { type: 'hours', value: 4 },
      action: 'sms',
      message: "Hi {{first_name}}, this is {{owner_name}} from {{business_name}}. I noticed it's been a while since we've been out. Everything okay? I'd love to make sure you're taken care of.",
    },
    {
      order: 3,
      name: 'Win-Back Offer',
      delay: { type: 'days', value: 3 },
      action: 'email',
      conditions: [{ type: 'no_reply' }],
      subject: 'We miss you, {{first_name}}!',
      body: `Hi {{first_name}},

We noticed you haven't booked your usual {{service_type}} recently. Is there anything we can do better?

As a thank you for your loyalty, here's \${{win_back_amount}} off your next service.

Just use code: COMEBACK or mention this email when you book.

We'd love to have you back!

{{owner_name}}
{{business_name}}`,
    },
    {
      order: 4,
      name: 'Final Outreach',
      delay: { type: 'days', value: 7 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "{{first_name}}, I wanted to check one more time - is there anything I can do to earn back your business? Your feedback means a lot to me. - {{owner_name}}",
    },
  ],
  exit_on: ['booked', 'replied', 'cancelled'],
  metrics: { target_conversion: 30, avg_completion_days: 7 },
}

export const REACTIVATION_SEQUENCE: SequenceTemplate = {
  id: 'reactivation',
  name: 'Reactivation Campaign',
  description: 'Re-engage lapsed customers with targeted offers.',
  type: 'reactivation',
  bucket: 'recurring',
  trigger: { type: 'condition', condition: 'days_since_last_job >= 60 AND days_since_last_job < 90' },
  steps: [
    {
      order: 1,
      name: 'Soft Check-in',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}, it's {{owner_name}} from {{business_name}}. Just wanted to check in - is everything okay? We haven't seen you in a while and want to make sure you're taken care of!",
    },
    {
      order: 2,
      name: 'Value Reminder',
      delay: { type: 'days', value: 5 },
      action: 'email',
      conditions: [{ type: 'no_reply' }],
      subject: "It's been a while, {{first_name}}",
      body: `Hi {{first_name}},

We've missed having you as a customer! Your last {{service_type}} was {{days_since_last_job}} days ago.

Here's what you've been missing:
• Consistent, reliable service
• The same great team you know
• Priority scheduling for loyal customers

Ready to get back on track? Book now and save \${{reactivation_discount}} on your next service.

{{booking_link}}

See you soon!
{{owner_name}}`,
    },
    {
      order: 3,
      name: 'Final Offer',
      delay: { type: 'days', value: 12 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "{{first_name}}, one last thing - I really want to earn back your business. Here's \${{reactivation_discount}} off your next {{service_type}}. Just reply YES to book! Offer expires this week.",
    },
  ],
  exit_on: ['booked', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 25, avg_completion_days: 12 },
}

// ============================================================================
// SEQUENCE TEMPLATES - UNIVERSAL (ALL BUCKETS)
// ============================================================================

export const BOOKING_REMINDER_SEQUENCE: SequenceTemplate = {
  id: 'booking_reminder',
  name: 'Booking Reminders',
  description: 'Reduce no-shows by 38-50% with automated appointment reminders.',
  type: 'booking_reminder',
  bucket: 'universal',
  trigger: { type: 'event', event: 'appointment_booked' },
  steps: [
    {
      order: 1,
      name: 'Booking Confirmation',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Confirmed! ✅ Your {{service_type}} appointment is booked for {{appointment_date}} at {{appointment_time}}. Reply YES to confirm or call us at {{business_phone}} to reschedule.",
    },
    {
      order: 2,
      name: '48-Hour Reminder',
      delay: { type: 'hours', value: -48 },
      action: 'sms',
      message: "Reminder: Your {{service_type}} appointment is in 2 days ({{appointment_date}} at {{appointment_time}}). Need to reschedule? Reply or call {{business_phone}}.",
    },
    {
      order: 3,
      name: '24-Hour Reminder',
      delay: { type: 'hours', value: -24 },
      action: 'sms',
      message: "See you tomorrow! {{tech_name}} will arrive between {{appointment_window}}. {{prep_instructions}}",
    },
    {
      order: 4,
      name: 'On-the-Way',
      delay: { type: 'minutes', value: -30 },
      action: 'sms',
      message: "{{tech_name}} is on the way! 🚗 ETA: {{eta_time}}. {{tech_intro}}",
    },
  ],
  exit_on: ['cancelled', 'rescheduled', 'completed'],
  metrics: { target_conversion: 95, avg_completion_days: 2 },
}

export const REVIEW_REQUEST_SEQUENCE: SequenceTemplate = {
  id: 'review_request',
  name: 'Review Request',
  description: 'Collect 5-star reviews after every job. Reviews drive 67% of new leads.',
  type: 'review_request',
  bucket: 'universal',
  trigger: { type: 'event', event: 'job_completed', delay_minutes: 60 },
  steps: [
    {
      order: 1,
      name: 'Initial Request',
      delay: { type: 'hours', value: 1 },
      action: 'sms',
      message: "Hi {{first_name}}, thank you for choosing {{business_name}}! How was your experience with {{tech_name}} today? We'd love your feedback: {{review_link}}",
    },
    {
      order: 2,
      name: 'Gentle Reminder',
      delay: { type: 'days', value: 3 },
      action: 'sms',
      conditions: [{ type: 'no_review_submitted' }],
      message: "{{first_name}}, if you have 30 seconds, a quick review helps us a ton! {{review_link}} Thank you! 🙏",
    },
    {
      order: 3,
      name: 'Final Email',
      delay: { type: 'days', value: 7 },
      action: 'email',
      conditions: [{ type: 'no_review_submitted' }],
      subject: 'How did we do?',
      body: `Hi {{first_name}},

Thank you again for choosing {{business_name}} for your {{service_type}}!

Your feedback helps us improve and helps other homeowners find quality service. If you have a moment, we'd really appreciate a review:

⭐ {{review_link}}

Thank you for your support!

{{owner_name}}`,
    },
  ],
  exit_on: ['review_submitted', 'unsubscribed'],
  metrics: { target_conversion: 25, avg_completion_days: 7 },
}

export const REFERRAL_REQUEST_SEQUENCE: SequenceTemplate = {
  id: 'referral_request',
  name: 'Referral Request',
  description: 'Turn happy customers into referral sources. Referrals convert 3x better.',
  type: 'referral_request',
  bucket: 'universal',
  trigger: { type: 'event', event: 'job_completed', delay_minutes: 10080 }, // 7 days after
  steps: [
    {
      order: 1,
      name: 'Referral Intro',
      delay: { type: 'days', value: 7 },
      action: 'email',
      subject: 'Know someone who needs {{service_type}} help?',
      body: `Hi {{first_name}},

Thanks again for choosing us! If you know anyone who needs {{service_type}} help, we'd love to help them too.

**Share your unique referral link:**
{{referral_link}}

**You'll get \${{referral_reward}} credit when they book!**

Thanks for spreading the word!

{{owner_name}}`,
    },
    {
      order: 2,
      name: 'Referral Reminder',
      delay: { type: 'days', value: 30 },
      action: 'sms',
      message: "Hey {{first_name}}! Quick reminder - you can earn \${{referral_reward}} for every friend you refer to {{business_name}}. Share your link: {{referral_link}}",
    },
  ],
  exit_on: ['referral_made', 'unsubscribed'],
  metrics: { target_conversion: 10, avg_completion_days: 30 },
}

export const WIN_BACK_SEQUENCE: SequenceTemplate = {
  id: 'win_back',
  name: 'Win-Back Campaign (90-Day)',
  description: 'Re-engage lost customers after 90+ days. 20-40% recovery rate.',
  type: 'win_back',
  bucket: 'universal',
  trigger: { type: 'condition', condition: "days_since_last_job >= 90 OR status = 'churned'" },
  steps: [
    {
      order: 1,
      name: 'Initial Email',
      delay: { type: 'immediate' },
      action: 'email',
      subject: "It's been a while, {{first_name}}!",
      body: `Hi {{first_name}},

We haven't seen you in a while and wanted to check in. Has everything been going well with your {{last_service_type}}?

If there's anything we could have done better, I'd love to hear about it. Your feedback helps us improve.

If you're ready to book again, just reply to this email or call us at {{business_phone}}.

Hope to see you soon!

{{owner_name}}
{{business_name}}`,
    },
    {
      order: 2,
      name: 'Win-Back Offer',
      delay: { type: 'days', value: 7 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Hi {{first_name}}, {{owner_name}} here from {{business_name}}. We'd love to have you back! Here's \${{win_back_amount}} off your next {{service_type}}: {{booking_link}}",
    },
    {
      order: 3,
      name: 'Email with Offer',
      delay: { type: 'days', value: 14 },
      action: 'email',
      conditions: [{ type: 'no_reply' }],
      subject: '\${{win_back_amount}} off - just for you',
      body: `Hi {{first_name}},

We really value your business and want to make it easy to come back.

Here's an exclusive offer: **\${{win_back_amount}} off** your next {{service_type}}.

Use code: **WELCOME{{win_back_amount}}** at checkout or just mention this email when you book.

This offer expires in 2 weeks.

We miss you!

{{owner_name}}`,
    },
    {
      order: 4,
      name: 'Final Chance',
      delay: { type: 'days', value: 30 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Last chance, {{first_name}}! Your \${{win_back_amount}} credit expires this week. Book now: {{booking_link}}",
    },
  ],
  exit_on: ['booked', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 25, avg_completion_days: 30 },
}

// ============================================================================
// ADVANCED SALES SEQUENCES
// ============================================================================

export const HOT_LEAD_FAST_TRACK_SEQUENCE: SequenceTemplate = {
  id: 'hot_lead_fast_track',
  name: 'Hot Lead Fast Track',
  description: 'Aggressive follow-up for high-intent leads (website requests, chat inquiries). First to respond wins 78% of jobs.',
  type: 'speed_to_lead',
  bucket: 'universal',
  trigger: { type: 'event', event: 'new_lead', delay_minutes: 0 },
  steps: [
    {
      order: 1,
      name: 'Instant SMS (Under 60 Seconds)',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}! This is {{owner_name}} from {{business_name}}. I just received your request and I'm available to help right now. Can I call you in 2 minutes?",
    },
    {
      order: 2,
      name: 'Immediate Call Task',
      delay: { type: 'minutes', value: 2 },
      action: 'internal_task',
      config: {
        title: '🔥 HOT LEAD - Call NOW: {{first_name}} {{last_name}}',
        description: 'High-intent lead from {{lead_source}}. Call immediately. First responder wins 78% of jobs.',
        priority: 'high',
      },
    },
    {
      order: 3,
      name: 'No Answer Follow-up',
      delay: { type: 'minutes', value: 15 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Tried calling - must have caught you at a bad time! What time works for a quick 5-min call about your {{service_type}} needs? I've got openings today.",
    },
    {
      order: 4,
      name: '1-Hour Voicemail Check',
      delay: { type: 'hours', value: 1 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "{{first_name}}, I left you a voicemail but wanted to follow up here too. For {{service_type}}, timing matters. Reply with a good time to chat or your questions - I'm here to help! 📱",
    },
    {
      order: 5,
      name: 'End of Day Push',
      delay: { type: 'hours', value: 4 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Last attempt today, {{first_name}}! I know you're shopping around for {{service_type}}. Happy to give you a quick quote over text if that's easier. Just describe what you need 👍",
    },
    {
      order: 6,
      name: 'Next Morning Email',
      delay: { type: 'days', value: 1 },
      action: 'email',
      conditions: [{ type: 'no_reply' }],
      subject: 'Your {{service_type}} inquiry - quick update',
      body: `Hi {{first_name}},

I tried reaching you yesterday about your {{service_type}} request. I know you're probably comparing a few options, which is smart!

Here's why customers choose us:
• Fast response (as you can see!)
• Transparent pricing - no surprises
• {{unique_selling_point}}
• 5-star reviewed

I'd love to at least give you a competitive quote to compare. What works better - a quick call or should I send some info via text/email?

{{owner_name}}
{{business_phone}}`,
    },
  ],
  exit_on: ['replied', 'booked', 'quote_sent', 'unsubscribed'],
  metrics: { target_conversion: 35, avg_completion_days: 1 },
}

export const GOOD_BETTER_BEST_FOLLOWUP_SEQUENCE: SequenceTemplate = {
  id: 'good_better_best_followup',
  name: 'Good-Better-Best Proposal Follow-up',
  description: 'Follow up on tiered proposals. Good-Better-Best increases close rates 15%+ and average ticket value.',
  type: 'quote_followup',
  bucket: 'scheduled',
  trigger: { type: 'event', event: 'quote_sent', delay_minutes: 30 },
  steps: [
    {
      order: 1,
      name: 'Quote Sent - Walkthrough Offer',
      delay: { type: 'minutes', value: 30 },
      action: 'sms',
      message: "Hi {{first_name}}! Your {{service_type}} estimate is ready with 3 options. Want me to walk through them on a quick call? Most customers go with the middle option - happy to explain why.",
    },
    {
      order: 2,
      name: 'Day 2 - Value Explanation',
      delay: { type: 'days', value: 2 },
      action: 'email',
      conditions: [{ type: 'quote_not_accepted' }],
      subject: 'Quick breakdown of your options',
      body: `Hi {{first_name}},

I wanted to give you a quick summary of your {{service_type}} options:

**GOOD ({{option_1_price}})** - Essential package
{{option_1_description}}
Best for: Budget-conscious, basic needs

**BETTER ({{option_2_price}})** ⭐ Most Popular
{{option_2_description}}
Best for: Best value, most customers choose this

**BEST ({{option_3_price}})** - Premium package
{{option_3_description}}
Best for: Maximum quality & warranty

**My recommendation:** The BETTER option gives you {{key_benefit}} without overpaying.

Questions? Just reply or call {{business_phone}}.

{{owner_name}}`,
    },
    {
      order: 3,
      name: 'Day 4 - Social Proof',
      delay: { type: 'days', value: 4 },
      action: 'sms',
      conditions: [{ type: 'quote_not_accepted' }],
      message: "{{first_name}}, just finished a similar {{service_type}} job nearby - customer went with the middle option and was thrilled. Want to see photos? Happy to share results.",
    },
    {
      order: 4,
      name: 'Day 7 - Financing Option',
      delay: { type: 'days', value: 7 },
      action: 'sms',
      conditions: [{ type: 'quote_not_accepted' }],
      message: "Hey {{first_name}}, quick thought - we offer 0% financing that could let you get the BEST option for the same monthly cost as GOOD. Want me to run the numbers?",
    },
    {
      order: 5,
      name: 'Day 10 - Urgency',
      delay: { type: 'days', value: 10 },
      action: 'sms',
      conditions: [{ type: 'quote_not_accepted' }],
      message: "{{first_name}}, your estimate expires in 4 days and I've got a scheduling opening next week. Ready to lock in your spot? Reply YES and I'll confirm. 📅",
    },
    {
      order: 6,
      name: 'Day 14 - Final Offer',
      delay: { type: 'days', value: 14 },
      action: 'email',
      conditions: [{ type: 'quote_not_accepted' }],
      subject: 'Your estimate expires tomorrow',
      body: `Hi {{first_name}},

Your {{service_type}} estimate expires tomorrow. Before it does, I wanted to offer one more option:

**Book this week and get FREE {{bonus_item}} (normally {{bonus_value}})**

This works with any of the three packages. Just reply "YES" to claim this offer.

If the timing isn't right, I totally understand - just let me know and I'll update your quote when you're ready.

Thanks,
{{owner_name}}`,
    },
  ],
  exit_on: ['quote_accepted', 'booked', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 40, avg_completion_days: 14 },
}

export const FINANCING_FOLLOWUP_SEQUENCE: SequenceTemplate = {
  id: 'financing_followup',
  name: 'Financing Option Follow-up',
  description: 'Convert high-ticket hesitators with financing options. Adds 12% conversion lift on projects over $2,000.',
  type: 'quote_followup',
  bucket: 'scheduled',
  trigger: { type: 'condition', condition: 'quote_amount >= 2000 AND quote_status = pending AND days_since_quote >= 3' },
  steps: [
    {
      order: 1,
      name: 'Financing Introduction',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}, quick question about your {{service_type}} quote - have you considered our financing options? We offer 0% interest for 12 months. Monthly payment would be around {{monthly_payment}}. Interested?",
    },
    {
      order: 2,
      name: 'Detailed Email',
      delay: { type: 'days', value: 2 },
      action: 'email',
      conditions: [{ type: 'no_reply' }],
      subject: 'Make your {{service_type}} project more affordable',
      body: `Hi {{first_name}},

I know {{quote_amount}} is a significant investment. That's why I wanted to share our financing options:

**Option 1: 0% Interest for 12 Months**
• Monthly payment: {{payment_12mo}}
• No interest if paid in full within 12 months
• Quick approval (takes 5 minutes)

**Option 2: Low Monthly Payment**
• Monthly payment: {{payment_60mo}}
• 60-month term
• Fixed rate, no surprises

**Why finance?**
• Keep cash available for emergencies
• Get the job done NOW (before {{seasonal_urgency}})
• Same great quality, easier on the budget

Pre-qualification takes just 5 minutes and doesn't affect your credit score.

Want me to run the numbers for your specific project?

{{owner_name}}
{{business_phone}}`,
    },
    {
      order: 3,
      name: 'Monthly Payment Highlight',
      delay: { type: 'days', value: 5 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "{{first_name}}, with financing your {{service_type}} project is only {{monthly_payment}}/mo. That's less than {{comparison_item}}! Pre-qualify in 5 min (no credit impact). Interested?",
    },
    {
      order: 4,
      name: 'Special Financing Offer',
      delay: { type: 'days', value: 10 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Last chance! We're offering 18 months 0% financing through this week only. Your {{service_type}} project = {{payment_18mo}}/month. Reply YES to lock it in.",
    },
  ],
  exit_on: ['quote_accepted', 'financing_applied', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 25, avg_completion_days: 10 },
}

export const SECOND_ESTIMATE_FOLLOWUP_SEQUENCE: SequenceTemplate = {
  id: 'second_estimate_followup',
  name: 'Competitive Bid Follow-up',
  description: 'Stay competitive when customer is getting multiple quotes. Address price objections proactively.',
  type: 'quote_followup',
  bucket: 'scheduled',
  trigger: { type: 'manual' },
  steps: [
    {
      order: 1,
      name: 'Comparison Offer',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}, I know you're comparing quotes for your {{service_type}} project. If you'd like, send me the other estimate and I'll show you exactly what you're comparing. No obligation - just want to make sure you're getting apples to apples.",
    },
    {
      order: 2,
      name: 'Value Differentiator Email',
      delay: { type: 'days', value: 2 },
      action: 'email',
      conditions: [{ type: 'no_reply' }],
      subject: 'What to look for in {{service_type}} quotes',
      body: `Hi {{first_name}},

When comparing {{service_type}} quotes, here are the key things to check:

**✅ What's INCLUDED in our quote:**
• {{inclusion_1}}
• {{inclusion_2}}
• {{inclusion_3}}
• Full cleanup and haul-away
• {{warranty_details}}

**⚠️ Common "gotchas" in other quotes:**
• Hidden trip charges or fuel fees
• Lower quality materials ({{material_warning}})
• Limited or no warranty
• No insurance/bond coverage

**Our guarantees:**
• Price match guarantee on equivalent scope
• Licensed, bonded, insured
• {{satisfaction_guarantee}}

If you'd like, I'm happy to review any competing quotes line-by-line. Sometimes the lowest price costs more in the long run.

{{owner_name}}
{{business_phone}}`,
    },
    {
      order: 3,
      name: 'Price Match Offer',
      delay: { type: 'days', value: 5 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "{{first_name}}, if another contractor came in lower, show me their quote and I'll see if I can match or beat it while maintaining quality. Fair?",
    },
    {
      order: 4,
      name: 'Value Close',
      delay: { type: 'days', value: 8 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Made your decision yet? Remember - cheapest isn't always best for {{service_type}}. We've seen so many customers pay twice to fix bad work. I'd rather earn your business with quality. Let me know! 👍",
    },
  ],
  exit_on: ['quote_accepted', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 30, avg_completion_days: 8 },
}

export const STORM_DAMAGE_SEQUENCE: SequenceTemplate = {
  id: 'storm_damage_response',
  name: 'Storm Damage Response',
  description: 'Post-storm emergency outreach. Storm sales cycle: 1-7 days to contract. First to respond wins.',
  type: 'speed_to_lead',
  bucket: 'emergency',
  trigger: { type: 'event', event: 'storm_alert' },
  steps: [
    {
      order: 1,
      name: 'Immediate Outreach',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}, this is {{owner_name}} from {{business_name}}. After last night's storm, we're offering FREE damage inspections in your area. Want us to come take a look? Reply YES.",
    },
    {
      order: 2,
      name: 'Email with Details',
      delay: { type: 'hours', value: 2 },
      action: 'email',
      subject: 'FREE storm damage inspection for {{address}}',
      body: `Hi {{first_name}},

After the recent storm, we're seeing a lot of {{damage_type}} in your neighborhood. We wanted to reach out and offer a complimentary inspection.

**Why act now:**
• Insurance claims have time limits
• Hidden damage can worsen quickly
• We document everything for your claim

**What we provide:**
• FREE inspection (no obligation)
• Photo documentation
• Insurance claim assistance
• Emergency tarping if needed

We're booking inspections throughout this week. Reply to this email or text me at {{business_phone}} to schedule.

Stay safe,
{{owner_name}}
{{business_name}}`,
    },
    {
      order: 3,
      name: 'Day 2 Follow-up',
      delay: { type: 'days', value: 2 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "{{first_name}}, following up on the storm inspection offer. We're in {{nearby_area}} tomorrow - want us to swing by? Takes 15 min and it's FREE. Don't wait on damage!",
    },
    {
      order: 4,
      name: 'Day 4 Urgency',
      delay: { type: 'days', value: 4 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Quick reminder - storm damage claims have deadlines! We can still get you a free inspection. Some neighbors waited too long and got denied. Don't let that happen. Reply YES!",
    },
    {
      order: 5,
      name: 'Final Attempt',
      delay: { type: 'days', value: 7 },
      action: 'email',
      conditions: [{ type: 'no_reply' }],
      subject: 'Last chance: Free storm inspection',
      body: `Hi {{first_name}},

This is my final reach out about the free storm damage inspection.

I wanted to let you know that insurance companies typically require claims within 30-60 days of the storm. After that, you may be on your own for repairs.

If you've already had an inspection, great! If not, we still have a few slots this week.

Just reply "SCHEDULE" and I'll have someone reach out.

{{owner_name}}`,
    },
  ],
  exit_on: ['inspection_booked', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 45, avg_completion_days: 7 },
}

export const SEASONAL_CAMPAIGN_SEQUENCE: SequenceTemplate = {
  id: 'seasonal_campaign',
  name: 'Seasonal Service Campaign',
  description: 'Proactive outreach before peak season. HVAC: First heat wave = 55-90% revenue increase.',
  type: 'custom',
  bucket: 'universal',
  trigger: { type: 'schedule' },
  steps: [
    {
      order: 1,
      name: 'Season Preview Email',
      delay: { type: 'immediate' },
      action: 'email',
      subject: "{{season}} is coming - is your {{equipment}} ready?",
      body: `Hi {{first_name}},

{{season}} is almost here! Last year, we saw a lot of {{service_type}} emergencies that could have been prevented with a simple tune-up.

**Why schedule now:**
• Beat the rush (wait times triple during {{peak_season}})
• Save {{savings_amount}} with our early-bird special
• Avoid emergency repair costs (avg {{emergency_cost}})
• {{seasonal_benefit}}

**Limited time offer:**
Schedule your {{service_type}} tune-up before {{deadline}} and get:
✅ Complete system inspection
✅ {{included_service_1}}
✅ {{included_service_2}}
✅ Priority scheduling for the season

**Only {{price}} (normally {{regular_price}})**

Book now: {{booking_link}}

{{owner_name}}
{{business_name}}`,
    },
    {
      order: 2,
      name: 'SMS Reminder',
      delay: { type: 'days', value: 5 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "Hi {{first_name}}! Just a reminder - our {{season}} tune-up special ({{price}}) ends soon. Last year customers who waited paid 3x more for emergency repairs. Book now: {{booking_link}}",
    },
    {
      order: 3,
      name: 'Urgency Push',
      delay: { type: 'days', value: 10 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "{{first_name}}, {{days_left}} days left on our {{season}} special! After that, price goes back to {{regular_price}}. Appointments filling fast. Grab your spot: {{booking_link}} ⏰",
    },
    {
      order: 4,
      name: 'Final Chance',
      delay: { type: 'days', value: 14 },
      action: 'email',
      conditions: [{ type: 'not_booked' }],
      subject: 'LAST CHANCE: {{season}} tune-up special ends tomorrow',
      body: `{{first_name}},

Tomorrow is the last day to get our {{season}} tune-up for {{price}}.

After that:
• Price goes to {{regular_price}}
• Wait times increase to 2-3 weeks
• Emergency calls get priority (you'll wait longer)

If your {{equipment}} is more than 5 years old, a tune-up can:
• Extend its life by 3-5 years
• Reduce energy bills by 15-20%
• Prevent breakdowns during extreme weather

Last chance: {{booking_link}}

{{owner_name}}`,
    },
  ],
  exit_on: ['booked', 'unsubscribed'],
  metrics: { target_conversion: 20, avg_completion_days: 14 },
}

// ============================================================================
// ADVANCED RETENTION SEQUENCES
// ============================================================================

export const POST_SERVICE_THANK_YOU_SEQUENCE: SequenceTemplate = {
  id: 'post_service_thank_you',
  name: 'Post-Service Thank You',
  description: 'Immediate appreciation after service. Sets up review request and builds loyalty.',
  type: 'custom',
  bucket: 'universal',
  trigger: { type: 'event', event: 'job_completed', delay_minutes: 30 },
  steps: [
    {
      order: 1,
      name: 'Thank You SMS',
      delay: { type: 'minutes', value: 30 },
      action: 'sms',
      message: "Thank you for choosing {{business_name}}, {{first_name}}! 🙏 How was your experience with {{tech_name}} today? Reply with any feedback - good or bad. I read every message personally. - {{owner_name}}",
    },
    {
      order: 2,
      name: 'Same-Day Email',
      delay: { type: 'hours', value: 4 },
      action: 'email',
      subject: 'Thanks for your business, {{first_name}}!',
      body: `Hi {{first_name}},

Thank you for trusting us with your {{service_type}} today!

**Job Summary:**
• Service: {{service_description}}
• Technician: {{tech_name}}
• Date: {{service_date}}
{{job_notes}}

**What's next:**
• Any issues within 30 days? Call us immediately - we stand behind our work
• {{maintenance_tip}}
• Save my number: {{business_phone}}

**Was everything perfect?**
If {{tech_name}} did a great job, a quick review helps us a ton:
⭐ {{review_link}}

Thanks again!
{{owner_name}}
{{business_name}}`,
    },
    {
      order: 3,
      name: 'Satisfaction Check',
      delay: { type: 'days', value: 3 },
      action: 'sms',
      conditions: [{ type: 'no_negative_feedback' }],
      message: "Hi {{first_name}}, just checking in - everything still working great after our {{service_type}} visit? Let me know if you have any questions!",
    },
  ],
  exit_on: ['replied', 'review_submitted', 'complaint_filed'],
  metrics: { target_conversion: 90, avg_completion_days: 3 },
}

export const MAINTENANCE_PLAN_CONVERSION_SEQUENCE: SequenceTemplate = {
  id: 'maintenance_plan_conversion',
  name: 'Maintenance Plan Conversion',
  description: 'Convert one-time customers to maintenance agreements. Target: 75-90% retention with plans.',
  type: 'custom',
  bucket: 'emergency',
  trigger: { type: 'event', event: 'job_completed', delay_minutes: 1440 }, // 24 hours after
  steps: [
    {
      order: 1,
      name: 'Plan Introduction',
      delay: { type: 'days', value: 1 },
      action: 'email',
      subject: 'Save {{savings_amount}}/year on {{service_type}}',
      body: `Hi {{first_name}},

Thanks again for your business yesterday! I wanted to let you know about a way to save money and avoid future emergencies.

**{{plan_name}} Benefits:**
• {{benefit_1}}
• {{benefit_2}}
• {{benefit_3}}
• Priority scheduling (no wait during peak season)
• 15% off all repairs
• No overtime charges - EVER

**The math:**
• Your repair yesterday: {{job_amount}}
• Annual tune-ups normally: {{tuneup_cost}}/year
• Emergency repairs average: {{emergency_avg}}/year

**Plan members save {{savings_amount}}/year on average**

Plan cost: Just {{plan_price}}/month ({{annual_plan_price}}/year)

Want to learn more? Reply to this email or call {{business_phone}}.

{{owner_name}}`,
    },
    {
      order: 2,
      name: 'SMS Follow-up',
      delay: { type: 'days', value: 4 },
      action: 'sms',
      conditions: [{ type: 'no_plan_purchased' }],
      message: "Hi {{first_name}}, did you see my email about our maintenance plan? Members save {{savings_amount}}/year and never wait in emergencies. Interested? Reply YES for details.",
    },
    {
      order: 3,
      name: 'Value Comparison',
      delay: { type: 'days', value: 8 },
      action: 'sms',
      conditions: [{ type: 'no_plan_purchased' }],
      message: "{{first_name}}, quick stat: Customers without maintenance plans pay 3x more in repairs. Our {{plan_name}} is {{plan_price}}/mo. Worth a quick look? {{plan_link}}",
    },
    {
      order: 4,
      name: 'Limited Time Offer',
      delay: { type: 'days', value: 14 },
      action: 'email',
      conditions: [{ type: 'no_plan_purchased' }],
      subject: 'Special offer: First month FREE',
      body: `Hi {{first_name}},

Since you're a recent customer, I wanted to offer you something special:

**Sign up for our {{plan_name}} this week and get your first month FREE.**

That's {{plan_price}} in savings, plus all the benefits:
✅ {{benefit_1}}
✅ {{benefit_2}}
✅ Priority scheduling
✅ 15% off all repairs

This offer expires in 7 days.

Sign up here: {{plan_signup_link}}

Or reply with questions - happy to help!

{{owner_name}}`,
    },
  ],
  exit_on: ['plan_purchased', 'unsubscribed'],
  metrics: { target_conversion: 25, avg_completion_days: 14 },
}

export const ONE_TIME_TO_RECURRING_SEQUENCE: SequenceTemplate = {
  id: 'one_time_to_recurring',
  name: 'One-Time to Recurring Conversion',
  description: 'Convert one-time cleaning/service customers to recurring. 14-30 day conversion window is critical.',
  type: 'custom',
  bucket: 'recurring',
  trigger: { type: 'event', event: 'job_completed', delay_minutes: 1440 }, // 24 hours after
  steps: [
    {
      order: 1,
      name: 'Recurring Offer',
      delay: { type: 'days', value: 1 },
      action: 'sms',
      message: "Hi {{first_name}}! Thanks for booking with us. Love your clean space? We can keep it that way! Recurring customers save {{recurring_discount}}% AND get priority scheduling. Want to set up a regular schedule?",
    },
    {
      order: 2,
      name: 'Benefits Email',
      delay: { type: 'days', value: 3 },
      action: 'email',
      subject: 'Keep your home spotless (and save {{recurring_discount}}%)',
      body: `Hi {{first_name}},

Hope you're still enjoying your clean home! I wanted to share how recurring service works:

**Choose your frequency:**
• Weekly - Best for busy families, pet owners
• Bi-weekly - Most popular! Great balance
• Monthly - Perfect for maintenance

**Recurring customer perks:**
• {{recurring_discount}}% off every visit
• Same cleaner every time ({{tech_name}} loved your home!)
• Priority scheduling - pick your ideal day/time
• No contracts - cancel anytime

**Special offer:** Book your first recurring visit within 7 days and get {{first_recurring_discount}}% off!

Reply with your preferred frequency and I'll get you scheduled.

{{owner_name}}`,
    },
    {
      order: 3,
      name: 'Urgency SMS',
      delay: { type: 'days', value: 7 },
      action: 'sms',
      conditions: [{ type: 'not_converted_recurring' }],
      message: "{{first_name}}, your {{first_recurring_discount}}% discount for recurring service expires in 7 days! Lock in your regular schedule now: {{booking_link}} 🏠",
    },
    {
      order: 4,
      name: 'Final Push',
      delay: { type: 'days', value: 14 },
      action: 'sms',
      conditions: [{ type: 'not_converted_recurring' }],
      message: "Last chance, {{first_name}}! Tomorrow is the deadline for {{first_recurring_discount}}% off recurring service. Your next clean could be {{next_price}} instead of {{regular_price}}. Reply YES to lock it in!",
    },
  ],
  exit_on: ['recurring_booked', 'unsubscribed'],
  metrics: { target_conversion: 30, avg_completion_days: 14 },
}

export const SUBSCRIPTION_CONVERSION_SEQUENCE: SequenceTemplate = {
  id: 'subscription_conversion',
  name: 'Subscription Model Conversion',
  description: 'Convert pay-per-service to subscription. Monthly payment increases retention significantly.',
  type: 'custom',
  bucket: 'recurring',
  trigger: { type: 'condition', condition: 'total_jobs >= 3 AND subscription_status = none' },
  steps: [
    {
      order: 1,
      name: 'Subscription Introduction',
      delay: { type: 'immediate' },
      action: 'email',
      subject: 'VIP offer: Lock in your rate forever',
      body: `Hi {{first_name}},

You've been a great customer - {{total_jobs}} visits and counting! I wanted to let you know about our subscription program:

**Subscribe & Save:**

Instead of paying {{avg_service_cost}} per visit, get unlimited service for {{subscription_price}}/month.

**What you get:**
• All your regular {{service_type}} covered
• Priority scheduling (same day/time every visit)
• Price NEVER increases (locked in forever)
• Free add-on services ({{addon_services}})
• No surprise charges - one simple monthly payment

**The math for you:**
• Your average spend: {{avg_monthly_spend}}/month
• Subscription price: {{subscription_price}}/month
• **Your savings: {{monthly_savings}}/month ({{annual_savings}}/year)**

Plus, subscribers can cancel anytime - no long-term contracts.

Interested? Reply "SUBSCRIBE" and I'll get you set up.

{{owner_name}}`,
    },
    {
      order: 2,
      name: 'SMS Follow-up',
      delay: { type: 'days', value: 3 },
      action: 'sms',
      conditions: [{ type: 'no_subscription' }],
      message: "Hi {{first_name}}, did you see my email about our subscription? You'd save {{annual_savings}}/year with locked-in pricing. Want me to explain how it works?",
    },
    {
      order: 3,
      name: 'Social Proof',
      delay: { type: 'days', value: 7 },
      action: 'sms',
      conditions: [{ type: 'no_subscription' }],
      message: "{{first_name}}, FYI - 67% of our regular customers have switched to subscription. They love the simplicity and savings. Questions? Just ask! 😊",
    },
    {
      order: 4,
      name: 'Final Offer',
      delay: { type: 'days', value: 14 },
      action: 'email',
      conditions: [{ type: 'no_subscription' }],
      subject: 'Final offer: Subscribe now, save extra',
      body: `{{first_name}},

Last chance to get our best subscription deal:

**Subscribe this week and get:**
• First month FREE ({{subscription_price}} value)
• Locked-in pricing forever
• All the perks of being a VIP subscriber

This offer expires in 7 days. After that, standard pricing applies.

Lock it in: {{subscription_link}}

{{owner_name}}`,
    },
  ],
  exit_on: ['subscribed', 'unsubscribed'],
  metrics: { target_conversion: 35, avg_completion_days: 14 },
}

export const CONTRACT_RENEWAL_SEQUENCE: SequenceTemplate = {
  id: 'contract_renewal',
  name: 'Contract Renewal',
  description: 'Proactive renewal outreach 30-60 days before expiration. Target: 85%+ renewal rate.',
  type: 'rebooking_reminder',
  bucket: 'recurring',
  trigger: { type: 'condition', condition: 'days_until_contract_expires <= 60' },
  steps: [
    {
      order: 1,
      name: '60-Day Notice',
      delay: { type: 'immediate' },
      action: 'email',
      subject: 'Your {{service_type}} agreement - renewal info inside',
      body: `Hi {{first_name}},

Your {{service_type}} agreement with us expires on {{expiration_date}} - just 60 days away!

**Your account summary:**
• Member since: {{start_date}}
• Services completed: {{total_services}}
• Total savings as a member: {{total_savings}}

**Renewal options:**

**Option 1: Auto-Renew (Recommended)**
✅ Same great rate: {{current_rate}}/{{billing_period}}
✅ No interruption in service
✅ Keep your priority scheduling

**Option 2: Upgrade to {{premium_plan}}**
✅ Everything you have now, PLUS:
✅ {{upgrade_benefit_1}}
✅ {{upgrade_benefit_2}}
✅ Only {{upgrade_rate}}/{{billing_period}}

**Option 3: Let it expire**
(We'd hate to see you go! Your rate may increase if you rejoin later)

Reply with your choice or call {{business_phone}} if you have questions.

Thank you for being a valued customer!
{{owner_name}}`,
    },
    {
      order: 2,
      name: '30-Day Reminder',
      delay: { type: 'days', value: 30 },
      action: 'sms',
      conditions: [{ type: 'not_renewed' }],
      message: "Hi {{first_name}}, your {{service_type}} agreement expires in 30 days. Want to renew at your current rate ({{current_rate}})? Reply YES to auto-renew or call us with questions!",
    },
    {
      order: 3,
      name: '14-Day Urgency',
      delay: { type: 'days', value: 46 },
      action: 'sms',
      conditions: [{ type: 'not_renewed' }],
      message: "{{first_name}}, just 2 weeks left on your agreement! If you don't renew, you'll lose your {{current_rate}} rate. Future rate may be {{future_rate}}. Lock it in now: {{renewal_link}}",
    },
    {
      order: 4,
      name: '7-Day Final Warning',
      delay: { type: 'days', value: 53 },
      action: 'email',
      conditions: [{ type: 'not_renewed' }],
      subject: '⚠️ Your agreement expires in 7 days',
      body: `{{first_name}},

This is your final reminder - your {{service_type}} agreement expires on {{expiration_date}}.

**What happens if you don't renew:**
• Service interruption after {{expiration_date}}
• Loss of your locked-in rate
• Back to standard pricing ({{standard_rate}})
• Loss of priority scheduling

**To renew now:** {{renewal_link}}

Or simply reply "RENEW" to this email and I'll take care of it.

We value your business and hope to keep serving you!

{{owner_name}}`,
    },
    {
      order: 5,
      name: 'Day-Of Last Chance',
      delay: { type: 'days', value: 59 },
      action: 'sms',
      conditions: [{ type: 'not_renewed' }],
      message: "{{first_name}}, your agreement expires TOMORROW! Last chance to keep your {{current_rate}} rate. Reply YES now or call {{business_phone}}. Don't lose your spot! 🙏",
    },
  ],
  exit_on: ['renewed', 'cancelled', 'unsubscribed'],
  metrics: { target_conversion: 85, avg_completion_days: 60 },
}

export const VIP_CUSTOMER_NURTURE_SEQUENCE: SequenceTemplate = {
  id: 'vip_customer_nurture',
  name: 'VIP Customer Nurture',
  description: 'Keep top customers engaged with exclusive perks and appreciation. Top 20% of customers = 80% of revenue.',
  type: 'custom',
  bucket: 'universal',
  trigger: { type: 'condition', condition: 'customer_lifetime_value >= 1000 OR total_jobs >= 5' },
  steps: [
    {
      order: 1,
      name: 'VIP Welcome',
      delay: { type: 'immediate' },
      action: 'email',
      subject: "You're now a {{business_name}} VIP! 🌟",
      body: `Hi {{first_name}},

I wanted to personally thank you for your loyalty to {{business_name}}. With {{total_jobs}} jobs and over \${{lifetime_value}} with us, you've earned VIP status!

**What this means for you:**

🌟 **Priority Scheduling**
You jump to the front of the line. Same-day service when available.

🌟 **VIP Pricing**
{{vip_discount}}% off all services, automatically applied.

🌟 **Dedicated Support**
My personal cell: {{owner_phone}}. Text me anytime.

🌟 **Exclusive Offers**
First access to specials and new services.

🌟 **Annual Gift**
A small thank-you gift on your anniversary with us.

You don't need to do anything - these perks are active now.

Thank you for trusting us with your home. It means everything.

Gratefully,
{{owner_name}}
{{business_name}}`,
    },
    {
      order: 2,
      name: 'Monthly Check-in',
      delay: { type: 'days', value: 30 },
      action: 'sms',
      message: "Hi {{first_name}}! Just checking in from {{business_name}}. Everything going well? Need any service? As a VIP, you're always top priority. Just text me! - {{owner_name}}",
    },
    {
      order: 3,
      name: 'Quarterly Appreciation',
      delay: { type: 'days', value: 90 },
      action: 'email',
      subject: 'A small thank you, {{first_name}}',
      body: `Hi {{first_name}},

Just wanted to drop a quick note to say THANK YOU. VIP customers like you are why we love what we do.

**Your VIP stats:**
• Jobs completed: {{total_jobs}}
• With us since: {{first_service_date}}
• You've saved: {{total_vip_savings}} with VIP pricing

**A gift for you:**
Use code VIP{{discount_code}} for an extra {{bonus_discount}}% off your next service. No expiration.

Is there anything we can do better? I'd love your honest feedback.

With gratitude,
{{owner_name}}`,
    },
  ],
  exit_on: ['unsubscribed'],
  metrics: { target_conversion: 95, avg_completion_days: 90 },
}

export const PAYMENT_FOLLOWUP_SEQUENCE: SequenceTemplate = {
  id: 'payment_followup',
  name: 'Payment Follow-up',
  description: 'Professional payment reminder sequence. Collect outstanding invoices before they become bad debt.',
  type: 'custom',
  bucket: 'universal',
  trigger: { type: 'condition', condition: 'invoice_days_overdue >= 3' },
  steps: [
    {
      order: 1,
      name: 'Friendly Reminder (Day 3)',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}, quick reminder - your invoice for {{invoice_amount}} is due. Pay easily here: {{payment_link}} Thanks!",
    },
    {
      order: 2,
      name: 'Email Reminder (Day 7)',
      delay: { type: 'days', value: 4 },
      action: 'email',
      conditions: [{ type: 'invoice_unpaid' }],
      subject: 'Invoice reminder: {{invoice_amount}} due',
      body: `Hi {{first_name}},

This is a friendly reminder that your invoice is past due.

**Invoice Details:**
• Service: {{service_description}}
• Date: {{service_date}}
• Amount: {{invoice_amount}}
• Due: {{due_date}}

**Pay now:** {{payment_link}}

Having trouble? We offer payment plans - just reply to discuss options.

Thank you,
{{business_name}}`,
    },
    {
      order: 3,
      name: 'Second SMS (Day 14)',
      delay: { type: 'days', value: 11 },
      action: 'sms',
      conditions: [{ type: 'invoice_unpaid' }],
      message: "{{first_name}}, your {{invoice_amount}} invoice is now 2 weeks overdue. Please pay today to avoid late fees: {{payment_link}} Questions? Call {{business_phone}}.",
    },
    {
      order: 4,
      name: 'Final Notice (Day 21)',
      delay: { type: 'days', value: 18 },
      action: 'email',
      conditions: [{ type: 'invoice_unpaid' }],
      subject: 'FINAL NOTICE: Payment required',
      body: `{{first_name}},

This is a final notice regarding your outstanding balance of {{invoice_amount}}.

If payment is not received within 7 days, we will be forced to:
• Add late fees ({{late_fee_amount}})
• Suspend future service
• Begin collection procedures

We want to resolve this amicably. If you're experiencing financial difficulty, please call me directly at {{owner_phone}} to discuss payment options.

Pay now: {{payment_link}}

{{owner_name}}
{{business_name}}`,
    },
    {
      order: 5,
      name: 'Collections Warning (Day 30)',
      delay: { type: 'days', value: 27 },
      action: 'internal_task',
      conditions: [{ type: 'invoice_unpaid' }],
      config: {
        title: 'Collections review: {{first_name}} {{last_name}}',
        description: 'Invoice {{invoice_number}} is 30 days overdue ({{invoice_amount}}). Review for collections action.',
        priority: 'high',
      },
    },
  ],
  exit_on: ['invoice_paid', 'payment_plan_setup'],
  metrics: { target_conversion: 85, avg_completion_days: 30 },
}

export const UPSELL_CROSS_SELL_SEQUENCE: SequenceTemplate = {
  id: 'upsell_cross_sell',
  name: 'Upsell / Cross-Sell',
  description: 'Offer related services after job completion. Existing customers are 60-70% more likely to buy.',
  type: 'custom',
  bucket: 'universal',
  trigger: { type: 'event', event: 'job_completed', delay_minutes: 10080 }, // 7 days after
  steps: [
    {
      order: 1,
      name: 'Related Service Offer',
      delay: { type: 'days', value: 7 },
      action: 'email',
      subject: 'Since you got {{last_service}}...',
      body: `Hi {{first_name}},

Hope you're enjoying your recent {{last_service}}! I wanted to mention a service that pairs perfectly with it:

**{{upsell_service}}**

{{upsell_description}}

**Why it makes sense:**
• {{reason_1}}
• {{reason_2}}
• {{reason_3}}

**Special bundle pricing:**
Normally {{upsell_price}}, but since you just got {{last_service}}: **{{bundle_price}}** (Save {{bundle_savings}}!)

This offer is valid for 14 days.

Interested? Just reply "YES" or book here: {{booking_link}}

{{owner_name}}`,
    },
    {
      order: 2,
      name: 'SMS Reminder',
      delay: { type: 'days', value: 11 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "Hi {{first_name}}! Quick reminder - your {{bundle_savings}} savings on {{upsell_service}} expires soon. Pairs great with your recent {{last_service}}. Interested? Reply YES!",
    },
    {
      order: 3,
      name: 'Final Offer',
      delay: { type: 'days', value: 20 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "Last chance, {{first_name}}! Your bundle discount ({{bundle_savings}} off {{upsell_service}}) expires tomorrow. Book now: {{booking_link}} ⏰",
    },
  ],
  exit_on: ['booked', 'unsubscribed'],
  metrics: { target_conversion: 15, avg_completion_days: 21 },
}

export const ANNUAL_MAINTENANCE_REMINDER_SEQUENCE: SequenceTemplate = {
  id: 'annual_maintenance_reminder',
  name: 'Annual Maintenance Reminder',
  description: 'Remind customers of annual services (water heater flush, HVAC tune-up, etc.). Target: 40-60% return rate.',
  type: 'rebooking_reminder',
  bucket: 'universal',
  trigger: { type: 'condition', condition: 'days_since_service_type >= 335' }, // ~11 months
  steps: [
    {
      order: 1,
      name: 'Anniversary Email',
      delay: { type: 'immediate' },
      action: 'email',
      subject: "It's been a year since your {{last_service}}",
      body: `Hi {{first_name}},

Can you believe it's been almost a year since we {{last_service_description}}?

**Why annual {{service_type}} matters:**
• {{benefit_1}}
• {{benefit_2}}
• {{benefit_3}}
• Most manufacturers recommend annual service for warranty coverage

**Your annual service includes:**
✅ {{included_1}}
✅ {{included_2}}
✅ {{included_3}}
✅ Full inspection and report

**Book now: {{annual_price}}** (Save {{savings}} vs. standard pricing)

Schedule your annual visit: {{booking_link}}

Thanks for being a loyal customer!
{{owner_name}}`,
    },
    {
      order: 2,
      name: 'SMS Reminder',
      delay: { type: 'days', value: 7 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "Hi {{first_name}}, time for your annual {{service_type}}! Book this week and save {{savings}}: {{booking_link}} Most customers book every 12 months. 📅",
    },
    {
      order: 3,
      name: 'Urgency Push',
      delay: { type: 'days', value: 21 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "{{first_name}}, your {{equipment}} is now {{days_since_service}} days without service. Annual maintenance prevents costly repairs. Book before the rush: {{booking_link}} ⚠️",
    },
    {
      order: 4,
      name: 'Final Reminder',
      delay: { type: 'days', value: 45 },
      action: 'email',
      conditions: [{ type: 'not_booked' }],
      subject: 'Final reminder: Annual {{service_type}} overdue',
      body: `Hi {{first_name}},

Your {{equipment}} is now {{days_since_service}} days past its recommended annual service.

**Risks of skipping annual maintenance:**
• 15% higher energy bills
• 50% more likely to break down
• May void warranty coverage
• Shorter equipment lifespan

I don't want you to get stuck with a preventable repair bill.

**Book now and get {{overdue_discount}}% off** (our "we-understand-life-gets-busy" discount 😊)

{{booking_link}}

{{owner_name}}`,
    },
  ],
  exit_on: ['booked', 'unsubscribed'],
  metrics: { target_conversion: 45, avg_completion_days: 45 },
}

export const CUSTOMER_FEEDBACK_SEQUENCE: SequenceTemplate = {
  id: 'customer_feedback',
  name: 'Customer Satisfaction Survey',
  description: 'Collect feedback and identify at-risk customers. 62% of churn is from customers feeling uncared for.',
  type: 'custom',
  bucket: 'universal',
  trigger: { type: 'schedule' }, // Quarterly or after milestones
  steps: [
    {
      order: 1,
      name: 'Survey Request',
      delay: { type: 'immediate' },
      action: 'email',
      subject: 'Quick question, {{first_name}} (30 seconds)',
      body: `Hi {{first_name}},

I have one quick question:

**On a scale of 1-10, how likely are you to recommend {{business_name}} to a friend?**

Just reply with a number (1-10). That's it!

Your feedback helps us improve.

Thanks!
{{owner_name}}`,
    },
    {
      order: 2,
      name: 'Follow-up if No Response',
      delay: { type: 'days', value: 3 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "Hi {{first_name}}, I sent a quick survey - just reply with 1-10. How likely are you to recommend us? Your opinion matters! Thanks 🙏",
    },
    {
      order: 3,
      name: 'Thank You (High Score)',
      delay: { type: 'immediate' },
      action: 'sms',
      conditions: [{ type: 'nps_score_gte', value: 9 }],
      message: "Thank you for the amazing feedback! 🌟 If you have 30 seconds, a Google review helps us reach more homeowners like you: {{review_link}}",
      exit_on: ['review_requested'],
    },
    {
      order: 4,
      name: 'Investigate (Low Score)',
      delay: { type: 'immediate' },
      action: 'internal_task',
      conditions: [{ type: 'nps_score_lte', value: 6 }],
      config: {
        title: '⚠️ Unhappy customer: {{first_name}} {{last_name}}',
        description: 'NPS score: {{nps_score}}/10. Call immediately to resolve issues and prevent churn.',
        priority: 'high',
      },
    },
    {
      order: 5,
      name: 'Recovery Outreach',
      delay: { type: 'hours', value: 4 },
      action: 'sms',
      conditions: [{ type: 'nps_score_lte', value: 6 }],
      message: "{{first_name}}, I saw your feedback and I'm concerned. I'd love to make things right. Can we talk? I'm available at {{owner_phone}} or let me know a good time. - {{owner_name}}",
    },
  ],
  exit_on: ['survey_completed', 'unsubscribed'],
  metrics: { target_conversion: 40, avg_completion_days: 3 },
}

export const LAPSED_CUSTOMER_OUTREACH_SEQUENCE: SequenceTemplate = {
  id: 'lapsed_customer_outreach',
  name: 'Lapsed Customer Outreach (30-60 Days)',
  description: 'Re-engage customers who haven\'t booked in 30-60 days. The "we miss you" window.',
  type: 'reactivation',
  bucket: 'recurring',
  trigger: { type: 'condition', condition: 'days_since_last_job >= 30 AND days_since_last_job < 60' },
  steps: [
    {
      order: 1,
      name: 'Soft Touch',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}, it's {{owner_name}} from {{business_name}}! It's been {{days_since_last_job}} days - just wanted to check in. Everything going okay? Need to get back on the schedule?",
    },
    {
      order: 2,
      name: 'Value Reminder',
      delay: { type: 'days', value: 7 },
      action: 'email',
      conditions: [{ type: 'no_reply' }],
      subject: 'We miss you, {{first_name}}!',
      body: `Hi {{first_name}},

We noticed it's been a while since your last {{service_type}} ({{last_service_date}}).

Just wanted to check in and see if:
• Everything is going well?
• You found another provider?
• Life just got busy?

Whatever the reason, we'd love to hear from you. And if there's anything we could have done better, I genuinely want to know.

**Ready to come back?**
Here's {{comeback_discount}}% off your next service: **Code: MISSYOU**

Book anytime: {{booking_link}}

Hope to see you soon!
{{owner_name}}`,
    },
    {
      order: 3,
      name: 'Final Check-in',
      delay: { type: 'days', value: 20 },
      action: 'sms',
      conditions: [{ type: 'no_reply' }],
      message: "{{first_name}}, last message from me (promise!). If you need {{service_type}}, I'm here. If not, I understand. Use MISSYOU for {{comeback_discount}}% off anytime. Take care! - {{owner_name}}",
    },
  ],
  exit_on: ['booked', 'replied', 'unsubscribed'],
  metrics: { target_conversion: 30, avg_completion_days: 20 },
}

// ============================================================================
// INDUSTRY-SPECIFIC SEQUENCES
// ============================================================================

export const HVAC_SEASONAL_SEQUENCE: SequenceTemplate = {
  id: 'hvac_seasonal',
  name: 'HVAC Seasonal Tune-Up',
  description: 'Bi-annual HVAC maintenance reminders. Spring (cooling) and Fall (heating).',
  type: 'seasonal_campaign',
  bucket: 'emergency',
  trigger: { type: 'schedule' },
  steps: [
    {
      order: 1,
      name: 'Season Start Email',
      delay: { type: 'immediate' },
      action: 'email',
      subject: '{{season}} is coming - is your {{system}} ready?',
      body: `Hi {{first_name}},

{{season_weather}} is right around the corner! Last year, we saw tons of {{system_type}} emergencies during the first {{extreme_weather}} - most could have been prevented with a simple tune-up.

**Why tune up NOW:**
• Beat the 2-3 week wait times during {{peak_season}}
• Save up to 15% on energy bills
• Prevent costly breakdowns
• Keep your warranty valid

**{{season}} Tune-Up Special: {{special_price}}** (reg. {{regular_price}})

Includes:
✅ Complete {{system_type}} inspection
✅ Clean and check all components
✅ Refrigerant/gas pressure check
✅ Filter replacement
✅ Efficiency optimization

Spots are filling up - schedule now: {{booking_link}}

{{owner_name}}
{{business_name}}`,
    },
    {
      order: 2,
      name: 'SMS Reminder',
      delay: { type: 'days', value: 7 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "{{first_name}}, {{season}} tune-up special ({{special_price}}) won't last long! Prevent {{extreme_weather}} breakdowns. Book now: {{booking_link}} ❄️🔥",
    },
    {
      order: 3,
      name: 'Urgency Before Season',
      delay: { type: 'days', value: 21 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "Last week for {{season}} specials! After {{deadline}}, prices go up and wait times jump to 2+ weeks. Don't get stuck without {{cooling_or_heating}}! {{booking_link}}",
    },
  ],
  exit_on: ['booked', 'unsubscribed'],
  metrics: { target_conversion: 25, avg_completion_days: 21 },
}

export const PEST_QUARTERLY_SEQUENCE: SequenceTemplate = {
  id: 'pest_quarterly',
  name: 'Pest Control Quarterly Reminder',
  description: 'Quarterly service reminders. 85% of pest control revenue is recurring.',
  type: 'rebooking_reminder',
  bucket: 'recurring',
  trigger: { type: 'condition', condition: 'days_since_last_service >= 80' },
  steps: [
    {
      order: 1,
      name: 'Quarterly Reminder',
      delay: { type: 'immediate' },
      action: 'sms',
      message: "Hi {{first_name}}, your quarterly pest treatment is due soon! Same time works? Reply YES to confirm or let me know what day works better. - {{business_name}}",
    },
    {
      order: 2,
      name: 'Seasonal Pest Alert',
      delay: { type: 'days', value: 5 },
      action: 'email',
      conditions: [{ type: 'not_booked' }],
      subject: '{{seasonal_pest}} season is here',
      body: `Hi {{first_name}},

Just a heads up - {{seasonal_pest}} activity is increasing this time of year. Your last treatment was {{days_since_last_service}} days ago.

**Why quarterly matters:**
• Treatment effectiveness wears off after 90 days
• {{seasonal_pest}} populations peak in {{season}}
• Prevention costs 10x less than infestation treatment

**Your next treatment includes:**
• Full perimeter treatment
• Interior crack/crevice application
• {{seasonal_specific_treatment}}
• Nest removal if needed

Schedule your quarterly visit: {{booking_link}}

Don't let the bugs move in! 🐜

{{owner_name}}`,
    },
    {
      order: 3,
      name: 'Urgency SMS',
      delay: { type: 'days', value: 10 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "{{first_name}}, you're {{days_overdue}} days past your quarterly treatment. {{seasonal_pest}} are most active now. Let's get you protected! {{booking_link}} 🏠",
    },
  ],
  exit_on: ['booked', 'cancelled', 'unsubscribed'],
  metrics: { target_conversion: 85, avg_completion_days: 10 },
}

export const CLEANING_HOLIDAY_PREP_SEQUENCE: SequenceTemplate = {
  id: 'cleaning_holiday_prep',
  name: 'Holiday Deep Clean',
  description: 'Pre-holiday deep cleaning promotions. Major booking opportunity.',
  type: 'seasonal_campaign',
  bucket: 'recurring',
  trigger: { type: 'schedule' },
  steps: [
    {
      order: 1,
      name: 'Holiday Campaign Email',
      delay: { type: 'immediate' },
      action: 'email',
      subject: 'Guests coming? Let us help! 🏠',
      body: `Hi {{first_name}},

{{holiday}} is just {{days_until_holiday}} days away! Expecting guests?

**Get your home guest-ready with our {{holiday}} Deep Clean:**

✨ Every room cleaned top to bottom
✨ Kitchen deep clean (oven, fridge, etc.)
✨ Bathroom sanitization
✨ Guest room prep
✨ Common areas detailed

**{{holiday}} Special: {{holiday_price}}** (Save {{holiday_savings}}!)

**Book by {{deadline}} to guarantee your spot.** Our schedule fills up fast during the holidays!

{{booking_link}}

Happy {{holiday}}!
{{owner_name}}`,
    },
    {
      order: 2,
      name: 'SMS Reminder',
      delay: { type: 'days', value: 5 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "{{first_name}}, {{days_left}} days until {{holiday}}! 🎄 Book your deep clean now before we're fully booked: {{booking_link}} Save {{holiday_savings}}!",
    },
    {
      order: 3,
      name: 'Last Chance',
      delay: { type: 'days', value: 10 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "Almost out of {{holiday}} slots! A few openings left before {{holiday}}. Guest-ready home = stress-free hosting. Book NOW: {{booking_link}} 🏠✨",
    },
  ],
  exit_on: ['booked', 'unsubscribed'],
  metrics: { target_conversion: 30, avg_completion_days: 10 },
}

export const POOL_SEASONAL_OPENING_SEQUENCE: SequenceTemplate = {
  id: 'pool_seasonal_opening',
  name: 'Pool Opening/Closing',
  description: 'Seasonal pool opening (spring) and closing (fall) sequences.',
  type: 'seasonal_campaign',
  bucket: 'recurring',
  trigger: { type: 'schedule' },
  steps: [
    {
      order: 1,
      name: 'Season Email',
      delay: { type: 'immediate' },
      action: 'email',
      subject: 'Time to {{open_or_close}} your pool!',
      body: `Hi {{first_name}},

{{season}} is here - time to {{open_or_close}} your pool!

**Our Pool {{opening_or_closing}} Service Includes:**
✅ {{service_item_1}}
✅ {{service_item_2}}
✅ {{service_item_3}}
✅ {{service_item_4}}
✅ Chemical balance check

**Early Bird Pricing: {{early_price}}** (after {{deadline}}: {{regular_price}})

We're booking up fast - most customers schedule 2-3 weeks out.

Reserve your spot: {{booking_link}}

{{owner_name}}
{{business_name}}`,
    },
    {
      order: 2,
      name: 'SMS Reminder',
      delay: { type: 'days', value: 7 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "{{first_name}}, pool {{opening_or_closing}} time! Early bird price ({{early_price}}) ends soon. Beat the rush: {{booking_link}} 🏊",
    },
    {
      order: 3,
      name: 'Weather Trigger',
      delay: { type: 'days', value: 14 },
      action: 'sms',
      conditions: [{ type: 'not_booked' }],
      message: "{{weather_message}} Time to {{open_or_close}} that pool! We've got a few openings left this week. Book now: {{booking_link}}",
    },
  ],
  exit_on: ['booked', 'unsubscribed'],
  metrics: { target_conversion: 60, avg_completion_days: 14 },
}

// ============================================================================
// TEMPLATE COLLECTIONS
// ============================================================================

export const ALL_TEMPLATES: SequenceTemplate[] = [
  // Emergency - Core
  SPEED_TO_LEAD_SEQUENCE,
  MISSED_CALL_RECOVERY_SEQUENCE,
  AFTER_HOURS_SEQUENCE,
  // Emergency - Advanced
  STORM_DAMAGE_SEQUENCE,
  HOT_LEAD_FAST_TRACK_SEQUENCE,
  MAINTENANCE_PLAN_CONVERSION_SEQUENCE,
  HVAC_SEASONAL_SEQUENCE,
  // Scheduled - Core
  QUOTE_FOLLOWUP_SEQUENCE,
  ESTIMATE_EXPIRY_SEQUENCE,
  PIPELINE_NURTURE_SEQUENCE,
  // Scheduled - Advanced
  GOOD_BETTER_BEST_FOLLOWUP_SEQUENCE,
  FINANCING_FOLLOWUP_SEQUENCE,
  SECOND_ESTIMATE_FOLLOWUP_SEQUENCE,
  SEASONAL_CAMPAIGN_SEQUENCE,
  // Recurring - Core
  REBOOKING_REMINDER_SEQUENCE,
  AT_RISK_INTERVENTION_SEQUENCE,
  REACTIVATION_SEQUENCE,
  // Recurring - Advanced
  ONE_TIME_TO_RECURRING_SEQUENCE,
  SUBSCRIPTION_CONVERSION_SEQUENCE,
  CONTRACT_RENEWAL_SEQUENCE,
  LAPSED_CUSTOMER_OUTREACH_SEQUENCE,
  PEST_QUARTERLY_SEQUENCE,
  CLEANING_HOLIDAY_PREP_SEQUENCE,
  POOL_SEASONAL_OPENING_SEQUENCE,
  // Universal - Core
  BOOKING_REMINDER_SEQUENCE,
  REVIEW_REQUEST_SEQUENCE,
  REFERRAL_REQUEST_SEQUENCE,
  WIN_BACK_SEQUENCE,
  // Universal - Advanced
  POST_SERVICE_THANK_YOU_SEQUENCE,
  VIP_CUSTOMER_NURTURE_SEQUENCE,
  PAYMENT_FOLLOWUP_SEQUENCE,
  UPSELL_CROSS_SELL_SEQUENCE,
  ANNUAL_MAINTENANCE_REMINDER_SEQUENCE,
  CUSTOMER_FEEDBACK_SEQUENCE,
]

export const TEMPLATES_BY_BUCKET = {
  emergency: [
    // Speed & Response
    SPEED_TO_LEAD_SEQUENCE,
    HOT_LEAD_FAST_TRACK_SEQUENCE,
    MISSED_CALL_RECOVERY_SEQUENCE,
    AFTER_HOURS_SEQUENCE,
    STORM_DAMAGE_SEQUENCE,
    // Conversion
    MAINTENANCE_PLAN_CONVERSION_SEQUENCE,
    HVAC_SEASONAL_SEQUENCE,
    // Universal
    BOOKING_REMINDER_SEQUENCE,
    POST_SERVICE_THANK_YOU_SEQUENCE,
    REVIEW_REQUEST_SEQUENCE,
    REFERRAL_REQUEST_SEQUENCE,
    UPSELL_CROSS_SELL_SEQUENCE,
    ANNUAL_MAINTENANCE_REMINDER_SEQUENCE,
    WIN_BACK_SEQUENCE,
    VIP_CUSTOMER_NURTURE_SEQUENCE,
    PAYMENT_FOLLOWUP_SEQUENCE,
    CUSTOMER_FEEDBACK_SEQUENCE,
  ],
  scheduled: [
    // Quote & Sales
    QUOTE_FOLLOWUP_SEQUENCE,
    GOOD_BETTER_BEST_FOLLOWUP_SEQUENCE,
    FINANCING_FOLLOWUP_SEQUENCE,
    SECOND_ESTIMATE_FOLLOWUP_SEQUENCE,
    ESTIMATE_EXPIRY_SEQUENCE,
    PIPELINE_NURTURE_SEQUENCE,
    SEASONAL_CAMPAIGN_SEQUENCE,
    // Universal
    BOOKING_REMINDER_SEQUENCE,
    POST_SERVICE_THANK_YOU_SEQUENCE,
    REVIEW_REQUEST_SEQUENCE,
    REFERRAL_REQUEST_SEQUENCE,
    UPSELL_CROSS_SELL_SEQUENCE,
    WIN_BACK_SEQUENCE,
    VIP_CUSTOMER_NURTURE_SEQUENCE,
    PAYMENT_FOLLOWUP_SEQUENCE,
    CUSTOMER_FEEDBACK_SEQUENCE,
  ],
  recurring: [
    // Retention
    REBOOKING_REMINDER_SEQUENCE,
    AT_RISK_INTERVENTION_SEQUENCE,
    REACTIVATION_SEQUENCE,
    LAPSED_CUSTOMER_OUTREACH_SEQUENCE,
    CONTRACT_RENEWAL_SEQUENCE,
    // Conversion
    ONE_TIME_TO_RECURRING_SEQUENCE,
    SUBSCRIPTION_CONVERSION_SEQUENCE,
    // Industry Specific
    PEST_QUARTERLY_SEQUENCE,
    CLEANING_HOLIDAY_PREP_SEQUENCE,
    POOL_SEASONAL_OPENING_SEQUENCE,
    // Universal
    BOOKING_REMINDER_SEQUENCE,
    POST_SERVICE_THANK_YOU_SEQUENCE,
    REVIEW_REQUEST_SEQUENCE,
    REFERRAL_REQUEST_SEQUENCE,
    UPSELL_CROSS_SELL_SEQUENCE,
    ANNUAL_MAINTENANCE_REMINDER_SEQUENCE,
    WIN_BACK_SEQUENCE,
    VIP_CUSTOMER_NURTURE_SEQUENCE,
    PAYMENT_FOLLOWUP_SEQUENCE,
    CUSTOMER_FEEDBACK_SEQUENCE,
  ],
}

// Group templates by category for UI organization
export const TEMPLATES_BY_CATEGORY = {
  'Speed-to-Lead': [
    SPEED_TO_LEAD_SEQUENCE,
    HOT_LEAD_FAST_TRACK_SEQUENCE,
    MISSED_CALL_RECOVERY_SEQUENCE,
    AFTER_HOURS_SEQUENCE,
    STORM_DAMAGE_SEQUENCE,
  ],
  'Quote Follow-Up': [
    QUOTE_FOLLOWUP_SEQUENCE,
    GOOD_BETTER_BEST_FOLLOWUP_SEQUENCE,
    FINANCING_FOLLOWUP_SEQUENCE,
    SECOND_ESTIMATE_FOLLOWUP_SEQUENCE,
    ESTIMATE_EXPIRY_SEQUENCE,
    PIPELINE_NURTURE_SEQUENCE,
  ],
  'Customer Retention': [
    REBOOKING_REMINDER_SEQUENCE,
    AT_RISK_INTERVENTION_SEQUENCE,
    REACTIVATION_SEQUENCE,
    LAPSED_CUSTOMER_OUTREACH_SEQUENCE,
    WIN_BACK_SEQUENCE,
    CONTRACT_RENEWAL_SEQUENCE,
    VIP_CUSTOMER_NURTURE_SEQUENCE,
  ],
  'Conversion & Upsell': [
    ONE_TIME_TO_RECURRING_SEQUENCE,
    SUBSCRIPTION_CONVERSION_SEQUENCE,
    MAINTENANCE_PLAN_CONVERSION_SEQUENCE,
    UPSELL_CROSS_SELL_SEQUENCE,
  ],
  'Seasonal Campaigns': [
    SEASONAL_CAMPAIGN_SEQUENCE,
    HVAC_SEASONAL_SEQUENCE,
    PEST_QUARTERLY_SEQUENCE,
    CLEANING_HOLIDAY_PREP_SEQUENCE,
    POOL_SEASONAL_OPENING_SEQUENCE,
    ANNUAL_MAINTENANCE_REMINDER_SEQUENCE,
  ],
  'Service & Booking': [
    BOOKING_REMINDER_SEQUENCE,
    POST_SERVICE_THANK_YOU_SEQUENCE,
  ],
  'Reviews & Referrals': [
    REVIEW_REQUEST_SEQUENCE,
    REFERRAL_REQUEST_SEQUENCE,
    CUSTOMER_FEEDBACK_SEQUENCE,
  ],
  'Collections': [
    PAYMENT_FOLLOWUP_SEQUENCE,
  ],
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTemplatesForBucket(bucket: BusinessBucket): SequenceTemplate[] {
  return TEMPLATES_BY_BUCKET[bucket] || []
}

export function getRecommendedWorkflows(businessType: BusinessBucket): string[] {
  const base = ['booking_reminder', 'review_request', 'post_service_thank_you', 'referral_request']
  
  switch (businessType) {
    case 'emergency':
      return [
        'speed_to_lead', 
        'hot_lead_fast_track',
        'missed_call_recovery', 
        'after_hours', 
        'maintenance_plan_conversion',
        'annual_maintenance_reminder',
        ...base
      ]
    case 'scheduled':
      return [
        'quote_followup', 
        'good_better_best_followup',
        'financing_followup',
        'pipeline_nurture', 
        'estimate_expiry',
        'seasonal_campaign', 
        ...base
      ]
    case 'recurring':
      return [
        'rebooking_reminder', 
        'one_time_to_recurring',
        'subscription_conversion',
        'at_risk_intervention', 
        'reactivation',
        'contract_renewal',
        'lapsed_customer_outreach',
        ...base
      ]
    default:
      return base
  }
}

// Get templates recommended for a specific industry
export function getRecommendedTemplatesForIndustry(industryId: string): SequenceTemplate[] {
  const industry = getIndustryBySlug(industryId)
  if (!industry) return []
  
  const baseTemplates = TEMPLATES_BY_BUCKET[industry.bucket] || []
  
  // Add industry-specific templates
  const industrySpecific: Record<string, SequenceTemplate[]> = {
    hvac: [HVAC_SEASONAL_SEQUENCE, MAINTENANCE_PLAN_CONVERSION_SEQUENCE],
    plumbing: [MAINTENANCE_PLAN_CONVERSION_SEQUENCE, ANNUAL_MAINTENANCE_REMINDER_SEQUENCE],
    electrical: [MAINTENANCE_PLAN_CONVERSION_SEQUENCE],
    garage_door: [ANNUAL_MAINTENANCE_REMINDER_SEQUENCE],
    roofing: [STORM_DAMAGE_SEQUENCE, SEASONAL_CAMPAIGN_SEQUENCE],
    flooring: [GOOD_BETTER_BEST_FOLLOWUP_SEQUENCE, FINANCING_FOLLOWUP_SEQUENCE],
    landscaping: [SEASONAL_CAMPAIGN_SEQUENCE, CONTRACT_RENEWAL_SEQUENCE],
    painting: [SEASONAL_CAMPAIGN_SEQUENCE, PIPELINE_NURTURE_SEQUENCE],
    remodeling: [FINANCING_FOLLOWUP_SEQUENCE, PIPELINE_NURTURE_SEQUENCE],
    cleaning: [ONE_TIME_TO_RECURRING_SEQUENCE, CLEANING_HOLIDAY_PREP_SEQUENCE],
    pest_control: [PEST_QUARTERLY_SEQUENCE, SUBSCRIPTION_CONVERSION_SEQUENCE],
    window_cleaning: [SEASONAL_CAMPAIGN_SEQUENCE, ONE_TIME_TO_RECURRING_SEQUENCE],
    pool_service: [POOL_SEASONAL_OPENING_SEQUENCE, SUBSCRIPTION_CONVERSION_SEQUENCE],
    lawn_care: [SEASONAL_CAMPAIGN_SEQUENCE, CONTRACT_RENEWAL_SEQUENCE],
  }
  
  const specific = industrySpecific[industryId] || []
  
  // Combine and dedupe
  const combined = [...baseTemplates]
  specific.forEach(t => {
    if (!combined.find(bt => bt.id === t.id)) {
      combined.push(t)
    }
  })
  
  return combined
}

export function getIndustryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES.find(i => i.id === slug)
}

export function getBucketForIndustry(industryId: string): BusinessBucket | undefined {
  const industry = getIndustryBySlug(industryId)
  return industry?.bucket
}

export function getTemplateById(templateId: string): SequenceTemplate | undefined {
  return ALL_TEMPLATES.find(t => t.id === templateId)
}
