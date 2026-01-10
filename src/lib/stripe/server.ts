import Stripe from 'stripe'

let _stripe: Stripe | null = null

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      const secretKey = process.env.STRIPE_SECRET_KEY
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not configured')
      }
      _stripe = new Stripe(secretKey, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
      })
    }
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop]
  }
})
