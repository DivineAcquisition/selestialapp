import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const PLATFORM_FEE_PERCENT = 3

// GET - List all payment links for the business
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id, stripe_connect_account_id, stripe_connect_enabled')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get query params for filtering
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('payment_links')
      .select(`
        *,
        quote:quotes(id, service_type, quote_amount, customer_name, customer_phone, customer_email, description)
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: links, error } = await query

    if (error) {
      console.error('Error fetching payment links:', error)
      return NextResponse.json({ error: 'Failed to fetch payment links' }, { status: 500 })
    }

    // Check Stripe connect status
    const stripeConfigured = business.stripe_connect_account_id && business.stripe_connect_enabled

    // Transform data to include customer info from quote
    const transformedLinks = (links || []).map(link => ({
      id: link.id,
      link_id: link.id, // Use id as link_id for compatibility
      customer_name: link.quote?.customer_name || 'Unknown Customer',
      customer_email: link.quote?.customer_email || '',
      customer_phone: link.quote?.customer_phone || null,
      amount: link.amount,
      description: link.description || link.quote?.service_type || '',
      services: [], // Services could be stored separately if needed
      status: link.status || 'pending',
      expires_at: link.expires_at,
      paid_at: null, // Would need to track this
      created_at: link.created_at,
      stripe_checkout_url: link.stripe_checkout_url,
      quote: link.quote,
    }))

    return NextResponse.json({
      links: transformedLinks,
      stripeConfigured,
      total: transformedLinks.length,
    })
  } catch (error) {
    console.error('Payment links error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment links' }, { status: 500 })
  }
}

// POST - Create a new payment link
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      amount, // in cents
      description,
      services,
      expiresInDays = 7,
      quoteId,
    } = body

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business with Stripe account
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, email, phone, stripe_connect_account_id, stripe_connect_enabled')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (!business.stripe_connect_account_id || !business.stripe_connect_enabled) {
      return NextResponse.json({
        error: 'Stripe Connect not configured',
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Please complete Stripe Connect setup in Settings > Connections before creating payment links.'
      }, { status: 400 })
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100))
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://selestialapp.vercel.app'
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

    // Create quote first if no quoteId provided (for standalone payment links)
    let finalQuoteId = quoteId
    if (!finalQuoteId && customerName && customerEmail) {
      const supabaseAdmin = getSupabaseAdmin()
      const { data: quote, error: quoteError } = await supabaseAdmin
        .from('quotes')
        .insert({
          business_id: business.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || '',
          service_type: description || 'Service Payment',
          quote_amount: amount,
          status: 'pending',
          description: services && services.length > 0 
            ? services.map((s: { name: string; price: number }) => `${s.name}: $${s.price}`).join(', ')
            : null,
        })
        .select()
        .single()

      if (quoteError) {
        console.error('Failed to create quote:', quoteError)
      } else {
        finalQuoteId = quote.id
      }
    }

    // Create Stripe Payment Link
    const stripePaymentLink = await stripe.paymentLinks.create({
      line_items: services && services.length > 0 
        ? services.map((s: { name: string; price: number; quantity: number }) => ({
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(s.price * 100),
              product_data: {
                name: s.name,
              },
            },
            quantity: s.quantity || 1,
          }))
        : [{
            price_data: {
              currency: 'usd',
              unit_amount: amount,
              product_data: {
                name: description || 'Service Payment',
                description: `Payment to ${business.name}`,
              },
            },
            quantity: 1,
          }],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: business.stripe_connect_account_id,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${baseUrl}/pay/success?quote_id=${finalQuoteId || ''}`,
        },
      },
      metadata: {
        business_id: business.id,
        quote_id: finalQuoteId || '',
        customer_email: customerEmail,
        customer_name: customerName,
      },
    })

    const supabaseAdmin = getSupabaseAdmin()

    // Save payment link to database
    const { data: paymentLink, error: linkError } = await supabaseAdmin
      .from('payment_links')
      .insert({
        business_id: business.id,
        quote_id: finalQuoteId || null,
        amount: amount,
        description: description || '',
        status: 'pending',
        stripe_payment_link_id: stripePaymentLink.id,
        stripe_checkout_url: stripePaymentLink.url,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (linkError) {
      console.error('Payment link database error:', linkError)
      // Try to deactivate the Stripe link if DB insert fails
      try {
        await stripe.paymentLinks.update(stripePaymentLink.id, { active: false })
      } catch (e) {
        console.error('Failed to deactivate Stripe link:', e)
      }
      return NextResponse.json({ error: 'Failed to save payment link' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paymentLink: {
        id: paymentLink.id,
        linkId: paymentLink.id,
        checkoutUrl: stripePaymentLink.url,
        amount: amount,
        expiresAt: expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Create payment link error:', error)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}
