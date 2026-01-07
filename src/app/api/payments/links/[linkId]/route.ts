import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// GET - Get payment link details (public - for checkout page)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
    const supabaseAdmin = getSupabaseAdmin()

    // Get payment link with business and quote info
    const { data: link, error } = await supabaseAdmin
      .from('payment_links')
      .select(`
        *,
        business:businesses(id, name, email, phone, company_logo_url),
        quote:quotes(id, service_type, quote_amount, customer_name, customer_email, customer_phone, description)
      `)
      .eq('id', linkId)
      .single()

    if (error || !link) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
    }

    // Check if expired
    if (link.expires_at && new Date(link.expires_at) < new Date() && link.status === 'pending') {
      // Update status to expired
      await supabaseAdmin
        .from('payment_links')
        .update({ status: 'expired' })
        .eq('id', link.id)

      link.status = 'expired'
    }

    // Update view count
    await supabaseAdmin
      .from('payment_links')
      .update({ 
        view_count: (link.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', link.id)

    // Return public payment link data
    return NextResponse.json({
      id: link.id,
      linkId: link.id,
      businessName: link.business?.name || 'Business',
      businessEmail: link.business?.email || '',
      businessPhone: link.business?.phone || '',
      businessLogo: link.business?.company_logo_url || null,
      customerName: link.quote?.customer_name || 'Customer',
      customerEmail: link.quote?.customer_email || '',
      amount: link.amount,
      description: link.description || link.quote?.service_type || '',
      services: [], // Services could be stored separately if needed
      status: link.status || 'pending',
      expiresAt: link.expires_at,
      createdAt: link.created_at,
      checkoutUrl: link.stripe_checkout_url,
    })
  } catch (error) {
    console.error('Get payment link error:', error)
    return NextResponse.json({ error: 'Failed to get payment link' }, { status: 500 })
  }
}

// PATCH - Update payment link (cancel, resend, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
    const body = await req.json()
    const { action } = body

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get payment link
    const { data: link, error: linkError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('id', linkId)
      .eq('business_id', business.id)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    switch (action) {
      case 'cancel':
        // Deactivate Stripe payment link
        if (link.stripe_payment_link_id) {
          try {
            await stripe.paymentLinks.update(link.stripe_payment_link_id, { active: false })
          } catch (e) {
            console.error('Failed to deactivate Stripe link:', e)
          }
        }

        // Update database
        await supabaseAdmin
          .from('payment_links')
          .update({ status: 'cancelled' })
          .eq('id', link.id)

        return NextResponse.json({ success: true, message: 'Payment link cancelled' })

      case 'resend':
        // Return the link for sending
        return NextResponse.json({
          success: true,
          checkoutUrl: link.stripe_checkout_url,
          message: 'Payment link ready to send',
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Update payment link error:', error)
    return NextResponse.json({ error: 'Failed to update payment link' }, { status: 500 })
  }
}

// DELETE - Delete a payment link
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get and delete payment link
    const { data: link, error: linkError } = await supabase
      .from('payment_links')
      .select('stripe_payment_link_id')
      .eq('id', linkId)
      .eq('business_id', business.id)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
    }

    // Deactivate Stripe link
    if (link.stripe_payment_link_id) {
      try {
        await stripe.paymentLinks.update(link.stripe_payment_link_id, { active: false })
      } catch (e) {
        console.error('Failed to deactivate Stripe link:', e)
      }
    }

    // Delete from database
    const supabaseAdmin = getSupabaseAdmin()
    await supabaseAdmin
      .from('payment_links')
      .delete()
      .eq('id', linkId)
      .eq('business_id', business.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete payment link error:', error)
    return NextResponse.json({ error: 'Failed to delete payment link' }, { status: 500 })
  }
}
