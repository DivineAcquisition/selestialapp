import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { fromTable, callRpc } from '@/lib/supabase/utils'

// ============================================================================
// GET - Get dashboard analytics summary
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const includeTrends = searchParams.get('trends') === 'true'
    const includeTimeSeries = searchParams.get('timeseries') === 'true'

    // Get dashboard summary using the database function
    const { data: summary, error: summaryError } = await callRpc(supabase, 'get_dashboard_summary', {
      p_business_id: business.id,
      p_days: days,
    })

    if (summaryError) {
      console.error('Failed to get dashboard summary:', summaryError)
      // Return empty summary if function doesn't exist yet
      const emptySummary = {
        quotes: { total: 0, won: 0, lost: 0, value: 0, won_value: 0, conversion_rate: 0 },
        customers: { new: 0, active: 0, at_risk: 0 },
        messages: { sent: 0, received: 0 },
        payments: { count: 0, volume: 0 },
        period_days: days,
      }
      
      return NextResponse.json({ summary: emptySummary })
    }

    const result: Record<string, unknown> = { summary }

    // Include trends if requested
    if (includeTrends) {
      const trends = await calculateTrends(supabase, business.id, days)
      result.trends = trends
    }

    // Include time series if requested
    if (includeTimeSeries) {
      const timeSeries = await getTimeSeries(supabase, business.id, days)
      result.timeSeries = timeSeries
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/analytics/dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Calculate trends (compare current period to previous period)
async function calculateTrends(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  businessId: string,
  days: number
) {
  const today = new Date()
  const currentPeriodStart = new Date(today)
  currentPeriodStart.setDate(currentPeriodStart.getDate() - days)
  
  const previousPeriodStart = new Date(currentPeriodStart)
  previousPeriodStart.setDate(previousPeriodStart.getDate() - days)

  // Get current period data
  const { data: currentData } = await fromTable(supabase, 'daily_aggregates')
    .select('quotes_created, quotes_won, quote_value_won, customers_new, payments_volume')
    .eq('business_id', businessId)
    .gte('date', currentPeriodStart.toISOString().split('T')[0])
    .lte('date', today.toISOString().split('T')[0])

  // Get previous period data
  const { data: previousData } = await fromTable(supabase, 'daily_aggregates')
    .select('quotes_created, quotes_won, quote_value_won, customers_new, payments_volume')
    .eq('business_id', businessId)
    .gte('date', previousPeriodStart.toISOString().split('T')[0])
    .lt('date', currentPeriodStart.toISOString().split('T')[0])

  // Calculate sums
  type AggregateSum = { quotes: number; won: number; value: number; customers: number; revenue: number }
  type AggregateRow = { quotes_created?: number; quotes_won?: number; quote_value_won?: number; customers_new?: number; payments_volume?: number }
  
  const sumData = (data: AggregateRow[] | null): AggregateSum => {
    if (!data || data.length === 0) return { quotes: 0, won: 0, value: 0, customers: 0, revenue: 0 }
    return data.reduce<AggregateSum>((acc, row) => ({
      quotes: acc.quotes + (row.quotes_created || 0),
      won: acc.won + (row.quotes_won || 0),
      value: acc.value + Number(row.quote_value_won || 0),
      customers: acc.customers + (row.customers_new || 0),
      revenue: acc.revenue + Number(row.payments_volume || 0),
    }), { quotes: 0, won: 0, value: 0, customers: 0, revenue: 0 })
  }

  const current = sumData(currentData)
  const previous = sumData(previousData)

  // Calculate percentage changes
  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  return {
    quotes: {
      value: current.quotes,
      change: calcChange(current.quotes, previous.quotes),
      trend: current.quotes >= previous.quotes ? 'up' : 'down',
    },
    won: {
      value: current.won,
      change: calcChange(current.won, previous.won),
      trend: current.won >= previous.won ? 'up' : 'down',
    },
    revenue: {
      value: current.value,
      change: calcChange(current.value, previous.value),
      trend: current.value >= previous.value ? 'up' : 'down',
    },
    customers: {
      value: current.customers,
      change: calcChange(current.customers, previous.customers),
      trend: current.customers >= previous.customers ? 'up' : 'down',
    },
  }
}

// Get time series data for charts
async function getTimeSeries(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  businessId: string,
  days: number
) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  interface TimeSeriesRow {
    date: string
    quotes_created: number
    quotes_won: number
    quote_value_won: number | null
    customers_new: number
    messages_sent: number
    payments_volume: number | null
  }

  const { data } = await fromTable(supabase, 'daily_aggregates')
    .select('date, quotes_created, quotes_won, quote_value_won, customers_new, messages_sent, payments_volume')
    .eq('business_id', businessId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true }) as { data: TimeSeriesRow[] | null }

  if (!data || data.length === 0) {
    return {
      quotes: [],
      revenue: [],
      customers: [],
      messages: [],
    }
  }

  return {
    quotes: data.map((d: TimeSeriesRow) => ({ date: d.date, created: d.quotes_created, won: d.quotes_won })),
    revenue: data.map((d: TimeSeriesRow) => ({ date: d.date, value: Number(d.quote_value_won || 0) })),
    customers: data.map((d: TimeSeriesRow) => ({ date: d.date, new: d.customers_new })),
    messages: data.map((d: TimeSeriesRow) => ({ date: d.date, sent: d.messages_sent })),
  }
}
