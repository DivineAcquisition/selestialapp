import { NextRequest, NextResponse } from 'next/server'
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/email/resend'
import QuoteNotificationEmail from '@/lib/email/templates/quote-notification'

export async function POST(req: NextRequest) {
  try {
    const { email, businessName, customerName, serviceType, amount, quoteId } = await req.json()

    if (!email || !businessName || !customerName || !serviceType || !quoteId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isResendConfigured() || !resend) {
      console.log('Resend not configured, skipping quote notification email')
      return NextResponse.json({ success: true, skipped: true })
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `New quote request from ${customerName}`,
      react: QuoteNotificationEmail({ 
        businessName,
        customerName,
        serviceType,
        amount: amount || 0,
        quoteId,
      }),
    })

    if (error) {
      console.error('Quote notification email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Quote notification email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
