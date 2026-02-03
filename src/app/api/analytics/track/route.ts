import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { fromTable } from '@/lib/supabase/utils'

// ============================================================================
// POST - Track analytics events
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { events } = body

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      )
    }

    // Get client info
    const sourceIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get authenticated user (optional - events can be tracked without auth)
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Use admin client to insert events (bypasses RLS for event logging)
    const supabaseAdmin = getSupabaseAdmin()

    // Prepare events with additional metadata
    const enrichedEvents = events.map((event: Record<string, unknown>) => ({
      ...event,
      user_id: event.user_id || user?.id,
      source_ip: sourceIp,
      user_agent: event.user_agent || userAgent,
      event_timestamp: event.event_timestamp || new Date().toISOString(),
      event_date: new Date().toISOString().split('T')[0],
    }))

    // Insert events
    const { data, error } = await fromTable(supabaseAdmin, 'analytics_events')
      .insert(enrichedEvents)
      .select('id')

    if (error) {
      console.error('Failed to insert analytics events:', error)
      return NextResponse.json(
        { error: 'Failed to track events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tracked: data?.length || 0,
    })
  } catch (error) {
    console.error('Error in POST /api/analytics/track:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
