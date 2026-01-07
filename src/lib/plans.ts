export const PLANS = {
  free: {
    name: 'Free Trial',
    limits: {
      quotesPerMonth: 10,
      smsPerMonth: 50,
      activeSequences: 1,
      stepsPerSequence: 3,
      teamMembers: 1,
      locations: 1,
      customFields: false,
      aiSmartReplies: false,
      aiToneCustomization: false,
      aiVoiceCalls: false,
      aiAutoResponse: false,
      aiSequenceBuilder: false,
      bulkCampaigns: false,
      advancedAnalytics: false,
      prioritySupport: false,
      paymentLinks: false,
      customDomain: false,
      whiteLabel: false,
      apiAccess: false,
      integrations: false,
      sso: false,
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
      locations: 1,
      customFields: false,
      aiSmartReplies: false,
      aiToneCustomization: false,
      aiVoiceCalls: false,
      aiAutoResponse: false,
      aiSequenceBuilder: false,
      bulkCampaigns: false,
      advancedAnalytics: false,
      prioritySupport: false,
      paymentLinks: false,
      customDomain: false,
      whiteLabel: false,
      apiAccess: false,
      integrations: false,
      sso: false,
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
      teamMembers: 3,
      locations: 1,
      customFields: true,
      aiSmartReplies: true,
      aiToneCustomization: true,
      aiVoiceCalls: false,
      aiAutoResponse: false,
      aiSequenceBuilder: true,
      bulkCampaigns: true,
      advancedAnalytics: false,
      prioritySupport: true,
      paymentLinks: true,
      customDomain: false,
      whiteLabel: false,
      apiAccess: false,
      integrations: true,
      sso: false,
    },
  },
  enterprise: {
    name: 'Selestial Enterprise',
    price: 497,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    limits: {
      quotesPerMonth: Infinity,
      smsPerMonth: Infinity,
      activeSequences: Infinity,
      stepsPerSequence: Infinity,
      teamMembers: Infinity,
      locations: Infinity,
      customFields: true,
      aiSmartReplies: true,
      aiToneCustomization: true,
      aiVoiceCalls: true,
      aiAutoResponse: true,
      aiSequenceBuilder: true,
      bulkCampaigns: true,
      advancedAnalytics: true,
      prioritySupport: true,
      paymentLinks: true,
      customDomain: true,
      whiteLabel: true,
      apiAccess: true,
      integrations: true,
      sso: true,
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

export function getPlanPrice(planId: PlanId | string | null | undefined): number {
  if (!planId) return 0
  const plan = PLANS[planId as PlanId]
  return 'price' in plan ? plan.price : 0
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
