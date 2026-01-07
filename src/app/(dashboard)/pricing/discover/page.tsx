"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon, IconName } from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { INDUSTRIES } from "@/lib/pricing/pricing-data";

// ============================================================================
// TYPES
// ============================================================================

interface WizardAnswers {
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
}

interface PricingRecommendation {
  serviceName: string;
  recommendedPrice: number;
  priceRange: { min: number; max: number };
  marketPosition: "below" | "competitive" | "premium";
  reasoning: string;
  margin: number;
}

interface Insight {
  title: string;
  value: string;
  description: string;
  icon: IconName;
  color: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = [
  { id: 1, title: "Your Business", icon: "building" as IconName },
  { id: 2, title: "Operations", icon: "users" as IconName },
  { id: 3, title: "Your Costs", icon: "dollar" as IconName },
  { id: 4, title: "Your Goals", icon: "target" as IconName },
  { id: 5, title: "Your Prices", icon: "sparkles" as IconName },
];

const EXPERIENCE_LEVELS = [
  { value: "new", label: "New (< 1 year)", description: "Just getting started", multiplier: 0.85 },
  { value: "growing", label: "Growing (1-3 years)", description: "Building reputation", multiplier: 0.95 },
  { value: "established", label: "Established (3-7 years)", description: "Proven track record", multiplier: 1.0 },
  { value: "expert", label: "Expert (7+ years)", description: "Industry leader", multiplier: 1.15 },
];

const TEAM_SIZES = [
  { value: "solo", label: "Solo", description: "Just me", capacity: 1 },
  { value: "small", label: "Small (2-3)", description: "Small team", capacity: 2.5 },
  { value: "medium", label: "Medium (4-8)", description: "Growing team", capacity: 6 },
  { value: "large", label: "Large (9+)", description: "Full crew", capacity: 12 },
];

const PRICING_STRATEGIES = [
  { value: "penetration", label: "Entry/Penetration", description: "Lower prices to gain market share", icon: "trendDown" as IconName },
  { value: "value", label: "Value", description: "Balanced quality and price", icon: "scale" as IconName },
  { value: "competitive", label: "Competitive", description: "Match market rates", icon: "target" as IconName },
  { value: "premium", label: "Premium", description: "Higher prices, premium service", icon: "crown" as IconName },
];

const INDUSTRY_ICONS: Record<string, IconName> = {
  cleaning: "sparkles",
  hvac: "thermometer",
  plumbing: "wrench",
  electrical: "bolt",
  landscaping: "leaf",
  pest_control: "bug",
  roofing: "home",
  painting: "paintBrush",
  handyman: "hammer",
  pressure_washing: "droplet",
  pool_spa: "waves",
};

const DEFAULT_ANSWERS: WizardAnswers = {
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateHourlyRate(answers: WizardAnswers): number {
  const baseRate = answers.hourlyLaborCost / (1 - answers.targetMargin / 100);
  const experienceMultiplier = EXPERIENCE_LEVELS.find(e => e.value === answers.yearsInBusiness)?.multiplier || 1;
  return baseRate * experienceMultiplier;
}

function calculateJobPrice(answers: WizardAnswers): number {
  const hourlyRate = calculateHourlyRate(answers);
  return hourlyRate * answers.avgJobDuration + answers.avgMaterialCost;
}

function calculateInsights(answers: WizardAnswers): Insight[] {
  const hourlyRate = calculateHourlyRate(answers);
  const jobPrice = calculateJobPrice(answers);
  const teamCapacity = TEAM_SIZES.find(t => t.value === answers.teamSize)?.capacity || 1;
  const dailyRevenue = jobPrice * answers.jobsPerDay * teamCapacity;
  const monthlyRevenue = dailyRevenue * 22;
  const profitPerJob = jobPrice * (answers.targetMargin / 100);
  const breakEvenJobs = Math.ceil(answers.monthlyOverhead / profitPerJob);

  return [
    {
      title: "Target Hourly Rate",
      value: `$${hourlyRate.toFixed(0)}/hr`,
      description: `To achieve ${answers.targetMargin}% margin on $${answers.hourlyLaborCost}/hr labor`,
      icon: "clock",
      color: "text-blue-600",
    },
    {
      title: "Average Job Price",
      value: `$${jobPrice.toFixed(0)}`,
      description: `${answers.avgJobDuration}hr × $${hourlyRate.toFixed(0)}/hr + $${answers.avgMaterialCost} materials`,
      icon: "receipt",
      color: "text-emerald-600",
    },
    {
      title: "Monthly Revenue Potential",
      value: `$${monthlyRevenue.toLocaleString()}`,
      description: `${answers.jobsPerDay} jobs × ${teamCapacity} workers × 22 days`,
      icon: "trendUp",
      color: "text-purple-600",
    },
    {
      title: "Break-Even Jobs",
      value: `${breakEvenJobs} jobs/mo`,
      description: `Minimum to cover $${answers.monthlyOverhead.toLocaleString()} overhead`,
      icon: "scale",
      color: "text-amber-600",
    },
    {
      title: "Profit Per Job",
      value: `$${profitPerJob.toFixed(0)}`,
      description: `At ${answers.targetMargin}% margin`,
      icon: "dollarSign",
      color: "text-emerald-600",
    },
    {
      title: "Goal Achievement",
      value: monthlyRevenue >= answers.monthlyRevenueGoal ? "On Track ✓" : `${((monthlyRevenue / answers.monthlyRevenueGoal) * 100).toFixed(0)}%`,
      description: monthlyRevenue >= answers.monthlyRevenueGoal 
        ? "Your capacity exceeds your goal!" 
        : `Need ${Math.ceil((answers.monthlyRevenueGoal - monthlyRevenue) / jobPrice)} more jobs/month`,
      icon: monthlyRevenue >= answers.monthlyRevenueGoal ? "checkCircle" : "alertCircle",
      color: monthlyRevenue >= answers.monthlyRevenueGoal ? "text-emerald-600" : "text-amber-600",
    },
  ];
}

function generateServiceRecommendations(answers: WizardAnswers): PricingRecommendation[] {
  const hourlyRate = calculateHourlyRate(answers);
  const industry = INDUSTRIES.find(i => i.slug === answers.industry);
  
  if (!industry) return [];

  const strategyMultiplier = {
    penetration: 0.85,
    value: 0.95,
    competitive: 1.0,
    premium: 1.15,
  }[answers.pricingStrategy];

  return industry.services.slice(0, 8).map(service => {
    const basePrice = service.avgPrice * strategyMultiplier;
    const calculatedPrice = service.pricingUnit === "flat" || service.pricingUnit === "hour"
      ? Math.max(basePrice, hourlyRate * (service.laborHours?.low || 1) + (service.materialCost?.low || 0))
      : basePrice;
    
    const recommendedPrice = Math.round(calculatedPrice);
    const margin = ((recommendedPrice - (answers.hourlyLaborCost * (service.laborHours?.low || 1))) / recommendedPrice) * 100;
    
    let marketPosition: "below" | "competitive" | "premium" = "competitive";
    if (recommendedPrice < service.lowPrice) marketPosition = "below";
    else if (recommendedPrice > service.highPrice * 0.9) marketPosition = "premium";

    return {
      serviceName: service.name,
      recommendedPrice,
      priceRange: { min: service.lowPrice, max: service.highPrice },
      marketPosition,
      reasoning: getReasoningForService(service, answers),
      margin: Math.max(0, Math.min(100, margin)),
    };
  });
}

function getReasoningForService(service: { name: string; category: string }, answers: WizardAnswers): string {
  const strategy = answers.pricingStrategy;
  const experience = answers.yearsInBusiness;
  
  if (strategy === "premium" && experience === "expert") {
    return "Premium pricing justified by your expertise and track record";
  }
  if (strategy === "penetration") {
    return "Entry pricing to build customer base and reviews";
  }
  if (service.category === "Installation") {
    return "Higher margin service - focus on quality and warranty";
  }
  if (service.category === "Maintenance") {
    return "Recurring revenue opportunity - price for retention";
  }
  return "Competitive pricing based on market rates and your costs";
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function StepBusiness({
  answers,
  onChange,
}: {
  answers: WizardAnswers;
  onChange: (updates: Partial<WizardAnswers>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Tell us about your business</h2>
        <p className="text-muted-foreground">We'll use this to find relevant market data</p>
      </div>

      {/* Industry Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">What industry are you in?</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INDUSTRIES.slice(0, 12).map((industry) => {
            const isSelected = answers.industry === industry.slug;
            const iconName = INDUSTRY_ICONS[industry.slug] || "briefcase";
            
            return (
              <button
                key={industry.slug}
                onClick={() => onChange({ industry: industry.slug })}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}>
                  <Icon name={iconName} size="lg" className={isSelected ? "text-primary" : "text-muted-foreground"} />
                </div>
                <span className={cn("text-sm font-medium", isSelected && "text-primary")}>
                  {industry.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ZIP Code */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Your ZIP code</label>
        <Input
          type="text"
          placeholder="Enter ZIP code"
          value={answers.zipCode}
          onChange={(e) => onChange({ zipCode: e.target.value.slice(0, 5) })}
          className="max-w-xs"
          maxLength={5}
        />
        <p className="text-xs text-muted-foreground">Used to find local market rates</p>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium">How long have you been in business?</label>
        <div className="grid grid-cols-2 gap-3">
          {EXPERIENCE_LEVELS.map((level) => {
            const isSelected = answers.yearsInBusiness === level.value;
            return (
              <button
                key={level.value}
                onClick={() => onChange({ yearsInBusiness: level.value as WizardAnswers["yearsInBusiness"] })}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <p className={cn("font-medium", isSelected && "text-primary")}>{level.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepOperations({
  answers,
  onChange,
}: {
  answers: WizardAnswers;
  onChange: (updates: Partial<WizardAnswers>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Your operations</h2>
        <p className="text-muted-foreground">Help us understand your capacity</p>
      </div>

      {/* Team Size */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Team size</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEAM_SIZES.map((size) => {
            const isSelected = answers.teamSize === size.value;
            return (
              <button
                key={size.value}
                onClick={() => onChange({ teamSize: size.value as WizardAnswers["teamSize"] })}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <p className={cn("font-medium", isSelected && "text-primary")}>{size.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{size.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Average Job Duration */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Average job duration</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0.5}
            max={8}
            step={0.5}
            value={answers.avgJobDuration}
            onChange={(e) => onChange({ avgJobDuration: Number(e.target.value) })}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="w-24 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">{answers.avgJobDuration} hrs</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Quick jobs (30 min)</span>
          <span>Full day (8 hrs)</span>
        </div>
      </div>

      {/* Jobs Per Day */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Jobs per day (per worker)</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={answers.jobsPerDay}
            onChange={(e) => onChange({ jobsPerDay: Number(e.target.value) })}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="w-24 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">{answers.jobsPerDay} jobs</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 job/day</span>
          <span>10 jobs/day</span>
        </div>
      </div>
    </div>
  );
}

function StepCosts({
  answers,
  onChange,
}: {
  answers: WizardAnswers;
  onChange: (updates: Partial<WizardAnswers>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Your costs</h2>
        <p className="text-muted-foreground">Understanding your costs is key to profitable pricing</p>
      </div>

      {/* Hourly Labor Cost */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Hourly labor cost</label>
        <p className="text-xs text-muted-foreground">What you pay yourself or your team per hour</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={15}
            max={75}
            step={5}
            value={answers.hourlyLaborCost}
            onChange={(e) => onChange({ hourlyLaborCost: Number(e.target.value) })}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="w-28 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">${answers.hourlyLaborCost}/hr</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$15/hr</span>
          <span>$75/hr</span>
        </div>
      </div>

      {/* Average Material Cost */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Average material cost per job</label>
        <p className="text-xs text-muted-foreground">Supplies, parts, or materials used</p>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            type="number"
            value={answers.avgMaterialCost || ""}
            onChange={(e) => onChange({ avgMaterialCost: Number(e.target.value) || 0 })}
            className="pl-7"
            placeholder="50"
            min={0}
          />
        </div>
      </div>

      {/* Monthly Overhead */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Monthly overhead</label>
        <p className="text-xs text-muted-foreground">Rent, insurance, marketing, subscriptions, etc.</p>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            type="number"
            value={answers.monthlyOverhead || ""}
            onChange={(e) => onChange({ monthlyOverhead: Number(e.target.value) || 0 })}
            className="pl-7"
            placeholder="2000"
            min={0}
          />
        </div>
      </div>

      {/* Cost Summary */}
      <Card className="p-4 bg-muted/50">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Icon name="calculator" size="sm" className="text-primary" />
          Cost Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Labor per job ({answers.avgJobDuration} hrs)</span>
            <span className="font-medium">${(answers.hourlyLaborCost * answers.avgJobDuration).toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Materials per job</span>
            <span className="font-medium">${answers.avgMaterialCost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overhead per job (est.)</span>
            <span className="font-medium">${(answers.monthlyOverhead / (answers.jobsPerDay * 22)).toFixed(0)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>Total cost per job</span>
            <span className="text-primary">
              ${(answers.hourlyLaborCost * answers.avgJobDuration + answers.avgMaterialCost + answers.monthlyOverhead / (answers.jobsPerDay * 22)).toFixed(0)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepGoals({
  answers,
  onChange,
}: {
  answers: WizardAnswers;
  onChange: (updates: Partial<WizardAnswers>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Your goals</h2>
        <p className="text-muted-foreground">What do you want to achieve?</p>
      </div>

      {/* Target Margin */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Target profit margin</label>
        <p className="text-xs text-muted-foreground">
          Industry average is 35-50%. Higher margins require premium positioning.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={20}
            max={70}
            step={5}
            value={answers.targetMargin}
            onChange={(e) => onChange({ targetMargin: Number(e.target.value) })}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="w-20 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">{answers.targetMargin}%</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low (20%)</span>
          <span>High (70%)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="secondary" className={cn(
            answers.targetMargin < 30 ? "bg-amber-100 text-amber-700" :
            answers.targetMargin > 55 ? "bg-purple-100 text-purple-700" :
            "bg-emerald-100 text-emerald-700"
          )}>
            {answers.targetMargin < 30 ? "Value Pricing" :
             answers.targetMargin > 55 ? "Premium Pricing" :
             "Competitive Pricing"}
          </Badge>
        </div>
      </div>

      {/* Monthly Revenue Goal */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Monthly revenue goal</label>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            type="number"
            value={answers.monthlyRevenueGoal || ""}
            onChange={(e) => onChange({ monthlyRevenueGoal: Number(e.target.value) || 0 })}
            className="pl-7"
            placeholder="10000"
            min={0}
            step={1000}
          />
        </div>
      </div>

      {/* Pricing Strategy */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Pricing strategy</label>
        <div className="grid grid-cols-2 gap-3">
          {PRICING_STRATEGIES.map((strategy) => {
            const isSelected = answers.pricingStrategy === strategy.value;
            return (
              <button
                key={strategy.value}
                onClick={() => onChange({ pricingStrategy: strategy.value as WizardAnswers["pricingStrategy"] })}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={strategy.icon} size="sm" className={isSelected ? "text-primary" : "text-muted-foreground"} />
                  <p className={cn("font-medium", isSelected && "text-primary")}>{strategy.label}</p>
                </div>
                <p className="text-xs text-muted-foreground">{strategy.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepResults({
  answers,
  insights,
  recommendations,
  onApplyToPriceBuilder,
}: {
  answers: WizardAnswers;
  insights: Insight[];
  recommendations: PricingRecommendation[];
  onApplyToPriceBuilder: () => void;
}) {
  const industry = INDUSTRIES.find(i => i.slug === answers.industry);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Your pricing recommendations</h2>
        <p className="text-muted-foreground">
          Based on your costs, goals, and {industry?.name || "industry"} market data
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {insights.slice(0, 6).map((insight, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={insight.icon} size="sm" className={insight.color} />
              <span className="text-xs text-muted-foreground">{insight.title}</span>
            </div>
            <p className="text-xl font-bold">{insight.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
          </Card>
        ))}
      </div>

      {/* Service Recommendations */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="tag" size="sm" className="text-primary" />
          Recommended Service Prices
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{rec.serviceName}</h4>
                    <Badge variant="secondary" className={cn(
                      "text-xs",
                      rec.marketPosition === "below" && "bg-amber-100 text-amber-700",
                      rec.marketPosition === "competitive" && "bg-emerald-100 text-emerald-700",
                      rec.marketPosition === "premium" && "bg-purple-100 text-purple-700"
                    )}>
                      {rec.marketPosition}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{rec.reasoning}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">${rec.recommendedPrice}</p>
                  <p className="text-xs text-muted-foreground">
                    Range: ${rec.priceRange.min} - ${rec.priceRange.max}
                  </p>
                </div>
              </div>
              
              {/* Price position indicator */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((rec.recommendedPrice - rec.priceRange.min) / (rec.priceRange.max - rec.priceRange.min)) * 100))}%` 
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-emerald-600 w-16 text-right">
                  {rec.margin.toFixed(0)}% margin
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Apply CTA */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-[#9D96FF]/10 border-primary/20">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold text-lg">Ready to use these prices?</h3>
            <p className="text-sm text-muted-foreground">
              Apply these recommendations to your Price Builder to start using them
            </p>
          </div>
          <Button 
            onClick={onApplyToPriceBuilder}
            className="gap-2 bg-gradient-to-r from-primary to-[#9D96FF] whitespace-nowrap"
            size="lg"
          >
            <Icon name="arrowRight" size="sm" />
            Apply to Price Builder
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PricingDiscoveryPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<WizardAnswers>(DEFAULT_ANSWERS);

  const updateAnswers = useCallback((updates: Partial<WizardAnswers>) => {
    setAnswers(prev => ({ ...prev, ...updates }));
  }, []);

  const insights = useMemo(() => calculateInsights(answers), [answers]);
  const recommendations = useMemo(() => generateServiceRecommendations(answers), [answers]);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return answers.industry !== "" && answers.zipCode.length === 5;
      case 2:
        return true;
      case 3:
        return answers.hourlyLaborCost > 0;
      case 4:
        return answers.monthlyRevenueGoal > 0;
      default:
        return true;
    }
  }, [currentStep, answers]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleApplyToPriceBuilder = () => {
    // Encode the config to pass to price builder
    const config = {
      industry: answers.industry,
      services: recommendations.map(rec => ({
        name: rec.serviceName,
        price: rec.recommendedPrice,
      })),
    };
    
    toast({
      title: "Recommendations saved!",
      description: "Redirecting to Price Builder...",
    });
    
    // Store in sessionStorage for the price builder to pick up
    sessionStorage.setItem("pricingDiscoveryConfig", JSON.stringify(config));
    
    router.push("/pricing");
  };

  const progressPercent = (currentStep / 5) * 100;

  return (
    <Layout title="Pricing Discovery">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl">
              <Icon name="sparkles" size="lg" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pricing Discovery Wizard</h1>
              <p className="text-muted-foreground">Discover what to charge in 5 easy steps</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    currentStep > step.id
                      ? "bg-primary text-white"
                      : currentStep === step.id
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {currentStep > step.id ? (
                      <Icon name="check" size="sm" />
                    ) : (
                      <Icon name={step.icon} size="sm" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1.5 hidden sm:block",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressPercent} className="h-1" />
        </div>

        {/* Step Content */}
        <Card className="p-6 sm:p-8 rounded-2xl">
          {currentStep === 1 && (
            <StepBusiness answers={answers} onChange={updateAnswers} />
          )}
          {currentStep === 2 && (
            <StepOperations answers={answers} onChange={updateAnswers} />
          )}
          {currentStep === 3 && (
            <StepCosts answers={answers} onChange={updateAnswers} />
          )}
          {currentStep === 4 && (
            <StepGoals answers={answers} onChange={updateAnswers} />
          )}
          {currentStep === 5 && (
            <StepResults
              answers={answers}
              insights={insights}
              recommendations={recommendations}
              onApplyToPriceBuilder={handleApplyToPriceBuilder}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <Icon name="arrowLeft" size="sm" />
              Back
            </Button>
            
            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="gap-2 bg-gradient-to-r from-primary to-[#9D96FF]"
              >
                Continue
                <Icon name="arrowRight" size="sm" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push("/pricing")}
                className="gap-2"
              >
                Skip to Price Builder
                <Icon name="arrowRight" size="sm" />
              </Button>
            )}
          </div>
        </Card>

        {/* Tip */}
        {currentStep < 5 && (
          <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <Icon name="lightbulb" size="sm" className="text-amber-500 mt-0.5 shrink-0" />
            <p>
              {currentStep === 1 && "Select your industry to get relevant pricing data and service recommendations."}
              {currentStep === 2 && "Your team size and job capacity help us calculate realistic revenue potential."}
              {currentStep === 3 && "Accurate cost data is essential for profitable pricing. Include all your expenses."}
              {currentStep === 4 && "Your target margin determines your minimum prices. Higher margins require premium positioning."}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
