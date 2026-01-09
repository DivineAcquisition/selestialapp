// ============================================================================
// BOOKING WIDGET TYPES & CONFIGURATION
// ============================================================================

// Header Configuration
export interface HeaderConfig {
  logoUrl: string;
  businessName: string;
  showPhone: boolean;
  phoneNumber: string;
  showWebsiteLink: boolean;
  websiteUrl: string;
  websiteLabel: string;
}

// Progress Bar Configuration
export interface ProgressConfig {
  style: 'bar' | 'steps' | 'dots' | 'percentage';
  showStepLabels: boolean;
  showPercentage: boolean;
  color: string;
}

// Promotion Banner Configuration
export interface PromotionConfig {
  enabled: boolean;
  headline: string;
  subheadline: string;
  discountAmount: number;
  discountType: 'flat' | 'percentage';
  recurringDiscount: number;
  expiryDate: string;
  badgeText: string;
  showCountdown: boolean;
}

// Trust Badge Configuration
export interface TrustBadge {
  id: string;
  type: 'google_guaranteed' | 'bbb' | 'insured' | 'licensed' | 'custom';
  label: string;
  sublabel?: string;
  icon: string;
  color: string;
  enabled: boolean;
}

// Square Footage Option
export interface SqftOption {
  id: string;
  label: string;
  minSqft: number;
  maxSqft: number | null;
  basePrice: number;
  enabled: boolean;
  requiresCall: boolean;
}

// Service Offer
export interface ServiceOffer {
  id: string;
  name: string;
  slug: string;
  type: 'one_time' | 'recurring';
  description: string;
  features: string[];
  basePrice: number;
  discountedPrice: number;
  discountBadge: string;
  depositPercent: number;
  frequency?: 'weekly' | 'biweekly' | 'monthly';
  popular: boolean;
  enabled: boolean;
  icon: string;
  color: string;
}

// Form Field Configuration
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'time' | 'address';
  placeholder: string;
  required: boolean;
  enabled: boolean;
  order: number;
}

// Time Slot Configuration
export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

// Showcase Image
export interface ShowcaseImage {
  id: string;
  url: string;
  caption: string;
  enabled: boolean;
}

// Review Configuration
export interface ReviewConfig {
  enabled: boolean;
  headline: string;
  subheadline: string;
  averageRating: number;
  totalReviews: number;
  reviews: {
    id: string;
    author: string;
    rating: number;
    text: string;
    date: string;
    avatar?: string;
  }[];
}

// Confirmation Page Configuration
export interface ConfirmationConfig {
  headline: string;
  subheadline: string;
  showBookingDetails: boolean;
  showAddToCalendar: boolean;
  showNextSteps: boolean;
  nextSteps: string[];
  showReferralCode: boolean;
  referralReward: number;
  showContactInfo: boolean;
}

// Branding Configuration
export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  borderRadius: number;
  fontFamily: string;
  buttonStyle: 'solid' | 'gradient' | 'outline';
}

// Complete Widget Configuration
export interface BookingWidgetConfig {
  id: string;
  businessId: string;
  slug: string;
  
  // Core settings
  header: HeaderConfig;
  progress: ProgressConfig;
  branding: BrandingConfig;
  
  // Content
  promotion: PromotionConfig;
  trustBadges: TrustBadge[];
  sqftOptions: SqftOption[];
  serviceOffers: ServiceOffer[];
  
  // Forms
  leadCaptureFields: FormField[];
  addressFields: FormField[];
  timeSlots: TimeSlot[];
  
  // Social proof
  showcaseImages: ShowcaseImage[];
  reviews: ReviewConfig;
  
  // Confirmation
  confirmation: ConfirmationConfig;
  
  // Payment
  depositPercent: number;
  paymentMethods: ('card' | 'apple_pay' | 'google_pay')[];
  
  // Service areas
  serviceAreaZips: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_HEADER: HeaderConfig = {
  logoUrl: '',
  businessName: 'Your Business',
  showPhone: true,
  phoneNumber: '(555) 123-4567',
  showWebsiteLink: true,
  websiteUrl: 'https://example.com',
  websiteLabel: 'Visit Website',
};

export const DEFAULT_PROGRESS: ProgressConfig = {
  style: 'bar',
  showStepLabels: true,
  showPercentage: true,
  color: '#7C3AED',
};

export const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#1E3A5F',
  secondaryColor: '#2D4A6F',
  accentColor: '#10B981',
  backgroundColor: '#F9FAFB',
  cardBackground: '#FFFFFF',
  textColor: '#1F2937',
  mutedTextColor: '#6B7280',
  borderRadius: 12,
  fontFamily: 'Inter',
  buttonStyle: 'solid',
};

export const DEFAULT_PROMOTION: PromotionConfig = {
  enabled: true,
  headline: 'New Year Special: $50 Off Your First Clean',
  subheadline: '+ 15% Off Recurring Service',
  discountAmount: 50,
  discountType: 'flat',
  recurringDiscount: 15,
  expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  badgeText: 'Limited Time',
  showCountdown: true,
};

export const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  {
    id: '1',
    type: 'google_guaranteed',
    label: 'Google Guaranteed',
    sublabel: "Backed by Google's guarantee",
    icon: 'shieldCheck',
    color: '#10B981',
    enabled: true,
  },
  {
    id: '2',
    type: 'insured',
    label: 'Fully Insured',
    sublabel: '$2M liability coverage',
    icon: 'shield',
    color: '#3B82F6',
    enabled: true,
  },
  {
    id: '3',
    type: 'licensed',
    label: 'Licensed & Bonded',
    sublabel: 'State licensed professionals',
    icon: 'award',
    color: '#8B5CF6',
    enabled: true,
  },
];

export const DEFAULT_SQFT_OPTIONS: SqftOption[] = [
  { id: '1', label: 'Under 1,000', minSqft: 0, maxSqft: 1000, basePrice: 149, enabled: true, requiresCall: false },
  { id: '2', label: '1,000 - 1,500', minSqft: 1000, maxSqft: 1500, basePrice: 179, enabled: true, requiresCall: false },
  { id: '3', label: '1,500 - 2,000', minSqft: 1500, maxSqft: 2000, basePrice: 219, enabled: true, requiresCall: false },
  { id: '4', label: '2,000 - 2,500', minSqft: 2000, maxSqft: 2500, basePrice: 259, enabled: true, requiresCall: false },
  { id: '5', label: '2,500 - 3,000', minSqft: 2500, maxSqft: 3000, basePrice: 299, enabled: true, requiresCall: false },
  { id: '6', label: '3,000 - 4,000', minSqft: 3000, maxSqft: 4000, basePrice: 359, enabled: true, requiresCall: false },
  { id: '7', label: '4,000 - 5,000', minSqft: 4000, maxSqft: 5000, basePrice: 429, enabled: true, requiresCall: false },
  { id: '8', label: '5,000+', minSqft: 5000, maxSqft: null, basePrice: 0, enabled: true, requiresCall: true },
];

export const DEFAULT_SERVICE_OFFERS: ServiceOffer[] = [
  {
    id: '1',
    name: 'Deep Clean',
    slug: 'deep-clean',
    type: 'one_time',
    description: 'One-time reset for your home',
    features: [
      '40-point deep cleaning checklist',
      '2-person professional team',
      'All supplies & equipment included',
      '48-hour satisfaction guarantee',
    ],
    basePrice: 299,
    discountedPrice: 249,
    discountBadge: '$50 Off',
    depositPercent: 25,
    popular: false,
    enabled: true,
    icon: 'sparkles',
    color: '#1E3A5F',
  },
  {
    id: '2',
    name: 'Recurring Maintenance',
    slug: 'recurring',
    type: 'recurring',
    description: 'Keep your home guest-ready always',
    features: [
      'Bi-weekly or monthly service',
      'Same trusted cleaning team',
      'Priority scheduling',
      'Cancel or pause anytime',
    ],
    basePrice: 199,
    discountedPrice: 169,
    discountBadge: '15% Off',
    depositPercent: 25,
    frequency: 'biweekly',
    popular: true,
    enabled: true,
    icon: 'repeat',
    color: '#10B981',
  },
];

export const DEFAULT_LEAD_FIELDS: FormField[] = [
  { id: '1', name: 'firstName', label: 'First Name', type: 'text', placeholder: 'John', required: true, enabled: true, order: 1 },
  { id: '2', name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Smith', required: true, enabled: true, order: 2 },
  { id: '3', name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com', required: true, enabled: true, order: 3 },
  { id: '4', name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567', required: true, enabled: true, order: 4 },
];

export const DEFAULT_ADDRESS_FIELDS: FormField[] = [
  { id: '1', name: 'address1', label: 'Address Line 1', type: 'text', placeholder: '123 Main Street', required: true, enabled: true, order: 1 },
  { id: '2', name: 'address2', label: 'Address Line 2', type: 'text', placeholder: 'Apt, Suite, Unit', required: false, enabled: true, order: 2 },
  { id: '3', name: 'city', label: 'City', type: 'text', placeholder: 'Dallas', required: true, enabled: true, order: 3 },
  { id: '4', name: 'state', label: 'State', type: 'text', placeholder: 'TX', required: true, enabled: true, order: 4 },
  { id: '5', name: 'zip', label: 'ZIP Code', type: 'text', placeholder: '75001', required: true, enabled: true, order: 5 },
  { id: '6', name: 'notes', label: 'Special Instructions', type: 'textarea', placeholder: 'Gate code, pets, parking info...', required: false, enabled: true, order: 6 },
];

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: '1', label: 'Morning', startTime: '08:00', endTime: '11:00', enabled: true },
  { id: '2', label: 'Afternoon', startTime: '12:00', endTime: '15:00', enabled: true },
  { id: '3', label: 'Evening', startTime: '15:00', endTime: '18:00', enabled: true },
];

export const DEFAULT_SHOWCASE_IMAGES: ShowcaseImage[] = [
  { id: '1', url: '/images/showcase-1.jpg', caption: 'Pristine Bathroom - Sparkling Clean', enabled: true },
  { id: '2', url: '/images/showcase-2.jpg', caption: 'Kitchen Deep Clean', enabled: true },
  { id: '3', url: '/images/showcase-3.jpg', caption: 'Living Room Transformation', enabled: true },
];

export const DEFAULT_REVIEWS: ReviewConfig = {
  enabled: true,
  headline: 'What Our Customers Say',
  subheadline: 'Real reviews from satisfied customers',
  averageRating: 5.0,
  totalReviews: 127,
  reviews: [
    {
      id: '1',
      author: 'Sarah M.',
      rating: 5,
      text: 'Absolutely amazing service! My home has never been cleaner. The team was professional, thorough, and friendly.',
      date: '2026-01-05',
    },
    {
      id: '2',
      author: 'Michael R.',
      rating: 5,
      text: 'Best cleaning service in the area. They pay attention to every detail and the booking process was so easy!',
      date: '2026-01-03',
    },
    {
      id: '3',
      author: 'Jennifer L.',
      rating: 5,
      text: 'I love that I can schedule recurring cleanings. Same great team every time. Highly recommend!',
      date: '2025-12-28',
    },
  ],
};

export const DEFAULT_CONFIRMATION: ConfirmationConfig = {
  headline: "You're Booked!",
  subheadline: "We've received your deposit and will be in touch shortly",
  showBookingDetails: true,
  showAddToCalendar: true,
  showNextSteps: true,
  nextSteps: [
    "We'll call you within 24 hours to confirm details",
    "You'll receive a reminder 24 hours before service",
    "Pay the remaining balance after your service is complete",
  ],
  showReferralCode: true,
  referralReward: 50,
  showContactInfo: true,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDefaultConfig(businessId: string, businessName: string): BookingWidgetConfig {
  return {
    id: crypto.randomUUID(),
    businessId,
    slug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    header: { ...DEFAULT_HEADER, businessName },
    progress: DEFAULT_PROGRESS,
    branding: DEFAULT_BRANDING,
    promotion: DEFAULT_PROMOTION,
    trustBadges: DEFAULT_TRUST_BADGES,
    sqftOptions: DEFAULT_SQFT_OPTIONS,
    serviceOffers: DEFAULT_SERVICE_OFFERS,
    leadCaptureFields: DEFAULT_LEAD_FIELDS,
    addressFields: DEFAULT_ADDRESS_FIELDS,
    timeSlots: DEFAULT_TIME_SLOTS,
    showcaseImages: DEFAULT_SHOWCASE_IMAGES,
    reviews: DEFAULT_REVIEWS,
    confirmation: DEFAULT_CONFIRMATION,
    depositPercent: 25,
    paymentMethods: ['card'],
    serviceAreaZips: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function calculatePrice(
  sqftOption: SqftOption,
  serviceOffer: ServiceOffer,
  config: BookingWidgetConfig
): {
  basePrice: number;
  discount: number;
  total: number;
  deposit: number;
  balance: number;
} {
  const basePrice = sqftOption.basePrice + (serviceOffer.basePrice - DEFAULT_SERVICE_OFFERS[0].basePrice);
  const discount = serviceOffer.type === 'one_time' 
    ? config.promotion.discountAmount 
    : Math.round(basePrice * (config.promotion.recurringDiscount / 100));
  const total = basePrice - discount;
  const deposit = Math.round(total * (serviceOffer.depositPercent / 100));
  const balance = total - deposit;
  
  return { basePrice, discount, total, deposit, balance };
}
