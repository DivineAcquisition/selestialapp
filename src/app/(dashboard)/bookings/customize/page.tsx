'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Layout from '@/components/layout/Layout';
import { Icon, IconName } from '@/components/ui/icon';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

type Niche = 'cleaning' | 'hvac' | 'plumbing' | null;
type SetupStep = 'niche' | 'branding' | 'pricing' | 'services' | 'promotion' | 'preview' | 'complete';

interface SqftTier {
  id: string;
  label: string;
  minSqft: number;
  maxSqft: number | null;
  price: number;
  enabled: boolean;
}

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  features: string[];
  basePrice: number;
  discountPercent: number;
  badge: string;
  popular: boolean;
  enabled: boolean;
}

interface BookingConfig {
  niche: Niche;
  businessName: string;
  phone: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  sqftTiers: SqftTier[];
  services: ServiceOption[];
  promotionEnabled: boolean;
  promotionText: string;
  discountPercent: number;
  depositPercent: number;
  serviceZips: string[];
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_SQFT_TIERS: SqftTier[] = [
  { id: '1', label: '1,000-1,500', minSqft: 1000, maxSqft: 1500, price: 189, enabled: true },
  { id: '2', label: '1,501-2,000', minSqft: 1501, maxSqft: 2000, price: 229, enabled: true },
  { id: '3', label: '2,001-2,500', minSqft: 2001, maxSqft: 2500, price: 269, enabled: true },
  { id: '4', label: '2,501-3,000', minSqft: 2501, maxSqft: 3000, price: 309, enabled: true },
  { id: '5', label: '3,001-3,500', minSqft: 3001, maxSqft: 3500, price: 349, enabled: true },
  { id: '6', label: '3,501-4,000', minSqft: 3501, maxSqft: 4000, price: 389, enabled: true },
];

const DEFAULT_SERVICES: ServiceOption[] = [
  {
    id: '1',
    name: 'Tester Deep Clean',
    description: 'One-time intensive cleaning',
    features: [
      '40-point deep clean checklist',
      '2-person professional crew',
      '~4 hours of service',
      'All supplies included',
    ],
    basePrice: 269,
    discountPercent: 20,
    badge: 'Popular',
    popular: true,
    enabled: true,
  },
  {
    id: '2',
    name: '90-Day Reset & Maintain',
    description: '3 visits over 90 days',
    features: [
      'Initial deep clean + 2 maintenance visits',
      'Save $180 vs individual bookings',
      'Flexible monthly payments',
      'Priority scheduling',
    ],
    basePrice: 597,
    discountPercent: 0,
    badge: 'Best Value',
    popular: false,
    enabled: true,
  },
];

const DEFAULT_CONFIG: BookingConfig = {
  niche: null,
  businessName: '',
  phone: '',
  logoUrl: '',
  primaryColor: '#1E3A5F',
  accentColor: '#10B981',
  sqftTiers: DEFAULT_SQFT_TIERS,
  services: DEFAULT_SERVICES,
  promotionEnabled: true,
  promotionText: 'Get 20% Off Your First Deep Clean!',
  discountPercent: 20,
  depositPercent: 25,
  serviceZips: [],
};

// ============================================================================
// NICHE SELECTION STEP
// ============================================================================

function NicheSelectionStep({
  onSelect,
}: {
  onSelect: (niche: Niche) => void;
}) {
  const niches = [
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: 'sparkles' as IconName,
      description: 'Residential & commercial cleaning services',
      available: true,
      color: '#10B981',
    },
    {
      id: 'hvac',
      name: 'HVAC',
      icon: 'thermometer' as IconName,
      description: 'Heating, ventilation & air conditioning',
      available: false,
      color: '#3B82F6',
    },
    {
      id: 'plumbing',
      name: 'Plumbing',
      icon: 'droplet' as IconName,
      description: 'Plumbing repair & installation services',
      available: false,
      color: '#8B5CF6',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="home" size="2xl" className="text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Set Up Your Booking Widget</h1>
        <p className="text-muted-foreground">
          Select your home service niche to get started with a customized booking experience
        </p>
      </div>

      <div className="grid gap-4">
        {niches.map((niche) => (
          <motion.button
            key={niche.id}
            whileHover={{ scale: niche.available ? 1.02 : 1 }}
            whileTap={{ scale: niche.available ? 0.98 : 1 }}
            onClick={() => niche.available && onSelect(niche.id as Niche)}
            disabled={!niche.available}
            className={cn(
              "relative p-6 rounded-2xl border-2 text-left transition-all",
              niche.available 
                ? "hover:border-violet-500 hover:shadow-lg cursor-pointer" 
                : "opacity-60 cursor-not-allowed bg-gray-50"
            )}
          >
            {!niche.available && (
              <Badge className="absolute top-4 right-4 bg-gray-500">
                Coming Soon
              </Badge>
            )}
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: niche.color }}
              >
                <Icon name={niche.icon} size="xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{niche.name}</h3>
                <p className="text-sm text-muted-foreground">{niche.description}</p>
              </div>
              {niche.available && (
                <Icon name="chevronRight" size="lg" className="text-muted-foreground mt-3" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BRANDING STEP
// ============================================================================

function BrandingStep({
  config,
  updateConfig,
  onNext,
  onBack,
}: {
  config: BookingConfig;
  updateConfig: (updates: Partial<BookingConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = config.businessName.trim().length > 0;

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="palette" size="xl" className="text-violet-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Brand Your Widget</h2>
        <p className="text-muted-foreground text-sm">
          Customize how your booking widget looks to customers
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label className="text-sm font-medium">Business Name *</Label>
            <Input
              value={config.businessName}
              onChange={(e) => updateConfig({ businessName: e.target.value })}
              placeholder="Alpha Lux Clean"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Phone Number</Label>
            <Input
              value={config.phone}
              onChange={(e) => updateConfig({ phone: e.target.value })}
              placeholder="(512) 555-0123"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Logo URL (optional)</Label>
            <Input
              value={config.logoUrl}
              onChange={(e) => updateConfig({ logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="mt-1.5"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                Primary Color
                <div 
                  className="w-6 h-6 rounded-md border shadow-sm"
                  style={{ backgroundColor: config.primaryColor }}
                />
              </Label>
              <Input
                type="color"
                value={config.primaryColor}
                onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                className="mt-1.5 h-10 cursor-pointer"
              />
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                Accent Color
                <div 
                  className="w-6 h-6 rounded-md border shadow-sm"
                  style={{ backgroundColor: config.accentColor }}
                />
              </Label>
              <Input
                type="color"
                value={config.accentColor}
                onChange={(e) => updateConfig({ accentColor: e.target.value })}
                className="mt-1.5 h-10 cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <Icon name="chevronLeft" size="sm" className="mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue} className="flex-1">
          Continue
          <Icon name="chevronRight" size="sm" className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// PRICING STEP
// ============================================================================

function PricingStep({
  config,
  updateConfig,
  onNext,
  onBack,
}: {
  config: BookingConfig;
  updateConfig: (updates: Partial<BookingConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const updateTier = (id: string, updates: Partial<SqftTier>) => {
    updateConfig({
      sqftTiers: config.sqftTiers.map(tier =>
        tier.id === id ? { ...tier, ...updates } : tier
      ),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="dollarSign" size="xl" className="text-violet-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Set Your Pricing</h2>
        <p className="text-muted-foreground text-sm">
          Configure pricing tiers based on home square footage
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {config.sqftTiers.map((tier) => (
              <div 
                key={tier.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                  tier.enabled ? "bg-white" : "bg-gray-50 opacity-60"
                )}
              >
                <Switch
                  checked={tier.enabled}
                  onCheckedChange={(checked) => updateTier(tier.id, { enabled: checked })}
                />
                <div className="flex-1">
                  <p className="font-medium">{tier.label} sq ft</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={tier.price}
                    onChange={(e) => updateTier(tier.id, { price: Number(e.target.value) })}
                    className="w-24"
                    disabled={!tier.enabled}
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div>
            <Label className="text-sm font-medium">Deposit Percentage: {config.depositPercent}%</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Amount customers pay upfront to reserve their booking
            </p>
            <Slider
              value={[config.depositPercent]}
              onValueChange={([v]) => updateConfig({ depositPercent: v })}
              min={10}
              max={100}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10%</span>
              <span>100% (Full payment)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <Icon name="chevronLeft" size="sm" className="mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
          <Icon name="chevronRight" size="sm" className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// SERVICES STEP
// ============================================================================

function ServicesStep({
  config,
  updateConfig,
  onNext,
  onBack,
}: {
  config: BookingConfig;
  updateConfig: (updates: Partial<BookingConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const updateService = (id: string, updates: Partial<ServiceOption>) => {
    updateConfig({
      services: config.services.map(svc =>
        svc.id === id ? { ...svc, ...updates } : svc
      ),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="sparkles" size="xl" className="text-violet-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Configure Services</h2>
        <p className="text-muted-foreground text-sm">
          Set up the service packages customers can choose from
        </p>
      </div>

      <div className="space-y-4">
        {config.services.map((service) => (
          <Card key={service.id} className={cn(!service.enabled && "opacity-60")}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={service.enabled}
                    onCheckedChange={(checked) => updateService(service.id, { enabled: checked })}
                  />
                  <div>
                    <Input
                      value={service.name}
                      onChange={(e) => updateService(service.id, { name: e.target.value })}
                      className="font-semibold text-lg border-0 p-0 h-auto focus-visible:ring-0"
                      disabled={!service.enabled}
                    />
                    <Input
                      value={service.description}
                      onChange={(e) => updateService(service.id, { description: e.target.value })}
                      className="text-sm text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0"
                      disabled={!service.enabled}
                    />
                  </div>
                </div>
                {service.popular && (
                  <Badge style={{ backgroundColor: config.accentColor }}>
                    {service.badge}
                  </Badge>
                )}
              </div>

              {service.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Base Price ($)</Label>
                      <Input
                        type="number"
                        value={service.basePrice}
                        onChange={(e) => updateService(service.id, { basePrice: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Discount (%)</Label>
                      <Input
                        type="number"
                        value={service.discountPercent}
                        onChange={(e) => updateService(service.id, { discountPercent: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Features (one per line)</Label>
                    <Textarea
                      value={service.features.join('\n')}
                      onChange={(e) => updateService(service.id, { features: e.target.value.split('\n').filter(Boolean) })}
                      rows={4}
                      className="mt-1 text-sm"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <Icon name="chevronLeft" size="sm" className="mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
          <Icon name="chevronRight" size="sm" className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// PROMOTION STEP
// ============================================================================

function PromotionStep({
  config,
  updateConfig,
  onNext,
  onBack,
}: {
  config: BookingConfig;
  updateConfig: (updates: Partial<BookingConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="tag" size="xl" className="text-violet-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Promotion Banner</h2>
        <p className="text-muted-foreground text-sm">
          Create an offer to attract new customers
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <Label className="font-medium">Enable Promotion</Label>
              <p className="text-xs text-muted-foreground">Show promotional banner</p>
            </div>
            <Switch
              checked={config.promotionEnabled}
              onCheckedChange={(checked) => updateConfig({ promotionEnabled: checked })}
            />
          </div>

          {config.promotionEnabled && (
            <>
              <div>
                <Label className="text-sm font-medium">Promotion Headline</Label>
                <Input
                  value={config.promotionText}
                  onChange={(e) => updateConfig({ promotionText: e.target.value })}
                  placeholder="Get 20% Off Your First Deep Clean!"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Discount Percentage: {config.discountPercent}%</Label>
                <Slider
                  value={[config.discountPercent]}
                  onValueChange={([v]) => updateConfig({ discountPercent: v })}
                  min={5}
                  max={50}
                  step={5}
                  className="mt-3"
                />
              </div>

              {/* Preview */}
              <div 
                className="p-4 rounded-xl text-center text-white"
                style={{ backgroundColor: config.primaryColor }}
              >
                <p className="font-semibold">{config.promotionText}</p>
                <p className="text-sm opacity-80">Professional cleaning you can trust</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <Icon name="chevronLeft" size="sm" className="mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Preview Widget
          <Icon name="eye" size="sm" className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW STEP - Shows full booking widget preview
// ============================================================================

function PreviewStep({
  config,
  onNext,
  onBack,
}: {
  config: BookingConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const [previewStep, setPreviewStep] = React.useState(1);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Preview Your Booking Widget</h2>
        <p className="text-muted-foreground text-sm">
          This is how customers will see your booking flow
        </p>
      </div>

      {/* Step selector */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <button
            key={step}
            onClick={() => setPreviewStep(step)}
            className={cn(
              "w-10 h-10 rounded-full font-medium text-sm transition-all",
              previewStep === step 
                ? "text-white shadow-lg" 
                : "bg-gray-100 hover:bg-gray-200"
            )}
            style={{ 
              backgroundColor: previewStep === step ? config.primaryColor : undefined 
            }}
          >
            {step}
          </button>
        ))}
      </div>

      {/* Preview Container */}
      <div className="bg-gray-100 rounded-2xl p-6">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md mx-auto">
          {/* Widget Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="" className="h-8 w-8 rounded" />
              ) : (
                <div 
                  className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {config.businessName.charAt(0) || 'B'}
                </div>
              )}
              <span className="font-semibold text-sm">{config.businessName || 'Your Business'}</span>
            </div>
            {config.phone && (
              <span className="text-xs text-muted-foreground">{config.phone}</span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-2 border-b">
            <div className="flex justify-between text-xs mb-1">
              <span>Step {previewStep} of 6</span>
              <span style={{ color: config.primaryColor }}>{Math.round((previewStep / 6) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  backgroundColor: config.primaryColor,
                  width: `${(previewStep / 6) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {previewStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Trust Badge */}
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <Icon name="check" size="xs" className="text-white" />
                      </div>
                      <span className="text-xs font-medium text-green-700">Google Guaranteed</span>
                    </div>
                  </div>

                  {/* Promotion */}
                  {config.promotionEnabled && (
                    <div 
                      className="p-4 rounded-xl text-center text-white"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <p className="font-semibold">{config.promotionText}</p>
                      <p className="text-sm opacity-80">Professional cleaning you can trust</p>
                    </div>
                  )}

                  {/* ZIP Input */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Enter ZIP Code</Label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="75001" className="text-center" />
                        <Button style={{ backgroundColor: config.primaryColor }}>
                          Check
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {previewStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-center">How big is your home?</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {config.sqftTiers.filter(t => t.enabled).slice(0, 4).map((tier) => (
                      <button
                        key={tier.id}
                        className="p-3 rounded-lg border-2 text-center hover:border-gray-400"
                      >
                        <p className="font-medium text-sm">{tier.label}</p>
                        <p className="text-xs text-muted-foreground">sq ft</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: config.primaryColor }}>
                          From ${tier.price}
                        </p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {previewStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-center">Choose Your Perfect Clean</h3>
                  {config.services.filter(s => s.enabled).map((service) => (
                    <div key={service.id} className="p-4 rounded-xl border-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{service.name}</span>
                        {service.popular && (
                          <Badge style={{ backgroundColor: config.accentColor }}>{service.badge}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <div className="flex items-center gap-2">
                        {service.discountPercent > 0 && (
                          <span className="text-muted-foreground line-through">${service.basePrice}</span>
                        )}
                        <span className="font-bold" style={{ color: config.primaryColor }}>
                          ${Math.round(service.basePrice * (1 - service.discountPercent / 100))}
                        </span>
                        {service.discountPercent > 0 && (
                          <Badge variant="outline" className="text-xs">{service.discountPercent}% OFF</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {previewStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-center">Secure Payment</h3>
                  <div className="p-4 rounded-xl bg-gray-50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Deep Clean Service</span>
                      <span>$269</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount (20%)</span>
                      <span>-$53.80</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>$215.20</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Due Today ({config.depositPercent}%)</span>
                      <span className="font-bold">${(215.20 * config.depositPercent / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input placeholder="Card Number" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="MM/YY" />
                      <Input placeholder="CVC" />
                    </div>
                  </div>
                </motion.div>
              )}

              {previewStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="p-3 rounded-lg bg-green-50 text-green-700 text-center text-sm">
                    ✅ Payment Successful! Now let's schedule your clean.
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Street Address</Label>
                      <Input placeholder="123 Main St" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm">City</Label>
                        <Input placeholder="Austin" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm">State</Label>
                        <Input placeholder="TX" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Preferred Time</Label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {['Morning', 'Afternoon', 'Evening'].map((time) => (
                          <button
                            key={time}
                            className="p-2 rounded-lg border text-xs hover:border-gray-400"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {previewStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-4"
                >
                  <div 
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    <Icon name="check" size="2xl" className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">🎉 Booking Confirmed!</h3>
                    <p className="text-sm text-muted-foreground">Check your email for confirmation details</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 text-left text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium">Deep Clean</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">Thursday, Jan 9</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit Paid</span>
                      <span className="font-medium text-green-600">$53.80</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust Badges Footer */}
          <div className="px-4 py-3 border-t flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="lock" size="xs" /> Secure
            </span>
            <span className="flex items-center gap-1">
              <Icon name="clock" size="xs" /> 48hr Guarantee
            </span>
            <span className="flex items-center gap-1">
              <Icon name="shield" size="xs" /> Insured
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <Icon name="chevronLeft" size="sm" className="mr-2" />
          Edit Settings
        </Button>
        <Button onClick={onNext} className="flex-1 bg-green-600 hover:bg-green-700">
          <Icon name="check" size="sm" className="mr-2" />
          Publish Widget
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPLETE STEP
// ============================================================================

function CompleteStep({
  config,
  businessId,
}: {
  config: BookingConfig;
  businessId: string;
}) {
  const bookingUrl = `https://book.selestial.io/${businessId}/${config.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const embedCode = `<script src="https://book.selestial.io/embed.js" data-business="${businessId}"></script>`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
      >
        <Icon name="check" size="3xl" className="text-green-600" />
      </motion.div>

      <h2 className="text-2xl font-bold mb-2">🎉 Your Booking Widget is Live!</h2>
      <p className="text-muted-foreground mb-8">
        Share your booking link or embed it on your website
      </p>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium">Direct Booking Link</Label>
            <div className="flex gap-2 mt-2">
              <Input value={bookingUrl} readOnly className="text-sm" />
              <Button variant="outline" onClick={() => copyToClipboard(bookingUrl, 'Link')}>
                <Icon name="copy" size="sm" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium">Embed Code</Label>
            <code className="block p-3 bg-gray-100 rounded-lg text-xs mt-2 text-left overflow-x-auto">
              {embedCode}
            </code>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => copyToClipboard(embedCode, 'Embed code')}
            >
              <Icon name="copy" size="sm" className="mr-2" />
              Copy Embed Code
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" asChild>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="externalLink" size="sm" className="mr-2" />
              View Live
            </a>
          </Button>
          <Button className="flex-1" onClick={() => window.location.reload()}>
            <Icon name="settings" size="sm" className="mr-2" />
            Edit Widget
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function BookingCustomizePage() {
  const { business } = useBusiness();
  const businessId = business?.id || '';
  
  const [step, setStep] = React.useState<SetupStep>('niche');
  const [config, setConfig] = React.useState<BookingConfig>({
    ...DEFAULT_CONFIG,
    businessName: business?.name || '',
  });
  const [saving, setSaving] = React.useState(false);

  // Update business name when loaded
  React.useEffect(() => {
    if (business?.name && !config.businessName) {
      setConfig(prev => ({ ...prev, businessName: business.name }));
    }
  }, [business?.name]);

  const updateConfig = (updates: Partial<BookingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleNicheSelect = (niche: Niche) => {
    updateConfig({ niche });
    setStep('branding');
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await fetch(`/api/booking/${businessId}/customization`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'full_config',
          data: config,
        }),
      });
      setStep('complete');
      toast.success('Booking widget published!');
    } catch (error) {
      toast.error('Failed to publish widget');
    } finally {
      setSaving(false);
    }
  };

  // Calculate progress
  const steps: SetupStep[] = ['niche', 'branding', 'pricing', 'services', 'promotion', 'preview'];
  const currentStepIndex = steps.indexOf(step);
  const progress = step === 'complete' ? 100 : Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <Layout title="Booking Widget Setup">
      <div className="min-h-screen pb-12">
        {/* Progress indicator */}
        {step !== 'niche' && step !== 'complete' && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Setup Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-violet-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'niche' && (
              <NicheSelectionStep onSelect={handleNicheSelect} />
            )}

            {step === 'branding' && (
              <BrandingStep
                config={config}
                updateConfig={updateConfig}
                onNext={() => setStep('pricing')}
                onBack={() => setStep('niche')}
              />
            )}

            {step === 'pricing' && (
              <PricingStep
                config={config}
                updateConfig={updateConfig}
                onNext={() => setStep('services')}
                onBack={() => setStep('branding')}
              />
            )}

            {step === 'services' && (
              <ServicesStep
                config={config}
                updateConfig={updateConfig}
                onNext={() => setStep('promotion')}
                onBack={() => setStep('pricing')}
              />
            )}

            {step === 'promotion' && (
              <PromotionStep
                config={config}
                updateConfig={updateConfig}
                onNext={() => setStep('preview')}
                onBack={() => setStep('services')}
              />
            )}

            {step === 'preview' && (
              <PreviewStep
                config={config}
                onNext={handlePublish}
                onBack={() => setStep('promotion')}
              />
            )}

            {step === 'complete' && (
              <CompleteStep config={config} businessId={businessId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}
