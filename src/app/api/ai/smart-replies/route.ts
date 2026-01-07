import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateSmartReplies } from '@/lib/ai/claude'

export async function POST(req: NextRequest) {
  try {
    const { customerMessage, customerId, quoteId } = await req.json()

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business info
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check AI settings
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('smart_replies_enabled, tone, suggestions_used_this_month, monthly_suggestion_limit')
      .eq('business_id', business.id)
      .single()

    if (!aiSettings?.smart_replies_enabled) {
      return NextResponse.json({ error: 'AI smart replies not enabled' }, { status: 403 })
    }

    // Check monthly limit
    const limit = aiSettings.monthly_suggestion_limit || 100
    const used = aiSettings.suggestions_used_this_month || 0
    if (used >= limit) {
      return NextResponse.json({ error: 'Monthly AI suggestion limit reached' }, { status: 429 })
    }

    // Get customer info
    let customerName = 'Customer'
    if (customerId) {
      const { data: customer } = await supabase
        .from('customers')
        .select('name')
        .eq('id', customerId)
        .single()
      if (customer) customerName = customer.name
    }

    // Get quote info
    let serviceType: string | undefined
    let quoteAmount: number | undefined
    if (quoteId) {
      const { data: quote } = await supabase
        .from('quotes')
        .select('service_type, quote_amount')
        .eq('id', quoteId)
        .single()
      if (quote) {
        serviceType = quote.service_type
        quoteAmount = quote.quote_amount
      }
    }

    const suggestions = await generateSmartReplies(customerMessage, {
      businessName: business.name,
      customerName,
      serviceType,
      quoteAmount,
      tone: aiSettings.tone || 'friendly',
    })

    // Update usage count
    await supabase
      .from('ai_settings')
      .update({ suggestions_used_this_month: used + 1 })
      .eq('business_id', business.id)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Smart replies error:', error)
    return NextResponse.json({ error: 'Failed to generate replies' }, { status: 500 })
  }
}
