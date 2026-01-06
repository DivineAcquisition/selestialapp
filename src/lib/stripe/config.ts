export const PLANS = {
  starter: {
    name: 'Starter',
    price: 97,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      '1 user',
      '500 SMS/month',
      '3 sequences',
      'Basic analytics',
      'Email support',
    ],
  },
  growth: {
    name: 'Growth',
    price: 197,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    features: [
      '3 users',
      '2,000 SMS/month',
      'Unlimited sequences',
      'AI smart replies',
      'Campaigns',
      'Priority support',
    ],
    popular: true,
  },
  scale: {
    name: 'Scale',
    price: 397,
    priceId: process.env.STRIPE_SCALE_PRICE_ID!,
    features: [
      'Unlimited users',
      '5,000 SMS/month',
      'Everything in Growth',
      'AI voice follow-up',
      'Advanced analytics',
      'Dedicated support',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
