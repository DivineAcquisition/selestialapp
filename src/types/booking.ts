// ============================================================================
// BOOKING & CALENDAR TYPES FOR CLEANING SERVICES
// ============================================================================

export type BookingStatus = 
  | 'pending'      // Customer booked, awaiting confirmation
  | 'confirmed'    // Confirmed by business
  | 'in_progress'  // Currently being serviced
  | 'completed'    // Service finished
  | 'cancelled'    // Cancelled by customer or business
  | 'no_show'      // Customer was not available
  | 'rescheduled'; // Moved to different date/time

export type CleaningServiceType = 
  | 'standard'     // Regular maintenance cleaning
  | 'deep'         // Deep/intensive cleaning
  | 'move_in'      // Move-in cleaning
  | 'move_out'     // Move-out cleaning
  | 'post_construction' // Post-construction cleanup
  | 'airbnb'       // Vacation rental turnover
  | 'office'       // Commercial office cleaning
  | 'custom';      // Custom service

export type CleaningFrequency = 
  | 'one_time'
  | 'weekly'
  | 'bi_weekly'
  | 'monthly'
  | 'custom';

export type PaymentStatus = 
  | 'pending'
  | 'deposit_paid'
  | 'paid_in_full'
  | 'refunded'
  | 'failed';

// ============================================================================
// BOOKING
// ============================================================================

export interface Booking {
  id: string;
  business_id: string;
  booking_number: string;
  
  // Customer Info
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Service Details
  service_type: CleaningServiceType;
  service_name: string;
  frequency: CleaningFrequency;
  
  // Property Details
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number;
  property_type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'office' | 'other';
  has_pets: boolean;
  pet_details?: string;
  
  // Scheduling
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time_start: string; // HH:MM
  scheduled_time_end?: string;
  estimated_duration_minutes: number;
  
  // Staff Assignment
  assigned_staff_ids: string[];
  lead_staff_id?: string;
  
  // Add-ons
  addons: BookingAddon[];
  
  // Pricing
  base_price: number; // in cents
  addons_total: number;
  discount_amount: number;
  discount_code?: string;
  subtotal: number;
  tax_amount: number;
  total_price: number;
  deposit_amount: number;
  deposit_required: boolean;
  
  // Payment
  payment_status: PaymentStatus;
  deposit_paid: boolean;
  deposit_paid_at?: string;
  paid_in_full_at?: string;
  stripe_payment_intent_id?: string;
  
  // Status
  status: BookingStatus;
  confirmed_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  
  // Notes
  access_instructions?: string;
  special_requests?: string;
  internal_notes?: string;
  
  // Recurring
  is_recurring: boolean;
  recurring_parent_id?: string;
  recurring_schedule?: RecurringSchedule;
  
  // Source
  source: 'widget' | 'manual' | 'phone' | 'email' | 'referral' | 'repeat';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface BookingAddon {
  id: string;
  name: string;
  price: number; // in cents
  quantity: number;
}

export interface RecurringSchedule {
  frequency: CleaningFrequency;
  interval: number; // e.g., every 2 weeks
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  end_date?: string;
  occurrences?: number;
}

// ============================================================================
// STAFF
// ============================================================================

export interface Staff {
  id: string;
  business_id: string;
  user_id?: string;
  
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  
  role: 'cleaner' | 'lead' | 'manager' | 'admin';
  color: string; // For calendar display
  
  hourly_rate?: number; // in cents
  
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface StaffAvailability {
  id: string;
  staff_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string; // HH:MM
  end_time: string;
  is_available: boolean;
}

export interface StaffTimeOff {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
}

// ============================================================================
// CALENDAR
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'booking' | 'blocked' | 'time_off';
  status?: BookingStatus;
  color?: string;
  
  // Booking reference
  booking?: Booking;
  
  // Staff info
  staff_ids?: string[];
  
  // Location
  location?: string;
}

export interface BlockedTime {
  id: string;
  business_id: string;
  title: string;
  reason?: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  staff_id?: string; // null = all staff
  created_at: string;
}

// ============================================================================
// CLEANING SERVICE CONFIG
// ============================================================================

export interface CleaningService {
  id: string;
  business_id: string;
  name: string;
  type: CleaningServiceType;
  description: string;
  
  // Pricing
  base_price: number; // in cents
  price_per_bedroom: number;
  price_per_bathroom: number;
  price_per_sqft?: number;
  minimum_price: number;
  
  // Duration
  base_duration_minutes: number;
  duration_per_bedroom: number;
  duration_per_bathroom: number;
  
  // Display
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  
  created_at: string;
  updated_at: string;
}

export interface CleaningAddon {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number; // in cents
  duration_minutes: number;
  is_active: boolean;
  display_order: number;
}

// ============================================================================
// AVAILABILITY CONFIG
// ============================================================================

export interface BusinessHours {
  day_of_week: number;
  is_open: boolean;
  open_time: string; // HH:MM
  close_time: string;
}

export interface AvailabilitySettings {
  business_id: string;
  
  // Booking Window
  min_advance_hours: number; // Minimum hours before appointment
  max_advance_days: number; // Maximum days in advance
  
  // Buffer Times
  buffer_between_bookings: number; // Minutes between bookings
  
  // Slots
  slot_duration_minutes: number; // Time slot intervals
  slots_per_day_limit?: number;
  
  // Service Area
  service_zip_codes: string[];
  service_radius_miles?: number;
  
  // Business Hours
  business_hours: BusinessHours[];
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateBookingForm {
  // Customer
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Service
  service_type: CleaningServiceType;
  frequency: CleaningFrequency;
  
  // Property
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number;
  property_type: string;
  has_pets: boolean;
  pet_details?: string;
  
  // Schedule
  scheduled_date: string;
  scheduled_time_start: string;
  
  // Add-ons
  addon_ids: string[];
  
  // Notes
  access_instructions?: string;
  special_requests?: string;
  
  // Staff
  assigned_staff_ids?: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SERVICE_TYPE_LABELS: Record<CleaningServiceType, string> = {
  standard: 'Standard Clean',
  deep: 'Deep Clean',
  move_in: 'Move-In Clean',
  move_out: 'Move-Out Clean',
  post_construction: 'Post-Construction',
  airbnb: 'Airbnb/Vacation Rental',
  office: 'Office Clean',
  custom: 'Custom Service',
};

export const FREQUENCY_LABELS: Record<CleaningFrequency, string> = {
  one_time: 'One Time',
  weekly: 'Weekly',
  bi_weekly: 'Bi-Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

export const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  in_progress: { label: 'In Progress', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
  no_show: { label: 'No Show', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  rescheduled: { label: 'Rescheduled', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

export const DEFAULT_ADDONS: Omit<CleaningAddon, 'id' | 'business_id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Inside Fridge', description: 'Deep clean inside refrigerator', price: 3500, duration_minutes: 20, is_active: true, display_order: 1 },
  { name: 'Inside Oven', description: 'Deep clean inside oven', price: 3500, duration_minutes: 25, is_active: true, display_order: 2 },
  { name: 'Inside Cabinets', description: 'Clean inside kitchen cabinets', price: 5000, duration_minutes: 30, is_active: true, display_order: 3 },
  { name: 'Laundry (Wash & Fold)', description: 'One load wash and fold', price: 2500, duration_minutes: 15, is_active: true, display_order: 4 },
  { name: 'Interior Windows', description: 'Clean interior windows', price: 4000, duration_minutes: 30, is_active: true, display_order: 5 },
  { name: 'Garage Sweep', description: 'Sweep and organize garage', price: 5000, duration_minutes: 30, is_active: true, display_order: 6 },
  { name: 'Patio/Balcony', description: 'Clean outdoor patio or balcony', price: 3000, duration_minutes: 20, is_active: true, display_order: 7 },
  { name: 'Dishes', description: 'Wash and put away dishes', price: 2000, duration_minutes: 15, is_active: true, display_order: 8 },
];
