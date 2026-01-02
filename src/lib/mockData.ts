import { Business, Quote, Sequence, ActivityLog } from '@/types';
import { generateId } from './formatters';

export const mockBusiness: Business = {
  id: '1',
  name: 'Johnson Plumbing LLC',
  owner_name: 'Mike Johnson',
  phone: '+15551234567',
  email: 'mike@johnsonplumbing.com',
  industry: 'plumbing',
  timezone: 'America/New_York',
  auto_start_sequence: true,
};

export const mockQuotes: Quote[] = [
  {
    id: '1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    business_id: '1',
    customer_name: 'Sarah Williams',
    customer_phone: '+15559876543',
    customer_email: 'sarah@email.com',
    service_type: 'Water Heater Install',
    quote_amount: 250000,
    status: 'new',
    status_changed_at: new Date().toISOString(),
    current_step_index: 0,
  },
  {
    id: '2',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    business_id: '1',
    customer_name: 'Robert Chen',
    customer_phone: '+15551112222',
    service_type: 'Drain Cleaning',
    quote_amount: 35000,
    status: 'active',
    status_changed_at: new Date().toISOString(),
    current_step_index: 1,
    next_message_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    business_id: '1',
    customer_name: 'Jennifer Adams',
    customer_phone: '+15553334444',
    customer_email: 'jen@email.com',
    service_type: 'Pipe Repair',
    quote_amount: 85000,
    status: 'active',
    status_changed_at: new Date().toISOString(),
    current_step_index: 2,
    next_message_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    business_id: '1',
    customer_name: 'Michael Torres',
    customer_phone: '+15555556666',
    service_type: 'Water Heater Install',
    quote_amount: 320000,
    status: 'won',
    status_changed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    current_step_index: 3,
    won_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    final_job_amount: 320000,
  },
  {
    id: '5',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    business_id: '1',
    customer_name: 'Lisa Park',
    customer_phone: '+15557778888',
    service_type: 'Fixture Install',
    quote_amount: 45000,
    status: 'lost',
    status_changed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    current_step_index: 4,
    lost_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lost_reason: 'went_with_competitor',
  },
  {
    id: '6',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    business_id: '1',
    customer_name: 'David Brown',
    customer_phone: '+15559990000',
    service_type: 'Sewer Line',
    quote_amount: 480000,
    status: 'no_response',
    status_changed_at: new Date().toISOString(),
    current_step_index: 5,
  },
];

export const mockSequences: Sequence[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    business_id: '1',
    name: 'Standard Follow-Up',
    description: '5-touch sequence over 14 days',
    is_active: true,
    is_default: true,
    steps: [
      {
        id: 's1',
        order: 0,
        delay_days: 0,
        delay_hours: 0,
        channel: 'sms',
        message: "Hi {{customer_first_name}}, this is {{owner_name}} from {{business_name}}. Thanks for letting us quote your {{service_type}} project! Let me know if you have any questions.",
        is_active: true,
      },
      {
        id: 's2',
        order: 1,
        delay_days: 1,
        delay_hours: 0,
        channel: 'sms',
        message: "Hey {{customer_first_name}}, just checking in on that quote for {{quote_amount}}. Ready to get started? We can usually schedule within a few days!",
        is_active: true,
      },
      {
        id: 's3',
        order: 2,
        delay_days: 3,
        delay_hours: 0,
        channel: 'sms',
        message: "Hi {{customer_first_name}}, wanted to follow up on your {{service_type}} quote. Any questions I can help with?",
        is_active: true,
      },
      {
        id: 's4',
        order: 3,
        delay_days: 7,
        delay_hours: 0,
        channel: 'sms',
        message: "{{customer_first_name}}, still thinking it over? No pressure - just want to make sure you have everything you need. Reply anytime!",
        is_active: true,
      },
      {
        id: 's5',
        order: 4,
        delay_days: 14,
        delay_hours: 0,
        channel: 'sms',
        message: "Last check-in on your {{service_type}} quote! If now isn't the right time, totally understand. We'll be here whenever you're ready. - {{owner_name}}",
        is_active: true,
      },
    ],
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    business_id: '1',
    name: 'Aggressive Follow-Up',
    description: '7-touch sequence over 10 days for high-value quotes',
    is_active: true,
    is_default: false,
    steps: [
      {
        id: 'a1',
        order: 0,
        delay_days: 0,
        delay_hours: 0,
        channel: 'sms',
        message: "Hi {{customer_first_name}}, {{owner_name}} here from {{business_name}}. Just sent over your {{service_type}} quote for {{quote_amount}}. Any questions?",
        is_active: true,
      },
      {
        id: 'a2',
        order: 1,
        delay_days: 0,
        delay_hours: 4,
        channel: 'sms',
        message: "Quick follow-up - we have availability this week if you'd like to get your {{service_type}} project scheduled!",
        is_active: true,
      },
      {
        id: 'a3',
        order: 2,
        delay_days: 1,
        delay_hours: 0,
        channel: 'sms',
        message: "Hey {{customer_first_name}}, checking in on that quote. Would love to earn your business - any concerns I can address?",
        is_active: true,
      },
    ],
  },
];

export const mockActivities: ActivityLog[] = [
  {
    id: '1',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    action: 'quote_created',
    description: 'New quote added for Sarah Williams - $2,500',
    quote_id: '1',
  },
  {
    id: '2',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action: 'message_sent',
    description: 'Follow-up SMS sent to Robert Chen',
    quote_id: '2',
  },
  {
    id: '3',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    action: 'message_delivered',
    description: 'SMS delivered to Jennifer Adams',
    quote_id: '3',
  },
  {
    id: '4',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'status_won',
    description: 'Quote marked as Won - Michael Torres - $3,200',
    quote_id: '4',
  },
  {
    id: '5',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'status_lost',
    description: 'Quote marked as Lost - Lisa Park - Went with competitor',
    quote_id: '5',
  },
  {
    id: '6',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'sequence_completed',
    description: 'Follow-up sequence completed for David Brown - No response',
    quote_id: '6',
  },
];

export function getQuotesByStatus(status: string): Quote[] {
  return mockQuotes.filter(q => q.status === status);
}

export function getDashboardStats() {
  const activeQuotes = mockQuotes.filter(q => ['new', 'active'].includes(q.status)).length;
  const wonQuotes = mockQuotes.filter(q => q.status === 'won');
  const wonAmount = wonQuotes.reduce((sum, q) => sum + (q.final_job_amount || q.quote_amount), 0);
  const totalQuotes = mockQuotes.length;
  const conversionRate = totalQuotes > 0 ? Math.round((wonQuotes.length / totalQuotes) * 100) : 0;
  
  return {
    activeQuotes,
    wonAmount,
    wonCount: wonQuotes.length,
    conversionRate,
    revenueRecovered: wonAmount,
  };
}
