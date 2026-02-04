import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { fromTable, callRpc } from '@/lib/supabase/utils'

// ============================================================================
// POST - Trigger analytics sync (calculate daily aggregates)
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

    const body = await request.json().catch(() => ({}))
    const { syncType = 'aggregates', days = 7 } = body

    const supabaseAdmin = getSupabaseAdmin()

    // Log sync start
    const { data: syncJob } = await fromTable(supabaseAdmin, 'analytics_sync_log')
      .insert({
        sync_type: syncType,
        sync_status: 'running',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    let recordsProcessed = 0

    try {
      if (syncType === 'aggregates' || syncType === 'all') {
        // Calculate daily aggregates for the past N days
        for (let i = 0; i < days; i++) {
          const date = new Date()
          date.setDate(date.getDate() - i - 1)
          const dateStr = date.toISOString().split('T')[0]

          const { error: rpcError } = await callRpc(supabaseAdmin, 'calculate_daily_aggregates', {
            p_business_id: business.id,
            p_date: dateStr,
          })

          if (rpcError) {
            console.error(`Failed to calculate aggregates for ${dateStr}:`, rpcError)
          } else {
            recordsProcessed++
          }
        }
      }

      // Update sync log
      if (syncJob?.id) {
        await fromTable(supabaseAdmin, 'analytics_sync_log')
          .update({
            sync_status: 'completed',
            records_synced: recordsProcessed,
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncJob.id)
      }

      return NextResponse.json({
        success: true,
        message: `Sync completed. Processed ${recordsProcessed} records.`,
        recordsProcessed,
      })
    } catch (error) {
      // Update sync log with error
      if (syncJob?.id) {
        await fromTable(supabaseAdmin, 'analytics_sync_log')
          .update({
            sync_status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncJob.id)
      }

      throw error
    }
  } catch (error) {
    console.error('Error in POST /api/analytics/sync:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET - Get sync status
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

    // Get latest sync job
    const { data: latestSync, error: syncError } = await fromTable(supabase, 'analytics_sync_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (syncError) {
      console.error('Failed to get sync status:', syncError)
    }

    // Get pending sync count (unsynced daily aggregates)
    const { count: pendingCount } = await fromTable(supabase, 'daily_aggregates')
      .select('id', { count: 'exact', head: true })
      .eq('synced_to_iceberg', false)

    return NextResponse.json({
      lastSync: latestSync?.completed_at || null,
      lastSyncStatus: latestSync?.sync_status || 'idle',
      recordsSynced: latestSync?.records_synced || 0,
      pendingSync: pendingCount || 0,
      error: latestSync?.error_message || null,
    })
  } catch (error) {
    console.error('Error in GET /api/analytics/sync:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
