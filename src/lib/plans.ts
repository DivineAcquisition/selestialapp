export const PLANS = {
  free: {
    name: 'Free Trial',
    limits: {
      quotesPerMonth: 10,
      smsPerMonth: 50,
      activeSequences: 1,
      stepsPerSequence: 3,
      teamMembers: 1,
      customFields: false,
      aiSmartReplies: false,
      aiToneCustomization: false,
      bulkCampaigns: false,
      advancedAnalytics: false,
      prioritySupport: false,
      paymentLinks: false,
    },
  },
  starter: {
    name: 'Selestial Start',
    price: 97,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter',
    limits: {
      quotesPerMonth: 100,
      smsPerMonth: 500,
      activeSequences: 5,
      stepsPerSequence: 5,
      teamMembers: 1,
      customFields: false,
      aiSmartReplies: false,
      aiToneCustomization: false,
      bulkCampaigns: false,
      advancedAnalytics: false,
      prioritySupport: false,
      paymentLinks: false,
    },
  },
  growth: {
    name: 'Selestial Growth',
    price: 197,
    priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID || 'price_growth',
    limits: {
      quotesPerMonth: Infinity,
      smsPerMonth: 2000,
      activeSequences: Infinity,
      stepsPerSequence: 10,
      teamMembers: 5,
      customFields: true,
      aiSmartReplies: true,
      aiToneCustomization: true,
      bulkCampaigns: true,
      advancedAnalytics: true,
      prioritySupport: true,
      paymentLinks: true,
    },
  },
} as const

export type PlanId = keyof typeof PLANS
export type PlanLimits = typeof PLANS[PlanId]['limits']

export function getPlanLimits(planId: PlanId | string | null | undefined): PlanLimits {
  if (!planId) return PLANS.free.limits
  return PLANS[planId as PlanId]?.limits || PLANS.free.limits
}

export function getPlanName(planId: PlanId | string | null | undefined): string {
  if (!planId) return PLANS.free.name
  return PLANS[planId as PlanId]?.name || PLANS.free.name
}

export function canAccess(planId: PlanId | string | null | undefined, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(planId)
  const value = limits[feature]
  
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  return false
}

export function getLimit(planId: PlanId | string | null | undefined, feature: keyof PlanLimits): number {
  const limits = getPlanLimits(planId)
  const value = limits[feature]
  
  if (typeof value === 'number') return value
  return 0
}

export function isUnlimited(planId: PlanId | string | null | undefined, feature: keyof PlanLimits): boolean {
  const limit = getLimit(planId, feature)
  return limit === Infinity
}
