import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('stripe_connect_account_id, stripe_connect_enabled')
      .eq('user_id', user.id)
      .single()

    if (!business?.stripe_connect_account_id) {
      return NextResponse.json({ 
        connected: false,
        status: 'not_connected',
        chargesEnabled: false,
        payoutsEnabled: false,
      })
    }

    // Check account status with Stripe
    const account = await stripe.accounts.retrieve(business.stripe_connect_account_id)

    const isComplete = account.charges_enabled && account.payouts_enabled

    // Update status in database if changed
    if (isComplete !== business.stripe_connect_enabled) {
      await supabase
        .from('businesses')
        .update({ 
          stripe_connect_enabled: isComplete,
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      connected: true,
      status: isComplete ? 'active' : 'pending',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      accountId: business.stripe_connect_account_id,
    })
  } catch (error) {
    console.error('Connect status error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
