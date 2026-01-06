"use client"

import { useBusiness } from '@/contexts/BusinessContext'
import { getPlanLimits, getPlanName, canAccess, getLimit, isUnlimited, PlanLimits, PLANS, PlanId } from '@/lib/plans'

export function useFeatureGate() {
  const { business } = useBusiness()
  
  // Get plan from subscription_plan field, default to 'free' if trialing without a plan
  const subscriptionStatus = business?.subscription_status
  const subscriptionPlan = business?.subscription_plan
  
  // Determine effective plan
  let planId: PlanId = 'free'
  if (subscriptionPlan === 'growth' || subscriptionPlan === 'starter') {
    planId = subscriptionPlan
  } else if (subscriptionStatus === 'trialing') {
    planId = 'starter' // Trial users get starter features
  }
  
  const limits = getPlanLimits(planId)
  const planName = getPlanName(planId)

  const hasFeature = (feature: keyof PlanLimits): boolean => {
    return canAccess(planId, feature)
  }

  const getFeatureLimit = (feature: keyof PlanLimits): number => {
    return getLimit(planId, feature)
  }

  const isFeatureUnlimited = (feature: keyof PlanLimits): boolean => {
    return isUnlimited(planId, feature)
  }

  const requiresUpgrade = (feature: keyof PlanLimits): boolean => {
    return !hasFeature(feature) && planId !== 'growth'
  }

  const canUpgrade = (): boolean => {
    return planId !== 'growth'
  }

  const getUpgradePlan = () => {
    if (planId === 'growth') return null
    return PLANS.growth
  }

  const isTrialing = (): boolean => {
    return subscriptionStatus === 'trialing'
  }

  const isActive = (): boolean => {
    return subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
  }

  return {
    planId,
    planName,
    limits,
    hasFeature,
    getFeatureLimit,
    isFeatureUnlimited,
    requiresUpgrade,
    canUpgrade,
    getUpgradePlan,
    isTrialing,
    isActive,
  }
}
