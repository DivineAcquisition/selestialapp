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

    const { data: business } = await supabase
      .from('businesses')
      .select('stripe_connect_account_id')
      .eq('user_id', user.id)
      .single()

    if (!business?.stripe_connect_account_id) {
      return NextResponse.json({ error: 'No connected account' }, { status: 400 })
    }

    const loginLink = await stripe.accounts.createLoginLink(business.stripe_connect_account_id)

    return NextResponse.json({ url: loginLink.url })
  } catch (error) {
    console.error('Dashboard link error:', error)
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }
}
