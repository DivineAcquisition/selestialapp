"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Icon, IconName } from "@/components/ui/icon";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  INDUSTRIES,
  REGIONAL_MULTIPLIERS,
  CONVERSION_INSIGHTS,
  getIndustryBySlug,
  getRecommendedPricingModel,
  type IndustryPricing,
  type ServicePricing,
  type PricingModel,
  type RetentionModel,
} from "@/lib/pricing/pricing-data";
import { usePricingWizard } from "@/hooks/usePricingWizard";

// ============================================================================
// TYPES
// ============================================================================

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

interface PriceConfig {
  industry: string;
  region: string;
  pricingModel: string;
  services: EnabledService[];
  rules: PriceRule[];
  retentionPlan: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

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
  flooring: "grid",
  garage_door: "car",
  locksmith: "lock",
  window_cleaning: "sparkles",
  appliance: "plug",
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatPrice(price: number, unit: string): string {
  if (unit === "sqft" || unit === "linear_ft" || unit === "each") {
    return `$${price.toFixed(2)}`;
  }
  return `$${Math.round(price)}`;
}

function getUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    flat: "",
    sqft: "/sq ft",
    linear_ft: "/linear ft",
    each: "/each",
    hour: "/hour",
    room: "/room",
    window: "/window",
    visit: "/visit",
    week: "/week",
    month: "/month",
    quarter: "/quarter",
    square: "/square",
    cubic_yard: "/cu yd",
    lb: "/lb",
  };
  return labels[unit] || "";
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function IndustrySelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {INDUSTRIES.map((industry) => {
        const isSelected = selected === industry.slug;
        const iconName = INDUSTRY_ICONS[industry.slug] || "briefcase";
        
        return (
          <button
            key={industry.slug}
            onClick={() => onSelect(industry.slug)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              isSelected
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isSelected ? "bg-primary/20" : "bg-muted"
            )}>
              <Icon 
                name={iconName} 
                size="xl" 
                className={isSelected ? "text-primary" : "text-muted-foreground"} 
              />
            </div>
            <span className={cn(
              "text-sm font-medium text-center",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {industry.name}
            </span>
            {isSelected && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                Selected
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ServiceRow({
  service,
  regionMultiplier,
  onToggle,
  onPriceChange,
}: {
  service: EnabledService;
  regionMultiplier: number;
  onToggle: () => void;
  onPriceChange: (price: number) => void;
}) {
  const adjustedAvg = Math.round(service.avgPrice * regionMultiplier);
  const adjustedLow = Math.round(service.lowPrice * regionMultiplier);
  const adjustedHigh = Math.round(service.highPrice * regionMultiplier);
  const currentPrice = service.customPrice ?? adjustedAvg;
  const unit = getUnitLabel(service.pricingUnit);

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl border transition-all",
      service.enabled ? "bg-card border-border" : "bg-muted/30 border-transparent opacity-60"
    )}>
      <Switch
        checked={service.enabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{service.name}</p>
        <p className="text-xs text-muted-foreground">
          {service.category} • Range: {formatPrice(adjustedLow, service.pricingUnit)} - {formatPrice(adjustedHigh, service.pricingUnit)}{unit}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">$</span>
        <Input
          type="number"
          value={currentPrice}
          onChange={(e) => onPriceChange(e.target.value === '' ? adjustedAvg : Number(e.target.value))}
          disabled={!service.enabled}
          className="w-24 h-9 text-right"
          min={0}
          step={service.pricingUnit === "sqft" || service.pricingUnit === "linear_ft" ? 0.01 : 1}
        />
        <span className="text-sm text-muted-foreground w-16">{unit}</span>
      </div>
    </div>
  );
}

function RuleRow({
  rule,
  onToggle,
  onUpdate,
  onDelete,
}: {
  rule: PriceRule;
  onToggle: () => void;
  onUpdate: (updates: Partial<PriceRule>) => void;
  onDelete: () => void;
}) {
  const formatValue = () => {
    if (rule.type === "multiplier") return `${rule.value}x`;
    if (rule.type === "percentage") return `${rule.value > 0 ? "+" : ""}${rule.value}%`;
    return `${rule.value > 0 ? "+$" : "-$"}${Math.abs(rule.value)}`;
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl border transition-all",
      rule.enabled ? "bg-card border-border" : "bg-muted/30 border-transparent opacity-60"
    )}>
      <Switch
        checked={rule.enabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{rule.name}</p>
        <p className="text-xs text-muted-foreground">{rule.condition}</p>
      </div>

      <Badge className={cn(
        "text-xs",
        rule.value > 0 || rule.type === "multiplier"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      )}>
        {formatValue()}
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <Icon name="trash" size="sm" />
      </Button>
    </div>
  );
}

function RetentionPlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: RetentionModel;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "text-left p-4 rounded-xl border-2 transition-all",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">{plan.name}</h4>
        <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
          {plan.frequency}
        </Badge>
      </div>
      <p className="text-lg font-bold text-primary mb-2">
        ${plan.priceRange.low} - ${plan.priceRange.high}
      </p>
      <ul className="space-y-1">
        {plan.includes.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
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
}

function IndustryBenchmarks({ industry }: { industry: IndustryPricing }) {
  return (
    <Card className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Icon name="chart" size="sm" className="text-primary" />
        Industry Benchmarks
      </h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Avg Ticket</p>
          <p className="font-semibold">${industry.avgTicket.avg}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Conversion Rate</p>
          <p className="font-semibold">{industry.conversionRate}%</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Gross Margin</p>
          <p className="font-semibold">{industry.grossMargin.low}-{industry.grossMargin.high}%</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Net Margin (Top)</p>
          <p className="font-semibold text-emerald-600">{industry.netMargin.top}%</p>
        </div>
      </div>
    </Card>
  );
}

function QuoteCalculator({
  services,
  rules,
  regionMultiplier,
}: {
  services: EnabledService[];
  rules: PriceRule[];
  regionMultiplier: number;
}) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
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
  }, [enabledRules, subtotal]);

  const total = subtotal + adjustments.reduce((sum, a) => sum + a.amount, 0);

  return (
    <Card className="p-5 rounded-xl">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Icon name="calculator" size="sm" className="text-primary" />
        Quote Calculator
      </h3>

      <div className="space-y-2 mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Select services:</p>
        <div className="max-h-48 overflow-auto space-y-1">
          {enabledServices.map(service => {
            const price = service.customPrice ?? Math.round(service.avgPrice * regionMultiplier);
            const isSelected = selectedServices.includes(service.id);
            return (
              <button
                key={service.id}
                onClick={() => setSelectedServices(prev =>
                  isSelected ? prev.filter(id => id !== service.id) : [...prev, service.id]
                )}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
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
          })}
        </div>
      </div>

      {selectedServices.length > 0 && (
        <div className="border-t pt-4 space-y-2">
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

          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(0)}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

function AISuggestionsPanel({
  industry,
  services,
  regionMultiplier,
  onClose,
  onApplySuggestion,
}: {
  industry: IndustryPricing;
  services: EnabledService[];
  regionMultiplier: number;
  onClose: () => void;
  onApplySuggestion: (suggestion: string, data?: Record<string, unknown>) => void;
}) {
  const enabledCount = services.filter(s => s.enabled).length;
  const totalServices = services.length;
  const recommendedModel = getRecommendedPricingModel(industry);

  // Calculate average price vs benchmark
  const avgEnabledPrice = services
    .filter(s => s.enabled)
    .reduce((sum, s) => sum + (s.customPrice ?? s.avgPrice * regionMultiplier), 0) / Math.max(enabledCount, 1);

  const suggestions = [
    {
      id: "enable-high-margin",
      icon: "trendUp" as IconName,
      iconColor: "text-emerald-500",
      title: "Enable High-Margin Services",
      description: `You have ${totalServices - enabledCount} services disabled. Consider enabling services with ${industry.grossMargin.high}%+ margins.`,
      action: "Enable Suggested",
      show: enabledCount < totalServices * 0.7,
    },
    {
      id: "pricing-model",
      icon: "target" as IconName,
      iconColor: "text-blue-500",
      title: `Switch to ${recommendedModel.name}`,
      description: `${recommendedModel.prevalence}% of ${industry.name} businesses use this model. It has +${recommendedModel.conversionImpact}% conversion impact.`,
      action: "Learn More",
      show: true,
    },
    {
      id: "retention",
      icon: "refresh" as IconName,
      iconColor: "text-purple-500",
      title: "Add Retention Program",
      description: industry.retentionModels[0] 
        ? `A ${industry.retentionModels[0].name} could increase LTV by ${industry.retentionModels[0].ltv_multiplier}x.`
        : "Add a maintenance plan to increase customer lifetime value.",
      action: "Configure Plan",
      show: industry.retentionModels.length > 0,
    },
    {
      id: "emergency-pricing",
      icon: "alertCircle" as IconName,
      iconColor: "text-amber-500",
      title: "Enable Emergency Pricing",
      description: `Industry standard is ${industry.emergencyMultiplier.afterHours}x for after-hours, ${industry.emergencyMultiplier.weekend}x weekends, ${industry.emergencyMultiplier.holiday}x holidays.`,
      action: "Enable Rules",
      show: true,
    },
  ].filter(s => s.show);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#9D96FF] flex items-center justify-center">
              <Icon name="sparkles" size="lg" className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Pricing Suggestions</h3>
              <p className="text-xs text-muted-foreground">Based on {industry.name} benchmarks</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <Icon name="close" size="lg" />
          </Button>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="p-4 rounded-xl border bg-card">
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-muted", suggestion.iconColor)}>
                  <Icon name={suggestion.icon} size="sm" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-8 text-xs"
                    onClick={() => onApplySuggestion(suggestion.id)}
                  >
                    {suggestion.action}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conversion Insights */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Icon name="lightbulb" size="sm" className="text-amber-500" />
            Conversion Insights
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Flat rate preference</p>
              <p className="font-bold text-lg">{CONVERSION_INSIGHTS.flatRatePreference}%</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Middle tier selection</p>
              <p className="font-bold text-lg">{CONVERSION_INSIGHTS.tieredPricing.middleTierSelection}%</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// TABS CONFIG
// ============================================================================

type TabId = "industry" | "services" | "rules" | "retention" | "preview";

interface Tab {
  id: TabId;
  label: string;
  icon: IconName;
}

const TABS: Tab[] = [
  { id: "industry", label: "Industry", icon: "briefcase" },
  { id: "services", label: "Services", icon: "layers" },
  { id: "rules", label: "Price Rules", icon: "settings" },
  { id: "retention", label: "Retention", icon: "refresh" },
  { id: "preview", label: "Calculator", icon: "calculator" },
];

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function PriceBuilderPage() {
  const { toast } = useToast();
  const { 
    config: wizardConfig, 
    isConfigured: isWizardConfigured,
    hourlyRate: wizardHourlyRate,
    insights: wizardInsights,
    isLoaded: isWizardLoaded,
  } = usePricingWizard();
  
  // State
  const [activeTab, setActiveTab] = useState<TabId>("industry");
  const [config, setConfig] = useState<PriceConfig>({
    industry: "cleaning",
    region: "Baseline",
    pricingModel: "flat_rate",
    services: [],
    rules: DEFAULT_RULES,
    retentionPlan: null,
  });
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Apply wizard configuration when available
  useEffect(() => {
    if (isWizardLoaded && isWizardConfigured && wizardConfig.industry) {
      setConfig(prev => ({
        ...prev,
        industry: wizardConfig.industry,
      }));
    }
  }, [isWizardLoaded, isWizardConfigured, wizardConfig.industry]);

  // Derived state
  const selectedIndustry = useMemo(() => 
    getIndustryBySlug(config.industry),
    [config.industry]
  );

  const regionMultiplier = useMemo(() => {
    const region = REGIONAL_MULTIPLIERS.find(r => r.region === config.region);
    return region ? (region.multiplier.low + region.multiplier.high) / 2 : 1;
  }, [config.region]);

  // Initialize services when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      const services: EnabledService[] = selectedIndustry.services.map((service, index) => ({
        ...service,
        id: `${selectedIndustry.slug}-${index}`,
        enabled: index < 8, // Enable first 8 by default
      }));
      setConfig(prev => ({ ...prev, services }));
    }
  }, [selectedIndustry]);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [config.services, config.rules, config.retentionPlan]);

  // Handlers
  const handleIndustryChange = useCallback((slug: string) => {
    setConfig(prev => ({ ...prev, industry: slug }));
    setActiveTab("services");
  }, []);

  const handleServiceToggle = useCallback((serviceId: string) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s =>
        s.id === serviceId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  }, []);

  const handleServicePriceChange = useCallback((serviceId: string, price: number) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s =>
        s.id === serviceId ? { ...s, customPrice: price } : s
      ),
    }));
  }, []);

  const handleRuleToggle = useCallback((ruleId: string) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.map(r =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  }, []);

  const handleRuleDelete = useCallback((ruleId: string) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== ruleId),
    }));
  }, []);

  const handleAddRule = useCallback(() => {
    const newRule: PriceRule = {
      id: `rule-${Date.now()}`,
      name: "New Rule",
      type: "percentage",
      value: 10,
      condition: "Custom condition",
      enabled: true,
    };
    setConfig(prev => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // TODO: Save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      toast({
        title: "Saved successfully",
        description: "Your pricing configuration has been saved.",
      });
    } catch {
      toast({
        title: "Error saving",
        description: "Failed to save your configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const handleApplySuggestion = useCallback((suggestionId: string) => {
    switch (suggestionId) {
      case "enable-high-margin":
        setConfig(prev => ({
          ...prev,
          services: prev.services.map(s => ({ ...s, enabled: true })),
        }));
        toast({ title: "All services enabled" });
        break;
      case "emergency-pricing":
        setConfig(prev => ({
          ...prev,
          rules: prev.rules.map(r => 
            ["3", "4", "5"].includes(r.id) ? { ...r, enabled: true } : r
          ),
        }));
        toast({ title: "Emergency rules enabled" });
        break;
      default:
        toast({ title: "Suggestion applied" });
    }
    setShowAISuggestions(false);
  }, [toast]);

  // Stats
  const enabledServicesCount = config.services.filter(s => s.enabled).length;
  const enabledRulesCount = config.rules.filter(r => r.enabled).length;

  if (!selectedIndustry) {
    return (
      <Layout title="Price Builder">
        <div className="flex items-center justify-center py-12">
          <Icon name="spinner" size="xl" className="animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Price Builder">
      <div className="space-y-6">
        {/* Pricing Wizard CTA */}
        {isWizardConfigured ? (
          <Card className="p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Icon name="checkCircle" size="lg" className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Pricing Wizard configured</p>
                  <p className="text-sm text-muted-foreground">
                    Target: ${wizardHourlyRate.toFixed(0)}/hr • {wizardConfig.targetMargin}% margin • {wizardConfig.pricingStrategy} strategy
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/pricing/wizard">
                  <Button 
                    variant="outline" 
                    className="gap-2 border-emerald-300 hover:bg-emerald-50 whitespace-nowrap"
                  >
                    <Icon name="edit" size="sm" />
                    Edit Settings
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-[#9D96FF]/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon name="wand" size="lg" className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">Configure your pricing strategy</p>
                  <p className="text-sm text-muted-foreground">Use the Pricing Wizard to set up costs, margins, and goals</p>
                </div>
              </div>
              <Link href="/pricing/wizard">
                <Button 
                  variant="outline" 
                  className="gap-2 border-primary/30 hover:bg-primary/10 whitespace-nowrap"
                >
                  <Icon name="wand" size="sm" />
                  Start Wizard
                  <Icon name="arrowRight" size="sm" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <Icon name="dollar" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Price Builder
              </h1>
              <p className="text-muted-foreground">
                Configure pricing for {selectedIndustry.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAISuggestions(true)}
              className="gap-2 rounded-xl"
            >
              <Icon name="sparkles" size="sm" />
              AI Suggestions
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF]"
            >
              {isSaving ? (
                <Icon name="spinner" size="sm" className="animate-spin" />
              ) : (
                <Icon name="save" size="sm" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Region Selector */}
        <Card className="p-4 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Icon name="mapPin" size="lg" className="text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Market Region</p>
                <p className="text-xs text-muted-foreground">Adjusts all prices automatically</p>
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <Select value={config.region} onValueChange={(v) => setConfig(prev => ({ ...prev, region: v }))}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONAL_MULTIPLIERS.map((region) => (
                    <SelectItem key={region.region} value={region.region}>
                      {region.region} ({((region.multiplier.low + region.multiplier.high) / 2 * 100).toFixed(0)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary" className="text-xs">
              {regionMultiplier > 1 ? "+" : ""}{((regionMultiplier - 1) * 100).toFixed(0)}% adjustment
            </Badge>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit overflow-x-auto">
          {TABS.map((tab) => {
            let count: number | undefined;
            if (tab.id === "services") count = enabledServicesCount;
            if (tab.id === "rules") count = enabledRulesCount;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon name={tab.icon} size="sm" />
                {tab.label}
                {count !== undefined && (
                  <Badge variant="secondary" className={cn(
                    "text-xs",
                    activeTab === tab.id && "bg-primary/10"
                  )}>
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
              {/* Industry Tab */}
              {activeTab === "industry" && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-semibold text-lg mb-1">Select Your Industry</h2>
                    <p className="text-sm text-muted-foreground">
                      Choose your industry to load pre-configured services and benchmarks
                    </p>
                  </div>
                  <IndustrySelector
                    selected={config.industry}
                    onSelect={handleIndustryChange}
                  />
                </div>
              )}

              {/* Services Tab */}
              {activeTab === "services" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-semibold text-lg mb-1">Services & Pricing</h2>
                      <p className="text-sm text-muted-foreground">
                        Toggle services and customize prices for your market
                      </p>
                    </div>
                    <Badge variant="outline">
                      {enabledServicesCount} of {config.services.length} enabled
                    </Badge>
                  </div>

                  {/* Group by category */}
                  {Object.entries(
                    config.services.reduce((acc, service) => {
                      if (!acc[service.category]) acc[service.category] = [];
                      acc[service.category].push(service);
                      return acc;
                    }, {} as Record<string, EnabledService[]>)
                  ).map(([category, services]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Icon name="folder" size="sm" />
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {services.map((service) => (
                          <ServiceRow
                            key={service.id}
                            service={service}
                            regionMultiplier={regionMultiplier}
                            onToggle={() => handleServiceToggle(service.id)}
                            onPriceChange={(price) => handleServicePriceChange(service.id, price)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rules Tab */}
              {activeTab === "rules" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-semibold text-lg mb-1">Price Rules</h2>
                      <p className="text-sm text-muted-foreground">
                        Automatic adjustments for rush, discounts, and surcharges
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddRule} className="gap-2 rounded-xl">
                      <Icon name="plus" size="sm" />
                      Add Rule
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {config.rules.map((rule) => (
                      <RuleRow
                        key={rule.id}
                        rule={rule}
                        onToggle={() => handleRuleToggle(rule.id)}
                        onUpdate={(updates) => {
                          setConfig(prev => ({
                            ...prev,
                            rules: prev.rules.map(r =>
                              r.id === rule.id ? { ...r, ...updates } : r
                            ),
                          }));
                        }}
                        onDelete={() => handleRuleDelete(rule.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Retention Tab */}
              {activeTab === "retention" && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-semibold text-lg mb-1">Retention Programs</h2>
                    <p className="text-sm text-muted-foreground">
                      Recurring service plans increase customer lifetime value by up to 5x
                    </p>
                  </div>

                  {selectedIndustry.retentionModels.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {selectedIndustry.retentionModels.map((plan, i) => (
                        <RetentionPlanCard
                          key={i}
                          plan={plan}
                          isSelected={config.retentionPlan === plan.name}
                          onSelect={() => setConfig(prev => ({
                            ...prev,
                            retentionPlan: prev.retentionPlan === plan.name ? null : plan.name,
                          }))}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="info" size="xl" className="mx-auto mb-2 opacity-50" />
                      <p>No retention models available for this industry yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Preview/Calculator Tab */}
              {activeTab === "preview" && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-semibold text-lg mb-1">Quote Calculator</h2>
                    <p className="text-sm text-muted-foreground">
                      Test your pricing by building sample quotes
                    </p>
                  </div>
                  <QuoteCalculator
                    services={config.services}
                    rules={config.rules}
                    regionMultiplier={regionMultiplier}
                  />
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <IndustryBenchmarks industry={selectedIndustry} />

            {/* Pricing Model Info */}
            <Card className="p-4 rounded-xl">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="lightbulb" size="sm" className="text-amber-500" />
                Recommended Model
              </h3>
              {selectedIndustry.pricingModels.length > 0 && (
                <div className="space-y-2">
                  {selectedIndustry.pricingModels.slice(0, 2).map((model, i) => (
                    <div key={i} className={cn(
                      "p-3 rounded-lg text-sm",
                      i === 0 ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{model.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {model.prevalence}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                      {model.conversionImpact > 0 && (
                        <p className="text-xs text-emerald-600 mt-1">
                          +{model.conversionImpact}% conversion
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="p-4 rounded-xl">
              <h3 className="font-semibold text-sm mb-3">Your Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium">{selectedIndustry.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region</span>
                  <span className="font-medium">{config.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Services</span>
                  <span className="font-medium">{enabledServicesCount} enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Rules</span>
                  <span className="font-medium">{enabledRulesCount} active</span>
                </div>
                {config.retentionPlan && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retention</span>
                    <span className="font-medium text-emerald-600">{config.retentionPlan}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {showAISuggestions && (
        <AISuggestionsPanel
          industry={selectedIndustry}
          services={config.services}
          regionMultiplier={regionMultiplier}
          onClose={() => setShowAISuggestions(false)}
          onApplySuggestion={handleApplySuggestion}
        />
      )}
    </Layout>
  );
}
