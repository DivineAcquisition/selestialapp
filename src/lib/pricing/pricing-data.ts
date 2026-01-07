// Comprehensive pricing database for home service industries
// Based on 2024-2025 market research across US and Canada

export interface IndustryPricing {
  slug: string
  name: string
  icon: string
  description: string
  avgTicket: { low: number; avg: number; high: number }
  conversionRate: number // percentage
  salesCycle: string
  grossMargin: { low: number; high: number }
  netMargin: { avg: number; top: number }
  laborPercent: { low: number; high: number }
  pricingModels: PricingModel[]
  services: ServicePricing[]
  retentionModels: RetentionModel[]
  emergencyMultiplier: { afterHours: number; weekend: number; holiday: number }
}

export interface PricingModel {
  type: 'flat_rate' | 'hourly' | 'per_unit' | 'subscription' | 'tiered'
  name: string
  prevalence: number // percentage of industry using this
  conversionImpact: number // percentage impact on conversion
  description: string
  bestFor: string[]
  example: string
}

export interface ServicePricing {
  name: string
  category: string
  pricingUnit: string
  lowPrice: number
  avgPrice: number
  highPrice: number
  laborHours?: { low: number; high: number }
  materialCost?: { low: number; high: number }
  suggestedMarkup: number
}

export interface RetentionModel {
  name: string
  type: 'maintenance_agreement' | 'membership' | 'subscription' | 'prepaid_package'
  frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
  priceRange: { low: number; high: number }
  retentionLift: number // percentage improvement
  ltv_multiplier: number
  includes: string[]
  churnRate: number // monthly percentage
  recommendedDiscount: number // for annual prepay
}

export interface RegionalMultiplier {
  region: string
  cities: string[]
  multiplier: { low: number; high: number }
}

// Regional pricing multipliers
export const REGIONAL_MULTIPLIERS: RegionalMultiplier[] = [
  { region: 'Premium Metro', cities: ['San Francisco', 'New York', 'Boston', 'Los Angeles', 'Seattle'], multiplier: { low: 1.25, high: 1.55 } },
  { region: 'Above Average', cities: ['Chicago', 'Denver', 'Portland', 'Miami', 'Washington DC'], multiplier: { low: 1.10, high: 1.30 } },
  { region: 'Baseline', cities: ['Atlanta', 'Dallas', 'Houston', 'Phoenix', 'Charlotte'], multiplier: { low: 0.95, high: 1.05 } },
  { region: 'Below Average', cities: ['Indianapolis', 'Columbus', 'Kansas City', 'Nashville'], multiplier: { low: 0.85, high: 0.95 } },
  { region: 'Low Cost', cities: ['Rural areas', 'Small towns'], multiplier: { low: 0.70, high: 0.85 } },
]

export const CANADIAN_MULTIPLIERS: RegionalMultiplier[] = [
  { region: 'Ontario', cities: ['Toronto', 'Ottawa'], multiplier: { low: 1.10, high: 1.25 } },
  { region: 'British Columbia', cities: ['Vancouver', 'Victoria'], multiplier: { low: 1.10, high: 1.20 } },
  { region: 'Alberta', cities: ['Calgary', 'Edmonton'], multiplier: { low: 1.00, high: 1.10 } },
  { region: 'Quebec', cities: ['Montreal', 'Quebec City'], multiplier: { low: 0.95, high: 1.00 } },
  { region: 'Atlantic', cities: ['Halifax', 'St. John\'s'], multiplier: { low: 0.85, high: 0.90 } },
]

// Complete industry database
export const INDUSTRIES: IndustryPricing[] = [
  {
    slug: 'cleaning',
    name: 'Cleaning Services',
    icon: 'sparkles',
    description: 'Residential and commercial cleaning services',
    avgTicket: { low: 120, avg: 175, high: 300 },
    conversionRate: 17.65,
    salesCycle: '1-3 days',
    grossMargin: { low: 40, high: 55 },
    netMargin: { avg: 12, top: 25 },
    laborPercent: { low: 30, high: 50 },
    emergencyMultiplier: { afterHours: 1.25, weekend: 1.5, holiday: 2.0 },
    pricingModels: [
      {
        type: 'flat_rate',
        name: 'Flat Rate per Clean',
        prevalence: 50,
        conversionImpact: 25,
        description: 'Fixed price based on home size and clean type',
        bestFor: ['Standard cleans', 'Recurring services', 'Online booking'],
        example: '$150 for 3-bed/2-bath standard clean'
      },
      {
        type: 'hourly',
        name: 'Hourly Rate',
        prevalence: 30,
        conversionImpact: -10,
        description: 'Charge per cleaner per hour',
        bestFor: ['Deep cleans', 'Unpredictable jobs', 'Add-on services'],
        example: '$35-50/hour per cleaner'
      },
      {
        type: 'per_unit',
        name: 'Per Square Foot',
        prevalence: 20,
        conversionImpact: 5,
        description: 'Price based on home square footage',
        bestFor: ['Large homes', 'Commercial', 'Consistent pricing'],
        example: '$0.10-0.20/sqft standard, $0.25-0.30/sqft deep clean'
      },
      {
        type: 'subscription',
        name: 'Recurring Subscription',
        prevalence: 35,
        conversionImpact: 40,
        description: 'Discounted rate for recurring service commitment',
        bestFor: ['Customer retention', 'Predictable revenue', 'Lifetime value'],
        example: 'Weekly: 20% off, Bi-weekly: 10% off, Monthly: 5% off'
      }
    ],
    services: [
      { name: 'Standard Clean (1BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 75, avgPrice: 95, highPrice: 110, laborHours: { low: 1.5, high: 2 }, suggestedMarkup: 100 },
      { name: 'Standard Clean (2BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 100, avgPrice: 125, highPrice: 150, laborHours: { low: 2, high: 2.5 }, suggestedMarkup: 100 },
      { name: 'Standard Clean (3BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 150, avgPrice: 175, highPrice: 200, laborHours: { low: 2.5, high: 3 }, suggestedMarkup: 100 },
      { name: 'Standard Clean (4BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 175, avgPrice: 210, highPrice: 250, laborHours: { low: 3, high: 4 }, suggestedMarkup: 100 },
      { name: 'Deep Clean (1BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 120, avgPrice: 160, highPrice: 200, laborHours: { low: 2.5, high: 3.5 }, suggestedMarkup: 120 },
      { name: 'Deep Clean (2BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 150, avgPrice: 225, highPrice: 300, laborHours: { low: 3, high: 4.5 }, suggestedMarkup: 120 },
      { name: 'Deep Clean (3BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 200, avgPrice: 300, highPrice: 400, laborHours: { low: 4, high: 6 }, suggestedMarkup: 120 },
      { name: 'Deep Clean (4BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 300, avgPrice: 375, highPrice: 450, laborHours: { low: 5, high: 7 }, suggestedMarkup: 120 },
      { name: 'Move-In/Move-Out (2BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 200, avgPrice: 275, highPrice: 350, laborHours: { low: 3.5, high: 5 }, suggestedMarkup: 130 },
      { name: 'Move-In/Move-Out (3BR)', category: 'Residential', pricingUnit: 'flat', lowPrice: 250, avgPrice: 335, highPrice: 420, laborHours: { low: 4.5, high: 6.5 }, suggestedMarkup: 130 },
      { name: 'Post-Construction', category: 'Specialty', pricingUnit: 'sqft', lowPrice: 0.35, avgPrice: 0.50, highPrice: 0.75, suggestedMarkup: 150 },
      { name: 'Carpet Cleaning', category: 'Specialty', pricingUnit: 'room', lowPrice: 40, avgPrice: 65, highPrice: 90, suggestedMarkup: 100 },
      { name: 'Window Cleaning (Interior)', category: 'Specialty', pricingUnit: 'window', lowPrice: 4, avgPrice: 8, highPrice: 15, suggestedMarkup: 150 },
      { name: 'Office Cleaning', category: 'Commercial', pricingUnit: 'sqft', lowPrice: 0.07, avgPrice: 0.15, highPrice: 0.25, suggestedMarkup: 80 },
    ],
    retentionModels: [
      {
        name: 'Weekly Service Plan',
        type: 'subscription',
        frequency: 'monthly',
        priceRange: { low: 280, high: 600 },
        retentionLift: 85,
        ltv_multiplier: 4.2,
        includes: ['4 standard cleans/month', '10% supply credit', 'Priority scheduling'],
        churnRate: 3,
        recommendedDiscount: 20
      },
      {
        name: 'Bi-Weekly Service Plan',
        type: 'subscription',
        frequency: 'monthly',
        priceRange: { low: 180, high: 360 },
        retentionLift: 65,
        ltv_multiplier: 3.1,
        includes: ['2 standard cleans/month', '5% supply credit', 'Flexible rescheduling'],
        churnRate: 5,
        recommendedDiscount: 10
      },
      {
        name: 'Annual Deep Clean Package',
        type: 'prepaid_package',
        frequency: 'annual',
        priceRange: { low: 600, high: 1200 },
        retentionLift: 45,
        ltv_multiplier: 2.3,
        includes: ['2 deep cleans', '2 standard cleans', 'Priority booking', '15% off add-ons'],
        churnRate: 8,
        recommendedDiscount: 15
      }
    ]
  },
  {
    slug: 'hvac',
    name: 'HVAC Services',
    icon: 'thermometer',
    description: 'Heating, ventilation, and air conditioning',
    avgTicket: { low: 350, avg: 750, high: 5750 },
    conversionRate: 5,
    salesCycle: '60+ days',
    grossMargin: { low: 30, high: 40 },
    netMargin: { avg: 9, top: 20 },
    laborPercent: { low: 18, high: 22 },
    emergencyMultiplier: { afterHours: 1.5, weekend: 1.75, holiday: 2.5 },
    pricingModels: [
      {
        type: 'flat_rate',
        name: 'Flat Rate Repairs',
        prevalence: 60,
        conversionImpact: 35,
        description: 'Fixed price per repair type from price book',
        bestFor: ['Common repairs', 'Customer trust', 'Technician efficiency'],
        example: '$350 capacitor replacement, $650 blower motor'
      },
      {
        type: 'hourly',
        name: 'Time & Materials',
        prevalence: 25,
        conversionImpact: -15,
        description: 'Hourly labor plus parts markup',
        bestFor: ['Diagnostic work', 'Complex repairs', 'Custom installations'],
        example: '$95-150/hr + parts at 50-100% markup'
      },
      {
        type: 'tiered',
        name: 'Good-Better-Best Options',
        prevalence: 45,
        conversionImpact: 42,
        description: 'Present 3-4 options with increasing value',
        bestFor: ['Installations', 'Replacements', 'Maximizing revenue'],
        example: 'Basic: $4,500 | Standard: $5,800 | Premium: $7,200'
      },
      {
        type: 'subscription',
        name: 'Maintenance Agreement',
        prevalence: 39,
        conversionImpact: 55,
        description: 'Annual service contract with benefits',
        bestFor: ['Recurring revenue', 'Customer retention', 'Off-season stability'],
        example: '$150-300/year for 2 tune-ups + 15% repair discount'
      }
    ],
    services: [
      { name: 'Service Call / Diagnostic', category: 'Service', pricingUnit: 'flat', lowPrice: 75, avgPrice: 125, highPrice: 200, laborHours: { low: 0.5, high: 1 }, suggestedMarkup: 0 },
      { name: 'AC Tune-Up', category: 'Maintenance', pricingUnit: 'flat', lowPrice: 65, avgPrice: 120, highPrice: 200, laborHours: { low: 1, high: 1.5 }, suggestedMarkup: 100 },
      { name: 'Furnace Tune-Up', category: 'Maintenance', pricingUnit: 'flat', lowPrice: 80, avgPrice: 150, highPrice: 200, laborHours: { low: 1, high: 1.5 }, suggestedMarkup: 100 },
      { name: 'Capacitor Replacement', category: 'Repair', pricingUnit: 'flat', lowPrice: 120, avgPrice: 260, highPrice: 400, materialCost: { low: 15, high: 50 }, suggestedMarkup: 200 },
      { name: 'Fan Motor Replacement', category: 'Repair', pricingUnit: 'flat', lowPrice: 100, avgPrice: 400, highPrice: 700, materialCost: { low: 50, high: 200 }, suggestedMarkup: 150 },
      { name: 'Blower Motor Replacement', category: 'Repair', pricingUnit: 'flat', lowPrice: 250, avgPrice: 675, highPrice: 1100, materialCost: { low: 100, high: 400 }, suggestedMarkup: 150 },
      { name: 'Refrigerant Recharge (R-410A)', category: 'Repair', pricingUnit: 'lb', lowPrice: 50, avgPrice: 125, highPrice: 175, suggestedMarkup: 200 },
      { name: 'Compressor Replacement', category: 'Repair', pricingUnit: 'flat', lowPrice: 800, avgPrice: 1800, highPrice: 2800, materialCost: { low: 400, high: 1200 }, suggestedMarkup: 100 },
      { name: 'Thermostat Install (Basic)', category: 'Install', pricingUnit: 'flat', lowPrice: 150, avgPrice: 275, highPrice: 400, materialCost: { low: 25, high: 100 }, suggestedMarkup: 150 },
      { name: 'Thermostat Install (Smart)', category: 'Install', pricingUnit: 'flat', lowPrice: 200, avgPrice: 350, highPrice: 500, materialCost: { low: 100, high: 250 }, suggestedMarkup: 100 },
      { name: 'AC System (2 ton)', category: 'Installation', pricingUnit: 'flat', lowPrice: 2500, avgPrice: 4000, highPrice: 5500, suggestedMarkup: 50 },
      { name: 'AC System (3 ton)', category: 'Installation', pricingUnit: 'flat', lowPrice: 4000, avgPrice: 5900, highPrice: 7800, suggestedMarkup: 50 },
      { name: 'AC System (4 ton)', category: 'Installation', pricingUnit: 'flat', lowPrice: 5500, avgPrice: 7500, highPrice: 9500, suggestedMarkup: 50 },
      { name: 'AC System (5 ton)', category: 'Installation', pricingUnit: 'flat', lowPrice: 4000, avgPrice: 7000, highPrice: 10000, suggestedMarkup: 50 },
      { name: 'Furnace Installation', category: 'Installation', pricingUnit: 'flat', lowPrice: 2500, avgPrice: 4500, highPrice: 7500, suggestedMarkup: 45 },
      { name: 'Ductwork (per linear ft)', category: 'Installation', pricingUnit: 'linear_ft', lowPrice: 35, avgPrice: 55, highPrice: 80, suggestedMarkup: 60 },
    ],
    retentionModels: [
      {
        name: 'Basic Maintenance Plan',
        type: 'maintenance_agreement',
        frequency: 'annual',
        priceRange: { low: 120, high: 200 },
        retentionLift: 37,
        ltv_multiplier: 3.0,
        includes: ['1 AC tune-up', '1 heating tune-up', '10% repair discount', 'No trip charge'],
        churnRate: 8,
        recommendedDiscount: 0
      },
      {
        name: 'Comfort Club (Standard)',
        type: 'membership',
        frequency: 'annual',
        priceRange: { low: 150, high: 300 },
        retentionLift: 52,
        ltv_multiplier: 3.8,
        includes: ['2 tune-ups', '15% repair discount', 'Priority scheduling', 'No overtime fees'],
        churnRate: 6,
        recommendedDiscount: 10
      },
      {
        name: 'Premium Protection Plan',
        type: 'membership',
        frequency: 'annual',
        priceRange: { low: 300, high: 500 },
        retentionLift: 68,
        ltv_multiplier: 4.5,
        includes: ['2+ tune-ups', '20% repair discount', '24/7 priority', 'Parts warranty', 'Indoor air quality check'],
        churnRate: 4,
        recommendedDiscount: 15
      },
      {
        name: 'Monthly Comfort Plan',
        type: 'subscription',
        frequency: 'monthly',
        priceRange: { low: 15, high: 45 },
        retentionLift: 75,
        ltv_multiplier: 5.2,
        includes: ['All tune-ups', 'Priority service', 'Repair discounts', 'No trip fees'],
        churnRate: 3,
        recommendedDiscount: 20
      }
    ]
  },
  {
    slug: 'plumbing',
    name: 'Plumbing Services',
    icon: 'wrench',
    description: 'Residential and commercial plumbing',
    avgTicket: { low: 175, avg: 350, high: 600 },
    conversionRate: 14,
    salesCycle: '1-7 days',
    grossMargin: { low: 45, high: 65 },
    netMargin: { avg: 12, top: 20 },
    laborPercent: { low: 25, high: 35 },
    emergencyMultiplier: { afterHours: 1.5, weekend: 2.0, holiday: 2.5 },
    pricingModels: [
      {
        type: 'flat_rate',
        name: 'Flat Rate Book Pricing',
        prevalence: 55,
        conversionImpact: 30,
        description: 'Pre-set prices for common repairs',
        bestFor: ['Standard repairs', 'Customer confidence', 'Upselling'],
        example: '$275 drain cleaning, $450 toilet install'
      },
      {
        type: 'hourly',
        name: 'Time & Materials',
        prevalence: 30,
        conversionImpact: -10,
        description: 'Hourly labor plus parts at markup',
        bestFor: ['Diagnostics', 'Complex jobs', 'Remodels'],
        example: '$85-150/hr journeyman, parts at 3-6x cost'
      },
      {
        type: 'tiered',
        name: 'Good-Better-Best',
        prevalence: 35,
        conversionImpact: 38,
        description: 'Multiple options at different price points',
        bestFor: ['Water heaters', 'Fixture upgrades', 'Whole-house repiping'],
        example: 'Standard WH: $1,200 | High-Eff: $1,800 | Tankless: $3,500'
      },
      {
        type: 'subscription',
        name: 'Plumbing Club Membership',
        prevalence: 20,
        conversionImpact: 45,
        description: 'Annual membership with inspection and discounts',
        bestFor: ['Older homes', 'Customer retention', 'Lead generation'],
        example: '$99/year: annual inspection + 15% off repairs'
      }
    ],
    services: [
      { name: 'Service Call / Trip Fee', category: 'Service', pricingUnit: 'flat', lowPrice: 50, avgPrice: 100, highPrice: 200, suggestedMarkup: 0 },
      { name: 'Drain Cleaning (Snake)', category: 'Drain', pricingUnit: 'flat', lowPrice: 100, avgPrice: 190, highPrice: 275, laborHours: { low: 0.5, high: 1.5 }, suggestedMarkup: 150 },
      { name: 'Hydro-Jetting', category: 'Drain', pricingUnit: 'flat', lowPrice: 300, avgPrice: 450, highPrice: 600, laborHours: { low: 1, high: 2 }, suggestedMarkup: 100 },
      { name: 'Faucet Installation', category: 'Fixture', pricingUnit: 'flat', lowPrice: 200, avgPrice: 400, highPrice: 600, materialCost: { low: 50, high: 300 }, suggestedMarkup: 100 },
      { name: 'Toilet Installation', category: 'Fixture', pricingUnit: 'flat', lowPrice: 224, avgPrice: 375, highPrice: 531, materialCost: { low: 100, high: 400 }, suggestedMarkup: 80 },
      { name: 'Toilet Repair', category: 'Repair', pricingUnit: 'flat', lowPrice: 100, avgPrice: 175, highPrice: 250, suggestedMarkup: 150 },
      { name: 'Garbage Disposal Install', category: 'Fixture', pricingUnit: 'flat', lowPrice: 200, avgPrice: 375, highPrice: 550, materialCost: { low: 75, high: 250 }, suggestedMarkup: 100 },
      { name: 'Water Heater (Tank 50gal)', category: 'Installation', pricingUnit: 'flat', lowPrice: 700, avgPrice: 1600, highPrice: 3100, materialCost: { low: 300, high: 800 }, suggestedMarkup: 65 },
      { name: 'Water Heater (Tankless)', category: 'Installation', pricingUnit: 'flat', lowPrice: 1400, avgPrice: 3500, highPrice: 5600, materialCost: { low: 800, high: 2000 }, suggestedMarkup: 50 },
      { name: 'Pipe Repair (per foot)', category: 'Repair', pricingUnit: 'linear_ft', lowPrice: 15, avgPrice: 35, highPrice: 60, suggestedMarkup: 200 },
      { name: 'Sump Pump Install', category: 'Installation', pricingUnit: 'flat', lowPrice: 600, avgPrice: 1100, highPrice: 1800, materialCost: { low: 150, high: 500 }, suggestedMarkup: 80 },
      { name: 'Whole House Repipe', category: 'Installation', pricingUnit: 'flat', lowPrice: 4000, avgPrice: 7500, highPrice: 15000, suggestedMarkup: 45 },
    ],
    retentionModels: [
      {
        name: 'Plumbing Club',
        type: 'membership',
        frequency: 'annual',
        priceRange: { low: 90, high: 150 },
        retentionLift: 42,
        ltv_multiplier: 2.8,
        includes: ['Annual inspection', '15% repair discount', 'Priority scheduling', 'No trip fee'],
        churnRate: 7,
        recommendedDiscount: 10
      },
      {
        name: 'Home Protection Plan',
        type: 'membership',
        frequency: 'annual',
        priceRange: { low: 150, high: 250 },
        retentionLift: 55,
        ltv_multiplier: 3.5,
        includes: ['2 inspections', '20% repair discount', 'Drain cleaning included', 'Emergency priority'],
        churnRate: 5,
        recommendedDiscount: 15
      }
    ]
  },
  {
    slug: 'electrical',
    name: 'Electrical Services',
    icon: 'zap',
    description: 'Residential and commercial electrical work',
    avgTicket: { low: 150, avg: 275, high: 500 },
    conversionRate: 12,
    salesCycle: '3-14 days',
    grossMargin: { low: 40, high: 60 },
    netMargin: { avg: 11, top: 20 },
    laborPercent: { low: 40, high: 60 },
    emergencyMultiplier: { afterHours: 1.5, weekend: 2.0, holiday: 2.5 },
    pricingModels: [
      {
        type: 'flat_rate',
        name: 'Flat Rate Per Task',
        prevalence: 50,
        conversionImpact: 28,
        description: 'Fixed price for common electrical work',
        bestFor: ['Outlet installs', 'Fixture swaps', 'Standard repairs'],
        example: '$150 outlet install, $250 ceiling fan'
      },
      {
        type: 'hourly',
        name: 'Hourly Rate',
        prevalence: 35,
        conversionImpact: -5,
        description: 'Per-hour billing for labor',
        bestFor: ['Troubleshooting', 'Complex rewiring', 'Commercial work'],
        example: '$75-130/hr journeyman, $100-200/hr master'
      },
      {
        type: 'per_unit',
        name: 'Per Device/Circuit',
        prevalence: 30,
        conversionImpact: 15,
        description: 'Price per outlet, switch, or circuit',
        bestFor: ['Multi-device jobs', 'Panel work', 'New construction'],
        example: '$80-150 per outlet, $150-300 per circuit'
      }
    ],
    services: [
      { name: 'Service Call / Diagnostic', category: 'Service', pricingUnit: 'flat', lowPrice: 75, avgPrice: 125, highPrice: 200, suggestedMarkup: 0 },
      { name: 'Outlet Installation', category: 'Install', pricingUnit: 'each', lowPrice: 80, avgPrice: 155, highPrice: 230, materialCost: { low: 5, high: 20 }, suggestedMarkup: 200 },
      { name: 'GFCI Outlet', category: 'Install', pricingUnit: 'each', lowPrice: 90, avgPrice: 170, highPrice: 250, materialCost: { low: 15, high: 30 }, suggestedMarkup: 200 },
      { name: '240V Outlet (EV/Dryer)', category: 'Install', pricingUnit: 'each', lowPrice: 250, avgPrice: 525, highPrice: 800, materialCost: { low: 30, high: 100 }, suggestedMarkup: 150 },
      { name: 'Ceiling Fan Install', category: 'Install', pricingUnit: 'each', lowPrice: 134, avgPrice: 300, highPrice: 600, materialCost: { low: 0, high: 0 }, suggestedMarkup: 150 },
      { name: 'Light Fixture Install', category: 'Install', pricingUnit: 'each', lowPrice: 100, avgPrice: 250, highPrice: 500, suggestedMarkup: 150 },
      { name: 'Recessed Light (per light)', category: 'Install', pricingUnit: 'each', lowPrice: 125, avgPrice: 225, highPrice: 350, materialCost: { low: 15, high: 50 }, suggestedMarkup: 150 },
      { name: 'Panel Upgrade (100-200A)', category: 'Install', pricingUnit: 'flat', lowPrice: 1300, avgPrice: 2900, highPrice: 4500, materialCost: { low: 400, high: 1000 }, suggestedMarkup: 80 },
      { name: 'EV Charger Install', category: 'Install', pricingUnit: 'flat', lowPrice: 800, avgPrice: 1800, highPrice: 3500, materialCost: { low: 300, high: 800 }, suggestedMarkup: 70 },
      { name: 'Whole House Surge Protector', category: 'Install', pricingUnit: 'flat', lowPrice: 250, avgPrice: 400, highPrice: 600, materialCost: { low: 80, high: 200 }, suggestedMarkup: 100 },
      { name: 'Smoke Detector Install', category: 'Install', pricingUnit: 'each', lowPrice: 50, avgPrice: 100, highPrice: 175, materialCost: { low: 15, high: 50 }, suggestedMarkup: 150 },
    ],
    retentionModels: [
      {
        name: 'Electrical Safety Plan',
        type: 'membership',
        frequency: 'annual',
        priceRange: { low: 99, high: 199 },
        retentionLift: 35,
        ltv_multiplier: 2.5,
        includes: ['Annual safety inspection', '15% repair discount', 'Priority scheduling'],
        churnRate: 8,
        recommendedDiscount: 10
      }
    ]
  },
  {
    slug: 'landscaping',
    name: 'Landscaping & Lawn Care',
    icon: 'leaf',
    description: 'Lawn maintenance and landscape services',
    avgTicket: { low: 50, avg: 150, high: 500 },
    conversionRate: 15,
    salesCycle: '3-7 days',
    grossMargin: { low: 35, high: 45 },
    netMargin: { avg: 7, top: 20 },
    laborPercent: { low: 25, high: 40 },
    emergencyMultiplier: { afterHours: 1.25, weekend: 1.25, holiday: 1.5 },
    pricingModels: [
      {
        type: 'per_unit',
        name: 'Per Square Foot',
        prevalence: 40,
        conversionImpact: 12,
        description: 'Price based on lawn/lot square footage',
        bestFor: ['Mowing', 'Fertilization', 'Aeration', 'Sod installation'],
        example: '$0.015-0.025/sqft for mowing'
      },
      {
        type: 'flat_rate',
        name: 'Flat Rate per Visit',
        prevalence: 35,
        conversionImpact: 20,
        description: 'Fixed price per service visit',
        bestFor: ['Standard mowing', 'Seasonal cleanup', 'Regular maintenance'],
        example: '$45-85 per mow for avg lawn'
      },
      {
        type: 'subscription',
        name: 'Seasonal/Annual Contract',
        prevalence: 50,
        conversionImpact: 55,
        description: 'Recurring service agreement',
        bestFor: ['Weekly mowing', 'Full-service maintenance', 'Customer retention'],
        example: '$150-300/month for weekly full service'
      },
      {
        type: 'hourly',
        name: 'Hourly (Crew Rate)',
        prevalence: 25,
        conversionImpact: -5,
        description: 'Per-hour crew billing',
        bestFor: ['Large projects', 'Hardscaping', 'Tree work'],
        example: '$45-65/man-hour or $90-150/crew-hour'
      }
    ],
    services: [
      { name: 'Lawn Mowing (Small - ⅛ acre)', category: 'Maintenance', pricingUnit: 'visit', lowPrice: 30, avgPrice: 55, highPrice: 85, laborHours: { low: 0.5, high: 1 }, suggestedMarkup: 100 },
      { name: 'Lawn Mowing (Medium - ¼ acre)', category: 'Maintenance', pricingUnit: 'visit', lowPrice: 40, avgPrice: 75, highPrice: 110, laborHours: { low: 0.75, high: 1.25 }, suggestedMarkup: 100 },
      { name: 'Lawn Mowing (Large - ½ acre)', category: 'Maintenance', pricingUnit: 'visit', lowPrice: 75, avgPrice: 125, highPrice: 180, laborHours: { low: 1, high: 2 }, suggestedMarkup: 100 },
      { name: 'Lawn Mowing (1 acre)', category: 'Maintenance', pricingUnit: 'visit', lowPrice: 60, avgPrice: 130, highPrice: 200, laborHours: { low: 1.5, high: 2.5 }, suggestedMarkup: 100 },
      { name: 'Spring/Fall Cleanup', category: 'Seasonal', pricingUnit: 'flat', lowPrice: 150, avgPrice: 350, highPrice: 600, laborHours: { low: 2, high: 6 }, suggestedMarkup: 80 },
      { name: 'Mulch Installation', category: 'Install', pricingUnit: 'cubic_yard', lowPrice: 50, avgPrice: 100, highPrice: 150, materialCost: { low: 25, high: 45 }, suggestedMarkup: 100 },
      { name: 'Sod Installation', category: 'Install', pricingUnit: 'sqft', lowPrice: 1.00, avgPrice: 1.50, highPrice: 2.00, materialCost: { low: 0.30, high: 0.60 }, suggestedMarkup: 100 },
      { name: 'Aeration', category: 'Treatment', pricingUnit: 'sqft', lowPrice: 0.02, avgPrice: 0.04, highPrice: 0.06, suggestedMarkup: 200 },
      { name: 'Fertilization (per app)', category: 'Treatment', pricingUnit: 'sqft', lowPrice: 0.01, avgPrice: 0.02, highPrice: 0.03, materialCost: { low: 0.005, high: 0.01 }, suggestedMarkup: 150 },
      { name: 'Hedge Trimming (per hour)', category: 'Maintenance', pricingUnit: 'hour', lowPrice: 50, avgPrice: 75, highPrice: 100, suggestedMarkup: 100 },
      { name: 'Irrigation System Install', category: 'Install', pricingUnit: 'flat', lowPrice: 2500, avgPrice: 4500, highPrice: 6500, suggestedMarkup: 45 },
      { name: 'Landscape Lighting (per fixture)', category: 'Install', pricingUnit: 'each', lowPrice: 100, avgPrice: 175, highPrice: 250, materialCost: { low: 30, high: 100 }, suggestedMarkup: 80 },
    ],
    retentionModels: [
      {
        name: 'Weekly Mowing Plan',
        type: 'subscription',
        frequency: 'monthly',
        priceRange: { low: 150, high: 400 },
        retentionLift: 70,
        ltv_multiplier: 3.8,
        includes: ['4 mows/month', 'Edging', 'Blowing', 'Basic weed control'],
        churnRate: 5,
        recommendedDiscount: 15
      },
      {
        name: 'Full Service Annual',
        type: 'subscription',
        frequency: 'annual',
        priceRange: { low: 2000, high: 4500 },
        retentionLift: 85,
        ltv_multiplier: 4.5,
        includes: ['Weekly mowing (season)', 'Fertilization', 'Aeration', 'Fall/spring cleanup', 'Mulching'],
        churnRate: 3,
        recommendedDiscount: 20
      },
      {
        name: 'Seasonal Package',
        type: 'prepaid_package',
        frequency: 'quarterly',
        priceRange: { low: 450, high: 900 },
        retentionLift: 50,
        ltv_multiplier: 2.5,
        includes: ['12 mows', 'Seasonal cleanup', 'Edging'],
        churnRate: 8,
        recommendedDiscount: 10
      }
    ]
  },
  {
    slug: 'pest_control',
    name: 'Pest Control',
    icon: 'bug',
    description: 'Residential and commercial pest management',
    avgTicket: { low: 100, avg: 200, high: 500 },
    conversionRate: 18,
    salesCycle: '1-3 days',
    grossMargin: { low: 50, high: 65 },
    netMargin: { avg: 12, top: 20 },
    laborPercent: { low: 25, high: 35 },
    emergencyMultiplier: { afterHours: 1.5, weekend: 1.5, holiday: 2.0 },
    pricingModels: [
      {
        type: 'subscription',
        name: 'Quarterly Service (Most Popular)',
        prevalence: 70,
        conversionImpact: 65,
        description: 'Recurring quarterly treatments',
        bestFor: ['General pest control', 'Prevention', 'Customer retention'],
        example: '$100-150/quarter for general pest'
      },
      {
        type: 'flat_rate',
        name: 'One-Time Treatment',
        prevalence: 20,
        conversionImpact: 10,
        description: 'Single treatment for specific issue',
        bestFor: ['Acute infestations', 'Real estate', 'Seasonal issues'],
        example: '$150-400 one-time treatment'
      },
      {
        type: 'per_unit',
        name: 'Per Square Foot',
        prevalence: 30,
        conversionImpact: 5,
        description: 'Pricing based on property size',
        bestFor: ['Termites', 'Bed bugs', 'Large properties'],
        example: '$1-3/sqft for termite treatment'
      }
    ],
    services: [
      { name: 'General Pest (One-Time)', category: 'Treatment', pricingUnit: 'flat', lowPrice: 100, avgPrice: 200, highPrice: 350, suggestedMarkup: 200 },
      { name: 'General Pest (Quarterly)', category: 'Treatment', pricingUnit: 'quarter', lowPrice: 100, avgPrice: 150, highPrice: 250, suggestedMarkup: 200 },
      { name: 'Ant Treatment', category: 'Treatment', pricingUnit: 'flat', lowPrice: 100, avgPrice: 200, highPrice: 400, suggestedMarkup: 200 },
      { name: 'Roach Treatment', category: 'Treatment', pricingUnit: 'flat', lowPrice: 100, avgPrice: 250, highPrice: 400, suggestedMarkup: 200 },
      { name: 'Rodent Control', category: 'Treatment', pricingUnit: 'flat', lowPrice: 150, avgPrice: 350, highPrice: 600, suggestedMarkup: 150 },
      { name: 'Bed Bug Treatment (per room)', category: 'Treatment', pricingUnit: 'room', lowPrice: 300, avgPrice: 500, highPrice: 800, suggestedMarkup: 150 },
      { name: 'Bed Bug (Whole House)', category: 'Treatment', pricingUnit: 'flat', lowPrice: 1000, avgPrice: 2500, highPrice: 5000, suggestedMarkup: 100 },
      { name: 'Termite Inspection', category: 'Inspection', pricingUnit: 'flat', lowPrice: 75, avgPrice: 125, highPrice: 200, suggestedMarkup: 150 },
      { name: 'Termite Treatment (Liquid)', category: 'Treatment', pricingUnit: 'linear_ft', lowPrice: 3, avgPrice: 7, highPrice: 16, suggestedMarkup: 150 },
      { name: 'Termite Treatment (Bait)', category: 'Treatment', pricingUnit: 'flat', lowPrice: 1500, avgPrice: 3000, highPrice: 5000, suggestedMarkup: 100 },
      { name: 'Mosquito Treatment', category: 'Treatment', pricingUnit: 'flat', lowPrice: 75, avgPrice: 125, highPrice: 200, suggestedMarkup: 200 },
      { name: 'Wildlife Removal', category: 'Removal', pricingUnit: 'flat', lowPrice: 200, avgPrice: 400, highPrice: 800, suggestedMarkup: 100 },
    ],
    retentionModels: [
      {
        name: 'Quarterly Protection Plan',
        type: 'subscription',
        frequency: 'quarterly',
        priceRange: { low: 100, high: 200 },
        retentionLift: 75,
        ltv_multiplier: 4.0,
        includes: ['Quarterly treatment', 'Free re-treats', 'Interior/exterior service'],
        churnRate: 4,
        recommendedDiscount: 0
      },
      {
        name: 'Annual Protection (Prepaid)',
        type: 'subscription',
        frequency: 'annual',
        priceRange: { low: 350, high: 700 },
        retentionLift: 85,
        ltv_multiplier: 5.0,
        includes: ['4 treatments', 'Unlimited callbacks', 'Termite monitoring'],
        churnRate: 3,
        recommendedDiscount: 15
      },
      {
        name: 'Premium Pest + Termite Bundle',
        type: 'subscription',
        frequency: 'annual',
        priceRange: { low: 600, high: 1200 },
        retentionLift: 90,
        ltv_multiplier: 6.0,
        includes: ['Quarterly pest', 'Annual termite inspection', 'Termite warranty', 'Rodent monitoring'],
        churnRate: 2,
        recommendedDiscount: 20
      }
    ]
  },
  {
    slug: 'roofing',
    name: 'Roofing Services',
    icon: 'home',
    description: 'Roof repair, replacement, and maintenance',
    avgTicket: { low: 350, avg: 7500, high: 25000 },
    conversionRate: 5,
    salesCycle: '30-90 days',
    grossMargin: { low: 20, high: 40 },
    netMargin: { avg: 9, top: 15 },
    laborPercent: { low: 35, high: 50 },
    emergencyMultiplier: { afterHours: 1.5, weekend: 1.5, holiday: 2.0 },
    pricingModels: [
      {
        type: 'per_unit',
        name: 'Per Roofing Square',
        prevalence: 80,
        conversionImpact: 15,
        description: 'Price per 100 sqft (1 square)',
        bestFor: ['Full replacements', 'Large repairs', 'Accurate quoting'],
        example: '$350-700/square for architectural shingles'
      },
      {
        type: 'flat_rate',
        name: 'Flat Rate Repairs',
        prevalence: 40,
        conversionImpact: 25,
        description: 'Fixed price for common repairs',
        bestFor: ['Leak repairs', 'Small patches', 'Emergency work'],
        example: '$300-800 for typical leak repair'
      },
      {
        type: 'tiered',
        name: 'Good-Better-Best Materials',
        prevalence: 55,
        conversionImpact: 35,
        description: 'Options by material quality/warranty',
        bestFor: ['Full replacements', 'Maximizing ticket', 'Customer choice'],
        example: '3-tab: $350/sq | Architectural: $500/sq | Premium: $700/sq'
      }
    ],
    services: [
      { name: 'Roof Inspection', category: 'Inspection', pricingUnit: 'flat', lowPrice: 100, avgPrice: 200, highPrice: 400, suggestedMarkup: 100 },
      { name: 'Leak Repair', category: 'Repair', pricingUnit: 'flat', lowPrice: 300, avgPrice: 650, highPrice: 1200, suggestedMarkup: 100 },
      { name: 'Shingle Replacement (per square)', category: 'Repair', pricingUnit: 'square', lowPrice: 150, avgPrice: 300, highPrice: 500, suggestedMarkup: 80 },
      { name: '3-Tab Shingles Install', category: 'Install', pricingUnit: 'square', lowPrice: 350, avgPrice: 408, highPrice: 465, materialCost: { low: 90, high: 120 }, suggestedMarkup: 60 },
      { name: 'Architectural Shingles Install', category: 'Install', pricingUnit: 'square', lowPrice: 500, avgPrice: 600, highPrice: 700, materialCost: { low: 120, high: 180 }, suggestedMarkup: 55 },
      { name: 'Metal Roof Install', category: 'Install', pricingUnit: 'square', lowPrice: 1200, avgPrice: 1825, highPrice: 2450, materialCost: { low: 400, high: 800 }, suggestedMarkup: 45 },
      { name: 'Flat Roof (TPO/EPDM)', category: 'Install', pricingUnit: 'sqft', lowPrice: 5, avgPrice: 8, highPrice: 12, suggestedMarkup: 50 },
      { name: 'Gutter Install (Aluminum)', category: 'Install', pricingUnit: 'linear_ft', lowPrice: 14, avgPrice: 17, highPrice: 20, materialCost: { low: 4, high: 7 }, suggestedMarkup: 70 },
      { name: 'Gutter Cleaning', category: 'Maintenance', pricingUnit: 'linear_ft', lowPrice: 0.40, avgPrice: 1.00, highPrice: 1.85, suggestedMarkup: 200 },
    ],
    retentionModels: [
      {
        name: 'Annual Roof Inspection Plan',
        type: 'maintenance_agreement',
        frequency: 'annual',
        priceRange: { low: 150, high: 300 },
        retentionLift: 30,
        ltv_multiplier: 2.0,
        includes: ['Annual inspection', 'Minor repairs included', '10% off major work', 'Photo documentation'],
        churnRate: 10,
        recommendedDiscount: 10
      },
      {
        name: 'Roof Care Program',
        type: 'membership',
        frequency: 'annual',
        priceRange: { low: 250, high: 500 },
        retentionLift: 45,
        ltv_multiplier: 2.8,
        includes: ['2 inspections', 'Gutter cleaning', 'Priority emergency response', '15% off repairs'],
        churnRate: 7,
        recommendedDiscount: 15
      }
    ]
  },
  {
    slug: 'painting',
    name: 'Painting Services',
    icon: 'paintbrush',
    description: 'Interior and exterior painting',
    avgTicket: { low: 300, avg: 2500, high: 8000 },
    conversionRate: 12,
    salesCycle: '7-21 days',
    grossMargin: { low: 35, high: 50 },
    netMargin: { avg: 10, top: 18 },
    laborPercent: { low: 35, high: 50 },
    emergencyMultiplier: { afterHours: 1.25, weekend: 1.5, holiday: 1.75 },
    pricingModels: [
      {
        type: 'per_unit',
        name: 'Per Square Foot',
        prevalence: 40,
        conversionImpact: 10,
        description: 'Price based on paintable area',
        bestFor: ['Whole-house', 'Large rooms', 'Consistent quoting'],
        example: '$2-5/sqft interior, $1.50-4/sqft exterior'
      },
      {
        type: 'flat_rate',
        name: 'Per Room/Project',
        prevalence: 35,
        conversionImpact: 25,
        description: 'Fixed price per room or project',
        bestFor: ['Single rooms', 'Small projects', 'Customer simplicity'],
        example: '$300-600 per average room'
      },
      {
        type: 'hourly',
        name: 'Hourly Rate',
        prevalence: 25,
        conversionImpact: -10,
        description: 'Per-painter hourly billing',
        bestFor: ['Complex jobs', 'Detailed work', 'Repairs'],
        example: '$35-70/hour per painter'
      }
    ],
    services: [
      { name: 'Interior Room (Walls Only)', category: 'Interior', pricingUnit: 'room', lowPrice: 200, avgPrice: 400, highPrice: 600, laborHours: { low: 3, high: 6 }, suggestedMarkup: 100 },
      { name: 'Interior Room (Full - Walls+Trim+Ceiling)', category: 'Interior', pricingUnit: 'room', lowPrice: 350, avgPrice: 600, highPrice: 900, laborHours: { low: 5, high: 10 }, suggestedMarkup: 100 },
      { name: 'Interior (per sqft)', category: 'Interior', pricingUnit: 'sqft', lowPrice: 2.00, avgPrice: 3.50, highPrice: 5.00, suggestedMarkup: 100 },
      { name: 'Interior Full House (2000 sqft)', category: 'Interior', pricingUnit: 'flat', lowPrice: 3500, avgPrice: 5500, highPrice: 8000, suggestedMarkup: 80 },
      { name: 'Exterior (per sqft)', category: 'Exterior', pricingUnit: 'sqft', lowPrice: 1.50, avgPrice: 2.75, highPrice: 4.00, suggestedMarkup: 80 },
      { name: 'Exterior Full House', category: 'Exterior', pricingUnit: 'flat', lowPrice: 2500, avgPrice: 4500, highPrice: 8000, suggestedMarkup: 70 },
      { name: 'Cabinet Painting (per sqft)', category: 'Specialty', pricingUnit: 'sqft', lowPrice: 4, avgPrice: 8, highPrice: 12, suggestedMarkup: 120 },
      { name: 'Cabinet Painting (Kitchen)', category: 'Specialty', pricingUnit: 'flat', lowPrice: 1500, avgPrice: 3500, highPrice: 6000, suggestedMarkup: 100 },
      { name: 'Deck Staining (per sqft)', category: 'Exterior', pricingUnit: 'sqft', lowPrice: 2, avgPrice: 4, highPrice: 6, suggestedMarkup: 100 },
      { name: 'Trim/Baseboard (per linear ft)', category: 'Interior', pricingUnit: 'linear_ft', lowPrice: 1, avgPrice: 2.50, highPrice: 4, suggestedMarkup: 150 },
    ],
    retentionModels: [
      {
        name: 'Touch-Up Program',
        type: 'maintenance_agreement',
        frequency: 'annual',
        priceRange: { low: 200, high: 400 },
        retentionLift: 25,
        ltv_multiplier: 1.8,
        includes: ['Annual touch-up visit', '15% off new projects', 'Color matching kept on file'],
        churnRate: 12,
        recommendedDiscount: 10
      }
    ]
  },
  {
    slug: 'handyman',
    name: 'Handyman Services',
    icon: 'hammer',
    description: 'General repairs and small projects',
    avgTicket: { low: 150, avg: 350, high: 800 },
    conversionRate: 13.45,
    salesCycle: '1-5 days',
    grossMargin: { low: 35, high: 55 },
    netMargin: { avg: 12, top: 22 },
    laborPercent: { low: 40, high: 60 },
    emergencyMultiplier: { afterHours: 1.5, weekend: 1.5, holiday: 2.0 },
    pricingModels: [
      {
        type: 'hourly',
        name: 'Hourly Rate',
        prevalence: 60,
        conversionImpact: 5,
        description: 'Per-hour billing with minimum',
        bestFor: ['Small repairs', 'Multiple tasks', 'Uncertain scope'],
        example: '$60-100/hr, 2-hour minimum'
      },
      {
        type: 'flat_rate',
        name: 'Per-Task Pricing',
        prevalence: 35,
        conversionImpact: 20,
        description: 'Fixed price for common tasks',
        bestFor: ['TV mounting', 'Fixture installs', 'Common repairs'],
        example: '$150 TV mount, $200 ceiling fan install'
      },
      {
        type: 'subscription',
        name: 'Handyman Hour Packages',
        prevalence: 15,
        conversionImpact: 40,
        description: 'Prepaid hour bundles at discount',
        bestFor: ['Landlords', 'Property managers', 'Repeat customers'],
        example: '5 hours for $400 (save $100)'
      }
    ],
    services: [
      { name: 'Minimum Service Call', category: 'Service', pricingUnit: 'flat', lowPrice: 75, avgPrice: 150, highPrice: 200, laborHours: { low: 1, high: 2 }, suggestedMarkup: 0 },
      { name: 'Hourly Rate', category: 'Service', pricingUnit: 'hour', lowPrice: 50, avgPrice: 85, highPrice: 125, suggestedMarkup: 100 },
      { name: 'Half-Day Rate (4 hrs)', category: 'Service', pricingUnit: 'flat', lowPrice: 200, avgPrice: 275, highPrice: 350, suggestedMarkup: 80 },
      { name: 'Full-Day Rate (8 hrs)', category: 'Service', pricingUnit: 'flat', lowPrice: 320, avgPrice: 460, highPrice: 600, suggestedMarkup: 70 },
      { name: 'TV Mounting', category: 'Install', pricingUnit: 'flat', lowPrice: 100, avgPrice: 200, highPrice: 400, laborHours: { low: 1, high: 2 }, suggestedMarkup: 100 },
      { name: 'Ceiling Fan Install', category: 'Install', pricingUnit: 'flat', lowPrice: 100, avgPrice: 200, highPrice: 300, laborHours: { low: 1, high: 2 }, suggestedMarkup: 100 },
      { name: 'Faucet Replacement', category: 'Install', pricingUnit: 'flat', lowPrice: 60, avgPrice: 130, highPrice: 200, laborHours: { low: 0.5, high: 1.5 }, suggestedMarkup: 100 },
      { name: 'Furniture Assembly', category: 'Assembly', pricingUnit: 'flat', lowPrice: 100, avgPrice: 200, highPrice: 400, laborHours: { low: 1, high: 4 }, suggestedMarkup: 100 },
      { name: 'Drywall Repair (small)', category: 'Repair', pricingUnit: 'flat', lowPrice: 75, avgPrice: 150, highPrice: 250, laborHours: { low: 1, high: 2 }, suggestedMarkup: 150 },
      { name: 'Door Installation', category: 'Install', pricingUnit: 'flat', lowPrice: 150, avgPrice: 300, highPrice: 500, laborHours: { low: 2, high: 4 }, suggestedMarkup: 80 },
    ],
    retentionModels: [
      {
        name: 'Prepaid Hour Bundle',
        type: 'prepaid_package',
        frequency: 'annual',
        priceRange: { low: 400, high: 800 },
        retentionLift: 55,
        ltv_multiplier: 2.5,
        includes: ['5-10 prepaid hours', '15% savings', 'Priority scheduling', 'No trip fees'],
        churnRate: 6,
        recommendedDiscount: 15
      },
      {
        name: 'Property Maintenance Plan',
        type: 'subscription',
        frequency: 'monthly',
        priceRange: { low: 150, high: 300 },
        retentionLift: 70,
        ltv_multiplier: 3.5,
        includes: ['Monthly 2-hour visit', 'To-do list service', 'Priority emergency', '20% off additional hours'],
        churnRate: 4,
        recommendedDiscount: 20
      }
    ]
  },
  {
    slug: 'pressure_washing',
    name: 'Pressure Washing',
    icon: 'droplets',
    description: 'Exterior cleaning and pressure washing',
    avgTicket: { low: 150, avg: 350, high: 800 },
    conversionRate: 18,
    salesCycle: '1-7 days',
    grossMargin: { low: 50, high: 65 },
    netMargin: { avg: 20, top: 35 },
    laborPercent: { low: 25, high: 40 },
    emergencyMultiplier: { afterHours: 1.25, weekend: 1.25, holiday: 1.5 },
    pricingModels: [
      {
        type: 'per_unit',
        name: 'Per Square Foot',
        prevalence: 55,
        conversionImpact: 15,
        description: 'Price based on surface area',
        bestFor: ['Driveways', 'Decks', 'Large surfaces'],
        example: '$0.15-0.50/sqft depending on surface'
      },
      {
        type: 'flat_rate',
        name: 'Per-Surface Flat Rate',
        prevalence: 40,
        conversionImpact: 25,
        description: 'Fixed price for common surfaces',
        bestFor: ['Driveways', 'House washing', 'Simple quoting'],
        example: '$150-300 driveway, $250-500 house wash'
      }
    ],
    services: [
      { name: 'Driveway (Standard)', category: 'Concrete', pricingUnit: 'flat', lowPrice: 100, avgPrice: 175, highPrice: 250, laborHours: { low: 1, high: 2 }, suggestedMarkup: 200 },
      { name: 'Driveway (Large)', category: 'Concrete', pricingUnit: 'flat', lowPrice: 150, avgPrice: 275, highPrice: 400, laborHours: { low: 1.5, high: 3 }, suggestedMarkup: 180 },
      { name: 'Concrete (per sqft)', category: 'Concrete', pricingUnit: 'sqft', lowPrice: 0.15, avgPrice: 0.30, highPrice: 0.50, suggestedMarkup: 200 },
      { name: 'House Wash (1-story)', category: 'House', pricingUnit: 'flat', lowPrice: 200, avgPrice: 325, highPrice: 450, laborHours: { low: 1.5, high: 3 }, suggestedMarkup: 150 },
      { name: 'House Wash (2-story)', category: 'House', pricingUnit: 'flat', lowPrice: 300, avgPrice: 475, highPrice: 650, laborHours: { low: 2, high: 4 }, suggestedMarkup: 140 },
      { name: 'Deck/Patio', category: 'Wood', pricingUnit: 'sqft', lowPrice: 0.25, avgPrice: 0.40, highPrice: 0.60, suggestedMarkup: 180 },
      { name: 'Fence (per linear ft)', category: 'Wood', pricingUnit: 'linear_ft', lowPrice: 0.50, avgPrice: 1.25, highPrice: 2.00, suggestedMarkup: 180 },
      { name: 'Roof Cleaning (Soft Wash)', category: 'Roof', pricingUnit: 'sqft', lowPrice: 0.20, avgPrice: 0.40, highPrice: 0.65, suggestedMarkup: 150 },
      { name: 'Gutter Brightening', category: 'Gutters', pricingUnit: 'linear_ft', lowPrice: 1.00, avgPrice: 2.00, highPrice: 3.00, suggestedMarkup: 200 },
    ],
    retentionModels: [
      {
        name: 'Annual Exterior Package',
        type: 'prepaid_package',
        frequency: 'annual',
        priceRange: { low: 400, high: 800 },
        retentionLift: 50,
        ltv_multiplier: 2.5,
        includes: ['House wash', 'Driveway clean', '15% off additional services'],
        churnRate: 8,
        recommendedDiscount: 15
      }
    ]
  },
  {
    slug: 'pool_spa',
    name: 'Pool & Spa Services',
    icon: 'waves',
    description: 'Pool cleaning, maintenance, and repair',
    avgTicket: { low: 100, avg: 175, high: 500 },
    conversionRate: 20,
    salesCycle: '3-7 days',
    grossMargin: { low: 45, high: 60 },
    netMargin: { avg: 15, top: 25 },
    laborPercent: { low: 30, high: 45 },
    emergencyMultiplier: { afterHours: 1.5, weekend: 1.25, holiday: 1.5 },
    pricingModels: [
      {
        type: 'subscription',
        name: 'Weekly/Monthly Service',
        prevalence: 75,
        conversionImpact: 60,
        description: 'Recurring maintenance subscription',
        bestFor: ['Regular maintenance', 'Customer retention', 'Predictable revenue'],
        example: '$100-200/month for weekly service'
      },
      {
        type: 'flat_rate',
        name: 'Per-Visit Pricing',
        prevalence: 25,
        conversionImpact: 10,
        description: 'One-time service pricing',
        bestFor: ['Opening/closing', 'Repairs', 'Occasional customers'],
        example: '$75-150 per cleaning visit'
      }
    ],
    services: [
      { name: 'Weekly Cleaning Service', category: 'Maintenance', pricingUnit: 'week', lowPrice: 50, avgPrice: 100, highPrice: 150, laborHours: { low: 0.5, high: 1.5 }, suggestedMarkup: 150 },
      { name: 'Monthly Service Package', category: 'Maintenance', pricingUnit: 'month', lowPrice: 80, avgPrice: 140, highPrice: 200, suggestedMarkup: 150 },
      { name: 'Pool Opening (Seasonal)', category: 'Seasonal', pricingUnit: 'flat', lowPrice: 200, avgPrice: 350, highPrice: 500, laborHours: { low: 2, high: 4 }, suggestedMarkup: 100 },
      { name: 'Pool Closing (Seasonal)', category: 'Seasonal', pricingUnit: 'flat', lowPrice: 200, avgPrice: 325, highPrice: 450, laborHours: { low: 2, high: 4 }, suggestedMarkup: 100 },
      { name: 'Green Pool Recovery', category: 'Treatment', pricingUnit: 'flat', lowPrice: 200, avgPrice: 400, highPrice: 700, materialCost: { low: 50, high: 200 }, suggestedMarkup: 100 },
      { name: 'Filter Cleaning', category: 'Maintenance', pricingUnit: 'flat', lowPrice: 75, avgPrice: 125, highPrice: 200, laborHours: { low: 0.5, high: 1.5 }, suggestedMarkup: 150 },
      { name: 'Pump Repair', category: 'Repair', pricingUnit: 'flat', lowPrice: 150, avgPrice: 300, highPrice: 500, materialCost: { low: 50, high: 200 }, suggestedMarkup: 80 },
      { name: 'Heater Repair', category: 'Repair', pricingUnit: 'flat', lowPrice: 200, avgPrice: 400, highPrice: 700, materialCost: { low: 75, high: 300 }, suggestedMarkup: 70 },
      { name: 'Acid Wash', category: 'Treatment', pricingUnit: 'flat', lowPrice: 300, avgPrice: 550, highPrice: 800, laborHours: { low: 3, high: 6 }, suggestedMarkup: 100 },
    ],
    retentionModels: [
      {
        name: 'Weekly Pool Care',
        type: 'subscription',
        frequency: 'monthly',
        priceRange: { low: 150, high: 350 },
        retentionLift: 80,
        ltv_multiplier: 4.5,
        includes: ['Weekly cleaning', 'Chemical balancing', 'Equipment checks', 'Filter cleaning'],
        churnRate: 3,
        recommendedDiscount: 15
      },
      {
        name: 'Full-Service Annual',
        type: 'subscription',
        frequency: 'annual',
        priceRange: { low: 1800, high: 4000 },
        retentionLift: 90,
        ltv_multiplier: 6.0,
        includes: ['Weekly service', 'Opening/closing', 'Minor repairs', 'Chemical included'],
        churnRate: 2,
        recommendedDiscount: 20
      }
    ]
  }
]

// Helper functions
export function getIndustryBySlug(slug: string): IndustryPricing | undefined {
  return INDUSTRIES.find(i => i.slug === slug)
}

export function getRecommendedPricingModel(industry: IndustryPricing): PricingModel {
  // Return the model with highest conversion impact
  return industry.pricingModels.reduce((best, current) => 
    current.conversionImpact > best.conversionImpact ? current : best
  )
}

export function getRegionalMultiplier(city: string, country: 'us' | 'canada' = 'us'): number {
  const multipliers = country === 'canada' ? CANADIAN_MULTIPLIERS : REGIONAL_MULTIPLIERS
  
  for (const region of multipliers) {
    if (region.cities.some(c => city.toLowerCase().includes(c.toLowerCase()))) {
      return (region.multiplier.low + region.multiplier.high) / 2
    }
  }
  
  return 1.0 // Default to baseline
}

export function calculateSuggestedPrice(
  basePrice: number,
  region: string,
  country: 'us' | 'canada' = 'us',
  isEmergency: boolean = false,
  emergencyType?: 'afterHours' | 'weekend' | 'holiday'
): number {
  let price = basePrice * getRegionalMultiplier(region, country)
  
  if (isEmergency && emergencyType) {
    const emergencyMultipliers = { afterHours: 1.5, weekend: 1.75, holiday: 2.0 }
    price *= emergencyMultipliers[emergencyType]
  }
  
  return Math.round(price)
}

// Conversion optimization data
export const CONVERSION_INSIGHTS = {
  flatRatePreference: 92, // % of customers who prefer flat rate
  speedToQuote: {
    under1Min: 391, // % improvement
    under5Min: 2100, // 21x more likely
    firstResponder: 78 // % of buyers choose first
  },
  tieredPricing: {
    optimalTiers: 4,
    middleTierSelection: 65, // % choose middle
    revenueIncrease: 30
  },
  financing: {
    closeRateIncrease: 30,
    ticketIncrease: 20
  },
  transparency: {
    loyaltyIncrease: 94, // % loyal to transparent brands
    abandonmentFromHiddenFees: 39
  },
  pricingPsychology: {
    charmPricingLift: 24, // to 60%
    optimalEndDigits: [7, 9],
    roundNumberTrust: true // for premium services
  }
}
