/**
 * Selestial booking pricing system.
 *
 * Ported verbatim from AlphaLuxClean (`src/lib/new-pricing-system.ts`).
 * The constants, `HOME_SIZE_RANGES`, multipliers, frequency discounts, and the
 * `calculateNewPricing` function are kept identical to the reference flow so
 * Selestial users get the exact same booking math out of the box. Per-tenant
 * overrides can be layered on later via `cleaning_pricing_config`.
 */

export interface HomeSizeRange {
  id: string;
  label: string;
  minSqft: number;
  maxSqft: number;
  bedroomRange: string;
  requiresEstimate?: boolean;
  deepPrice: number;
  maintenancePrice: number;
  ninetyDayPrice: number;
  regularPrice: number;
  moveInOutPrice: number;
}

export interface ServiceTypeConfig {
  id: string;
  name: string;
  allowsRecurring: boolean;
}

export interface FrequencyConfig {
  id: string;
  name: string;
  recurringMultiplier?: number;
  cleansPerMonth?: number;
  discount?: number;
}

export interface StateConfig {
  code: string;
  name: string;
  multiplier: number;
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
  recurringDetails?: {
    perClean: number;
    cleansPerMonth: number;
    monthlyTotal: number;
  };
}

export const DEPOSIT_PERCENTAGE = 0.25;

export const HOME_SIZE_RANGES: HomeSizeRange[] = [
  {
    id: '1000_1500',
    label: '1,000 – 1,499 sq ft',
    minSqft: 1000,
    maxSqft: 1499,
    bedroomRange: '1–2 BR condos/homes',
    deepPrice: 250,
    maintenancePrice: 170,
    ninetyDayPrice: 699,
    regularPrice: 170,
    moveInOutPrice: 315,
  },
  {
    id: '1501_2000',
    label: '1,500 – 1,999 sq ft',
    minSqft: 1500,
    maxSqft: 1999,
    bedroomRange: '2–3 BR homes',
    deepPrice: 300,
    maintenancePrice: 195,
    ninetyDayPrice: 799,
    regularPrice: 195,
    moveInOutPrice: 385,
  },
  {
    id: '2001_2500',
    label: '2,000 – 2,499 sq ft',
    minSqft: 2000,
    maxSqft: 2499,
    bedroomRange: '3 BR homes',
    deepPrice: 350,
    maintenancePrice: 220,
    ninetyDayPrice: 949,
    regularPrice: 220,
    moveInOutPrice: 455,
  },
  {
    id: '2501_3000',
    label: '2,500 – 2,999 sq ft',
    minSqft: 2500,
    maxSqft: 2999,
    bedroomRange: '3–4 BR homes',
    deepPrice: 400,
    maintenancePrice: 250,
    ninetyDayPrice: 1099,
    regularPrice: 250,
    moveInOutPrice: 525,
  },
  {
    id: '3001_4000',
    label: '3,000 – 3,999 sq ft',
    minSqft: 3000,
    maxSqft: 3999,
    bedroomRange: '4 BR homes',
    deepPrice: 450,
    maintenancePrice: 280,
    ninetyDayPrice: 1249,
    regularPrice: 280,
    moveInOutPrice: 595,
  },
  {
    id: '4001_5000',
    label: '4,000 – 4,999 sq ft',
    minSqft: 4000,
    maxSqft: 4999,
    bedroomRange: '4–5 BR homes',
    deepPrice: 500,
    maintenancePrice: 310,
    ninetyDayPrice: 1399,
    regularPrice: 310,
    moveInOutPrice: 665,
  },
  {
    id: '5001_plus',
    label: '5,000+ sq ft',
    minSqft: 5000,
    maxSqft: 999999,
    bedroomRange: 'Custom Quote Required',
    requiresEstimate: true,
    deepPrice: 550,
    maintenancePrice: 350,
    ninetyDayPrice: 1599,
    regularPrice: 0,
    moveInOutPrice: 0,
  },
];

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  states: [
    { code: 'TX', name: 'Texas', multiplier: 1.0 },
    { code: 'CA', name: 'California', multiplier: 1.1 },
    { code: 'NY', name: 'New York', multiplier: 1.15 },
  ],
  serviceTypes: [
    { id: 'regular', name: 'Standard Cleaning', allowsRecurring: true },
    { id: 'deep', name: 'Deep Cleaning', allowsRecurring: false },
    { id: 'move_in_out', name: 'Move-In/Out Cleaning', allowsRecurring: false },
  ],
  frequencies: [
    { id: 'one_time', name: 'One-time', discount: 0 },
    { id: 'weekly', name: 'Weekly', recurringMultiplier: 1.0, cleansPerMonth: 4, discount: 0.15 },
    { id: 'bi_weekly', name: 'Bi-Weekly', recurringMultiplier: 1.0, cleansPerMonth: 2, discount: 0.10 },
    { id: 'monthly', name: 'Monthly', recurringMultiplier: 1.0, cleansPerMonth: 1, discount: 0.05 },
  ],
};

/**
 * Universal Hybrid Pricing Model. Ported verbatim from AlphaLuxClean.
 * One-time cleanings get a flat $50 discount; recurring (regular only)
 * gets a frequency-specific %. State multiplier is applied to base price.
 */
export function calculateNewPricing(
  homeSizeId: string,
  serviceTypeId: string,
  frequencyId: string,
  stateCode: string,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): PricingResult {
  const homeSize = HOME_SIZE_RANGES.find((h) => h.id === homeSizeId);
  const serviceType = config.serviceTypes.find((s) => s.id === serviceTypeId);
  const frequency = config.frequencies.find((f) => f.id === frequencyId);
  const state = config.states.find((s) => s.code === stateCode);

  if (!homeSize || !serviceType || !frequency || !state) {
    throw new Error('Invalid pricing parameters');
  }

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
    };
  }

  let basePrice = 0;
  switch (serviceTypeId) {
    case 'regular':
      basePrice = homeSize.regularPrice;
      break;
    case 'deep':
      basePrice = homeSize.deepPrice;
      break;
    case 'move_in_out':
      basePrice = homeSize.moveInOutPrice;
      break;
    default:
      throw new Error(`Unknown service type: ${serviceTypeId}`);
  }

  basePrice = basePrice * state.multiplier;

  let finalPrice = basePrice;
  let discountAmount = 0;
  let mrrEstimate = 0;
  let arrEstimate = 0;
  let savings = '';
  let recurringDetails: PricingResult['recurringDetails'];

  if (frequencyId === 'one_time') {
    discountAmount = 50;
    finalPrice = basePrice - discountAmount;
    savings = 'Save $50 on your one-time cleaning!';
  } else if (serviceTypeId === 'regular' && frequency.cleansPerMonth) {
    const frequencyDiscount = frequency.discount || 0;
    discountAmount = basePrice * frequencyDiscount;
    finalPrice = basePrice - discountAmount;

    mrrEstimate = finalPrice * frequency.cleansPerMonth;
    arrEstimate = mrrEstimate * 12;

    recurringDetails = {
      perClean: finalPrice,
      cleansPerMonth: frequency.cleansPerMonth,
      monthlyTotal: mrrEstimate,
    };

    if (frequencyDiscount > 0) {
      savings = `You save ${(frequencyDiscount * 100).toFixed(0)}% on recurring cleanings!`;
    }
  }

  const depositAmount = finalPrice * DEPOSIT_PERCENTAGE;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountedPrice: Math.round(finalPrice * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    depositAmount: Math.round(depositAmount * 100) / 100,
    mrrEstimate: Math.round(mrrEstimate * 100) / 100,
    arrEstimate: Math.round(arrEstimate * 100) / 100,
    savings,
    tierLabel: homeSize.label,
    recurringDetails,
  };
}

export function getHomeSizeBySquareFootage(sqft: number): HomeSizeRange | null {
  return HOME_SIZE_RANGES.find((range) => sqft >= range.minSqft && sqft <= range.maxSqft) || null;
}
