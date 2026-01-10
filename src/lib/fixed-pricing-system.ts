/**
 * Fixed Flat Pricing System
 * Static pricing that doesn't vary by square footage
 */

// ═══════════════════════════════════════════════════════════
// CONFIGURATION: Base prices per service type
// ═══════════════════════════════════════════════════════════
export const FLAT_PRICING = {
  regular: 200,
  deep: 265,
  moveInOut: 275
} as const;

// ═══════════════════════════════════════════════════════════
// CONFIGURATION: Frequency multipliers for recurring services
// ═══════════════════════════════════════════════════════════
export const FREQUENCY_MULTIPLIERS = {
  one_time: 1.0,    // Full price
  weekly: 0.40,     // 40% per clean × 4/month
  bi_weekly: 0.55,  // 55% per clean × 2/month
  monthly: 0.75     // 75% per clean × 1/month
} as const;

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════
export type ServiceTypeId = 'regular' | 'deep' | 'move_in_out';
export type FrequencyId = 'one_time' | 'weekly' | 'bi_weekly' | 'monthly';

export interface FixedPricingResult {
  basePrice: number;
  monthlyTotal: number;
  finalPrice: number;
  serviceType: string;
  frequency: string;
  perCleanPrice?: number;
  cleansPerMonth?: number;
  isRecurring: boolean;
}

// ═══════════════════════════════════════════════════════════
// CALCULATION FUNCTION
// ═══════════════════════════════════════════════════════════
export function calculateFixedPricing(
  serviceTypeId: string,
  frequencyId: string
): FixedPricingResult {
  // Normalize service type ID
  const normalizedServiceType = serviceTypeId === 'moveInOut' 
    ? 'move_in_out' : serviceTypeId;
  
  // Get base price (flat across all home sizes)
  let basePrice: number;
  if (normalizedServiceType === 'regular') {
    basePrice = FLAT_PRICING.regular;
  } else if (normalizedServiceType === 'deep') {
    basePrice = FLAT_PRICING.deep;
  } else if (normalizedServiceType === 'move_in_out') {
    basePrice = FLAT_PRICING.moveInOut;
  } else {
    basePrice = FLAT_PRICING.regular; // Default
  }

  // Get frequency multiplier
  const multiplier = FREQUENCY_MULTIPLIERS[frequencyId as FrequencyId] 
    || FREQUENCY_MULTIPLIERS.one_time;
  
  // Calculate final price
  const isRecurring = frequencyId !== 'one_time';
  const monthlyTotal = basePrice;
  const finalPrice = isRecurring ? monthlyTotal : basePrice * multiplier;

  // Calculate per-clean breakdown for recurring
  let perCleanPrice: number | undefined;
  let cleansPerMonth: number | undefined;
  
  if (isRecurring) {
    if (frequencyId === 'weekly') cleansPerMonth = 4;
    else if (frequencyId === 'bi_weekly') cleansPerMonth = 2;
    else if (frequencyId === 'monthly') cleansPerMonth = 1;
    
    if (cleansPerMonth) {
      perCleanPrice = finalPrice / cleansPerMonth;
    }
  }

  return {
    basePrice,
    monthlyTotal,
    finalPrice,
    serviceType: normalizedServiceType,
    frequency: frequencyId,
    perCleanPrice,
    cleansPerMonth,
    isRecurring
  };
}

// ═══════════════════════════════════════════════════════════
// DISPLAY NAME MAPPINGS
// ═══════════════════════════════════════════════════════════
export const SERVICE_TYPE_NAMES = {
  regular: 'Regular Clean',
  deep: 'Deep Clean',
  move_in_out: 'Move-In/Out Clean'
} as const;

export const FREQUENCY_NAMES = {
  one_time: 'One-Time',
  weekly: 'Weekly',
  bi_weekly: 'Bi-Weekly',
  monthly: 'Monthly'
} as const;
