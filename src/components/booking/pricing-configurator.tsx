'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Icon, IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import {
  PricingMethod,
  ServiceType,
  Frequency,
  MarketTier,
  PriceRange,
  SQFT_PRICING_TIERS,
  BEDROOM_BATHROOM_BASE,
  FLAT_RATE_BY_SIZE,
  HOURLY_RATES,
  SERVICE_MULTIPLIERS,
  ADD_ON_SERVICES,
  FREQUENCY_DISCOUNTS,
  CONDITION_SURCHARGES,
  GEOGRAPHIC_RATES,
  TIME_PREMIUMS,
  BUSINESS_BENCHMARKS,
  calculateComprehensivePrice,
  getPopularAddOns,
  getAddOnsByCategory,
} from '@/lib/cleaning-pricing-matrix';

// ============================================================================
// TYPES
// ============================================================================

export interface PricingConfig {
  // Base Pricing Method
  pricingMethod: PricingMethod;
  
  // Square Footage Settings
  sqftPricing: {
    enabled: boolean;
    tiers: Array<{
      id: string;
      label: string;
      minSqft: number;
      maxSqft: number | null;
      price: number;
      enabled: boolean;
    }>;
  };
  
  // Bedroom/Bathroom Settings
  bedroomBathroomPricing: {
    enabled: boolean;
    basePrice: number;
    perBedroom: number;
    perBathroom: number;
    perHalfBath: number;
  };
  
  // Flat Rate Settings
  flatRatePricing: {
    enabled: boolean;
    rates: Record<string, { standard: number; deep: number }>;
  };
  
  // Hourly Settings
  hourlyPricing: {
    enabled: boolean;
    perCleanerRate: number;
    teamRate: number;
    minimumHours: number;
  };
  
  // Service Multipliers
  serviceMultipliers: {
    standard: number;
    deep: number;
    initial: number;
    moveInOut: number;
    postConstruction: number;
    airbnb: number;
  };
  
  // Frequency Discounts
  frequencyDiscounts: {
    weekly: number;
    biweekly: number;
    monthly: number;
    quarterly: number;
  };
  
  // Add-on Services
  addOns: Array<{
    id: string;
    enabled: boolean;
    price: number;
    customName?: string;
  }>;
  
  // Condition Surcharges
  conditionSurcharges: {
    petFee: number;
    petFeeEnabled: boolean;
    clutterFee: number;
    clutterFeeEnabled: boolean;
    lastClean3to6mo: number;
    lastClean6moPlus: number;
  };
  
  // Geographic Settings
  geographic: {
    metroArea: string;
    customMultiplier: number;
    travelFeePerMile: number;
    travelFeeThreshold: number;
    parkingFee: number;
  };
  
  // Time Premiums
  timePremiums: {
    sameDayPercent: number;
    sameDayEnabled: boolean;
    weekendPercent: number;
    weekendEnabled: boolean;
    holidayPercent: number;
    holidayEnabled: boolean;
    eveningPercent: number;
    eveningEnabled: boolean;
  };
  
  // Business Settings
  businessSettings: {
    minimumCharge: number;
    depositPercent: number;
    taxRate: number;
    supplyFee: number;
  };
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  pricingMethod: 'sqft',
  
  sqftPricing: {
    enabled: true,
    tiers: SQFT_PRICING_TIERS.map(tier => ({
      id: tier.id,
      label: tier.label,
      minSqft: tier.minSqft,
      maxSqft: tier.maxSqft,
      price: tier.flatPrice.average,
      enabled: true,
    })),
  },
  
  bedroomBathroomPricing: {
    enabled: false,
    basePrice: BEDROOM_BATHROOM_BASE.basePrice.average,
    perBedroom: BEDROOM_BATHROOM_BASE.perBedroom.average,
    perBathroom: BEDROOM_BATHROOM_BASE.perBathroom.average,
    perHalfBath: BEDROOM_BATHROOM_BASE.halfBathroom.average,
  },
  
  flatRatePricing: {
    enabled: false,
    rates: {
      studio: { standard: 100, deep: 150 },
      '1br': { standard: 115, deep: 175 },
      '2br': { standard: 160, deep: 250 },
      '3br': { standard: 212, deep: 325 },
      '4br': { standard: 275, deep: 425 },
      '5br_plus': { standard: 400, deep: 550 },
    },
  },
  
  hourlyPricing: {
    enabled: false,
    perCleanerRate: HOURLY_RATES.perCleaner.standard.average,
    teamRate: HOURLY_RATES.teamRate.twoPerson.average,
    minimumHours: HOURLY_RATES.minimumHours,
  },
  
  serviceMultipliers: {
    standard: 1.0,
    deep: 1.5,
    initial: 1.6,
    moveInOut: 1.8,
    postConstruction: 3.0,
    airbnb: 1.0,
  },
  
  frequencyDiscounts: {
    weekly: 17,
    biweekly: 12,
    monthly: 7,
    quarterly: 0,
  },
  
  addOns: ADD_ON_SERVICES.map(addon => ({
    id: addon.id,
    enabled: addon.popular || false,
    price: addon.price.average,
  })),
  
  conditionSurcharges: {
    petFee: 20,
    petFeeEnabled: true,
    clutterFee: 25,
    clutterFeeEnabled: true,
    lastClean3to6mo: 40,
    lastClean6moPlus: 75,
  },
  
  geographic: {
    metroArea: 'National Average',
    customMultiplier: 1.0,
    travelFeePerMile: 0.78,
    travelFeeThreshold: 15,
    parkingFee: 0,
  },
  
  timePremiums: {
    sameDayPercent: 22,
    sameDayEnabled: true,
    weekendPercent: 15,
    weekendEnabled: true,
    holidayPercent: 37,
    holidayEnabled: true,
    eveningPercent: 20,
    eveningEnabled: false,
  },
  
  businessSettings: {
    minimumCharge: BUSINESS_BENCHMARKS.minimumCharge.average,
    depositPercent: 25,
    taxRate: 0,
    supplyFee: 0,
  },
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface PricingConfiguratorProps {
  config: PricingConfig;
  onChange: (config: PricingConfig) => void;
  compact?: boolean;
}

export function PricingConfigurator({ config, onChange, compact = false }: PricingConfiguratorProps) {
  const updateConfig = (updates: Partial<PricingConfig>) => {
    onChange({ ...config, ...updates });
  };

  // Pricing Method Icons
  const methodIcons: Record<PricingMethod, IconName> = {
    sqft: 'ruler',
    bedroom_bathroom: 'home',
    hourly: 'clock',
    flat_rate: 'dollarSign',
    hybrid: 'layers',
  };

  return (
    <div className="space-y-6">
      {/* Pricing Method Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="calculator" size="lg" />
            Pricing Method
          </CardTitle>
          <CardDescription>Choose how you want to calculate base prices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'sqft', label: 'Square Footage', desc: 'Price by home size' },
              { id: 'bedroom_bathroom', label: 'Bedroom/Bath', desc: 'Price by room count' },
              { id: 'flat_rate', label: 'Flat Rate', desc: 'Fixed prices' },
              { id: 'hourly', label: 'Hourly', desc: 'Charge by time' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => updateConfig({ pricingMethod: method.id as PricingMethod })}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  config.pricingMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Icon 
                  name={methodIcons[method.id as PricingMethod]} 
                  size="lg" 
                  className={config.pricingMethod === method.id ? "text-primary" : "text-muted-foreground"} 
                />
                <p className="font-medium mt-2 text-sm">{method.label}</p>
                <p className="text-xs text-muted-foreground">{method.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Base Pricing Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="dollarSign" size="lg" />
            Base Pricing
          </CardTitle>
          <CardDescription>Configure your base rates</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={config.pricingMethod} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="sqft">Square Footage</TabsTrigger>
              <TabsTrigger value="bedroom_bathroom">Bed/Bath</TabsTrigger>
              <TabsTrigger value="flat_rate">Flat Rate</TabsTrigger>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
            </TabsList>

            {/* Square Footage Tab */}
            <TabsContent value="sqft" className="space-y-4">
              {config.sqftPricing.tiers.map((tier, idx) => (
                <div key={tier.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Switch
                    checked={tier.enabled}
                    onCheckedChange={(checked) => {
                      const newTiers = [...config.sqftPricing.tiers];
                      newTiers[idx] = { ...tier, enabled: checked };
                      updateConfig({
                        sqftPricing: { ...config.sqftPricing, tiers: newTiers },
                      });
                    }}
                  />
                  <span className="flex-1 font-medium text-sm">{tier.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={tier.price}
                      onChange={(e) => {
                        const newTiers = [...config.sqftPricing.tiers];
                        newTiers[idx] = { ...tier, price: Number(e.target.value) };
                        updateConfig({
                          sqftPricing: { ...config.sqftPricing, tiers: newTiers },
                        });
                      }}
                      className="w-24"
                      disabled={!tier.enabled}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Bedroom/Bathroom Tab */}
            <TabsContent value="bedroom_bathroom" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Price (1BR/1BA)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={config.bedroomBathroomPricing.basePrice}
                      onChange={(e) => updateConfig({
                        bedroomBathroomPricing: {
                          ...config.bedroomBathroomPricing,
                          basePrice: Number(e.target.value),
                        },
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Per Additional Bedroom</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">+$</span>
                    <Input
                      type="number"
                      value={config.bedroomBathroomPricing.perBedroom}
                      onChange={(e) => updateConfig({
                        bedroomBathroomPricing: {
                          ...config.bedroomBathroomPricing,
                          perBedroom: Number(e.target.value),
                        },
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Per Additional Full Bath</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">+$</span>
                    <Input
                      type="number"
                      value={config.bedroomBathroomPricing.perBathroom}
                      onChange={(e) => updateConfig({
                        bedroomBathroomPricing: {
                          ...config.bedroomBathroomPricing,
                          perBathroom: Number(e.target.value),
                        },
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Per Half Bath</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">+$</span>
                    <Input
                      type="number"
                      value={config.bedroomBathroomPricing.perHalfBath}
                      onChange={(e) => updateConfig({
                        bedroomBathroomPricing: {
                          ...config.bedroomBathroomPricing,
                          perHalfBath: Number(e.target.value),
                        },
                      })}
                    />
                  </div>
                </div>
              </div>
              
              {/* Formula Preview */}
              <div className="p-3 bg-violet-50 rounded-lg text-sm">
                <p className="font-medium text-violet-700 mb-1">Pricing Formula:</p>
                <p className="text-violet-600">
                  ${config.bedroomBathroomPricing.basePrice} + 
                  (Extra Bedrooms × ${config.bedroomBathroomPricing.perBedroom}) + 
                  (Extra Baths × ${config.bedroomBathroomPricing.perBathroom})
                </p>
                <p className="text-xs text-violet-500 mt-2">
                  Example: 3BR/2BA = ${config.bedroomBathroomPricing.basePrice} + 
                  (2 × ${config.bedroomBathroomPricing.perBedroom}) + 
                  (1 × ${config.bedroomBathroomPricing.perBathroom}) = 
                  ${config.bedroomBathroomPricing.basePrice + 
                    (2 * config.bedroomBathroomPricing.perBedroom) + 
                    config.bedroomBathroomPricing.perBathroom}
                </p>
              </div>
            </TabsContent>

            {/* Flat Rate Tab */}
            <TabsContent value="flat_rate" className="space-y-4">
              {Object.entries(config.flatRatePricing.rates).map(([size, rates]) => (
                <div key={size} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="w-24 font-medium text-sm capitalize">
                    {size.replace('_', ' ').replace('br', ' BR')}
                  </span>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Standard</Label>
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={rates.standard}
                      onChange={(e) => {
                        const newRates = { ...config.flatRatePricing.rates };
                        newRates[size] = { ...rates, standard: Number(e.target.value) };
                        updateConfig({
                          flatRatePricing: { ...config.flatRatePricing, rates: newRates },
                        });
                      }}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Deep</Label>
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={rates.deep}
                      onChange={(e) => {
                        const newRates = { ...config.flatRatePricing.rates };
                        newRates[size] = { ...rates, deep: Number(e.target.value) };
                        updateConfig({
                          flatRatePricing: { ...config.flatRatePricing, rates: newRates },
                        });
                      }}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Hourly Tab */}
            <TabsContent value="hourly" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rate Per Cleaner</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={config.hourlyPricing.perCleanerRate}
                      onChange={(e) => updateConfig({
                        hourlyPricing: {
                          ...config.hourlyPricing,
                          perCleanerRate: Number(e.target.value),
                        },
                      })}
                    />
                    <span className="text-muted-foreground">/hr</span>
                  </div>
                </div>
                <div>
                  <Label>Team Rate (2 Cleaners)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={config.hourlyPricing.teamRate}
                      onChange={(e) => updateConfig({
                        hourlyPricing: {
                          ...config.hourlyPricing,
                          teamRate: Number(e.target.value),
                        },
                      })}
                    />
                    <span className="text-muted-foreground">/hr</span>
                  </div>
                </div>
                <div>
                  <Label>Minimum Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={config.hourlyPricing.minimumHours}
                    onChange={(e) => updateConfig({
                      hourlyPricing: {
                        ...config.hourlyPricing,
                        minimumHours: Number(e.target.value),
                      },
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Service Type Multipliers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="layers" size="lg" />
            Service Multipliers
          </CardTitle>
          <CardDescription>Adjust pricing for different cleaning types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'standard', label: 'Standard Clean', range: '1.0x', benchmark: '1.0x' },
            { key: 'deep', label: 'Deep Clean', range: '1.3x-2.0x', benchmark: '1.5x' },
            { key: 'initial', label: 'Initial/First-Time', range: '1.4x-1.8x', benchmark: '1.6x' },
            { key: 'moveInOut', label: 'Move In/Out', range: '1.5x-2.5x', benchmark: '1.8x' },
            { key: 'postConstruction', label: 'Post-Construction', range: '2.0x-5.0x', benchmark: '3.0x' },
            { key: 'airbnb', label: 'Airbnb/Vacation Rental', range: '0.8x-1.2x', benchmark: '1.0x' },
          ].map((service) => (
            <div key={service.key} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{service.label}</p>
                <p className="text-xs text-muted-foreground">Industry range: {service.range}</p>
              </div>
              <div className="flex items-center gap-2 w-32">
                <Input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={config.serviceMultipliers[service.key as keyof typeof config.serviceMultipliers]}
                  onChange={(e) => updateConfig({
                    serviceMultipliers: {
                      ...config.serviceMultipliers,
                      [service.key]: Number(e.target.value),
                    },
                  })}
                  className="w-20"
                />
                <span className="text-muted-foreground">x</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Frequency Discounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="repeat" size="lg" />
            Frequency Discounts
          </CardTitle>
          <CardDescription>Discounts for recurring customers (off one-time rate)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'weekly', label: 'Weekly', range: '15-20%', benchmark: '17%' },
            { key: 'biweekly', label: 'Bi-Weekly', range: '10-15%', benchmark: '12%' },
            { key: 'monthly', label: 'Monthly', range: '5-10%', benchmark: '7%' },
            { key: 'quarterly', label: 'Quarterly', range: '0-5%', benchmark: '0%' },
          ].map((freq) => (
            <div key={freq.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{freq.label}</p>
                  <p className="text-xs text-muted-foreground">Industry: {freq.range}</p>
                </div>
                <span className="font-semibold text-primary">
                  {config.frequencyDiscounts[freq.key as keyof typeof config.frequencyDiscounts]}%
                </span>
              </div>
              <Slider
                value={[config.frequencyDiscounts[freq.key as keyof typeof config.frequencyDiscounts]]}
                onValueChange={([value]) => updateConfig({
                  frequencyDiscounts: {
                    ...config.frequencyDiscounts,
                    [freq.key]: value,
                  },
                })}
                max={30}
                step={1}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Condition Surcharges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="alertTriangle" size="lg" />
            Condition Surcharges
          </CardTitle>
          <CardDescription>Extra fees for special conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pet Fee */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Switch
                checked={config.conditionSurcharges.petFeeEnabled}
                onCheckedChange={(checked) => updateConfig({
                  conditionSurcharges: {
                    ...config.conditionSurcharges,
                    petFeeEnabled: checked,
                  },
                })}
              />
              <div>
                <p className="font-medium text-sm">Pet Fee</p>
                <p className="text-xs text-muted-foreground">Industry: $10-$50</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">$</span>
              <Input
                type="number"
                value={config.conditionSurcharges.petFee}
                onChange={(e) => updateConfig({
                  conditionSurcharges: {
                    ...config.conditionSurcharges,
                    petFee: Number(e.target.value),
                  },
                })}
                className="w-20"
                disabled={!config.conditionSurcharges.petFeeEnabled}
              />
            </div>
          </div>

          {/* Clutter Fee */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Switch
                checked={config.conditionSurcharges.clutterFeeEnabled}
                onCheckedChange={(checked) => updateConfig({
                  conditionSurcharges: {
                    ...config.conditionSurcharges,
                    clutterFeeEnabled: checked,
                  },
                })}
              />
              <div>
                <p className="font-medium text-sm">Heavy Clutter Fee</p>
                <p className="text-xs text-muted-foreground">Industry: $25-$50</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">$</span>
              <Input
                type="number"
                value={config.conditionSurcharges.clutterFee}
                onChange={(e) => updateConfig({
                  conditionSurcharges: {
                    ...config.conditionSurcharges,
                    clutterFee: Number(e.target.value),
                  },
                })}
                className="w-20"
                disabled={!config.conditionSurcharges.clutterFeeEnabled}
              />
            </div>
          </div>

          {/* Time Since Last Clean */}
          <div className="p-3 bg-muted rounded-lg space-y-3">
            <p className="font-medium text-sm">Time Since Last Professional Clean</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">3-6 Months (% surcharge)</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    type="number"
                    value={config.conditionSurcharges.lastClean3to6mo}
                    onChange={(e) => updateConfig({
                      conditionSurcharges: {
                        ...config.conditionSurcharges,
                        lastClean3to6mo: Number(e.target.value),
                      },
                    })}
                    className="w-full"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">6+ Months (% surcharge)</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    type="number"
                    value={config.conditionSurcharges.lastClean6moPlus}
                    onChange={(e) => updateConfig({
                      conditionSurcharges: {
                        ...config.conditionSurcharges,
                        lastClean6moPlus: Number(e.target.value),
                      },
                    })}
                    className="w-full"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Premiums */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="clock" size="lg" />
            Time Premiums
          </CardTitle>
          <CardDescription>Extra charges for rush or off-hours service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'sameDay', label: 'Same-Day Service', range: '15-30%', enabled: 'sameDayEnabled', percent: 'sameDayPercent' },
            { key: 'weekend', label: 'Weekend Service', range: '10-20%', enabled: 'weekendEnabled', percent: 'weekendPercent' },
            { key: 'evening', label: 'Evening (After 6pm)', range: '15-25%', enabled: 'eveningEnabled', percent: 'eveningPercent' },
            { key: 'holiday', label: 'Holiday Service', range: '25-50%', enabled: 'holidayEnabled', percent: 'holidayPercent' },
          ].map((premium) => (
            <div key={premium.key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  checked={config.timePremiums[premium.enabled as keyof typeof config.timePremiums] as boolean}
                  onCheckedChange={(checked) => updateConfig({
                    timePremiums: {
                      ...config.timePremiums,
                      [premium.enabled]: checked,
                    },
                  })}
                />
                <div>
                  <p className="font-medium text-sm">{premium.label}</p>
                  <p className="text-xs text-muted-foreground">Industry: {premium.range}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={config.timePremiums[premium.percent as keyof typeof config.timePremiums] as number}
                  onChange={(e) => updateConfig({
                    timePremiums: {
                      ...config.timePremiums,
                      [premium.percent]: Number(e.target.value),
                    },
                  })}
                  className="w-20"
                  disabled={!config.timePremiums[premium.enabled as keyof typeof config.timePremiums]}
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Geographic Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="mapPin" size="lg" />
            Geographic Settings
          </CardTitle>
          <CardDescription>Location-based pricing adjustments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Metro Area</Label>
            <Select
              value={config.geographic.metroArea}
              onValueChange={(value) => {
                const geo = GEOGRAPHIC_RATES.find(g => g.metroArea === value);
                updateConfig({
                  geographic: {
                    ...config.geographic,
                    metroArea: value,
                    customMultiplier: geo?.costOfLivingMultiplier || 1.0,
                  },
                });
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GEOGRAPHIC_RATES.map((geo) => (
                  <SelectItem key={geo.metroArea} value={geo.metroArea}>
                    {geo.metroArea} ({(geo.costOfLivingMultiplier * 100 - 100).toFixed(0)}%{' '}
                    {geo.costOfLivingMultiplier > 1 ? 'above' : 'below'} avg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price Multiplier</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  step="0.05"
                  value={config.geographic.customMultiplier}
                  onChange={(e) => updateConfig({
                    geographic: {
                      ...config.geographic,
                      customMultiplier: Number(e.target.value),
                    },
                  })}
                />
                <span className="text-muted-foreground">x</span>
              </div>
            </div>
            <div>
              <Label>Travel Fee (per mile)</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.10"
                  value={config.geographic.travelFeePerMile}
                  onChange={(e) => updateConfig({
                    geographic: {
                      ...config.geographic,
                      travelFeePerMile: Number(e.target.value),
                    },
                  })}
                />
              </div>
            </div>
            <div>
              <Label>Free Travel Radius (miles)</Label>
              <Input
                type="number"
                value={config.geographic.travelFeeThreshold}
                onChange={(e) => updateConfig({
                  geographic: {
                    ...config.geographic,
                    travelFeeThreshold: Number(e.target.value),
                  },
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Downtown/Parking Fee</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={config.geographic.parkingFee}
                  onChange={(e) => updateConfig({
                    geographic: {
                      ...config.geographic,
                      parkingFee: Number(e.target.value),
                    },
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="settings" size="lg" />
            Business Settings
          </CardTitle>
          <CardDescription>Minimum charges, deposits, and fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Charge</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={config.businessSettings.minimumCharge}
                  onChange={(e) => updateConfig({
                    businessSettings: {
                      ...config.businessSettings,
                      minimumCharge: Number(e.target.value),
                    },
                  })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Industry: $100-$150</p>
            </div>
            <div>
              <Label>Required Deposit</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={config.businessSettings.depositPercent}
                  onChange={(e) => updateConfig({
                    businessSettings: {
                      ...config.businessSettings,
                      depositPercent: Number(e.target.value),
                    },
                  })}
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Industry: 25-50%</p>
            </div>
            <div>
              <Label>Tax Rate</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  step="0.1"
                  value={config.businessSettings.taxRate}
                  onChange={(e) => updateConfig({
                    businessSettings: {
                      ...config.businessSettings,
                      taxRate: Number(e.target.value),
                    },
                  })}
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <div>
              <Label>Supply Fee</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={config.businessSettings.supplyFee}
                  onChange={(e) => updateConfig({
                    businessSettings: {
                      ...config.businessSettings,
                      supplyFee: Number(e.target.value),
                    },
                  })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Usually $0 (built into rate)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// ADD-ONS CONFIGURATOR
// ============================================================================

interface AddOnsConfiguratorProps {
  addOns: PricingConfig['addOns'];
  onChange: (addOns: PricingConfig['addOns']) => void;
}

export function AddOnsConfigurator({ addOns, onChange }: AddOnsConfiguratorProps) {
  const categories = ['Kitchen', 'Windows', 'Detail', 'Laundry', 'Specialty'];

  const updateAddOn = (id: string, updates: Partial<PricingConfig['addOns'][0]>) => {
    onChange(addOns.map(addon => 
      addon.id === id ? { ...addon, ...updates } : addon
    ));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="plus" size="lg" />
          Add-On Services
        </CardTitle>
        <CardDescription>Enable and price extra services</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {categories.map((category) => {
            const categoryAddOns = ADD_ON_SERVICES.filter(a => a.category === category);
            const enabledCount = addOns.filter(a => 
              a.enabled && categoryAddOns.some(ca => ca.id === a.id)
            ).length;

            return (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span>{category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {enabledCount}/{categoryAddOns.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {categoryAddOns.map((service) => {
                      const config = addOns.find(a => a.id === service.id);
                      return (
                        <div 
                          key={service.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                        >
                          <Switch
                            checked={config?.enabled || false}
                            onCheckedChange={(checked) => updateAddOn(service.id, { enabled: checked })}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{service.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {service.pricingType === 'per_unit' 
                                ? `Per ${service.unit}` 
                                : service.pricingType === 'per_hour' 
                                  ? 'Per hour'
                                  : 'Flat fee'
                              }
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              value={config?.price || service.price.average}
                              onChange={(e) => updateAddOn(service.id, { price: Number(e.target.value) })}
                              className="w-16 h-8 text-sm"
                              disabled={!config?.enabled}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PRICE CALCULATOR PREVIEW
// ============================================================================

interface PriceCalculatorPreviewProps {
  config: PricingConfig;
}

export function PriceCalculatorPreview({ config }: PriceCalculatorPreviewProps) {
  const [sqft, setSqft] = React.useState(2000);
  const [bedrooms, setBedrooms] = React.useState(3);
  const [bathrooms, setBathrooms] = React.useState(2);
  const [serviceType, setServiceType] = React.useState<ServiceType>('standard');
  const [frequency, setFrequency] = React.useState<Frequency>('biweekly');

  // Calculate price based on config
  const calculatePrice = () => {
    let basePrice = 0;

    // Calculate base price
    if (config.pricingMethod === 'sqft') {
      const tier = config.sqftPricing.tiers.find(t => 
        sqft >= t.minSqft && (t.maxSqft === null || sqft < t.maxSqft) && t.enabled
      );
      basePrice = tier?.price || 200;
    } else if (config.pricingMethod === 'bedroom_bathroom') {
      const bb = config.bedroomBathroomPricing;
      const extraBedrooms = Math.max(0, bedrooms - 1);
      const extraBathrooms = Math.max(0, bathrooms - 1);
      basePrice = bb.basePrice + (extraBedrooms * bb.perBedroom) + (extraBathrooms * bb.perBathroom);
    } else if (config.pricingMethod === 'flat_rate') {
      const sizeKey = bedrooms <= 1 ? '1br' : bedrooms === 2 ? '2br' : bedrooms === 3 ? '3br' : bedrooms === 4 ? '4br' : '5br_plus';
      basePrice = config.flatRatePricing.rates[sizeKey]?.[serviceType === 'deep' ? 'deep' : 'standard'] || 200;
    } else {
      basePrice = config.hourlyPricing.perCleanerRate * 3;
    }

    // Apply service multiplier
    const multiplier = config.serviceMultipliers[serviceType as keyof typeof config.serviceMultipliers] || 1;
    let price = basePrice * multiplier;

    // Apply geographic multiplier
    price *= config.geographic.customMultiplier;

    // Apply frequency discount
    const discount = config.frequencyDiscounts[frequency as keyof typeof config.frequencyDiscounts] || 0;
    price *= (1 - discount / 100);

    // Apply minimum
    price = Math.max(price, config.businessSettings.minimumCharge);

    // Apply tax
    price *= (1 + config.businessSettings.taxRate / 100);

    return Math.round(price);
  };

  const price = calculatePrice();
  const deposit = Math.round(price * config.businessSettings.depositPercent / 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="calculator" size="lg" />
          Price Calculator Preview
        </CardTitle>
        <CardDescription>Test your pricing configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Square Footage</Label>
            <Input
              type="number"
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Bedrooms</Label>
            <Select value={String(bedrooms)} onValueChange={(v) => setBedrooms(Number(v))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} BR</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Bathrooms</Label>
            <Select value={String(bathrooms)} onValueChange={(v) => setBathrooms(Number(v))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} BA</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Service Type</Label>
            <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Clean</SelectItem>
                <SelectItem value="deep">Deep Clean</SelectItem>
                <SelectItem value="move_in_out">Move In/Out</SelectItem>
                <SelectItem value="initial">Initial Clean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">One-Time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Estimated Price</p>
            <p className="text-4xl font-bold text-violet-600">${price}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Deposit Required: <span className="font-semibold">${deposit}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PricingConfigurator;
