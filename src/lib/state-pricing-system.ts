/**
 * State-Level Hybrid Pricing System
 * Supports multiple regions with different pricing tiers
 */

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════
export type StateCode = 'TX' | 'CA' | 'NY' | 'FL' | 'AZ' | 'CO';
export type ServiceType = 'regular' | 'deep' | 'move_in_out';
export type FrequencyType = 'one_time' | 'weekly' | 'bi_weekly' | 'monthly';

export interface PricingTier {
  id: string;
  label: string;
  minSqft: number;
  maxSqft: number;
  regular: number;
  deep: number;
  moveInOut: number;
}

export interface StateConfig {
  code: StateCode;
  name: string;
  displayName: string;
  tiers: PricingTier[];
}

export interface RecurringPricing {
  weeklyPerClean: number;
  weeklyMonthly: number;
  biWeeklyPerClean: number;
  biWeeklyMonthly: number;
  monthlyPerClean: number;
  monthlyMonthly: number;
}

export interface PricingResult {
  state: StateConfig;
  tier: PricingTier;
  serviceType: ServiceType;
  frequency: FrequencyType;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  recurringDetails?: {
    perClean: number;
    cleansPerMonth: number;
    monthlyTotal: number;
  };
}

// ═══════════════════════════════════════════════════════════
// CONFIGURATION: Pricing tiers by state
// ═══════════════════════════════════════════════════════════

// Texas pricing tiers
const TEXAS_TIERS: PricingTier[] = [
  { id: '1000_1500', label: '1,000–1,500 sq ft', minSqft: 1000, maxSqft: 1500, 
    regular: 175, deep: 265, moveInOut: 275 },
  { id: '1501_2000', label: '1,501–2,000 sq ft', minSqft: 1501, maxSqft: 2000, 
    regular: 205, deep: 305, moveInOut: 310 },
  { id: '2001_2500', label: '2,001–2,500 sq ft', minSqft: 2001, maxSqft: 2500, 
    regular: 235, deep: 345, moveInOut: 345 },
  { id: '2501_3000', label: '2,501–3,000 sq ft', minSqft: 2501, maxSqft: 3000, 
    regular: 265, deep: 385, moveInOut: 380 },
  { id: '3001_3500', label: '3,001–3,500 sq ft', minSqft: 3001, maxSqft: 3500, 
    regular: 295, deep: 425, moveInOut: 415 },
  { id: '3501_4000', label: '3,501–4,000 sq ft', minSqft: 3501, maxSqft: 4000, 
    regular: 325, deep: 465, moveInOut: 450 },
  { id: '4001_4500', label: '4,001–4,500 sq ft', minSqft: 4001, maxSqft: 4500, 
    regular: 355, deep: 505, moveInOut: 485 },
  { id: '4501_5000', label: '4,501–5,000 sq ft', minSqft: 4501, maxSqft: 5000, 
    regular: 385, deep: 545, moveInOut: 520 },
  { id: '5000_plus', label: '5,000+ sq ft', minSqft: 5000, maxSqft: 999999, 
    regular: 0, deep: 0, moveInOut: 0 } // Custom quote
];

// California pricing tiers (higher prices)
const CALIFORNIA_TIERS: PricingTier[] = [
  { id: '1000_1500', label: '1,000–1,500 sq ft', minSqft: 1000, maxSqft: 1500, 
    regular: 195, deep: 290, moveInOut: 300 },
  { id: '1501_2000', label: '1,501–2,000 sq ft', minSqft: 1501, maxSqft: 2000, 
    regular: 225, deep: 335, moveInOut: 340 },
  { id: '2001_2500', label: '2,001–2,500 sq ft', minSqft: 2001, maxSqft: 2500, 
    regular: 260, deep: 380, moveInOut: 380 },
  { id: '2501_3000', label: '2,501–3,000 sq ft', minSqft: 2501, maxSqft: 3000, 
    regular: 290, deep: 425, moveInOut: 420 },
  { id: '3001_3500', label: '3,001–3,500 sq ft', minSqft: 3001, maxSqft: 3500, 
    regular: 325, deep: 470, moveInOut: 455 },
  { id: '3501_4000', label: '3,501–4,000 sq ft', minSqft: 3501, maxSqft: 4000, 
    regular: 360, deep: 510, moveInOut: 495 },
  { id: '4001_4500', label: '4,001–4,500 sq ft', minSqft: 4001, maxSqft: 4500, 
    regular: 390, deep: 555, moveInOut: 535 },
  { id: '4501_5000', label: '4,501–5,000 sq ft', minSqft: 4501, maxSqft: 5000, 
    regular: 425, deep: 600, moveInOut: 570 },
  { id: '5000_plus', label: '5,000+ sq ft', minSqft: 5000, maxSqft: 999999, 
    regular: 0, deep: 0, moveInOut: 0 }
];

// New York pricing tiers (highest prices)
const NEW_YORK_TIERS: PricingTier[] = [
  { id: '1000_1500', label: '1,000–1,500 sq ft', minSqft: 1000, maxSqft: 1500, 
    regular: 210, deep: 305, moveInOut: 315 },
  { id: '1501_2000', label: '1,501–2,000 sq ft', minSqft: 1501, maxSqft: 2000, 
    regular: 245, deep: 355, moveInOut: 360 },
  { id: '2001_2500', label: '2,001–2,500 sq ft', minSqft: 2001, maxSqft: 2500, 
    regular: 280, deep: 400, moveInOut: 400 },
  { id: '2501_3000', label: '2,501–3,000 sq ft', minSqft: 2501, maxSqft: 3000, 
    regular: 315, deep: 445, moveInOut: 440 },
  { id: '3001_3500', label: '3,001–3,500 sq ft', minSqft: 3001, maxSqft: 3500, 
    regular: 350, deep: 490, moveInOut: 480 },
  { id: '3501_4000', label: '3,501–4,000 sq ft', minSqft: 3501, maxSqft: 4000, 
    regular: 385, deep: 535, moveInOut: 520 },
  { id: '4001_4500', label: '4,001–4,500 sq ft', minSqft: 4001, maxSqft: 4500, 
    regular: 420, deep: 580, moveInOut: 560 },
  { id: '4501_5000', label: '4,501–5,000 sq ft', minSqft: 4501, maxSqft: 5000, 
    regular: 455, deep: 625, moveInOut: 600 },
  { id: '5000_plus', label: '5,000+ sq ft', minSqft: 5000, maxSqft: 999999, 
    regular: 0, deep: 0, moveInOut: 0 }
];

// State configurations array
export const STATE_CONFIGS: StateConfig[] = [
  { code: 'TX', name: 'Texas', displayName: 'Texas', tiers: TEXAS_TIERS },
  { code: 'CA', name: 'California', displayName: 'California', tiers: CALIFORNIA_TIERS },
  { code: 'NY', name: 'New York', displayName: 'New York', tiers: NEW_YORK_TIERS },
  { code: 'FL', name: 'Florida', displayName: 'Florida', tiers: TEXAS_TIERS },
  { code: 'AZ', name: 'Arizona', displayName: 'Arizona', tiers: TEXAS_TIERS },
  { code: 'CO', name: 'Colorado', displayName: 'Colorado', tiers: TEXAS_TIERS }
];

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

export function getStateConfig(stateCode: StateCode | string): StateConfig | null {
  return STATE_CONFIGS.find(s => s.code === stateCode) || STATE_CONFIGS[0]; // Default to Texas
}

export function getPricingTier(stateCode: StateCode | string, sqft: number): PricingTier | null {
  const state = getStateConfig(stateCode);
  if (!state) return null;
  return state.tiers.find(tier => sqft >= tier.minSqft && sqft <= tier.maxSqft) || null;
}

/**
 * Calculate recurring pricing multipliers
 */
export function calculateRecurringPricing(oneTimePrice: number): RecurringPricing {
  const weeklyPerClean = Math.round(oneTimePrice * 0.40 * 100) / 100;
  const biWeeklyPerClean = Math.round(oneTimePrice * 0.55 * 100) / 100;
  const monthlyPerClean = Math.round(oneTimePrice * 0.75 * 100) / 100;

  return {
    weeklyPerClean,
    weeklyMonthly: Math.round(weeklyPerClean * 4 * 100) / 100,
    biWeeklyPerClean,
    biWeeklyMonthly: Math.round(biWeeklyPerClean * 2 * 100) / 100,
    monthlyPerClean,
    monthlyMonthly: monthlyPerClean
  };
}

// ═══════════════════════════════════════════════════════════
// MAIN CALCULATION FUNCTION
// ═══════════════════════════════════════════════════════════

export function calculatePricing(
  stateCode: StateCode | string,
  sqft: number,
  serviceType: ServiceType,
  frequency: FrequencyType = 'one_time'
): PricingResult | null {
  const state = getStateConfig(stateCode);
  const tier = getPricingTier(stateCode, sqft);
  
  if (!state || !tier) return null;
  
  // Custom quote for 5000+ sqft
  if (tier.id === '5000_plus') {
    return {
      state, tier, serviceType, frequency,
      originalPrice: 0, discountedPrice: 0, savings: 0
    };
  }

  // Get base price based on service type
  let basePrice = 0;
  if (serviceType === 'regular') basePrice = tier.regular;
  else if (serviceType === 'deep') basePrice = tier.deep;
  else if (serviceType === 'move_in_out') basePrice = tier.moveInOut;

  // Calculate recurring pricing if applicable
  let recurringDetails;
  let finalPrice = basePrice;

  if (serviceType === 'regular' && frequency !== 'one_time') {
    const recurring = calculateRecurringPricing(basePrice);
    
    if (frequency === 'weekly') {
      finalPrice = recurring.weeklyMonthly;
      recurringDetails = {
        perClean: recurring.weeklyPerClean,
        cleansPerMonth: 4,
        monthlyTotal: recurring.weeklyMonthly
      };
    } else if (frequency === 'bi_weekly') {
      finalPrice = recurring.biWeeklyMonthly;
      recurringDetails = {
        perClean: recurring.biWeeklyPerClean,
        cleansPerMonth: 2,
        monthlyTotal: recurring.biWeeklyMonthly
      };
    } else if (frequency === 'monthly') {
      finalPrice = recurring.monthlyMonthly;
      recurringDetails = {
        perClean: recurring.monthlyPerClean,
        cleansPerMonth: 1,
        monthlyTotal: recurring.monthlyMonthly
      };
    }
  }

  return {
    state, tier, serviceType, frequency,
    originalPrice: basePrice,
    discountedPrice: finalPrice,
    savings: 0,
    recurringDetails
  };
}
