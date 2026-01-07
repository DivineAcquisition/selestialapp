"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface WizardConfig {
  // Step 1: Business
  industry: string;
  zipCode: string;
  yearsInBusiness: "new" | "growing" | "established" | "expert";
  
  // Step 2: Operations
  teamSize: "solo" | "small" | "medium" | "large";
  avgJobDuration: number;
  jobsPerDay: number;
  
  // Step 3: Costs
  hourlyLaborCost: number;
  avgMaterialCost: number;
  monthlyOverhead: number;
  
  // Step 4: Goals
  targetMargin: number;
  monthlyRevenueGoal: number;
  pricingStrategy: "value" | "competitive" | "premium" | "penetration";
  
  // Meta
  completedAt?: string;
  lastUpdatedAt?: string;
}

export interface PricingInsight {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "selestial_pricing_wizard";

export const DEFAULT_CONFIG: WizardConfig = {
  industry: "",
  zipCode: "",
  yearsInBusiness: "growing",
  teamSize: "solo",
  avgJobDuration: 2,
  jobsPerDay: 3,
  hourlyLaborCost: 25,
  avgMaterialCost: 50,
  monthlyOverhead: 2000,
  targetMargin: 45,
  monthlyRevenueGoal: 10000,
  pricingStrategy: "competitive",
};

export const EXPERIENCE_LEVELS = [
  { value: "new", label: "New (< 1 year)", description: "Just getting started", multiplier: 0.85 },
  { value: "growing", label: "Growing (1-3 years)", description: "Building reputation", multiplier: 0.95 },
  { value: "established", label: "Established (3-7 years)", description: "Proven track record", multiplier: 1.0 },
  { value: "expert", label: "Expert (7+ years)", description: "Industry leader", multiplier: 1.15 },
] as const;

export const TEAM_SIZES = [
  { value: "solo", label: "Solo", description: "Just me", capacity: 1 },
  { value: "small", label: "Small (2-3)", description: "Small team", capacity: 2.5 },
  { value: "medium", label: "Medium (4-8)", description: "Growing team", capacity: 6 },
  { value: "large", label: "Large (9+)", description: "Full crew", capacity: 12 },
] as const;

export const PRICING_STRATEGIES = [
  { value: "penetration", label: "Entry/Penetration", description: "Lower prices to gain market share", icon: "trendDown" },
  { value: "value", label: "Value", description: "Balanced quality and price", icon: "scale" },
  { value: "competitive", label: "Competitive", description: "Match market rates", icon: "target" },
  { value: "premium", label: "Premium", description: "Higher prices, premium service", icon: "crown" },
] as const;

// ============================================================================
// CALCULATIONS
// ============================================================================

export function calculateHourlyRate(config: WizardConfig): number {
  if (config.targetMargin >= 100) return 0;
  const baseRate = config.hourlyLaborCost / (1 - config.targetMargin / 100);
  const experienceMultiplier = EXPERIENCE_LEVELS.find(e => e.value === config.yearsInBusiness)?.multiplier || 1;
  return baseRate * experienceMultiplier;
}

export function calculateJobPrice(config: WizardConfig): number {
  const hourlyRate = calculateHourlyRate(config);
  return hourlyRate * config.avgJobDuration + config.avgMaterialCost;
}

export function calculateInsights(config: WizardConfig): PricingInsight[] {
  const hourlyRate = calculateHourlyRate(config);
  const jobPrice = calculateJobPrice(config);
  const teamCapacity = TEAM_SIZES.find(t => t.value === config.teamSize)?.capacity || 1;
  const dailyRevenue = jobPrice * config.jobsPerDay * teamCapacity;
  const monthlyRevenue = dailyRevenue * 22;
  const profitPerJob = jobPrice * (config.targetMargin / 100);
  const breakEvenJobs = profitPerJob > 0 ? Math.ceil(config.monthlyOverhead / profitPerJob) : 0;

  return [
    {
      title: "Target Hourly Rate",
      value: `$${hourlyRate.toFixed(0)}/hr`,
      description: `To achieve ${config.targetMargin}% margin on $${config.hourlyLaborCost}/hr labor`,
      icon: "clock",
      color: "text-blue-600",
    },
    {
      title: "Average Job Price",
      value: `$${jobPrice.toFixed(0)}`,
      description: `${config.avgJobDuration}hr × $${hourlyRate.toFixed(0)}/hr + $${config.avgMaterialCost} materials`,
      icon: "receipt",
      color: "text-emerald-600",
    },
    {
      title: "Monthly Revenue Potential",
      value: `$${monthlyRevenue.toLocaleString()}`,
      description: `${config.jobsPerDay} jobs × ${teamCapacity} workers × 22 days`,
      icon: "trendUp",
      color: "text-purple-600",
    },
    {
      title: "Break-Even Jobs",
      value: `${breakEvenJobs} jobs/mo`,
      description: `Minimum to cover $${config.monthlyOverhead.toLocaleString()} overhead`,
      icon: "scale",
      color: "text-amber-600",
    },
    {
      title: "Profit Per Job",
      value: `$${profitPerJob.toFixed(0)}`,
      description: `At ${config.targetMargin}% margin`,
      icon: "dollarSign",
      color: "text-emerald-600",
    },
    {
      title: "Goal Achievement",
      value: monthlyRevenue >= config.monthlyRevenueGoal ? "On Track ✓" : `${((monthlyRevenue / config.monthlyRevenueGoal) * 100).toFixed(0)}%`,
      description: monthlyRevenue >= config.monthlyRevenueGoal 
        ? "Your capacity exceeds your goal!" 
        : `Need ${Math.ceil((config.monthlyRevenueGoal - monthlyRevenue) / jobPrice)} more jobs/month`,
      icon: monthlyRevenue >= config.monthlyRevenueGoal ? "checkCircle" : "alertCircle",
      color: monthlyRevenue >= config.monthlyRevenueGoal ? "text-emerald-600" : "text-amber-600",
    },
  ];
}

// ============================================================================
// HELPERS
// ============================================================================

function getInitialConfig(): WizardConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.wizard || DEFAULT_CONFIG;
    } catch {
      console.warn("Failed to parse pricing wizard config");
    }
  }
  return DEFAULT_CONFIG;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePricingWizard() {
  const [config, setConfig] = useState<WizardConfig>(getInitialConfig);
  const [isLoaded] = useState(typeof window !== "undefined");

  // Save to localStorage when config changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      let existing = { wizard: config, region: "Baseline", rules: [], retentionPlan: null };
      if (stored) {
        try {
          existing = JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, wizard: config }));
    }
  }, [config, isLoaded]);

  const updateConfig = useCallback((updates: Partial<WizardConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates,
      lastUpdatedAt: new Date().toISOString(),
    }));
  }, []);

  const resetWizard = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const isConfigured = Boolean(config.completedAt && config.industry);

  const hourlyRate = useMemo(() => calculateHourlyRate(config), [config]);
  const jobPrice = useMemo(() => calculateJobPrice(config), [config]);
  const insights = useMemo(() => calculateInsights(config), [config]);

  return {
    config,
    updateConfig,
    resetWizard,
    isLoaded,
    isConfigured,
    hourlyRate,
    jobPrice,
    insights,
  };
}
