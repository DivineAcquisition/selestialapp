import twilio from 'twilio'

// Lazy-load Twilio client to prevent build-time errors
let _twilioClient: ReturnType<typeof twilio> | null = null

export function getTwilioClient(): ReturnType<typeof twilio> | null {
  if (_twilioClient === null) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    
    if (accountSid && authToken && accountSid.startsWith('AC')) {
      _twilioClient = twilio(accountSid, authToken)
    }
  }
  return _twilioClient
}

// For backwards compatibility - deprecated, use getTwilioClient() instead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const twilioClient: any = new Proxy({}, {
  get(_target, prop) {
    const client = getTwilioClient()
    if (!client) return undefined
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || ''

// Helper to check if Twilio is configured
export const isTwilioConfigured = () => {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_MESSAGING_SERVICE_SID
  )
}
