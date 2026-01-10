import twilio from 'twilio'
import type { Twilio } from 'twilio'

// Lazy-loaded Twilio client to prevent build-time errors
let _twilioClient: Twilio | null = null

export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || ''

// Helper to check if Twilio is configured
export const isTwilioConfigured = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  
  return !!(
    accountSid &&
    accountSid.startsWith('AC') &&
    authToken &&
    messagingServiceSid
  )
}

// Get or create the Twilio client (lazy initialization)
export const getTwilioClient = (): Twilio | null => {
  if (_twilioClient) return _twilioClient
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  
  if (!accountSid || !authToken || !accountSid.startsWith('AC')) {
    return null
  }
  
  _twilioClient = twilio(accountSid, authToken)
  return _twilioClient
}

// Backwards compatibility - now returns null, use getTwilioClient() instead
export const twilioClient = null as Twilio | null
