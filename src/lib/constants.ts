// ============================================================================
// CLEANING BUSINESS FOCUSED CONSTANTS
// ============================================================================

export const INDUSTRIES = [
  { value: 'residential_cleaning', label: 'Residential Cleaning', urgency: 'standard' },
  { value: 'commercial_cleaning', label: 'Commercial Cleaning', urgency: 'standard' },
  { value: 'carpet_cleaning', label: 'Carpet Cleaning', urgency: 'standard' },
  { value: 'window_cleaning', label: 'Window Cleaning', urgency: 'standard' },
  { value: 'pressure_washing', label: 'Pressure Washing', urgency: 'standard' },
] as const;

export const QUOTE_STATUSES = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'active', label: 'Active', color: 'amber' },
  { value: 'paused', label: 'Paused', color: 'gray' },
  { value: 'won', label: 'Won', color: 'emerald' },
  { value: 'lost', label: 'Lost', color: 'red' },
  { value: 'no_response', label: 'No Response', color: 'slate' },
] as const;

export const SERVICE_TYPES: Record<string, string[]> = {
  // Residential Cleaning Services
  residential_cleaning: [
    'Standard Clean',
    'Deep Clean',
    'Move In/Out Clean',
    'Post-Construction',
    'Airbnb/Vacation Rental',
    'Spring Clean',
    'Holiday Prep',
    'Other',
  ],
  // Commercial Cleaning Services
  commercial_cleaning: [
    'Office Cleaning',
    'Retail Space',
    'Medical Facility',
    'Restaurant/Kitchen',
    'Post-Construction',
    'Industrial',
    'Other',
  ],
  // Carpet & Upholstery
  carpet_cleaning: [
    'Whole House',
    'Room Cleaning',
    'Stain Removal',
    'Pet Treatment',
    'Upholstery',
    'Area Rugs',
    'Commercial',
    'Other',
  ],
  // Window Cleaning
  window_cleaning: [
    'Interior Windows',
    'Exterior Windows',
    'Interior + Exterior',
    'Screen Cleaning',
    'Storm Windows',
    'Commercial',
    'Other',
  ],
  // Pressure Washing
  pressure_washing: [
    'Driveway',
    'Patio/Deck',
    'House Washing',
    'Roof Soft Wash',
    'Fence',
    'Sidewalks',
    'Commercial',
    'Other',
  ],
};

// Cleaning-specific add-ons
export const CLEANING_ADDONS = [
  { id: 'fridge', name: 'Inside Fridge', price: 35, duration: 20 },
  { id: 'oven', name: 'Inside Oven', price: 35, duration: 25 },
  { id: 'cabinets', name: 'Inside Cabinets', price: 50, duration: 30 },
  { id: 'laundry', name: 'Laundry (Wash & Fold)', price: 25, duration: 15 },
  { id: 'windows', name: 'Interior Windows', price: 40, duration: 30 },
  { id: 'garage', name: 'Garage Sweep', price: 50, duration: 30 },
  { id: 'patio', name: 'Patio/Balcony', price: 30, duration: 20 },
  { id: 'dishes', name: 'Dishes', price: 20, duration: 15 },
  { id: 'baseboards', name: 'Baseboards Detail', price: 45, duration: 30 },
  { id: 'blinds', name: 'Blinds/Shutters', price: 35, duration: 25 },
  { id: 'walls', name: 'Wall Washing', price: 60, duration: 40 },
  { id: 'organizing', name: 'Light Organizing', price: 50, duration: 30 },
] as const;

// Property types for cleaning
export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail Space' },
  { value: 'airbnb', label: 'Airbnb/Vacation Rental' },
  { value: 'other', label: 'Other' },
] as const;

// Cleaning frequencies
export const CLEANING_FREQUENCIES = [
  { value: 'one_time', label: 'One Time', discount: 0 },
  { value: 'weekly', label: 'Weekly', discount: 20 },
  { value: 'bi_weekly', label: 'Bi-Weekly (Every 2 Weeks)', discount: 15 },
  { value: 'monthly', label: 'Monthly', discount: 10 },
] as const;

export const MERGE_FIELDS = [
  { key: '{{customer_name}}', label: 'Customer Name', example: 'Sarah Williams' },
  { key: '{{customer_first_name}}', label: 'First Name', example: 'Sarah' },
  { key: '{{business_name}}', label: 'Business Name', example: 'Sparkle Clean Co.' },
  { key: '{{owner_name}}', label: 'Owner Name', example: 'Mike' },
  { key: '{{quote_amount}}', label: 'Quote Amount', example: '$180' },
  { key: '{{service_type}}', label: 'Service Type', example: 'Deep Clean' },
  { key: '{{business_phone}}', label: 'Business Phone', example: '(555) 123-4567' },
  { key: '{{booking_date}}', label: 'Booking Date', example: 'Tuesday, Feb 10' },
  { key: '{{booking_time}}', label: 'Booking Time', example: '9:00 AM' },
  { key: '{{address}}', label: 'Service Address', example: '123 Main St' },
] as const;

export const LOST_REASONS = [
  { value: 'went_with_competitor', label: 'Went with competitor' },
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'project_cancelled', label: 'No longer needed' },
  { value: 'no_response', label: 'Never responded' },
  { value: 'timing', label: 'Bad timing' },
  { value: 'diy', label: 'Doing it themselves' },
  { value: 'other', label: 'Other' },
] as const;

export const DEFAULT_SEQUENCE_STEPS = [
  {
    delay_days: 0,
    delay_hours: 0,
    channel: 'sms' as const,
    message: "Hi {{customer_first_name}}, this is {{owner_name}} from {{business_name}}. Thanks for requesting a cleaning quote! Let me know if you have any questions about the {{quote_amount}} estimate.",
  },
  {
    delay_days: 1,
    delay_hours: 0,
    channel: 'sms' as const,
    message: "Hey {{customer_first_name}}, just checking in on that cleaning quote for {{quote_amount}}. Ready to get your home sparkling? We can usually schedule within a few days!",
  },
  {
    delay_days: 3,
    delay_hours: 0,
    channel: 'sms' as const,
    message: "Hi {{customer_first_name}}, wanted to follow up on your {{service_type}} quote. Any questions I can help with?",
  },
  {
    delay_days: 7,
    delay_hours: 0,
    channel: 'sms' as const,
    message: "{{customer_first_name}}, still thinking it over? No pressure - just want to make sure you have everything you need. Reply anytime!",
  },
  {
    delay_days: 14,
    delay_hours: 0,
    channel: 'sms' as const,
    message: "Last check-in on your {{service_type}} quote! If now isn't the right time, totally understand. We'll be here whenever you're ready. - {{owner_name}}",
  },
];

// Booking status colors for calendar
export const BOOKING_STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  no_show: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  rescheduled: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
} as const;
