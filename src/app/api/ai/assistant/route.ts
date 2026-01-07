import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business context
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, industry_slug')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ 
        response: "I couldn't find your business. Please complete the onboarding first.",
        actions: []
      })
    }

    // Get recent data for context
    const { data: recentQuotes } = await supabase
      .from('quotes')
      .select('id, service_type, quote_amount, status, customer_name')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get stats
    const { count: pendingQuotes } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .eq('status', 'pending')

    const { count: wonQuotes } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .eq('status', 'won')

    const { count: totalQuotes } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)

    const winRate = totalQuotes ? Math.round((wonQuotes || 0) / totalQuotes * 100) : 0

    // Check if Anthropic is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        response: "I'm ready to help! However, AI features need to be configured. Please add your Anthropic API key.",
        actions: [
          { label: 'Go to Settings', action: 'open_settings', data: {} }
        ]
      })
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const systemPrompt = `You are Selestial AI, a helpful assistant for ${business.name}, a ${business.industry_slug?.replace('_', ' ') || 'home service'} business.

You can help users:
1. Create and manage quotes
2. Send messages to customers
3. View business stats
4. Find customer information
5. Manage sequences

CURRENT BUSINESS DATA:
- Pending quotes: ${pendingQuotes || 0}
- Win rate: ${winRate}%
- Total quotes: ${totalQuotes || 0}

RECENT QUOTES:
${recentQuotes?.map(q => `- ${q.customer_name}: $${((q.quote_amount || 0)/100).toFixed(0)} ${q.service_type || 'Service'} (${q.status})`).join('\n') || 'None'}

RESPONSE FORMAT:
Always respond with a JSON object:
{
  "response": "Your conversational response",
  "actions": [
    {
      "label": "Button text",
      "action": "action_type",
      "data": { ... }
    }
  ]
}

AVAILABLE ACTIONS:
- view_quote: { id: "quote_id" }
- create_quote: {}
- open_inbox: {}

RULES:
1. Be concise and helpful
2. Suggest relevant actions
3. Use the quote data when relevant
4. For creating quotes, suggest the create_quote action
5. When asked about stats, use the real data provided
6. Keep responses friendly but professional`

    // Build conversation history
    const conversationHistory = (history || [])
      .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      }))

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: message },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Parse JSON response
    let parsed
    try {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        parsed = { response: text, actions: [] }
      }
    } catch {
      parsed = { response: text, actions: [] }
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('AI Assistant error:', error)
    return NextResponse.json({ 
      response: "Sorry, I encountered an error. Please try again.",
      actions: []
    })
  }
}
