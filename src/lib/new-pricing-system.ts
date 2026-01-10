/**
 * New Pricing System - Dynamic multipliers
 * Formula: Base × state_multiplier × (1 - frequency_discount)
 */

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

export interface HomeSizeRange {
  id: string;
  label: string;
  minSqft: number;
  maxSqft: number;
  bedroomRange: string;
  requiresEstimate?: boolean;
  // Base prices per service type
  deepPrice: number;
  maintenancePrice: number;
  ninetyDayPrice: number;
  regularPrice: number;
  moveInOutPrice: number;
}

export interface ServiceTypeConfig {
  id: string;
  name: string;
  description: string;
  allowsRecurring: boolean;
  icon?: string;
}

export interface FrequencyConfig {
  id: string;
  name: string;
  description: string;
  recurringMultiplier?: number;
  cleansPerMonth?: number;
  discount?: number; // 0.15 = 15% off
  badge?: string;
}

export interface StateConfig {
  code: string;
  name: string;
  multiplier: number; // TX: 1.0, CA: 1.10, NY: 1.15
}

export interface PricingConfig {
  states: StateConfig[];
  serviceTypes: ServiceTypeConfig[];
  frequencies: FrequencyConfig[];
}

export interface PricingResult {
  basePrice: number;
  discountAmount: number;
  discountedPrice: number;
  finalPrice: number;
  depositAmount: number;
  mrrEstimate: number;
  arrEstimate: number;
  savings: string;
  tierLabel: string;
  bedroomRange: string;
  requiresEstimate: boolean;
  recurringDetails?: {
    perClean: number;
    cleansPerMonth: number;
    monthlyTotal: number;
  };
}

// ═══════════════════════════════════════════════════════════
// CONFIGURATION DATA
// ═══════════════════════════════════════════════════════════

export const DEPOSIT_PERCENTAGE = 0.25; // 25% deposit

export const HOME_SIZE_RANGES: HomeSizeRange[] = [
  {
    id: '1000_1500',
    label: '1,000 – 1,499 sq ft',
    minSqft: 1000,
    maxSqft: 1499,
    bedroomRange: '1–2 BR',
    deepPrice: 250,
    maintenancePrice: 170,
    ninetyDayPrice: 699,
    regularPrice: 170,
    moveInOutPrice: 315
  },
  {
    id: '1500_2000',
    label: '1,500 – 1,999 sq ft',
    minSqft: 1500,
    maxSqft: 1999,
    bedroomRange: '2–3 BR',
    deepPrice: 300,
    maintenancePrice: 195,
    ninetyDayPrice: 799,
    regularPrice: 195,
    moveInOutPrice: 385
  },
  {
    id: '2000_2500',
    label: '2,000 – 2,499 sq ft',
    minSqft: 2000,
    maxSqft: 2499,
    bedroomRange: '3 BR',
    deepPrice: 350,
    maintenancePrice: 220,
    ninetyDayPrice: 949,
    regularPrice: 220,
    moveInOutPrice: 455
  },
  {
    id: '2500_3000',
    label: '2,500 – 2,999 sq ft',
    minSqft: 2500,
    maxSqft: 2999,
    bedroomRange: '3–4 BR',
    deepPrice: 400,
    maintenancePrice: 250,
    ninetyDayPrice: 1099,
    regularPrice: 250,
    moveInOutPrice: 525
  },
  {
    id: '3000_3500',
    label: '3,000 – 3,499 sq ft',
    minSqft: 3000,
    maxSqft: 3499,
    bedroomRange: '4 BR',
    deepPrice: 450,
    maintenancePrice: 280,
    ninetyDayPrice: 1249,
    regularPrice: 280,
    moveInOutPrice: 595
  },
  {
    id: '3500_4000',
    label: '3,500 – 3,999 sq ft',
    minSqft: 3500,
    maxSqft: 3999,
    bedroomRange: '4–5 BR',
    deepPrice: 500,
    maintenancePrice: 310,
    ninetyDayPrice: 1399,
    regularPrice: 310,
    moveInOutPrice: 665
  },
  {
    id: '4000_4500',
    label: '4,000 – 4,499 sq ft',
    minSqft: 4000,
    maxSqft: 4499,
    bedroomRange: '5 BR',
    deepPrice: 550,
    maintenancePrice: 340,
    ninetyDayPrice: 1549,
    regularPrice: 340,
    moveInOutPrice: 735
  },
  {
    id: '4500_5000',
    label: '4,500 – 4,999 sq ft',
    minSqft: 4500,
    maxSqft: 4999,
    bedroomRange: '5+ BR',
    deepPrice: 600,
    maintenancePrice: 370,
    ninetyDayPrice: 1699,
    regularPrice: 370,
    moveInOutPrice: 805
  },
  {
    id: '5001_plus',
    label: '5,000+ sq ft',
    minSqft: 5000,
    maxSqft: 999999,
    bedroomRange: 'Custom Quote',
    requiresEstimate: true,
    deepPrice: 0,
    maintenancePrice: 0,
    ninetyDayPrice: 0,
    regularPrice: 0,
    moveInOutPrice: 0
  }
];

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  states: [
    { code: 'TX', name: 'Texas', multiplier: 1.0 },
    { code: 'CA', name: 'California', multiplier: 1.10 },
    { code: 'NY', name: 'New York', multiplier: 1.15 },
    { code: 'FL', name: 'Florida', multiplier: 1.05 },
    { code: 'AZ', name: 'Arizona', multiplier: 1.0 },
    { code: 'CO', name: 'Colorado', multiplier: 1.05 }
  ],
  serviceTypes: [
    { id: 'regular', name: 'Standard Cleaning', description: 'Regular maintenance cleaning', allowsRecurring: true, icon: 'sparkles' },
    { id: 'deep', name: 'Deep Cleaning', description: 'Thorough top-to-bottom cleaning', allowsRecurring: false, icon: 'brush' },
    { id: 'move_in_out', name: 'Move-In/Out', description: 'Complete cleaning for moving', allowsRecurring: false, icon: 'truck' }
  ],
  frequencies: [
    { id: 'one_time', name: 'One-time', description: 'Single cleaning service', discount: 0 },
    { id: 'weekly', name: 'Weekly', description: 'Every week', cleansPerMonth: 4, discount: 0.15, badge: 'Best Value' },
    { id: 'bi_weekly', name: 'Bi-Weekly', description: 'Every 2 weeks', cleansPerMonth: 2, discount: 0.10, badge: 'Popular' },
    { id: 'monthly', name: 'Monthly', description: 'Once a month', cleansPerMonth: 1, discount: 0.05 }
  ]
};

// ═══════════════════════════════════════════════════════════
// MAIN CALCULATION FUNCTION
// ═══════════════════════════════════════════════════════════

export function calculateNewPricing(
  homeSizeId: string,
  serviceTypeId: string,
  frequencyId: string,
  stateCode: string,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): PricingResult {
  
  // 1. LOOKUP: Find configuration objects
  const homeSize = HOME_SIZE_RANGES.find(h => h.id === homeSizeId);
  const serviceType = config.serviceTypes.find(s => s.id === serviceTypeId);
  const frequency = config.frequencies.find(f => f.id === frequencyId);
  const state = config.states.find(s => s.code === stateCode) || config.states[0];

  if (!homeSize || !serviceType || !frequency) {
    // Return default result for missing params
    return {
      basePrice: 0,
      discountAmount: 0,
      discountedPrice: 0,
      finalPrice: 0,
      depositAmount: 0,
      mrrEstimate: 0,
      arrEstimate: 0,
      savings: '',
      tierLabel: 'Select home size',
      bedroomRange: '',
      requiresEstimate: false
    };
  }

  // 2. HANDLE CUSTOM QUOTES
  if (homeSize.requiresEstimate) {
    return {
      basePrice: 0,
      discountAmount: 0,
      discountedPrice: 0,
      finalPrice: 0,
      depositAmount: 0,
      mrrEstimate: 0,
      arrEstimate: 0,
      savings: 'Custom Quote Required',
      tierLabel: homeSize.label,
      bedroomRange: homeSize.bedroomRange,
      requiresEstimate: true
    };
  }

  // 3. GET BASE PRICE by service type
  let basePrice = 0;
  switch (serviceTypeId) {
    case 'regular': basePrice = homeSize.regularPrice; break;
    case 'deep': basePrice = homeSize.deepPrice; break;
    case 'move_in_out': basePrice = homeSize.moveInOutPrice; break;
    default: basePrice = homeSize.regularPrice;
  }

  // 4. APPLY STATE MULTIPLIER
  basePrice = Math.round(basePrice * state.multiplier * 100) / 100;

  // 5. CALCULATE DISCOUNTS & RECURRING
  let finalPrice = basePrice;
  let discountAmount = 0;
  let mrrEstimate = 0;
  let arrEstimate = 0;
  let savings = '';
  let recurringDetails;

  // One-time: flat $50 discount
  if (frequencyId === 'one_time') {
    discountAmount = 50;
    finalPrice = basePrice - discountAmount;
    savings = 'Save $50 on your one-time cleaning!';
  }
  // Recurring: percentage discount
  else if (serviceType.allowsRecurring && frequency.cleansPerMonth) {
    const frequencyDiscount = frequency.discount || 0;
    discountAmount = Math.round(basePrice * frequencyDiscount * 100) / 100;
    finalPrice = Math.round((basePrice - discountAmount) * 100) / 100;
    
    mrrEstimate = Math.round(finalPrice * frequency.cleansPerMonth * 100) / 100;
    arrEstimate = Math.round(mrrEstimate * 12 * 100) / 100;
    
    recurringDetails = {
      perClean: finalPrice,
      cleansPerMonth: frequency.cleansPerMonth,
      monthlyTotal: mrrEstimate
    };
    
    if (frequencyDiscount > 0) {
      savings = `Save ${(frequencyDiscount * 100).toFixed(0)}% with ${frequency.name.toLowerCase()} service!`;
    }
  }

  // 6. CALCULATE DEPOSIT
  const depositAmount = Math.round(finalPrice * DEPOSIT_PERCENTAGE * 100) / 100;

  // 7. RETURN RESULT
  return {
    basePrice,
    discountAmount,
    discountedPrice: finalPrice,
    finalPrice,
    depositAmount,
    mrrEstimate,
    arrEstimate,
    savings,
    tierLabel: homeSize.label,
    bedroomRange: homeSize.bedroomRange,
    requiresEstimate: false,
    recurringDetails
  };
}

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

export function getHomeSizeBySquareFootage(sqft: number): HomeSizeRange | null {
  return HOME_SIZE_RANGES.find(range => 
    sqft >= range.minSqft && sqft <= range.maxSqft
  ) || null;
}

export function getHomeSizeById(id: string): HomeSizeRange | null {
  return HOME_SIZE_RANGES.find(range => range.id === id) || null;
}

export function getAllHomeSizes(): HomeSizeRange[] {
  return HOME_SIZE_RANGES;
}

export function getServiceTypes(config: PricingConfig = DEFAULT_PRICING_CONFIG): ServiceTypeConfig[] {
  return config.serviceTypes;
}

export function getFrequencies(config: PricingConfig = DEFAULT_PRICING_CONFIG): FrequencyConfig[] {
  return config.frequencies;
}
