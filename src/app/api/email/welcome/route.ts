import { NextRequest, NextResponse } from 'next/server'
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/email/resend'
import WelcomeEmail from '@/lib/email/templates/welcome'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    if (!isResendConfigured() || !resend) {
      console.log('Resend not configured, skipping welcome email')
      return NextResponse.json({ success: true, skipped: true })
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Welcome to Selestial! 🎉',
      react: WelcomeEmail({ name }),
    })

    if (error) {
      console.error('Welcome email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
