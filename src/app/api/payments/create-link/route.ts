import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const PLATFORM_FEE_PERCENT = 3

export async function POST(req: NextRequest) {
  try {
    const { quoteId } = await req.json()

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business with Stripe account
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, stripe_connect_account_id, stripe_connect_enabled')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (!business.stripe_connect_account_id || !business.stripe_connect_enabled) {
      return NextResponse.json({ 
        error: 'Please complete Stripe Connect setup first' 
      }, { status: 400 })
    }

    // Get quote
    const { data: quote } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(id, name, email, phone)
      `)
      .eq('id', quoteId)
      .eq('business_id', business.id)
      .single()

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const amount = quote.quote_amount || 0
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Quote must have a valid amount' }, { status: 400 })
    }

    const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100))
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://selestialapp.vercel.app'

    // Create Stripe Payment Link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: quote.service_type || 'Service Payment',
              description: `Payment to ${business.name}`,
            },
          },
          quantity: 1,
        },
      ],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: business.stripe_connect_account_id,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${baseUrl}/pay/success?quote_id=${quoteId}`,
        },
      },
      metadata: {
        business_id: business.id,
        quote_id: quoteId,
      },
    })

    const supabaseAdmin = getSupabaseAdmin()

    // Save payment link to database
    const { error: linkError } = await supabaseAdmin
      .from('payment_links')
      .insert({
        business_id: business.id,
        quote_id: quote.id,
        amount: amount,
        description: `${quote.service_type || 'Service'} - ${business.name}`,
        stripe_payment_link_id: paymentLink.id,
        stripe_checkout_url: paymentLink.url,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

    if (linkError) {
      console.error('Payment link error:', linkError)
    }

    return NextResponse.json({
      success: true,
      paymentLink: paymentLink.url,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Create payment link error:', error)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}
