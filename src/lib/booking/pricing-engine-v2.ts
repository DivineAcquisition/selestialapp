// ============================================================================
// ADVANCED PRICING ENGINE V2
// Supports all pricing models with full customization
// ============================================================================

export type PricingMethod = 
  | 'bedroom_bathroom'
  | 'sqft'
  | 'sqft_tiered'
  | 'flat_rate'
  | 'hourly'
  | 'room_count'
  | 'hybrid';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface BedBathConfig {
  base_price: number;
  price_per_bedroom: number;
  price_per_bathroom: number;
  price_per_half_bath: number;
  price_per_additional_room: number;
  max_bedrooms: number;
  max_bathrooms: number;
  studio_price: number;
  include_common_areas: boolean;
}

export interface SqftConfig {
  price_per_sqft: number;
  minimum_sqft: number;
  maximum_sqft: number;
  minimum_charge: number;
  round_to_nearest: number;
}

export interface SqftTier {
  min_sqft: number;
  max_sqft: number;
  price_per_sqft: number;
  label: string;
}

export interface FlatRateTier {
  name: string;
  max_sqft: number;
  max_beds: number;
  multiplier: number;
}

export interface HourlyConfig {
  base_hourly_rate: number;
  minimum_hours: number;
  hour_increments: number;
  estimate_hours_per_bedroom: number;
  estimate_hours_per_bathroom: number;
  estimate_hours_base: number;
  show_time_estimate: boolean;
  allow_customer_select_hours: boolean;
}

export interface RoomCountConfig {
  price_per_room: number;
  base_price: number;
  count_bedrooms: boolean;
  count_bathrooms: boolean;
  count_kitchen: boolean;
  count_living_areas: boolean;
  kitchen_multiplier: number;
  bathroom_multiplier: number;
}

export interface DayPricingConfig {
  enabled: boolean;
  adjustments: Record<string, number>;
  adjustment_type: 'percentage' | 'flat';
}

export interface TimePricingConfig {
  enabled: boolean;
  early_bird: { start: string; end: string; adjustment: number };
  prime_time: { start: string; end: string; adjustment: number };
  evening: { start: string; end: string; adjustment: number };
}

export interface RushPricingConfig {
  enabled: boolean;
  same_day: { adjustment: number; type: 'percentage' | 'flat' };
  next_day: { adjustment: number; type: 'percentage' | 'flat' };
  within_48h: { adjustment: number; type: 'percentage' | 'flat' };
}

export interface PricingModel {
  primary_method: PricingMethod;
  bed_bath_config: BedBathConfig;
  sqft_config: SqftConfig;
  sqft_tiers: SqftTier[];
  flat_rate_config: { property_size_tiers: FlatRateTier[] };
  hourly_config: HourlyConfig;
  room_count_config: RoomCountConfig;
  service_multipliers: Record<string, number>;
  day_pricing: DayPricingConfig;
  time_pricing: TimePricingConfig;
  rush_pricing: RushPricingConfig;
  minimum_order: number;
  minimum_order_message: string;
  round_to_nearest: number;
  tax_rate: number;
  tax_included: boolean;
  tax_label: string;
}

export interface ServiceArea {
  id: string;
  name: string;
  zip_codes: string[];
  price_adjustment_type: 'none' | 'percentage' | 'flat' | 'multiplier';
  price_adjustment_value: number;
  minimum_order: number;
  travel_fee: number;
  travel_fee_waive_above?: number;
  area_message?: string;
  travel_message?: string;
}

export interface Promotion {
  id: string;
  name: string;
  promo_type: string;
  has_pricing_impact: boolean;
  discount_type: 'percentage' | 'flat' | 'fixed_price';
  discount_value: number;
  promo_code?: string;
  discount_conditions: {
    applies_to_services: string[];
    applies_to_frequencies: string[];
    minimum_order?: number;
    first_time_only: boolean;
    new_customers_only: boolean;
    requires_code: boolean;
  };
}

// ============================================================================
// CALCULATION INPUT
// ============================================================================

export interface PriceCalculationInput {
  // Service
  serviceTypeId: string;
  serviceTypeSlug: string;
  serviceBasePrice: number;
  serviceMultiplier: number;
  
  // Property
  bedrooms: number;
  bathrooms: number;
  halfBaths?: number;
  sqft?: number;
  propertyType?: string;
  additionalRooms?: number;
  
  // Selected hours (for hourly pricing)
  selectedHours?: number;
  
  // Add-ons
  addons: Array<{
    id: string;
    name: string;
    priceType: 'flat' | 'per_unit' | 'per_sqft' | 'percentage';
    price: number;
    quantity: number;
    percentage?: number;
  }>;
  
  // Frequency
  frequencyId?: string;
  frequencyDiscountType?: 'percentage' | 'flat';
  frequencyDiscountValue?: number;
  
  // Location
  zipCode?: string;
  serviceArea?: ServiceArea;
  
  // Scheduling
  scheduledDate?: string;
  scheduledTime?: string;
  
  // Promo
  promoCode?: string;
  promotion?: Promotion;
  
  // Customer
  isNewCustomer?: boolean;
  isFirstBooking?: boolean;
}

// ============================================================================
// CALCULATION OUTPUT
// ============================================================================

export interface PriceBreakdown {
  // Base calculation
  method: PricingMethod;
  baseCalculation: {
    basePrice: number;
    bedroomCharge: number;
    bathroomCharge: number;
    sqftCharge: number;
    hourlyCharge: number;
    roomCharge: number;
  };
  
  // Service
  serviceSubtotal: number;
  serviceMultiplier: number;
  
  // Add-ons
  addons: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  addonsTotal: number;
  
  // Subtotal
  subtotal: number;
  
  // Area adjustments
  areaAdjustment: number;
  areaAdjustmentLabel?: string;
  travelFee: number;
  travelFeeWaived: boolean;
  
  // Time-based adjustments
  dayAdjustment: number;
  dayAdjustmentLabel?: string;
  timeAdjustment: number;
  timeAdjustmentLabel?: string;
  rushAdjustment: number;
  rushAdjustmentLabel?: string;
  
  // Discounts
  frequencyDiscount: number;
  frequencyDiscountPercent: number;
  promoDiscount: number;
  promoDiscountLabel?: string;
  totalDiscount: number;
  
  // Tax
  taxableAmount: number;
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
  
  // Final
  total: number;
  roundedTotal: number;
  
  // Minimum order check
  meetsMinimum: boolean;
  minimumOrder: number;
  minimumShortfall: number;
  
  // Deposit
  depositAmount: number;
  depositPercent: number;
  amountDueNow: number;
  amountDueLater: number;
  
  // Time estimate
  estimatedMinutes: number;
  estimatedHoursDisplay: string;
  
  // Savings
  savingsAmount: number;
  savingsPercent: number;
  
  // Per-visit price (for recurring)
  pricePerVisit: number;
  
  // Display helpers
  formattedTotal: string;
  formattedDeposit: string;
  formattedSavings: string;
}

// ============================================================================
// DEFAULT PRICING MODEL
// ============================================================================

export const DEFAULT_PRICING_MODEL: PricingModel = {
  primary_method: 'bedroom_bathroom',
  bed_bath_config: {
    base_price: 80,
    price_per_bedroom: 25,
    price_per_bathroom: 20,
    price_per_half_bath: 10,
    price_per_additional_room: 15,
    max_bedrooms: 10,
    max_bathrooms: 8,
    studio_price: 70,
    include_common_areas: true,
  },
  sqft_config: {
    price_per_sqft: 0.10,
    minimum_sqft: 500,
    maximum_sqft: 10000,
    minimum_charge: 100,
    round_to_nearest: 100,
  },
  sqft_tiers: [
    { min_sqft: 0, max_sqft: 1000, price_per_sqft: 0.12, label: 'Small' },
    { min_sqft: 1001, max_sqft: 2000, price_per_sqft: 0.10, label: 'Medium' },
    { min_sqft: 2001, max_sqft: 3000, price_per_sqft: 0.08, label: 'Large' },
    { min_sqft: 3001, max_sqft: 999999, price_per_sqft: 0.07, label: 'XL' },
  ],
  flat_rate_config: {
    property_size_tiers: [
      { name: 'Small', max_sqft: 1000, max_beds: 2, multiplier: 0.8 },
      { name: 'Medium', max_sqft: 2000, max_beds: 3, multiplier: 1.0 },
      { name: 'Large', max_sqft: 3000, max_beds: 4, multiplier: 1.3 },
      { name: 'XL', max_sqft: 999999, max_beds: 99, multiplier: 1.6 },
    ],
  },
  hourly_config: {
    base_hourly_rate: 45,
    minimum_hours: 2,
    hour_increments: 0.5,
    estimate_hours_per_bedroom: 0.5,
    estimate_hours_per_bathroom: 0.5,
    estimate_hours_base: 1.5,
    show_time_estimate: true,
    allow_customer_select_hours: false,
  },
  room_count_config: {
    price_per_room: 20,
    base_price: 60,
    count_bedrooms: true,
    count_bathrooms: true,
    count_kitchen: true,
    count_living_areas: true,
    kitchen_multiplier: 1.5,
    bathroom_multiplier: 1.2,
  },
  service_multipliers: {
    standard: 1.0,
    deep: 1.5,
    move: 2.0,
    construction: 2.5,
    airbnb: 1.2,
  },
  day_pricing: {
    enabled: false,
    adjustments: {
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 10,
      sun: 15,
    },
    adjustment_type: 'percentage',
  },
  time_pricing: {
    enabled: false,
    early_bird: { start: '07:00', end: '09:00', adjustment: -5 },
    prime_time: { start: '10:00', end: '14:00', adjustment: 0 },
    evening: { start: '17:00', end: '20:00', adjustment: 10 },
  },
  rush_pricing: {
    enabled: false,
    same_day: { adjustment: 25, type: 'percentage' },
    next_day: { adjustment: 15, type: 'percentage' },
    within_48h: { adjustment: 10, type: 'percentage' },
  },
  minimum_order: 75,
  minimum_order_message: 'Minimum order of $75 required',
  round_to_nearest: 5,
  tax_rate: 0,
  tax_included: false,
  tax_label: 'Sales Tax',
};

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

export function calculatePriceV2(
  input: PriceCalculationInput,
  pricingModel: PricingModel = DEFAULT_PRICING_MODEL,
  depositConfig: { type: 'percentage' | 'flat' | 'full'; value: number; minimum: number } = { type: 'percentage', value: 25, minimum: 25 }
): PriceBreakdown {
  const { primary_method } = pricingModel;
  
  // Initialize base calculation
  let baseCalculation = {
    basePrice: 0,
    bedroomCharge: 0,
    bathroomCharge: 0,
    sqftCharge: 0,
    hourlyCharge: 0,
    roomCharge: 0,
  };
  
  // ============================================================================
  // STEP 1: Calculate base price based on method
  // ============================================================================
  
  switch (primary_method) {
    case 'bedroom_bathroom':
      baseCalculation = calculateBedBath(input, pricingModel.bed_bath_config);
      break;
      
    case 'sqft':
      baseCalculation = calculateSqft(input, pricingModel.sqft_config);
      break;
      
    case 'sqft_tiered':
      baseCalculation = calculateSqftTiered(input, pricingModel.sqft_tiers, pricingModel.sqft_config);
      break;
      
    case 'flat_rate':
      baseCalculation = calculateFlatRate(input, pricingModel.flat_rate_config);
      break;
      
    case 'hourly':
      baseCalculation = calculateHourly(input, pricingModel.hourly_config);
      break;
      
    case 'room_count':
      baseCalculation = calculateRoomCount(input, pricingModel.room_count_config);
      break;
      
    case 'hybrid':
      baseCalculation = calculateHybrid(input, pricingModel);
      break;
  }
  
  // Calculate service subtotal with multiplier
  const baseTotal = Object.values(baseCalculation).reduce((sum, val) => sum + val, 0);
  const serviceMultiplier = pricingModel.service_multipliers[input.serviceTypeSlug] || input.serviceMultiplier || 1;
  const serviceSubtotal = round(baseTotal * serviceMultiplier);
  
  // ============================================================================
  // STEP 2: Calculate add-ons
  // ============================================================================
  
  const addonDetails = input.addons.map((addon) => {
    let total = 0;
    let unitPrice = addon.price;
    
    switch (addon.priceType) {
      case 'flat':
        total = addon.price;
        break;
      case 'per_unit':
        total = addon.price * addon.quantity;
        break;
      case 'per_sqft':
        total = addon.price * (input.sqft || 0);
        unitPrice = total;
        break;
      case 'percentage':
        total = serviceSubtotal * ((addon.percentage || 0) / 100);
        unitPrice = total;
        break;
    }
    
    return {
      id: addon.id,
      name: addon.name,
      quantity: addon.quantity,
      unitPrice: round(unitPrice),
      total: round(total),
    };
  });
  
  const addonsTotal = addonDetails.reduce((sum, a) => sum + a.total, 0);
  
  // ============================================================================
  // STEP 3: Calculate subtotal
  // ============================================================================
  
  const subtotal = serviceSubtotal + addonsTotal;
  
  // ============================================================================
  // STEP 4: Area adjustments
  // ============================================================================
  
  let areaAdjustment = 0;
  let areaAdjustmentLabel: string | undefined;
  let travelFee = 0;
  let travelFeeWaived = false;
  
  if (input.serviceArea) {
    const area = input.serviceArea;
    
    switch (area.price_adjustment_type) {
      case 'percentage':
        areaAdjustment = subtotal * (area.price_adjustment_value / 100);
        areaAdjustmentLabel = `${area.name} area (+${area.price_adjustment_value}%)`;
        break;
      case 'flat':
        areaAdjustment = area.price_adjustment_value;
        areaAdjustmentLabel = `${area.name} area (+$${area.price_adjustment_value})`;
        break;
      case 'multiplier':
        areaAdjustment = subtotal * (area.price_adjustment_value - 1);
        areaAdjustmentLabel = `${area.name} area (×${area.price_adjustment_value})`;
        break;
    }
    
    // Travel fee
    if (area.travel_fee > 0) {
      if (area.travel_fee_waive_above && subtotal >= area.travel_fee_waive_above) {
        travelFeeWaived = true;
      } else {
        travelFee = area.travel_fee;
      }
    }
  }
  
  // ============================================================================
  // STEP 5: Day/Time/Rush adjustments
  // ============================================================================
  
  let dayAdjustment = 0;
  let dayAdjustmentLabel: string | undefined;
  let timeAdjustment = 0;
  let timeAdjustmentLabel: string | undefined;
  let rushAdjustment = 0;
  let rushAdjustmentLabel: string | undefined;
  
  if (input.scheduledDate) {
    // Day of week adjustment
    if (pricingModel.day_pricing.enabled) {
      const dayOfWeek = new Date(input.scheduledDate).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      const dayAdj = pricingModel.day_pricing.adjustments[dayOfWeek] || 0;
      
      if (dayAdj !== 0) {
        if (pricingModel.day_pricing.adjustment_type === 'percentage') {
          dayAdjustment = subtotal * (dayAdj / 100);
          dayAdjustmentLabel = `${capitalize(dayOfWeek)} pricing (${dayAdj > 0 ? '+' : ''}${dayAdj}%)`;
        } else {
          dayAdjustment = dayAdj;
          dayAdjustmentLabel = `${capitalize(dayOfWeek)} pricing (${dayAdj > 0 ? '+' : ''}$${dayAdj})`;
        }
      }
    }
    
    // Rush pricing
    if (pricingModel.rush_pricing.enabled) {
      const now = new Date();
      const scheduled = new Date(input.scheduledDate);
      const hoursUntil = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntil < 24) {
        const rush = pricingModel.rush_pricing.same_day;
        rushAdjustment = rush.type === 'percentage' ? subtotal * (rush.adjustment / 100) : rush.adjustment;
        rushAdjustmentLabel = `Same-day booking (+${rush.adjustment}${rush.type === 'percentage' ? '%' : '$'})`;
      } else if (hoursUntil < 48) {
        const rush = pricingModel.rush_pricing.next_day;
        rushAdjustment = rush.type === 'percentage' ? subtotal * (rush.adjustment / 100) : rush.adjustment;
        rushAdjustmentLabel = `Next-day booking (+${rush.adjustment}${rush.type === 'percentage' ? '%' : '$'})`;
      } else if (hoursUntil < 72) {
        const rush = pricingModel.rush_pricing.within_48h;
        rushAdjustment = rush.type === 'percentage' ? subtotal * (rush.adjustment / 100) : rush.adjustment;
        rushAdjustmentLabel = `Short notice (+${rush.adjustment}${rush.type === 'percentage' ? '%' : '$'})`;
      }
    }
  }
  
  // Time of day adjustment
  if (input.scheduledTime && pricingModel.time_pricing.enabled) {
    const time = input.scheduledTime;
    const { early_bird, evening } = pricingModel.time_pricing;
    
    if (isTimeInRange(time, early_bird.start, early_bird.end)) {
      timeAdjustment = subtotal * (early_bird.adjustment / 100);
      timeAdjustmentLabel = `Early bird (${early_bird.adjustment}%)`;
    } else if (isTimeInRange(time, evening.start, evening.end)) {
      timeAdjustment = subtotal * (evening.adjustment / 100);
      timeAdjustmentLabel = `Evening (+${evening.adjustment}%)`;
    }
  }
  
  // ============================================================================
  // STEP 6: Discounts
  // ============================================================================
  
  let frequencyDiscount = 0;
  let frequencyDiscountPercent = 0;
  
  if (input.frequencyDiscountValue && input.frequencyDiscountValue > 0) {
    if (input.frequencyDiscountType === 'percentage') {
      frequencyDiscount = subtotal * (input.frequencyDiscountValue / 100);
      frequencyDiscountPercent = input.frequencyDiscountValue;
    } else {
      frequencyDiscount = input.frequencyDiscountValue;
      frequencyDiscountPercent = (input.frequencyDiscountValue / subtotal) * 100;
    }
  }
  
  // Promo discount
  let promoDiscount = 0;
  let promoDiscountLabel: string | undefined;
  
  if (input.promotion && input.promotion.has_pricing_impact) {
    const promo = input.promotion;
    
    // Check conditions
    let promoApplies = true;
    
    if (promo.discount_conditions.applies_to_services.length > 0) {
      promoApplies = promo.discount_conditions.applies_to_services.includes(input.serviceTypeId);
    }
    
    if (promo.discount_conditions.minimum_order && subtotal < promo.discount_conditions.minimum_order) {
      promoApplies = false;
    }
    
    if (promo.discount_conditions.new_customers_only && !input.isNewCustomer) {
      promoApplies = false;
    }
    
    if (promo.discount_conditions.first_time_only && !input.isFirstBooking) {
      promoApplies = false;
    }
    
    if (promoApplies) {
      switch (promo.discount_type) {
        case 'percentage':
          promoDiscount = subtotal * (promo.discount_value / 100);
          promoDiscountLabel = `${promo.name} (-${promo.discount_value}%)`;
          break;
        case 'flat':
          promoDiscount = promo.discount_value;
          promoDiscountLabel = `${promo.name} (-$${promo.discount_value})`;
          break;
        case 'fixed_price':
          promoDiscount = subtotal - promo.discount_value;
          promoDiscountLabel = `${promo.name} (Special price: $${promo.discount_value})`;
          break;
      }
    }
  }
  
  const totalDiscount = frequencyDiscount + promoDiscount;
  
  // ============================================================================
  // STEP 7: Calculate pre-tax total
  // ============================================================================
  
  const preTaxTotal = Math.max(0,
    subtotal +
    areaAdjustment +
    travelFee +
    dayAdjustment +
    timeAdjustment +
    rushAdjustment -
    totalDiscount
  );
  
  // ============================================================================
  // STEP 8: Tax
  // ============================================================================
  
  let taxAmount = 0;
  const taxRate = pricingModel.tax_rate || 0;
  const taxLabel = pricingModel.tax_label || 'Tax';
  
  if (taxRate > 0 && !pricingModel.tax_included) {
    taxAmount = preTaxTotal * taxRate;
  }
  
  const taxableAmount = preTaxTotal;
  
  // ============================================================================
  // STEP 9: Final total
  // ============================================================================
  
  const total = preTaxTotal + taxAmount;
  const roundedTotal = roundToNearest(total, pricingModel.round_to_nearest || 1);
  
  // ============================================================================
  // STEP 10: Minimum order check
  // ============================================================================
  
  const minimumOrder = input.serviceArea?.minimum_order || pricingModel.minimum_order || 0;
  const meetsMinimum = roundedTotal >= minimumOrder;
  const minimumShortfall = meetsMinimum ? 0 : minimumOrder - roundedTotal;
  
  // ============================================================================
  // STEP 11: Deposit calculation
  // ============================================================================
  
  let depositAmount = 0;
  let depositPercent = 0;
  
  switch (depositConfig.type) {
    case 'percentage':
      depositAmount = roundedTotal * (depositConfig.value / 100);
      depositPercent = depositConfig.value;
      break;
    case 'flat':
      depositAmount = depositConfig.value;
      depositPercent = (depositConfig.value / roundedTotal) * 100;
      break;
    case 'full':
      depositAmount = roundedTotal;
      depositPercent = 100;
      break;
  }
  
  depositAmount = Math.max(depositAmount, depositConfig.minimum);
  depositAmount = Math.min(depositAmount, roundedTotal);
  depositAmount = round(depositAmount);
  
  // ============================================================================
  // STEP 12: Time estimate
  // ============================================================================
  
  let estimatedMinutes = 60; // Base
  
  if (primary_method === 'bedroom_bathroom') {
    estimatedMinutes = 45 + (input.bedrooms * 20) + ((input.bathrooms + (input.halfBaths || 0) * 0.5) * 25);
  } else if (primary_method === 'sqft' && input.sqft) {
    estimatedMinutes = Math.max(60, Math.ceil(input.sqft / 400) * 30);
  } else if (primary_method === 'hourly' && input.selectedHours) {
    estimatedMinutes = input.selectedHours * 60;
  }
  
  // Apply service multiplier to time
  estimatedMinutes = Math.ceil(estimatedMinutes * serviceMultiplier);
  
  const minHours = Math.floor(estimatedMinutes / 60);
  const maxHours = Math.ceil((estimatedMinutes * 1.2) / 60);
  const estimatedHoursDisplay = minHours === maxHours
    ? `${minHours} hour${minHours !== 1 ? 's' : ''}`
    : `${minHours}-${maxHours} hours`;
  
  // ============================================================================
  // STEP 13: Savings calculation
  // ============================================================================
  
  const originalPrice = subtotal + areaAdjustment + travelFee + dayAdjustment + timeAdjustment + rushAdjustment + taxAmount;
  const savingsAmount = Math.max(0, originalPrice - roundedTotal);
  const savingsPercent = originalPrice > 0 ? (savingsAmount / originalPrice) * 100 : 0;
  
  // ============================================================================
  // RETURN BREAKDOWN
  // ============================================================================
  
  return {
    method: primary_method,
    baseCalculation,
    
    serviceSubtotal: round(serviceSubtotal),
    serviceMultiplier,
    
    addons: addonDetails,
    addonsTotal: round(addonsTotal),
    
    subtotal: round(subtotal),
    
    areaAdjustment: round(areaAdjustment),
    areaAdjustmentLabel,
    travelFee: round(travelFee),
    travelFeeWaived,
    
    dayAdjustment: round(dayAdjustment),
    dayAdjustmentLabel,
    timeAdjustment: round(timeAdjustment),
    timeAdjustmentLabel,
    rushAdjustment: round(rushAdjustment),
    rushAdjustmentLabel,
    
    frequencyDiscount: round(frequencyDiscount),
    frequencyDiscountPercent: round(frequencyDiscountPercent),
    promoDiscount: round(promoDiscount),
    promoDiscountLabel,
    totalDiscount: round(totalDiscount),
    
    taxableAmount: round(taxableAmount),
    taxAmount: round(taxAmount),
    taxRate,
    taxLabel,
    
    total: round(total),
    roundedTotal,
    
    meetsMinimum,
    minimumOrder,
    minimumShortfall: round(minimumShortfall),
    
    depositAmount,
    depositPercent: round(depositPercent),
    amountDueNow: depositAmount,
    amountDueLater: round(roundedTotal - depositAmount),
    
    estimatedMinutes,
    estimatedHoursDisplay,
    
    savingsAmount: round(savingsAmount),
    savingsPercent: round(savingsPercent),
    
    pricePerVisit: roundedTotal,
    
    formattedTotal: `$${roundedTotal.toFixed(2)}`,
    formattedDeposit: `$${depositAmount.toFixed(2)}`,
    formattedSavings: `$${savingsAmount.toFixed(2)}`,
  };
}

// ============================================================================
// PRICING METHOD CALCULATORS
// ============================================================================

function calculateBedBath(input: PriceCalculationInput, config: BedBathConfig) {
  // Handle studio
  if (input.bedrooms === 0) {
    return {
      basePrice: config.studio_price,
      bedroomCharge: 0,
      bathroomCharge: 0,
      sqftCharge: 0,
      hourlyCharge: 0,
      roomCharge: 0,
    };
  }
  
  const fullBaths = Math.floor(input.bathrooms);
  const halfBaths = input.halfBaths || ((input.bathrooms % 1) >= 0.5 ? 1 : 0);
  
  return {
    basePrice: config.base_price,
    bedroomCharge: Math.min(input.bedrooms, config.max_bedrooms) * config.price_per_bedroom,
    bathroomCharge: 
      (Math.min(fullBaths, config.max_bathrooms) * config.price_per_bathroom) +
      (halfBaths * config.price_per_half_bath),
    sqftCharge: 0,
    hourlyCharge: 0,
    roomCharge: (input.additionalRooms || 0) * config.price_per_additional_room,
  };
}

function calculateSqft(input: PriceCalculationInput, config: SqftConfig) {
  const sqft = Math.max(config.minimum_sqft, Math.min(input.sqft || 0, config.maximum_sqft));
  const roundedSqft = roundToNearest(sqft, config.round_to_nearest);
  const sqftCharge = Math.max(config.minimum_charge, roundedSqft * config.price_per_sqft);
  
  return {
    basePrice: 0,
    bedroomCharge: 0,
    bathroomCharge: 0,
    sqftCharge,
    hourlyCharge: 0,
    roomCharge: 0,
  };
}

function calculateSqftTiered(input: PriceCalculationInput, tiers: SqftTier[], config: SqftConfig) {
  const sqft = input.sqft || config.minimum_sqft;
  let total = 0;
  let remaining = sqft;
  
  const sortedTiers = [...tiers].sort((a, b) => a.min_sqft - b.min_sqft);
  
  for (const tier of sortedTiers) {
    if (remaining <= 0) break;
    
    const tierSize = tier.max_sqft - tier.min_sqft;
    const sqftInTier = Math.min(remaining, tierSize);
    total += sqftInTier * tier.price_per_sqft;
    remaining -= sqftInTier;
  }
  
  return {
    basePrice: 0,
    bedroomCharge: 0,
    bathroomCharge: 0,
    sqftCharge: Math.max(config.minimum_charge, total),
    hourlyCharge: 0,
    roomCharge: 0,
  };
}

function calculateFlatRate(input: PriceCalculationInput, config: { property_size_tiers: FlatRateTier[] }) {
  // Find matching tier
  const tier = config.property_size_tiers.find((t) =>
    input.bedrooms <= t.max_beds && (input.sqft || 0) <= t.max_sqft
  ) || config.property_size_tiers[config.property_size_tiers.length - 1];
  
  return {
    basePrice: input.serviceBasePrice * tier.multiplier,
    bedroomCharge: 0,
    bathroomCharge: 0,
    sqftCharge: 0,
    hourlyCharge: 0,
    roomCharge: 0,
  };
}

function calculateHourly(input: PriceCalculationInput, config: HourlyConfig) {
  let hours = config.minimum_hours;
  
  if (input.selectedHours && config.allow_customer_select_hours) {
    hours = Math.max(config.minimum_hours, input.selectedHours);
  } else {
    // Estimate hours
    hours = Math.max(
      config.minimum_hours,
      config.estimate_hours_base +
      (input.bedrooms * config.estimate_hours_per_bedroom) +
      (input.bathrooms * config.estimate_hours_per_bathroom)
    );
  }
  
  // Round to increments
  hours = Math.ceil(hours / config.hour_increments) * config.hour_increments;
  
  return {
    basePrice: 0,
    bedroomCharge: 0,
    bathroomCharge: 0,
    sqftCharge: 0,
    hourlyCharge: hours * config.base_hourly_rate,
    roomCharge: 0,
  };
}

function calculateRoomCount(input: PriceCalculationInput, config: RoomCountConfig) {
  let roomCharge = 0;
  
  if (config.count_bedrooms) {
    roomCharge += input.bedrooms * config.price_per_room;
  }
  
  if (config.count_bathrooms) {
    roomCharge += input.bathrooms * config.price_per_room * config.bathroom_multiplier;
  }
  
  if (config.count_kitchen) {
    roomCharge += config.price_per_room * config.kitchen_multiplier;
  }
  
  if (config.count_living_areas) {
    // Estimate living areas based on bedrooms
    const livingAreas = Math.max(1, Math.ceil(input.bedrooms / 2));
    roomCharge += livingAreas * config.price_per_room;
  }
  
  return {
    basePrice: config.base_price,
    bedroomCharge: 0,
    bathroomCharge: 0,
    sqftCharge: 0,
    hourlyCharge: 0,
    roomCharge,
  };
}

function calculateHybrid(input: PriceCalculationInput, model: PricingModel) {
  // Calculate using primary method
  const primary = (() => {
    switch (model.primary_method) {
      case 'bedroom_bathroom':
        return calculateBedBath(input, model.bed_bath_config);
      case 'sqft':
        return calculateSqft(input, model.sqft_config);
      default:
        return calculateBedBath(input, model.bed_bath_config);
    }
  })();
  
  // For hybrid, we could blend prices or use the higher one
  // This is a simplified version
  return primary;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundToNearest(value: number, nearest: number): number {
  if (nearest <= 0) return value;
  return Math.round(value / nearest) * nearest;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isTimeInRange(time: string, start: string, end: string): boolean {
  return time >= start && time <= end;
}

// ============================================================================
// QUICK ESTIMATE FUNCTION
// ============================================================================

export function quickEstimateV2(
  bedrooms: number,
  bathrooms: number,
  serviceType: string = 'standard',
  pricingModel: PricingModel = DEFAULT_PRICING_MODEL
): { min: number; max: number; average: number } {
  const input: PriceCalculationInput = {
    serviceTypeId: '',
    serviceTypeSlug: serviceType,
    serviceBasePrice: 100,
    serviceMultiplier: pricingModel.service_multipliers[serviceType] || 1,
    bedrooms,
    bathrooms,
    addons: [],
  };
  
  const breakdown = calculatePriceV2(input, pricingModel);
  const average = breakdown.roundedTotal;
  
  return {
    min: Math.floor(average * 0.9),
    max: Math.ceil(average * 1.1),
    average,
  };
}
