"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon, IconName } from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { INDUSTRIES } from "@/lib/pricing/pricing-data";
import {
  usePricingWizard,
  EXPERIENCE_LEVELS,
  TEAM_SIZES,
  PRICING_STRATEGIES,
  type WizardConfig,
  type ServiceRecommendation,
} from "@/hooks/usePricingWizard";
import { useState } from "react";

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = [
  { id: 1, title: "Business", icon: "building" as IconName, description: "Industry & experience" },
  { id: 2, title: "Operations", icon: "users" as IconName, description: "Team & capacity" },
  { id: 3, title: "Costs", icon: "dollar" as IconName, description: "Labor & overhead" },
  { id: 4, title: "Goals", icon: "target" as IconName, description: "Margin & revenue" },
  { id: 5, title: "Results", icon: "sparkles" as IconName, description: "Your pricing" },
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateServiceRecommendations(config: WizardConfig, hourlyRate: number): ServiceRecommendation[] {
  const industry = INDUSTRIES.find(i => i.slug === config.industry);
  
  if (!industry) return [];

  const strategyMultiplier = {
    penetration: 0.85,
    value: 0.95,
    competitive: 1.0,
    premium: 1.15,
  }[config.pricingStrategy];

  return industry.services.slice(0, 8).map(service => {
    const basePrice = service.avgPrice * strategyMultiplier;
    const calculatedPrice = service.pricingUnit === "flat" || service.pricingUnit === "hour"
      ? Math.max(basePrice, hourlyRate * (service.laborHours?.low || 1) + (service.materialCost?.low || 0))
      : basePrice;
    
    const recommendedPrice = Math.round(calculatedPrice);
    const margin = ((recommendedPrice - (config.hourlyLaborCost * (service.laborHours?.low || 1))) / recommendedPrice) * 100;
    
    let marketPosition: "below" | "competitive" | "premium" = "competitive";
    if (recommendedPrice < service.lowPrice) marketPosition = "below";
    else if (recommendedPrice > service.highPrice * 0.9) marketPosition = "premium";

    return {
      serviceName: service.name,
      recommendedPrice,
      priceRange: { min: service.lowPrice, max: service.highPrice },
      marketPosition,
      reasoning: getReasoningForService(service, config),
      margin: Math.max(0, Math.min(100, margin)),
    };
  });
}

function getReasoningForService(service: { name: string; category: string }, config: WizardConfig): string {
  const strategy = config.pricingStrategy;
  const experience = config.yearsInBusiness;
  
  if (strategy === "premium" && experience === "expert") {
    return "Premium pricing justified by your expertise";
  }
  if (strategy === "penetration") {
    return "Entry pricing to build customer base";
  }
  if (service.category === "Installation") {
    return "High-ticket service - focus on value";
  }
  if (service.category === "Maintenance") {
    return "Recurring revenue opportunity";
  }
  return "Competitive market-rate pricing";
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function StepBusiness({
  config,
  onChange,
}: {
  config: WizardConfig;
  onChange: (updates: Partial<WizardConfig>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Tell us about your business</h2>
        <p className="text-muted-foreground">We&apos;ll use this to find relevant market data</p>
      </div>

      {/* Industry Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">What industry are you in? *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INDUSTRIES.slice(0, 12).map((industry) => {
            const isSelected = config.industry === industry.slug;
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
        <label className="text-sm font-medium">Your ZIP code *</label>
        <Input
          type="text"
          placeholder="Enter ZIP code"
          value={config.zipCode}
          onChange={(e) => onChange({ zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
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
            const isSelected = config.yearsInBusiness === level.value;
            return (
              <button
                key={level.value}
                onClick={() => onChange({ yearsInBusiness: level.value as WizardConfig["yearsInBusiness"] })}
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
  config,
  onChange,
}: {
  config: WizardConfig;
  onChange: (updates: Partial<WizardConfig>) => void;
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
            const isSelected = config.teamSize === size.value;
            return (
              <button
                key={size.value}
                onClick={() => onChange({ teamSize: size.value as WizardConfig["teamSize"] })}
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
            value={config.avgJobDuration}
            onChange={(e) => onChange({ avgJobDuration: Number(e.target.value) })}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="w-24 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">{config.avgJobDuration} hrs</span>
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
            value={config.jobsPerDay}
            onChange={(e) => onChange({ jobsPerDay: Number(e.target.value) })}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="w-24 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">{config.jobsPerDay} jobs</span>
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
  config,
  onChange,
}: {
  config: WizardConfig;
  onChange: (updates: Partial<WizardConfig>) => void;
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
            value={config.hourlyLaborCost}
            onChange={(e) => onChange({ hourlyLaborCost: Number(e.target.value) })}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="w-28 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">${config.hourlyLaborCost}/hr</span>
          </div>
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
            value={config.avgMaterialCost || ""}
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
            value={config.monthlyOverhead || ""}
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
            <span className="text-muted-foreground">Labor per job ({config.avgJobDuration} hrs)</span>
            <span className="font-medium">${(config.hourlyLaborCost * config.avgJobDuration).toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Materials per job</span>
            <span className="font-medium">${config.avgMaterialCost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overhead per job (est.)</span>
            <span className="font-medium">${(config.monthlyOverhead / (config.jobsPerDay * 22)).toFixed(0)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>Total cost per job</span>
            <span className="text-primary">
              ${(config.hourlyLaborCost * config.avgJobDuration + config.avgMaterialCost + config.monthlyOverhead / (config.jobsPerDay * 22)).toFixed(0)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepGoals({
  config,
  onChange,
}: {
  config: WizardConfig;
  onChange: (updates: Partial<WizardConfig>) => void;
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
            value={config.targetMargin}
            onChange={(e) => onChange({ targetMargin: Number(e.target.value) })}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="w-20 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">{config.targetMargin}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="secondary" className={cn(
            config.targetMargin < 30 ? "bg-amber-100 text-amber-700" :
            config.targetMargin > 55 ? "bg-purple-100 text-purple-700" :
            "bg-emerald-100 text-emerald-700"
          )}>
            {config.targetMargin < 30 ? "Value Pricing" :
             config.targetMargin > 55 ? "Premium Pricing" :
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
            value={config.monthlyRevenueGoal || ""}
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
            const isSelected = config.pricingStrategy === strategy.value;
            return (
              <button
                key={strategy.value}
                onClick={() => onChange({ pricingStrategy: strategy.value as WizardConfig["pricingStrategy"] })}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={strategy.icon as IconName} size="sm" className={isSelected ? "text-primary" : "text-muted-foreground"} />
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
  config,
  insights,
  recommendations,
  onApplyToPriceBuilder,
  onEdit,
}: {
  config: WizardConfig;
  insights: { title: string; value: string; description: string; icon: string; color: string }[];
  recommendations: ServiceRecommendation[];
  onApplyToPriceBuilder: () => void;
  onEdit: (step: number) => void;
}) {
  const industry = INDUSTRIES.find(i => i.slug === config.industry);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Your pricing recommendations</h2>
          <p className="text-muted-foreground">
            Based on your costs, goals, and {industry?.name || "industry"} market data
          </p>
        </div>
      </div>

      {/* Quick Edit Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onEdit(1)}
          className="p-3 rounded-xl border hover:border-primary/50 hover:bg-primary/5 text-left transition-all"
        >
          <p className="text-xs text-muted-foreground">Industry</p>
          <p className="font-medium text-sm truncate">{industry?.name || "Not set"}</p>
        </button>
        <button
          onClick={() => onEdit(3)}
          className="p-3 rounded-xl border hover:border-primary/50 hover:bg-primary/5 text-left transition-all"
        >
          <p className="text-xs text-muted-foreground">Labor Cost</p>
          <p className="font-medium text-sm">${config.hourlyLaborCost}/hr</p>
        </button>
        <button
          onClick={() => onEdit(4)}
          className="p-3 rounded-xl border hover:border-primary/50 hover:bg-primary/5 text-left transition-all"
        >
          <p className="text-xs text-muted-foreground">Target Margin</p>
          <p className="font-medium text-sm">{config.targetMargin}%</p>
        </button>
        <button
          onClick={() => onEdit(4)}
          className="p-3 rounded-xl border hover:border-primary/50 hover:bg-primary/5 text-left transition-all"
        >
          <p className="text-xs text-muted-foreground">Strategy</p>
          <p className="font-medium text-sm capitalize">{config.pricingStrategy}</p>
        </button>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {insights.slice(0, 6).map((insight, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={insight.icon as IconName} size="sm" className={insight.color} />
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
              
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-primary/60 to-primary rounded-full"
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
              Apply these recommendations to your Price Builder
            </p>
          </div>
          <Button 
            onClick={onApplyToPriceBuilder}
            className="gap-2 bg-gradient-to-r from-primary to-[#9D96FF] whitespace-nowrap"
            size="lg"
          >
            <Icon name="arrowRight" size="sm" />
            Open Price Builder
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PricingWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  const {
    config,
    updateConfig,
    resetWizard,
    completeWizard,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    isLoaded,
    hourlyRate,
    insights,
  } = usePricingWizard();

  const recommendations = useMemo(
    () => generateServiceRecommendations(config, hourlyRate),
    [config, hourlyRate]
  );

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return config.industry !== "" && config.zipCode.length === 5;
      case 2:
        return true;
      case 3:
        return config.hourlyLaborCost > 0;
      case 4:
        return config.monthlyRevenueGoal > 0;
      default:
        return true;
    }
  }, [currentStep, config]);

  const handleNext = () => {
    if (currentStep === 4) {
      completeWizard();
    } else {
      nextStep();
    }
  };

  const handleApplyToPriceBuilder = () => {
    toast({
      title: "Configuration saved!",
      description: "Opening Price Builder with your settings...",
    });
    router.push("/pricing");
  };

  const handleReset = () => {
    resetWizard();
    setShowResetDialog(false);
    toast({
      title: "Wizard reset",
      description: "All settings have been cleared.",
    });
  };

  const progressPercent = (currentStep / 5) * 100;

  if (!isLoaded) {
    return (
      <Layout title="Pricing Wizard">
        <div className="flex items-center justify-center py-12">
          <Icon name="spinner" size="xl" className="animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Pricing Wizard">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl">
              <Icon name="wand" size="lg" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pricing Wizard</h1>
              <p className="text-muted-foreground text-sm">Configure your pricing strategy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="gap-2 text-muted-foreground"
            >
              <Icon name="refresh" size="sm" />
              Reset
            </Button>
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="gap-2">
                <Icon name="layers" size="sm" />
                Price Builder
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center group"
                  disabled={step.id > currentStep && !config.completedAt}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    currentStep > step.id
                      ? "bg-primary text-white"
                      : currentStep === step.id
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : config.completedAt
                      ? "bg-muted text-muted-foreground hover:bg-primary/20 cursor-pointer"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {currentStep > step.id ? (
                      <Icon name="check" size="sm" />
                    ) : (
                      <Icon name={step.icon} size="sm" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1.5 hidden sm:block transition-colors",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                    config.completedAt && "group-hover:text-primary cursor-pointer"
                  )}>
                    {step.title}
                  </span>
                </button>
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
            <StepBusiness config={config} onChange={updateConfig} />
          )}
          {currentStep === 2 && (
            <StepOperations config={config} onChange={updateConfig} />
          )}
          {currentStep === 3 && (
            <StepCosts config={config} onChange={updateConfig} />
          )}
          {currentStep === 4 && (
            <StepGoals config={config} onChange={updateConfig} />
          )}
          {currentStep === 5 && (
            <StepResults
              config={config}
              insights={insights}
              recommendations={recommendations}
              onApplyToPriceBuilder={handleApplyToPriceBuilder}
              onEdit={setCurrentStep}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
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
                {currentStep === 4 ? "See Results" : "Continue"}
                <Icon name="arrowRight" size="sm" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="gap-2"
                >
                  <Icon name="edit" size="sm" />
                  Edit Answers
                </Button>
              </div>
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

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Pricing Wizard?</DialogTitle>
            <DialogDescription>
              This will clear all your answers and start fresh. Your Price Builder configuration will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset} className="gap-2">
              <Icon name="trash" size="sm" />
              Reset Wizard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
