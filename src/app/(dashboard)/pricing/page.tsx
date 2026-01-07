"use client";

import { useState, useEffect } from "react";
import { Icon, IconName } from "@/components/ui/icon";
import Layout from "@/components/layout/Layout";

// ============================================================================
// TYPES
// ============================================================================

interface PriceTier {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceUnit: "flat" | "per_sqft" | "per_hour" | "starting_at";
  features: string[];
  recommended?: boolean;
  color: string;
}

interface PriceAddon {
  id: string;
  name: string;
  price: number;
  unit: "flat" | "per_sqft" | "per_hour" | "per_room";
}

interface PriceRule {
  id: string;
  name: string;
  type: "multiplier" | "flat_add" | "percentage_add";
  value: number;
  condition: string;
  enabled: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIER_COLORS = [
  { name: "slate", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  { name: "violet", bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-300" },
  { name: "amber", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  { name: "emerald", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { name: "blue", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { name: "rose", bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
];

const PROPERTY_SIZES = [
  { label: "Studio/1BR", sqft: "< 800 sq ft", multiplier: 0.8 },
  { label: "2 Bedroom", sqft: "800-1,200 sq ft", multiplier: 1.0 },
  { label: "3 Bedroom", sqft: "1,200-1,800 sq ft", multiplier: 1.3 },
  { label: "4 Bedroom", sqft: "1,800-2,500 sq ft", multiplier: 1.6 },
  { label: "5+ Bedroom", sqft: "2,500+ sq ft", multiplier: 2.0 },
];

const DEFAULT_TIERS: PriceTier[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential cleaning for maintained homes",
    basePrice: 99,
    priceUnit: "starting_at",
    features: ["Dusting & vacuuming", "Kitchen wipe-down", "Bathroom cleaning", "Floor mopping"],
    color: "slate",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Our most popular deep clean package",
    basePrice: 179,
    priceUnit: "starting_at",
    features: ["Everything in Basic", "Inside appliances", "Baseboards", "Window sills", "Cabinet fronts"],
    recommended: true,
    color: "violet",
  },
  {
    id: "premium",
    name: "Premium",
    description: "White-glove service for the perfectionist",
    basePrice: 299,
    priceUnit: "starting_at",
    features: ["Everything in Standard", "Inside windows", "Garage sweep", "Laundry & folding", "Organize closets"],
    color: "amber",
  },
];

const DEFAULT_ADDONS: PriceAddon[] = [
  { id: "1", name: "Inside Refrigerator", price: 35, unit: "flat" },
  { id: "2", name: "Inside Oven", price: 40, unit: "flat" },
  { id: "3", name: "Interior Windows", price: 8, unit: "per_room" },
  { id: "4", name: "Laundry (wash & fold)", price: 25, unit: "flat" },
  { id: "5", name: "Garage Cleaning", price: 75, unit: "flat" },
  { id: "6", name: "Patio/Deck", price: 50, unit: "flat" },
];

const DEFAULT_RULES: PriceRule[] = [
  { id: "1", name: "Same-Day Service", type: "multiplier", value: 1.5, condition: "Booking within 24 hours", enabled: true },
  { id: "2", name: "Weekend Premium", type: "percentage_add", value: 15, condition: "Saturday or Sunday", enabled: true },
  { id: "3", name: "After Hours", type: "flat_add", value: 50, condition: "Service after 6 PM", enabled: false },
  { id: "4", name: "Pet Surcharge", type: "flat_add", value: 25, condition: "Homes with pets", enabled: true },
  { id: "5", name: "First-Time Discount", type: "percentage_add", value: -10, condition: "New customer", enabled: true },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function TierCard({
  tier,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  tier: PriceTier;
  onUpdate: (tier: PriceTier) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTier, setEditedTier] = useState(tier);
  const [newFeature, setNewFeature] = useState("");

  const colorConfig = TIER_COLORS.find((c) => c.name === tier.color) || TIER_COLORS[0];

  const handleSave = () => {
    onUpdate(editedTier);
    setIsEditing(false);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setEditedTier({ ...editedTier, features: [...editedTier.features, newFeature.trim()] });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setEditedTier({
      ...editedTier,
      features: editedTier.features.filter((_, i) => i !== index),
    });
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-violet-300 bg-white p-5 shadow-lg dark:bg-card">
        <div className="mb-4 flex items-center justify-between">
          <input
            type="text"
            value={editedTier.name}
            onChange={(e) => setEditedTier({ ...editedTier, name: e.target.value })}
            className="border-b border-dashed border-gray-300 bg-transparent text-lg font-semibold outline-none focus:border-violet-500"
          />
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100">
              Cancel
            </button>
            <button onClick={handleSave} className="rounded-lg bg-violet-600 px-3 py-1 text-sm text-white hover:bg-violet-700">
              Save
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
            <input
              type="text"
              value={editedTier.description}
              onChange={(e) => setEditedTier({ ...editedTier, description: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Base Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={editedTier.basePrice}
                  onChange={(e) => setEditedTier({ ...editedTier, basePrice: Number(e.target.value) })}
                  className="w-full rounded-lg border bg-background py-2 pl-7 pr-3 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Price Type</label>
              <select
                value={editedTier.priceUnit}
                onChange={(e) => setEditedTier({ ...editedTier, priceUnit: e.target.value as PriceTier["priceUnit"] })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="starting_at">Starting at</option>
                <option value="flat">Flat rate</option>
                <option value="per_sqft">Per sq ft</option>
                <option value="per_hour">Per hour</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Color</label>
            <div className="flex gap-2">
              {TIER_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setEditedTier({ ...editedTier, color: c.name })}
                  className={`h-8 w-8 rounded-full ${c.bg} ${editedTier.color === c.name ? "ring-2 ring-violet-500 ring-offset-2" : ""}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Features</label>
            <div className="space-y-2">
              {editedTier.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...editedTier.features];
                      newFeatures[i] = e.target.value;
                      setEditedTier({ ...editedTier, features: newFeatures });
                    }}
                    className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm"
                  />
                  <button onClick={() => removeFeature(i)} className="flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:text-destructive">
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addFeature()}
                  placeholder="Add feature..."
                  className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm"
                />
                <button onClick={addFeature} className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-muted/80">
                  <Icon name="plus" size="sm" />
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editedTier.recommended}
              onChange={(e) => setEditedTier({ ...editedTier, recommended: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Mark as recommended</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl border-2 ${tier.recommended ? "border-violet-300" : "border-border"} bg-card p-5 transition-shadow hover:shadow-md`}>
      {tier.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-medium text-white">
          Most Popular
        </div>
      )}

      <div className="mb-3 flex items-start justify-between">
        <div className={`rounded-lg px-3 py-1 ${colorConfig.bg} ${colorConfig.text}`}>
          <span className="text-sm font-medium">{tier.name}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsEditing(true)} className="flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-muted hover:text-foreground">
            <Icon name="edit" size="sm" />
          </button>
          <button onClick={onDuplicate} className="flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-muted hover:text-foreground">
            <Icon name="copy" size="sm" />
          </button>
          <button onClick={onDelete} className="flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-muted hover:text-destructive">
            <Icon name="trash" size="sm" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">${tier.basePrice}</span>
          <span className="text-sm text-muted-foreground">
            {tier.priceUnit === "starting_at" && "starting"}
            {tier.priceUnit === "per_sqft" && "/sq ft"}
            {tier.priceUnit === "per_hour" && "/hour"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
      </div>

      <ul className="space-y-2">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="flex items-center justify-center w-4 h-4 mt-0.5 shrink-0">
              <Icon name="check" size="sm" className="text-emerald-500" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddonRow({
  addon,
  onUpdate,
  onDelete,
}: {
  addon: PriceAddon;
  onUpdate: (addon: PriceAddon) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const unitLabels = { flat: "Flat", per_sqft: "/sq ft", per_hour: "/hour", per_room: "/room" };

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:border-muted-foreground/30">
      <span className="flex items-center justify-center w-6 h-6 text-muted-foreground/50 cursor-grab">
        <Icon name="grip" size="sm" />
      </span>

      {isEditing ? (
        <>
          <input
            type="text"
            value={addon.name}
            onChange={(e) => onUpdate({ ...addon, name: e.target.value })}
            className="flex-1 rounded border bg-background px-2 py-1 text-sm"
          />
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">$</span>
            <input
              type="number"
              value={addon.price}
              onChange={(e) => onUpdate({ ...addon, price: Number(e.target.value) })}
              className="w-16 rounded border bg-background px-2 py-1 text-sm"
            />
          </div>
          <select
            value={addon.unit}
            onChange={(e) => onUpdate({ ...addon, unit: e.target.value as PriceAddon["unit"] })}
            className="rounded border bg-background px-2 py-1 text-sm"
          >
            <option value="flat">Flat</option>
            <option value="per_sqft">/sq ft</option>
            <option value="per_hour">/hour</option>
            <option value="per_room">/room</option>
          </select>
          <button onClick={() => setIsEditing(false)} className="rounded bg-violet-600 px-3 py-1 text-sm text-white">
            Done
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium">{addon.name}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
            ${addon.price} {unitLabels[addon.unit]}
          </span>
          <button onClick={() => setIsEditing(true)} className="flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-muted hover:text-foreground">
            <Icon name="edit" size="sm" />
          </button>
          <button onClick={onDelete} className="flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-muted hover:text-destructive">
            <Icon name="trash" size="sm" />
          </button>
        </>
      )}
    </div>
  );
}

function RuleRow({
  rule,
  onUpdate,
  onDelete,
}: {
  rule: PriceRule;
  onUpdate: (rule: PriceRule) => void;
  onDelete: () => void;
}) {
  const formatValue = () => {
    if (rule.type === "multiplier") return `${rule.value}x`;
    if (rule.type === "percentage_add") return `${rule.value > 0 ? "+" : ""}${rule.value}%`;
    return `${rule.value > 0 ? "+$" : "-$"}${Math.abs(rule.value)}`;
  };

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${rule.enabled ? "bg-card" : "bg-muted/50 opacity-60"}`}>
      <button
        onClick={() => onUpdate({ ...rule, enabled: !rule.enabled })}
        className={`h-5 w-9 rounded-full transition-colors ${rule.enabled ? "bg-violet-600" : "bg-muted-foreground/30"}`}
      >
        <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>

      <div className="flex-1">
        <p className="text-sm font-medium">{rule.name}</p>
        <p className="text-xs text-muted-foreground">{rule.condition}</p>
      </div>

      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${rule.value > 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
        {formatValue()}
      </span>

      <button onClick={onDelete} className="flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-muted hover:text-destructive">
        <Icon name="trash" size="sm" />
      </button>
    </div>
  );
}

function QuotePreview({
  tiers,
  addons,
  rules,
  selectedTier,
  selectedAddons,
  propertySize,
}: {
  tiers: PriceTier[];
  addons: PriceAddon[];
  rules: PriceRule[];
  selectedTier: string;
  selectedAddons: string[];
  propertySize: number;
}) {
  const tier = tiers.find((t) => t.id === selectedTier);
  if (!tier) return null;

  const sizeMultiplier = PROPERTY_SIZES[propertySize]?.multiplier || 1;
  const basePrice = tier.basePrice * sizeMultiplier;

  const selectedAddonItems = addons.filter((a) => selectedAddons.includes(a.id));
  const addonsTotal = selectedAddonItems.reduce((sum, a) => sum + a.price, 0);

  let subtotal = basePrice + addonsTotal;

  const enabledRules = rules.filter((r) => r.enabled);
  const adjustments: { name: string; amount: number }[] = [];

  enabledRules.forEach((rule) => {
    let amount = 0;
    if (rule.type === "multiplier") {
      amount = subtotal * (rule.value - 1);
    } else if (rule.type === "percentage_add") {
      amount = subtotal * (rule.value / 100);
    } else {
      amount = rule.value;
    }
    adjustments.push({ name: rule.name, amount });
  });

  const adjustmentsTotal = adjustments.reduce((sum, a) => sum + a.amount, 0);
  const total = subtotal + adjustmentsTotal;

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 font-semibold">Quote Preview</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>{tier.name} ({PROPERTY_SIZES[propertySize]?.label})</span>
          <span className="font-medium">${basePrice.toFixed(0)}</span>
        </div>

        {selectedAddonItems.map((addon) => (
          <div key={addon.id} className="flex justify-between text-muted-foreground">
            <span className="pl-4">+ {addon.name}</span>
            <span>${addon.price}</span>
          </div>
        ))}

        {adjustments.length > 0 && (
          <>
            <div className="border-t pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(0)}</span>
              </div>
            </div>
            {adjustments.map((adj, i) => (
              <div key={i} className={`flex justify-between ${adj.amount >= 0 ? "text-amber-600" : "text-emerald-600"}`}>
                <span className="pl-4">{adj.name}</span>
                <span>{adj.amount >= 0 ? "+" : "-"}${Math.abs(adj.amount).toFixed(0)}</span>
              </div>
            ))}
          </>
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-violet-600">${total.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB CONFIG
// ============================================================================

interface TabConfig {
  id: string;
  label: string;
  icon: IconName;
  count?: number;
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function PriceBuilderPage() {
  const [activeTab, setActiveTab] = useState<"tiers" | "addons" | "rules" | "preview">("tiers");
  const [tiers, setTiers] = useState<PriceTier[]>(DEFAULT_TIERS);
  const [addons, setAddons] = useState<PriceAddon[]>(DEFAULT_ADDONS);
  const [rules, setRules] = useState<PriceRule[]>(DEFAULT_RULES);

  // Preview state
  const [selectedTier, setSelectedTier] = useState("standard");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [propertySize, setPropertySize] = useState(1);

  const [hasChanges, setHasChanges] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);

  useEffect(() => {
    setHasChanges(true);
  }, [tiers, addons, rules]);

  const addTier = () => {
    setTiers([...tiers, {
      id: `tier-${Date.now()}`,
      name: "New Tier",
      description: "Description",
      basePrice: 149,
      priceUnit: "starting_at",
      features: ["Feature 1", "Feature 2"],
      color: TIER_COLORS[tiers.length % TIER_COLORS.length].name,
    }]);
  };

  const addAddon = () => {
    setAddons([...addons, {
      id: `addon-${Date.now()}`,
      name: "New Add-on",
      price: 25,
      unit: "flat",
    }]);
  };

  const addRule = () => {
    setRules([...rules, {
      id: `rule-${Date.now()}`,
      name: "New Rule",
      type: "percentage_add",
      value: 10,
      condition: "Condition description",
      enabled: true,
    }]);
  };

  const tabs: TabConfig[] = [
    { id: "tiers", label: "Pricing Tiers", icon: "layers", count: tiers.length },
    { id: "addons", label: "Add-ons", icon: "tag", count: addons.length },
    { id: "rules", label: "Price Rules", icon: "settings", count: rules.filter((r) => r.enabled).length },
    { id: "preview", label: "Preview", icon: "eye" },
  ];

  return (
    <Layout title="Price Builder">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <Icon name="dollar" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Price Builder</h1>
              <p className="text-gray-500">Build and customize your service pricing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAISuggestion(true)}
              className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-300"
            >
              <Icon name="sparkles" size="sm" />
              AI Suggestions
            </button>
            <button
              disabled={!hasChanges}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <Icon name="save" size="sm" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100/80 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name={tab.icon} size="sm" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? "bg-primary/10" : "bg-muted"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card-elevated rounded-2xl p-6">
          {/* Tiers Tab */}
          {activeTab === "tiers" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Pricing Tiers</h2>
                  <p className="text-sm text-muted-foreground">Define your service packages with Good-Better-Best pricing</p>
                </div>
                <button onClick={addTier} className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm hover:bg-muted">
                  <Icon name="plus" size="sm" />
                  Add Tier
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {tiers.map((tier) => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    onUpdate={(updated) => setTiers(tiers.map((t) => (t.id === tier.id ? updated : t)))}
                    onDelete={() => setTiers(tiers.filter((t) => t.id !== tier.id))}
                    onDuplicate={() => setTiers([...tiers, { ...tier, id: `tier-${Date.now()}`, name: `${tier.name} (Copy)`, recommended: false }])}
                  />
                ))}
              </div>

              {/* AI Insight */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:bg-violet-950/30">
                <span className="flex items-center justify-center w-5 h-5 mt-0.5">
                  <Icon name="sparkles" size="lg" className="text-violet-600" />
                </span>
                <div>
                  <p className="text-sm font-medium text-violet-800 dark:text-violet-200">AI Insight</p>
                  <p className="mt-1 text-sm text-violet-700 dark:text-violet-300">
                    3-tier pricing (Good-Better-Best) increases revenue by 30%. Most customers (42%) choose the middle option.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add-ons Tab */}
          {activeTab === "addons" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Service Add-ons</h2>
                  <p className="text-sm text-muted-foreground">Extra services customers can add to their booking</p>
                </div>
                <button onClick={addAddon} className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm hover:bg-muted">
                  <Icon name="plus" size="sm" />
                  Add Add-on
                </button>
              </div>

              <div className="space-y-2">
                {addons.map((addon) => (
                  <AddonRow
                    key={addon.id}
                    addon={addon}
                    onUpdate={(updated) => setAddons(addons.map((a) => (a.id === addon.id ? updated : a)))}
                    onDelete={() => setAddons(addons.filter((a) => a.id !== addon.id))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === "rules" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Price Rules</h2>
                  <p className="text-sm text-muted-foreground">Automatic adjustments based on conditions</p>
                </div>
                <button onClick={addRule} className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm hover:bg-muted">
                  <Icon name="plus" size="sm" />
                  Add Rule
                </button>
              </div>

              <div className="space-y-2">
                {rules.map((rule) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onUpdate={(updated) => setRules(rules.map((r) => (r.id === rule.id ? updated : r)))}
                    onDelete={() => setRules(rules.filter((r) => r.id !== rule.id))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-5">
                  <h3 className="mb-4 font-semibold">Configure Quote</h3>

                  {/* Property Size */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">Property Size</label>
                    <div className="grid grid-cols-5 gap-2">
                      {PROPERTY_SIZES.map((size, i) => (
                        <button
                          key={i}
                          onClick={() => setPropertySize(i)}
                          className={`rounded-lg border p-2 text-center text-xs transition-colors ${
                            propertySize === i ? "border-violet-500 bg-violet-50 dark:bg-violet-950/50" : "hover:bg-muted"
                          }`}
                        >
                          <p className="font-medium">{size.label}</p>
                          <p className="text-muted-foreground">{size.sqft}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Tier */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">Service Tier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {tiers.map((tier) => {
                        const colorConfig = TIER_COLORS.find((c) => c.name === tier.color) || TIER_COLORS[0];
                        return (
                          <button
                            key={tier.id}
                            onClick={() => setSelectedTier(tier.id)}
                            className={`rounded-lg border p-3 text-center transition-colors ${
                              selectedTier === tier.id ? `${colorConfig.border} ${colorConfig.bg}` : "hover:bg-muted"
                            }`}
                          >
                            <p className="font-medium">{tier.name}</p>
                            <p className="text-sm text-muted-foreground">${tier.basePrice}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">Add-ons</label>
                    <div className="grid grid-cols-2 gap-2">
                      {addons.map((addon) => (
                        <button
                          key={addon.id}
                          onClick={() =>
                            setSelectedAddons(
                              selectedAddons.includes(addon.id)
                                ? selectedAddons.filter((id) => id !== addon.id)
                                : [...selectedAddons, addon.id]
                            )
                          }
                          className={`flex items-center justify-between rounded-lg border p-2 text-left text-sm transition-colors ${
                            selectedAddons.includes(addon.id) ? "border-violet-500 bg-violet-50 dark:bg-violet-950/50" : "hover:bg-muted"
                          }`}
                        >
                          <span>{addon.name}</span>
                          <span className="text-muted-foreground">+${addon.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <QuotePreview
                tiers={tiers}
                addons={addons}
                rules={rules}
                selectedTier={selectedTier}
                selectedAddons={selectedAddons}
                propertySize={propertySize}
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestion Modal */}
      {showAISuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="sparkles" size="lg" className="text-violet-600" />
                <h3 className="font-semibold">AI Pricing Suggestions</h3>
              </div>
              <button onClick={() => setShowAISuggestion(false)} className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted">
                <Icon name="close" size="lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5">
                    <Icon name="trendUp" size="sm" className="text-emerald-500" />
                  </span>
                  <span className="text-sm font-medium">Increase Revenue</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your Standard tier is priced 15% below market average. Consider raising to $199 starting.
                </p>
                <button className="mt-2 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-200">
                  Apply Suggestion
                </button>
              </div>

              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5">
                    <Icon name="target" size="sm" className="text-blue-500" />
                  </span>
                  <span className="text-sm font-medium">Improve Conversion</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add a "Deep Clean" add-on at $75. 68% of customers in your area request this service.
                </p>
                <button className="mt-2 rounded-lg bg-blue-100 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-200">
                  Add Deep Clean
                </button>
              </div>

              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5">
                    <Icon name="alertCircle" size="sm" className="text-amber-500" />
                  </span>
                  <span className="text-sm font-medium">Missing Opportunity</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You don't have a recurring service discount. Adding 20% off for weekly customers increases retention by 3x.
                </p>
                <button className="mt-2 rounded-lg bg-amber-100 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-200">
                  Add Recurring Discount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
