import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { fromTable, callRpc } from '@/lib/supabase/utils'

// ============================================================================
// GET - Get real-time metrics
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
    const metricNames = searchParams.get('metrics')?.split(',') || []
    const granularity = searchParams.get('granularity') || 'hour'
    const hours = parseInt(searchParams.get('hours') || '24')

    // Calculate start time
    const startTime = new Date()
    startTime.setHours(startTime.getHours() - hours)

    // Build query
    let query = fromTable(supabase, 'realtime_metrics')
      .select('*')
      .eq('business_id', business.id)
      .eq('granularity', granularity)
      .gte('time_bucket', startTime.toISOString())
      .order('time_bucket', { ascending: true })

    if (metricNames.length > 0) {
      query = query.in('metric_name', metricNames)
    }

    interface MetricRow {
      id: string
      business_id: string
      metric_name: string
      metric_category: string
      time_bucket: string
      granularity: string
      value_count: number
      value_sum: number
      value_avg: number
      value_min: number | null
      value_max: number | null
    }

    const { data: metrics, error: metricsError } = await query as { data: MetricRow[] | null; error: Error | null }

    if (metricsError) {
      console.error('Failed to get metrics:', metricsError)
      return NextResponse.json(
        { error: 'Failed to get metrics' },
        { status: 500 }
      )
    }

    // Group metrics by name
    const groupedMetrics: Record<string, MetricRow[]> = {}
    metrics?.forEach((metric: MetricRow) => {
      if (!groupedMetrics[metric.metric_name]) {
        groupedMetrics[metric.metric_name] = []
      }
      groupedMetrics[metric.metric_name].push(metric)
    })

    // Calculate aggregates for each metric
    const aggregates: Record<string, { total: number; average: number; min: number; max: number }> = {}
    Object.entries(groupedMetrics).forEach(([name, data]) => {
      const values = data.map((d: MetricRow) => Number(d.value_sum) || 0)
      aggregates[name] = {
        total: values.reduce((a, b) => a + b, 0),
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        min: Math.min(...values),
        max: Math.max(...values),
      }
    })

    return NextResponse.json({
      metrics: groupedMetrics,
      aggregates,
      period: {
        start: startTime.toISOString(),
        end: new Date().toISOString(),
        hours,
        granularity,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/analytics/metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Increment a metric (for manual metric tracking)
// ============================================================================

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { metric_name, metric_category, value = 1, granularity = 'hour' } = body

    if (!metric_name || !metric_category) {
      return NextResponse.json(
        { error: 'metric_name and metric_category are required' },
        { status: 400 }
      )
    }

    // Use the database function to increment the metric
    const { error: rpcError } = await callRpc(supabase, 'increment_metric', {
      p_business_id: business.id,
      p_metric_name: metric_name,
      p_metric_category: metric_category,
      p_value: value,
      p_granularity: granularity,
    })

    if (rpcError) {
      console.error('Failed to increment metric:', rpcError)
      return NextResponse.json(
        { error: 'Failed to increment metric' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/analytics/metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
