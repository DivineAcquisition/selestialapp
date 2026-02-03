// ============================================================================
// Extended Supabase Types for Cleaning Business Tables
// These types extend the generated types.ts with new tables
// Run `supabase gen types typescript` after applying migrations to regenerate
// ============================================================================

import type { Database as GeneratedDatabase, Json } from './types';

// ============================================================================
// NEW TABLE TYPES
// ============================================================================

export interface CleaningBookingRow {
  id: string;
  business_id: string;
  booking_number: string;
  
  // Customer
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  
  // Service
  service_type: string;
  service_name: string | null;
  frequency_name: string | null;
  
  // Property
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  property_type: string | null;
  has_pets: boolean;
  pet_details: string | null;
  
  // Scheduling
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string | null;
  estimated_duration_minutes: number;
  
  // Staff
  assigned_staff_ids: string[];
  lead_staff_id: string | null;
  
  // Add-ons
  addons: Json;
  
  // Pricing
  base_price: number;
  addons_total: number;
  discount_amount: number;
  discount_code: string | null;
  subtotal: number;
  tax_amount: number;
  total_price: number;
  deposit_amount: number;
  deposit_required: boolean;
  
  // Payment
  payment_status: string;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  paid_in_full_at: string | null;
  stripe_payment_intent_id: string | null;
  
  // Status
  status: string;
  confirmed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  
  // Notes
  access_instructions: string | null;
  special_requests: string | null;
  internal_notes: string | null;
  
  // Recurring
  is_recurring: boolean;
  recurring_parent_id: string | null;
  recurring_schedule: Json | null;
  
  // Source
  source: string;
  google_event_id: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CleaningBookingInsert {
  id?: string;
  business_id: string;
  booking_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  service_type?: string;
  service_name?: string | null;
  frequency_name?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number | null;
  property_type?: string | null;
  has_pets?: boolean;
  pet_details?: string | null;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end?: string | null;
  estimated_duration_minutes?: number;
  assigned_staff_ids?: string[];
  lead_staff_id?: string | null;
  addons?: Json;
  base_price?: number;
  addons_total?: number;
  discount_amount?: number;
  discount_code?: string | null;
  subtotal?: number;
  tax_amount?: number;
  total_price: number;
  deposit_amount?: number;
  deposit_required?: boolean;
  payment_status?: string;
  deposit_paid?: boolean;
  status?: string;
  access_instructions?: string | null;
  special_requests?: string | null;
  internal_notes?: string | null;
  is_recurring?: boolean;
  recurring_parent_id?: string | null;
  recurring_schedule?: Json | null;
  source?: string;
  google_event_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StaffMemberRow {
  id: string;
  business_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  color: string;
  is_active: boolean;
  hourly_rate: number | null;
  availability: Json;
  created_at: string;
  updated_at: string;
}

export interface StaffMemberInsert {
  id?: string;
  business_id: string;
  user_id?: string | null;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string;
  color?: string;
  is_active?: boolean;
  hourly_rate?: number | null;
  availability?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface StaffAvailabilityRow {
  id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface StaffAvailabilityInsert {
  id?: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
  created_at?: string;
}

export interface AvailabilitySettingsRow {
  id: string;
  business_id: string;
  min_advance_hours: number;
  max_advance_days: number;
  buffer_between_bookings: number;
  slot_duration_minutes: number;
  slots_per_day_limit: number | null;
  service_zip_codes: string[];
  service_radius_miles: number | null;
  business_hours: Json;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySettingsInsert {
  id?: string;
  business_id: string;
  min_advance_hours?: number;
  max_advance_days?: number;
  buffer_between_bookings?: number;
  slot_duration_minutes?: number;
  slots_per_day_limit?: number | null;
  service_zip_codes?: string[];
  service_radius_miles?: number | null;
  business_hours?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface CleaningServiceRow {
  id: string;
  business_id: string;
  name: string;
  type: string;
  description: string | null;
  base_price: number;
  price_per_bedroom: number;
  price_per_bathroom: number;
  price_per_sqft: number | null;
  minimum_price: number;
  base_duration_minutes: number;
  duration_per_bedroom: number;
  duration_per_bathroom: number;
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CleaningAddonRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConnectionRow {
  id: string;
  business_id: string;
  integration_type: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  account_email: string | null;
  account_name: string | null;
  account_id: string | null;
  is_active: boolean;
  connected_at: string;
  last_sync_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface CalendarBlockedTimeRow {
  id: string;
  business_id: string;
  title: string;
  reason: string | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// EXTENDED DATABASE TYPE
// ============================================================================

export interface ExtendedTables {
  cleaning_bookings: {
    Row: CleaningBookingRow;
    Insert: CleaningBookingInsert;
    Update: Partial<CleaningBookingInsert>;
    Relationships: [];
  };
  staff_members: {
    Row: StaffMemberRow;
    Insert: StaffMemberInsert;
    Update: Partial<StaffMemberInsert>;
    Relationships: [];
  };
  staff_availability: {
    Row: StaffAvailabilityRow;
    Insert: StaffAvailabilityInsert;
    Update: Partial<StaffAvailabilityInsert>;
    Relationships: [];
  };
  availability_settings: {
    Row: AvailabilitySettingsRow;
    Insert: AvailabilitySettingsInsert;
    Update: Partial<AvailabilitySettingsInsert>;
    Relationships: [];
  };
  cleaning_services: {
    Row: CleaningServiceRow;
    Insert: Partial<CleaningServiceRow>;
    Update: Partial<CleaningServiceRow>;
    Relationships: [];
  };
  cleaning_addons: {
    Row: CleaningAddonRow;
    Insert: Partial<CleaningAddonRow>;
    Update: Partial<CleaningAddonRow>;
    Relationships: [];
  };
  integration_connections: {
    Row: IntegrationConnectionRow;
    Insert: Partial<IntegrationConnectionRow>;
    Update: Partial<IntegrationConnectionRow>;
    Relationships: [];
  };
  calendar_blocked_times: {
    Row: CalendarBlockedTimeRow;
    Insert: Partial<CalendarBlockedTimeRow>;
    Update: Partial<CalendarBlockedTimeRow>;
    Relationships: [];
  };
}

// Merge with generated types
export type ExtendedDatabase = GeneratedDatabase & {
  public: GeneratedDatabase['public'] & {
    Tables: GeneratedDatabase['public']['Tables'] & ExtendedTables;
  };
};

// Re-export for convenience
export type { Json } from './types';
export type { Database } from './types';
