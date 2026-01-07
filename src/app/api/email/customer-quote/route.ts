import { NextRequest, NextResponse } from 'next/server'
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/email/resend'
import CustomerQuoteEmail from '@/lib/email/templates/customer-quote'

export async function POST(req: NextRequest) {
  try {
    const { 
      email, 
      businessName,
      businessPhone,
      businessEmail,
      customerName, 
      serviceType, 
      amount, 
      description,
      paymentUrl,
      quoteId,
      expiresAt,
    } = await req.json()

    if (!email || !businessName || !customerName || !serviceType || !quoteId || !paymentUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isResendConfigured() || !resend) {
      console.log('Resend not configured, skipping customer quote email')
      return NextResponse.json({ success: true, skipped: true })
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Your quote from ${businessName} is ready!`,
      react: CustomerQuoteEmail({ 
        businessName,
        businessPhone,
        businessEmail,
        customerName,
        serviceType,
        amount: amount || 0,
        description,
        paymentUrl,
        quoteId,
        expiresAt,
      }),
    })

    if (error) {
      console.error('Customer quote email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Customer quote email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
