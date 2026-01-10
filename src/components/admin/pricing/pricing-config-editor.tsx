'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, DollarSign, Calculator, Clock, Home } from 'lucide-react';

interface PricingConfig {
  business_id: string;
  pricing_method: string;
  base_price: number;
  per_bedroom: number;
  per_bathroom: number;
  per_half_bath: number;
  price_per_sqft: number;
  sqft_minimum_charge: number;
  hourly_rate: number;
  minimum_hours: number;
  team_size_default: number;
  flat_rates: Record<string, number>;
  minimum_charge: number;
  currency: string;
  tax_rate: number;
  tax_included: boolean;
  require_deposit: boolean;
  deposit_type: string;
  deposit_value: number;
  deposit_minimum: number;
}

interface PricingConfigEditorProps {
  businessId: string;
  initialConfig?: PricingConfig;
  onSave?: (config: PricingConfig) => void;
}

const PRICING_METHODS = [
  { value: 'bedroom_bathroom', label: 'Bedroom/Bathroom', description: 'Base price + per room charges' },
  { value: 'sqft', label: 'Square Footage', description: 'Price per square foot' },
  { value: 'sqft_tiered', label: 'Tiered Sqft', description: 'Different rates for size ranges' },
  { value: 'flat_rate', label: 'Flat Rate', description: 'Fixed price by home size' },
  { value: 'hourly', label: 'Hourly', description: 'Based on estimated time' },
  { value: 'hybrid', label: 'Hybrid', description: 'Uses higher of bedroom or sqft' },
];

const HOME_TYPES = [
  { key: 'studio', label: 'Studio' },
  { key: '1br', label: '1 Bedroom' },
  { key: '2br', label: '2 Bedrooms' },
  { key: '3br', label: '3 Bedrooms' },
  { key: '4br', label: '4 Bedrooms' },
  { key: '5br', label: '5 Bedrooms' },
  { key: '6br_plus', label: '6+ Bedrooms' },
];

const DEFAULT_CONFIG: PricingConfig = {
  business_id: '',
  pricing_method: 'bedroom_bathroom',
  base_price: 120,
  per_bedroom: 15,
  per_bathroom: 25,
  per_half_bath: 12.5,
  price_per_sqft: 0.10,
  sqft_minimum_charge: 100,
  hourly_rate: 35,
  minimum_hours: 2,
  team_size_default: 1,
  flat_rates: {
    studio: 90,
    '1br': 120,
    '2br': 160,
    '3br': 200,
    '4br': 260,
    '5br': 320,
    '6br_plus': 400,
  },
  minimum_charge: 100,
  currency: 'USD',
  tax_rate: 0,
  tax_included: false,
  require_deposit: true,
  deposit_type: 'percentage',
  deposit_value: 25,
  deposit_minimum: 25,
};

export function PricingConfigEditor({ businessId, initialConfig, onSave }: PricingConfigEditorProps) {
  const [config, setConfig] = useState<PricingConfig>(initialConfig || { ...DEFAULT_CONFIG, business_id: businessId });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch config on mount if not provided
  useEffect(() => {
    if (!initialConfig) {
      fetchConfig();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/booking/${businessId}/pricing/config`);
      const data = await response.json();
      if (data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to fetch pricing config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/booking/${businessId}/pricing/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        setHasChanges(false);
        onSave?.(config);
      }
    } catch (error) {
      console.error('Failed to save pricing config:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = useCallback(<K extends keyof PricingConfig>(key: K, value: PricingConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const updateFlatRate = useCallback((key: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      flat_rates: { ...prev.flat_rates, [key]: value },
    }));
    setHasChanges(true);
  }, []);

  // Calculate sample price
  const calculateSamplePrice = (bedrooms: number, bathrooms: number, sqft?: number) => {
    let price = 0;
    
    switch (config.pricing_method) {
      case 'bedroom_bathroom':
        price = config.base_price + 
          Math.max(0, bedrooms - 1) * config.per_bedroom + 
          Math.max(0, bathrooms - 1) * config.per_bathroom;
        break;
      case 'sqft':
        price = Math.max((sqft || 0) * config.price_per_sqft, config.sqft_minimum_charge);
        break;
      case 'flat_rate':
        const homeType = bedrooms <= 0 ? 'studio' : 
          bedrooms === 1 ? '1br' : 
          bedrooms === 2 ? '2br' : 
          bedrooms === 3 ? '3br' : 
          bedrooms === 4 ? '4br' : 
          bedrooms === 5 ? '5br' : '6br_plus';
        price = config.flat_rates[homeType] || config.minimum_charge;
        break;
      case 'hourly':
        const hours = Math.max(config.minimum_hours, 1.5 + bedrooms * 0.5 + bathrooms * 0.5);
        price = hours * config.hourly_rate * config.team_size_default;
        break;
    }
    
    return Math.max(price, config.minimum_charge);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pricing Configuration</h2>
          <p className="text-muted-foreground">
            Set up your cleaning service pricing structure
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="method" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="method">Pricing Method</TabsTrigger>
          <TabsTrigger value="rates">Rate Settings</TabsTrigger>
          <TabsTrigger value="deposit">Deposit & Tax</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Pricing Method Tab */}
        <TabsContent value="method" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pricing Method
              </CardTitle>
              <CardDescription>
                Choose how you calculate cleaning service prices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PRICING_METHODS.map((method) => (
                  <div
                    key={method.value}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      config.pricing_method === method.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => updateConfig('pricing_method', method.value)}
                  >
                    <div className="font-medium">{method.label}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                    {config.pricing_method === method.value && (
                      <Badge className="mt-2" variant="secondary">Selected</Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Label>Minimum Charge</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    value={config.minimum_charge}
                    onChange={(e) => updateConfig('minimum_charge', parseFloat(e.target.value) || 0)}
                    className="pl-9"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  The minimum price for any cleaning service
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Settings Tab */}
        <TabsContent value="rates" className="space-y-4">
          {/* Bedroom/Bathroom Settings */}
          {(config.pricing_method === 'bedroom_bathroom' || config.pricing_method === 'hybrid') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Bedroom/Bathroom Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Base Price</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      value={config.base_price}
                      onChange={(e) => updateConfig('base_price', parseFloat(e.target.value) || 0)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label>Per Bedroom (after first)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      value={config.per_bedroom}
                      onChange={(e) => updateConfig('per_bedroom', parseFloat(e.target.value) || 0)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label>Per Bathroom (after first)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      value={config.per_bathroom}
                      onChange={(e) => updateConfig('per_bathroom', parseFloat(e.target.value) || 0)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label>Per Half Bath</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      value={config.per_half_bath}
                      onChange={(e) => updateConfig('per_half_bath', parseFloat(e.target.value) || 0)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Square Footage Settings */}
          {(config.pricing_method === 'sqft' || config.pricing_method === 'sqft_tiered' || config.pricing_method === 'hybrid') && (
            <Card>
              <CardHeader>
                <CardTitle>Square Footage Pricing</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Price per Sq Ft</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      value={config.price_per_sqft}
                      onChange={(e) => updateConfig('price_per_sqft', parseFloat(e.target.value) || 0)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label>Minimum Charge</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      value={config.sqft_minimum_charge}
                      onChange={(e) => updateConfig('sqft_minimum_charge', parseFloat(e.target.value) || 0)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Flat Rate Settings */}
          {config.pricing_method === 'flat_rate' && (
            <Card>
              <CardHeader>
                <CardTitle>Flat Rate by Home Size</CardTitle>
                <CardDescription>
                  Set fixed prices for each home size category
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {HOME_TYPES.map((type) => (
                  <div key={type.key}>
                    <Label>{type.label}</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="number"
                        value={config.flat_rates[type.key] || 0}
                        onChange={(e) => updateFlatRate(type.key, parseFloat(e.target.value) || 0)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Hourly Settings */}
          {config.pricing_method === 'hourly' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hourly Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Hourly Rate</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      value={config.hourly_rate}
                      onChange={(e) => updateConfig('hourly_rate', parseFloat(e.target.value) || 0)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label>Minimum Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={config.minimum_hours}
                    onChange={(e) => updateConfig('minimum_hours', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Default Team Size</Label>
                  <Input
                    type="number"
                    value={config.team_size_default}
                    onChange={(e) => updateConfig('team_size_default', parseInt(e.target.value) || 1)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Deposit & Tax Tab */}
        <TabsContent value="deposit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Deposit</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect a deposit when booking
                  </p>
                </div>
                <Switch
                  checked={config.require_deposit}
                  onCheckedChange={(checked) => updateConfig('require_deposit', checked)}
                />
              </div>

              {config.require_deposit && (
                <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
                  <div>
                    <Label>Deposit Type</Label>
                    <Select
                      value={config.deposit_type}
                      onValueChange={(value) => updateConfig('deposit_type', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                        <SelectItem value="full">Full Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {config.deposit_type !== 'full' && (
                    <>
                      <div>
                        <Label>Deposit {config.deposit_type === 'percentage' ? 'Percentage' : 'Amount'}</Label>
                        <div className="relative mt-1">
                          {config.deposit_type === 'flat' && (
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          )}
                          <Input
                            type="number"
                            value={config.deposit_value}
                            onChange={(e) => updateConfig('deposit_value', parseFloat(e.target.value) || 0)}
                            className={config.deposit_type === 'flat' ? 'pl-9' : ''}
                          />
                          {config.deposit_type === 'percentage' && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Minimum Deposit</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            value={config.deposit_minimum}
                            onChange={(e) => updateConfig('deposit_minimum', parseFloat(e.target.value) || 0)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(config.tax_rate * 100).toFixed(2)}
                    onChange={(e) => updateConfig('tax_rate', (parseFloat(e.target.value) || 0) / 100)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <div>
                    <Label>Tax Included in Price</Label>
                    <p className="text-sm text-muted-foreground">
                      Prices already include tax
                    </p>
                  </div>
                  <Switch
                    checked={config.tax_included}
                    onCheckedChange={(checked) => updateConfig('tax_included', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Preview</CardTitle>
              <CardDescription>
                See how prices calculate with your current settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { beds: 1, baths: 1, sqft: 750, label: '1 Bed / 1 Bath' },
                  { beds: 2, baths: 1, sqft: 1000, label: '2 Bed / 1 Bath' },
                  { beds: 2, baths: 2, sqft: 1200, label: '2 Bed / 2 Bath' },
                  { beds: 3, baths: 2, sqft: 1600, label: '3 Bed / 2 Bath' },
                  { beds: 4, baths: 2.5, sqft: 2200, label: '4 Bed / 2.5 Bath' },
                  { beds: 5, baths: 3, sqft: 3000, label: '5 Bed / 3 Bath' },
                ].map((sample) => (
                  <div key={sample.label} className="rounded-lg border p-4">
                    <div className="font-medium">{sample.label}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      ~{sample.sqft.toLocaleString()} sq ft
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ${calculateSamplePrice(sample.beds, sample.baths, sample.sqft).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PricingConfigEditor;
