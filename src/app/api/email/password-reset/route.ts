import { NextRequest, NextResponse } from 'next/server'
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/email/resend'
import PasswordResetEmail from '@/lib/email/templates/password-reset'

export async function POST(req: NextRequest) {
  try {
    const { email, resetLink } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!isResendConfigured() || !resend) {
      console.log('Resend not configured, skipping password reset email')
      return NextResponse.json({ success: true, skipped: true })
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Reset your Selestial password',
      react: PasswordResetEmail({ 
        resetLink: resetLink || `${process.env.NEXT_PUBLIC_APP_URL || 'https://selestial.io'}/reset-password` 
      }),
    })

    if (error) {
      console.error('Password reset email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Password reset email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
