import { NextRequest, NextResponse } from 'next/server'
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/email/resend'
import PaymentReceivedEmail from '@/lib/email/templates/payment-received'

export async function POST(req: NextRequest) {
  try {
    const { email, businessName, amount, customerEmail } = await req.json()

    if (!email || !businessName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isResendConfigured() || !resend) {
      console.log('Resend not configured, skipping payment received email')
      return NextResponse.json({ success: true, skipped: true })
    }

    const formattedAmount = `$${(amount / 100).toFixed(2)}`

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `💰 You received a payment of ${formattedAmount}!`,
      react: PaymentReceivedEmail({ 
        businessName,
        amount,
        customerEmail: customerEmail || 'Customer',
      }),
    })

    if (error) {
      console.error('Payment received email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Payment received email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
