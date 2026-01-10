// ============================================================================
// AI PRICING ENGINE FOR CLEANING COMPANIES
// Comprehensive pricing calculation with full customization support
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export type PricingMethod = 
  | 'bedroom_bathroom'
  | 'sqft'
  | 'sqft_tiered'
  | 'flat_rate'
  | 'hourly'
  | 'room_count'
  | 'hybrid';

export type HomeType = 'studio' | '1br' | '2br' | '3br' | '4br' | '5br' | '6br_plus';

export interface PricingInput {
  businessId: string;
  
  // Property details
  bedrooms: number;
  bathrooms: number;
  halfBaths?: number;
  squareFootage?: number;
  homeType?: HomeType;
  floors?: number;
  
  // Service details
  serviceType: string; // 'standard', 'deep', 'move_out', etc.
  frequency: string; // 'one_time', 'weekly', 'biweekly', 'monthly'
  
  // Add-ons
  addons?: Array<{
    slug: string;
    quantity: number;
  }>;
  
  // Condition factors
  pets?: {
    count: number;
    shedding?: 'low' | 'medium' | 'heavy';
  };
  lastCleanedDays?: number;
  clutterLevel?: 'none' | 'light' | 'moderate' | 'heavy';
  hasHighCeilings?: boolean;
  stairFlights?: number;
  
  // Location
  zipCode?: string;
  
  // Timing
  requestedDate?: string; // ISO date string
  requestedTime?: string; // HH:MM format
  hoursNotice?: number;
  
  // Customer context
  isNewCustomer?: boolean;
  isFirstBooking?: boolean;
}

export interface AddonBreakdownItem {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

export interface ConditionBreakdownItem {
  type: string;
  name: string;
  amount: number;
  description?: string;
}

export interface TimeBreakdownItem {
  type: string;
  name: string;
  amount: number;
  adjustment_percent?: number;
}

export interface PricingBreakdown {
  // Method used
  method: PricingMethod;
  
  // Base calculation
  basePrice: number;
  baseCalculationDetails: {
    bedroomCharge: number;
    bathroomCharge: number;
    sqftCharge: number;
    hourlyCharge: number;
    flatRateCharge: number;
  };
  
  // Service multiplier
  serviceMultiplier: number;
  serviceMultiplierName: string;
  servicePrice: number;
  
  // Add-ons
  addonsTotal: number;
  addonsBreakdown: AddonBreakdownItem[];
  
  // Subtotal before adjustments
  subtotalBeforeAdjustments: number;
  
  // Condition surcharges
  conditionSurcharges: number;
  conditionBreakdown: ConditionBreakdownItem[];
  
  // Geographic adjustments
  geographicAdjustment: number;
  geographicZoneName?: string;
  travelFee: number;
  travelFeeWaived: boolean;
  
  // Time-based adjustments
  timePremium: number;
  timeBreakdown: TimeBreakdownItem[];
  
  // Frequency discount
  frequencyDiscount: number;
  frequencyDiscountPercent: number;
  frequencyName: string;
  
  // Pre-tax subtotal
  subtotal: number;
  
  // Tax
  taxRate: number;
  taxAmount: number;
  
  // Final total
  total: number;
  
  // Deposit
  depositAmount: number;
  depositPercent: number;
  balanceDue: number;
  
  // Time estimate
  estimatedDurationMinutes: number;
  estimatedDurationDisplay: string;
  
  // Savings display
  savingsFromFrequency: number;
  originalPriceBeforeDiscount: number;
  
  // Minimum order check
  meetsMinimumOrder: boolean;
  minimumOrderAmount: number;
  
  // Currency
  currency: string;
  
  // Formatted display strings
  formattedTotal: string;
  formattedDeposit: string;
  formattedSavings: string;
}

// ============================================================================
// DATABASE TYPES (matching our schema)
// ============================================================================

interface PricingConfig {
  id: string;
  business_id: string;
  pricing_method: PricingMethod;
  base_price: number;
  per_bedroom: number;
  per_bathroom: number;
  per_half_bath: number;
  price_per_sqft: number;
  sqft_minimum_charge: number;
  hourly_rate: number;
  minimum_hours: number;
  team_size_default: number;
  flat_rates: Record<HomeType, number>;
  minimum_charge: number;
  currency: string;
  tax_rate: number;
  tax_included: boolean;
  require_deposit: boolean;
  deposit_type: 'percentage' | 'flat' | 'full';
  deposit_value: number;
  deposit_minimum: number;
}

interface SqftTier {
  id: string;
  min_sqft: number;
  max_sqft: number | null;
  price_per_sqft: number;
  service_type: string;
}

interface ServiceMultiplier {
  id: string;
  service_type: string;
  display_name: string;
  multiplier: number;
  time_multiplier: number;
  is_active: boolean;
}

interface Addon {
  id: string;
  category: string;
  name: string;
  slug: string;
  price_type: 'flat' | 'per_unit' | 'per_sqft' | 'percentage';
  price: number;
  unit_name: string | null;
  additional_minutes: number;
  percentage?: number;
}

interface FrequencyDiscount {
  id: string;
  frequency: string;
  display_name: string;
  discount_percent: number;
  discount_amount: number | null;
  is_baseline: boolean;
}

interface ConditionSurcharge {
  id: string;
  surcharge_type: string;
  name: string;
  conditions: Record<string, unknown>;
  surcharge_calc_type: 'percent' | 'flat' | 'per_unit';
  surcharge_value: number;
  unit_label: string | null;
  max_surcharge: number | null;
}

interface PricingZone {
  id: string;
  zone_name: string;
  zone_type: string;
  zip_codes: string[] | null;
  adjustment_type: 'percent' | 'flat' | 'multiplier';
  adjustment_value: number;
  travel_fee: number;
  travel_fee_waive_above: number | null;
  minimum_order: number | null;
}

interface TimePricing {
  id: string;
  pricing_type: string;
  name: string;
  conditions: Record<string, unknown>;
  adjustment_type: 'percent' | 'flat';
  adjustment_value: number;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_CONFIG: PricingConfig = {
  id: '',
  business_id: '',
  pricing_method: 'bedroom_bathroom',
  base_price: 120,
  per_bedroom: 15,
  per_bathroom: 25,
  per_half_bath: 12.5,
  price_per_sqft: 0.10,
  sqft_minimum_charge: 100,
  hourly_rate: 35,
  minimum_hours: 2,
  team_size_default: 1,
  flat_rates: {
    studio: 90,
    '1br': 120,
    '2br': 160,
    '3br': 200,
    '4br': 260,
    '5br': 320,
    '6br_plus': 400,
  },
  minimum_charge: 100,
  currency: 'USD',
  tax_rate: 0,
  tax_included: false,
  require_deposit: true,
  deposit_type: 'percentage',
  deposit_value: 25,
  deposit_minimum: 25,
};

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

export async function calculatePrice(
  supabase: SupabaseClient,
  input: PricingInput
): Promise<PricingBreakdown> {
  // 1. Fetch all pricing configuration in parallel
  // Use any type cast to avoid TypeScript deep instantiation issues with Supabase types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [
    configResult,
    sqftTiersResult,
    serviceMultipliersResult,
    addonsResult,
    frequencyDiscountsResult,
    conditionSurchargesResult,
    pricingZonesResult,
    timePricingResult
  ] = await Promise.all([
    client
      .from('cleaning_pricing_config')
      .select('*')
      .eq('business_id', input.businessId)
      .single(),
    client
      .from('cleaning_sqft_tiers')
      .select('*')
      .or(`business_id.eq.${input.businessId},business_id.is.null`)
      .eq('is_active', true)
      .order('min_sqft', { ascending: true }),
    client
      .from('cleaning_service_multipliers')
      .select('*')
      .or(`business_id.eq.${input.businessId},business_id.is.null`)
      .eq('is_active', true),
    client
      .from('cleaning_addons')
      .select('*')
      .or(`business_id.eq.${input.businessId},business_id.is.null`)
      .eq('active', true),
    client
      .from('cleaning_frequency_discounts')
      .select('*')
      .or(`business_id.eq.${input.businessId},business_id.is.null`)
      .eq('is_active', true),
    client
      .from('cleaning_condition_surcharges')
      .select('*')
      .or(`business_id.eq.${input.businessId},business_id.is.null`)
      .eq('is_active', true),
    client
      .from('cleaning_pricing_zones')
      .select('*')
      .eq('business_id', input.businessId)
      .eq('is_active', true),
    client
      .from('cleaning_time_pricing')
      .select('*')
      .or(`business_id.eq.${input.businessId},business_id.is.null`)
      .eq('is_active', true),
  ]);

  // Use defaults if no config found, cast to proper types
  const config: PricingConfig = (configResult.data as PricingConfig | null) || DEFAULT_CONFIG;
  const sqftTiers: SqftTier[] = (sqftTiersResult.data as SqftTier[] | null) || [];
  const serviceMultipliers: ServiceMultiplier[] = (serviceMultipliersResult.data as ServiceMultiplier[] | null) || [];
  const allAddons: Addon[] = (addonsResult.data as Addon[] | null) || [];
  const frequencyDiscounts: FrequencyDiscount[] = (frequencyDiscountsResult.data as FrequencyDiscount[] | null) || [];
  const conditionSurcharges: ConditionSurcharge[] = (conditionSurchargesResult.data as ConditionSurcharge[] | null) || [];
  const pricingZones: PricingZone[] = (pricingZonesResult.data as PricingZone[] | null) || [];
  const timePricing: TimePricing[] = (timePricingResult.data as TimePricing[] | null) || [];

  // 2. Calculate base price based on pricing method
  const { basePrice, baseCalculationDetails } = calculateBasePrice(config, input, sqftTiers);

  // 3. Apply service type multiplier
  const serviceMultiplierData = getServiceMultiplier(serviceMultipliers, input.serviceType);
  const servicePrice = round(basePrice * serviceMultiplierData.multiplier);

  // 4. Calculate add-ons
  const { addonsTotal, addonsBreakdown } = calculateAddons(allAddons, input.addons, input.squareFootage, servicePrice);

  // 5. Calculate subtotal before adjustments
  const subtotalBeforeAdjustments = servicePrice + addonsTotal;

  // 6. Calculate condition surcharges
  const { conditionSurchargesTotal, conditionBreakdown } = calculateConditionSurcharges(
    conditionSurcharges,
    input,
    subtotalBeforeAdjustments
  );

  // 7. Calculate geographic adjustment
  const { geoAdjustment, travelFee, travelFeeWaived, zoneName, zoneMinimum } = calculateGeographicPricing(
    pricingZones,
    input.zipCode,
    subtotalBeforeAdjustments
  );

  // 8. Calculate time-based premium
  const { timePremiumTotal, timeBreakdown } = calculateTimePricing(
    timePricing,
    input,
    subtotalBeforeAdjustments
  );

  // 9. Calculate subtotal before frequency discount
  const subtotalBeforeDiscount = subtotalBeforeAdjustments + conditionSurchargesTotal + geoAdjustment + travelFee + timePremiumTotal;

  // 10. Apply frequency discount
  const frequencyData = getFrequencyDiscount(frequencyDiscounts, input.frequency);
  const frequencyDiscountAmount = frequencyData.discount_amount 
    ? frequencyData.discount_amount 
    : round(subtotalBeforeDiscount * frequencyData.discount_percent);

  // 11. Calculate subtotal after discount
  const subtotal = Math.max(0, subtotalBeforeDiscount - frequencyDiscountAmount);

  // 12. Calculate tax
  const taxRate = config.tax_rate || 0;
  const taxAmount = config.tax_included ? 0 : round(subtotal * taxRate);

  // 13. Calculate total
  const total = round(subtotal + taxAmount);

  // 14. Apply minimum order check
  const minimumOrder = zoneMinimum || config.minimum_charge || 100;
  const meetsMinimumOrder = total >= minimumOrder;

  // 15. Calculate deposit
  let depositAmount = 0;
  if (config.require_deposit) {
    switch (config.deposit_type) {
      case 'percentage':
        depositAmount = round(total * (config.deposit_value / 100));
        break;
      case 'flat':
        depositAmount = config.deposit_value;
        break;
      case 'full':
        depositAmount = total;
        break;
    }
    depositAmount = Math.max(depositAmount, config.deposit_minimum);
    depositAmount = Math.min(depositAmount, total);
  }

  // 16. Estimate duration
  const estimatedDurationMinutes = calculateDuration(
    config,
    input,
    serviceMultiplierData.time_multiplier,
    addonsBreakdown
  );

  // Format duration display
  const hours = Math.floor(estimatedDurationMinutes / 60);
  const mins = estimatedDurationMinutes % 60;
  const estimatedDurationDisplay = hours > 0 
    ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`)
    : `${mins}m`;

  // Return full breakdown
  return {
    method: config.pricing_method,
    
    basePrice,
    baseCalculationDetails,
    
    serviceMultiplier: serviceMultiplierData.multiplier,
    serviceMultiplierName: serviceMultiplierData.display_name,
    servicePrice,
    
    addonsTotal,
    addonsBreakdown,
    
    subtotalBeforeAdjustments,
    
    conditionSurcharges: conditionSurchargesTotal,
    conditionBreakdown,
    
    geographicAdjustment: geoAdjustment,
    geographicZoneName: zoneName,
    travelFee,
    travelFeeWaived,
    
    timePremium: timePremiumTotal,
    timeBreakdown,
    
    frequencyDiscount: frequencyDiscountAmount,
    frequencyDiscountPercent: frequencyData.discount_percent * 100,
    frequencyName: frequencyData.display_name,
    
    subtotal,
    
    taxRate: taxRate * 100,
    taxAmount,
    
    total,
    
    depositAmount,
    depositPercent: config.require_deposit ? (config.deposit_type === 'percentage' ? config.deposit_value : (depositAmount / total) * 100) : 0,
    balanceDue: round(total - depositAmount),
    
    estimatedDurationMinutes,
    estimatedDurationDisplay,
    
    savingsFromFrequency: frequencyDiscountAmount,
    originalPriceBeforeDiscount: subtotalBeforeDiscount + taxAmount,
    
    meetsMinimumOrder,
    minimumOrderAmount: minimumOrder,
    
    currency: config.currency,
    
    formattedTotal: formatCurrency(total, config.currency),
    formattedDeposit: formatCurrency(depositAmount, config.currency),
    formattedSavings: formatCurrency(frequencyDiscountAmount, config.currency),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateBasePrice(
  config: PricingConfig,
  input: PricingInput,
  sqftTiers: SqftTier[]
): { basePrice: number; baseCalculationDetails: PricingBreakdown['baseCalculationDetails'] } {
  const details: PricingBreakdown['baseCalculationDetails'] = {
    bedroomCharge: 0,
    bathroomCharge: 0,
    sqftCharge: 0,
    hourlyCharge: 0,
    flatRateCharge: 0,
  };

  let basePrice = 0;

  switch (config.pricing_method) {
    case 'bedroom_bathroom': {
      // Base price + bedroom charges + bathroom charges
      const bedroomCharge = Math.max(0, input.bedrooms - 1) * config.per_bedroom;
      const bathroomCharge = Math.max(0, input.bathrooms - 1) * config.per_bathroom;
      const halfBathCharge = (input.halfBaths || 0) * config.per_half_bath;
      
      details.bedroomCharge = bedroomCharge;
      details.bathroomCharge = bathroomCharge + halfBathCharge;
      basePrice = config.base_price + bedroomCharge + bathroomCharge + halfBathCharge;
      break;
    }

    case 'sqft': {
      if (!input.squareFootage) {
        basePrice = config.sqft_minimum_charge;
      } else {
        details.sqftCharge = input.squareFootage * config.price_per_sqft;
        basePrice = Math.max(details.sqftCharge, config.sqft_minimum_charge);
      }
      break;
    }

    case 'sqft_tiered': {
      if (!input.squareFootage) {
        basePrice = config.sqft_minimum_charge;
      } else {
        const tieredPrice = calculateTieredSqft(input.squareFootage, sqftTiers);
        details.sqftCharge = tieredPrice;
        basePrice = Math.max(tieredPrice, config.sqft_minimum_charge);
      }
      break;
    }

    case 'flat_rate': {
      const homeType = input.homeType || getHomeTypeFromBedrooms(input.bedrooms);
      details.flatRateCharge = config.flat_rates[homeType] || config.flat_rates['3br'];
      basePrice = details.flatRateCharge;
      break;
    }

    case 'hourly': {
      const estimatedHours = estimateHoursFromSize(input, config);
      details.hourlyCharge = estimatedHours * config.hourly_rate * config.team_size_default;
      basePrice = Math.max(details.hourlyCharge, config.minimum_hours * config.hourly_rate);
      break;
    }

    case 'hybrid': {
      // Use the higher of bedroom/bathroom or sqft
      const bbPrice = config.base_price + 
        Math.max(0, input.bedrooms - 1) * config.per_bedroom +
        Math.max(0, input.bathrooms - 1) * config.per_bathroom;
      
      let sqftPrice = config.sqft_minimum_charge;
      if (input.squareFootage) {
        sqftPrice = Math.max(input.squareFootage * config.price_per_sqft, config.sqft_minimum_charge);
      }
      
      if (bbPrice >= sqftPrice) {
        details.bedroomCharge = Math.max(0, input.bedrooms - 1) * config.per_bedroom;
        details.bathroomCharge = Math.max(0, input.bathrooms - 1) * config.per_bathroom;
        basePrice = bbPrice;
      } else {
        details.sqftCharge = sqftPrice;
        basePrice = sqftPrice;
      }
      break;
    }

    default:
      basePrice = config.minimum_charge;
  }

  return { basePrice: round(basePrice), baseCalculationDetails: details };
}

function calculateTieredSqft(sqft: number, tiers: SqftTier[]): number {
  if (tiers.length === 0) return sqft * 0.10; // Default fallback

  let total = 0;
  let remaining = sqft;

  const sortedTiers = [...tiers].sort((a, b) => a.min_sqft - b.min_sqft);

  for (const tier of sortedTiers) {
    if (remaining <= 0) break;

    const tierStart = tier.min_sqft;
    const tierEnd = tier.max_sqft || Infinity;
    
    if (sqft < tierStart) continue;

    const sqftInTier = Math.min(remaining, tierEnd - tierStart + 1);
    total += sqftInTier * tier.price_per_sqft;
    remaining -= sqftInTier;
  }

  return round(total);
}

function getHomeTypeFromBedrooms(bedrooms: number): HomeType {
  if (bedrooms === 0) return 'studio';
  if (bedrooms === 1) return '1br';
  if (bedrooms === 2) return '2br';
  if (bedrooms === 3) return '3br';
  if (bedrooms === 4) return '4br';
  if (bedrooms === 5) return '5br';
  return '6br_plus';
}

function estimateHoursFromSize(input: PricingInput, config: PricingConfig): number {
  // Base estimate from bedrooms/bathrooms
  let hours = config.minimum_hours;
  hours += input.bedrooms * 0.5;
  hours += input.bathrooms * 0.5;
  
  // Adjust for square footage if available
  if (input.squareFootage) {
    const sqftHours = input.squareFootage / 500; // ~500 sqft per hour
    hours = Math.max(hours, sqftHours);
  }
  
  return Math.ceil(hours * 2) / 2; // Round to nearest 0.5
}

function getServiceMultiplier(
  multipliers: ServiceMultiplier[],
  serviceType: string
): ServiceMultiplier {
  const found = multipliers.find(m => m.service_type === serviceType);
  return found || {
    id: '',
    service_type: serviceType,
    display_name: 'Standard Cleaning',
    multiplier: 1.0,
    time_multiplier: 1.0,
    is_active: true,
  };
}

function calculateAddons(
  allAddons: Addon[],
  selectedAddons: PricingInput['addons'],
  squareFootage?: number,
  servicePrice?: number
): { addonsTotal: number; addonsBreakdown: AddonBreakdownItem[] } {
  if (!selectedAddons || selectedAddons.length === 0) {
    return { addonsTotal: 0, addonsBreakdown: [] };
  }

  const breakdown: AddonBreakdownItem[] = [];

  for (const selected of selectedAddons) {
    const addon = allAddons.find(a => a.slug === selected.slug);
    if (!addon) continue;

    let unitPrice = addon.price;
    let total = 0;

    switch (addon.price_type) {
      case 'flat':
        total = addon.price;
        break;
      case 'per_unit':
        total = addon.price * selected.quantity;
        break;
      case 'per_sqft':
        total = addon.price * (squareFootage || 0);
        unitPrice = total;
        break;
      case 'percentage':
        total = (servicePrice || 0) * ((addon.percentage || addon.price) / 100);
        unitPrice = total;
        break;
    }

    breakdown.push({
      slug: addon.slug,
      name: addon.name,
      quantity: selected.quantity,
      unitPrice: round(unitPrice),
      total: round(total),
      category: addon.category,
    });
  }

  return {
    addonsTotal: round(breakdown.reduce((sum, item) => sum + item.total, 0)),
    addonsBreakdown: breakdown,
  };
}

function getFrequencyDiscount(
  discounts: FrequencyDiscount[],
  frequency: string
): FrequencyDiscount {
  const found = discounts.find(d => d.frequency === frequency);
  return found || {
    id: '',
    frequency,
    display_name: 'One-Time',
    discount_percent: 0,
    discount_amount: null,
    is_baseline: true,
  };
}

function calculateConditionSurcharges(
  surcharges: ConditionSurcharge[],
  input: PricingInput,
  baseAmount: number
): { conditionSurchargesTotal: number; conditionBreakdown: ConditionBreakdownItem[] } {
  const breakdown: ConditionBreakdownItem[] = [];

  // Pet surcharges
  if (input.pets && input.pets.count > 0) {
    const petSurcharges = surcharges.filter(s => s.surcharge_type === 'pets');
    for (const surcharge of petSurcharges) {
      const conditions = surcharge.conditions as { min_pets?: number; max_pets?: number; shedding?: string };
      
      // Check pet count conditions
      if (conditions.min_pets !== undefined && input.pets.count < conditions.min_pets) continue;
      if (conditions.max_pets !== undefined && input.pets.count > conditions.max_pets) continue;
      
      // Check shedding condition
      if (conditions.shedding && input.pets.shedding !== conditions.shedding) continue;

      const amount = calculateSurchargeAmount(surcharge, baseAmount, input.pets.count);
      breakdown.push({
        type: 'pets',
        name: surcharge.name,
        amount,
        description: `${input.pets.count} pet${input.pets.count > 1 ? 's' : ''}`,
      });
      break; // Only apply one pet surcharge
    }
  }

  // Last cleaned surcharges
  if (input.lastCleanedDays !== undefined && input.lastCleanedDays > 0) {
    const cleanedSurcharges = surcharges.filter(s => s.surcharge_type === 'last_cleaned');
    for (const surcharge of cleanedSurcharges) {
      const conditions = surcharge.conditions as { min_days?: number; max_days?: number };
      
      if (conditions.min_days !== undefined && input.lastCleanedDays < conditions.min_days) continue;
      if (conditions.max_days !== undefined && input.lastCleanedDays > conditions.max_days) continue;

      const amount = calculateSurchargeAmount(surcharge, baseAmount);
      breakdown.push({
        type: 'last_cleaned',
        name: surcharge.name,
        amount,
        description: `Not cleaned in ${input.lastCleanedDays} days`,
      });
      break;
    }
  }

  // Clutter surcharges
  if (input.clutterLevel && input.clutterLevel !== 'none') {
    const clutterSurcharges = surcharges.filter(s => s.surcharge_type === 'clutter');
    for (const surcharge of clutterSurcharges) {
      const conditions = surcharge.conditions as { level?: string };
      if (conditions.level !== input.clutterLevel) continue;

      const amount = calculateSurchargeAmount(surcharge, baseAmount);
      breakdown.push({
        type: 'clutter',
        name: surcharge.name,
        amount,
        description: `${input.clutterLevel} clutter level`,
      });
      break;
    }
  }

  // Stairs surcharges
  if (input.stairFlights && input.stairFlights > 0) {
    const stairSurcharges = surcharges.filter(s => s.surcharge_type === 'stairs');
    for (const surcharge of stairSurcharges) {
      const amount = calculateSurchargeAmount(surcharge, baseAmount, input.stairFlights);
      if (amount > 0) {
        breakdown.push({
          type: 'stairs',
          name: surcharge.name,
          amount,
          description: `${input.stairFlights} flight${input.stairFlights > 1 ? 's' : ''} of stairs`,
        });
      }
      break;
    }
  }

  // High ceilings
  if (input.hasHighCeilings) {
    const ceilingSurcharges = surcharges.filter(s => s.surcharge_type === 'high_ceilings');
    for (const surcharge of ceilingSurcharges) {
      const amount = calculateSurchargeAmount(surcharge, baseAmount);
      breakdown.push({
        type: 'high_ceilings',
        name: surcharge.name,
        amount,
      });
      break;
    }
  }

  return {
    conditionSurchargesTotal: round(breakdown.reduce((sum, item) => sum + item.amount, 0)),
    conditionBreakdown: breakdown,
  };
}

function calculateSurchargeAmount(
  surcharge: ConditionSurcharge,
  baseAmount: number,
  units: number = 1
): number {
  let amount = 0;

  switch (surcharge.surcharge_calc_type) {
    case 'percent':
      amount = baseAmount * (surcharge.surcharge_value / 100);
      break;
    case 'flat':
      amount = surcharge.surcharge_value;
      break;
    case 'per_unit':
      amount = surcharge.surcharge_value * units;
      break;
  }

  // Apply max cap if set
  if (surcharge.max_surcharge !== null && amount > surcharge.max_surcharge) {
    amount = surcharge.max_surcharge;
  }

  return round(amount);
}

function calculateGeographicPricing(
  zones: PricingZone[],
  zipCode?: string,
  baseAmount: number = 0
): { geoAdjustment: number; travelFee: number; travelFeeWaived: boolean; zoneName?: string; zoneMinimum?: number } {
  if (!zipCode || zones.length === 0) {
    return { geoAdjustment: 0, travelFee: 0, travelFeeWaived: false };
  }

  // Find matching zone by zip code
  const matchingZone = zones.find(zone => 
    zone.zip_codes?.includes(zipCode)
  );

  if (!matchingZone) {
    return { geoAdjustment: 0, travelFee: 0, travelFeeWaived: false };
  }

  let geoAdjustment = 0;
  switch (matchingZone.adjustment_type) {
    case 'percent':
      geoAdjustment = baseAmount * (matchingZone.adjustment_value / 100);
      break;
    case 'flat':
      geoAdjustment = matchingZone.adjustment_value;
      break;
    case 'multiplier':
      geoAdjustment = baseAmount * (matchingZone.adjustment_value - 1);
      break;
  }

  // Calculate travel fee
  let travelFee = matchingZone.travel_fee || 0;
  let travelFeeWaived = false;

  if (travelFee > 0 && matchingZone.travel_fee_waive_above) {
    if (baseAmount >= matchingZone.travel_fee_waive_above) {
      travelFeeWaived = true;
      travelFee = 0;
    }
  }

  return {
    geoAdjustment: round(geoAdjustment),
    travelFee: round(travelFee),
    travelFeeWaived,
    zoneName: matchingZone.zone_name,
    zoneMinimum: matchingZone.minimum_order || undefined,
  };
}

function calculateTimePricing(
  timePricingRules: TimePricing[],
  input: PricingInput,
  baseAmount: number
): { timePremiumTotal: number; timeBreakdown: TimeBreakdownItem[] } {
  const breakdown: TimeBreakdownItem[] = [];

  if (timePricingRules.length === 0) {
    return { timePremiumTotal: 0, timeBreakdown: [] };
  }

  // Check rush/same-day/next-day pricing
  if (input.hoursNotice !== undefined) {
    for (const rule of timePricingRules) {
      const conditions = rule.conditions as { hours_notice?: number };
      
      if (['same_day', 'next_day', 'rush'].includes(rule.pricing_type)) {
        if (conditions.hours_notice !== undefined && input.hoursNotice <= conditions.hours_notice) {
          const amount = rule.adjustment_type === 'percent'
            ? baseAmount * (rule.adjustment_value / 100)
            : rule.adjustment_value;
          
          breakdown.push({
            type: rule.pricing_type,
            name: rule.name,
            amount: round(amount),
            adjustment_percent: rule.adjustment_type === 'percent' ? rule.adjustment_value : undefined,
          });
          break; // Only apply one rush tier
        }
      }
    }
  }

  // Check day-of-week pricing
  if (input.requestedDate) {
    const dayOfWeek = new Date(input.requestedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    for (const rule of timePricingRules) {
      if (rule.pricing_type !== 'weekend') continue;
      
      const conditions = rule.conditions as { days?: string[] };
      if (conditions.days?.includes(dayOfWeek)) {
        const amount = rule.adjustment_type === 'percent'
          ? baseAmount * (rule.adjustment_value / 100)
          : rule.adjustment_value;
        
        breakdown.push({
          type: 'weekend',
          name: rule.name,
          amount: round(amount),
          adjustment_percent: rule.adjustment_type === 'percent' ? rule.adjustment_value : undefined,
        });
        break;
      }
    }
  }

  // Check time-of-day pricing (early bird, after hours)
  if (input.requestedTime) {
    for (const rule of timePricingRules) {
      if (!['early_bird', 'after_hours'].includes(rule.pricing_type)) continue;
      
      const conditions = rule.conditions as { start_time?: string; end_time?: string; weekdays_only?: boolean };
      
      if (conditions.start_time && conditions.end_time) {
        if (isTimeInRange(input.requestedTime, conditions.start_time, conditions.end_time)) {
          // Check weekdays_only condition
          if (conditions.weekdays_only && input.requestedDate) {
            const dayOfWeek = new Date(input.requestedDate).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends
          }
          
          const amount = rule.adjustment_type === 'percent'
            ? baseAmount * (rule.adjustment_value / 100)
            : rule.adjustment_value;
          
          breakdown.push({
            type: rule.pricing_type,
            name: rule.name,
            amount: round(amount),
            adjustment_percent: rule.adjustment_type === 'percent' ? rule.adjustment_value : undefined,
          });
        }
      }
    }
  }

  return {
    timePremiumTotal: round(breakdown.reduce((sum, item) => sum + item.amount, 0)),
    timeBreakdown: breakdown,
  };
}

function calculateDuration(
  config: PricingConfig,
  input: PricingInput,
  timeMultiplier: number,
  addonsBreakdown: AddonBreakdownItem[]
): number {
  // Base duration from property size
  let minutes = 60; // Minimum 1 hour

  if (config.pricing_method === 'bedroom_bathroom') {
    minutes = 45 + (input.bedrooms * 20) + (input.bathrooms * 25) + ((input.halfBaths || 0) * 15);
  } else if (config.pricing_method === 'sqft' && input.squareFootage) {
    minutes = Math.max(60, Math.ceil(input.squareFootage / 400) * 30);
  } else if (config.pricing_method === 'hourly') {
    const hours = estimateHoursFromSize(input, config);
    minutes = hours * 60;
  }

  // Apply service type time multiplier
  minutes = Math.ceil(minutes * timeMultiplier);

  // Add time for add-ons
  // Note: We'd need addon duration data, using estimate for now
  minutes += addonsBreakdown.length * 15;

  // Add time for condition factors
  if (input.clutterLevel === 'moderate') minutes += 30;
  if (input.clutterLevel === 'heavy') minutes += 60;
  if (input.stairFlights) minutes += input.stairFlights * 10;

  return minutes;
}

function isTimeInRange(time: string, start: string, end: string): boolean {
  return time >= start && time <= end;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ============================================================================
// QUICK ESTIMATE FUNCTION (for instant price preview)
// ============================================================================

export function quickEstimate(
  bedrooms: number,
  bathrooms: number,
  serviceType: string = 'standard',
  frequency: string = 'one_time'
): { min: number; max: number; average: number } {
  // Simple estimate without database lookup
  const basePrice = 120 + (Math.max(0, bedrooms - 1) * 15) + (Math.max(0, bathrooms - 1) * 25);
  
  const serviceMultipliers: Record<string, number> = {
    standard: 1.0,
    deep: 1.5,
    move_in: 1.6,
    move_out: 1.75,
    initial: 1.5,
    post_construction_final: 2.5,
    airbnb_turnover: 1.2,
  };
  
  const frequencyDiscounts: Record<string, number> = {
    one_time: 0,
    weekly: 0.20,
    biweekly: 0.15,
    monthly: 0.10,
    quarterly: 0.05,
  };
  
  const multiplier = serviceMultipliers[serviceType] || 1.0;
  const discount = frequencyDiscounts[frequency] || 0;
  
  const price = basePrice * multiplier * (1 - discount);
  
  return {
    min: Math.floor(price * 0.9),
    max: Math.ceil(price * 1.1),
    average: Math.round(price),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  calculateBasePrice,
  calculateTieredSqft,
  calculateAddons,
  calculateConditionSurcharges,
  calculateGeographicPricing,
  calculateTimePricing,
  getServiceMultiplier,
  getFrequencyDiscount,
};
