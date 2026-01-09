// ============================================================================
// DYNAMIC AI PRICING MATRIX - Residential Cleaning (2024-2025)
// Complete pricing data structure for SaaS platforms
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type PricingMethod = 'sqft' | 'bedroom_bathroom' | 'hourly' | 'flat_rate' | 'hybrid';
export type ServiceType = 'standard' | 'deep' | 'move_in_out' | 'post_construction' | 'airbnb' | 'initial';
export type Frequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
export type MarketTier = 'premium' | 'urban' | 'suburban' | 'rural';

export interface PriceRange {
  low: number;
  average: number;
  high: number;
}

export interface PricingTier {
  id: string;
  label: string;
  minSqft: number;
  maxSqft: number | null;
  pricePerSqft: PriceRange;
  flatPrice: PriceRange;
}

export interface BedroomBathroomRate {
  bedrooms: number;
  bathrooms: number;
  price: PriceRange;
}

export interface AddOnService {
  id: string;
  category: string;
  name: string;
  description: string;
  pricingType: 'flat' | 'per_unit' | 'per_sqft' | 'per_hour';
  unit?: string;
  price: PriceRange;
  timeMinutes: number;
  popular?: boolean;
}

export interface ServiceMultiplier {
  serviceType: ServiceType;
  multiplier: PriceRange;
  description: string;
}

export interface FrequencyDiscount {
  frequency: Frequency;
  discountPercent: PriceRange;
  description: string;
}

export interface ConditionSurcharge {
  id: string;
  name: string;
  description: string;
  surchargeType: 'percent' | 'flat';
  amount: PriceRange;
}

export interface GeographicRate {
  metroArea: string;
  state: string;
  marketTier: MarketTier;
  hourlyRate: PriceRange;
  standard3BR: PriceRange;
  deepClean: PriceRange;
  costOfLivingMultiplier: number;
}

export interface TimePremium {
  id: string;
  name: string;
  description: string;
  premiumPercent: PriceRange;
}

export interface CleaningTimeEstimate {
  homeSizeLabel: string;
  sqftRange: [number, number];
  standardCleanHours: PriceRange;
  deepCleanHours: PriceRange;
}

// ============================================================================
// BASE PRICING DATA
// ============================================================================

// Square Footage Pricing Tiers
export const SQFT_PRICING_TIERS: PricingTier[] = [
  {
    id: 'studio',
    label: 'Studio',
    minSqft: 0,
    maxSqft: 500,
    pricePerSqft: { low: 0.15, average: 0.20, high: 0.25 },
    flatPrice: { low: 75, average: 100, high: 120 },
  },
  {
    id: 'under_1000',
    label: 'Under 1,000 sq ft',
    minSqft: 500,
    maxSqft: 1000,
    pricePerSqft: { low: 0.10, average: 0.15, high: 0.20 },
    flatPrice: { low: 80, average: 130, high: 150 },
  },
  {
    id: '1000_1500',
    label: '1,000-1,500 sq ft',
    minSqft: 1000,
    maxSqft: 1500,
    pricePerSqft: { low: 0.08, average: 0.12, high: 0.16 },
    flatPrice: { low: 120, average: 165, high: 200 },
  },
  {
    id: '1500_2000',
    label: '1,500-2,000 sq ft',
    minSqft: 1500,
    maxSqft: 2000,
    pricePerSqft: { low: 0.07, average: 0.11, high: 0.15 },
    flatPrice: { low: 150, average: 200, high: 275 },
  },
  {
    id: '2000_2500',
    label: '2,000-2,500 sq ft',
    minSqft: 2000,
    maxSqft: 2500,
    pricePerSqft: { low: 0.06, average: 0.10, high: 0.14 },
    flatPrice: { low: 180, average: 235, high: 300 },
  },
  {
    id: '2500_3000',
    label: '2,500-3,000 sq ft',
    minSqft: 2500,
    maxSqft: 3000,
    pricePerSqft: { low: 0.06, average: 0.09, high: 0.13 },
    flatPrice: { low: 200, average: 260, high: 350 },
  },
  {
    id: '3000_4000',
    label: '3,000-4,000 sq ft',
    minSqft: 3000,
    maxSqft: 4000,
    pricePerSqft: { low: 0.05, average: 0.08, high: 0.12 },
    flatPrice: { low: 250, average: 320, high: 400 },
  },
  {
    id: '4000_plus',
    label: '4,000+ sq ft',
    minSqft: 4000,
    maxSqft: null,
    pricePerSqft: { low: 0.05, average: 0.07, high: 0.10 },
    flatPrice: { low: 300, average: 400, high: 500 },
  },
];

// Bedroom/Bathroom Base Pricing
export const BEDROOM_BATHROOM_BASE = {
  basePrice: { low: 100, average: 110, high: 120 },
  perBedroom: { low: 10, average: 15, high: 20 },
  perBathroom: { low: 20, average: 25, high: 30 },
  halfBathroom: { low: 10, average: 15, high: 20 },
};

// Flat Rate by Home Size
export const FLAT_RATE_BY_SIZE: Record<string, { standard: PriceRange; deep: PriceRange }> = {
  studio: { standard: { low: 75, average: 97, high: 120 }, deep: { low: 120, average: 150, high: 180 } },
  '1br': { standard: { low: 80, average: 115, high: 150 }, deep: { low: 150, average: 175, high: 200 } },
  '2br': { standard: { low: 120, average: 160, high: 200 }, deep: { low: 200, average: 250, high: 300 } },
  '3br': { standard: { low: 150, average: 212, high: 275 }, deep: { low: 250, average: 325, high: 400 } },
  '4br': { standard: { low: 200, average: 275, high: 350 }, deep: { low: 350, average: 425, high: 500 } },
  '5br_plus': { standard: { low: 300, average: 400, high: 500 }, deep: { low: 450, average: 550, high: 700 } },
};

// Hourly Rates
export const HOURLY_RATES = {
  perCleaner: {
    standard: { low: 25, average: 37, high: 50 },
    deep: { low: 40, average: 70, high: 100 },
  },
  teamRate: {
    twoPerson: { low: 50, average: 75, high: 100 },
    threePerson: { low: 75, average: 110, high: 150 },
  },
  premiumMarket: { low: 60, average: 75, high: 90 },
  minimumHours: 2,
};

// ============================================================================
// SERVICE TYPE MULTIPLIERS
// ============================================================================

export const SERVICE_MULTIPLIERS: ServiceMultiplier[] = [
  {
    serviceType: 'standard',
    multiplier: { low: 1.0, average: 1.0, high: 1.0 },
    description: 'Regular maintenance cleaning',
  },
  {
    serviceType: 'deep',
    multiplier: { low: 1.3, average: 1.5, high: 2.0 },
    description: 'Intensive top-to-bottom cleaning, 1.5-2x longer than standard',
  },
  {
    serviceType: 'initial',
    multiplier: { low: 1.4, average: 1.6, high: 1.8 },
    description: 'First-time cleaning to establish baseline, up to 3x longer',
  },
  {
    serviceType: 'move_in_out',
    multiplier: { low: 1.5, average: 1.8, high: 2.5 },
    description: 'Complete move preparation cleaning',
  },
  {
    serviceType: 'post_construction',
    multiplier: { low: 2.0, average: 3.0, high: 5.0 },
    description: 'Heavy-duty cleaning after construction/renovation',
  },
  {
    serviceType: 'airbnb',
    multiplier: { low: 0.8, average: 1.0, high: 1.2 },
    description: 'Vacation rental turnover (quick turnaround)',
  },
];

// Post-Construction Phases
export const POST_CONSTRUCTION_PHASES = {
  rough: { perSqft: { low: 0.10, average: 0.25, high: 0.40 }, description: 'During construction' },
  light: { perSqft: { low: 0.20, average: 0.40, high: 0.60 }, description: 'After construction complete' },
  final: { perSqft: { low: 0.20, average: 0.47, high: 0.75 }, description: 'Move-in ready' },
  touchup: { perSqft: { low: 0.10, average: 0.35, high: 0.60 }, description: 'After dust settles' },
};

// Airbnb/Vacation Rental Rates
export const AIRBNB_RATES: Record<string, PriceRange> = {
  '1br': { low: 40, average: 52, high: 90 },
  '2br': { low: 50, average: 72, high: 130 },
  '3br': { low: 70, average: 100, high: 150 },
  '4br_plus': { low: 90, average: 200, high: 405 },
};

// ============================================================================
// ADD-ON SERVICES CATALOG
// ============================================================================

export const ADD_ON_SERVICES: AddOnService[] = [
  // Kitchen Appliances
  { id: 'oven_inside', category: 'Kitchen', name: 'Inside Oven', description: 'Deep clean inside oven including racks', pricingType: 'flat', price: { low: 20, average: 35, high: 50 }, timeMinutes: 30, popular: true },
  { id: 'fridge_inside', category: 'Kitchen', name: 'Inside Refrigerator', description: 'Clean shelves, drawers, and interior', pricingType: 'flat', price: { low: 10, average: 30, high: 50 }, timeMinutes: 30, popular: true },
  { id: 'dishwasher_inside', category: 'Kitchen', name: 'Inside Dishwasher', description: 'Clean interior and door gasket', pricingType: 'flat', price: { low: 10, average: 20, high: 35 }, timeMinutes: 15 },
  { id: 'microwave_inside', category: 'Kitchen', name: 'Inside Microwave', description: 'Deep clean interior', pricingType: 'flat', price: { low: 10, average: 15, high: 25 }, timeMinutes: 10 },
  { id: 'cabinets_inside', category: 'Kitchen', name: 'Inside Cabinets/Pantry', description: 'Wipe down cabinet interiors', pricingType: 'flat', price: { low: 20, average: 50, high: 100 }, timeMinutes: 45 },

  // Windows & Blinds
  { id: 'window_interior', category: 'Windows', name: 'Interior Windows', description: 'Clean interior glass and frame', pricingType: 'per_unit', unit: 'window', price: { low: 4, average: 7, high: 15 }, timeMinutes: 5, popular: true },
  { id: 'window_exterior', category: 'Windows', name: 'Exterior Windows', description: 'Clean exterior glass (ground floor)', pricingType: 'per_unit', unit: 'window', price: { low: 8, average: 12, high: 20 }, timeMinutes: 8 },
  { id: 'window_exterior_2nd', category: 'Windows', name: 'Exterior Windows (2nd Floor)', description: 'Second floor exterior windows', pricingType: 'per_unit', unit: 'window', price: { low: 11, average: 17, high: 25 }, timeMinutes: 12 },
  { id: 'blinds', category: 'Windows', name: 'Blinds Cleaning', description: 'Dust and wipe individual blinds', pricingType: 'per_unit', unit: 'blind', price: { low: 10, average: 15, high: 50 }, timeMinutes: 10 },
  { id: 'window_tracks', category: 'Windows', name: 'Window Tracks', description: 'Clean window tracks and sills', pricingType: 'per_unit', unit: 'track', price: { low: 0.50, average: 2.50, high: 5 }, timeMinutes: 3 },
  { id: 'hard_water_removal', category: 'Windows', name: 'Hard Water Stain Removal', description: 'Remove mineral deposits', pricingType: 'per_unit', unit: 'pane', price: { low: 4, average: 6, high: 8 }, timeMinutes: 10 },

  // Detailed Cleaning
  { id: 'baseboards_room', category: 'Detail', name: 'Baseboards (per room)', description: 'Wipe down all baseboards', pricingType: 'per_unit', unit: 'room', price: { low: 25, average: 50, high: 75 }, timeMinutes: 15, popular: true },
  { id: 'baseboards_linear', category: 'Detail', name: 'Baseboards (linear ft)', description: 'Baseboards by the foot', pricingType: 'per_unit', unit: 'linear ft', price: { low: 0.25, average: 0.37, high: 0.50 }, timeMinutes: 1 },
  { id: 'ceiling_fan', category: 'Detail', name: 'Ceiling Fan', description: 'Dust and clean fan blades', pricingType: 'per_unit', unit: 'fan', price: { low: 10, average: 15, high: 25 }, timeMinutes: 10 },
  { id: 'light_fixture', category: 'Detail', name: 'Light Fixtures', description: 'Clean and dust fixtures', pricingType: 'per_unit', unit: 'fixture', price: { low: 10, average: 25, high: 75 }, timeMinutes: 10 },
  { id: 'chandelier_standard', category: 'Detail', name: 'Chandelier (Standard)', description: 'Clean standard chandelier', pricingType: 'flat', price: { low: 25, average: 50, high: 75 }, timeMinutes: 30 },
  { id: 'chandelier_complex', category: 'Detail', name: 'Chandelier (Complex)', description: 'Clean ornate/crystal chandelier', pricingType: 'flat', price: { low: 75, average: 112, high: 150 }, timeMinutes: 60 },
  { id: 'wall_washing', category: 'Detail', name: 'Wall Washing', description: 'Wash walls in one room', pricingType: 'per_unit', unit: 'room', price: { low: 50, average: 100, high: 150 }, timeMinutes: 45 },
  { id: 'garage_single', category: 'Detail', name: 'Garage (Single-Car)', description: 'Sweep and organize garage', pricingType: 'flat', price: { low: 150, average: 300, high: 500 }, timeMinutes: 120 },
  { id: 'garage_double', category: 'Detail', name: 'Garage (Double-Car)', description: 'Sweep and organize larger garage', pricingType: 'flat', price: { low: 250, average: 450, high: 700 }, timeMinutes: 180 },

  // Laundry & Linens
  { id: 'laundry_load', category: 'Laundry', name: 'Laundry (per load)', description: 'Wash, dry, and fold one load', pricingType: 'per_unit', unit: 'load', price: { low: 5, average: 15, high: 30 }, timeMinutes: 90 },
  { id: 'laundry_pound', category: 'Laundry', name: 'Laundry (per pound)', description: 'Laundry by weight', pricingType: 'per_unit', unit: 'lb', price: { low: 0.99, average: 1.50, high: 2.25 }, timeMinutes: 5 },
  { id: 'bed_making', category: 'Laundry', name: 'Bed Making', description: 'Make bed with existing linens', pricingType: 'per_unit', unit: 'bed', price: { low: 5, average: 10, high: 20 }, timeMinutes: 5 },
  { id: 'linen_change', category: 'Laundry', name: 'Changing Linens', description: 'Strip and change bed linens', pricingType: 'per_unit', unit: 'bed', price: { low: 10, average: 20, high: 40 }, timeMinutes: 10, popular: true },
  { id: 'dish_washing', category: 'Laundry', name: 'Dish Washing', description: 'Hand wash dishes', pricingType: 'flat', price: { low: 10, average: 15, high: 25 }, timeMinutes: 20 },

  // Specialty Services
  { id: 'organizing', category: 'Specialty', name: 'Organizing', description: 'Professional organizing service', pricingType: 'per_hour', price: { low: 40, average: 65, high: 150 }, timeMinutes: 60 },
  { id: 'carpet_spot', category: 'Specialty', name: 'Carpet Spot Cleaning', description: 'Treat individual carpet stains', pricingType: 'per_unit', unit: 'spot', price: { low: 20, average: 35, high: 100 }, timeMinutes: 15 },
  { id: 'upholstery_chair', category: 'Specialty', name: 'Upholstery - Chair', description: 'Clean upholstered chair', pricingType: 'per_unit', unit: 'chair', price: { low: 30, average: 50, high: 75 }, timeMinutes: 20 },
  { id: 'upholstery_sofa', category: 'Specialty', name: 'Upholstery - Sofa', description: 'Clean upholstered sofa', pricingType: 'per_unit', unit: 'sofa', price: { low: 50, average: 100, high: 200 }, timeMinutes: 45 },
  { id: 'patio_balcony', category: 'Specialty', name: 'Patio/Balcony', description: 'Clean outdoor living space', pricingType: 'flat', price: { low: 50, average: 100, high: 300 }, timeMinutes: 60 },
  { id: 'pet_area', category: 'Specialty', name: 'Pet Area Cleaning', description: 'Clean pet beds, feeding areas', pricingType: 'flat', price: { low: 25, average: 40, high: 75 }, timeMinutes: 20 },
  { id: 'eco_upgrade', category: 'Specialty', name: 'Eco-Friendly Products', description: 'Use green cleaning products', pricingType: 'flat', price: { low: 5, average: 10, high: 20 }, timeMinutes: 0, popular: true },
];

// ============================================================================
// FREQUENCY DISCOUNTS
// ============================================================================

export const FREQUENCY_DISCOUNTS: FrequencyDiscount[] = [
  { frequency: 'one_time', discountPercent: { low: 0, average: 0, high: 0 }, description: 'Premium baseline rate' },
  { frequency: 'weekly', discountPercent: { low: 15, average: 17, high: 20 }, description: 'Best per-visit rate, 4x monthly' },
  { frequency: 'biweekly', discountPercent: { low: 10, average: 12, high: 15 }, description: 'Industry sweet spot, 2x monthly' },
  { frequency: 'monthly', discountPercent: { low: 5, average: 7, high: 10 }, description: 'Requires more work per visit' },
  { frequency: 'quarterly', discountPercent: { low: 0, average: 0, high: 5 }, description: 'Priced similar to deep clean' },
];

// ============================================================================
// CONDITION SURCHARGES
// ============================================================================

export const CONDITION_SURCHARGES: ConditionSurcharge[] = [
  // Time Since Last Cleaning
  { id: 'last_clean_1mo', name: '1 Month Since Cleaning', description: 'Standard maintenance level', surchargeType: 'percent', amount: { low: 0, average: 5, high: 10 } },
  { id: 'last_clean_2_3mo', name: '2-3 Months Since Cleaning', description: 'Light buildup expected', surchargeType: 'percent', amount: { low: 20, average: 30, high: 40 } },
  { id: 'last_clean_3_6mo', name: '3-6 Months Since Cleaning', description: 'Moderate buildup, deep clean recommended', surchargeType: 'percent', amount: { low: 30, average: 40, high: 50 } },
  { id: 'last_clean_6mo_plus', name: '6+ Months Since Cleaning', description: 'Heavy buildup, deep clean required', surchargeType: 'percent', amount: { low: 50, average: 75, high: 100 } },

  // Pet Surcharges
  { id: 'pet_standard', name: 'Standard Pet Fee', description: 'One or two normal-shedding pets', surchargeType: 'flat', amount: { low: 10, average: 20, high: 30 } },
  { id: 'pet_multiple', name: 'Multiple Pets', description: 'Three or more pets', surchargeType: 'flat', amount: { low: 20, average: 35, high: 50 } },
  { id: 'pet_high_shed', name: 'High-Shedding Pets', description: 'Extra time for pet hair removal', surchargeType: 'percent', amount: { low: 10, average: 12, high: 15 } },

  // Clutter & Condition
  { id: 'clutter_moderate', name: 'Moderate Clutter', description: 'Items need to be moved to clean', surchargeType: 'flat', amount: { low: 15, average: 25, high: 35 } },
  { id: 'clutter_heavy', name: 'Heavy Clutter', description: 'Significant prep work needed', surchargeType: 'flat', amount: { low: 25, average: 37, high: 50 } },
  { id: 'restoration', name: 'Restoration Level', description: 'Extreme condition requiring extra attention', surchargeType: 'percent', amount: { low: 30, average: 40, high: 50 } },

  // Structural Factors
  { id: 'stairs_per_flight', name: 'Stairs (per flight)', description: 'Additional time for multi-level homes', surchargeType: 'flat', amount: { low: 5, average: 10, high: 15 } },
  { id: 'high_ceilings', name: 'High Ceilings', description: 'Specialty equipment may be needed', surchargeType: 'percent', amount: { low: 10, average: 15, high: 25 } },
];

// ============================================================================
// GEOGRAPHIC PRICING
// ============================================================================

export const GEOGRAPHIC_RATES: GeographicRate[] = [
  { metroArea: 'New York City', state: 'NY', marketTier: 'premium', hourlyRate: { low: 35, average: 47, high: 60 }, standard3BR: { low: 150, average: 375, high: 600 }, deepClean: { low: 250, average: 325, high: 400 }, costOfLivingMultiplier: 1.40 },
  { metroArea: 'San Francisco', state: 'CA', marketTier: 'premium', hourlyRate: { low: 30, average: 45, high: 60 }, standard3BR: { low: 120, average: 172, high: 225 }, deepClean: { low: 200, average: 300, high: 400 }, costOfLivingMultiplier: 1.35 },
  { metroArea: 'Los Angeles', state: 'CA', marketTier: 'urban', hourlyRate: { low: 22, average: 28, high: 35 }, standard3BR: { low: 130, average: 175, high: 220 }, deepClean: { low: 180, average: 265, high: 350 }, costOfLivingMultiplier: 1.20 },
  { metroArea: 'Seattle', state: 'WA', marketTier: 'urban', hourlyRate: { low: 25, average: 35, high: 45 }, standard3BR: { low: 150, average: 225, high: 300 }, deepClean: { low: 240, average: 290, high: 340 }, costOfLivingMultiplier: 1.25 },
  { metroArea: 'Chicago', state: 'IL', marketTier: 'urban', hourlyRate: { low: 35, average: 47, high: 60 }, standard3BR: { low: 100, average: 140, high: 180 }, deepClean: { low: 150, average: 250, high: 350 }, costOfLivingMultiplier: 1.10 },
  { metroArea: 'Denver', state: 'CO', marketTier: 'urban', hourlyRate: { low: 40, average: 45, high: 50 }, standard3BR: { low: 150, average: 200, high: 250 }, deepClean: { low: 200, average: 300, high: 400 }, costOfLivingMultiplier: 1.15 },
  { metroArea: 'Washington D.C.', state: 'DC', marketTier: 'premium', hourlyRate: { low: 50, average: 62, high: 75 }, standard3BR: { low: 120, average: 185, high: 250 }, deepClean: { low: 200, average: 300, high: 400 }, costOfLivingMultiplier: 1.30 },
  { metroArea: 'Dallas', state: 'TX', marketTier: 'suburban', hourlyRate: { low: 25, average: 32, high: 40 }, standard3BR: { low: 120, average: 185, high: 250 }, deepClean: { low: 200, average: 275, high: 350 }, costOfLivingMultiplier: 1.00 },
  { metroArea: 'Houston', state: 'TX', marketTier: 'suburban', hourlyRate: { low: 25, average: 32, high: 40 }, standard3BR: { low: 120, average: 185, high: 250 }, deepClean: { low: 200, average: 275, high: 350 }, costOfLivingMultiplier: 0.98 },
  { metroArea: 'Miami', state: 'FL', marketTier: 'urban', hourlyRate: { low: 20, average: 22, high: 25 }, standard3BR: { low: 140, average: 190, high: 240 }, deepClean: { low: 200, average: 275, high: 350 }, costOfLivingMultiplier: 1.10 },
  { metroArea: 'Atlanta', state: 'GA', marketTier: 'suburban', hourlyRate: { low: 20, average: 32, high: 45 }, standard3BR: { low: 100, average: 225, high: 350 }, deepClean: { low: 150, average: 275, high: 400 }, costOfLivingMultiplier: 0.95 },
  { metroArea: 'Phoenix', state: 'AZ', marketTier: 'suburban', hourlyRate: { low: 20, average: 27, high: 35 }, standard3BR: { low: 100, average: 140, high: 180 }, deepClean: { low: 180, average: 240, high: 300 }, costOfLivingMultiplier: 0.92 },
  { metroArea: 'National Average', state: 'US', marketTier: 'suburban', hourlyRate: { low: 25, average: 35, high: 50 }, standard3BR: { low: 120, average: 175, high: 250 }, deepClean: { low: 180, average: 275, high: 400 }, costOfLivingMultiplier: 1.00 },
];

// Market Tier Multipliers
export const MARKET_TIER_MULTIPLIERS: Record<MarketTier, { low: number; high: number }> = {
  premium: { low: 1.20, high: 1.40 },
  urban: { low: 1.05, high: 1.20 },
  suburban: { low: 0.95, high: 1.05 },
  rural: { low: 0.75, high: 0.90 },
};

// Travel Fees
export const TRAVEL_FEES = {
  perMile: 0.78,
  tiers: [
    { maxMiles: 15, fee: { low: 0, average: 0, high: 0 } },
    { maxMiles: 25, fee: { low: 10, average: 12, high: 15 } },
    { maxMiles: 50, fee: { low: 15, average: 20, high: 25 } },
    { maxMiles: null, fee: { low: 25, average: 37, high: 50 } },
  ],
  downtownParkingPremium: { low: 10, average: 17, high: 25 },
};

// ============================================================================
// TIME-BASED PREMIUMS
// ============================================================================

export const TIME_PREMIUMS: TimePremium[] = [
  // Rush & Emergency
  { id: 'same_day', name: 'Same-Day Service', description: 'Booking for today', premiumPercent: { low: 15, average: 22, high: 30 } },
  { id: 'next_day', name: 'Next-Day Service', description: 'Booking for tomorrow', premiumPercent: { low: 10, average: 17, high: 25 } },
  { id: 'rush_48hr', name: 'Rush Booking (24-48hr)', description: 'Short notice booking', premiumPercent: { low: 10, average: 17, high: 25 } },

  // After-Hours & Weekend
  { id: 'evening', name: 'Evening (After 6pm)', description: 'After regular hours', premiumPercent: { low: 15, average: 20, high: 25 } },
  { id: 'saturday', name: 'Saturday', description: 'Weekend premium', premiumPercent: { low: 10, average: 12, high: 15 } },
  { id: 'sunday', name: 'Sunday', description: 'Weekend premium', premiumPercent: { low: 15, average: 17, high: 20 } },
  { id: 'holiday', name: 'Major Holiday', description: 'Holiday service', premiumPercent: { low: 25, average: 37, high: 50 } },

  // Discounts
  { id: 'off_peak', name: 'Off-Peak (Weekday Morning)', description: 'Lower demand times', premiumPercent: { low: -10, average: -7, high: -5 } },
];

// Cancellation Fees
export const CANCELLATION_FEES = {
  notice48Plus: { percent: 0, flat: { low: 0, average: 0, high: 0 } },
  notice24to48: { percent: 25, flat: { low: 25, average: 37, high: 50 } },
  noticeUnder24: { percent: 50, flat: { low: 50, average: 62, high: 75 } },
  sameDay: { percent: 100, flat: null },
  lockout: { percent: 50, flat: null },
  rescheduleUnder48: { percent: 0, flat: { low: 15, average: 25, high: 35 } },
};

// ============================================================================
// CLEANING TIME ESTIMATES
// ============================================================================

export const CLEANING_TIME_ESTIMATES: CleaningTimeEstimate[] = [
  { homeSizeLabel: '1 Bedroom (500-900 sq ft)', sqftRange: [500, 900], standardCleanHours: { low: 1.5, average: 2.0, high: 2.5 }, deepCleanHours: { low: 2.5, average: 3.25, high: 4.0 } },
  { homeSizeLabel: '2 Bedroom (1,000-1,500 sq ft)', sqftRange: [1000, 1500], standardCleanHours: { low: 2.5, average: 3.0, high: 3.5 }, deepCleanHours: { low: 4.0, average: 5.0, high: 6.0 } },
  { homeSizeLabel: '3 Bedroom (1,500-2,000 sq ft)', sqftRange: [1500, 2000], standardCleanHours: { low: 3.0, average: 3.5, high: 4.0 }, deepCleanHours: { low: 5.0, average: 6.0, high: 7.0 } },
  { homeSizeLabel: '4 Bedroom (2,000-3,000 sq ft)', sqftRange: [2000, 3000], standardCleanHours: { low: 4.0, average: 4.5, high: 5.0 }, deepCleanHours: { low: 6.0, average: 7.0, high: 8.0 } },
  { homeSizeLabel: '5+ Bedroom (3,000+ sq ft)', sqftRange: [3000, 10000], standardCleanHours: { low: 4.5, average: 5.25, high: 6.0 }, deepCleanHours: { low: 8.0, average: 9.0, high: 10.0 } },
];

// Speed Benchmark
export const CLEANING_SPEED = {
  sqftPerHourPerCleaner: { low: 400, average: 500, high: 600 },
};

// ============================================================================
// BUSINESS BENCHMARKS
// ============================================================================

export const BUSINESS_BENCHMARKS = {
  minimumCharge: { low: 100, average: 125, high: 150 },
  minimumHours: { low: 2, average: 2.5, high: 3 },
  
  deposits: {
    firstTime: { percent: 25, description: 'First-time customer deposit' },
    oneTimeDeep: { percent: 50, description: 'One-time/deep clean deposit' },
    newCustomer: { percent: 100, description: 'Some companies require full prepayment' },
  },
  
  costStructure: {
    laborPercent: { low: 40, average: 45, high: 50 },
    suppliesPercent: { low: 3, average: 4, high: 5 },
    overheadPercent: { low: 15, average: 20, high: 25 },
    netProfitPercent: { low: 10, average: 19, high: 28 },
    grossProfitPercent: { low: 30, average: 40, high: 50 },
  },
  
  revenueBenchmarks: {
    dailyPerCleaner: { low: 200, average: 300, high: 400 },
    weeklyTwoTeams: 6000,
    monthlyTarget: 24000,
    sixFigureThreshold: 400000,
  },
  
  guaranteeWindow: { hours: 24, maxHours: 48 },
  
  supplyFees: {
    companyProvides: 0,
    customerProvides: { low: -5, average: -12, high: -20 },
    ecoUpgrade: { low: 5, average: 12, high: 20 },
  },
};

// ============================================================================
// SPECIALTY PRICING
// ============================================================================

export const SPECIALTY_PRICING = {
  hoarding: {
    perHour: { low: 25, average: 87, high: 150 },
    perSqft: { low: 0.75, average: 1.62, high: 2.50 },
    minor: { low: 1000, average: 2000, high: 3000 },
    moderate: { low: 3000, average: 5000, high: 7000 },
    severe: { low: 7000, average: 11000, high: 15000 },
    withBiohazard: { low: 200, average: 250, high: 300 }, // per hour per worker
  },
  
  estate: {
    cleanout: { low: 500, average: 1250, high: 6000 },
    foreclosure: { low: 250, average: 1375, high: 2500 },
    perTruckload: { low: 500, average: 650, high: 800 },
  },
  
  ecoFriendly: {
    hourlyPremium: { low: 25, average: 37, high: 50 },
    flatPremiumSmall: 50, // under 1000 sqft
    percentIncrease: { low: 5, average: 10, high: 15 },
  },
};

// ============================================================================
// PRICING FORMULAS
// ============================================================================

export const PRICING_FORMULAS = {
  // ZenMaid Formula
  zenMaid: (sqft: number, sqftPerHour: number = 500, hourlyRate: number = 50): number => {
    return (sqft / sqftPerHour) * hourlyRate;
  },

  // Bedroom/Bathroom Formula
  bedroomBathroom: (
    bedrooms: number,
    bathrooms: number,
    halfBaths: number = 0,
    basePrice: number = 110,
    perBedroom: number = 15,
    perBathroom: number = 25,
    perHalfBath: number = 15
  ): number => {
    const extraBedrooms = Math.max(0, bedrooms - 1);
    const extraBathrooms = Math.max(0, bathrooms - 1);
    return basePrice + (extraBedrooms * perBedroom) + (extraBathrooms * perBathroom) + (halfBaths * perHalfBath);
  },

  // True Hourly Rate (for profitability)
  trueHourlyRate: (laborCost: number, overhead: number, profitMargin: number = 0.25): number => {
    return (laborCost + overhead) / (1 - profitMargin);
  },

  // Apply Service Multiplier
  withServiceMultiplier: (basePrice: number, serviceType: ServiceType): number => {
    const multiplier = SERVICE_MULTIPLIERS.find(m => m.serviceType === serviceType);
    return basePrice * (multiplier?.multiplier.average || 1.0);
  },

  // Apply Frequency Discount
  withFrequencyDiscount: (basePrice: number, frequency: Frequency): number => {
    const discount = FREQUENCY_DISCOUNTS.find(d => d.frequency === frequency);
    const discountPercent = discount?.discountPercent.average || 0;
    return basePrice * (1 - discountPercent / 100);
  },

  // Apply Geographic Multiplier
  withGeographicMultiplier: (basePrice: number, metroArea: string): number => {
    const geo = GEOGRAPHIC_RATES.find(g => g.metroArea === metroArea);
    return basePrice * (geo?.costOfLivingMultiplier || 1.0);
  },

  // Calculate Total with Add-ons
  withAddOns: (basePrice: number, addOnIds: string[]): number => {
    const addOnTotal = addOnIds.reduce((total, id) => {
      const addOn = ADD_ON_SERVICES.find(a => a.id === id);
      return total + (addOn?.price.average || 0);
    }, 0);
    return basePrice + addOnTotal;
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getSqftTier(sqft: number): PricingTier | undefined {
  return SQFT_PRICING_TIERS.find(tier => 
    sqft >= tier.minSqft && (tier.maxSqft === null || sqft < tier.maxSqft)
  );
}

export function getTimeEstimate(sqft: number): CleaningTimeEstimate | undefined {
  return CLEANING_TIME_ESTIMATES.find(est =>
    sqft >= est.sqftRange[0] && sqft <= est.sqftRange[1]
  );
}

export function getAddOnsByCategory(category: string): AddOnService[] {
  return ADD_ON_SERVICES.filter(addon => addon.category === category);
}

export function getPopularAddOns(): AddOnService[] {
  return ADD_ON_SERVICES.filter(addon => addon.popular);
}

export function calculateComprehensivePrice(params: {
  sqft: number;
  bedrooms?: number;
  bathrooms?: number;
  serviceType: ServiceType;
  frequency: Frequency;
  metroArea?: string;
  addOnIds?: string[];
  conditionSurchargeIds?: string[];
  timePremiumIds?: string[];
  pricingMethod?: PricingMethod;
}): {
  basePrice: number;
  serviceMultiplier: number;
  frequencyDiscount: number;
  geoMultiplier: number;
  addOnsTotal: number;
  surchargesTotal: number;
  premiumsTotal: number;
  finalPrice: number;
  priceRange: PriceRange;
  timeEstimate: PriceRange;
} {
  const {
    sqft,
    bedrooms = 3,
    bathrooms = 2,
    serviceType,
    frequency,
    metroArea = 'National Average',
    addOnIds = [],
    conditionSurchargeIds = [],
    timePremiumIds = [],
    pricingMethod = 'sqft',
  } = params;

  // Calculate base price based on method
  let basePrice: number;
  if (pricingMethod === 'sqft') {
    const tier = getSqftTier(sqft);
    basePrice = tier ? sqft * tier.pricePerSqft.average : sqft * 0.10;
  } else if (pricingMethod === 'bedroom_bathroom') {
    basePrice = PRICING_FORMULAS.bedroomBathroom(bedrooms, bathrooms);
  } else {
    const sizeKey = bedrooms <= 1 ? '1br' : bedrooms === 2 ? '2br' : bedrooms === 3 ? '3br' : bedrooms === 4 ? '4br' : '5br_plus';
    basePrice = FLAT_RATE_BY_SIZE[sizeKey]?.standard.average || 200;
  }

  // Service multiplier
  const serviceMultiplier = SERVICE_MULTIPLIERS.find(m => m.serviceType === serviceType)?.multiplier.average || 1.0;
  
  // Frequency discount
  const frequencyDiscountPercent = FREQUENCY_DISCOUNTS.find(d => d.frequency === frequency)?.discountPercent.average || 0;
  const frequencyDiscount = frequencyDiscountPercent / 100;

  // Geographic multiplier
  const geoMultiplier = GEOGRAPHIC_RATES.find(g => g.metroArea === metroArea)?.costOfLivingMultiplier || 1.0;

  // Add-ons
  const addOnsTotal = addOnIds.reduce((total, id) => {
    const addOn = ADD_ON_SERVICES.find(a => a.id === id);
    return total + (addOn?.price.average || 0);
  }, 0);

  // Condition surcharges
  let surchargesTotal = 0;
  conditionSurchargeIds.forEach(id => {
    const surcharge = CONDITION_SURCHARGES.find(s => s.id === id);
    if (surcharge) {
      if (surcharge.surchargeType === 'flat') {
        surchargesTotal += surcharge.amount.average;
      } else {
        surchargesTotal += basePrice * serviceMultiplier * (surcharge.amount.average / 100);
      }
    }
  });

  // Time premiums
  let premiumsPercent = 0;
  timePremiumIds.forEach(id => {
    const premium = TIME_PREMIUMS.find(p => p.id === id);
    if (premium) {
      premiumsPercent += premium.premiumPercent.average;
    }
  });
  const premiumsTotal = basePrice * serviceMultiplier * (premiumsPercent / 100);

  // Calculate final price
  const priceBeforeDiscounts = (basePrice * serviceMultiplier * geoMultiplier) + addOnsTotal + surchargesTotal + premiumsTotal;
  const finalPrice = priceBeforeDiscounts * (1 - frequencyDiscount);

  // Calculate price range
  const priceRange: PriceRange = {
    low: Math.round(finalPrice * 0.85),
    average: Math.round(finalPrice),
    high: Math.round(finalPrice * 1.15),
  };

  // Time estimate
  const timeEst = getTimeEstimate(sqft);
  const timeEstimate: PriceRange = serviceType === 'deep' || serviceType === 'move_in_out'
    ? timeEst?.deepCleanHours || { low: 4, average: 5, high: 6 }
    : timeEst?.standardCleanHours || { low: 3, average: 3.5, high: 4 };

  return {
    basePrice: Math.round(basePrice),
    serviceMultiplier,
    frequencyDiscount: frequencyDiscountPercent,
    geoMultiplier,
    addOnsTotal: Math.round(addOnsTotal),
    surchargesTotal: Math.round(surchargesTotal),
    premiumsTotal: Math.round(premiumsTotal),
    finalPrice: Math.round(finalPrice),
    priceRange,
    timeEstimate,
  };
}
