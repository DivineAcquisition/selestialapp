import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/email/resend'
import PaymentLinkEmail from '@/lib/email/templates/payment-link'

// POST - Send payment link via email/SMS
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
    const body = await req.json()
    const { method = 'email', customMessage } = body // method: 'email' | 'sms' | 'both'

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, email, phone')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get payment link with quote info
    const supabaseAdmin = getSupabaseAdmin()
    const { data: link, error: linkError } = await supabaseAdmin
      .from('payment_links')
      .select(`
        *,
        quote:quotes(id, customer_name, customer_email, customer_phone)
      `)
      .eq('id', linkId)
      .eq('business_id', business.id)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
    }

    if (link.status !== 'pending') {
      return NextResponse.json({ 
        error: `Cannot send ${link.status} payment link` 
      }, { status: 400 })
    }

    const customerName = link.quote?.customer_name || 'Customer'
    const customerEmail = link.quote?.customer_email
    const customerPhone = link.quote?.customer_phone

    const results: { email?: boolean; sms?: boolean; errors: string[] } = { errors: [] }

    // Send via email
    if (method === 'email' || method === 'both') {
      if (!customerEmail) {
        results.errors.push('Customer email not available')
      } else if (!isResendConfigured() || !resend) {
        results.errors.push('Email service not configured')
      } else {
        try {
          const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: customerEmail,
            subject: `Payment Request from ${business.name}`,
            react: PaymentLinkEmail({
              businessName: business.name,
              customerName: customerName,
              amount: link.amount,
              description: link.description || 'Service Payment',
              paymentUrl: link.stripe_checkout_url,
              expiresAt: link.expires_at,
              customMessage,
            }),
          })

          if (error) {
            results.errors.push(`Email error: ${error.message}`)
          } else {
            results.email = true
          }
        } catch {
          results.errors.push('Failed to send email')
        }
      }
    }

    // Send via SMS
    if (method === 'sms' || method === 'both') {
      if (!customerPhone) {
        results.errors.push('Customer phone not available')
      } else {
        try {
          const smsMessage = customMessage || 
            `Hi ${customerName.split(' ')[0]}, ${business.name} has sent you a payment request for $${(link.amount / 100).toFixed(2)}. Pay securely here: ${link.stripe_checkout_url}`

          const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sms/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: customerPhone,
              message: smsMessage,
              businessId: business.id,
            }),
          })

          if (smsResponse.ok) {
            results.sms = true
          } else {
            results.errors.push('SMS sending failed')
          }
        } catch {
          results.errors.push('Failed to send SMS')
        }
      }
    }

    // Update last sent timestamp (no send_count column in schema)
    if (results.email || results.sms) {
      await supabaseAdmin
        .from('payment_links')
        .update({ 
          last_viewed_at: new Date().toISOString(), // Reuse this field to track send time
        })
        .eq('id', link.id)
    }

    const success = results.email || results.sms

    return NextResponse.json({
      success,
      results,
      message: success 
        ? `Payment link sent via ${[results.email && 'email', results.sms && 'SMS'].filter(Boolean).join(' and ')}`
        : 'Failed to send payment link',
    })
  } catch (error) {
    console.error('Send payment link error:', error)
    return NextResponse.json({ error: 'Failed to send payment link' }, { status: 500 })
  }
}
