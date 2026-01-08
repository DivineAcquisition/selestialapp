import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { 
  getIndustryBySlug,
  REGIONAL_MULTIPLIERS,
} from '@/lib/pricing/pricing-data'
import {
  MARKET_OVERVIEW,
  PRICING_PSYCHOLOGY,
  CONVERSION_RATES,
  PROFIT_MARGINS,
  TIMING_MULTIPLIERS,
  PARTS_MARKUP,
  OVERHEAD_ALLOCATION,
  RETENTION_METRICS,
  CUSTOMER_LIFETIME_VALUE,
  MAINTENANCE_AGREEMENT_PRICING,
  ANNUAL_PREPAY_DISCOUNT,
  AI_PRICING_RULES,
  PRICING_FORMULAS,
  CLEANING_PRICING,
  HVAC_PRICING,
  PLUMBING_PRICING,
  ELECTRICAL_PRICING,
  LANDSCAPING_PRICING,
  PEST_CONTROL_PRICING,
  HANDYMAN_PRICING,
} from '@/lib/pricing/pricing-database'

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

interface WizardConfig {
  industry: string
  zipCode: string
  yearsInBusiness: 'new' | 'growing' | 'established' | 'expert'
  teamSize: 'solo' | 'small' | 'medium' | 'large'
  avgJobDuration: number
  jobsPerDay: number
  hourlyLaborCost: number
  avgMaterialCost: number
  monthlyOverhead: number
  targetMargin: number
  monthlyRevenueGoal: number
  pricingStrategy: 'value' | 'competitive' | 'premium' | 'penetration'
}

interface ServiceConfig {
  serviceIndex: number
  serviceName: string
  enabled: boolean
  suggestedPrice: number
  reasoning: string
  priority: 'high' | 'medium' | 'low'
}

interface RetentionConfig {
  planName: string
  recommended: boolean
  suggestedPrice: { low: number; high: number }
  reasoning: string
  priority: number
}

interface PriceRuleConfig {
  name: string
  type: 'multiplier' | 'percentage' | 'flat'
  value: number
  condition: string
  enabled: boolean
  reasoning: string
}

export async function POST(req: NextRequest) {
  try {
    const { wizardConfig, region }: { wizardConfig: WizardConfig; region: string } = await req.json()

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!wizardConfig.industry) {
      return NextResponse.json({ error: 'Industry is required' }, { status: 400 })
    }

    // Get industry data
    const industryData = getIndustryBySlug(wizardConfig.industry)
    if (!industryData) {
      return NextResponse.json({ error: 'Invalid industry' }, { status: 400 })
    }

    // Get regional multiplier
    const regionData = REGIONAL_MULTIPLIERS.find(r => r.region === region)
    const regionalMultiplier = regionData 
      ? (regionData.multiplier.low + regionData.multiplier.high) / 2 
      : 1.0

    // Get industry-specific benchmark data from comprehensive database
    const industryBenchmarks = getIndustryBenchmarkData(wizardConfig.industry)
    const conversionData = getConversionDataForIndustry(wizardConfig.industry)
    const pricingPsychologyData = getPricingPsychologyInsights()

    // Build context for AI with comprehensive pricing database
    const businessContext = `
## Business Profile
- Industry: ${industryData.name}
- Experience: ${wizardConfig.yearsInBusiness} (${getExperienceDescription(wizardConfig.yearsInBusiness)})
- Team Size: ${wizardConfig.teamSize} (${getTeamDescription(wizardConfig.teamSize)})
- Location: ${region} (${regionalMultiplier}x price multiplier)
- Avg Job Duration: ${wizardConfig.avgJobDuration} hours
- Jobs Per Day: ${wizardConfig.jobsPerDay}

## Cost Structure
- Hourly Labor Cost: $${wizardConfig.hourlyLaborCost}/hr
- Avg Material Cost: $${wizardConfig.avgMaterialCost}/job
- Monthly Overhead: $${wizardConfig.monthlyOverhead}
- Target Profit Margin: ${wizardConfig.targetMargin}%

## Business Goals
- Monthly Revenue Goal: $${wizardConfig.monthlyRevenueGoal}
- Pricing Strategy: ${wizardConfig.pricingStrategy}

## Industry Benchmarks from Comprehensive Database
- Average Ticket: $${industryData.avgTicket.low} - $${industryData.avgTicket.high} (avg: $${industryData.avgTicket.avg})
- Industry Conversion Rate: ${industryData.conversionRate}%
- Gross Margin Range: ${industryData.grossMargin.low}% - ${industryData.grossMargin.high}%
- Top Performer Net Margin: ${industryData.netMargin.top}%

${industryBenchmarks}

## Market Overview (Critical Insights)
- Total US Home Services Market: $${(MARKET_OVERVIEW.totalMarketSize / 1e9).toFixed(0)} billion
- Customer Flat-Rate Preference: ${MARKET_OVERVIEW.flatRatePreference}% prefer flat-rate pricing
- Only ${MARKET_OVERVIEW.flatRateAdoption}% of contractors offer flat-rate (MAJOR OPPORTUNITY)
- Speed Impact: ${MARKET_OVERVIEW.speedToConvertMultiplier}x more likely to convert if respond within 5 minutes
- Financing Impact: ${MARKET_OVERVIEW.financingCloseRateIncrease}% higher close rates when offering financing
- Subscription LTV: ${MARKET_OVERVIEW.subscriptionLTVMultiplier}x higher lifetime value than transactional

## Conversion Rate Data
${conversionData}

## Pricing Psychology (Research-Backed)
${pricingPsychologyData}

## Timing/Emergency Multipliers (Industry Standard)
- Standard Hours: ${TIMING_MULTIPLIERS.standard.multiplier}x
- After Hours (evenings): ${TIMING_MULTIPLIERS.afterHours.multiplier.low}x-${TIMING_MULTIPLIERS.afterHours.multiplier.high}x (+$${TIMING_MULTIPLIERS.afterHours.surcharge?.low}-$${TIMING_MULTIPLIERS.afterHours.surcharge?.high}/hr)
- Weekends: ${TIMING_MULTIPLIERS.weekends.multiplier.low}x-${TIMING_MULTIPLIERS.weekends.multiplier.high}x
- Holidays: ${TIMING_MULTIPLIERS.holidays.multiplier.low}x-${TIMING_MULTIPLIERS.holidays.multiplier.high}x
- Emergency Same-Day: ${TIMING_MULTIPLIERS.emergencySameDay.multiplier.low}x-${TIMING_MULTIPLIERS.emergencySameDay.multiplier.high}x

## Parts/Materials Markup Standards
- Small Parts (<$50): ${PARTS_MARKUP.smallParts.markup.low}%-${PARTS_MARKUP.smallParts.markup.high}% markup (${PARTS_MARKUP.smallParts.margin.low}%-${PARTS_MARKUP.smallParts.margin.high}% margin)
- Medium Parts ($50-200): ${PARTS_MARKUP.mediumParts.markup.low}%-${PARTS_MARKUP.mediumParts.markup.high}% markup
- Large Parts ($200-500): ${PARTS_MARKUP.largeParts.markup.low}%-${PARTS_MARKUP.largeParts.markup.high}% markup
- Equipment (>$500): ${PARTS_MARKUP.equipment.markup.low}%-${PARTS_MARKUP.equipment.markup.high}% markup

## Overhead Benchmarks (% of Revenue)
- Vehicle Costs: ${OVERHEAD_ALLOCATION.vehicleCosts.low}%-${OVERHEAD_ALLOCATION.vehicleCosts.high}%
- Insurance: ${OVERHEAD_ALLOCATION.insurance.low}%-${OVERHEAD_ALLOCATION.insurance.high}%
- Marketing: ${OVERHEAD_ALLOCATION.marketing.low}%-${OVERHEAD_ALLOCATION.marketing.high}% (recommended)
- Admin: ${OVERHEAD_ALLOCATION.administrative.low}%-${OVERHEAD_ALLOCATION.administrative.high}%
- Total Overhead Target: ${OVERHEAD_ALLOCATION.totalOverhead.low}%-${OVERHEAD_ALLOCATION.totalOverhead.high}%

## Retention & Subscription Economics
- Subscription Retention: ${RETENTION_METRICS.subscription.retentionIncrease}% higher than transactional
- Subscription LTV: ${RETENTION_METRICS.subscription.ltvMultiplier}x higher
- Probability of Sale to Existing Customer: ${RETENTION_METRICS.subscription.probabilityOfSale.low}%-${RETENTION_METRICS.subscription.probabilityOfSale.high}%
- Annual Prepay Optimal Discount: ${ANNUAL_PREPAY_DISCOUNT.optimal.low}%-${ANNUAL_PREPAY_DISCOUNT.optimal.high}%

## Available Services (with industry base prices)
${industryData.services.map((s, i) => 
  `${i}. ${s.name} - Base: $${s.lowPrice}-$${s.highPrice} (${s.pricingUnit}) - Category: ${s.category}`
).join('\n')}

## Available Retention Plans
${industryData.retentionModels.map((r, i) => 
  `${i}. ${r.name} - $${r.priceRange.low}-$${r.priceRange.high}/${r.frequency} - Retention Lift: +${r.retentionLift}%`
).join('\n')}

## AI Pricing Rules (Best Practices)
Primary Rules:
${AI_PRICING_RULES.primary.map(r => `- ${r}`).join('\n')}

Conversion Optimization:
${AI_PRICING_RULES.conversionOptimization.map(r => `- ${r}`).join('\n')}

Target Margins by Service Type:
- Emergency/Repair: ${AI_PRICING_RULES.targetMargins.emergencyRepair.gross.low}%-${AI_PRICING_RULES.targetMargins.emergencyRepair.gross.high}% gross, ${AI_PRICING_RULES.targetMargins.emergencyRepair.net.low}%-${AI_PRICING_RULES.targetMargins.emergencyRepair.net.high}% net
- Maintenance: ${AI_PRICING_RULES.targetMargins.maintenance.gross.low}%-${AI_PRICING_RULES.targetMargins.maintenance.gross.high}% gross
- Installation: ${AI_PRICING_RULES.targetMargins.installation.gross.low}%-${AI_PRICING_RULES.targetMargins.installation.gross.high}% gross
- Recurring: ${AI_PRICING_RULES.targetMargins.recurringService.gross.low}%-${AI_PRICING_RULES.targetMargins.recurringService.gross.high}% gross

## Pricing Formulas
- Core: ${PRICING_FORMULAS.corePricing.formula}
- Flat Rate Job: ${PRICING_FORMULAS.flatRateJob.formula}
- Minimum Profitable Price: ${PRICING_FORMULAS.minimumProfitablePrice.formula}
`

    const prompt = `You are an expert pricing consultant. Based on this business profile, configure optimal services and retention offers.

${businessContext}

Analyze this business and provide:

1. **Service Configuration**: For each service, decide if it should be enabled and suggest an optimal price based on:
   - Business experience level (${wizardConfig.yearsInBusiness})
   - Pricing strategy (${wizardConfig.pricingStrategy})
   - Regional adjustment (${regionalMultiplier}x)
   - Target margin (${wizardConfig.targetMargin}%)
   - Service relevance to a ${wizardConfig.teamSize} operation

2. **Retention Plans**: Recommend which retention plans to prioritize based on:
   - Team capacity
   - Revenue goals
   - Industry best practices
   - Customer acquisition cost recovery

3. **Price Rules**: Suggest optimal price rule settings (rush fees, discounts, etc.)

Return JSON in this exact format:
{
  "services": [
    {
      "serviceIndex": 0,
      "serviceName": "Service Name",
      "enabled": true,
      "suggestedPrice": 150,
      "reasoning": "Brief explanation",
      "priority": "high"
    }
  ],
  "retentionPlans": [
    {
      "planName": "Plan Name",
      "recommended": true,
      "suggestedPrice": { "low": 100, "high": 200 },
      "reasoning": "Brief explanation",
      "priority": 1
    }
  ],
  "priceRules": [
    {
      "name": "Same-Day Service",
      "type": "multiplier",
      "value": 1.5,
      "condition": "Booking within 24 hours",
      "enabled": true,
      "reasoning": "Brief explanation"
    }
  ],
  "insights": {
    "projectedMonthlyRevenue": 10000,
    "projectedAvgTicket": 175,
    "conversionTips": ["tip1", "tip2"],
    "warningsOrSuggestions": ["warning1"]
  }
}`

    let aiResponse: string | null = null

    // Try Anthropic first, then OpenAI
    if (anthropic) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })
        aiResponse = response.content[0].type === 'text' ? response.content[0].text : null
      } catch (e) {
        console.error('Anthropic error:', e)
      }
    }

    if (!aiResponse && openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
        })
        aiResponse = response.choices[0]?.message?.content || null
      } catch (e) {
        console.error('OpenAI error:', e)
      }
    }

    // If no AI available, generate fallback configuration
    if (!aiResponse) {
      return NextResponse.json(generateFallbackConfig(wizardConfig, industryData, regionalMultiplier))
    }

    // Parse AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Failed to parse AI response, using fallback')
      return NextResponse.json(generateFallbackConfig(wizardConfig, industryData, regionalMultiplier))
    }

    try {
      const result = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        success: true,
        aiGenerated: true,
        ...result,
      })
    } catch (e) {
      console.error('JSON parse error:', e)
      return NextResponse.json(generateFallbackConfig(wizardConfig, industryData, regionalMultiplier))
    }

  } catch (error) {
    console.error('Pricing config error:', error)
    return NextResponse.json({ error: 'Failed to generate pricing config' }, { status: 500 })
  }
}

function getExperienceDescription(level: string): string {
  const desc: Record<string, string> = {
    new: 'less than 1 year, still building reputation',
    growing: '1-3 years, gaining traction',
    established: '3-7 years, proven track record',
    expert: '7+ years, industry leader',
  }
  return desc[level] || level
}

function getTeamDescription(size: string): string {
  const desc: Record<string, string> = {
    solo: '1 person operation',
    small: '2-3 person team',
    medium: '4-8 person team',
    large: '9+ person operation',
  }
  return desc[size] || size
}

function generateFallbackConfig(
  wizardConfig: WizardConfig, 
  industryData: ReturnType<typeof getIndustryBySlug>,
  regionalMultiplier: number
) {
  if (!industryData) {
    return { success: false, error: 'Invalid industry' }
  }

  // Strategy multipliers (based on comprehensive database research)
  const strategyMultiplier: Record<string, number> = {
    penetration: 0.85, // Below market to gain share
    value: 0.95, // Slightly below for value perception
    competitive: 1.0, // At market rate
    premium: 1.2, // Premium positioning for established brands
  }

  // Experience multipliers (new businesses should price lower to build reputation)
  const experienceMultiplier: Record<string, number> = {
    new: 0.85, // New businesses need competitive pricing
    growing: 0.95, // Building reputation
    established: 1.0, // Market rate
    expert: 1.15, // Can command premium
  }

  const strategy = strategyMultiplier[wizardConfig.pricingStrategy] || 1
  const experience = experienceMultiplier[wizardConfig.yearsInBusiness] || 1
  const finalMultiplier = regionalMultiplier * strategy * experience

  // Get industry-specific conversion rate
  const industryConversion = getIndustryConversionRate(wizardConfig.industry)
  
  // Get industry profit margin targets
  const profitData = PROFIT_MARGINS[wizardConfig.industry as keyof typeof PROFIT_MARGINS]
  const targetGrossMargin = profitData 
    ? (('gross' in profitData && 'low' in (profitData.gross as object)) 
        ? ((profitData.gross as { low: number; high: number }).low + (profitData.gross as { low: number; high: number }).high) / 2 
        : (profitData.gross as { avg: number }).avg)
    : 45

  // Configure services with comprehensive database insights
  const services: ServiceConfig[] = industryData.services.map((service, index) => {
    // Enable first 8-10 services by default, prioritize by category relevance
    const isCoreService = service.category === 'Service' || service.category === 'Maintenance' || service.category === 'Repair'
    const enabled = index < 8 || isCoreService
    
    // Apply charm pricing when appropriate (research shows 24-60% sales increase)
    let suggestedPrice = Math.round(service.avgPrice * finalMultiplier)
    if (suggestedPrice > 50 && suggestedPrice % 10 === 0) {
      suggestedPrice = suggestedPrice - 1 // Apply charm pricing ($100 -> $99)
    }
    
    let priority: 'high' | 'medium' | 'low' = 'medium'
    if (isCoreService || index < 4) priority = 'high'
    else if (index > 10) priority = 'low'

    return {
      serviceIndex: index,
      serviceName: service.name,
      enabled,
      suggestedPrice,
      reasoning: `Base $${service.avgPrice} × ${finalMultiplier.toFixed(2)}x (${wizardConfig.pricingStrategy} strategy + regional adjustment + ${wizardConfig.yearsInBusiness} experience). Industry avg ticket: $${industryData.avgTicket.avg}.`,
      priority,
    }
  })

  // Configure retention plans using database insights
  // Research shows subscription customers have 3x higher LTV
  const maintenanceAgreementData = MAINTENANCE_AGREEMENT_PRICING[wizardConfig.industry as keyof typeof MAINTENANCE_AGREEMENT_PRICING]
  const retentionPlans: RetentionConfig[] = industryData.retentionModels.map((plan, index) => {
    const isSmallTeam = wizardConfig.teamSize === 'solo' || wizardConfig.teamSize === 'small'
    
    // Use database pricing if available
    let suggestedPriceLow = plan.priceRange.low
    let suggestedPriceHigh = plan.priceRange.high
    
    if (maintenanceAgreementData) {
      const tier = index === 0 ? 'basic' : index === 1 ? 'standard' : 'premium'
      const tierData = maintenanceAgreementData[tier as keyof typeof maintenanceAgreementData]
      if (tierData) {
        suggestedPriceLow = tierData.low
        suggestedPriceHigh = tierData.high
      }
    }
    
    // First plan (basic) always recommended, plus monthly for larger teams
    const recommended = index === 0 || (plan.frequency === 'monthly' && !isSmallTeam)

    return {
      planName: plan.name,
      recommended,
      suggestedPrice: {
        low: Math.round(suggestedPriceLow * finalMultiplier),
        high: Math.round(suggestedPriceHigh * finalMultiplier),
      },
      reasoning: recommended 
        ? `Recommended: ${plan.retentionLift}% retention lift, ${plan.ltv_multiplier}x LTV. Database shows subscription customers have ${RETENTION_METRICS.subscription.ltvMultiplier}x higher lifetime value.`
        : `Optional plan for scaling. Consider ${ANNUAL_PREPAY_DISCOUNT.optimal.low}-${ANNUAL_PREPAY_DISCOUNT.optimal.high}% annual prepay discount.`,
      priority: index + 1,
    }
  })

  // Configure price rules using timing multipliers from database
  const priceRules: PriceRuleConfig[] = [
    {
      name: 'Same-Day/Emergency Service',
      type: 'multiplier',
      value: wizardConfig.pricingStrategy === 'premium' 
        ? TIMING_MULTIPLIERS.emergencySameDay.multiplier.high 
        : TIMING_MULTIPLIERS.emergencySameDay.multiplier.low,
      condition: 'Booking within 24 hours',
      enabled: true,
      reasoning: `Industry standard: ${TIMING_MULTIPLIERS.emergencySameDay.multiplier.low}x-${TIMING_MULTIPLIERS.emergencySameDay.multiplier.high}x for same-day service.`,
    },
    {
      name: 'Weekend Premium',
      type: 'multiplier',
      value: wizardConfig.pricingStrategy === 'premium'
        ? TIMING_MULTIPLIERS.weekends.multiplier.high
        : TIMING_MULTIPLIERS.weekends.multiplier.low,
      condition: 'Saturday or Sunday',
      enabled: true,
      reasoning: `Industry standard: ${TIMING_MULTIPLIERS.weekends.multiplier.low}x-${TIMING_MULTIPLIERS.weekends.multiplier.high}x for weekend work.`,
    },
    {
      name: 'After Hours',
      type: 'multiplier',
      value: TIMING_MULTIPLIERS.afterHours.multiplier.low,
      condition: 'Service after 6 PM',
      enabled: wizardConfig.teamSize !== 'solo',
      reasoning: wizardConfig.teamSize === 'solo' 
        ? 'Disabled for solo operators. Consider work-life balance.'
        : `Industry standard: ${TIMING_MULTIPLIERS.afterHours.multiplier.low}x-${TIMING_MULTIPLIERS.afterHours.multiplier.high}x (+$${TIMING_MULTIPLIERS.afterHours.surcharge?.low}-$${TIMING_MULTIPLIERS.afterHours.surcharge?.high}/hr).`,
    },
    {
      name: 'Holiday Premium',
      type: 'multiplier',
      value: TIMING_MULTIPLIERS.holidays.multiplier.low,
      condition: 'Major holidays',
      enabled: false,
      reasoning: `Industry standard: ${TIMING_MULTIPLIERS.holidays.multiplier.low}x-${TIMING_MULTIPLIERS.holidays.multiplier.high}x for holidays. Enable if offering holiday service.`,
    },
    {
      name: 'Recurring Customer Discount',
      type: 'percentage',
      value: -(ANNUAL_PREPAY_DISCOUNT.optimal.low), // Negative for discount
      condition: 'Subscription/recurring clients',
      enabled: true,
      reasoning: `${ANNUAL_PREPAY_DISCOUNT.optimal.low}%-${ANNUAL_PREPAY_DISCOUNT.optimal.high}% optimal discount. Subscription customers have ${RETENTION_METRICS.subscription.retentionIncrease}% higher retention.`,
    },
    {
      name: 'First-Time Customer',
      type: 'percentage',
      value: wizardConfig.pricingStrategy === 'penetration' ? -15 : -10,
      condition: 'New customers',
      enabled: wizardConfig.yearsInBusiness === 'new' || wizardConfig.yearsInBusiness === 'growing',
      reasoning: wizardConfig.yearsInBusiness === 'new' 
        ? 'Important for building initial customer base. Track CAC payback period.'
        : 'Helps with customer acquisition. First responder gets 78% of buyers.',
    },
    {
      name: 'Referral Discount',
      type: 'percentage',
      value: -10,
      condition: 'Referred by existing customer',
      enabled: true,
      reasoning: 'Referrals have 37% higher retention. Reward both referrer and referee.',
    },
  ]

  // Calculate projections using database insights
  const avgServicePrice = services.filter(s => s.enabled).reduce((sum, s) => sum + s.suggestedPrice, 0) / Math.max(services.filter(s => s.enabled).length, 1)
  const teamCapacity = { solo: 1, small: 2.5, medium: 6, large: 12 }[wizardConfig.teamSize] || 1
  const workingDays = 22 // Average working days per month
  const projectedMonthlyRevenue = Math.round(avgServicePrice * wizardConfig.jobsPerDay * teamCapacity * workingDays)
  
  // Calculate break-even and profitability metrics
  const monthlyJobCount = Math.round(wizardConfig.jobsPerDay * teamCapacity * workingDays)
  const laborCostPerJob = wizardConfig.hourlyLaborCost * wizardConfig.avgJobDuration
  const totalCostPerJob = laborCostPerJob + wizardConfig.avgMaterialCost
  const overheadPerJob = wizardConfig.monthlyOverhead / Math.max(monthlyJobCount, 1)
  const minProfitablePrice = Math.round((totalCostPerJob + overheadPerJob) / (1 - wizardConfig.targetMargin / 100))

  // Generate conversion tips based on database research
  const conversionTips = [
    `Respond within 5 minutes: ${PRICING_PSYCHOLOGY.speedToQuote.under5Minutes}x more likely to convert`,
    `Use flat-rate pricing: ${PRICING_PSYCHOLOGY.flatRatePreference}% of customers prefer it`,
    `Present 3-4 options: ${PRICING_PSYCHOLOGY.multipleOptionsImpact.closeRateIncrease}% higher close rate`,
    `Lead with monthly payment: ${PRICING_PSYCHOLOGY.monthlyPaymentLeadImpact}% higher close rate`,
    `Offer financing on $1,000+ jobs: ${PRICING_PSYCHOLOGY.financingImpact.closeRateIncrease}% higher close rates`,
    `Your industry conversion rate: ${industryConversion}% - speed and transparency are key`,
  ]

  // Generate warnings based on comprehensive analysis
  const warningsOrSuggestions = [
    ...getWarnings(wizardConfig, projectedMonthlyRevenue),
    ...(avgServicePrice < minProfitablePrice 
      ? [`Average ticket ($${Math.round(avgServicePrice)}) below minimum profitable price ($${minProfitablePrice}). Consider raising prices.`] 
      : []),
    ...(wizardConfig.targetMargin < targetGrossMargin - 10 
      ? [`Target margin (${wizardConfig.targetMargin}%) below industry average (${targetGrossMargin}%). Top performers achieve ${profitData?.netTop.high || 20}% net.`] 
      : []),
    ...(wizardConfig.monthlyOverhead / projectedMonthlyRevenue > 0.35 
      ? [`Overhead ratio (${Math.round(wizardConfig.monthlyOverhead / projectedMonthlyRevenue * 100)}%) above ${OVERHEAD_ALLOCATION.totalOverhead.high}% benchmark.`] 
      : []),
  ]

  return {
    success: true,
    aiGenerated: false,
    services,
    retentionPlans,
    priceRules,
    insights: {
      projectedMonthlyRevenue,
      projectedAvgTicket: Math.round(avgServicePrice),
      monthlyJobCount,
      minProfitablePrice,
      industryConversionRate: industryConversion,
      targetGrossMargin,
      conversionTips,
      warningsOrSuggestions,
    },
  }
}

// Helper to get industry-specific conversion rate
function getIndustryConversionRate(industrySlug: string): number {
  const rateMap: Record<string, number> = {
    cleaning: 17.65,
    residential_cleaning: 17.65,
    window_cleaning: 13.58,
    handyman: 13.45,
    plumbing: 14,
    hvac: 5,
    roofing: 5,
    electrical: 10,
    landscaping: 12,
    lawn_care: 12,
    pest_control: 15,
    painting: 8,
  }
  return rateMap[industrySlug] || CONVERSION_RATES.industryBenchmark.averageCvr
}

function getWarnings(config: WizardConfig, projectedRevenue: number): string[] {
  const warnings: string[] = []
  
  if (projectedRevenue < config.monthlyRevenueGoal) {
    const gap = config.monthlyRevenueGoal - projectedRevenue
    warnings.push(`Projected revenue ($${projectedRevenue.toLocaleString()}) is below goal. Consider adding ${Math.ceil(gap / 175)} more jobs/month or increasing prices.`)
  }
  
  if (config.targetMargin < 30) {
    warnings.push('Target margin below 30% may not be sustainable long-term.')
  }
  
  if (config.hourlyLaborCost < 20) {
    warnings.push('Labor cost seems low. Ensure you\'re accounting for benefits, taxes, and insurance.')
  }
  
  if (config.yearsInBusiness === 'new' && config.pricingStrategy === 'premium') {
    warnings.push('Premium pricing may be challenging for new businesses. Consider building reputation first.')
  }

  return warnings
}

// Helper functions to extract data from the comprehensive pricing database

function getIndustryBenchmarkData(industrySlug: string): string {
  // Map industry slugs to database keys
  const profitData = PROFIT_MARGINS[industrySlug as keyof typeof PROFIT_MARGINS]
  const clvData = CUSTOMER_LIFETIME_VALUE[industrySlug as keyof typeof CUSTOMER_LIFETIME_VALUE]
  
  let benchmarks = ''
  
  if (profitData) {
    const grossLow = 'gross' in profitData ? (profitData.gross as { low?: number; high?: number; avg?: number }).low || (profitData.gross as { avg: number }).avg : 0
    const grossHigh = 'gross' in profitData ? (profitData.gross as { low?: number; high?: number }).high || grossLow : 0
    benchmarks += `
## Industry-Specific Profit Margins (${industrySlug})
- Gross Margin: ${grossLow}%-${grossHigh}%
- Net Margin (Average): ${profitData.netAvg.low}%-${profitData.netAvg.high}%
- Net Margin (Top Performers): ${profitData.netTop.low}%-${profitData.netTop.high}%`
  }
  
  if (clvData) {
    const annualValue = typeof clvData.annual === 'number' 
      ? clvData.annual 
      : `${clvData.annual.low}-${clvData.annual.high}`
    const lifespan = typeof clvData.lifespan === 'number' 
      ? clvData.lifespan 
      : `${clvData.lifespan.low}-${clvData.lifespan.high}`
    benchmarks += `
## Customer Lifetime Value (${industrySlug})
- Annual Customer Value: $${annualValue}
- Average Customer Lifespan: ${lifespan} years
- CLV Range: $${clvData.clv.low.toLocaleString()}-$${clvData.clv.high.toLocaleString()}`
  }
  
  // Add industry-specific pricing data
  if (industrySlug === 'cleaning' || industrySlug === 'residential_cleaning') {
    benchmarks += `
## Cleaning Industry Pricing Reference
- Standard Clean (1BR): $${CLEANING_PRICING.residential.byBedroom[0].standard.low}-$${CLEANING_PRICING.residential.byBedroom[0].standard.high}
- Standard Clean (3BR): $${CLEANING_PRICING.residential.byBedroom[2].standard.low}-$${CLEANING_PRICING.residential.byBedroom[2].standard.high}
- Deep Clean (3BR): $${CLEANING_PRICING.residential.byBedroom[2].deep.low}-$${CLEANING_PRICING.residential.byBedroom[2].deep.high}
- Move-Out (3BR): $${CLEANING_PRICING.residential.byBedroom[2].moveOut.low}-$${CLEANING_PRICING.residential.byBedroom[2].moveOut.high}
- Per Sqft (standard): $${CLEANING_PRICING.residential.perSqft.standard.low}-$${CLEANING_PRICING.residential.perSqft.standard.high}
- Weekly Discount: ${CLEANING_PRICING.recurringDiscounts.weekly.discount.low}%-${CLEANING_PRICING.recurringDiscounts.weekly.discount.high}%`
  }
  
  if (industrySlug === 'hvac') {
    benchmarks += `
## HVAC Industry Pricing Reference
- Service Call: $${HVAC_PRICING.serviceCalls.standard.low}-$${HVAC_PRICING.serviceCalls.standard.high}
- AC Tune-up: $${HVAC_PRICING.serviceCalls.acTuneUp.low}-$${HVAC_PRICING.serviceCalls.acTuneUp.high}
- Capacitor Replacement: $${HVAC_PRICING.repairs.capacitor.low}-$${HVAC_PRICING.repairs.capacitor.high}
- Blower Motor: $${HVAC_PRICING.repairs.blowerMotor.low}-$${HVAC_PRICING.repairs.blowerMotor.high}
- 3-ton Install: $${HVAC_PRICING.installation.byTonnage[1].cost.low}-$${HVAC_PRICING.installation.byTonnage[1].cost.high}
- Basic Maintenance Agreement: $${HVAC_PRICING.maintenanceAgreements.basic.annual.low}-$${HVAC_PRICING.maintenanceAgreements.basic.annual.high}/yr`
  }
  
  if (industrySlug === 'plumbing') {
    benchmarks += `
## Plumbing Industry Pricing Reference
- Service Call: $${PLUMBING_PRICING.commonServices.serviceCall.low}-$${PLUMBING_PRICING.commonServices.serviceCall.high}
- Drain Cleaning: $${PLUMBING_PRICING.commonServices.drainCleaning.low}-$${PLUMBING_PRICING.commonServices.drainCleaning.high}
- Hydro-Jetting: $${PLUMBING_PRICING.commonServices.hydroJetting.low}-$${PLUMBING_PRICING.commonServices.hydroJetting.high}
- Faucet Install: $${PLUMBING_PRICING.commonServices.faucetInstall.low}-$${PLUMBING_PRICING.commonServices.faucetInstall.high}
- Water Heater (tank): $${PLUMBING_PRICING.commonServices.waterHeaterTank.low}-$${PLUMBING_PRICING.commonServices.waterHeaterTank.high}
- Journeyman Rate: $${PLUMBING_PRICING.hourlyRates.journeyman.us.low}-$${PLUMBING_PRICING.hourlyRates.journeyman.us.high}/hr`
  }
  
  if (industrySlug === 'electrical') {
    benchmarks += `
## Electrical Industry Pricing Reference
- Service Call: $${ELECTRICAL_PRICING.commonServices.serviceCall.low}-$${ELECTRICAL_PRICING.commonServices.serviceCall.high}
- Outlet Install: $${ELECTRICAL_PRICING.commonServices.outletInstall.low}-$${ELECTRICAL_PRICING.commonServices.outletInstall.high}
- Ceiling Fan: $${ELECTRICAL_PRICING.commonServices.ceilingFan.low}-$${ELECTRICAL_PRICING.commonServices.ceilingFan.high}
- Panel Upgrade: $${ELECTRICAL_PRICING.commonServices.panelUpgrade.low}-$${ELECTRICAL_PRICING.commonServices.panelUpgrade.high}
- EV Charger: $${ELECTRICAL_PRICING.commonServices.evCharger.low}-$${ELECTRICAL_PRICING.commonServices.evCharger.high}
- Journeyman Rate: $${ELECTRICAL_PRICING.hourlyRates.journeyman.low}-$${ELECTRICAL_PRICING.hourlyRates.journeyman.high}/hr`
  }
  
  if (industrySlug === 'landscaping' || industrySlug === 'lawn_care') {
    benchmarks += `
## Landscaping Industry Pricing Reference
- Small Lot Mowing (⅛ acre): $${LANDSCAPING_PRICING.lawnMowing.byLotSize[0].cost.low}-$${LANDSCAPING_PRICING.lawnMowing.byLotSize[0].cost.high}
- Medium Lot (¼ acre): $${LANDSCAPING_PRICING.lawnMowing.byLotSize[1].cost.low}-$${LANDSCAPING_PRICING.lawnMowing.byLotSize[1].cost.high}
- Large Lot (½ acre): $${LANDSCAPING_PRICING.lawnMowing.byLotSize[2].cost.low}-$${LANDSCAPING_PRICING.lawnMowing.byLotSize[2].cost.high}
- Mulch Installed: $${LANDSCAPING_PRICING.services.mulchInstalled.low}-$${LANDSCAPING_PRICING.services.mulchInstalled.high}/cubic yard
- Tree Trimming (medium): $${LANDSCAPING_PRICING.treeServices.byHeight[1].trimming.low}-$${LANDSCAPING_PRICING.treeServices.byHeight[1].trimming.high}`
  }
  
  if (industrySlug === 'pest_control') {
    benchmarks += `
## Pest Control Industry Pricing Reference
- One-Time Treatment: $${PEST_CONTROL_PRICING.byFrequency.oneTime.low}-$${PEST_CONTROL_PRICING.byFrequency.oneTime.high}
- Monthly: $${PEST_CONTROL_PRICING.byFrequency.monthly.low}-$${PEST_CONTROL_PRICING.byFrequency.monthly.high}/month
- Quarterly (most popular): $${PEST_CONTROL_PRICING.byFrequency.quarterly.low}-$${PEST_CONTROL_PRICING.byFrequency.quarterly.high}/quarter
- Ants/Roaches: $${PEST_CONTROL_PRICING.byPest.antsRoaches.low}-$${PEST_CONTROL_PRICING.byPest.antsRoaches.high}
- Termites: $${PEST_CONTROL_PRICING.byPest.termites.low}-$${PEST_CONTROL_PRICING.byPest.termites.high}`
  }
  
  if (industrySlug === 'handyman') {
    benchmarks += `
## Handyman Industry Pricing Reference
- Hourly Rate: $${HANDYMAN_PRICING.rates.hourly.low}-$${HANDYMAN_PRICING.rates.hourly.high}/hr
- Minimum Charge: $${HANDYMAN_PRICING.rates.minimum.low}-$${HANDYMAN_PRICING.rates.minimum.high}
- Half-Day Rate: $${HANDYMAN_PRICING.rates.halfDay.low}-$${HANDYMAN_PRICING.rates.halfDay.high}
- Full-Day Rate: $${HANDYMAN_PRICING.rates.fullDay.low}-$${HANDYMAN_PRICING.rates.fullDay.high}
- TV Mounting: $${HANDYMAN_PRICING.commonJobs.tvMounting.low}-$${HANDYMAN_PRICING.commonJobs.tvMounting.high}`
  }
  
  return benchmarks
}

function getConversionDataForIndustry(_industrySlug: string): string {
  const conversionRates = CONVERSION_RATES.byIndustry
  
  const data = `
## Industry Conversion Rates
- Cleaning/Maid: ${conversionRates.cleaningMaid.rate}% (${conversionRates.cleaningMaid.cycle} cycle)
- Window Cleaning: ${conversionRates.windowCleaning.rate}% (${conversionRates.windowCleaning.cycle} cycle)
- Handyman: ${conversionRates.handyman.rate}% (${conversionRates.handyman.cycle} cycle)
- Plumbing: ${typeof conversionRates.plumbing.rate === 'object' 
    ? `${conversionRates.plumbing.rate.low}-${conversionRates.plumbing.rate.high}%` 
    : `${conversionRates.plumbing.rate}%`} (${conversionRates.plumbing.cycle} cycle)
- HVAC: ${typeof conversionRates.hvac.rate === 'object' 
    ? `${conversionRates.hvac.rate.low}-${conversionRates.hvac.rate.high}%` 
    : `${conversionRates.hvac.rate}%`} (${conversionRates.hvac.cycle} cycle)
- Roofing: ${typeof conversionRates.roofing.rate === 'object' 
    ? `${conversionRates.roofing.rate.low}-${conversionRates.roofing.rate.high}%` 
    : `${conversionRates.roofing.rate}%`} (${conversionRates.roofing.cycle} cycle)
- Construction: ${conversionRates.construction.rate}% (${conversionRates.construction.cycle} cycle)

Industry Average: ${CONVERSION_RATES.industryBenchmark.averageCvr}% CVR, ~${CONVERSION_RATES.industryBenchmark.salesCycle} day sales cycle, ${CONVERSION_RATES.industryBenchmark.grossMargin}% gross margin`
  
  return data
}

function getPricingPsychologyInsights(): string {
  const pp = PRICING_PSYCHOLOGY
  
  return `
## Pricing Psychology (Research-Backed Data)
- ${pp.flatRatePreference}% of homeowners prefer upfront flat-rate pricing
- Transparent pricing = ${pp.transparentPricingImpact}% increase in conversion
- Financing on every call = ${pp.financingImpact.closeRateIncrease}% higher close rates, ${pp.financingImpact.ticketIncrease}% higher tickets
- 4+ proposal options = ${pp.multipleOptionsImpact.closeRateIncrease}% higher close rate
- Premium selection jumps from ${pp.multipleOptionsImpact.premiumSalesIncrease.from}% to ${pp.multipleOptionsImpact.premiumSalesIncrease.to}% with Good-Better-Best
- Leading with monthly payment = ${pp.monthlyPaymentLeadImpact}% higher close rate

## Speed-to-Quote Impact (Critical)
- Under 1 minute: ${pp.speedToQuote.under1Minute}% higher conversion
- Under 5 minutes: ${pp.speedToQuote.under5Minutes}x more likely to convert
- First responder: ${pp.speedToQuote.firstResponder}% of buyers choose first company to respond
- Under 10 minutes: ${pp.speedToQuote.under10Minutes.low}-${pp.speedToQuote.under10Minutes.high}x more leads converted

## Charm Pricing & Tiers
- Charm pricing ($99 vs $100): ${pp.charmPricing.salesIncrease.low}-${pp.charmPricing.salesIncrease.high}% sales increase when leftmost digit changes
- Optimal number of tiers: ${pp.charmPricing.optimalTiers}
- Middle tier selection: ${pp.charmPricing.middleTierSelection}% choose middle (Goldilocks effect)
- Revenue increase with tiers: ${pp.charmPricing.revenueIncrease}%
- Churn reduction with tiers: ${pp.charmPricing.churnReduction}%

## Transparency Impact
- ${pp.transparency.loyaltyIncrease}% of consumers loyal to transparent brands
- ${pp.transparency.decisionInfluence}% say transparency influences decisions
- ${pp.transparency.abandonmentFromUnclear}% abandon purchases due to unclear pricing
- ${pp.transparency.switchFromHiddenFees}% switch to competitors due to hidden fees`
}
