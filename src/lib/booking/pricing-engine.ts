// ============================================================================
// DYNAMIC PRICING CALCULATION ENGINE
// All price calculations happen here - used by both widget and backend
// ============================================================================

export interface ServiceType {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  pricing_method: 'bedroom_bathroom' | 'sqft' | 'flat_rate' | 'hourly';
  price_per_bedroom: number;
  price_per_bathroom: number;
  price_per_half_bath: number;
  price_per_sqft: number;
  sqft_tiers: Array<{ min: number; max: number; rate: number }>;
  hourly_rate: number;
  estimated_hours_base: number;
  hours_per_bedroom: number;
  hours_per_bathroom: number;
  base_multiplier: number;
  min_duration_minutes: number;
  max_duration_minutes: number;
}

export interface Addon {
  id: string;
  name: string;
  slug: string;
  price_type: 'flat' | 'per_unit' | 'per_sqft' | 'percentage';
  price: number;
  unit_name?: string;
  min_units: number;
  max_units: number;
  percentage: number;
  additional_minutes: number;
}

export interface Frequency {
  id: string;
  name: string;
  slug: string;
  interval_days: number;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
}

export interface ServiceArea {
  id: string;
  name: string;
  zip_codes: string[];
  adjustment_type: 'percentage' | 'flat';
  adjustment_value: number;
  travel_fee: number;
}

export interface PricingInput {
  serviceType: ServiceType;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  addons: Array<{ addon: Addon; quantity: number }>;
  frequency?: Frequency;
  area?: ServiceArea;
  promoCode?: string;
}

export interface PricingBreakdown {
  // Base calculation
  basePrice: number;
  bedroomCharge: number;
  bathroomCharge: number;
  sqftCharge: number;
  
  // Service total before add-ons
  serviceSubtotal: number;
  
  // Add-ons
  addons: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  addonsTotal: number;
  
  // Subtotal before discounts
  subtotal: number;
  
  // Discounts
  frequencyDiscount: number;
  frequencyDiscountPercent: number;
  areaAdjustment: number;
  promoDiscount: number;
  totalDiscount: number;
  
  // Fees
  travelFee: number;
  
  // Final
  total: number;
  
  // Deposit
  depositAmount: number;
  depositPercent: number;
  amountDueAtBooking: number;
  amountDueAfter: number;
  
  // Time estimate
  estimatedMinutes: number;
  estimatedHours: string;
  
  // Savings display
  savingsAmount: number;
  savingsPercent: number;
}

export interface DepositConfig {
  require: boolean;
  type: 'percentage' | 'flat' | 'full';
  value: number;
  minimum: number;
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

export function calculatePrice(
  input: PricingInput,
  depositConfig: DepositConfig = { require: true, type: 'percentage', value: 25, minimum: 25 }
): PricingBreakdown {
  const { serviceType, bedrooms, bathrooms, sqft, addons, frequency, area } = input;
  
  // Split bathrooms into full and half
  const fullBaths = Math.floor(bathrooms);
  const halfBaths = (bathrooms % 1) >= 0.5 ? 1 : 0;
  
  // ============================================================================
  // STEP 1: Calculate base service price
  // ============================================================================
  
  let basePrice = serviceType.base_price;
  let bedroomCharge = 0;
  let bathroomCharge = 0;
  let sqftCharge = 0;
  
  switch (serviceType.pricing_method) {
    case 'bedroom_bathroom':
      bedroomCharge = bedrooms * serviceType.price_per_bedroom;
      bathroomCharge = 
        (fullBaths * serviceType.price_per_bathroom) + 
        (halfBaths * serviceType.price_per_half_bath);
      break;
      
    case 'sqft':
      if (sqft) {
        // Check for tiered pricing
        if (serviceType.sqft_tiers && serviceType.sqft_tiers.length > 0) {
          sqftCharge = calculateTieredSqft(sqft, serviceType.sqft_tiers);
        } else {
          sqftCharge = sqft * serviceType.price_per_sqft;
        }
      }
      break;
      
    case 'hourly':
      const estimatedHours = 
        serviceType.estimated_hours_base +
        (bedrooms * serviceType.hours_per_bedroom) +
        (bathrooms * serviceType.hours_per_bathroom);
      basePrice = estimatedHours * serviceType.hourly_rate;
      break;
      
    case 'flat_rate':
      // Base price only, no adjustments
      break;
  }
  
  // Apply multiplier (e.g., Deep Clean = 1.5x)
  const serviceSubtotal = (basePrice + bedroomCharge + bathroomCharge + sqftCharge) * serviceType.base_multiplier;
  
  // ============================================================================
  // STEP 2: Calculate add-ons
  // ============================================================================
  
  const addonDetails = addons.map(({ addon, quantity }) => {
    let total = 0;
    let unitPrice = addon.price;
    
    switch (addon.price_type) {
      case 'flat':
        total = addon.price;
        break;
      case 'per_unit':
        total = addon.price * quantity;
        break;
      case 'per_sqft':
        total = addon.price * (sqft || 0);
        unitPrice = addon.price * (sqft || 0);
        break;
      case 'percentage':
        total = serviceSubtotal * (addon.percentage / 100);
        unitPrice = total;
        break;
    }
    
    return {
      id: addon.id,
      name: addon.name,
      quantity,
      unitPrice: roundPrice(unitPrice),
      total: roundPrice(total),
    };
  });
  
  const addonsTotal = addonDetails.reduce((sum, a) => sum + a.total, 0);
  
  // ============================================================================
  // STEP 3: Calculate subtotal
  // ============================================================================
  
  const subtotal = serviceSubtotal + addonsTotal;
  
  // ============================================================================
  // STEP 4: Apply discounts
  // ============================================================================
  
  let frequencyDiscount = 0;
  let frequencyDiscountPercent = 0;
  
  if (frequency && frequency.interval_days > 0) {
    if (frequency.discount_type === 'percentage') {
      frequencyDiscount = subtotal * (frequency.discount_value / 100);
      frequencyDiscountPercent = frequency.discount_value;
    } else {
      frequencyDiscount = frequency.discount_value;
    }
  }
  
  // Area adjustment (can be positive or negative)
  let areaAdjustment = 0;
  let travelFee = 0;
  
  if (area) {
    if (area.adjustment_type === 'percentage') {
      areaAdjustment = subtotal * (area.adjustment_value / 100);
    } else {
      areaAdjustment = area.adjustment_value;
    }
    travelFee = area.travel_fee;
  }
  
  // Promo code (placeholder - implement promo logic separately)
  const promoDiscount = 0;
  
  const totalDiscount = frequencyDiscount + promoDiscount;
  
  // ============================================================================
  // STEP 5: Calculate final total
  // ============================================================================
  
  const total = roundPrice(Math.max(0, subtotal - totalDiscount + areaAdjustment + travelFee));
  
  // ============================================================================
  // STEP 6: Calculate deposit
  // ============================================================================
  
  let depositAmount = 0;
  let depositPercent = 0;
  
  if (depositConfig.require) {
    switch (depositConfig.type) {
      case 'percentage':
        depositAmount = total * (depositConfig.value / 100);
        depositPercent = depositConfig.value;
        break;
      case 'flat':
        depositAmount = depositConfig.value;
        depositPercent = (depositConfig.value / total) * 100;
        break;
      case 'full':
        depositAmount = total;
        depositPercent = 100;
        break;
    }
    
    // Apply minimum
    depositAmount = Math.max(depositAmount, depositConfig.minimum);
    
    // Can't exceed total
    depositAmount = Math.min(depositAmount, total);
  }
  
  depositAmount = roundPrice(depositAmount);
  
  // ============================================================================
  // STEP 7: Estimate duration
  // ============================================================================
  
  let estimatedMinutes = serviceType.min_duration_minutes;
  
  // Base time from service type
  if (serviceType.pricing_method === 'bedroom_bathroom') {
    estimatedMinutes = 
      serviceType.min_duration_minutes +
      (bedrooms * 15) + // 15 min per bedroom
      (fullBaths * 20) + // 20 min per full bath
      (halfBaths * 10); // 10 min per half bath
  } else if (serviceType.pricing_method === 'sqft' && sqft) {
    estimatedMinutes = Math.max(
      serviceType.min_duration_minutes,
      Math.ceil(sqft / 500) * 30 // ~30 min per 500 sqft
    );
  }
  
  // Apply service multiplier to time
  estimatedMinutes = Math.ceil(estimatedMinutes * serviceType.base_multiplier);
  
  // Add time for add-ons
  estimatedMinutes += addons.reduce((sum, { addon, quantity }) => {
    return sum + (addon.additional_minutes * (addon.price_type === 'per_unit' ? quantity : 1));
  }, 0);
  
  // Cap at max
  estimatedMinutes = Math.min(estimatedMinutes, serviceType.max_duration_minutes || 480);
  
  // Format hours string
  const minHours = Math.floor(estimatedMinutes / 60);
  const maxHours = Math.ceil((estimatedMinutes * 1.25) / 60); // Add 25% buffer
  const estimatedHours = minHours === maxHours 
    ? `${minHours} hour${minHours !== 1 ? 's' : ''}`
    : `${minHours}-${maxHours} hours`;
  
  // ============================================================================
  // STEP 8: Calculate savings display
  // ============================================================================
  
  // Compare to one-time price
  const oneTimePrice = subtotal + areaAdjustment + travelFee;
  const savingsAmount = oneTimePrice - total;
  const savingsPercent = oneTimePrice > 0 ? (savingsAmount / oneTimePrice) * 100 : 0;
  
  // ============================================================================
  // RETURN BREAKDOWN
  // ============================================================================
  
  return {
    basePrice: roundPrice(basePrice),
    bedroomCharge: roundPrice(bedroomCharge),
    bathroomCharge: roundPrice(bathroomCharge),
    sqftCharge: roundPrice(sqftCharge),
    serviceSubtotal: roundPrice(serviceSubtotal),
    
    addons: addonDetails,
    addonsTotal: roundPrice(addonsTotal),
    
    subtotal: roundPrice(subtotal),
    
    frequencyDiscount: roundPrice(frequencyDiscount),
    frequencyDiscountPercent: roundPrice(frequencyDiscountPercent),
    areaAdjustment: roundPrice(areaAdjustment),
    promoDiscount: roundPrice(promoDiscount),
    totalDiscount: roundPrice(totalDiscount),
    
    travelFee: roundPrice(travelFee),
    
    total,
    
    depositAmount,
    depositPercent: roundPrice(depositPercent),
    amountDueAtBooking: depositAmount,
    amountDueAfter: roundPrice(total - depositAmount),
    
    estimatedMinutes,
    estimatedHours,
    
    savingsAmount: roundPrice(savingsAmount),
    savingsPercent: roundPrice(savingsPercent),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateTieredSqft(sqft: number, tiers: Array<{ min: number; max: number; rate: number }>): number {
  // Sort tiers by min
  const sortedTiers = [...tiers].sort((a, b) => a.min - b.min);
  
  let total = 0;
  let remainingSqft = sqft;
  
  for (const tier of sortedTiers) {
    if (remainingSqft <= 0) break;
    
    const tierSqft = Math.min(remainingSqft, tier.max - tier.min + 1);
    total += tierSqft * tier.rate;
    remainingSqft -= tierSqft;
  }
  
  return total;
}

function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

// ============================================================================
// QUICK ESTIMATE (for marketing/landing pages)
// ============================================================================

export function quickEstimate(
  serviceType: 'standard' | 'deep' | 'move' | 'construction',
  bedrooms: number,
  bathrooms: number
): { min: number; max: number } {
  const baseRates: Record<string, { base: number; bed: number; bath: number }> = {
    standard: { base: 80, bed: 25, bath: 20 },
    deep: { base: 120, bed: 35, bath: 30 },
    move: { base: 150, bed: 45, bath: 40 },
    construction: { base: 200, bed: 55, bath: 50 },
  };
  
  const rates = baseRates[serviceType] || baseRates.standard;
  const estimate = rates.base + (bedrooms * rates.bed) + (bathrooms * rates.bath);
  
  return {
    min: Math.round(estimate * 0.9),
    max: Math.round(estimate * 1.1),
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validatePricingInput(input: Partial<PricingInput>): string[] {
  const errors: string[] = [];
  
  if (!input.serviceType) {
    errors.push('Service type is required');
  }
  
  if (input.bedrooms === undefined || input.bedrooms < 0) {
    errors.push('Valid bedroom count is required');
  }
  
  if (input.bathrooms === undefined || input.bathrooms < 0) {
    errors.push('Valid bathroom count is required');
  }
  
  if (input.bedrooms !== undefined && input.bedrooms > 10) {
    errors.push('For homes with 10+ bedrooms, please call for a custom quote');
  }
  
  return errors;
}

