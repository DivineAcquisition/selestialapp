import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { 
  INDUSTRIES, 
  getIndustryBySlug, 
  getRegionalMultiplier,
  CONVERSION_INSIGHTS,
  REGIONAL_MULTIPLIERS,
  CANADIAN_MULTIPLIERS
} from '@/lib/pricing/pricing-data'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { 
      query,
      industry,
      services,
      region,
      country,
      businessSize,
      currentPricing
    } = await req.json()

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get industry data if specified
    const industryData = industry ? getIndustryBySlug(industry) : null
    const regionalMultiplier = region ? getRegionalMultiplier(region, country || 'us') : 1.0

    // Build context for AI
    const industryContext = industryData ? `
Industry: ${industryData.name}
Average Ticket: $${industryData.avgTicket.low} - $${industryData.avgTicket.high} (avg: $${industryData.avgTicket.avg})
Conversion Rate: ${industryData.conversionRate}%
Gross Margin Target: ${industryData.grossMargin.low}% - ${industryData.grossMargin.high}%
Net Margin (Top Performers): ${industryData.netMargin.top}%

Best Pricing Model: ${industryData.pricingModels.reduce((best, curr) => 
  curr.conversionImpact > best.conversionImpact ? curr : best
).name} (+${industryData.pricingModels.reduce((best, curr) => 
  curr.conversionImpact > best.conversionImpact ? curr : best
).conversionImpact}% conversion)

Available Services:
${industryData.services.map(s => `- ${s.name}: $${s.lowPrice}-$${s.highPrice} (${s.pricingUnit})`).join('\n')}

Retention Models:
${industryData.retentionModels.map(r => `- ${r.name}: $${r.priceRange.low}-$${r.priceRange.high}/${r.frequency} (${r.retentionLift}% retention lift)`).join('\n')}
` : ''

    const prompt = `You are an expert pricing consultant for home service businesses. Using the following industry data and conversion insights, provide specific pricing recommendations.

${industryContext}

Regional Adjustment: ${regionalMultiplier}x (${region || 'baseline'})
Business Size: ${businessSize || 'Unknown'}
Current Pricing Approach: ${currentPricing || 'Not specified'}

Key Conversion Insights:
- 92% of customers prefer flat-rate pricing
- Companies responding under 5 minutes are 21x more likely to convert
- 4-tier "Good-Better-Best" pricing increases revenue by 30%
- Offering financing on every call increases close rates by 30%
- Price transparency increases customer loyalty by 94%

User Query: ${query}

Provide a detailed, data-backed response including:
1. Recommended pricing model and why
2. Specific price ranges (adjusted for region)
3. Retention/recurring revenue opportunities
4. Psychology-based pricing tips
5. Estimated conversion impact

Format your response as JSON with this structure:
{
  "recommendation": {
    "primaryPricingModel": "string",
    "modelRationale": "string",
    "conversionImpact": number
  },
  "suggestedPrices": [
    {
      "service": "string",
      "lowPrice": number,
      "recommendedPrice": number,
      "highPrice": number,
      "pricingUnit": "string",
      "notes": "string"
    }
  ],
  "tieredOptions": {
    "enabled": boolean,
    "tiers": [
      {
        "name": "string",
        "price": number,
        "features": ["string"]
      }
    ]
  },
  "retentionStrategy": {
    "recommended": "string",
    "priceRange": {"low": number, "high": number},
    "frequency": "string",
    "expectedLtvMultiplier": number,
    "includes": ["string"]
  },
  "pricingTips": ["string"],
  "estimatedMetrics": {
    "conversionRate": number,
    "avgTicket": number,
    "grossMargin": number
  }
}`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const result = JSON.parse(jsonMatch[0])

    // Add industry data to response
    return NextResponse.json({
      ...result,
      industryData: industryData ? {
        name: industryData.name,
        avgTicket: industryData.avgTicket,
        conversionRate: industryData.conversionRate,
        grossMargin: industryData.grossMargin,
        pricingModels: industryData.pricingModels,
        services: industryData.services,
        retentionModels: industryData.retentionModels
      } : null,
      regionalMultiplier,
      conversionInsights: CONVERSION_INSIGHTS
    })

  } catch (error) {
    console.error('Pricing suggestion error:', error)
    return NextResponse.json({ error: 'Failed to generate pricing' }, { status: 500 })
  }
}

// GET endpoint to fetch industries list
export async function GET() {
  return NextResponse.json({
    industries: INDUSTRIES.map(i => ({
      slug: i.slug,
      name: i.name,
      icon: i.icon,
      description: i.description,
      avgTicket: i.avgTicket,
      conversionRate: i.conversionRate
    })),
    regions: {
      us: REGIONAL_MULTIPLIERS,
      canada: CANADIAN_MULTIPLIERS
    },
    conversionInsights: CONVERSION_INSIGHTS
  })
}
