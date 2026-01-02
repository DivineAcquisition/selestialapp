export const INDUSTRIES = [
  // Phase 1 Industries
  { value: 'hvac', label: 'HVAC', urgency: 'high' },
  { value: 'plumbing', label: 'Plumbing', urgency: 'emergency' },
  { value: 'electrical', label: 'Electrical', urgency: 'high' },
  { value: 'residential_cleaning', label: 'Residential Cleaning', urgency: 'standard' },
  { value: 'commercial_cleaning', label: 'Commercial Cleaning', urgency: 'standard' },
  { value: 'lawn_care', label: 'Lawn Care', urgency: 'standard' },
  { value: 'pest_control', label: 'Pest Control', urgency: 'high' },
  { value: 'carpet_cleaning', label: 'Carpet Cleaning', urgency: 'standard' },
  // Phase 2 Industries
  { value: 'painting', label: 'Painting', urgency: 'patient' },
  { value: 'roofing', label: 'Roofing', urgency: 'patient' },
  { value: 'pool_service', label: 'Pool Service', urgency: 'standard' },
  { value: 'moving', label: 'Moving', urgency: 'high' },
  { value: 'window_cleaning', label: 'Window Cleaning', urgency: 'patient' },
  { value: 'junk_removal', label: 'Junk Removal', urgency: 'high' },
  { value: 'garage_door', label: 'Garage Door', urgency: 'high' },
  { value: 'pressure_washing', label: 'Pressure Washing', urgency: 'standard' },
  { value: 'general_contractor', label: 'General Contractor', urgency: 'patient' },
  { value: 'other', label: 'Other', urgency: 'standard' },
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
  // Phase 1
  hvac: ['AC Repair', 'AC Installation', 'Heating Repair', 'Furnace Install', 'Duct Cleaning', 'Maintenance', 'Other'],
  plumbing: ['Drain Cleaning', 'Water Heater', 'Pipe Repair', 'Fixture Install', 'Sewer Line', 'Repiping', 'Other'],
  electrical: ['Panel Upgrade', 'Outlet Install', 'Lighting', 'Wiring Repair', 'EV Charger', 'Generator', 'Other'],
  residential_cleaning: ['Deep Clean', 'Regular Clean', 'Move In/Out', 'Post-Construction', 'Other'],
  commercial_cleaning: ['Office Cleaning', 'Retail Space', 'Medical Facility', 'Post-Construction', 'Other'],
  lawn_care: ['Weekly Mowing', 'Landscaping', 'Tree Service', 'Irrigation', 'Seasonal Cleanup', 'Other'],
  pest_control: ['General Pest', 'Termites', 'Rodents', 'Bed Bugs', 'Wildlife', 'Prevention Plan', 'Other'],
  carpet_cleaning: ['Whole House', 'Room Cleaning', 'Stain Removal', 'Pet Treatment', 'Commercial', 'Other'],
  // Phase 2
  painting: ['Interior - Single Room', 'Interior - Whole House', 'Exterior', 'Cabinet Painting', 'Deck/Fence Staining', 'Commercial', 'Other'],
  roofing: ['Roof Inspection', 'Roof Repair', 'Shingle Replacement', 'Full Replacement', 'Gutter Work', 'Emergency Tarp', 'Other'],
  pool_service: ['Weekly Service', 'Bi-Weekly Service', 'Pool Opening', 'Pool Closing', 'Green Pool Cleanup', 'Equipment Repair', 'Other'],
  moving: ['Local Move - Studio/1BR', 'Local Move - 2-3BR', 'Local Move - 4+BR', 'Long Distance', 'Packing Services', 'Commercial', 'Other'],
  window_cleaning: ['Interior Windows', 'Exterior Windows', 'Interior + Exterior', 'Screen Cleaning', 'Commercial', 'Other'],
  junk_removal: ['Single Item', 'Partial Load', 'Full Truck Load', 'Garage Cleanout', 'Estate Cleanout', 'Yard Waste', 'Other'],
  garage_door: ['Spring Replacement', 'Opener Repair', 'Opener Installation', 'Full Door Replacement', 'Tune-Up', 'Emergency', 'Other'],
  pressure_washing: ['Driveway', 'Patio/Deck', 'House Washing', 'Roof Soft Wash', 'Fence', 'Commercial', 'Other'],
  general_contractor: ['Remodel', 'Addition', 'Repair', 'New Construction', 'Other'],
  other: ['Consultation', 'Repair', 'Installation', 'Maintenance', 'Other'],
};

export const MERGE_FIELDS = [
  { key: '{{customer_name}}', label: 'Customer Name', example: 'Sarah Williams' },
  { key: '{{customer_first_name}}', label: 'First Name', example: 'Sarah' },
  { key: '{{business_name}}', label: 'Business Name', example: 'Johnson Plumbing' },
  { key: '{{owner_name}}', label: 'Owner Name', example: 'Mike' },
  { key: '{{quote_amount}}', label: 'Quote Amount', example: '$2,500' },
  { key: '{{service_type}}', label: 'Service Type', example: 'Water Heater Install' },
  { key: '{{business_phone}}', label: 'Business Phone', example: '(555) 123-4567' },
] as const;

export const LOST_REASONS = [
  { value: 'went_with_competitor', label: 'Went with competitor' },
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'project_cancelled', label: 'Project cancelled' },
  { value: 'no_response', label: 'Never responded' },
  { value: 'timing', label: 'Bad timing' },
  { value: 'other', label: 'Other' },
] as const;

export const DEFAULT_SEQUENCE_STEPS = [
  {
    delay_days: 0,
    delay_hours: 0,
    channel: 'sms' as const,
    message: "Hi {{customer_first_name}}, this is {{owner_name}} from {{business_name}}. Thanks for letting us quote your {{service_type}} project! Let me know if you have any questions.",
  },
  {
    delay_days: 1,
    delay_hours: 0,
    channel: 'sms' as const,
    message: "Hey {{customer_first_name}}, just checking in on that quote for {{quote_amount}}. Ready to get started? We can usually schedule within a few days!",
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
