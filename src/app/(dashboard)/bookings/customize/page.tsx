'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { Icon, IconName } from '@/components/ui/icon';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  logoUrl: string;
  businessName: string;
  tagline: string;
  fontFamily: string;
}

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
  enabled: boolean;
  popular: boolean;
}

interface WidgetSettings {
  showPricing: boolean;
  showEstimatedTime: boolean;
  requirePhone: boolean;
  requireAddress: boolean;
  allowNotes: boolean;
  showTestimonials: boolean;
  showTrustBadges: boolean;
  depositRequired: boolean;
  depositPercent: number;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#7C3AED',
  secondaryColor: '#8B5CF6',
  accentColor: '#A78BFA',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  borderRadius: 12,
  logoUrl: '',
  businessName: 'Your Business',
  tagline: 'Professional cleaning services',
  fontFamily: 'Inter',
};

const DEFAULT_SERVICES: ServiceConfig[] = [
  { id: '1', name: 'Standard Clean', description: 'Regular maintenance cleaning', basePrice: 149, icon: 'sparkles', enabled: true, popular: false },
  { id: '2', name: 'Deep Clean', description: 'Thorough top-to-bottom cleaning', basePrice: 249, icon: 'brush', enabled: true, popular: true },
  { id: '3', name: 'Move In/Out', description: 'Complete move preparation', basePrice: 349, icon: 'truck', enabled: true, popular: false },
  { id: '4', name: 'Post-Construction', description: 'Construction debris cleanup', basePrice: 449, icon: 'hammer', enabled: true, popular: false },
];

const DEFAULT_SETTINGS: WidgetSettings = {
  showPricing: true,
  showEstimatedTime: true,
  requirePhone: true,
  requireAddress: true,
  allowNotes: true,
  showTestimonials: true,
  showTrustBadges: true,
  depositRequired: false,
  depositPercent: 25,
};

// ============================================================================
// PREVIEW COMPONENT - Shows live preview of booking widget
// ============================================================================

function BookingWidgetPreview({
  branding,
  services,
  settings,
  selectedService,
  onSelectService,
}: {
  branding: BrandingConfig;
  services: ServiceConfig[];
  settings: WidgetSettings;
  selectedService: string | null;
  onSelectService: (id: string) => void;
}) {
  const [step, setStep] = React.useState(1);
  const [bedrooms, setBedrooms] = React.useState(3);
  const [bathrooms, setBathrooms] = React.useState(2);

  const enabledServices = services.filter(s => s.enabled);
  const selected = enabledServices.find(s => s.id === selectedService);
  
  // Calculate price
  const basePrice = selected?.basePrice || 0;
  const bedroomPrice = bedrooms * 25;
  const bathroomPrice = bathrooms * 15;
  const total = basePrice + bedroomPrice + bathroomPrice;
  const deposit = settings.depositRequired ? Math.round(total * (settings.depositPercent / 100)) : 0;

  return (
    <div 
      className="rounded-2xl overflow-hidden shadow-2xl border"
      style={{ 
        backgroundColor: branding.backgroundColor,
        fontFamily: branding.fontFamily,
      }}
    >
      {/* Header */}
      <div 
        className="p-6"
        style={{ 
          background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` 
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: branding.accentColor }}
            >
              {branding.businessName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-white font-bold text-lg">{branding.businessName}</h1>
            <p className="text-white/80 text-sm">{branding.tagline}</p>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                s <= step ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6" style={{ color: branding.textColor }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="font-semibold text-lg mb-1">Select Service</h2>
                <p className="text-sm opacity-70">Choose the cleaning type you need</p>
              </div>
              
              <div className="grid gap-3">
                {enabledServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => onSelectService(service.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all relative",
                      selectedService === service.id 
                        ? "border-current shadow-lg" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    style={{ 
                      borderRadius: branding.borderRadius,
                      borderColor: selectedService === service.id ? branding.primaryColor : undefined,
                    }}
                  >
                    {service.popular && (
                      <Badge 
                        className="absolute -top-2 right-3 text-xs"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        Popular
                      </Badge>
                    )}
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-lg text-white"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        <Icon name={service.icon as IconName || 'sparkles'} size="lg" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm opacity-70">{service.description}</p>
                      </div>
                      {settings.showPricing && (
                        <div className="text-right">
                          <p className="font-bold" style={{ color: branding.primaryColor }}>
                            ${service.basePrice}
                          </p>
                          <p className="text-xs opacity-60">starting</p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-semibold text-lg mb-1">Property Details</h2>
                <p className="text-sm opacity-70">Tell us about your space</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Bedrooms</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setBedrooms(n)}
                        className={cn(
                          "w-12 h-12 rounded-lg font-medium transition-all",
                          bedrooms === n 
                            ? "text-white shadow-lg" 
                            : "bg-gray-100 hover:bg-gray-200"
                        )}
                        style={{ 
                          backgroundColor: bedrooms === n ? branding.primaryColor : undefined,
                          borderRadius: branding.borderRadius / 2,
                        }}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setBedrooms(6)}
                      className={cn(
                        "px-4 h-12 rounded-lg font-medium transition-all",
                        bedrooms === 6 
                          ? "text-white shadow-lg" 
                          : "bg-gray-100 hover:bg-gray-200"
                      )}
                      style={{ 
                        backgroundColor: bedrooms === 6 ? branding.primaryColor : undefined,
                        borderRadius: branding.borderRadius / 2,
                      }}
                    >
                      6+
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Bathrooms</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setBathrooms(n)}
                        className={cn(
                          "w-12 h-12 rounded-lg font-medium transition-all",
                          bathrooms === n 
                            ? "text-white shadow-lg" 
                            : "bg-gray-100 hover:bg-gray-200"
                        )}
                        style={{ 
                          backgroundColor: bathrooms === n ? branding.primaryColor : undefined,
                          borderRadius: branding.borderRadius / 2,
                        }}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setBathrooms(5)}
                      className={cn(
                        "px-4 h-12 rounded-lg font-medium transition-all",
                        bathrooms === 5 
                          ? "text-white shadow-lg" 
                          : "bg-gray-100 hover:bg-gray-200"
                      )}
                      style={{ 
                        backgroundColor: bathrooms === 5 ? branding.primaryColor : undefined,
                        borderRadius: branding.borderRadius / 2,
                      }}
                    >
                      5+
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="font-semibold text-lg mb-1">Your Information</h2>
                <p className="text-sm opacity-70">How can we reach you?</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Full Name</Label>
                  <Input 
                    placeholder="John Smith" 
                    className="mt-1" 
                    style={{ borderRadius: branding.borderRadius / 2 }}
                  />
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    className="mt-1" 
                    style={{ borderRadius: branding.borderRadius / 2 }}
                  />
                </div>
                {settings.requirePhone && (
                  <div>
                    <Label className="text-sm">Phone</Label>
                    <Input 
                      type="tel" 
                      placeholder="(555) 123-4567" 
                      className="mt-1" 
                      style={{ borderRadius: branding.borderRadius / 2 }}
                    />
                  </div>
                )}
                {settings.requireAddress && (
                  <div>
                    <Label className="text-sm">Address</Label>
                    <Input 
                      placeholder="123 Main St, City, State" 
                      className="mt-1" 
                      style={{ borderRadius: branding.borderRadius / 2 }}
                    />
                  </div>
                )}
                {settings.allowNotes && (
                  <div>
                    <Label className="text-sm">Special Instructions (optional)</Label>
                    <Textarea 
                      placeholder="Any special requests or access instructions..." 
                      className="mt-1" 
                      rows={2}
                      style={{ borderRadius: branding.borderRadius / 2 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="font-semibold text-lg mb-1">Review & Confirm</h2>
                <p className="text-sm opacity-70">Check your booking details</p>
              </div>

              <div 
                className="p-4 bg-gray-50 space-y-2"
                style={{ borderRadius: branding.borderRadius }}
              >
                <div className="flex justify-between">
                  <span className="opacity-70">Service</span>
                  <span className="font-medium">{selected?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Property</span>
                  <span className="font-medium">{bedrooms} bed, {bathrooms} bath</span>
                </div>
                {settings.showEstimatedTime && (
                  <div className="flex justify-between">
                    <span className="opacity-70">Est. Duration</span>
                    <span className="font-medium">{bedrooms + bathrooms} hours</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="opacity-70">Base Price</span>
                  <span>${basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Bedrooms ({bedrooms})</span>
                  <span>+${bedroomPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Bathrooms ({bathrooms})</span>
                  <span>+${bathroomPrice}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span style={{ color: branding.primaryColor }}>${total}</span>
                </div>
                {settings.depositRequired && (
                  <div className="flex justify-between text-sm" style={{ color: branding.primaryColor }}>
                    <span>Due Now ({settings.depositPercent}%)</span>
                    <span>${deposit}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              className="flex-1"
              style={{ borderRadius: branding.borderRadius }}
            >
              Back
            </Button>
          )}
          <Button
            onClick={() => step < 4 ? setStep(s => s + 1) : null}
            className="flex-1 text-white"
            style={{ 
              backgroundColor: branding.primaryColor,
              borderRadius: branding.borderRadius,
            }}
          >
            {step < 4 ? 'Continue' : `Book Now${settings.depositRequired ? ` - $${deposit}` : ''}`}
          </Button>
        </div>

        {/* Trust badges */}
        {settings.showTrustBadges && (
          <div className="flex items-center justify-center gap-4 mt-6 text-xs opacity-60">
            <div className="flex items-center gap-1">
              <Icon name="shield" size="sm" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="star" size="sm" />
              <span>5-Star Rated</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="check" size="sm" />
              <span>Insured</span>
            </div>
          </div>
        )}
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
  
  // State
  const [loading, setLoading] = React.useState(false);
  const [branding, setBranding] = React.useState<BrandingConfig>({
    ...DEFAULT_BRANDING,
    businessName: business?.name || 'Your Business',
  });
  const [services, setServices] = React.useState<ServiceConfig[]>(DEFAULT_SERVICES);
  const [settings, setSettings] = React.useState<WidgetSettings>(DEFAULT_SETTINGS);
  const [selectedService, setSelectedService] = React.useState<string | null>('2');

  // Update business name when business loads
  React.useEffect(() => {
    if (business?.name) {
      setBranding(prev => ({ ...prev, businessName: business.name }));
    }
  }, [business?.name]);

  const handleSave = async () => {
    if (!businessId) {
      toast.error('No business configured');
      return;
    }
    
    setLoading(true);
    try {
      await fetch(`/api/booking/${businessId}/customization`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'branding',
          data: branding,
        }),
      });
      toast.success('Customization saved!');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const updateService = (id: string, updates: Partial<ServiceConfig>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <Layout title="Booking Customization">
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Booking Widget Customization</h1>
              <p className="text-muted-foreground">
                Design your perfect booking experience with live preview
              </p>
            </div>
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              {loading ? (
                <Icon name="spinner" size="sm" className="animate-spin" />
              ) : (
                <Icon name="save" size="sm" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Main Grid - Controls and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Customization Controls */}
          <div className="space-y-6">
            <Tabs defaultValue="branding" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="branding" className="gap-2">
                  <Icon name="palette" size="sm" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <Icon name="grid" size="sm" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Icon name="settings" size="sm" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Brand Identity</CardTitle>
                    <CardDescription>Customize your brand appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Business Name</Label>
                        <Input
                          value={branding.businessName}
                          onChange={(e) => setBranding(prev => ({ ...prev, businessName: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Tagline</Label>
                        <Input
                          value={branding.tagline}
                          onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Logo URL</Label>
                      <Input
                        value={branding.logoUrl}
                        onChange={(e) => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Colors</CardTitle>
                    <CardDescription>Set your color scheme</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center justify-between">
                          Primary Color
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: branding.primaryColor }}
                          />
                        </Label>
                        <Input
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="mt-1 h-10"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center justify-between">
                          Secondary Color
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: branding.secondaryColor }}
                          />
                        </Label>
                        <Input
                          type="color"
                          value={branding.secondaryColor}
                          onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="mt-1 h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center justify-between">
                          Background
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: branding.backgroundColor }}
                          />
                        </Label>
                        <Input
                          type="color"
                          value={branding.backgroundColor}
                          onChange={(e) => setBranding(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="mt-1 h-10"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center justify-between">
                          Text Color
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: branding.textColor }}
                          />
                        </Label>
                        <Input
                          type="color"
                          value={branding.textColor}
                          onChange={(e) => setBranding(prev => ({ ...prev, textColor: e.target.value }))}
                          className="mt-1 h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Border Radius: {branding.borderRadius}px</Label>
                      <Slider
                        value={[branding.borderRadius]}
                        onValueChange={([v]) => setBranding(prev => ({ ...prev, borderRadius: v }))}
                        min={0}
                        max={24}
                        step={2}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Service Types</CardTitle>
                    <CardDescription>Configure your available services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {services.map((service) => (
                      <div 
                        key={service.id}
                        className={cn(
                          "p-4 rounded-xl border transition-colors",
                          service.enabled ? "bg-white" : "bg-gray-50 opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
                              <Icon name={service.icon as IconName} size="lg" />
                            </div>
                            <div>
                              <Input
                                value={service.name}
                                onChange={(e) => updateService(service.id, { name: e.target.value })}
                                className="font-medium border-0 p-0 h-auto text-base focus-visible:ring-0"
                              />
                              <Input
                                value={service.description}
                                onChange={(e) => updateService(service.id, { description: e.target.value })}
                                className="text-sm text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0"
                              />
                            </div>
                          </div>
                          <Switch
                            checked={service.enabled}
                            onCheckedChange={(checked) => updateService(service.id, { enabled: checked })}
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">Base Price</Label>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <Input
                                type="number"
                                value={service.basePrice}
                                onChange={(e) => updateService(service.id, { basePrice: Number(e.target.value) })}
                                className="w-24"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Popular</Label>
                            <Switch
                              checked={service.popular}
                              onCheckedChange={(checked) => updateService(service.id, { popular: checked })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Form Settings</CardTitle>
                    <CardDescription>Configure booking form fields</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Pricing</Label>
                        <p className="text-xs text-muted-foreground">Display prices on service cards</p>
                      </div>
                      <Switch
                        checked={settings.showPricing}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPricing: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Estimated Time</Label>
                        <p className="text-xs text-muted-foreground">Display duration estimate</p>
                      </div>
                      <Switch
                        checked={settings.showEstimatedTime}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showEstimatedTime: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Phone Number</Label>
                        <p className="text-xs text-muted-foreground">Make phone field required</p>
                      </div>
                      <Switch
                        checked={settings.requirePhone}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requirePhone: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Address</Label>
                        <p className="text-xs text-muted-foreground">Make address field required</p>
                      </div>
                      <Switch
                        checked={settings.requireAddress}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireAddress: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Notes</Label>
                        <p className="text-xs text-muted-foreground">Show special instructions field</p>
                      </div>
                      <Switch
                        checked={settings.allowNotes}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowNotes: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Trust Badges</Label>
                        <p className="text-xs text-muted-foreground">Display security and rating badges</p>
                      </div>
                      <Switch
                        checked={settings.showTrustBadges}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showTrustBadges: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Settings</CardTitle>
                    <CardDescription>Configure deposit requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Deposit</Label>
                        <p className="text-xs text-muted-foreground">Collect deposit at booking</p>
                      </div>
                      <Switch
                        checked={settings.depositRequired}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, depositRequired: checked }))}
                      />
                    </div>
                    {settings.depositRequired && (
                      <div>
                        <Label>Deposit Percentage: {settings.depositPercent}%</Label>
                        <Slider
                          value={[settings.depositPercent]}
                          onValueChange={([v]) => setSettings(prev => ({ ...prev, depositPercent: v }))}
                          min={10}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <div className="mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon name="eye" size="sm" />
                Live Preview
              </h3>
              <p className="text-sm text-muted-foreground">
                See your changes in real-time
              </p>
            </div>
            <div className="bg-gray-100 rounded-2xl p-6">
              <BookingWidgetPreview
                branding={branding}
                services={services}
                settings={settings}
                selectedService={selectedService}
                onSelectService={setSelectedService}
              />
            </div>
            
            {/* Embed Code */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="code" size="sm" />
                  Embed Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="block p-3 bg-gray-100 rounded-lg text-xs overflow-x-auto">
                  {`<script src="https://app.selestial.io/embed.js" data-business="${businessId}"></script>`}
                </code>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`<script src="https://app.selestial.io/embed.js" data-business="${businessId}"></script>`);
                    toast.success('Embed code copied!');
                  }}
                >
                  <Icon name="copy" size="sm" />
                  Copy Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
