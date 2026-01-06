import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, stripe_connect_account_id, email, name')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://selestialapp.vercel.app'

    // Check if already has account
    if (business.stripe_connect_account_id) {
      // Create new onboarding link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: business.stripe_connect_account_id,
        refresh_url: `${baseUrl}/settings?tab=payments&refresh=true`,
        return_url: `${baseUrl}/settings?tab=payments&success=true`,
        type: 'account_onboarding',
      })

      return NextResponse.json({ url: accountLink.url })
    }

    // Create new Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: business.email || user.email,
      business_type: 'individual',
      metadata: {
        business_id: business.id,
        user_id: user.id,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    // Save account ID
    await supabase
      .from('businesses')
      .update({ 
        stripe_connect_account_id: account.id,
        stripe_connect_enabled: false,
      })
      .eq('id', business.id)

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/settings?tab=payments&refresh=true`,
      return_url: `${baseUrl}/settings?tab=payments&success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Connect account error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
