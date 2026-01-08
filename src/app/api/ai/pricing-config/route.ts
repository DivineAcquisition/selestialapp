import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { 
  getIndustryBySlug,
  REGIONAL_MULTIPLIERS,
} from '@/lib/pricing/pricing-data'

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

    // Build context for AI
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

## Industry Benchmarks
- Average Ticket: $${industryData.avgTicket.low} - $${industryData.avgTicket.high} (avg: $${industryData.avgTicket.avg})
- Industry Conversion Rate: ${industryData.conversionRate}%
- Gross Margin Range: ${industryData.grossMargin.low}% - ${industryData.grossMargin.high}%
- Top Performer Net Margin: ${industryData.netMargin.top}%

## Available Services (with industry base prices)
${industryData.services.map((s, i) => 
  `${i}. ${s.name} - Base: $${s.lowPrice}-$${s.highPrice} (${s.pricingUnit}) - Category: ${s.category}`
).join('\n')}

## Available Retention Plans
${industryData.retentionModels.map((r, i) => 
  `${i}. ${r.name} - $${r.priceRange.low}-$${r.priceRange.high}/${r.frequency} - Retention Lift: +${r.retentionLift}%`
).join('\n')}
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

  // Strategy multipliers
  const strategyMultiplier: Record<string, number> = {
    penetration: 0.85,
    value: 0.95,
    competitive: 1.0,
    premium: 1.2,
  }

  // Experience multipliers
  const experienceMultiplier: Record<string, number> = {
    new: 0.85,
    growing: 0.95,
    established: 1.0,
    expert: 1.15,
  }

  const strategy = strategyMultiplier[wizardConfig.pricingStrategy] || 1
  const experience = experienceMultiplier[wizardConfig.yearsInBusiness] || 1
  const finalMultiplier = regionalMultiplier * strategy * experience

  // Configure services
  const services: ServiceConfig[] = industryData.services.map((service, index) => {
    // Enable first 8-10 services by default, prioritize by category relevance
    const isCorService = service.category === 'Service' || service.category === 'Maintenance' || service.category === 'Repair'
    const enabled = index < 8 || isCorService
    
    const suggestedPrice = Math.round(service.avgPrice * finalMultiplier)
    
    let priority: 'high' | 'medium' | 'low' = 'medium'
    if (isCorService || index < 4) priority = 'high'
    else if (index > 10) priority = 'low'

    return {
      serviceIndex: index,
      serviceName: service.name,
      enabled,
      suggestedPrice,
      reasoning: `Base price $${service.avgPrice} adjusted for ${wizardConfig.pricingStrategy} strategy (${strategy}x), ${wizardConfig.yearsInBusiness} experience (${experience}x), and ${finalMultiplier.toFixed(2)}x regional factor.`,
      priority,
    }
  })

  // Configure retention plans
  const retentionPlans: RetentionConfig[] = industryData.retentionModels.map((plan, index) => {
    // Recommend based on team size and strategy
    const isSmallTeam = wizardConfig.teamSize === 'solo' || wizardConfig.teamSize === 'small'
    const recommended = index === 0 || (plan.frequency === 'monthly' && !isSmallTeam)

    return {
      planName: plan.name,
      recommended,
      suggestedPrice: {
        low: Math.round(plan.priceRange.low * finalMultiplier),
        high: Math.round(plan.priceRange.high * finalMultiplier),
      },
      reasoning: recommended 
        ? `Recommended for ${wizardConfig.teamSize} teams. ${plan.retentionLift}% retention lift with ${plan.ltv_multiplier}x LTV impact.`
        : `Optional plan. Consider when scaling beyond current capacity.`,
      priority: index + 1,
    }
  })

  // Configure price rules
  const priceRules: PriceRuleConfig[] = [
    {
      name: 'Same-Day Service',
      type: 'multiplier',
      value: wizardConfig.pricingStrategy === 'premium' ? 1.75 : 1.5,
      condition: 'Booking within 24 hours',
      enabled: true,
      reasoning: 'Rush jobs should command premium pricing to offset scheduling disruption.',
    },
    {
      name: 'Weekend Premium',
      type: 'percentage',
      value: wizardConfig.pricingStrategy === 'premium' ? 25 : 15,
      condition: 'Saturday or Sunday',
      enabled: true,
      reasoning: 'Weekend work is premium time; customers expect to pay more.',
    },
    {
      name: 'After Hours',
      type: 'flat',
      value: wizardConfig.pricingStrategy === 'premium' ? 75 : 50,
      condition: 'Service after 6 PM',
      enabled: wizardConfig.teamSize !== 'solo',
      reasoning: wizardConfig.teamSize === 'solo' 
        ? 'Disabled for solo operators to maintain work-life balance.'
        : 'After-hours availability is a competitive advantage.',
    },
    {
      name: 'Recurring Customer',
      type: 'percentage',
      value: wizardConfig.pricingStrategy === 'penetration' ? -20 : -15,
      condition: 'Subscription/recurring clients',
      enabled: true,
      reasoning: 'Recurring customers reduce acquisition costs; reward loyalty.',
    },
    {
      name: 'First-Time Discount',
      type: 'percentage',
      value: wizardConfig.pricingStrategy === 'penetration' ? -15 : -10,
      condition: 'New customers',
      enabled: wizardConfig.yearsInBusiness === 'new' || wizardConfig.yearsInBusiness === 'growing',
      reasoning: wizardConfig.yearsInBusiness === 'new' 
        ? 'Important for building initial customer base.'
        : 'Helps with customer acquisition.',
    },
    {
      name: 'Senior Discount',
      type: 'percentage',
      value: -10,
      condition: '65+ customers',
      enabled: false,
      reasoning: 'Optional community goodwill discount.',
    },
  ]

  // Calculate projections
  const avgServicePrice = services.filter(s => s.enabled).reduce((sum, s) => sum + s.suggestedPrice, 0) / services.filter(s => s.enabled).length
  const teamCapacity = { solo: 1, small: 2.5, medium: 6, large: 12 }[wizardConfig.teamSize] || 1
  const projectedMonthlyRevenue = Math.round(avgServicePrice * wizardConfig.jobsPerDay * teamCapacity * 22)

  return {
    success: true,
    aiGenerated: false,
    services,
    retentionPlans,
    priceRules,
    insights: {
      projectedMonthlyRevenue,
      projectedAvgTicket: Math.round(avgServicePrice),
      conversionTips: [
        'Respond to inquiries within 5 minutes for 21x higher conversion',
        'Always present 3-4 pricing options (Good-Better-Best)',
        'Use flat-rate pricing - 92% of customers prefer it',
        'Offer financing on jobs over $1,000',
      ],
      warningsOrSuggestions: getWarnings(wizardConfig, projectedMonthlyRevenue),
    },
  }
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
