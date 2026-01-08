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
// TEMPLATE COLLECTIONS
// ============================================================================

export const ALL_TEMPLATES: SequenceTemplate[] = [
  // Emergency
  SPEED_TO_LEAD_SEQUENCE,
  MISSED_CALL_RECOVERY_SEQUENCE,
  AFTER_HOURS_SEQUENCE,
  // Scheduled
  QUOTE_FOLLOWUP_SEQUENCE,
  ESTIMATE_EXPIRY_SEQUENCE,
  PIPELINE_NURTURE_SEQUENCE,
  // Recurring
  REBOOKING_REMINDER_SEQUENCE,
  AT_RISK_INTERVENTION_SEQUENCE,
  REACTIVATION_SEQUENCE,
  // Universal
  BOOKING_REMINDER_SEQUENCE,
  REVIEW_REQUEST_SEQUENCE,
  REFERRAL_REQUEST_SEQUENCE,
  WIN_BACK_SEQUENCE,
]

export const TEMPLATES_BY_BUCKET = {
  emergency: [
    SPEED_TO_LEAD_SEQUENCE,
    MISSED_CALL_RECOVERY_SEQUENCE,
    AFTER_HOURS_SEQUENCE,
    BOOKING_REMINDER_SEQUENCE,
    REVIEW_REQUEST_SEQUENCE,
    WIN_BACK_SEQUENCE,
  ],
  scheduled: [
    QUOTE_FOLLOWUP_SEQUENCE,
    ESTIMATE_EXPIRY_SEQUENCE,
    PIPELINE_NURTURE_SEQUENCE,
    BOOKING_REMINDER_SEQUENCE,
    REVIEW_REQUEST_SEQUENCE,
    REFERRAL_REQUEST_SEQUENCE,
    WIN_BACK_SEQUENCE,
  ],
  recurring: [
    REBOOKING_REMINDER_SEQUENCE,
    AT_RISK_INTERVENTION_SEQUENCE,
    REACTIVATION_SEQUENCE,
    BOOKING_REMINDER_SEQUENCE,
    REVIEW_REQUEST_SEQUENCE,
    REFERRAL_REQUEST_SEQUENCE,
    WIN_BACK_SEQUENCE,
  ],
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTemplatesForBucket(bucket: BusinessBucket): SequenceTemplate[] {
  return TEMPLATES_BY_BUCKET[bucket] || []
}

export function getRecommendedWorkflows(businessType: BusinessBucket): string[] {
  const base = ['booking_reminder', 'review_request']
  
  switch (businessType) {
    case 'emergency':
      return ['speed_to_lead', 'missed_call_recovery', 'after_hours', ...base]
    case 'scheduled':
      return ['quote_followup', 'pipeline_nurture', 'estimate_expiry', ...base]
    case 'recurring':
      return ['rebooking_reminder', 'at_risk_intervention', 'reactivation', ...base]
    default:
      return base
  }
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
