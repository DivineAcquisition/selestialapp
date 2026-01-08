/**
 * Comprehensive Home Services Pricing Database for AI-Powered Pricing
 * 
 * This database provides the foundation for intelligent pricing suggestions across
 * 25+ home service industries in the US and Canada. Includes actual pricing data,
 * conversion insights, retention models, geographic adjustments, and industry benchmarks.
 * 
 * Data compiled January 2026. All pricing reflects 2024-2025 market conditions.
 */

// ============================================================================
// EXECUTIVE SUMMARY
// ============================================================================

export const MARKET_OVERVIEW = {
  totalMarketSize: 477_000_000_000, // $477 billion US
  flatRatePreference: 92, // 92% of homeowners prefer flat-rate pricing
  flatRateAdoption: 30, // Only 30% of contractors offer it
  speedToConvertMultiplier: 21, // 21x more likely if respond within 5 minutes
  financingCloseRateIncrease: 30, // 30% higher close rates with financing
  maintenanceAgreementRevenue: 39, // 39% of HVAC revenue from maintenance agreements
  subscriptionLTVMultiplier: 3, // 3x higher LTV than transactional
}

// ============================================================================
// PRICING MODEL PREVALENCE BY INDUSTRY
// ============================================================================

export const PRICING_MODEL_PREVALENCE: Record<string, {
  flatRate: number
  hourly: number
  perUnit: number
  subscription: number | string
}> = {
  cleaning_residential: { flatRate: 50, hourly: 30, perUnit: 20, subscription: 'Growing' },
  hvac: { flatRate: 60, hourly: 25, perUnit: 15, subscription: 39 },
  plumbing: { flatRate: 55, hourly: 30, perUnit: 15, subscription: 'Growing' },
  electrical: { flatRate: 50, hourly: 35, perUnit: 15, subscription: 'Limited' },
  landscaping: { flatRate: 40, hourly: 30, perUnit: 30, subscription: 'Very common' },
  pest_control: { flatRate: 20, hourly: 10, perUnit: 70, subscription: 'Dominant' },
  painting: { flatRate: 35, hourly: 25, perUnit: 40, subscription: 'Rare' },
  flooring: { flatRate: 15, hourly: 15, perUnit: 70, subscription: 0 },
  roofing: { flatRate: 10, hourly: 10, perUnit: 80, subscription: 0 },
}

// ============================================================================
// EMERGENCY AND AFTER-HOURS MULTIPLIERS
// ============================================================================

export const TIMING_MULTIPLIERS = {
  standard: { multiplier: 1.0, label: 'Standard business hours' },
  afterHours: { multiplier: { low: 1.25, high: 1.5 }, label: 'After-hours (evenings)', surcharge: { low: 40, high: 80 } },
  weekends: { multiplier: { low: 1.5, high: 2.0 }, label: 'Weekends (Saturday/Sunday)' },
  holidays: { multiplier: { low: 2.0, high: 3.0 }, label: 'Major holidays' },
  emergencySameDay: { multiplier: { low: 1.2, high: 1.5 }, label: 'Emergency same-day' },
}

// ============================================================================
// CLEANING SERVICES PRICING
// ============================================================================

export const CLEANING_PRICING = {
  residential: {
    byBedroom: [
      { bedrooms: 1, standard: { low: 75, high: 110 }, deep: { low: 120, high: 200 }, moveOut: { low: 120, high: 250 } },
      { bedrooms: 2, standard: { low: 100, high: 150 }, deep: { low: 150, high: 300 }, moveOut: { low: 200, high: 350 } },
      { bedrooms: 3, standard: { low: 150, high: 200 }, deep: { low: 200, high: 400 }, moveOut: { low: 250, high: 420 } },
      { bedrooms: 4, standard: { low: 175, high: 250 }, deep: { low: 300, high: 450 }, moveOut: { low: 350, high: 500 } },
      { bedrooms: 5, standard: { low: 200, high: 400 }, deep: { low: 400, high: 600 }, moveOut: { low: 450, high: 750 } },
    ],
    perSqft: {
      standard: { low: 0.10, high: 0.20 },
      deep: { low: 0.25, high: 0.30 },
      commercial: { low: 0.07, high: 0.25 },
    },
  },
  specialty: {
    carpet: { perRoom: { low: 40, high: 90 }, perSqft: { low: 0.18, high: 0.36 } },
    window: { perWindow: { low: 4, high: 15 }, note: 'both sides' },
    pressureWashing: { perSqft: { low: 0.20, high: 0.50 } },
  },
  recurringDiscounts: {
    weekly: { discount: { low: 15, high: 20 }, label: '15-20% off one-time rate' },
    biweekly: { discount: { low: 5, high: 10 }, label: '5-10% off one-time rate' },
    monthly: { discount: 0, label: 'Base recurring rate' },
  },
}

// ============================================================================
// HVAC SERVICES PRICING
// ============================================================================

export const HVAC_PRICING = {
  serviceCalls: {
    standard: { low: 75, high: 200, average: { low: 100, high: 150 } },
    diagnostic: { low: 75, high: 200, average: 150 },
    acTuneUp: { low: 65, high: 200, average: { low: 85, high: 150 } },
    furnaceTuneUp: { low: 80, high: 200, average: { low: 130, high: 175 } },
  },
  repairs: {
    capacitor: { low: 120, high: 400 },
    fanMotor: { low: 100, high: 700 },
    blowerMotor: { low: 250, high: 1100 },
    refrigerantRecharge: { low: 150, high: 400 },
    compressor: { low: 800, high: 2800 },
    thermostat: { low: 150, high: 500 },
  },
  installation: {
    byTonnage: [
      { tons: 2.0, sqftCoverage: { low: 900, high: 1200 }, cost: { low: 2500, high: 5500 } },
      { tons: 3.0, sqftCoverage: { low: 1500, high: 1800 }, cost: { low: 4000, high: 7800 } },
      { tons: 4.0, sqftCoverage: { low: 2100, high: 2400 }, cost: { low: 5500, high: 9500 } },
      { tons: 5.0, sqftCoverage: { low: 2400, high: 3000 }, cost: { low: 4000, high: 10000 } },
    ],
  },
  maintenanceAgreements: {
    basic: { annual: { low: 120, high: 200 }, includes: ['1 tune-up', '10% repair discount'] },
    standard: { annual: { low: 150, high: 300 }, includes: ['2 tune-ups', '15% discount', 'priority scheduling'] },
    premium: { annual: { low: 300, high: 500 }, includes: ['2+ tune-ups', '20% discount', 'no overtime fees'] },
  },
}

// ============================================================================
// PLUMBING SERVICES PRICING
// ============================================================================

export const PLUMBING_PRICING = {
  hourlyRates: {
    journeyman: { us: { low: 45, high: 150 }, canada: { low: 58, high: 170 } },
    master: { us: { low: 85, high: 200 }, canada: { low: 104, high: 250 } },
    emergency: { multiplier: { low: 1.5, high: 3.0 } },
  },
  commonServices: {
    serviceCall: { low: 50, high: 200 },
    drainCleaning: { low: 100, high: 275 },
    hydroJetting: { low: 300, high: 600 },
    faucetInstall: { low: 200, high: 600 },
    toiletInstall: { low: 224, high: 531 },
    waterHeaterTank: { low: 700, high: 3100, note: '50-gal installed' },
    waterHeaterTankless: { low: 1400, high: 5600, note: 'installed' },
    garbageDisposal: { low: 200, high: 550 },
  },
  septic: {
    pumping: { low: 300, high: 700, note: '1,000 gal' },
    inspection: { low: 100, high: 450 },
    installation: { low: 5000, high: 15000 },
  },
  poolSpa: {
    weeklyService: { low: 50, high: 150, unit: 'week' },
    monthlyPackage: { low: 80, high: 200, unit: 'month' },
    seasonalOpenClose: { low: 300, high: 500, unit: 'each' },
  },
}

// ============================================================================
// ELECTRICAL SERVICES PRICING
// ============================================================================

export const ELECTRICAL_PRICING = {
  hourlyRates: {
    journeyman: { low: 50, high: 130 },
    master: { low: 100, high: 200 },
    emergency: { low: 150, high: 300 },
  },
  commonServices: {
    serviceCall: { low: 75, high: 200 },
    outletInstall: { low: 80, high: 230 },
    gfciOutlet: { low: 90, high: 250 },
    outlet240v: { low: 250, high: 800 },
    ceilingFan: { low: 134, high: 600 },
    lightFixture: { low: 100, high: 500 },
    panelUpgrade: { low: 1300, high: 4500, note: '100A to 200A' },
    evCharger: { low: 800, high: 3500 },
    wholeHouseRewire: { low: 4000, high: 30000 },
  },
  homeSecurity: {
    adt: { equipment: { low: 599, high: 1500 }, monthly: { low: 29.99, high: 49.99 }, contract: 36 },
    vivint: { equipment: { low: 599, high: 2379 }, monthly: { low: 29.99, high: 49.99 }, contract: { low: 3.5, high: 5, unit: 'years' } },
    simplisafe: { equipment: { low: 200, high: 709 }, monthly: { low: 0, high: 27.99 }, contract: 0 },
    ring: { equipment: { low: 199, high: 500 }, monthly: { low: 10, high: 20 }, contract: 0 },
  },
  solar: {
    pricePerWatt: { low: 2.50, high: 3.50, note: 'before incentives' },
    afterTaxCredit: { low: 1.75, high: 2.45, note: 'after 30% ITC' },
    system8kw: { gross: { low: 20000, high: 28000 }, afterCredit: { low: 14000, high: 19600 } },
  },
}

// ============================================================================
// ROOFING PRICING
// ============================================================================

export const ROOFING_PRICING = {
  // Price per square (100 sqft)
  byMaterial: {
    threeTabAsphalt: { low: 350, high: 465 },
    architecturalShingles: { low: 500, high: 700 },
    metalStandingSeam: { low: 1200, high: 2450 },
    tileClay: { low: 909, high: 1229 },
    naturalSlate: { low: 1000, high: 3000 },
  },
}

// ============================================================================
// WINDOWS PRICING
// ============================================================================

export const WINDOWS_PRICING = {
  byType: {
    doubleHung: { low: 500, high: 800, note: 'installed' },
    casement: { low: 500, high: 900 },
    bayWindow: { low: 700, high: 2500 },
    wholeHouse: { low: 6000, high: 25000, note: '15-25 windows' },
  },
}

// ============================================================================
// GUTTERS PRICING
// ============================================================================

export const GUTTERS_PRICING = {
  cleaning: { low: 0.40, high: 1.85, unit: 'linear ft', note: 'varies by story' },
  installation: { low: 14, high: 20, unit: 'linear ft', note: 'aluminum seamless' },
  guards: { low: 4, high: 12, unit: 'linear ft' },
}

// ============================================================================
// FENCING PRICING (per linear foot installed)
// ============================================================================

export const FENCING_PRICING = {
  chainLink6ft: { low: 10, high: 25 },
  woodPrivacy6ft: { low: 20, high: 50 },
  vinylPrivacy: { low: 30, high: 60 },
  aluminum: { low: 25, high: 75 },
  wroughtIron: { low: 50, high: 100 },
}

// ============================================================================
// CONCRETE/MASONRY PRICING
// ============================================================================

export const CONCRETE_PRICING = {
  drivewayPlain: { low: 5, high: 7, unit: 'sqft' },
  stampedConcrete: { low: 8, high: 18, unit: 'sqft' },
  foundationRepair: { low: 2200, high: 8100, note: 'average' },
}

// ============================================================================
// LANDSCAPING PRICING
// ============================================================================

export const LANDSCAPING_PRICING = {
  lawnMowing: {
    byLotSize: [
      { size: 'small', acres: 0.125, label: '⅛ acre', cost: { low: 30, high: 85 } },
      { size: 'medium', acres: 0.25, label: '¼ acre', cost: { low: 40, high: 110 } },
      { size: 'large', acres: 0.5, label: '½ acre', cost: { low: 75, high: 180 } },
      { size: 'xlarge', acres: 1, label: '1 acre', cost: { low: 60, high: 200 } },
    ],
  },
  services: {
    mulchInstalled: { low: 50, high: 150, unit: 'cubic yard' },
    sodInstallation: { low: 1, high: 2, unit: 'sqft' },
    irrigationSystem: { low: 2500, high: 6500 },
    landscapeLighting: { low: 100, high: 250, unit: 'per fixture' },
  },
  treeServices: {
    byHeight: [
      { height: 'small', range: '<30ft', trimming: { low: 75, high: 525 }, removal: { low: 150, high: 500 } },
      { height: 'medium', range: '30-60ft', trimming: { low: 200, high: 900 }, removal: { low: 500, high: 1200 } },
      { height: 'large', range: '60-80ft', trimming: { low: 400, high: 1400 }, removal: { low: 1000, high: 2000 } },
      { height: 'xlarge', range: '80+ft', trimming: { low: 800, high: 1800 }, removal: { low: 1500, high: 3000 } },
    ],
    stumpGrinding: { low: 2, high: 6, unit: 'per inch diameter', minimum: { low: 100, high: 150 } },
  },
}

// ============================================================================
// PAINTING PRICING
// ============================================================================

export const PAINTING_PRICING = {
  interior: {
    wallsOnly: { low: 2.00, high: 5.00, unit: 'sqft' },
    complete: { low: 4.70, high: 6.00, unit: 'sqft', note: 'walls+trim+ceiling' },
  },
  exterior: {
    siding: { low: 1.50, high: 4.00, unit: 'sqft' },
  },
  specialty: {
    cabinets: { low: 4, high: 12, unit: 'sqft' },
  },
}

// ============================================================================
// FLOORING PRICING (installed per sqft)
// ============================================================================

export const FLOORING_PRICING = {
  hardwoodSolid: { low: 9, high: 25 },
  engineeredHardwood: { low: 7, high: 20 },
  laminate: { low: 4, high: 14 },
  lvpVinyl: { low: 4, high: 10 },
  tileCeramic: { low: 12, high: 40 },
  carpet: { low: 2, high: 12 },
}

// ============================================================================
// HANDYMAN SERVICES PRICING
// ============================================================================

export const HANDYMAN_PRICING = {
  rates: {
    hourly: { low: 50, high: 125 },
    minimum: { low: 75, high: 200 },
    halfDay: { low: 200, high: 350 },
    fullDay: { low: 320, high: 600 },
  },
  commonJobs: {
    tvMounting: { low: 100, high: 400 },
    ceilingFan: { low: 100, high: 300 },
    faucetReplacement: { low: 60, high: 200 },
    furnitureAssembly: { low: 100, high: 400 },
  },
}

// ============================================================================
// PEST CONTROL PRICING
// ============================================================================

export const PEST_CONTROL_PRICING = {
  byFrequency: {
    oneTime: { low: 100, high: 600 },
    monthly: { low: 40, high: 75, unit: 'month' },
    quarterly: { low: 100, high: 300, unit: 'quarter', note: 'most popular' },
    annual: { low: 300, high: 900, unit: 'year' },
  },
  byPest: {
    antsRoaches: { low: 100, high: 400 },
    rodents: { low: 150, high: 600 },
    bedBugs: { low: 1000, high: 5000 },
    termites: { low: 225, high: 8000 },
  },
}

// ============================================================================
// MOVING & JUNK REMOVAL PRICING
// ============================================================================

export const MOVING_PRICING = {
  twoManCrew: { low: 80, high: 160, unit: 'hour' },
  localMove: { low: 880, high: 2562, note: 'average' },
  longDistance: { low: 2700, high: 10000 },
  junkRemoval: { low: 400, high: 600, note: '½ truck' },
  pianoMoving: { low: 250, high: 1000 },
}

// ============================================================================
// APPLIANCE REPAIR PRICING
// ============================================================================

export const APPLIANCE_REPAIR_PRICING = {
  refrigerator: { low: 200, high: 600 },
  washer: { low: 150, high: 350 },
  dryer: { low: 100, high: 400 },
  dishwasher: { low: 150, high: 350 },
  ovenRange: { low: 150, high: 500 },
}

// ============================================================================
// LOCKSMITH PRICING
// ============================================================================

export const LOCKSMITH_PRICING = {
  homeLockoutDay: { low: 50, high: 180 },
  homeLockoutNight: { low: 85, high: 250 },
  autoLockout: { low: 55, high: 200 },
  rekeyPerLock: { low: 20, high: 45 },
  lockInstallation: { low: 75, high: 300 },
}

// ============================================================================
// GARAGE DOOR PRICING
// ============================================================================

export const GARAGE_DOOR_PRICING = {
  springReplacement: { low: 150, high: 350 },
  openerRepair: { low: 100, high: 500 },
  newOpener: { low: 300, high: 900 },
  fullDoorReplacement: { low: 700, high: 3500 },
}

// ============================================================================
// CONVERSION RATE DATA
// ============================================================================

export const CONVERSION_RATES = {
  byIndustry: {
    cleaningMaid: { rate: 17.65, cycle: 'Days' },
    windowCleaning: { rate: 13.58, cycle: 'Days' },
    handyman: { rate: 13.45, cycle: 'Days' },
    plumbing: { rate: { low: 12, high: 16 }, cycle: 'Days-weeks' },
    hvac: { rate: { low: 3, high: 7 }, cycle: '60+ days' },
    roofing: { rate: { low: 3, high: 7 }, cycle: '60+ days' },
    construction: { rate: 2.61, cycle: 'Months' },
  },
  industryBenchmark: {
    averageCvr: 7.8,
    salesCycle: 60, // days
    grossMargin: 33, // percent
  },
}

// ============================================================================
// PRICING PSYCHOLOGY & CONVERSION IMPACT
// ============================================================================

export const PRICING_PSYCHOLOGY = {
  flatRatePreference: 92, // % of homeowners preferring flat-rate
  transparentPricingImpact: 50, // % increase in conversion
  financingImpact: {
    closeRateIncrease: 30,
    ticketIncrease: 20,
  },
  multipleOptionsImpact: {
    closeRateIncrease: 10,
    premiumSalesIncrease: { from: 26, to: 42 },
  },
  monthlyPaymentLeadImpact: 11, // % higher close rate
  
  speedToQuote: {
    under1Minute: 391, // % higher conversion
    under5Minutes: 21, // x more likely to convert
    firstResponder: 78, // % of buyers choose first company
    under10Minutes: { low: 3, high: 5 }, // x more leads converted
  },
  
  charmPricing: {
    salesIncrease: { low: 24, high: 60 }, // % when leftmost digit changes
    optimalTiers: 4,
    middleTierSelection: 65, // % choose middle
    revenueIncrease: 30, // % with tiered pricing
    churnReduction: 22, // % with tiered pricing
  },
  
  transparency: {
    loyaltyIncrease: 94, // % loyal to transparent brands
    decisionInfluence: 83, // % say transparency influences decisions
    abandonmentFromUnclear: 61, // % abandon due to unclear pricing
    switchFromHiddenFees: 39, // % switch due to hidden fees
  },
}

// ============================================================================
// RETENTION & RECURRING PRICING MODELS
// ============================================================================

export const MAINTENANCE_AGREEMENT_PRICING = {
  hvac: { basic: { low: 120, high: 200 }, standard: { low: 150, high: 300 }, premium: { low: 300, high: 500 } },
  plumbing: { basic: { low: 90, high: 150 }, standard: { low: 150, high: 250 }, premium: { low: 250, high: 400 } },
  pestControl: { basic: { low: 300, high: 400 }, standard: { low: 400, high: 600 }, premium: { low: 500, high: 900 } },
  lawnCare: { basic: { low: 500, high: 700 }, standard: { low: 900, high: 1200 }, premium: { low: 1200, high: 1800 } },
  poolService: { basic: { low: 960, high: 1200 }, standard: { low: 1500, high: 2000 }, premium: { low: 2000, high: 3000 } },
}

export const ANNUAL_PREPAY_DISCOUNT = {
  optimal: { low: 15, high: 20 }, // % discount
  formula: 'Monthly Churn Rate × 6', // Max sustainable discount
  example: { monthlyChurn: 3, maxDiscount: 15 }, // 3% churn = 15% max
}

export const RETENTION_METRICS = {
  subscription: {
    retentionIncrease: 37, // % higher than transactional
    ltvMultiplier: 3, // 3x higher than transactional
    probabilityOfSale: { low: 60, high: 70 }, // %
    costToServe: { multiplier: { low: 5, high: 7 }, comparison: 'x lower' },
  },
  churnRates: {
    homeServicesMonthly: { low: 4, high: 7 }, // %
    homeServicesAnnual: { low: 40, high: 55 }, // %
    pestControlMonthly: { low: 3, high: 5 },
    pestControlAnnual: { low: 30, high: 45 },
    hvacMaintenanceMonthly: { low: 5, high: 8 },
    hvacMaintenanceAnnual: { low: 45, high: 60 },
  },
}

export const CUSTOMER_LIFETIME_VALUE = {
  hvac: { annual: 1000, lifespan: 12, clv: { low: 12000, high: 15000 } },
  poolService: { annual: { low: 1500, high: 2500 }, lifespan: { low: 5, high: 10 }, clv: { low: 7500, high: 25000 } },
  plumbing: { annual: { low: 500, high: 800 }, lifespan: 10, clv: { low: 5000, high: 8000 } },
  lawnCare: { annual: { low: 500, high: 900 }, lifespan: { low: 4, high: 7 }, clv: { low: 2500, high: 6000 } },
  pestControl: { annual: { low: 400, high: 600 }, lifespan: { low: 3, high: 5 }, clv: { low: 1500, high: 3000 } },
}

// ============================================================================
// INDUSTRY BENCHMARKS
// ============================================================================

export const PROFIT_MARGINS = {
  hvac: { gross: { low: 30, high: 40 }, netAvg: { low: 8, high: 10 }, netTop: { low: 17, high: 20 } },
  plumbing: { gross: { low: 45, high: 65 }, netAvg: { low: 10, high: 15 }, netTop: { low: 15, high: 20 } },
  electrical: { gross: { low: 40, high: 60 }, netAvg: { low: 10, high: 12 }, netTop: { low: 18, high: 20 } },
  cleaning: { gross: { low: 40, high: 55 }, netAvg: { low: 10, high: 15 }, netTop: { low: 15, high: 25 } },
  landscaping: { gross: { low: 35, high: 45 }, netAvg: { low: 5, high: 8 }, netTop: { low: 15, high: 20 } },
  pestControl: { gross: { avg: 58 }, netAvg: { low: 10, high: 15 }, netTop: { low: 15, high: 20 } },
  roofing: { gross: { low: 20, high: 40 }, netAvg: { low: 6, high: 12 }, netTop: { low: 12, high: 15 } },
}

export const LABOR_COST_PERCENTAGE = {
  hvacPlumbing: { low: 18, high: 22, note: 'direct' },
  electrical: { low: 40, high: 60 },
  landscapingMaintenance: { low: 25, high: 35 },
  landscapingInstallation: 40,
  cleaning: { low: 30, high: 50 },
}

export const PARTS_MARKUP = {
  smallParts: { markup: { low: 100, high: 200 }, margin: { low: 50, high: 67 }, note: '<$50' },
  mediumParts: { markup: { low: 70, high: 150 }, margin: { low: 41, high: 60 }, note: '$50-$200' },
  largeParts: { markup: { low: 50, high: 100 }, margin: { low: 33, high: 50 }, note: '$200-$500' },
  equipment: { markup: { low: 25, high: 65 }, margin: { low: 20, high: 40 }, note: '>$500' },
  plumbingParts: { markup: { low: 200, high: 500 }, margin: { low: 60, high: 62 }, note: '3x-6x cost' },
}

export const OVERHEAD_ALLOCATION = {
  vehicleCosts: { low: 3, high: 7 },
  insurance: { low: 3, high: 5 },
  marketing: { low: 8, high: 10, note: 'recommended' },
  administrative: { low: 5, high: 10 },
  softwareTechnology: { low: 1, high: 3 },
  totalOverhead: { low: 20, high: 35 },
}

export const AVERAGE_TICKET_VALUES = {
  hvacServiceCall: { low: 150, avg: 350, high: 650 },
  hvacInstallation: { low: 3500, avg: 5750, high: 10000 },
  plumbingRepair: { low: 175, avg: 350, high: 600 },
  electricalService: { low: 150, avg: 275, high: 500 },
  cleaningRecurring: { low: 120, avg: 175, high: 300 },
}

// ============================================================================
// GEOGRAPHIC PRICING ADJUSTMENTS
// ============================================================================

export const US_REGIONAL_MULTIPLIERS = {
  tier1Premium: { 
    multiplier: { low: 1.25, high: 1.50 }, 
    markets: ['San Francisco', 'NYC', 'Boston', 'LA', 'DC', 'Seattle'] 
  },
  tier2AboveAverage: { 
    multiplier: { low: 1.10, high: 1.25 }, 
    markets: ['Chicago', 'Denver', 'Portland', 'Miami'] 
  },
  tier3Baseline: { 
    multiplier: 1.00, 
    markets: ['Atlanta', 'Dallas', 'Houston', 'Phoenix'] 
  },
  tier4BelowAverage: { 
    multiplier: { low: 0.85, high: 0.95 }, 
    markets: ['Indianapolis', 'Columbus', 'Kansas City'] 
  },
  tier5LowCost: { 
    multiplier: { low: 0.70, high: 0.85 }, 
    markets: ['Rural areas', 'MS', 'AR', 'WV'] 
  },
}

export const METRO_SPECIFIC_MULTIPLIERS = {
  'san-francisco': { low: 1.45, high: 1.55 },
  'new-york': { low: 1.35, high: 1.45 },
  'boston': { low: 1.25, high: 1.35 },
  'los-angeles': { low: 1.30, high: 1.40 },
  'seattle': { low: 1.25, high: 1.35 },
  'washington-dc': { low: 1.20, high: 1.30 },
  'miami': { low: 1.10, high: 1.15 },
  'denver': { low: 1.10, high: 1.20 },
  'chicago': { low: 1.00, high: 1.10 },
  'atlanta': { low: 0.95, high: 1.05 },
  'dallas': { low: 0.95, high: 1.00 },
  'houston': { low: 0.90, high: 1.00 },
}

export const CANADIAN_MULTIPLIERS = {
  ontario: { multiplier: { low: 1.10, high: 1.25 }, cities: ['Toronto'] },
  britishColumbia: { multiplier: { low: 1.10, high: 1.20 }, cities: ['Vancouver'] },
  alberta: { multiplier: { low: 1.00, high: 1.10 }, cities: ['Calgary', 'Edmonton'] },
  quebec: { multiplier: { low: 0.95, high: 1.00 }, cities: [] },
  manitobaSaskatchewan: { multiplier: { low: 0.90, high: 0.95 }, cities: [] },
  atlantic: { multiplier: { low: 0.85, high: 0.90 }, cities: [] },
}

export const URBAN_RURAL_ADJUSTMENTS = {
  majorUrbanCore: { adjustment: { low: 15, high: 25 }, direction: 'up' },
  urban: { adjustment: { low: 5, high: 15 }, direction: 'up' },
  suburban: { adjustment: 0, note: 'baseline' },
  smallTown: { adjustment: { low: -5, high: 5 }, direction: 'variable' },
  rural: { adjustment: { low: 5, high: 15 }, direction: 'up', note: 'travel offset' },
}

// ============================================================================
// PRICING FORMULAS FOR AI
// ============================================================================

export const PRICING_FORMULAS = {
  corePricing: {
    formula: 'Suggested Price = Base Price × Regional Multiplier × Urban/Rural Factor × Complexity Factor',
  },
  flatRateJob: {
    formula: 'Price = (Labor Hours × Burdened Rate) + (Materials × Markup) + Overhead Allocation + Profit',
  },
  hourlyBillableRate: {
    formula: 'Billable Rate = (Annual Overhead / Billable Hours) + Burdened Labor Rate + Profit Target',
    example: {
      annualOverhead: 150000,
      billableHours: 3500,
      overheadPerHour: 42.86,
      burdenedLabor: 35,
      profitTarget: 19.50,
      finalRate: 97,
    },
  },
  markupToMargin: [
    { markup: 50, margin: 33.3 },
    { markup: 100, margin: 50.0 },
    { markup: 150, margin: 60.0 },
    { markup: 200, margin: 66.7 },
    { markup: 300, margin: 75.0 },
  ],
  minimumProfitablePrice: {
    formula: 'Minimum Price = Direct Costs / (1 - Target Margin %)',
  },
}

// ============================================================================
// AI PRICING ENGINE RECOMMENDATIONS
// ============================================================================

export const AI_PRICING_RULES = {
  primary: [
    'Default to flat-rate pricing for standardized services (92% customer preference)',
    'Apply geographic multipliers based on ZIP/postal code',
    'Build in 3-tier options (Good-Better-Best) to maximize revenue',
    'Include emergency premiums (1.5x-2.0x for after-hours)',
    'Suggest maintenance agreements with 15-20% annual prepay discount',
  ],
  conversionOptimization: [
    'Enable instant pricing where possible (speed = 21x higher conversion)',
    'Show monthly payment options before total (11% higher close rate)',
    'Display price ranges for complex jobs, exact prices for standard services',
    'Recommend financing for jobs over $1,000 (30% higher close rates)',
  ],
  industryDefaults: {
    cleaning: { primaryModel: 'Flat rate + recurring discount', tierSpread: { low: 15, high: 20 } },
    hvac: { primaryModel: 'Flat rate + maintenance agreement', tierSpread: { low: 25, high: 30 } },
    plumbing: { primaryModel: 'Flat rate + club membership', tierSpread: { low: 20, high: 25 } },
    landscaping: { primaryModel: 'Per sqft + subscription', tierSpread: { low: 15, high: 20 } },
    pestControl: { primaryModel: 'Quarterly subscription', tierSpread: { low: 10, high: 15 } },
  },
  targetMargins: {
    emergencyRepair: { gross: { low: 50, high: 65 }, net: { low: 20, high: 25 } },
    maintenance: { gross: { low: 40, high: 55 }, net: { low: 15, high: 20 } },
    installation: { gross: { low: 35, high: 45 }, net: { low: 15, high: 20 } },
    recurringService: { gross: { low: 45, high: 60 }, net: { low: 18, high: 25 } },
  },
}

// ============================================================================
// HELPER FUNCTIONS FOR AI
// ============================================================================

/**
 * Get suggested price range based on service type and region
 */
export function getSuggestedPriceRange(
  _industrySlug: string,
  _serviceType: string,
  _region: string,
  _urbanType: string = 'suburban'
): { low: number; high: number; recommended: number } | null {
  // This would be implemented to look up pricing from the database
  // and apply appropriate multipliers
  return null
}

/**
 * Calculate optimal pricing tier spread
 */
export function calculateTierPricing(
  basePrice: number,
  industrySlug: string
): { good: number; better: number; best: number } {
  const defaults = AI_PRICING_RULES.industryDefaults[industrySlug as keyof typeof AI_PRICING_RULES.industryDefaults]
  const spread = defaults?.tierSpread || { low: 15, high: 20 }
  const avgSpread = (spread.low + spread.high) / 2 / 100
  
  return {
    good: Math.round(basePrice * (1 - avgSpread)),
    better: Math.round(basePrice),
    best: Math.round(basePrice * (1 + avgSpread)),
  }
}

/**
 * Get regional price multiplier
 */
export function getRegionalMultiplier(_zipCode: string): number {
  // Default to baseline
  return 1.0
}

/**
 * Calculate maintenance agreement pricing
 */
export function getMaintenanceAgreementPricing(
  industrySlug: string,
  tier: 'basic' | 'standard' | 'premium'
): { low: number; high: number } | null {
  const pricing = MAINTENANCE_AGREEMENT_PRICING[industrySlug as keyof typeof MAINTENANCE_AGREEMENT_PRICING]
  if (!pricing) return null
  return pricing[tier]
}
