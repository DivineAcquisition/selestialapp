export type IndustryType = 
  | 'hvac' 
  | 'plumbing' 
  | 'electrical' 
  | 'roofing' 
  | 'cleaning' 
  | 'landscaping'
  | 'general_contractor'
  | 'other';

export type QuoteStatus = 
  | 'new'
  | 'active'
  | 'paused'
  | 'won'
  | 'lost'
  | 'no_response';

export type MessageChannel = 'sms' | 'email';

export interface Business {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  industry: IndustryType;
  timezone: string;
  default_sequence_id?: string;
  auto_start_sequence: boolean;
}

export interface Quote {
  id: string;
  created_at: string;
  updated_at: string;
  business_id: string;
  sequence_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_type: string;
  quote_amount: number;
  description?: string;
  status: QuoteStatus;
  status_changed_at: string;
  current_step_index: number;
  next_message_at?: string;
  won_at?: string;
  lost_at?: string;
  lost_reason?: string;
  final_job_amount?: number;
}

export interface SequenceStep {
  id: string;
  order: number;
  delay_days: number;
  delay_hours: number;
  channel: MessageChannel;
  subject?: string;
  message: string;
  is_active: boolean;
}

export interface Sequence {
  id: string;
  created_at: string;
  updated_at: string;
  business_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  steps: SequenceStep[];
}

export interface Message {
  id: string;
  created_at: string;
  quote_id: string;
  channel: MessageChannel;
  content: string;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
}

export interface ActivityLog {
  id: string;
  created_at: string;
  action: string;
  description: string;
  quote_id?: string;
}
