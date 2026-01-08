'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icon, IconName } from '@/components/ui/icon';

// ============================================================================
// TYPES
// ============================================================================

interface ServiceType {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  pricing_method: string;
  price_per_bedroom: number;
  price_per_bathroom: number;
  base_multiplier: number;
  icon?: string;
  color?: string;
  popular?: boolean;
}

interface Addon {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_type: 'flat' | 'per_unit' | 'per_sqft' | 'percentage';
  price: number;
  unit_name?: string;
  min_units: number;
  max_units: number;
  additional_minutes: number;
  icon?: string;
  popular?: boolean;
}

interface Frequency {
  id: string;
  name: string;
  slug: string;
  description?: string;
  interval_days: number;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  badge_text?: string;
}

interface PropertyPreset {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  sqft_estimate?: number;
}

interface BookingConfig {
  business: {
    id: string;
    name: string;
    logo?: string;
    phone?: string;
    email?: string;
  };
  config: {
    require_deposit: boolean;
    deposit_type: 'percentage' | 'flat' | 'full';
    deposit_value: number;
    deposit_minimum: number;
    primary_color: string;
    operating_hours: Record<string, { start: string; end: string; enabled: boolean }>;
  };
  serviceTypes: ServiceType[];
  addons: Addon[];
  frequencies: Frequency[];
  propertyPresets: PropertyPreset[];
}

interface PricingBreakdown {
  basePrice: number;
  bedroomCharge: number;
  bathroomCharge: number;
  serviceSubtotal: number;
  addons: Array<{ id: string; name: string; quantity: number; total: number }>;
  addonsTotal: number;
  subtotal: number;
  frequencyDiscount: number;
  frequencyDiscountPercent: number;
  totalDiscount: number;
  total: number;
  depositAmount: number;
  amountDueAtBooking: number;
  amountDueAfter: number;
  estimatedHours: string;
  savingsAmount: number;
  savingsPercent: number;
  estimatedMinutes: number;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const SERVICE_ICONS: Record<string, IconName> = {
  sparkles: 'sparkles',
  sprayCan: 'brush',
  truck: 'truck',
  hardHat: 'hammer',
  home: 'home',
  standard: 'sparkles',
  deep: 'brush',
  move: 'truck',
  construction: 'hammer',
  airbnb: 'home',
};

// ============================================================================
// STEP COMPONENTS
// ============================================================================

// Step 1: Service Type Selection
function ServiceTypeStep({
  serviceTypes,
  selected,
  onSelect,
}: {
  serviceTypes: ServiceType[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">What type of cleaning?</h2>
        <p className="text-muted-foreground text-sm">Choose the service that best fits your needs</p>
      </div>

      <div className="grid gap-3">
        {serviceTypes.map((service) => {
          const iconName = SERVICE_ICONS[service.icon || service.slug] || 'sparkles';
          const isSelected = selected === service.id;

          return (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(service.id)}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                  : 'border-border hover:border-primary/30 hover:bg-muted/50'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon name={iconName} size="lg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{service.name}</span>
                  {service.popular && (
                    <Badge className="bg-primary/10 text-primary text-[10px]">
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {service.description}
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  Starting at ${service.base_price}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                )}
              >
                {isSelected && <Icon name="check" size="xs" className="text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Step 2: Property Details
function PropertyStep({
  presets,
  bedrooms,
  bathrooms,
  onBedroomsChange,
  onBathroomsChange,
}: {
  presets: PropertyPreset[];
  bedrooms: number;
  bathrooms: number;
  onBedroomsChange: (value: number) => void;
  onBathroomsChange: (value: number) => void;
}) {
  const handlePresetSelect = (preset: PropertyPreset) => {
    onBedroomsChange(preset.bedrooms);
    onBathroomsChange(preset.bathrooms);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Tell us about your home</h2>
        <p className="text-muted-foreground text-sm">This helps us give you an accurate price</p>
      </div>

      {/* Quick Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Select</Label>
        <div className="grid grid-cols-3 gap-2">
          {presets.slice(0, 6).map((preset) => {
            const isSelected = bedrooms === preset.bedrooms && bathrooms === preset.bathrooms;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all text-sm',
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:border-primary/30'
                )}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Manual Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Or customize</Label>

        {/* Bedrooms */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Bedrooms</p>
            <p className="text-sm text-muted-foreground">Including home office/den</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => onBedroomsChange(Math.max(0, bedrooms - 1))}
              disabled={bedrooms <= 0}
            >
              <Icon name="minus" size="sm" />
            </Button>
            <span className="w-8 text-center text-xl font-semibold">{bedrooms}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => onBedroomsChange(Math.min(10, bedrooms + 1))}
              disabled={bedrooms >= 10}
            >
              <Icon name="plus" size="sm" />
            </Button>
          </div>
        </div>

        {/* Bathrooms */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Bathrooms</p>
            <p className="text-sm text-muted-foreground">Full and half baths</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => onBathroomsChange(Math.max(1, bathrooms - 0.5))}
              disabled={bathrooms <= 1}
            >
              <Icon name="minus" size="sm" />
            </Button>
            <span className="w-8 text-center text-xl font-semibold">{bathrooms}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => onBathroomsChange(Math.min(6, bathrooms + 0.5))}
              disabled={bathrooms >= 6}
            >
              <Icon name="plus" size="sm" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Add-ons
function AddonsStep({
  addons,
  selectedAddons,
  onToggle,
  onQuantityChange,
}: {
  addons: Addon[];
  selectedAddons: Record<string, number>;
  onToggle: (addonId: string) => void;
  onQuantityChange: (addonId: string, quantity: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Want any extras?</h2>
        <p className="text-muted-foreground text-sm">Add deep cleaning for specific areas</p>
      </div>

      <div className="space-y-2">
        {addons.map((addon) => {
          const isSelected = addon.id in selectedAddons;
          const quantity = selectedAddons[addon.id] || 1;
          const isPerUnit = addon.price_type === 'per_unit';

          return (
            <div
              key={addon.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              )}
            >
              <Checkbox
                id={addon.id}
                checked={isSelected}
                onCheckedChange={() => onToggle(addon.id)}
                className="h-5 w-5"
              />
              <div className="flex-1">
                <label htmlFor={addon.id} className="font-medium cursor-pointer">
                  {addon.name}
                </label>
                {addon.description && (
                  <p className="text-xs text-muted-foreground">{addon.description}</p>
                )}
              </div>

              {isSelected && isPerUnit && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onQuantityChange(addon.id, Math.max(addon.min_units, quantity - 1))}
                    disabled={quantity <= addon.min_units}
                  >
                    <Icon name="minus" size="xs" />
                  </Button>
                  <span className="w-6 text-center text-sm">{quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onQuantityChange(addon.id, Math.min(addon.max_units, quantity + 1))}
                    disabled={quantity >= addon.max_units}
                  >
                    <Icon name="plus" size="xs" />
                  </Button>
                </div>
              )}

              <span className="font-semibold text-primary min-w-16 text-right">
                {addon.price_type === 'flat' && `$${addon.price}`}
                {addon.price_type === 'per_unit' && `$${addon.price}/${addon.unit_name}`}
                {addon.price_type === 'percentage' && `+10%`}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t need any extras? Just continue to the next step.
      </p>
    </div>
  );
}

// Step 4: Frequency
function FrequencyStep({
  frequencies,
  selected,
  onSelect,
  basePrice,
}: {
  frequencies: Frequency[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  basePrice: number;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">How often?</h2>
        <p className="text-muted-foreground text-sm">Regular cleanings save money and keep your home fresh</p>
      </div>

      <div className="space-y-2">
        {frequencies.map((freq) => {
          const isSelected = selected === freq.id;
          const discount = freq.discount_type === 'percentage'
            ? basePrice * (freq.discount_value / 100)
            : freq.discount_value;
          const discountedPrice = basePrice - discount;

          return (
            <motion.button
              key={freq.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(isSelected ? null : freq.id)}
              className={cn(
                'flex items-center justify-between w-full p-4 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && <Icon name="check" size="xs" className="text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{freq.name}</span>
                    {freq.badge_text && (
                      <Badge className="bg-green-100 text-green-700 text-[10px]">
                        {freq.badge_text}
                      </Badge>
                    )}
                  </div>
                  {freq.description && (
                    <p className="text-sm text-muted-foreground">{freq.description}</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                {freq.discount_value > 0 ? (
                  <>
                    <p className="text-lg font-bold text-primary">
                      ${discountedPrice.toFixed(0)}
                    </p>
                    <p className="text-xs text-green-600">
                      Save {freq.discount_value}%
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold">${basePrice.toFixed(0)}</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Step 5: Schedule
function ScheduleStep({
  businessId,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  estimatedDuration,
}: {
  businessId: string;
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  estimatedDuration: number;
}) {
  const [availableSlots, setAvailableSlots] = React.useState<Array<{ time: string; available: boolean }>>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);

  // Generate next 14 days
  const dates = React.useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    return days;
  }, []);

  // Fetch availability when date changes
  React.useEffect(() => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    fetch(`/api/booking/${businessId}/availability?date=${selectedDate}&duration=${estimatedDuration}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableSlots(data.slots || []);
      })
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, [businessId, selectedDate, estimatedDuration]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Pick a date & time</h2>
        <p className="text-muted-foreground text-sm">Choose when you&apos;d like us to come</p>
      </div>

      {/* Date Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Select Date</Label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((day) => (
            <button
              key={day.date}
              onClick={() => onDateChange(day.date)}
              className={cn(
                'flex flex-col items-center min-w-16 p-3 rounded-xl border transition-all',
                selectedDate === day.date
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/30'
              )}
            >
              <span className="text-xs text-muted-foreground">{day.dayName}</span>
              <span className="text-xl font-bold">{day.dayNumber}</span>
              <span className="text-xs">{day.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Time</Label>
          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Icon name="spinner" size="lg" className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => slot.available && onTimeChange(slot.time)}
                  className={cn(
                    'p-2 rounded-lg border text-sm transition-all',
                    selectedTime === slot.time
                      ? 'border-primary bg-primary text-white'
                      : slot.available
                      ? 'border-border hover:border-primary/30'
                      : 'border-border bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Step 6: Contact Info
function ContactStep({
  form,
}: {
  form: any;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Your information</h2>
        <p className="text-muted-foreground text-sm">We&apos;ll send confirmation and updates here</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Full Name *</Label>
          <div className="relative">
            <Icon name="user" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="customerName"
              placeholder="John Smith"
              className="pl-10"
              {...form.register('customerName')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email *</Label>
          <div className="relative">
            <Icon name="mail" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="customerEmail"
              type="email"
              placeholder="john@example.com"
              className="pl-10"
              {...form.register('customerEmail')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone *</Label>
          <div className="relative">
            <Icon name="phone" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="customerPhone"
              type="tel"
              placeholder="(555) 123-4567"
              className="pl-10"
              {...form.register('customerPhone')}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="addressLine1">Street Address *</Label>
          <div className="relative">
            <Icon name="mapPin" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="addressLine1"
              placeholder="123 Main St"
              className="pl-10"
              {...form.register('addressLine1')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine2">Apt/Suite (optional)</Label>
          <Input
            id="addressLine2"
            placeholder="Apt 4B"
            {...form.register('addressLine2')}
          />
        </div>

        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3 space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="New York"
              {...form.register('city')}
            />
          </div>
          <div className="col-span-1 space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              placeholder="NY"
              maxLength={2}
              {...form.register('state')}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="zipCode">ZIP *</Label>
            <Input
              id="zipCode"
              placeholder="10001"
              {...form.register('zipCode')}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="accessInstructions">Access Instructions (optional)</Label>
          <Textarea
            id="accessInstructions"
            placeholder="Gate code, where to park, key location, etc."
            rows={3}
            {...form.register('accessInstructions')}
          />
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="hasPets" {...form.register('hasPets')} />
          <div>
            <label htmlFor="hasPets" className="text-sm font-medium cursor-pointer">
              I have pets
            </label>
            <p className="text-xs text-muted-foreground">Let us know so we can take precautions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRICE SUMMARY COMPONENT
// ============================================================================

function PriceSummary({
  breakdown,
  serviceName,
  bedrooms,
  bathrooms,
  frequencyName,
  isLoading,
}: {
  breakdown: PricingBreakdown | null;
  serviceName: string;
  bedrooms: number;
  bathrooms: number;
  frequencyName?: string;
  isLoading: boolean;
}) {
  if (!breakdown) return null;

  return (
    <Card className="sticky top-4">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Your Price</h3>
          {isLoading && <Icon name="spinner" size="sm" className="animate-spin" />}
        </div>

        {/* Service */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{serviceName}</span>
            <span>${breakdown.serviceSubtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {bedrooms} bed, {bathrooms} bath
          </p>
        </div>

        {/* Add-ons */}
        {breakdown.addons.length > 0 && (
          <div className="space-y-1 text-sm">
            {breakdown.addons.map((addon) => (
              <div key={addon.id} className="flex justify-between text-muted-foreground">
                <span>
                  {addon.name}
                  {addon.quantity > 1 && ` (×${addon.quantity})`}
                </span>
                <span>+${addon.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${breakdown.subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        {breakdown.totalDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>
              {frequencyName} discount ({breakdown.frequencyDiscountPercent}% off)
            </span>
            <span>-${breakdown.totalDiscount.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">${breakdown.total.toFixed(2)}</span>
        </div>

        {/* Deposit info */}
        {breakdown.depositAmount > 0 && breakdown.depositAmount < breakdown.total && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between font-medium">
              <span>Due today (deposit)</span>
              <span>${breakdown.depositAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Due at cleaning</span>
              <span>${breakdown.amountDueAfter.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Time estimate */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="clock" size="sm" />
          <span>Estimated time: {breakdown.estimatedHours}</span>
        </div>

        {/* Savings */}
        {breakdown.savingsAmount > 0 && (
          <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm text-center">
            🎉 You&apos;re saving ${breakdown.savingsAmount.toFixed(2)} with {frequencyName} cleaning!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN WIDGET COMPONENT
// ============================================================================

interface CleaningBookingWidgetProps {
  businessId: string;
  onComplete?: (booking: any) => void;
  className?: string;
}

export function CleaningBookingWidget({
  businessId,
  onComplete,
  className,
}: CleaningBookingWidgetProps) {
  // State
  const [step, setStep] = React.useState(1);
  const [config, setConfig] = React.useState<BookingConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [calculating, setCalculating] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [breakdown, setBreakdown] = React.useState<PricingBreakdown | null>(null);
  const [bookingComplete, setBookingComplete] = React.useState(false);
  const [bookingResult, setBookingResult] = React.useState<any>(null);

  // Selections
  const [serviceTypeId, setServiceTypeId] = React.useState<string | null>(null);
  const [bedrooms, setBedrooms] = React.useState(2);
  const [bathrooms, setBathrooms] = React.useState(2);
  const [selectedAddons, setSelectedAddons] = React.useState<Record<string, number>>({});
  const [frequencyId, setFrequencyId] = React.useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = React.useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = React.useState<string | null>(null);

  // Form
  const form = useForm({
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      accessInstructions: '',
      hasPets: false,
    },
  });

  // Load config
  React.useEffect(() => {
    fetch(`/api/booking/${businessId}/config`)
      .then((res) => res.json())
      .then(setConfig)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [businessId]);

  // Calculate price when selections change
  React.useEffect(() => {
    if (!serviceTypeId || !config) return;

    setCalculating(true);

    const addonSelections = Object.entries(selectedAddons).map(([addonId, quantity]) => ({
      addonId,
      quantity,
    }));

    fetch(`/api/booking/${businessId}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceTypeId,
        bedrooms,
        bathrooms,
        addonSelections,
        frequencyId,
      }),
    })
      .then((res) => res.json())
      .then((data) => setBreakdown(data.breakdown))
      .catch(console.error)
      .finally(() => setCalculating(false));
  }, [businessId, serviceTypeId, bedrooms, bathrooms, selectedAddons, frequencyId, config]);

  // Handlers
  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      if (addonId in prev) {
        const { [addonId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [addonId]: 1 };
    });
  };

  const updateAddonQuantity = (addonId: string, quantity: number) => {
    setSelectedAddons((prev) => ({ ...prev, [addonId]: quantity }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const formData = form.getValues();

      const response = await fetch(`/api/booking/${businessId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTypeId,
          bedrooms,
          bathrooms,
          addonSelections: Object.entries(selectedAddons).map(([addonId, quantity]) => ({
            addonId,
            quantity,
          })),
          frequencyId,
          scheduledDate,
          scheduledTime,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBookingResult(result.booking);
        setBookingComplete(true);
        onComplete?.(result.booking);
      } else {
        alert(result.error || 'Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get current service name
  const currentService = config?.serviceTypes.find((s) => s.id === serviceTypeId);
  const currentFrequency = config?.frequencies.find((f) => f.id === frequencyId);

  // Validation for each step
  const canProceed = () => {
    switch (step) {
      case 1:
        return !!serviceTypeId;
      case 2:
        return bedrooms >= 0 && bathrooms >= 1;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return !!scheduledDate && !!scheduledTime;
      case 6:
        const values = form.getValues();
        return !!(
          values.customerName &&
          values.customerEmail &&
          values.customerPhone &&
          values.addressLine1 &&
          values.city &&
          values.state &&
          values.zipCode
        );
      default:
        return false;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Icon name="spinner" size="xl" className="animate-spin text-primary" />
      </div>
    );
  }

  // Config not found
  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load booking form</p>
      </div>
    );
  }

  // Booking complete
  if (bookingComplete && bookingResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-6"
      >
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <Icon name="checkCircle" size="xl" className="text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="text-muted-foreground mt-1">
            Your cleaning is scheduled for {bookingResult.scheduledDate} at {bookingResult.scheduledTime}
          </p>
        </div>
        <Card className="max-w-sm mx-auto">
          <CardContent className="pt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confirmation #</span>
              <span className="font-mono font-medium">{bookingResult.bookingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">${bookingResult.total}</span>
            </div>
            {bookingResult.depositPaid && (
              <div className="flex justify-between text-green-600">
                <span>Deposit paid</span>
                <span>✓</span>
              </div>
            )}
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a confirmation to your email. See you soon!
        </p>
      </motion.div>
    );
  }

  return (
    <div className={cn('grid lg:grid-cols-3 gap-6', className)}>
      {/* Main Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="pt-6">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-colors',
                    s <= step ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>

            {/* Steps */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <ServiceTypeStep
                    serviceTypes={config.serviceTypes}
                    selected={serviceTypeId}
                    onSelect={setServiceTypeId}
                  />
                )}
                {step === 2 && (
                  <PropertyStep
                    presets={config.propertyPresets}
                    bedrooms={bedrooms}
                    bathrooms={bathrooms}
                    onBedroomsChange={setBedrooms}
                    onBathroomsChange={setBathrooms}
                  />
                )}
                {step === 3 && (
                  <AddonsStep
                    addons={config.addons}
                    selectedAddons={selectedAddons}
                    onToggle={toggleAddon}
                    onQuantityChange={updateAddonQuantity}
                  />
                )}
                {step === 4 && (
                  <FrequencyStep
                    frequencies={config.frequencies}
                    selected={frequencyId}
                    onSelect={setFrequencyId}
                    basePrice={breakdown?.subtotal || 0}
                  />
                )}
                {step === 5 && (
                  <ScheduleStep
                    businessId={businessId}
                    selectedDate={scheduledDate}
                    selectedTime={scheduledTime}
                    onDateChange={setScheduledDate}
                    onTimeChange={setScheduledTime}
                    estimatedDuration={breakdown?.estimatedMinutes || 120}
                  />
                )}
                {step === 6 && <ContactStep form={form} />}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
              >
                <Icon name="chevronLeft" size="sm" className="mr-2" />
                Back
              </Button>

              {step < 6 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Continue
                  <Icon name="chevronRight" size="sm" className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || submitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {submitting ? (
                    <>
                      <Icon name="spinner" size="sm" className="mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Icon name="creditCard" size="sm" className="mr-2" />
                      Book & Pay ${breakdown?.depositAmount.toFixed(2)}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Summary */}
      <div className="lg:col-span-1">
        <PriceSummary
          breakdown={breakdown}
          serviceName={currentService?.name || ''}
          bedrooms={bedrooms}
          bathrooms={bathrooms}
          frequencyName={currentFrequency?.name}
          isLoading={calculating}
        />
      </div>
    </div>
  );
}
