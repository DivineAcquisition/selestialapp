import { Resend } from 'resend'

// Initialize Resend client (only on server-side)
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const EMAIL_FROM = 'Selestial <hello@selestial.io>'

// Check if Resend is configured
export const isResendConfigured = () => {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_xxx'
}
