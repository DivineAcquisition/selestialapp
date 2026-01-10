import Stripe from 'stripe'

// Lazy-load Stripe client to prevent build-time errors
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable')
    }
    
    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return _stripe
}

// Proxy for backwards compatibility - will throw at runtime if config is missing
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const stripeClient = getStripe()
    return (stripeClient as unknown as Record<string | symbol, unknown>)[prop]
  }
})
