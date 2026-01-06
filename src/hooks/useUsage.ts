"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useBusiness } from '@/contexts/BusinessContext'
import { useFeatureGate } from '@/hooks/useFeatureGate'

interface Usage {
  quotesThisMonth: number
  smsThisMonth: number
  activeSequences: number
  teamMembers: number
}

export function useUsage() {
  const { business } = useBusiness()
  const { getFeatureLimit, isFeatureUnlimited } = useFeatureGate()
  const [usage, setUsage] = useState<Usage>({
    quotesThisMonth: 0,
    smsThisMonth: 0,
    activeSequences: 0,
    teamMembers: 1,
  })
  const [loading, setLoading] = useState(true)

  const fetchUsage = useCallback(async () => {
    if (!business) {
      setLoading(false)
      return
    }

    try {
      // Get start of current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Fetch all counts in parallel
      const [quotesResult, smsResult, sequencesResult] = await Promise.all([
        // Quotes this month
        supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .gte('created_at', startOfMonth.toISOString()),
        
        // Outbound SMS this month
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .eq('direction', 'outbound')
          .gte('created_at', startOfMonth.toISOString()),
        
        // Active sequences
        supabase
          .from('sequences')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .eq('is_active', true),
      ])

      setUsage({
        quotesThisMonth: quotesResult.count || 0,
        smsThisMonth: smsResult.count || 0,
        activeSequences: sequencesResult.count || 0,
        teamMembers: 1, // Owner only for now
      })
    } catch (error) {
      console.error('Usage fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [business])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  // Check if user can perform action
  const canAddQuote = (): boolean => {
    if (isFeatureUnlimited('quotesPerMonth')) return true
    const limit = getFeatureLimit('quotesPerMonth')
    return usage.quotesThisMonth < limit
  }

  const canSendSMS = (): boolean => {
    if (isFeatureUnlimited('smsPerMonth')) return true
    const limit = getFeatureLimit('smsPerMonth')
    return usage.smsThisMonth < limit
  }

  const canCreateSequence = (): boolean => {
    if (isFeatureUnlimited('activeSequences')) return true
    const limit = getFeatureLimit('activeSequences')
    return usage.activeSequences < limit
  }

  const canAddTeamMember = (): boolean => {
    const limit = getFeatureLimit('teamMembers')
    return usage.teamMembers < limit
  }

  // Get remaining quota
  const getRemainingQuota = (feature: 'quotesPerMonth' | 'smsPerMonth' | 'activeSequences' | 'teamMembers'): number => {
    if (isFeatureUnlimited(feature)) return Infinity
    
    const limit = getFeatureLimit(feature)
    const used = {
      quotesPerMonth: usage.quotesThisMonth,
      smsPerMonth: usage.smsThisMonth,
      activeSequences: usage.activeSequences,
      teamMembers: usage.teamMembers,
    }[feature]

    return Math.max(0, limit - used)
  }

  // Get usage percentage
  const getUsagePercentage = (feature: 'quotesPerMonth' | 'smsPerMonth' | 'activeSequences' | 'teamMembers'): number => {
    if (isFeatureUnlimited(feature)) return 0
    
    const limit = getFeatureLimit(feature)
    if (limit === 0) return 100
    
    const used = {
      quotesPerMonth: usage.quotesThisMonth,
      smsPerMonth: usage.smsThisMonth,
      activeSequences: usage.activeSequences,
      teamMembers: usage.teamMembers,
    }[feature]

    return Math.min(100, (used / limit) * 100)
  }

  return {
    usage,
    loading,
    refetch: fetchUsage,
    canAddQuote,
    canSendSMS,
    canCreateSequence,
    canAddTeamMember,
    getRemainingQuota,
    getUsagePercentage,
  }
}
