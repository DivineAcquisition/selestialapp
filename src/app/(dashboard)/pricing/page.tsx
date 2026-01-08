"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  INDUSTRIES,
  REGIONAL_MULTIPLIERS,
  getIndustryBySlug,
  type ServicePricing,
  type RetentionModel,
} from "@/lib/pricing/pricing-data";

// ============================================================================
// TYPES
// ============================================================================

interface WizardConfig {
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

interface EnabledService extends ServicePricing {
  id: string;
  enabled: boolean;
  customPrice?: number;
}

interface PriceRule {
  id: string;
  name: string;
  type: "multiplier" | "percentage" | "flat";
  value: number;
  condition: string;
  enabled: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "selestial_pricing_wizard";

const DEFAULT_WIZARD_CONFIG: WizardConfig = {
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

const DEFAULT_RULES: PriceRule[] = [
  { id: "1", name: "Same-Day Service", type: "multiplier", value: 1.5, condition: "Booking within 24 hours", enabled: true },
  { id: "2", name: "Weekend Premium", type: "percentage", value: 15, condition: "Saturday or Sunday", enabled: true },
  { id: "3", name: "After Hours", type: "flat", value: 50, condition: "Service after 6 PM", enabled: false },
  { id: "4", name: "Emergency (24/7)", type: "multiplier", value: 1.75, condition: "Emergency calls", enabled: false },
  { id: "5", name: "Holiday Rate", type: "multiplier", value: 2.0, condition: "Major holidays", enabled: false },
  { id: "6", name: "Recurring Customer", type: "percentage", value: -15, condition: "Subscription clients", enabled: true },
  { id: "7", name: "First-Time Discount", type: "percentage", value: -10, condition: "New customers", enabled: true },
  { id: "8", name: "Senior Discount", type: "percentage", value: -10, condition: "65+ customers", enabled: false },
];

const EXPERIENCE_LEVELS = [
  { value: "new", label: "New (< 1 year)", description: "Just getting started", multiplier: 0.85 },
  { value: "growing", label: "Growing (1-3 years)", description: "Building reputation", multiplier: 0.95 },
  { value: "established", label: "Established (3-7 years)", description: "Proven track record", multiplier: 1.0 },
  { value: "expert", label: "Expert (7+ years)", description: "Industry leader", multiplier: 1.15 },
] as const;

const TEAM_SIZES = [
  { value: "solo", label: "Solo", description: "Just me", capacity: 1 },
  { value: "small", label: "Small (2-3)", description: "Small team", capacity: 2.5 },
  { value: "medium", label: "Medium (4-8)", description: "Growing team", capacity: 6 },
  { value: "large", label: "Large (9+)", description: "Full crew", capacity: 12 },
] as const;

const PRICING_STRATEGIES = [
  { value: "penetration", label: "Entry/Penetration", description: "Lower prices to gain market share", icon: "trendDown" },
  { value: "value", label: "Value", description: "Balanced quality and price", icon: "scale" },
  { value: "competitive", label: "Competitive", description: "Match market rates", icon: "target" },
  { value: "premium", label: "Premium", description: "Higher prices, premium service", icon: "crown" },
] as const;

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

type TabId = "setup" | "services" | "rules" | "retention" | "calculator";

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: "setup", label: "Setup", icon: "settings" },
  { id: "services", label: "Services", icon: "layers" },
  { id: "rules", label: "Price Rules", icon: "tag" },
  { id: "retention", label: "Retention", icon: "refresh" },
  { id: "calculator", label: "Calculator", icon: "calculator" },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

interface StoredConfig {
  wizard: WizardConfig;
  region: string;
  rules: PriceRule[];
  retentionPlan: string | null;
  services?: Record<string, { enabled: boolean; customPrice?: number }>;
}

function getInitialConfig(): StoredConfig {
  if (typeof window === "undefined") {
    return { wizard: DEFAULT_WIZARD_CONFIG, region: "Baseline", rules: DEFAULT_RULES, retentionPlan: null };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        wizard: parsed.wizard || DEFAULT_WIZARD_CONFIG,
        region: parsed.region || "Baseline",
        rules: parsed.rules || DEFAULT_RULES,
        retentionPlan: parsed.retentionPlan || null,
        services: parsed.services || {},
      };
    } catch {
      console.warn("Failed to parse pricing wizard config");
    }
  }
  return { wizard: DEFAULT_WIZARD_CONFIG, region: "Baseline", rules: DEFAULT_RULES, retentionPlan: null };
}

function calculateHourlyRate(config: WizardConfig): number {
  // Prevent division by zero when margin is 100%
  if (config.targetMargin >= 100) return 0;
  const baseRate = config.hourlyLaborCost / (1 - config.targetMargin / 100);
  const experienceMultiplier = EXPERIENCE_LEVELS.find(e => e.value === config.yearsInBusiness)?.multiplier || 1;
  return baseRate * experienceMultiplier;
}

function calculateJobPrice(config: WizardConfig): number {
  const hourlyRate = calculateHourlyRate(config);
  return hourlyRate * config.avgJobDuration + config.avgMaterialCost;
}

function formatPrice(price: number, unit: string): string {
  if (unit === "sqft" || unit === "linear_ft" || unit === "each") {
    return `$${price.toFixed(2)}`;
  }
  return `$${Math.round(price)}`;
}

function getUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    flat: "", sqft: "/sq ft", linear_ft: "/linear ft", each: "/each",
    hour: "/hour", room: "/room", window: "/window", visit: "/visit",
    week: "/week", month: "/month", quarter: "/quarter", square: "/square",
    cubic_yard: "/cu yd", lb: "/lb",
  };
  return labels[unit] || "";
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SetupPanel({
  config,
  region,
  onConfigChange,
  onRegionChange,
  onReset,
}: {
  config: WizardConfig;
  region: string;
  onConfigChange: (updates: Partial<WizardConfig>) => void;
  onRegionChange: (region: string) => void;
  onReset: () => void;
}) {
  const hourlyRate = calculateHourlyRate(config);
  const jobPrice = calculateJobPrice(config);
  const teamCapacity = TEAM_SIZES.find(t => t.value === config.teamSize)?.capacity || 1;
  const monthlyRevenue = jobPrice * config.jobsPerDay * teamCapacity * 22;
  const profitPerJob = jobPrice * (config.targetMargin / 100);
  const breakEvenJobs = profitPerJob > 0 ? Math.ceil(config.monthlyOverhead / profitPerJob) : 0;

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      {config.industry && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent">
            <p className="text-xs text-muted-foreground">Target Hourly Rate</p>
            <p className="text-2xl font-bold text-primary">${hourlyRate.toFixed(0)}/hr</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <p className="text-xs text-muted-foreground">Avg Job Price</p>
            <p className="text-2xl font-bold text-emerald-600">${jobPrice.toFixed(0)}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent">
            <p className="text-xs text-muted-foreground">Monthly Potential</p>
            <p className="text-2xl font-bold text-purple-600">${monthlyRevenue.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent">
            <p className="text-xs text-muted-foreground">Break-Even</p>
            <p className="text-2xl font-bold text-amber-600">{breakEvenJobs} jobs/mo</p>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Business & Operations */}
        <div className="space-y-6">
          {/* Industry Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Industry *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {INDUSTRIES.slice(0, 12).map((industry) => {
                const isSelected = config.industry === industry.slug;
                const iconName = INDUSTRY_ICONS[industry.slug] || "briefcase";
                return (
                  <button
                    key={industry.slug}
                    onClick={() => onConfigChange({ industry: industry.slug })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon name={iconName} size="lg" className={isSelected ? "text-primary" : "text-muted-foreground"} />
                    <span className={cn("text-xs font-medium text-center", isSelected && "text-primary")}>
                      {industry.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region & ZIP */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Market Region</label>
              <Select value={region} onValueChange={onRegionChange}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONAL_MULTIPLIERS.map((r) => (
                    <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ZIP Code</label>
              <Input
                type="text"
                placeholder="12345"
                value={config.zipCode}
                onChange={(e) => onConfigChange({ zipCode: e.target.value.replace(/\D/g, "").slice(0, 5) })}
                className="h-10 rounded-xl"
                maxLength={5}
              />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Experience Level</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_LEVELS.map((level) => {
                const isSelected = config.yearsInBusiness === level.value;
                return (
                  <button
                    key={level.value}
                    onClick={() => onConfigChange({ yearsInBusiness: level.value as WizardConfig["yearsInBusiness"] })}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className={cn("font-medium text-sm", isSelected && "text-primary")}>{level.label}</p>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Team Size</label>
            <div className="grid grid-cols-4 gap-2">
              {TEAM_SIZES.map((size) => {
                const isSelected = config.teamSize === size.value;
                return (
                  <button
                    key={size.value}
                    onClick={() => onConfigChange({ teamSize: size.value as WizardConfig["teamSize"] })}
                    className={cn(
                      "p-3 rounded-xl border-2 text-center transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className={cn("font-medium text-sm", isSelected && "text-primary")}>{size.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Costs & Goals */}
        <div className="space-y-6">
          {/* Job Duration & Jobs Per Day */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Avg Job Duration: {config.avgJobDuration} hrs</label>
            <input
              type="range"
              min={0.5}
              max={8}
              step={0.5}
              value={config.avgJobDuration}
              onChange={(e) => onConfigChange({ avgJobDuration: Number(e.target.value) })}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Jobs Per Day (per worker): {config.jobsPerDay}</label>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={config.jobsPerDay}
              onChange={(e) => onConfigChange({ jobsPerDay: Number(e.target.value) })}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Costs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Labor Cost/hr</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  value={config.hourlyLaborCost || ""}
                  onChange={(e) => onConfigChange({ hourlyLaborCost: Number(e.target.value) || 0 })}
                  className="pl-6 h-10 rounded-xl"
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Materials/job</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  value={config.avgMaterialCost || ""}
                  onChange={(e) => onConfigChange({ avgMaterialCost: Number(e.target.value) || 0 })}
                  className="pl-6 h-10 rounded-xl"
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Monthly Overhead</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  value={config.monthlyOverhead || ""}
                  onChange={(e) => onConfigChange({ monthlyOverhead: Number(e.target.value) || 0 })}
                  className="pl-6 h-10 rounded-xl"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Target Margin */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Target Profit Margin: {config.targetMargin}%</label>
              <Badge variant="secondary" className={cn(
                "text-xs",
                config.targetMargin < 30 ? "bg-amber-100 text-amber-700" :
                config.targetMargin > 55 ? "bg-purple-100 text-purple-700" :
                "bg-emerald-100 text-emerald-700"
              )}>
                {config.targetMargin < 30 ? "Value" : config.targetMargin > 55 ? "Premium" : "Competitive"}
              </Badge>
            </div>
            <input
              type="range"
              min={20}
              max={70}
              step={5}
              value={config.targetMargin}
              onChange={(e) => onConfigChange({ targetMargin: Number(e.target.value) })}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Revenue Goal */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Monthly Revenue Goal</label>
            <div className="relative max-w-xs">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                value={config.monthlyRevenueGoal || ""}
                onChange={(e) => onConfigChange({ monthlyRevenueGoal: Number(e.target.value) || 0 })}
                className="pl-6 h-10 rounded-xl"
                min={0}
                step={1000}
              />
            </div>
          </div>

          {/* Pricing Strategy */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Pricing Strategy</label>
            <div className="grid grid-cols-2 gap-2">
              {PRICING_STRATEGIES.map((strategy) => {
                const isSelected = config.pricingStrategy === strategy.value;
                return (
                  <button
                    key={strategy.value}
                    onClick={() => onConfigChange({ pricingStrategy: strategy.value as WizardConfig["pricingStrategy"] })}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={strategy.icon as IconName} size="sm" className={isSelected ? "text-primary" : "text-muted-foreground"} />
                      <p className={cn("font-medium text-sm", isSelected && "text-primary")}>{strategy.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t flex justify-end">
        <Button variant="outline" onClick={onReset} className="gap-2 text-muted-foreground">
          <Icon name="refresh" size="sm" />
          Reset All Settings
        </Button>
      </div>
    </div>
  );
}

function ServicesPanel({
  services,
  regionMultiplier,
  onToggle,
  onPriceChange,
}: {
  services: EnabledService[];
  regionMultiplier: number;
  onToggle: (id: string) => void;
  onPriceChange: (id: string, price: number) => void;
}) {
  const enabledCount = services.filter(s => s.enabled).length;
  const categories = useMemo(() => {
    return services.reduce((acc, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, EnabledService[]>);
  }, [services]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Services & Pricing</h3>
          <p className="text-sm text-muted-foreground">Toggle services and customize prices</p>
        </div>
        <Badge variant="outline">{enabledCount} of {services.length} enabled</Badge>
      </div>

      {Object.entries(categories).map(([category, categoryServices]) => (
        <div key={category} className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Icon name="folder" size="sm" />
            {category}
          </h4>
          <div className="space-y-2">
            {categoryServices.map((service) => {
              const adjustedAvg = Math.round(service.avgPrice * regionMultiplier);
              const adjustedLow = Math.round(service.lowPrice * regionMultiplier);
              const adjustedHigh = Math.round(service.highPrice * regionMultiplier);
              const currentPrice = service.customPrice ?? adjustedAvg;
              const unit = getUnitLabel(service.pricingUnit);

              return (
                <div
                  key={service.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all",
                    service.enabled ? "bg-card border-border" : "bg-muted/30 border-transparent opacity-60"
                  )}
                >
                  <Switch
                    checked={service.enabled}
                    onCheckedChange={() => onToggle(service.id)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Range: {formatPrice(adjustedLow, service.pricingUnit)} - {formatPrice(adjustedHigh, service.pricingUnit)}{unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={currentPrice}
                      onChange={(e) => onPriceChange(service.id, e.target.value === "" ? adjustedAvg : Number(e.target.value))}
                      disabled={!service.enabled}
                      className="w-24 h-9 text-right"
                      min={0}
                      step={service.pricingUnit === "sqft" || service.pricingUnit === "linear_ft" ? 0.01 : 1}
                    />
                    <span className="text-sm text-muted-foreground w-16">{unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function RulesPanel({
  rules,
  onToggle,
  onDelete,
  onAdd,
}: {
  rules: PriceRule[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const formatValue = (rule: PriceRule) => {
    if (rule.type === "multiplier") return `${rule.value}x`;
    if (rule.type === "percentage") return `${rule.value > 0 ? "+" : ""}${rule.value}%`;
    return `${rule.value > 0 ? "+$" : "-$"}${Math.abs(rule.value)}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Price Rules</h3>
          <p className="text-sm text-muted-foreground">Automatic adjustments for rush, discounts, surcharges</p>
        </div>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-2 rounded-xl">
          <Icon name="plus" size="sm" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all",
              rule.enabled ? "bg-card border-border" : "bg-muted/30 border-transparent opacity-60"
            )}
          >
            <Switch
              checked={rule.enabled}
              onCheckedChange={() => onToggle(rule.id)}
              className="data-[state=checked]:bg-primary"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{rule.name}</p>
              <p className="text-xs text-muted-foreground">{rule.condition}</p>
            </div>
            <Badge className={cn(
              "text-xs",
              (rule.type === "multiplier" && rule.value > 1) || 
              (rule.type === "percentage" && rule.value > 0) ||
              (rule.type === "flat" && rule.value > 0)
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            )}>
              {formatValue(rule)}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => onDelete(rule.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Icon name="trash" size="sm" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RetentionPanel({
  plans,
  selected,
  onSelect,
}: {
  plans: RetentionModel[];
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon name="info" size="xl" className="mx-auto mb-2 opacity-50" />
        <p>No retention models available for this industry yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-semibold">Retention Programs</h3>
        <p className="text-sm text-muted-foreground">Recurring plans increase LTV by up to 5x</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan, i) => {
          const isSelected = selected === plan.name;
          return (
            <button
              key={i}
              onClick={() => onSelect(isSelected ? null : plan.name)}
              className={cn(
                "text-left p-4 rounded-xl border-2 transition-all",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{plan.name}</h4>
                <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">{plan.frequency}</Badge>
              </div>
              <p className="text-lg font-bold text-primary mb-2">${plan.priceRange.low} - ${plan.priceRange.high}</p>
              <ul className="space-y-1">
                {plan.includes.slice(0, 3).map((item, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-center gap-1">
                    <Icon name="check" size="xs" className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Retention lift:</span>
                <span className="font-medium text-emerald-600">+{plan.retentionLift}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalculatorPanel({
  services,
  rules,
  regionMultiplier,
  wizardJobPrice,
}: {
  services: EnabledService[];
  rules: PriceRule[];
  regionMultiplier: number;
  wizardJobPrice: number;
}) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [applyRules, setApplyRules] = useState(true);
  const enabledServices = services.filter(s => s.enabled);

  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, id) => {
      const service = enabledServices.find(s => s.id === id);
      if (!service) return sum;
      const price = service.customPrice ?? Math.round(service.avgPrice * regionMultiplier);
      return sum + price;
    }, 0);
  }, [selectedServices, enabledServices, regionMultiplier]);

  const enabledRules = rules.filter(r => r.enabled);

  const adjustments = useMemo(() => {
    if (!applyRules) return [];
    return enabledRules.map(rule => {
      let amount = 0;
      if (rule.type === "multiplier") {
        amount = subtotal * (rule.value - 1);
      } else if (rule.type === "percentage") {
        amount = subtotal * (rule.value / 100);
      } else {
        amount = rule.value;
      }
      return { name: rule.name, amount };
    });
  }, [enabledRules, subtotal, applyRules]);

  const total = subtotal + adjustments.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-semibold">Quote Calculator</h3>
        <p className="text-sm text-muted-foreground">Test your pricing by building sample quotes</p>
      </div>

      {/* Wizard Price Reference */}
      {wizardJobPrice > 0 && (
        <Card className="p-4 mb-4 bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="wand" size="sm" className="text-primary" />
              <span className="text-sm font-medium">Wizard calculated job price:</span>
            </div>
            <span className="text-xl font-bold text-primary">${wizardJobPrice.toFixed(0)}</span>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Select services:</p>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={applyRules} onCheckedChange={setApplyRules} />
            Apply price rules
          </label>
        </div>
        
        <div className="max-h-64 overflow-auto space-y-1 border rounded-xl p-2">
          {enabledServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="layers" size="xl" className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No services enabled</p>
              <p className="text-xs">Enable services in the Services tab first</p>
            </div>
          ) : (
            enabledServices.map(service => {
              const price = service.customPrice ?? Math.round(service.avgPrice * regionMultiplier);
              const isSelected = selectedServices.includes(service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedServices(prev =>
                    isSelected ? prev.filter(id => id !== service.id) : [...prev, service.id]
                  )}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isSelected && <Icon name="check" size="sm" />}
                    {service.name}
                  </span>
                  <span className="font-medium">{formatPrice(price, service.pricingUnit)}</span>
                </button>
              );
            })
          )}
        </div>

        {selectedServices.length > 0 && (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(0)}</span>
              </div>
              
              {adjustments.filter(a => a.amount !== 0).map((adj, i) => (
                <div key={i} className={cn(
                  "flex justify-between text-sm",
                  adj.amount > 0 ? "text-amber-600" : "text-emerald-600"
                )}>
                  <span className="pl-2">{adj.name}</span>
                  <span>{adj.amount > 0 ? "+" : ""}{adj.amount.toFixed(0)}</span>
                </div>
              ))}

              <div className="flex justify-between text-xl font-bold pt-3 border-t">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(0)}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function PricingWizardPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("setup");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load initial state
  const [wizardConfig, setWizardConfig] = useState<WizardConfig>(DEFAULT_WIZARD_CONFIG);
  const [region, setRegion] = useState("Baseline");
  const [rules, setRules] = useState<PriceRule[]>(DEFAULT_RULES);
  const [retentionPlan, setRetentionPlan] = useState<string | null>(null);
  const [services, setServices] = useState<EnabledService[]>([]);
  const [savedServiceSettings, setSavedServiceSettings] = useState<Record<string, { enabled: boolean; customPrice?: number }>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const initial = getInitialConfig();
    setWizardConfig(initial.wizard);
    setRegion(initial.region);
    setRules(initial.rules);
    setRetentionPlan(initial.retentionPlan);
    setSavedServiceSettings(initial.services || {});
    setIsLoaded(true);
    // Reset hasChanges after a tick to avoid showing "unsaved" on initial load
    setTimeout(() => setHasChanges(false), 100);
  }, []);

  // Get industry data
  const selectedIndustry = useMemo(() => 
    getIndustryBySlug(wizardConfig.industry),
    [wizardConfig.industry]
  );

  // Region multiplier
  const regionMultiplier = useMemo(() => {
    const r = REGIONAL_MULTIPLIERS.find(r => r.region === region);
    return r ? (r.multiplier.low + r.multiplier.high) / 2 : 1;
  }, [region]);

  // Calculate wizard values
  const jobPrice = calculateJobPrice(wizardConfig);

  // Initialize services when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      const newServices: EnabledService[] = selectedIndustry.services.map((service, index) => {
        const serviceId = `${selectedIndustry.slug}-${index}`;
        const savedSettings = savedServiceSettings[serviceId];
        return {
          ...service,
          id: serviceId,
          enabled: savedSettings?.enabled ?? index < 8, // Default: first 8 enabled
          customPrice: savedSettings?.customPrice,
        };
      });
      setServices(newServices);
    }
  }, [selectedIndustry, savedServiceSettings]);

  // Save to localStorage when config changes
  useEffect(() => {
    if (isLoaded) {
      // Build services settings map
      const servicesMap: Record<string, { enabled: boolean; customPrice?: number }> = {};
      services.forEach(s => {
        servicesMap[s.id] = { enabled: s.enabled, customPrice: s.customPrice };
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        wizard: wizardConfig,
        region,
        rules,
        retentionPlan,
        services: servicesMap,
      }));
      setHasChanges(true);
    }
  }, [wizardConfig, region, rules, retentionPlan, services, isLoaded]);

  // Handlers
  const handleWizardConfigChange = useCallback((updates: Partial<WizardConfig>) => {
    setWizardConfig(prev => ({ ...prev, ...updates, lastUpdatedAt: new Date().toISOString() }));
  }, []);

  const handleServiceToggle = useCallback((id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    setHasChanges(true);
  }, []);

  const handleServicePriceChange = useCallback((id: string, price: number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, customPrice: price } : s));
    setHasChanges(true);
  }, []);

  const handleRuleToggle = useCallback((id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const handleRuleDelete = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleRuleAdd = useCallback(() => {
    const newRule: PriceRule = {
      id: `rule-${Date.now()}`,
      name: "New Rule",
      type: "percentage",
      value: 10,
      condition: "Custom condition",
      enabled: true,
    };
    setRules(prev => [...prev, newRule]);
  }, []);

  const handleReset = useCallback(() => {
    setWizardConfig(DEFAULT_WIZARD_CONFIG);
    setRegion("Baseline");
    setRules(DEFAULT_RULES);
    setRetentionPlan(null);
    setServices([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowResetDialog(false);
    setActiveTab("setup");
    toast({ title: "Wizard reset", description: "All settings have been cleared." });
  }, [toast]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Mark as completed
      setWizardConfig(prev => ({ ...prev, completedAt: new Date().toISOString() }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setHasChanges(false);
      toast({ title: "Saved successfully", description: "Your pricing configuration has been saved." });
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Stats
  const enabledServicesCount = services.filter(s => s.enabled).length;
  const enabledRulesCount = rules.filter(r => r.enabled).length;

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <Icon name="wand" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pricing Wizard</h1>
              <p className="text-muted-foreground">
                {selectedIndustry ? `Configure pricing for ${selectedIndustry.name}` : "Set up your pricing strategy"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowResetDialog(true)} className="gap-2 rounded-xl text-muted-foreground">
              <Icon name="refresh" size="sm" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF]">
              {isSaving ? <Icon name="spinner" size="sm" className="animate-spin" /> : <Icon name="save" size="sm" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit overflow-x-auto">
          {TABS.map((tab) => {
            let count: number | undefined;
            if (tab.id === "services") count = enabledServicesCount;
            if (tab.id === "rules") count = enabledRulesCount;
            const isDisabled = tab.id !== "setup" && !wizardConfig.industry;
            
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon name={tab.icon} size="sm" />
                {tab.label}
                {count !== undefined && (
                  <Badge variant="secondary" className={cn("text-xs", activeTab === tab.id && "bg-primary/10")}>
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-6 rounded-2xl">
              {activeTab === "setup" && (
                <SetupPanel
                  config={wizardConfig}
                  region={region}
                  onConfigChange={handleWizardConfigChange}
                  onRegionChange={setRegion}
                  onReset={() => setShowResetDialog(true)}
                />
              )}
              {activeTab === "services" && selectedIndustry && (
                <ServicesPanel
                  services={services}
                  regionMultiplier={regionMultiplier}
                  onToggle={handleServiceToggle}
                  onPriceChange={handleServicePriceChange}
                />
              )}
              {activeTab === "rules" && (
                <RulesPanel
                  rules={rules}
                  onToggle={handleRuleToggle}
                  onDelete={handleRuleDelete}
                  onAdd={handleRuleAdd}
                />
              )}
              {activeTab === "retention" && selectedIndustry && (
                <RetentionPanel
                  plans={selectedIndustry.retentionModels}
                  selected={retentionPlan}
                  onSelect={setRetentionPlan}
                />
              )}
              {activeTab === "calculator" && (
                <CalculatorPanel
                  services={services}
                  rules={rules}
                  regionMultiplier={regionMultiplier}
                  wizardJobPrice={jobPrice}
                />
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Industry Benchmarks */}
            {selectedIndustry && (
              <Card className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Icon name="chart" size="sm" className="text-primary" />
                  Industry Benchmarks
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Avg Ticket</p>
                    <p className="font-semibold">${selectedIndustry.avgTicket.avg}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Conversion Rate</p>
                    <p className="font-semibold">{selectedIndustry.conversionRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Gross Margin</p>
                    <p className="font-semibold">{selectedIndustry.grossMargin.low}-{selectedIndustry.grossMargin.high}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Net Margin (Top)</p>
                    <p className="font-semibold text-emerald-600">{selectedIndustry.netMargin.top}%</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Recommended Model */}
            {selectedIndustry && selectedIndustry.pricingModels.length > 0 && (
              <Card className="p-4 rounded-xl">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Icon name="lightbulb" size="sm" className="text-amber-500" />
                  Recommended Model
                </h3>
                {selectedIndustry.pricingModels.slice(0, 2).map((model, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-lg text-sm mb-2",
                    i === 0 ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{model.name}</span>
                      <Badge variant="secondary" className="text-xs">{model.prevalence}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                    {model.conversionImpact > 0 && (
                      <p className="text-xs text-emerald-600 mt-1">+{model.conversionImpact}% conversion</p>
                    )}
                  </div>
                ))}
              </Card>
            )}

            {/* Your Configuration */}
            <Card className="p-4 rounded-xl">
              <h3 className="font-semibold text-sm mb-3">Your Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium">{selectedIndustry?.name || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region</span>
                  <span className="font-medium">{region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Margin</span>
                  <span className="font-medium">{wizardConfig.targetMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Services</span>
                  <span className="font-medium">{enabledServicesCount} enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Rules</span>
                  <span className="font-medium">{enabledRulesCount} active</span>
                </div>
                {retentionPlan && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retention</span>
                    <span className="font-medium text-emerald-600">{retentionPlan}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-4 rounded-xl bg-muted/50">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="info" size="sm" className="text-primary" />
                Tips
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="checkCircle" size="xs" className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Set your labor cost to include benefits and taxes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="checkCircle" size="xs" className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Industry standard margins are 35-50%</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="checkCircle" size="xs" className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Enable retention plans to boost customer LTV</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Pricing Wizard?</DialogTitle>
            <DialogDescription>
              This will clear all your settings including services, rules, and retention plans. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset} className="gap-2">
              <Icon name="trash" size="sm" />
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
