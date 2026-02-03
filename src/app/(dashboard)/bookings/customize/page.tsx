'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import Layout from '@/components/layout/Layout';
import { Icon, IconName } from '@/components/ui/icon';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  PricingConfigurator, 
  AddOnsConfigurator, 
  PriceCalculatorPreview,
  DEFAULT_PRICING_CONFIG,
  type PricingConfig,
} from '@/components/booking/pricing-configurator';

// ============================================================================
// TYPES
// ============================================================================

type Niche = 'cleaning' | 'hvac' | 'plumbing' | null;

interface TrustBadgeConfig {
  id: string;
  type: string;
  enabled: boolean;
  label: string;
  sublabel?: string;
}

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  discountPercent: number;
  popular: boolean;
  enabled: boolean;
}

interface BookingWidgetConfig {
  id: string;
  name: string;
  niche: Niche;
  status: 'draft' | 'active' | 'paused';
  businessName: string;
  phone: string;
  email: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  pricingConfig?: PricingConfig;
  services: ServiceOption[];
  trustBadges: TrustBadgeConfig[];
  showRating: boolean;
  ratingValue: number;
  reviewCount: number;
  promotionEnabled: boolean;
  promotionHeadline: string;
  promotionSubheadline: string;
  discountPercent: number;
  promotionExpiry: string;
  depositPercent: number;
  minimumPrice: number;
  serviceZips: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_TRUST_BADGES: TrustBadgeConfig[] = [
  { id: '1', type: 'google_guaranteed', enabled: false, label: 'Google Guaranteed', sublabel: "Backed by Google's guarantee" },
  { id: '2', type: 'google_screened', enabled: false, label: 'Google Screened', sublabel: 'Background checked' },
  { id: '3', type: 'bbb', enabled: false, label: 'BBB Accredited', sublabel: 'A+ Rating' },
  { id: '4', type: 'angies_list', enabled: false, label: "Angi's List", sublabel: 'Super Service Award' },
  { id: '5', type: 'thumbtack', enabled: false, label: 'Thumbtack Pro', sublabel: 'Top Pro' },
  { id: '6', type: 'homeadvisor', enabled: false, label: 'HomeAdvisor', sublabel: 'Screened & Approved' },
];

const DEFAULT_SERVICES: ServiceOption[] = [
  { id: '1', name: 'Standard Clean', description: 'Regular maintenance cleaning', basePrice: 0, discountPercent: 0, popular: false, enabled: true },
  { id: '2', name: 'Deep Clean', description: 'Intensive top-to-bottom cleaning', basePrice: 50, discountPercent: 20, popular: true, enabled: true },
  { id: '3', name: 'Move In/Out', description: 'Complete move preparation cleaning', basePrice: 100, discountPercent: 0, popular: false, enabled: true },
];

const createDefaultConfig = (businessId: string, businessName: string): BookingWidgetConfig => ({
  id: crypto.randomUUID(),
  name: 'My Booking Widget',
  niche: 'cleaning',
  status: 'draft',
  businessName,
  phone: '',
  email: '',
  logoUrl: '',
  primaryColor: '#1E3A5F',
  accentColor: '#10B981',
  pricingConfig: DEFAULT_PRICING_CONFIG,
  services: DEFAULT_SERVICES,
  trustBadges: DEFAULT_TRUST_BADGES,
  showRating: true,
  ratingValue: 4.9,
  reviewCount: 127,
  promotionEnabled: true,
  promotionHeadline: 'Get 20% Off Your First Clean!',
  promotionSubheadline: 'Professional cleaning you can trust',
  discountPercent: 20,
  promotionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  depositPercent: 25,
  minimumPrice: 99,
  serviceZips: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// ============================================================================
// STRIPE CONNECTION CHECK
// ============================================================================

function StripeConnectionBanner({ businessId }: { businessId: string }) {
  const [checking, setChecking] = React.useState(true);
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    const checkStripe = async () => {
      try {
        const res = await fetch(`/api/stripe/connect/status?businessId=${businessId}`);
        const data = await res.json();
        setConnected(data.connected || false);
      } catch {
        setConnected(false);
      }
      setChecking(false);
    };
    if (businessId) checkStripe();
  }, [businessId]);

  if (checking) return null;

  if (!connected) {
    return (
      <Alert className="border-yellow-500 bg-yellow-50">
        <Icon name="alertTriangle" size="lg" className="text-yellow-600" />
        <AlertTitle className="text-yellow-800">Stripe Not Connected</AlertTitle>
        <AlertDescription className="text-yellow-700">
          You need to connect Stripe to accept payments from your booking widget.{' '}
          <a href="/connections" className="font-medium underline hover:no-underline">
            Connect Stripe →
          </a>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-500 bg-green-50">
      <Icon name="checkCircle" size="lg" className="text-green-600" />
      <AlertTitle className="text-green-800">Stripe Connected</AlertTitle>
      <AlertDescription className="text-green-700">
        You're ready to accept payments through your booking widget.
      </AlertDescription>
    </Alert>
  );
}

// ============================================================================
// PRICING WIZARD PROMPT
// ============================================================================

function PricingWizardPrompt() {
  return (
    <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-100">
            <Icon name="sparkles" size="xl" className="text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Struggling with pricing?</h3>
            <p className="text-muted-foreground mb-4">
              Our AI-powered Pricing Wizard analyzes your business, costs, and market to recommend optimal prices that maximize your revenue.
            </p>
            <Button asChild>
              <a href="/pricing">
                <Icon name="calculator" size="sm" className="mr-2" />
                Open Pricing Wizard
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DOCS LINK CARD
// ============================================================================

function DocsLinkCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Icon name="fileText" size="lg" className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Need Help?</p>
            <p className="text-sm text-muted-foreground">Learn how each feature works</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="https://docs.selestial.io/booking-widget" target="_blank" rel="noopener noreferrer">
              <Icon name="externalLink" size="sm" className="mr-1" />
              View Docs
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// WIDGET PREVIEW PANEL
// ============================================================================

function WidgetPreviewPanel({ config }: { config: BookingWidgetConfig }) {
  const [previewStep, setPreviewStep] = React.useState(0);
  const steps = ['ZIP', 'Size', 'Service', 'Checkout', 'Schedule', 'Confirm'];

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon name="eye" size="sm" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Step selector */}
        <div className="flex gap-1 px-4 mb-3">
          {steps.map((step, idx) => (
            <button
              key={step}
              onClick={() => setPreviewStep(idx)}
              className={cn(
                "flex-1 px-1 py-1 text-[10px] font-medium rounded transition-colors",
                previewStep === idx ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {step}
            </button>
          ))}
        </div>

        {/* Preview frame */}
        <div className="mx-4 mb-4 rounded-lg border overflow-hidden" style={{ borderColor: config.primaryColor + '30' }}>
          {/* Header */}
          <div className="p-3 text-white text-sm" style={{ backgroundColor: config.primaryColor }}>
            <div className="flex items-center gap-2">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="" className="h-8 w-8 rounded object-cover" />
              ) : (
                <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center font-bold text-xs">
                  {config.businessName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium leading-tight">{config.businessName || 'Your Business'}</p>
                <p className="text-[10px] opacity-80">{config.phone || '(555) 123-4567'}</p>
              </div>
            </div>
          </div>

          {/* Promo banner */}
          {config.promotionEnabled && (
            <div className="p-2 text-center text-xs" style={{ backgroundColor: config.accentColor + '15' }}>
              <p className="font-medium" style={{ color: config.accentColor }}>
                {config.promotionHeadline}
              </p>
            </div>
          )}

          {/* Trust badges */}
          {config.trustBadges.some(b => b.enabled) && (
            <div className="p-2 flex flex-wrap justify-center gap-1 border-b">
              {config.trustBadges.filter(b => b.enabled).slice(0, 3).map(badge => (
                <span key={badge.id} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded text-[9px]">
                  <Icon name="shield" size="xs" className="text-green-600" />
                  {badge.label}
                </span>
              ))}
            </div>
          )}

          {/* Content placeholder */}
          <div className="p-4 min-h-[120px] flex items-center justify-center">
            <div className="text-center">
              <Icon name={['mapPin', 'home', 'layers', 'creditCard', 'calendar', 'check'][previewStep] as IconName} size="xl" className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{steps[previewStep]} Step</p>
            </div>
          </div>

          {/* Rating footer */}
          {config.showRating && (
            <div className="p-2 border-t bg-gray-50 text-center">
              <div className="flex items-center justify-center gap-0.5 text-yellow-400">
                {[1,2,3,4,5].map(i => <Icon key={i} name="star" size="xs" />)}
                <span className="ml-1 text-xs font-medium text-gray-700">{config.ratingValue}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">{config.reviewCount} reviews</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function BookingCustomizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { business } = useBusiness();
  const businessId = business?.id || '';
  const businessName = business?.name || 'My Business';

  // State
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [config, setConfig] = React.useState<BookingWidgetConfig | null>(null);
  const [activeTab, setActiveTab] = React.useState('branding');
  const [showResetDialog, setShowResetDialog] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Load config
  React.useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    const loadConfig = async () => {
      try {
        const res = await fetch(`/api/booking/widget-config?businessId=${businessId}`);
        const data = await res.json();

        if (data.config) {
          setConfig(data.config);
        } else {
          // Create new config
          setConfig(createDefaultConfig(businessId, businessName));
        }
      } catch (err) {
        console.error('Error loading config:', err);
        setConfig(createDefaultConfig(businessId, businessName));
      }
      setLoading(false);
    };

    loadConfig();
  }, [businessId, businessName]);

  // Update config helper
  const updateConfig = (updates: Partial<BookingWidgetConfig>) => {
    if (!config) return;
    setConfig({ ...config, ...updates, updatedAt: new Date().toISOString() });
    setHasUnsavedChanges(true);
  };

  // Save config
  const saveConfig = async () => {
    if (!config || !businessId) return;

    setSaving(true);
    try {
      const res = await fetch('/api/booking/widget-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          config: {
            ...config,
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      toast.success('Widget configuration saved!');
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('Error saving config:', err);
      toast.error(err.message || 'Failed to save configuration. Please try again.');
    }
    setSaving(false);
  };

  // Reset config
  const resetConfig = () => {
    setConfig(createDefaultConfig(businessId, businessName));
    setHasUnsavedChanges(true);
    setShowResetDialog(false);
    toast.success('Configuration reset to defaults');
  };

  // Publish/Unpublish
  const togglePublish = async () => {
    if (!config) return;
    const newStatus = config.status === 'active' ? 'paused' : 'active';
    updateConfig({ status: newStatus });
    await saveConfig();
    toast.success(newStatus === 'active' ? 'Widget is now live!' : 'Widget paused');
  };

  if (loading) {
    return (
      <Layout title="Booking Widget">
        <div className="flex items-center justify-center min-h-96">
          <Icon name="spinner" size="xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!config) {
    return (
      <Layout title="Booking Widget">
        <Card>
          <CardContent className="py-12 text-center">
            <Icon name="alertTriangle" size="xl" className="mx-auto text-yellow-500 mb-4" />
            <h3 className="font-medium">Unable to load configuration</h3>
            <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const bookingUrl = `https://book.selestial.io/${businessId}`;

  return (
    <Layout title="Booking Widget Customization">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/bookings')}>
                <Icon name="chevronLeft" size="sm" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Customize Booking Widget</h1>
                <p className="text-muted-foreground">Configure how customers book your services</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                Unsaved changes
              </Badge>
            )}
            <Button variant="outline" onClick={() => setShowResetDialog(true)}>
              <Icon name="refreshCw" size="sm" className="mr-2" />
              Reset
            </Button>
            <Button variant="outline" onClick={togglePublish}>
              {config.status === 'active' ? (
                <><Icon name="pause" size="sm" className="mr-2" />Pause</>
              ) : (
                <><Icon name="play" size="sm" className="mr-2" />Publish</>
              )}
            </Button>
            <Button onClick={saveConfig} disabled={saving}>
              {saving ? (
                <><Icon name="spinner" size="sm" className="animate-spin mr-2" />Saving...</>
              ) : (
                <><Icon name="save" size="sm" className="mr-2" />Save Changes</>
              )}
            </Button>
          </div>
        </div>

        {/* Stripe Connection Check */}
        <StripeConnectionBanner businessId={businessId} />

        {/* Status & Links */}
          <div className="grid md:grid-cols-3 gap-4">
          <Card className="ring-1 ring-white/50 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    config.status === 'active' ? "bg-green-100" : "bg-gray-100"
                  )}>
                    <Icon 
                      name={config.status === 'active' ? 'checkCircle' : 'pause'} 
                      size="lg" 
                      className={config.status === 'active' ? "text-green-600" : "text-gray-500"} 
                    />
                  </div>
                  <div>
                    <p className="font-medium">Widget Status</p>
                    <p className="text-sm text-muted-foreground capitalize">{config.status}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Icon name="link" size="lg" className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Booking Link</p>
                  <p className="text-sm text-muted-foreground truncate">{bookingUrl}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(bookingUrl);
                    toast.success('Link copied!');
                  }}
                >
                  <Icon name="copy" size="sm" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <DocsLinkCard />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="branding" className="text-xs">
                  <Icon name="palette" size="sm" className="mr-1 hidden sm:inline" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs">
                  <Icon name="dollarSign" size="sm" className="mr-1 hidden sm:inline" />
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="services" className="text-xs">
                  <Icon name="layers" size="sm" className="mr-1 hidden sm:inline" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="trust" className="text-xs">
                  <Icon name="shield" size="sm" className="mr-1 hidden sm:inline" />
                  Trust
                </TabsTrigger>
                <TabsTrigger value="promotion" className="text-xs">
                  <Icon name="tag" size="sm" className="mr-1 hidden sm:inline" />
                  Promo
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  <Icon name="settings" size="sm" className="mr-1 hidden sm:inline" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* BRANDING TAB */}
              <TabsContent value="branding" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Branding</CardTitle>
                    <CardDescription>Customize how your brand appears to customers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Business Name</Label>
                        <Input
                          value={config.businessName}
                          onChange={(e) => updateConfig({ businessName: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={config.phone}
                          onChange={(e) => updateConfig({ phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={config.email}
                          onChange={(e) => updateConfig({ email: e.target.value })}
                          placeholder="hello@yourbusiness.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Logo URL</Label>
                        <Input
                          value={config.logoUrl}
                          onChange={(e) => updateConfig({ logoUrl: e.target.value })}
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                            className="w-16 h-10 cursor-pointer p-1"
                          />
                          <Input
                            value={config.primaryColor}
                            onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Accent Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={config.accentColor}
                            onChange={(e) => updateConfig({ accentColor: e.target.value })}
                            className="w-16 h-10 cursor-pointer p-1"
                          />
                          <Input
                            value={config.accentColor}
                            onChange={(e) => updateConfig({ accentColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Show Rating</Label>
                        <Switch
                          checked={config.showRating}
                          onCheckedChange={(checked) => updateConfig({ showRating: checked })}
                        />
                      </div>
                      {config.showRating && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                          <div>
                            <Label className="text-xs">Rating (1-5)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              value={config.ratingValue}
                              onChange={(e) => updateConfig({ ratingValue: Number(e.target.value) })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Review Count</Label>
                            <Input
                              type="number"
                              value={config.reviewCount}
                              onChange={(e) => updateConfig({ reviewCount: Number(e.target.value) })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PRICING TAB */}
              <TabsContent value="pricing" className="space-y-6 mt-6">
                <PricingWizardPrompt />
                
                {config.pricingConfig ? (
                  <PricingConfigurator
                    config={config.pricingConfig}
                    onChange={(pricingConfig) => updateConfig({ pricingConfig })}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Icon name="calculator" size="xl" className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium">Advanced Pricing Not Configured</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Enable advanced pricing to customize your rates
                      </p>
                      <Button onClick={() => updateConfig({ pricingConfig: DEFAULT_PRICING_CONFIG })}>
                        Enable Advanced Pricing
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* SERVICES TAB */}
              <TabsContent value="services" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Types</CardTitle>
                    <CardDescription>Configure the services customers can book</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {config.services.map((service, idx) => (
                      <div
                        key={service.id}
                        className={cn(
                          "p-4 rounded-xl border transition-colors",
                          service.enabled ? "bg-white" : "bg-gray-50 opacity-70"
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={service.enabled}
                              onCheckedChange={(checked) => {
                                const newServices = [...config.services];
                                newServices[idx] = { ...service, enabled: checked };
                                updateConfig({ services: newServices });
                              }}
                            />
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                          </div>
                          {service.popular && (
                            <Badge className="bg-violet-100 text-violet-700">Popular</Badge>
                          )}
                        </div>

                        {service.enabled && (
                          <div className="pl-12 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">Name</Label>
                                <Input
                                  value={service.name}
                                  onChange={(e) => {
                                    const newServices = [...config.services];
                                    newServices[idx] = { ...service, name: e.target.value };
                                    updateConfig({ services: newServices });
                                  }}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Add-on Price ($)</Label>
                                <Input
                                  type="number"
                                  value={service.basePrice}
                                  onChange={(e) => {
                                    const newServices = [...config.services];
                                    newServices[idx] = { ...service, basePrice: Number(e.target.value) };
                                    updateConfig({ services: newServices });
                                  }}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Discount %</Label>
                                <Input
                                  type="number"
                                  value={service.discountPercent}
                                  onChange={(e) => {
                                    const newServices = [...config.services];
                                    newServices[idx] = { ...service, discountPercent: Number(e.target.value) };
                                    updateConfig({ services: newServices });
                                  }}
                                  className="h-9"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={service.popular}
                                onCheckedChange={(checked) => {
                                  const newServices = [...config.services];
                                  newServices[idx] = { ...service, popular: checked };
                                  updateConfig({ services: newServices });
                                }}
                              />
                              <Label className="text-xs">Mark as Popular</Label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const newService: ServiceOption = {
                          id: crypto.randomUUID(),
                          name: 'New Service',
                          description: 'Service description',
                          basePrice: 0,
                          discountPercent: 0,
                          popular: false,
                          enabled: true,
                        };
                        updateConfig({ services: [...config.services, newService] });
                      }}
                    >
                      <Icon name="plus" size="sm" className="mr-2" />
                      Add Service
                    </Button>
                  </CardContent>
                </Card>

                {/* Add-ons */}
                {config.pricingConfig && (
                  <AddOnsConfigurator
                    addOns={config.pricingConfig.addOns}
                    onChange={(addOns) => updateConfig({
                      pricingConfig: { ...config.pricingConfig!, addOns }
                    })}
                  />
                )}
              </TabsContent>

              {/* TRUST TAB */}
              <TabsContent value="trust" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trust Badges & Credentials</CardTitle>
                    <CardDescription>Display certifications to build customer confidence</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {config.trustBadges.map((badge, idx) => (
                      <div
                        key={badge.id}
                        className={cn(
                          "p-4 rounded-xl border transition-colors",
                          badge.enabled ? "bg-white border-green-200" : "bg-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={badge.enabled}
                              onCheckedChange={(checked) => {
                                const newBadges = [...config.trustBadges];
                                newBadges[idx] = { ...badge, enabled: checked };
                                updateConfig({ trustBadges: newBadges });
                              }}
                            />
                            <div className={cn("p-2 rounded-lg", badge.enabled ? "bg-green-100" : "bg-gray-200")}>
                              <Icon name="shield" size="lg" className={badge.enabled ? "text-green-600" : "text-gray-400"} />
                            </div>
                            <div>
                              <p className={cn("font-medium", !badge.enabled && "text-muted-foreground")}>
                                {badge.label}
                              </p>
                              <p className="text-xs text-muted-foreground">{badge.sublabel}</p>
                            </div>
                          </div>
                        </div>

                        {badge.enabled && (
                          <div className="mt-3 pl-14 grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Display Label</Label>
                              <Input
                                value={badge.label}
                                onChange={(e) => {
                                  const newBadges = [...config.trustBadges];
                                  newBadges[idx] = { ...badge, label: e.target.value };
                                  updateConfig({ trustBadges: newBadges });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Sublabel</Label>
                              <Input
                                value={badge.sublabel || ''}
                                onChange={(e) => {
                                  const newBadges = [...config.trustBadges];
                                  newBadges[idx] = { ...badge, sublabel: e.target.value };
                                  updateConfig({ trustBadges: newBadges });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PROMOTION TAB */}
              <TabsContent value="promotion" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Promotion Banner</CardTitle>
                    <CardDescription>Display a promotional offer to attract customers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <Label>Enable Promotion</Label>
                      <Switch
                        checked={config.promotionEnabled}
                        onCheckedChange={(checked) => updateConfig({ promotionEnabled: checked })}
                      />
                    </div>

                    {config.promotionEnabled && (
                      <div className="space-y-4">
                        <div>
                          <Label>Headline</Label>
                          <Input
                            value={config.promotionHeadline}
                            onChange={(e) => updateConfig({ promotionHeadline: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Subheadline</Label>
                          <Input
                            value={config.promotionSubheadline}
                            onChange={(e) => updateConfig({ promotionSubheadline: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Discount %</Label>
                            <Input
                              type="number"
                              value={config.discountPercent}
                              onChange={(e) => updateConfig({ discountPercent: Number(e.target.value) })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Expiry Date</Label>
                            <Input
                              type="date"
                              value={config.promotionExpiry.split('T')[0]}
                              onChange={(e) => updateConfig({ promotionExpiry: new Date(e.target.value).toISOString() })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SETTINGS TAB */}
              <TabsContent value="settings" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Settings</CardTitle>
                    <CardDescription>Configure deposit, minimum, and service areas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum Price ($)</Label>
                        <Input
                          type="number"
                          value={config.minimumPrice}
                          onChange={(e) => updateConfig({ minimumPrice: Number(e.target.value) })}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Industry standard: $100-$150</p>
                      </div>
                      <div>
                        <Label>Deposit Percentage: {config.depositPercent}%</Label>
                        <Slider
                          value={[config.depositPercent]}
                          onValueChange={([v]) => updateConfig({ depositPercent: v })}
                          min={0}
                          max={100}
                          step={5}
                          className="mt-3"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Industry standard: 25-50%</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Service ZIP Codes</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Enter ZIP codes separated by commas. Leave empty to service all areas.
                      </p>
                      <Textarea
                        value={config.serviceZips.join(', ')}
                        onChange={(e) => {
                          const zips = e.target.value.split(',').map(z => z.trim()).filter(Boolean);
                          updateConfig({ serviceZips: zips });
                        }}
                        placeholder="90210, 90211, 90212..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Embed Code */}
                <Card>
                  <CardHeader>
                    <CardTitle>Embed Code</CardTitle>
                    <CardDescription>Add this code to your website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
{`<iframe 
  src="${bookingUrl}" 
  width="100%" 
  height="800" 
  frameborder="0"
  style="border-radius: 12px;"
></iframe>`}
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          navigator.clipboard.writeText(`<iframe src="${bookingUrl}" width="100%" height="800" frameborder="0" style="border-radius: 12px;"></iframe>`);
                          toast.success('Embed code copied!');
                        }}
                      >
                        <Icon name="copy" size="sm" className="mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <WidgetPreviewPanel config={config} />
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all settings to their defaults. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetConfig} className="bg-red-600 hover:bg-red-700">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
