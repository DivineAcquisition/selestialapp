'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  getPriceQuote, 
  HOME_SIZE_RANGES, 
  DEFAULT_PRICING_CONFIG,
  type PriceQuote 
} from '@/lib/pricing-adapter';
import { 
  Home, 
  Sparkles, 
  Brush, 
  Truck, 
  Calendar,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  DollarSign,
  ArrowRight,
  Info
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface BookingWidgetProps {
  businessId: string;
  businessName?: string;
  stateCode?: string;
  primaryColor?: string;
  onComplete?: (data: BookingData) => void;
}

interface BookingData {
  homeSize: string;
  serviceType: string;
  frequency: string;
  zipCode: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  priceQuote: PriceQuote | null;
}

// ═══════════════════════════════════════════════════════════
// STEP COMPONENTS
// ═══════════════════════════════════════════════════════════

// Step 1: Home Size Selection
function HomeSizeStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          What&apos;s your home size?
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Select the approximate square footage
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {HOME_SIZE_RANGES.filter(h => !h.requiresEstimate).map((size) => (
          <motion.button
            key={size.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(size.id)}
            className={cn(
              'flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 text-left transition-all',
              selected === size.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                selected === size.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              )}>
                <Home className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {size.label}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {size.bedroomRange}
                </p>
              </div>
            </div>
            <div className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border-2',
              selected === size.id
                ? 'border-primary bg-primary'
                : 'border-gray-300'
            )}>
              {selected === size.id && (
                <CheckCircle className="h-4 w-4 text-white" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Custom quote option */}
      <button
        onClick={() => onSelect('5001_plus')}
        className={cn(
          'w-full p-3 sm:p-4 rounded-xl border-2 text-center transition-all',
          selected === '5001_plus'
            ? 'border-primary bg-primary/5'
            : 'border-dashed border-gray-300 hover:border-gray-400'
        )}
      >
        <p className="font-medium text-gray-700">5,000+ sq ft?</p>
        <p className="text-sm text-gray-500">Request a custom quote</p>
      </button>
    </div>
  );
}

// Step 2: Service Type Selection
function ServiceTypeStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const services = DEFAULT_PRICING_CONFIG.serviceTypes;

  const icons = {
    regular: Sparkles,
    deep: Brush,
    move_in_out: Truck,
  };

  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Choose your service
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Select the type of cleaning you need
        </p>
      </div>

      <div className="grid gap-3">
        {services.map((service) => {
          const IconComponent = icons[service.id as keyof typeof icons] || Sparkles;
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
                  : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
              )}
            >
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl shrink-0',
                isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              )}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{service.name}</span>
                  {service.allowsRecurring && (
                    <Badge variant="secondary" className="text-xs">Recurring</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {service.description}
                </p>
              </div>
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border-2 shrink-0',
                isSelected ? 'border-primary bg-primary' : 'border-gray-300'
              )}>
                {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Step 3: Frequency Selection
function FrequencyStep({
  selected,
  onSelect,
  serviceType,
  priceQuote,
}: {
  selected: string;
  onSelect: (id: string) => void;
  serviceType: string;
  priceQuote: PriceQuote | null;
}) {
  const frequencies = DEFAULT_PRICING_CONFIG.frequencies;
  const service = DEFAULT_PRICING_CONFIG.serviceTypes.find(s => s.id === serviceType);
  const allowsRecurring = service?.allowsRecurring ?? false;

  // Filter frequencies based on service type
  const availableFrequencies = allowsRecurring 
    ? frequencies 
    : frequencies.filter(f => f.id === 'one_time');

  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          How often?
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {allowsRecurring 
            ? 'Save more with recurring service' 
            : 'One-time service only for this cleaning type'}
        </p>
      </div>

      <div className="grid gap-3">
        {availableFrequencies.map((freq) => {
          const isSelected = selected === freq.id;
          const discount = freq.discount ? `${(freq.discount * 100).toFixed(0)}% off` : null;

          return (
            <motion.button
              key={freq.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(freq.id)}
              className={cn(
                'flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{freq.name}</span>
                    {freq.badge && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {freq.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{freq.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {discount && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {discount}
                  </Badge>
                )}
                <div className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2',
                  isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                )}>
                  {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Price Preview */}
      {priceQuote && (
        <div className="bg-gray-50 rounded-xl p-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Estimated Price</span>
            <span className="text-2xl font-bold text-primary">
              ${priceQuote.discountedPrice.toFixed(2)}
            </span>
          </div>
          {priceQuote.recurringDetails && (
            <p className="text-sm text-gray-500 mt-1">
              ${priceQuote.recurringDetails.perClean.toFixed(2)} per clean × {priceQuote.recurringDetails.cleansPerMonth}/month
            </p>
          )}
          {priceQuote.savings && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {priceQuote.savings}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Step 4: Contact Info & Scheduling
function ContactStep({
  formData,
  onChange,
}: {
  formData: Partial<BookingData>;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Contact & Schedule
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Enter your details to book
        </p>
      </div>

      <div className="grid gap-4">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="zipCode" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            ZIP Code
          </Label>
          <Input
            id="zipCode"
            value={formData.zipCode || ''}
            onChange={(e) => onChange('zipCode', e.target.value)}
            placeholder="Enter your ZIP code"
            className="h-12"
          />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Your name"
            className="h-12"
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="your@email.com"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="h-12"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Preferred Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date || ''}
              onChange={(e) => onChange('date', e.target.value)}
              className="h-12"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Time
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time || ''}
              onChange={(e) => onChange('time', e.target.value)}
              className="h-12"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 5: Summary & Confirmation
function SummaryStep({
  formData,
  priceQuote,
}: {
  formData: BookingData;
  priceQuote: PriceQuote | null;
}) {
  const homeSize = HOME_SIZE_RANGES.find(h => h.id === formData.homeSize);
  const service = DEFAULT_PRICING_CONFIG.serviceTypes.find(s => s.id === formData.serviceType);
  const frequency = DEFAULT_PRICING_CONFIG.frequencies.find(f => f.id === formData.frequency);

  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Confirm Your Booking
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Review your selection and complete booking
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Service</p>
            <p className="font-semibold text-gray-900">{service?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Frequency</p>
            <p className="font-semibold text-gray-900">{frequency?.name}</p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Home Size</p>
            <p className="font-semibold text-gray-900">{homeSize?.label}</p>
            <p className="text-sm text-gray-500">{homeSize?.bedroomRange}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">When</p>
            <p className="font-semibold text-gray-900">
              {formData.date ? new Date(formData.date).toLocaleDateString() : 'TBD'}
            </p>
            <p className="text-sm text-gray-500">{formData.time || 'TBD'}</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm text-gray-500">Contact</p>
          <p className="font-semibold text-gray-900">{formData.name}</p>
          <p className="text-sm text-gray-600">{formData.email}</p>
          <p className="text-sm text-gray-600">{formData.phone}</p>
        </div>
      </div>

      {/* Price Breakdown */}
      {priceQuote && (
        <div className="bg-primary/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Price</span>
            <span className="text-gray-900">${priceQuote.basePrice.toFixed(2)}</span>
          </div>
          {priceQuote.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount</span>
              <span className="text-green-600">-${priceQuote.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-primary">
              ${priceQuote.discountedPrice.toFixed(2)}
            </span>
          </div>
          {priceQuote.recurringDetails && (
            <p className="text-sm text-gray-500 text-center">
              ${priceQuote.recurringDetails.monthlyTotal.toFixed(2)}/month
            </p>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-primary/20">
            <span className="text-gray-600 flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Deposit Due Now
            </span>
            <span className="font-semibold text-gray-900">
              ${priceQuote.depositAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          A 25% deposit is required to confirm your booking. 
          The remaining balance is due after service completion.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN WIDGET COMPONENT
// ═══════════════════════════════════════════════════════════

export function ResponsiveBookingWidget({
  businessId,
  businessName = 'Cleaning Service',
  stateCode = 'TX',
  primaryColor,
  onComplete,
}: BookingWidgetProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingData>({
    homeSize: '',
    serviceType: '',
    frequency: '',
    zipCode: '',
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    priceQuote: null,
  });

  // Calculate price quote whenever relevant fields change
  const priceQuote = useMemo(() => {
    if (!formData.homeSize || !formData.serviceType || !formData.frequency) {
      return null;
    }
    return getPriceQuote({
      stateCode,
      homeSizeId: formData.homeSize,
      serviceTypeId: formData.serviceType,
      frequencyId: formData.frequency,
    });
  }, [formData.homeSize, formData.serviceType, formData.frequency, stateCode]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.homeSize;
      case 2: return !!formData.serviceType;
      case 3: return !!formData.frequency;
      case 4: return !!(formData.zipCode && formData.name && formData.email && formData.phone && formData.date);
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 5 && canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (onComplete) {
      onComplete({ ...formData, priceQuote });
    }
  };

  // Progress bar
  const progress = (step / 5) * 100;

  return (
    <div 
      className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      style={primaryColor ? { '--primary': primaryColor } as React.CSSProperties : undefined}
    >
      {/* Header */}
      <div className="bg-primary px-4 sm:px-6 py-4 text-white">
        <h1 className="text-lg sm:text-xl font-bold">{businessName}</h1>
        <p className="text-sm opacity-90">Book Your Cleaning</p>
        {/* Progress Bar */}
        <div className="mt-3 h-1.5 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs opacity-80">
          <span>Step {step} of 5</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <HomeSizeStep
                selected={formData.homeSize}
                onSelect={(id) => updateFormData('homeSize', id)}
              />
            )}
            {step === 2 && (
              <ServiceTypeStep
                selected={formData.serviceType}
                onSelect={(id) => updateFormData('serviceType', id)}
              />
            )}
            {step === 3 && (
              <FrequencyStep
                selected={formData.frequency}
                onSelect={(id) => updateFormData('frequency', id)}
                serviceType={formData.serviceType}
                priceQuote={priceQuote}
              />
            )}
            {step === 4 && (
              <ContactStep
                formData={formData}
                onChange={updateFormData}
              />
            )}
            {step === 5 && (
              <SummaryStep
                formData={formData}
                priceQuote={priceQuote}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t flex justify-between items-center gap-4">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2 flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}

export default ResponsiveBookingWidget;
