'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// UI Components
import { BackgroundBeams } from '@/components/ui/background-beams';
import { ShimmerButton, ShimmerOutlineButton } from '@/components/ui/shimmer-button';
import { CardHoverEffect } from '@/components/ui/card-hover-effect';
import { AnimatedProgressBar } from '@/components/ui/animated-steps';
import { FloatingLabelInput, FloatingDateInput } from '@/components/ui/floating-label-input';
import { PriceDisplay, CompactPricePreview } from '@/components/ui/price-display';
import { GlassCard } from '@/components/ui/glass-card';
import { Separator } from '@/components/ui/separator';

// Pricing
import { 
  getPriceQuote, 
  HOME_SIZE_RANGES, 
  DEFAULT_PRICING_CONFIG,
  type PriceQuote 
} from '@/lib/pricing-adapter';

// Icons
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
  User,
  Mail,
  Phone,
  Info,
  Star,
  Shield,
  Zap
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
// STEP 1: HOME SIZE
// ═══════════════════════════════════════════════════════════

function HomeSizeStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const items = HOME_SIZE_RANGES.filter(h => !h.requiresEstimate).map(size => ({
    id: size.id,
    title: size.label,
    description: size.bedroomRange,
    icon: <Home className="h-5 w-5" />,
  }));

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Home className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
          What&apos;s your home size?
        </h2>
        <p className="text-gray-500 mt-2">
          Select the approximate square footage
        </p>
      </div>

      <CardHoverEffect
        items={items}
        selectedId={selected}
        onSelect={onSelect}
        columns={2}
      />

      {/* Custom quote option */}
      <motion.button
        onClick={() => onSelect('5001_plus')}
        className={cn(
          'w-full p-4 rounded-2xl border-2 border-dashed text-center transition-all duration-300',
          selected === '5001_plus'
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-semibold text-gray-900">5,000+ sq ft?</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Request a custom quote</p>
      </motion.button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 2: SERVICE TYPE
// ═══════════════════════════════════════════════════════════

function ServiceTypeStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const services = DEFAULT_PRICING_CONFIG.serviceTypes;
  
  const icons: Record<string, React.ReactNode> = {
    regular: <Sparkles className="h-6 w-6" />,
    deep: <Brush className="h-6 w-6" />,
    move_in_out: <Truck className="h-6 w-6" />,
  };

  const items = services.map(service => ({
    id: service.id,
    title: service.name,
    description: service.description,
    icon: icons[service.id] || <Sparkles className="h-6 w-6" />,
    badge: service.allowsRecurring ? 'Recurring Available' : undefined,
  }));

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Sparkles className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Choose your service
        </h2>
        <p className="text-gray-500 mt-2">
          Select the type of cleaning you need
        </p>
      </div>

      <CardHoverEffect
        items={items}
        selectedId={selected}
        onSelect={onSelect}
        columns={1}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 3: FREQUENCY
// ═══════════════════════════════════════════════════════════

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

  const availableFrequencies = allowsRecurring 
    ? frequencies 
    : frequencies.filter(f => f.id === 'one_time');

  const items = availableFrequencies.map(freq => ({
    id: freq.id,
    title: freq.name,
    description: freq.discount ? `Save ${(freq.discount * 100).toFixed(0)}% on each clean` : freq.description,
    icon: <Calendar className="h-5 w-5" />,
    badge: freq.badge || undefined,
  }));

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Calendar className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          How often?
        </h2>
        <p className="text-gray-500 mt-2">
          {allowsRecurring 
            ? 'Save more with recurring service' 
            : 'One-time service for this cleaning type'}
        </p>
      </div>

      <CardHoverEffect
        items={items}
        selectedId={selected}
        onSelect={onSelect}
        columns={1}
      />

      {/* Price Preview */}
      {priceQuote && (
        <CompactPricePreview price={priceQuote.discountedPrice} />
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 4: CONTACT
// ═══════════════════════════════════════════════════════════

function ContactStep({
  formData,
  onChange,
}: {
  formData: Partial<BookingData>;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <User className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Contact & Schedule
        </h2>
        <p className="text-gray-500 mt-2">
          Enter your details to book
        </p>
      </div>

      <div className="grid gap-4">
        <FloatingLabelInput
          label="ZIP Code"
          icon={<MapPin className="h-5 w-5" />}
          value={formData.zipCode || ''}
          onChange={(e) => onChange('zipCode', e.target.value)}
        />

        <FloatingLabelInput
          label="Full Name"
          icon={<User className="h-5 w-5" />}
          value={formData.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingLabelInput
            label="Email"
            type="email"
            icon={<Mail className="h-5 w-5" />}
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
          />
          <FloatingLabelInput
            label="Phone"
            type="tel"
            icon={<Phone className="h-5 w-5" />}
            value={formData.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingDateInput
            label="Preferred Date"
            icon={<Calendar className="h-5 w-5" />}
            value={formData.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          <FloatingLabelInput
            label="Preferred Time"
            type="time"
            icon={<Clock className="h-5 w-5" />}
            value={formData.time || ''}
            onChange={(e) => onChange('time', e.target.value)}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 5: SUMMARY
// ═══════════════════════════════════════════════════════════

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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <CheckCircle className="h-8 w-8 text-green-600" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Confirm Your Booking
        </h2>
        <p className="text-gray-500 mt-2">
          Review your selection
        </p>
      </div>

      {/* Summary Card */}
      <GlassCard variant="elevated" className="p-5 space-y-4">
        {/* Service & Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Service</p>
            <p className="font-semibold text-gray-900 mt-1">{service?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Frequency</p>
            <p className="font-semibold text-gray-900 mt-1">{frequency?.name}</p>
          </div>
        </div>

        <Separator />

        {/* Home & Schedule */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Home Size</p>
            <p className="font-semibold text-gray-900 mt-1">{homeSize?.label}</p>
            <p className="text-sm text-gray-500">{homeSize?.bedroomRange}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">When</p>
            <p className="font-semibold text-gray-900 mt-1">
              {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              }) : 'TBD'}
            </p>
            <p className="text-sm text-gray-500">{formData.time || 'TBD'}</p>
          </div>
        </div>

        <Separator />

        {/* Contact */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Contact</p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{formData.name}</p>
              <p className="text-sm text-gray-500">{formData.email}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Price Breakdown */}
      {priceQuote && (
        <PriceDisplay
          originalPrice={priceQuote.basePrice}
          discountedPrice={priceQuote.discountedPrice}
          savings={priceQuote.savings || undefined}
          perClean={priceQuote.recurringDetails?.perClean}
          cleansPerMonth={priceQuote.recurringDetails?.cleansPerMonth}
          monthlyTotal={priceQuote.recurringDetails?.monthlyTotal}
          depositAmount={priceQuote.depositAmount}
        />
      )}

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-4 pt-2">
        {[
          { icon: Shield, text: 'Insured & Bonded' },
          { icon: Star, text: '5-Star Rated' },
          { icon: CheckCircle, text: 'Satisfaction Guaranteed' },
        ].map((badge, i) => (
          <motion.div
            key={badge.text}
            className="flex items-center gap-1.5 text-sm text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <badge.icon className="h-4 w-4 text-green-500" />
            <span>{badge.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Info Note */}
      <motion.div 
        className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          A 25% deposit is required to confirm your booking. 
          The remaining balance is due after service completion.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN WIDGET COMPONENT
// ═══════════════════════════════════════════════════════════

export function AceternetyBookingWidget({
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

  // Calculate price quote
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

  return (
    <div 
      className="w-full max-w-lg mx-auto"
      style={primaryColor ? { '--primary': primaryColor } as React.CSSProperties : undefined}
    >
      <BackgroundBeams className="rounded-3xl">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-primary via-primary to-purple-600">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{businessName}</h1>
                  <p className="text-sm text-white/80">Book Your Cleaning</p>
                </div>
              </div>
              
              {/* Progress */}
              <AnimatedProgressBar currentStep={step} totalSteps={5} className="mt-4" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
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

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex justify-between items-center gap-4">
            {step > 1 ? (
              <ShimmerOutlineButton onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </ShimmerOutlineButton>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <ShimmerButton
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  "flex-1 sm:flex-none min-w-[140px]",
                  !canProceed() && "opacity-50 cursor-not-allowed"
                )}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </ShimmerButton>
            ) : (
              <ShimmerButton
                onClick={handleSubmit}
                background="linear-gradient(110deg, #10b981, 45%, #059669, 55%, #10b981)"
                className="flex-1 sm:flex-none min-w-[160px]"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirm Booking
              </ShimmerButton>
            )}
          </div>
        </div>
      </BackgroundBeams>
    </div>
  );
}

export default AceternetyBookingWidget;
