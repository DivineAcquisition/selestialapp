'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon, IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface PricingModel {
  primary_method: string;
  bed_bath_config: any;
  sqft_config: any;
  sqft_tiers: any[];
  flat_rate_config: any;
  hourly_config: any;
  room_count_config: any;
  service_multipliers: Record<string, number>;
  day_pricing: any;
  time_pricing: any;
  rush_pricing: any;
  minimum_order: number;
  minimum_order_message: string;
  round_to_nearest: number;
  tax_rate: number;
  tax_included: boolean;
  tax_label: string;
}

interface PricingModelEditorProps {
  businessId: string;
  model: PricingModel;
  serviceTypes: Array<{ id: string; name: string; slug: string }>;
  onSave: (model: PricingModel) => Promise<void>;
}

// ============================================================================
// PRICING METHODS
// ============================================================================

const PRICING_METHODS: Array<{
  value: string;
  label: string;
  description: string;
  icon: IconName;
}> = [
  {
    value: 'bedroom_bathroom',
    label: 'Bedroom/Bathroom',
    description: 'Price based on number of bedrooms and bathrooms',
    icon: 'home',
  },
  {
    value: 'sqft',
    label: 'Square Footage',
    description: 'Price based on home square footage',
    icon: 'ruler',
  },
  {
    value: 'sqft_tiered',
    label: 'Tiered Sqft',
    description: 'Different rates for different size ranges',
    icon: 'layers',
  },
  {
    value: 'hourly',
    label: 'Hourly Rate',
    description: 'Price based on estimated or selected hours',
    icon: 'clock',
  },
  {
    value: 'flat_rate',
    label: 'Flat Rate',
    description: 'Fixed prices per service with size tiers',
    icon: 'dollarSign',
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Combine multiple pricing methods',
    icon: 'calculator',
  },
];

// ============================================================================
// DEFAULT MODEL
// ============================================================================

const DEFAULT_MODEL: PricingModel = {
  primary_method: 'bedroom_bathroom',
  bed_bath_config: {
    base_price: 80,
    price_per_bedroom: 25,
    price_per_bathroom: 20,
    price_per_half_bath: 10,
    price_per_additional_room: 15,
    max_bedrooms: 10,
    max_bathrooms: 8,
    studio_price: 70,
    include_common_areas: true,
  },
  sqft_config: {
    price_per_sqft: 0.10,
    minimum_sqft: 500,
    maximum_sqft: 10000,
    minimum_charge: 100,
    round_to_nearest: 100,
  },
  sqft_tiers: [
    { min_sqft: 0, max_sqft: 1000, price_per_sqft: 0.12, label: 'Small' },
    { min_sqft: 1001, max_sqft: 2000, price_per_sqft: 0.10, label: 'Medium' },
    { min_sqft: 2001, max_sqft: 3000, price_per_sqft: 0.08, label: 'Large' },
    { min_sqft: 3001, max_sqft: 999999, price_per_sqft: 0.07, label: 'XL' },
  ],
  flat_rate_config: {
    property_size_tiers: [
      { name: 'Small', max_sqft: 1000, max_beds: 2, multiplier: 0.8 },
      { name: 'Medium', max_sqft: 2000, max_beds: 3, multiplier: 1.0 },
      { name: 'Large', max_sqft: 3000, max_beds: 4, multiplier: 1.3 },
      { name: 'XL', max_sqft: 999999, max_beds: 99, multiplier: 1.6 },
    ],
  },
  hourly_config: {
    base_hourly_rate: 45,
    minimum_hours: 2,
    hour_increments: 0.5,
    estimate_hours_per_bedroom: 0.5,
    estimate_hours_per_bathroom: 0.5,
    estimate_hours_base: 1.5,
    show_time_estimate: true,
    allow_customer_select_hours: false,
  },
  room_count_config: {
    price_per_room: 20,
    base_price: 60,
    count_bedrooms: true,
    count_bathrooms: true,
    count_kitchen: true,
    count_living_areas: true,
    kitchen_multiplier: 1.5,
    bathroom_multiplier: 1.2,
  },
  service_multipliers: {
    standard: 1.0,
    deep: 1.5,
    move: 2.0,
    construction: 2.5,
    airbnb: 1.2,
  },
  day_pricing: {
    enabled: false,
    adjustments: {
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 10,
      sun: 15,
    },
    adjustment_type: 'percentage',
  },
  time_pricing: {
    enabled: false,
    early_bird: { start: '07:00', end: '09:00', adjustment: -5 },
    prime_time: { start: '10:00', end: '14:00', adjustment: 0 },
    evening: { start: '17:00', end: '20:00', adjustment: 10 },
  },
  rush_pricing: {
    enabled: false,
    same_day: { adjustment: 25, type: 'percentage' },
    next_day: { adjustment: 15, type: 'percentage' },
    within_48h: { adjustment: 10, type: 'percentage' },
  },
  minimum_order: 75,
  minimum_order_message: 'Minimum order of $75 required',
  round_to_nearest: 5,
  tax_rate: 0,
  tax_included: false,
  tax_label: 'Sales Tax',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PricingModelEditor({
  businessId,
  model: initialModel,
  serviceTypes,
  onSave,
}: PricingModelEditorProps) {
  const [model, setModel] = React.useState<PricingModel>({ ...DEFAULT_MODEL, ...initialModel });
  const [saving, setSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  
  // Track changes
  const updateModel = (updates: Partial<PricingModel>) => {
    setModel((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };
  
  const updateNestedConfig = (key: keyof PricingModel, updates: any) => {
    setModel((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as any), ...updates },
    }));
    setHasChanges(true);
  };
  
  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(model);
      setHasChanges(false);
      toast.success('Pricing model saved');
    } catch (error) {
      toast.error('Failed to save pricing model');
    } finally {
      setSaving(false);
    }
  };
  
  // Reset
  const handleReset = () => {
    setModel({ ...DEFAULT_MODEL, ...initialModel });
    setHasChanges(false);
  };
  
  // Preview calculation
  const previewPrice = React.useMemo(() => {
    // Simple preview calculation for bed/bath
    if (model.primary_method === 'bedroom_bathroom') {
      const config = model.bed_bath_config;
      return config.base_price + (3 * config.price_per_bedroom) + (2 * config.price_per_bathroom);
    }
    return 0;
  }, [model]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pricing Model</h2>
          <p className="text-sm text-muted-foreground">
            Configure how prices are calculated for your services
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="ghost" onClick={handleReset}>
              <Icon name="rotateCcw" size="sm" className="mr-2" />
              Reset
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Icon name="save" size="sm" className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      {/* Primary Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Primary Pricing Method</CardTitle>
          <CardDescription>
            Choose how the base price is calculated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRICING_METHODS.map((method) => {
              const isSelected = model.primary_method === method.value;
              
              return (
                <button
                  key={method.value}
                  onClick={() => updateModel({ primary_method: method.value })}
                  className={cn(
                    'flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all',
                    isSelected
                      ? 'border-violet-600 bg-violet-50'
                      : 'border-border hover:border-violet-300'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-violet-600 text-white' : 'bg-muted'
                  )}>
                    <Icon name={method.icon} size="lg" />
                  </div>
                  <div>
                    <p className="font-medium">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Method-Specific Configuration */}
      <Tabs defaultValue="base" className="space-y-4">
        <TabsList>
          <TabsTrigger value="base">Base Pricing</TabsTrigger>
          <TabsTrigger value="multipliers">Service Multipliers</TabsTrigger>
          <TabsTrigger value="adjustments">Dynamic Adjustments</TabsTrigger>
          <TabsTrigger value="global">Global Settings</TabsTrigger>
        </TabsList>
        
        {/* Base Pricing Tab */}
        <TabsContent value="base" className="space-y-4">
          {/* Bedroom/Bathroom Config */}
          {model.primary_method === 'bedroom_bathroom' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bedroom/Bathroom Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Base Price</Label>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">$</span>
                      <Input
                        type="number"
                        value={model.bed_bath_config.base_price}
                        onChange={(e) => updateNestedConfig('bed_bath_config', {
                          base_price: parseFloat(e.target.value) || 0,
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Per Bedroom</Label>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">$</span>
                      <Input
                        type="number"
                        value={model.bed_bath_config.price_per_bedroom}
                        onChange={(e) => updateNestedConfig('bed_bath_config', {
                          price_per_bedroom: parseFloat(e.target.value) || 0,
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Per Full Bath</Label>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">$</span>
                      <Input
                        type="number"
                        value={model.bed_bath_config.price_per_bathroom}
                        onChange={(e) => updateNestedConfig('bed_bath_config', {
                          price_per_bathroom: parseFloat(e.target.value) || 0,
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Per Half Bath</Label>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">$</span>
                      <Input
                        type="number"
                        value={model.bed_bath_config.price_per_half_bath}
                        onChange={(e) => updateNestedConfig('bed_bath_config', {
                          price_per_half_bath: parseFloat(e.target.value) || 0,
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Studio Price</Label>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">$</span>
                      <Input
                        type="number"
                        value={model.bed_bath_config.studio_price}
                        onChange={(e) => updateNestedConfig('bed_bath_config', {
                          studio_price: parseFloat(e.target.value) || 0,
                        })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Price for 0-bedroom units</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Bedrooms</Label>
                    <Input
                      type="number"
                      value={model.bed_bath_config.max_bedrooms}
                      onChange={(e) => updateNestedConfig('bed_bath_config', {
                        max_bedrooms: parseInt(e.target.value) || 10,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Bathrooms</Label>
                    <Input
                      type="number"
                      value={model.bed_bath_config.max_bathrooms}
                      onChange={(e) => updateNestedConfig('bed_bath_config', {
                        max_bathrooms: parseInt(e.target.value) || 8,
                      })}
                    />
                  </div>
                </div>
                
                {/* Preview */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Price Preview (3 bed, 2 bath)</p>
                  <div className="text-2xl font-bold text-violet-600">
                    ${previewPrice.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    = ${model.bed_bath_config.base_price} base + 
                    (3 × ${model.bed_bath_config.price_per_bedroom}) + 
                    (2 × ${model.bed_bath_config.price_per_bathroom})
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Square Footage Config */}
          {(model.primary_method === 'sqft' || model.primary_method === 'sqft_tiered') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Square Footage Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {model.primary_method === 'sqft' && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Price Per Sqft</Label>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={model.sqft_config.price_per_sqft}
                          onChange={(e) => updateNestedConfig('sqft_config', {
                            price_per_sqft: parseFloat(e.target.value) || 0,
                          })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Sqft</Label>
                      <Input
                        type="number"
                        value={model.sqft_config.minimum_sqft}
                        onChange={(e) => updateNestedConfig('sqft_config', {
                          minimum_sqft: parseInt(e.target.value) || 500,
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Charge</Label>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">$</span>
                        <Input
                          type="number"
                          value={model.sqft_config.minimum_charge}
                          onChange={(e) => updateNestedConfig('sqft_config', {
                            minimum_charge: parseFloat(e.target.value) || 0,
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {model.primary_method === 'sqft_tiered' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Pricing Tiers</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const tiers = [...model.sqft_tiers];
                          const lastTier = tiers[tiers.length - 1];
                          tiers.push({
                            min_sqft: lastTier?.max_sqft + 1 || 0,
                            max_sqft: (lastTier?.max_sqft || 0) + 1000,
                            price_per_sqft: 0.08,
                            label: 'New Tier',
                          });
                          updateModel({ sqft_tiers: tiers });
                        }}
                      >
                        <Icon name="plus" size="sm" className="mr-1" />
                        Add Tier
                      </Button>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Label</TableHead>
                          <TableHead>Min Sqft</TableHead>
                          <TableHead>Max Sqft</TableHead>
                          <TableHead>Price/Sqft</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {model.sqft_tiers.map((tier, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                value={tier.label}
                                onChange={(e) => {
                                  const tiers = [...model.sqft_tiers];
                                  tiers[index].label = e.target.value;
                                  updateModel({ sqft_tiers: tiers });
                                }}
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={tier.min_sqft}
                                onChange={(e) => {
                                  const tiers = [...model.sqft_tiers];
                                  tiers[index].min_sqft = parseInt(e.target.value) || 0;
                                  updateModel({ sqft_tiers: tiers });
                                }}
                                className="h-8 w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={tier.max_sqft}
                                onChange={(e) => {
                                  const tiers = [...model.sqft_tiers];
                                  tiers[index].max_sqft = parseInt(e.target.value) || 0;
                                  updateModel({ sqft_tiers: tiers });
                                }}
                                className="h-8 w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="text-muted-foreground mr-1">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={tier.price_per_sqft}
                                  onChange={(e) => {
                                    const tiers = [...model.sqft_tiers];
                                    tiers[index].price_per_sqft = parseFloat(e.target.value) || 0;
                                    updateModel({ sqft_tiers: tiers });
                                  }}
                                  className="h-8 w-20"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  const tiers = model.sqft_tiers.filter((_, i) => i !== index);
                                  updateModel({ sqft_tiers: tiers });
                                }}
                                disabled={model.sqft_tiers.length <= 1}
                              >
                                <Icon name="trash" size="sm" className="text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Hourly Config */}
          {model.primary_method === 'hourly' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hourly Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Hourly Rate</Label>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">$</span>
                      <Input
                        type="number"
                        value={model.hourly_config.base_hourly_rate}
                        onChange={(e) => updateNestedConfig('hourly_config', {
                          base_hourly_rate: parseFloat(e.target.value) || 0,
                        })}
                      />
                      <span className="text-muted-foreground ml-2">/hr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Hours</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={model.hourly_config.minimum_hours}
                      onChange={(e) => updateNestedConfig('hourly_config', {
                        minimum_hours: parseFloat(e.target.value) || 1,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hour Increments</Label>
                    <Select
                      value={model.hourly_config.hour_increments.toString()}
                      onValueChange={(v) => updateNestedConfig('hourly_config', {
                        hour_increments: parseFloat(v),
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25">15 minutes</SelectItem>
                        <SelectItem value="0.5">30 minutes</SelectItem>
                        <SelectItem value="1">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="mb-4 block">Time Estimation</Label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Base Hours</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={model.hourly_config.estimate_hours_base}
                        onChange={(e) => updateNestedConfig('hourly_config', {
                          estimate_hours_base: parseFloat(e.target.value) || 0,
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Hours/Bedroom</Label>
                      <Input
                        type="number"
                        step="0.25"
                        value={model.hourly_config.estimate_hours_per_bedroom}
                        onChange={(e) => updateNestedConfig('hourly_config', {
                          estimate_hours_per_bedroom: parseFloat(e.target.value) || 0,
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Hours/Bathroom</Label>
                      <Input
                        type="number"
                        step="0.25"
                        value={model.hourly_config.estimate_hours_per_bathroom}
                        onChange={(e) => updateNestedConfig('hourly_config', {
                          estimate_hours_per_bathroom: parseFloat(e.target.value) || 0,
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Customer to Select Hours</Label>
                    <p className="text-sm text-muted-foreground">
                      Let customers choose their own booking duration
                    </p>
                  </div>
                  <Switch
                    checked={model.hourly_config.allow_customer_select_hours}
                    onCheckedChange={(checked) => updateNestedConfig('hourly_config', {
                      allow_customer_select_hours: checked,
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Service Multipliers Tab */}
        <TabsContent value="multipliers">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Type Multipliers</CardTitle>
              <CardDescription>
                Apply different pricing multipliers to each service type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceTypes.map((service) => {
                  const multiplier = model.service_multipliers[service.slug] || 1;
                  
                  return (
                    <div key={service.id} className="flex items-center gap-4">
                      <div className="w-40">
                        <p className="font-medium">{service.name}</p>
                      </div>
                      <div className="flex-1">
                        <Slider
                          value={[multiplier * 100]}
                          onValueChange={([value]) => {
                            updateModel({
                              service_multipliers: {
                                ...model.service_multipliers,
                                [service.slug]: value / 100,
                              },
                            });
                          }}
                          min={50}
                          max={300}
                          step={5}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <Badge variant={multiplier > 1 ? 'default' : 'secondary'}>
                          ×{multiplier.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="w-24 text-right text-sm text-muted-foreground">
                        {multiplier > 1 ? `+${((multiplier - 1) * 100).toFixed(0)}%` : 'Base'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Dynamic Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-4">
          {/* Day of Week Pricing */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="sun" size="lg" className="text-amber-500" />
                      <div>
                        <CardTitle className="text-base">Day of Week Pricing</CardTitle>
                        <CardDescription>
                          Charge more on weekends or less on slow days
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={model.day_pricing.enabled}
                        onCheckedChange={(checked) => {
                          updateNestedConfig('day_pricing', { enabled: checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Icon name="chevronDown" size="sm" />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-7 gap-2">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                      <div key={day} className="space-y-2">
                        <Label className="text-center block capitalize">{day}</Label>
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground mr-1">
                            {model.day_pricing.adjustment_type === 'percentage' ? '%' : '$'}
                          </span>
                          <Input
                            type="number"
                            className="h-8 text-center"
                            value={model.day_pricing.adjustments[day] || 0}
                            onChange={(e) => {
                              updateNestedConfig('day_pricing', {
                                adjustments: {
                                  ...model.day_pricing.adjustments,
                                  [day]: parseInt(e.target.value) || 0,
                                },
                              });
                            }}
                            disabled={!model.day_pricing.enabled}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          
          {/* Rush/Same-Day Pricing */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="zap" size="lg" className="text-amber-500" />
                      <div>
                        <CardTitle className="text-base">Rush Pricing</CardTitle>
                        <CardDescription>
                          Charge extra for same-day or short-notice bookings
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={model.rush_pricing.enabled}
                        onCheckedChange={(checked) => {
                          updateNestedConfig('rush_pricing', { enabled: checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Icon name="chevronDown" size="sm" />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {[
                      { key: 'same_day', label: 'Same Day', desc: 'Less than 24 hours notice' },
                      { key: 'next_day', label: 'Next Day', desc: '24-48 hours notice' },
                      { key: 'within_48h', label: 'Short Notice', desc: '48-72 hours notice' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center gap-4">
                        <div className="w-32">
                          <p className="font-medium text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">+</span>
                          <Input
                            type="number"
                            className="w-20 h-8"
                            value={(model.rush_pricing as any)[key]?.adjustment || 0}
                            onChange={(e) => {
                              updateNestedConfig('rush_pricing', {
                                [key]: {
                                  ...(model.rush_pricing as any)[key],
                                  adjustment: parseInt(e.target.value) || 0,
                                },
                              });
                            }}
                            disabled={!model.rush_pricing.enabled}
                          />
                          <Select
                            value={(model.rush_pricing as any)[key]?.type || 'percentage'}
                            onValueChange={(v) => {
                              updateNestedConfig('rush_pricing', {
                                [key]: {
                                  ...(model.rush_pricing as any)[key],
                                  type: v,
                                },
                              });
                            }}
                            disabled={!model.rush_pricing.enabled}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">%</SelectItem>
                              <SelectItem value="flat">$</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          
          {/* Time of Day Pricing */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="clock" size="lg" className="text-blue-500" />
                      <div>
                        <CardTitle className="text-base">Time of Day Pricing</CardTitle>
                        <CardDescription>
                          Offer early bird discounts or charge extra for evening slots
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={model.time_pricing.enabled}
                        onCheckedChange={(checked) => {
                          updateNestedConfig('time_pricing', { enabled: checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Icon name="chevronDown" size="sm" />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {[
                      { key: 'early_bird', label: 'Early Bird', icon: 'sun' as IconName },
                      { key: 'prime_time', label: 'Prime Time', icon: 'clock' as IconName },
                      { key: 'evening', label: 'Evening', icon: 'moon' as IconName },
                    ].map(({ key, label, icon }) => (
                      <div key={key} className="flex items-center gap-4">
                        <Icon name={icon} size="sm" className="text-muted-foreground" />
                        <div className="w-24">
                          <p className="font-medium text-sm">{label}</p>
                        </div>
                        <Input
                          type="time"
                          className="w-28 h-8"
                          value={(model.time_pricing as any)[key]?.start || ''}
                          onChange={(e) => {
                            updateNestedConfig('time_pricing', {
                              [key]: {
                                ...(model.time_pricing as any)[key],
                                start: e.target.value,
                              },
                            });
                          }}
                          disabled={!model.time_pricing.enabled}
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          className="w-28 h-8"
                          value={(model.time_pricing as any)[key]?.end || ''}
                          onChange={(e) => {
                            updateNestedConfig('time_pricing', {
                              [key]: {
                                ...(model.time_pricing as any)[key],
                                end: e.target.value,
                              },
                            });
                          }}
                          disabled={!model.time_pricing.enabled}
                        />
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            className="w-16 h-8"
                            value={(model.time_pricing as any)[key]?.adjustment || 0}
                            onChange={(e) => {
                              updateNestedConfig('time_pricing', {
                                [key]: {
                                  ...(model.time_pricing as any)[key],
                                  adjustment: parseInt(e.target.value) || 0,
                                },
                              });
                            }}
                            disabled={!model.time_pricing.enabled}
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </TabsContent>
        
        {/* Global Settings Tab */}
        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Global Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Minimum Order</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input
                      type="number"
                      value={model.minimum_order}
                      onChange={(e) => updateModel({
                        minimum_order: parseFloat(e.target.value) || 0,
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Round Prices To</Label>
                  <Select
                    value={model.round_to_nearest.toString()}
                    onValueChange={(v) => updateModel({ round_to_nearest: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">$1</SelectItem>
                      <SelectItem value="5">$5</SelectItem>
                      <SelectItem value="10">$10</SelectItem>
                      <SelectItem value="0">Don&apos;t round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Tax Settings</Label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Tax Rate</Label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        step="0.01"
                        value={(model.tax_rate * 100).toFixed(2)}
                        onChange={(e) => updateModel({
                          tax_rate: (parseFloat(e.target.value) || 0) / 100,
                        })}
                      />
                      <span className="text-muted-foreground ml-2">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Tax Label</Label>
                    <Input
                      value={model.tax_label}
                      onChange={(e) => updateModel({ tax_label: e.target.value })}
                      placeholder="Sales Tax"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      checked={model.tax_included}
                      onCheckedChange={(checked) => updateModel({ tax_included: checked })}
                    />
                    <Label>Tax included in prices</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Minimum Order Message</Label>
                <Input
                  value={model.minimum_order_message}
                  onChange={(e) => updateModel({ minimum_order_message: e.target.value })}
                  placeholder="Minimum order of $75 required"
                />
                <p className="text-xs text-muted-foreground">
                  Shown when order doesn&apos;t meet minimum
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
