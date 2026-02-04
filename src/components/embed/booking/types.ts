// Booking Widget Types
// Highly configurable type system for customizable booking flows

export interface BookingWidgetTheme {
  // Brand colors
  primaryColor: string;
  primaryHoverColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  
  // Background gradients
  heroGradient: string;
  primaryGradient: string;
  
  // Typography
  headingFont: string;
  bodyFont: string;
  
  // Border radius
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  // Shadows
  cardShadow: string;
  buttonShadow: string;
}

export interface BookingWidgetBranding {
  businessName: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  showRating: boolean;
  ratingValue: number;
  reviewCount: number;
}

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  features: string[];
  basePrice: number;
  discountPrice?: number;
  discountPercent?: number;
  badge?: string;
  badgeColor?: 'primary' | 'success' | 'warning' | 'amber';
  popular?: boolean;
  enabled: boolean;
}

export interface HomeSizeOption {
  id: string;
  label: string;
  sqftRange: string;
  bedroomRange: string;
  basePrice: number;
  estimatedHours: number;
}

export interface AddOnOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  icon?: string;
  enabled: boolean;
}

export interface FrequencyOption {
  id: string;
  label: string;
  discountPercent: number;
  description?: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  period: 'morning' | 'afternoon' | 'evening';
}

export interface TrustBadge {
  id: string;
  type: string;
  label: string;
  sublabel?: string;
  enabled: boolean;
}

export interface PromoConfig {
  enabled: boolean;
  headline: string;
  subheadline?: string;
  discountPercent?: number;
  expiryDate?: string;
  badgeText?: string;
}

export interface BookingWidgetConfig {
  // Basic
  id: string;
  businessId: string;
  name: string;
  status: 'draft' | 'active' | 'paused';
  
  // Branding
  branding: BookingWidgetBranding;
  theme: BookingWidgetTheme;
  
  // Flow configuration
  flowSteps: BookingFlowStep[];
  
  // Options
  services: ServiceOption[];
  homeSizes: HomeSizeOption[];
  addOns: AddOnOption[];
  frequencies: FrequencyOption[];
  timeSlots: TimeSlot[];
  trustBadges: TrustBadge[];
  
  // Promo
  promo: PromoConfig;
  
  // Payment
  depositPercent: number;
  minimumPrice: number;
  acceptDeposit: boolean;
  acceptFullPayment: boolean;
  fullPaymentDiscount?: number;
  
  // Service area
  serviceZipCodes: string[];
  waitlistEnabled: boolean;
  
  // Contact capture
  captureContactFirst: boolean;
  requirePhone: boolean;
  requireEmail: boolean;
}

export type BookingFlowStep = 
  | 'zip'
  | 'contact'
  | 'home-size'
  | 'service'
  | 'addons'
  | 'schedule'
  | 'checkout'
  | 'details'
  | 'confirmation';

export interface BookingData {
  // Location
  zipCode: string;
  inServiceArea: boolean;
  cityState?: string;
  
  // Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Property
  homeSizeId: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  dwellingType?: string;
  flooringType?: string;
  hasPets?: boolean;
  petType?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  
  // Service
  serviceId: string;
  serviceType: 'one-time' | 'recurring';
  frequencyId?: string;
  addOns: string[];
  
  // Schedule
  serviceDate: string;
  timeSlot: string;
  startTime?: string;
  endTime?: string;
  
  // Payment
  paymentOption: 'deposit' | 'full';
  promoCode?: string;
  referralCode?: string;
  
  // Meta
  bookingId?: string;
  customerId?: string;
  
  // Calculated
  subtotal: number;
  discount: number;
  deposit: number;
  total: number;
  balanceDue: number;
}

export interface BookingContextValue {
  // Config (read-only from provider)
  config: BookingWidgetConfig;
  
  // Booking state
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  resetBookingData: () => void;
  
  // Step navigation
  currentStep: number;
  currentStepId: BookingFlowStep;
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  
  // Computed values
  totalSteps: number;
  progressPercent: number;
  
  // Loading states
  isLoading: boolean;
  isProcessing: boolean;
  
  // Errors
  error: string | null;
  setError: (error: string | null) => void;
}

// Default configurations
export const DEFAULT_THEME: BookingWidgetTheme = {
  primaryColor: '#6366f1',
  primaryHoverColor: '#4f46e5',
  accentColor: '#a78bfa',
  successColor: '#10b981',
  warningColor: '#f59e0b',
  heroGradient: 'linear-gradient(180deg, #ffffff, #f5f3ff)',
  primaryGradient: 'linear-gradient(135deg, #6366f1, #a78bfa)',
  headingFont: '"Plus Jakarta Sans", system-ui, sans-serif',
  bodyFont: '"Inter", system-ui, sans-serif',
  borderRadius: 'xl',
  cardShadow: '0 2px 12px rgba(99, 102, 241, 0.08)',
  buttonShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
};

export const DEFAULT_HOME_SIZES: HomeSizeOption[] = [
  { id: 'small', label: 'Small', sqftRange: 'Under 1,000 sq ft', bedroomRange: 'Studio - 1 bed', basePrice: 129, estimatedHours: 2 },
  { id: 'medium', label: 'Medium', sqftRange: '1,000 - 2,000 sq ft', bedroomRange: '2 - 3 bed', basePrice: 179, estimatedHours: 3 },
  { id: 'large', label: 'Large', sqftRange: '2,000 - 3,000 sq ft', bedroomRange: '3 - 4 bed', basePrice: 249, estimatedHours: 4 },
  { id: 'xlarge', label: 'X-Large', sqftRange: '3,000 - 4,000 sq ft', bedroomRange: '4 - 5 bed', basePrice: 329, estimatedHours: 5 },
  { id: 'custom', label: 'Custom', sqftRange: '4,000+ sq ft', bedroomRange: '5+ bed', basePrice: 0, estimatedHours: 0 },
];

export const DEFAULT_SERVICES: ServiceOption[] = [
  {
    id: 'standard',
    name: 'Standard Clean',
    description: 'Regular maintenance cleaning',
    features: ['Dusting all surfaces', 'Vacuuming & mopping', 'Kitchen & bathroom', 'Trash removal'],
    basePrice: 0,
    enabled: true,
  },
  {
    id: 'deep',
    name: 'Deep Clean',
    description: 'Thorough top-to-bottom cleaning',
    features: ['40-point cleaning checklist', 'Inside oven & fridge', 'Baseboards & door frames', 'Interior windows'],
    basePrice: 75,
    badge: '$50 Off Today',
    badgeColor: 'amber',
    enabled: true,
  },
  {
    id: 'move',
    name: 'Move In/Out',
    description: 'Complete move preparation cleaning',
    features: ['Empty home deep clean', 'Inside all cabinets', 'Appliance detail', 'Wall spot cleaning'],
    basePrice: 100,
    enabled: true,
  },
];

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: '8-9', label: '8:00 AM', startTime: '08:00', endTime: '09:00', period: 'morning' },
  { id: '9-10', label: '9:00 AM', startTime: '09:00', endTime: '10:00', period: 'morning' },
  { id: '10-11', label: '10:00 AM', startTime: '10:00', endTime: '11:00', period: 'morning' },
  { id: '11-12', label: '11:00 AM', startTime: '11:00', endTime: '12:00', period: 'morning' },
  { id: '12-13', label: '12:00 PM', startTime: '12:00', endTime: '13:00', period: 'afternoon' },
  { id: '13-14', label: '1:00 PM', startTime: '13:00', endTime: '14:00', period: 'afternoon' },
  { id: '14-15', label: '2:00 PM', startTime: '14:00', endTime: '15:00', period: 'afternoon' },
  { id: '15-16', label: '3:00 PM', startTime: '15:00', endTime: '16:00', period: 'afternoon' },
  { id: '16-17', label: '4:00 PM', startTime: '16:00', endTime: '17:00', period: 'evening' },
  { id: '17-18', label: '5:00 PM', startTime: '17:00', endTime: '18:00', period: 'evening' },
];

export const DEFAULT_ADD_ONS: AddOnOption[] = [
  { id: 'inside-fridge', name: 'Inside Fridge', price: 35, enabled: true },
  { id: 'inside-oven', name: 'Inside Oven', price: 35, enabled: true },
  { id: 'inside-cabinets', name: 'Inside Cabinets', price: 45, enabled: true },
  { id: 'laundry', name: 'Laundry (wash & fold)', price: 30, enabled: true },
  { id: 'windows', name: 'Interior Windows', price: 40, enabled: true },
  { id: 'garage', name: 'Garage Sweep', price: 25, enabled: true },
];

export const DEFAULT_FREQUENCIES: FrequencyOption[] = [
  { id: 'one-time', label: 'One-Time', discountPercent: 0, description: 'Single cleaning' },
  { id: 'weekly', label: 'Weekly', discountPercent: 20, description: 'Save 20%' },
  { id: 'biweekly', label: 'Every 2 Weeks', discountPercent: 15, description: 'Save 15%' },
  { id: 'monthly', label: 'Monthly', discountPercent: 10, description: 'Save 10%' },
];

export const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  { id: 'google', type: 'google_guaranteed', label: 'Google Guaranteed', sublabel: "Backed by Google", enabled: true },
  { id: 'insured', type: 'insured', label: 'Fully Insured', sublabel: '$2M coverage', enabled: true },
  { id: 'background', type: 'background_checked', label: 'Background Checked', sublabel: 'Verified team', enabled: true },
];

export const INITIAL_BOOKING_DATA: BookingData = {
  zipCode: '',
  inServiceArea: false,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  homeSizeId: '',
  serviceId: '',
  serviceType: 'one-time',
  addOns: [],
  serviceDate: '',
  timeSlot: '',
  paymentOption: 'deposit',
  subtotal: 0,
  discount: 0,
  deposit: 0,
  total: 0,
  balanceDue: 0,
};
