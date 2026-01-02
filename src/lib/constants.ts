export const INDUSTRIES = [
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'general_contractor', label: 'General Contractor' },
  { value: 'other', label: 'Other' },
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
  hvac: ['AC Repair', 'AC Installation', 'Heating Repair', 'Furnace Install', 'Duct Cleaning', 'Maintenance', 'Other'],
  plumbing: ['Drain Cleaning', 'Water Heater', 'Pipe Repair', 'Fixture Install', 'Sewer Line', 'Repiping', 'Other'],
  electrical: ['Panel Upgrade', 'Outlet Install', 'Lighting', 'Wiring Repair', 'EV Charger', 'Generator', 'Other'],
  roofing: ['Roof Repair', 'Full Replacement', 'Inspection', 'Gutter Install', 'Leak Repair', 'Other'],
  cleaning: ['Deep Clean', 'Regular Clean', 'Move In/Out', 'Post-Construction', 'Commercial', 'Other'],
  landscaping: ['Lawn Care', 'Hardscape', 'Tree Service', 'Irrigation', 'Design', 'Maintenance', 'Other'],
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
