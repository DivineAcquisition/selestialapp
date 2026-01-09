'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icon, IconName } from '@/components/ui/icon';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface SqftTier {
  id: string;
  label: string;
  minSqft: number;
  maxSqft: number | null;
  price: number;
  enabled: boolean;
  popular?: boolean;
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
  niche: string;
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

interface BookingState {
  step: number;
  zip: string;
  zipValid: boolean;
  cityState: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  selectedSqft: SqftTier | null;
  selectedService: ServiceOption | null;
  address: string;
  apt: string;
  city: string;
  state: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  bookingId: string;
}

interface PublicBookingWidgetProps {
  config: BookingConfig;
  preview?: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_SQFT_TIERS: SqftTier[] = [
  { id: '1', label: '1,000-1,500', minSqft: 1000, maxSqft: 1500, price: 189, enabled: true },
  { id: '2', label: '1,501-2,000', minSqft: 1501, maxSqft: 2000, price: 229, enabled: true },
  { id: '3', label: '2,001-2,500', minSqft: 2001, maxSqft: 2500, price: 269, enabled: true, popular: true },
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
  niche: 'cleaning',
  businessName: 'Alpha Lux Clean',
  phone: '(512) 555-0123',
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
// TRUST BADGES COMPONENT
// ============================================================================

function TrustBadges({ config }: { config: BookingConfig }) {
  return (
    <div className="flex items-center justify-center gap-4 py-3 border-b bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Icon name="shield" size="xs" className="text-white" />
        </div>
        <span className="text-sm font-medium text-green-700">Google Guaranteed</span>
      </div>
      <div className="flex items-center gap-1">
        <Icon name="star" size="sm" className="text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-medium">4.9/5</span>
        <span className="text-xs text-muted-foreground">(500+ reviews)</span>
      </div>
    </div>
  );
}

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

function ProgressBar({ step, totalSteps, config }: { step: number; totalSteps: number; config: BookingConfig }) {
  const percentage = Math.round((step / totalSteps) * 100);
  
  return (
    <div className="px-4 py-3">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: config.primaryColor }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right mt-1">{percentage}% Complete</p>
    </div>
  );
}

// ============================================================================
// STEP 1: ZIP + LEAD CAPTURE
// ============================================================================

function ZipStep({
  state,
  setState,
  config,
  onNext,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingConfig;
  onNext: () => void;
}) {
  const [checking, setChecking] = React.useState(false);

  const checkZip = async () => {
    if (state.zip.length !== 5) return;
    
    setChecking(true);
    await new Promise(r => setTimeout(r, 600));
    
    // Mock validation - would check against serviceZips in production
    const isValid = /^\d{5}$/.test(state.zip);
    setState(prev => ({
      ...prev,
      zipValid: isValid,
      cityState: isValid ? 'Austin, TX' : '',
    }));
    setChecking(false);
    
    if (!isValid) {
      toast.error("Sorry, we don't service this area yet");
    }
  };

  const handleSubmit = () => {
    if (!state.firstName || !state.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    onNext();
  };

  return (
    <div className="p-6">
      {/* Promotion Banner */}
      {config.promotionEnabled && (
        <div 
          className="p-4 rounded-xl text-center text-white mb-6"
          style={{ backgroundColor: config.primaryColor }}
        >
          <p className="text-lg font-bold">{config.promotionText}</p>
          <p className="text-sm opacity-80">Professional cleaning you can trust</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!state.zipValid ? (
          <motion.div
            key="zip-entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold">Enter your ZIP code to get started</h2>
            </div>

            <div className="max-w-xs mx-auto">
              <div className="flex gap-2">
                <Input
                  value={state.zip}
                  onChange={(e) => setState(prev => ({ ...prev, zip: e.target.value.slice(0, 5) }))}
                  placeholder="Enter ZIP Code"
                  className="text-center text-lg"
                  maxLength={5}
                  autoFocus
                />
                <Button
                  onClick={checkZip}
                  disabled={state.zip.length !== 5 || checking}
                  style={{ backgroundColor: config.primaryColor }}
                  className="text-white"
                >
                  {checking ? (
                    <Icon name="spinner" size="sm" className="animate-spin" />
                  ) : (
                    'Check →'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="lead-capture"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Success Message */}
            <div 
              className="p-3 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: `${config.accentColor}15` }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.accentColor }}
              >
                <Icon name="check" size="xs" className="text-white" />
              </div>
              <span className="font-medium" style={{ color: config.accentColor }}>
                ✅ We service your area!
              </span>
            </div>

            {/* Contact Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">First Name</Label>
                  <Input
                    value={state.firstName}
                    onChange={(e) => setState(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Last Name</Label>
                  <Input
                    value={state.lastName}
                    onChange={(e) => setState(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Smith"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Email Address</Label>
                <Input
                  type="email"
                  value={state.email}
                  onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Phone Number</Label>
                <Input
                  type="tel"
                  value={state.phone}
                  onChange={(e) => setState(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              🎁 Claim My {config.discountPercent}% Discount
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Badges Footer */}
      <div className="flex justify-center gap-4 mt-8 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Icon name="lock" size="xs" /> Secure
        </span>
        <span className="flex items-center gap-1">
          <Icon name="clock" size="xs" /> 48hr Guarantee
        </span>
        <span className="flex items-center gap-1">
          <Icon name="fileText" size="xs" /> No Contract
        </span>
        <span className="flex items-center gap-1">
          <Icon name="shield" size="xs" /> Insured
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: SQUARE FOOTAGE SELECTION
// ============================================================================

function SqftStep({
  state,
  setState,
  config,
  onNext,
  onBack,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const tiers = config.sqftTiers.filter(t => t.enabled);

  const handleSelect = (tier: SqftTier) => {
    setState(prev => ({ ...prev, selectedSqft: tier }));
    onNext();
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">How big is your home?</h2>
        <p className="text-sm text-muted-foreground">Select your approximate square footage</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => handleSelect(tier)}
            className={cn(
              "relative p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
              state.selectedSqft?.id === tier.id 
                ? "border-current shadow-lg" 
                : "border-gray-200 hover:border-gray-300"
            )}
            style={{
              borderColor: state.selectedSqft?.id === tier.id ? config.primaryColor : undefined,
              backgroundColor: state.selectedSqft?.id === tier.id ? `${config.primaryColor}08` : undefined,
            }}
          >
            {tier.popular && (
              <Badge 
                className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-white"
                style={{ backgroundColor: config.accentColor }}
              >
                ⭐ Popular
              </Badge>
            )}
            <div className="text-2xl mb-1">🏠</div>
            <p className="font-semibold">{tier.label}</p>
            <p className="text-xs text-muted-foreground">sq ft</p>
            <p className="text-sm font-bold mt-2" style={{ color: config.primaryColor }}>
              From ${tier.price}
            </p>
          </button>
        ))}
      </div>

      <div className="text-center mt-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          📞 Home larger than 5,000 sqft?{' '}
          <a href={`tel:${config.phone}`} className="font-medium" style={{ color: config.primaryColor }}>
            Call for quote
          </a>
        </p>
      </div>

      <div className="mt-6">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          ← Back
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: SERVICE SELECTION
// ============================================================================

function ServiceStep({
  state,
  setState,
  config,
  onNext,
  onBack,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const services = config.services.filter(s => s.enabled);

  const handleSelect = (service: ServiceOption) => {
    setState(prev => ({ ...prev, selectedService: service }));
    onNext();
  };

  const calculatePrice = (service: ServiceOption) => {
    const basePrice = (state.selectedSqft?.price || 0) + (service.basePrice - 269);
    const discounted = basePrice * (1 - service.discountPercent / 100);
    return { base: basePrice, discounted: Math.round(discounted) };
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Choose Your Perfect Clean</h2>
        <p className="text-sm text-muted-foreground">Select the service that fits your needs</p>
      </div>

      <div className="space-y-4">
        {services.map((service) => {
          const pricing = calculatePrice(service);
          
          return (
            <div
              key={service.id}
              className={cn(
                "relative p-5 rounded-xl border-2 transition-all",
                service.popular && "ring-2"
              )}
              style={{
                borderColor: service.popular ? config.primaryColor : '#e5e7eb',
                ...(service.popular && { ringColor: config.primaryColor }),
              }}
            >
              {/* Badge */}
              <Badge 
                className="absolute -top-2.5 right-4 text-white"
                style={{ backgroundColor: service.popular ? config.accentColor : config.primaryColor }}
              >
                {service.badge}
              </Badge>

              <div className="flex items-start gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {service.popular ? '💎' : '🔄'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span style={{ color: config.accentColor }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-baseline gap-2">
                  {service.discountPercent > 0 && (
                    <span className="text-gray-400 line-through">${pricing.base}</span>
                  )}
                  <span className="text-2xl font-bold" style={{ color: config.primaryColor }}>
                    ${pricing.discounted}
                  </span>
                  {service.discountPercent > 0 && (
                    <Badge variant="outline" style={{ color: config.accentColor, borderColor: config.accentColor }}>
                      {service.discountPercent}% OFF!
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleSelect(service)}
                className="w-full text-white"
                style={{ backgroundColor: config.primaryColor }}
              >
                Select {service.name}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          ← Back
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: CHECKOUT / PAYMENT
// ============================================================================

function CheckoutStep({
  state,
  setState,
  config,
  onNext,
  onBack,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const [processing, setProcessing] = React.useState(false);

  const calculatePricing = () => {
    const service = state.selectedService;
    const sqft = state.selectedSqft;
    if (!service || !sqft) return { subtotal: 0, discount: 0, total: 0, deposit: 0, balance: 0 };

    const subtotal = sqft.price + (service.basePrice - 269);
    const discount = subtotal * (service.discountPercent / 100);
    const total = subtotal - discount;
    const deposit = total * (config.depositPercent / 100);
    const balance = total - deposit;

    return {
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      total: Math.round(total),
      deposit: Math.round(deposit * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    };
  };

  const pricing = calculatePricing();

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    onNext();
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Secure Payment</h2>
        <p className="text-sm text-muted-foreground">Your payment is protected by 256-bit SSL encryption</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="text-sm">Card Number</Label>
                <Input placeholder="1234 5678 9012 3456" className="mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm">MM/YY</Label>
                  <Input placeholder="MM/YY" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">CVC</Label>
                  <Input placeholder="123" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">ZIP</Label>
                  <Input placeholder="12345" className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Icon name="lock" size="xs" />
            Your payment is secure. 256-bit SSL encryption.
          </div>

          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full text-white py-6 text-lg"
            style={{ backgroundColor: config.primaryColor }}
          >
            {processing ? (
              <>
                <Icon name="spinner" size="sm" className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>💳 Pay ${pricing.deposit.toFixed(2)} Deposit</>
            )}
          </Button>
        </div>

        {/* Order Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">📋 Order Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{state.selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Home Size</span>
                <span className="font-medium">{state.selectedSqft?.label} sq ft</span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${pricing.subtotal}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between" style={{ color: config.accentColor }}>
                  <span>Discount ({state.selectedService?.discountPercent}%)</span>
                  <span>-${pricing.discount}</span>
                </div>
              )}
              
              <Separator className="my-3" />
              
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${pricing.total}</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${config.primaryColor}10` }}>
              <div className="flex justify-between text-sm font-medium" style={{ color: config.primaryColor }}>
                <span>💳 Due Today ({config.depositPercent}%)</span>
                <span>${pricing.deposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>📅 Due at Service</span>
                <span>${pricing.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 text-xs text-muted-foreground justify-center">
              <span className="flex items-center gap-1">
                <Icon name="shield" size="xs" /> Secure
              </span>
              <span className="flex items-center gap-1">
                <Icon name="clock" size="xs" /> 48hr
              </span>
              <span className="flex items-center gap-1">
                <Icon name="fileText" size="xs" /> No Contract
              </span>
              <span className="flex items-center gap-1">
                <Icon name="shield" size="xs" /> Insured
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          ← Back
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: SCHEDULING
// ============================================================================

function SchedulingStep({
  state,
  setState,
  config,
  onNext,
  onBack,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const timeSlots = [
    { id: '1', label: '7-9 AM', sublabel: 'Early' },
    { id: '2', label: '9-11 AM', sublabel: 'Morning' },
    { id: '3', label: '11-1 PM', sublabel: 'Midday' },
    { id: '4', label: '1-3 PM', sublabel: 'Afternoon' },
    { id: '5', label: '3-5 PM', sublabel: 'Late' },
    { id: '6', label: 'Flexible', sublabel: 'Anytime' },
  ];

  const handleSubmit = () => {
    if (!state.address || !state.city || !state.preferredDate || !state.preferredTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    setState(prev => ({ ...prev, bookingId: `ALC-2025-${Math.random().toString(36).substr(2, 4).toUpperCase()}` }));
    onNext();
  };

  return (
    <div className="p-6">
      <div 
        className="p-3 rounded-lg mb-6 text-center"
        style={{ backgroundColor: `${config.accentColor}15`, color: config.accentColor }}
      >
        ✅ Payment Successful! Now let's schedule your clean.
      </div>

      <div className="space-y-6">
        {/* Address Section */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              📍 Service Address
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Street Address</Label>
                <Input
                  value={state.address}
                  onChange={(e) => setState(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Apt/Suite (optional)</Label>
                <Input
                  value={state.apt}
                  onChange={(e) => setState(prev => ({ ...prev, apt: e.target.value }))}
                  placeholder="Apt 4B"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm">City</Label>
                  <Input
                    value={state.city}
                    onChange={(e) => setState(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Austin"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">State</Label>
                  <Input
                    value={state.state}
                    onChange={(e) => setState(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="TX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">ZIP</Label>
                  <Input
                    value={state.zip}
                    readOnly
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              📅 Preferred Date
            </h3>
            <Input
              type="date"
              value={state.preferredDate}
              onChange={(e) => setState(prev => ({ ...prev, preferredDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              ⏰ Preferred Time Window
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setState(prev => ({ ...prev, preferredTime: slot.id }))}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    state.preferredTime === slot.id 
                      ? "border-current" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  style={{
                    borderColor: state.preferredTime === slot.id ? config.primaryColor : undefined,
                    backgroundColor: state.preferredTime === slot.id ? `${config.primaryColor}08` : undefined,
                  }}
                >
                  <p className="font-medium text-sm">{slot.label}</p>
                  <p className="text-xs text-muted-foreground">{slot.sublabel}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              📝 Special Instructions (optional)
            </h3>
            <Textarea
              value={state.notes}
              onChange={(e) => setState(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Gate code, pet info, focus areas..."
              rows={3}
            />
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          className="w-full text-white py-6 text-lg"
          style={{ backgroundColor: config.primaryColor }}
        >
          ✓ Complete Booking
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: CONFIRMATION
// ============================================================================

function ConfirmationStep({
  state,
  config,
}: {
  state: BookingState;
  config: BookingConfig;
}) {
  const pricing = () => {
    const service = state.selectedService;
    const sqft = state.selectedSqft;
    if (!service || !sqft) return { total: 0, deposit: 0, balance: 0 };

    const subtotal = sqft.price + (service.basePrice - 269);
    const total = subtotal * (1 - service.discountPercent / 100);
    const deposit = total * (config.depositPercent / 100);
    return {
      total: Math.round(total),
      deposit: Math.round(deposit * 100) / 100,
      balance: Math.round((total - deposit) * 100) / 100,
    };
  };

  const prices = pricing();
  const referralCode = `REF${state.bookingId.slice(-4)}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getTimeLabel = (timeId: string) => {
    const times: Record<string, string> = {
      '1': '7:00 AM - 9:00 AM',
      '2': '9:00 AM - 11:00 AM',
      '3': '11:00 AM - 1:00 PM',
      '4': '1:00 PM - 3:00 PM',
      '5': '3:00 PM - 5:00 PM',
      '6': 'Flexible',
    };
    return times[timeId] || 'TBD';
  };

  return (
    <div className="p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
        style={{ backgroundColor: `${config.accentColor}20` }}
      >
        ✅
      </motion.div>

      <h1 className="text-2xl font-bold mb-2">🎉 Booking Confirmed!</h1>
      <p className="text-muted-foreground mb-6">Check your email for confirmation details</p>

      {/* Booking Details */}
      <Card className="text-left mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">📋 Booking Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">{state.selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatDate(state.preferredDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{getTimeLabel(state.preferredTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium text-right">
                {state.address}, {state.city}, {state.state} {state.zip}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit Paid</span>
              <span className="font-medium text-green-600">${prices.deposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance Due</span>
              <span className="font-medium">${prices.balance.toFixed(2)} (at service)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confirmation #</span>
              <span className="font-mono font-medium">{state.bookingId}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral */}
      <Card className="text-left mb-6" style={{ backgroundColor: `${config.accentColor}10` }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">🎁 Share & Earn $25!</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Give friends $25 off, get $25 credit when they book their first clean.
          </p>
          <div className="flex gap-2">
            <Input 
              value={`book.selestial.io/r/${referralCode}`} 
              readOnly 
              className="text-sm bg-white"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`book.selestial.io/r/${referralCode}`);
                toast.success('Referral link copied!');
              }}
            >
              Copy
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1">📧 Email</Button>
            <Button size="sm" variant="outline" className="flex-1">💬 Text</Button>
            <Button size="sm" variant="outline" className="flex-1">📱 Share</Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <div className="text-sm text-muted-foreground">
        <p>📞 Questions? Call us: {config.phone}</p>
        <p>📧 Email: support@{config.businessName.toLowerCase().replace(/\s+/g, '')}.com</p>
      </div>

      <Button variant="outline" className="mt-6">
        🏠 Return to Homepage
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN WIDGET COMPONENT
// ============================================================================

export function PublicBookingWidget({ config = DEFAULT_CONFIG, preview = false }: PublicBookingWidgetProps) {
  const [state, setState] = React.useState<BookingState>({
    step: 1,
    zip: '',
    zipValid: false,
    cityState: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    selectedSqft: null,
    selectedService: null,
    address: '',
    apt: '',
    city: '',
    state: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    bookingId: '',
  });

  const totalSteps = 6;
  const goToStep = (step: number) => setState(prev => ({ ...prev, step }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="" className="h-8 w-8 rounded" />
            ) : (
              <div 
                className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: config.primaryColor }}
              >
                {config.businessName.charAt(0)}
              </div>
            )}
            <span className="font-semibold">{config.businessName}</span>
          </div>
          <a 
            href={`tel:${config.phone}`}
            className="text-sm font-medium"
            style={{ color: config.primaryColor }}
          >
            {config.phone}
          </a>
        </div>
        <TrustBadges config={config} />
        <ProgressBar step={state.step} totalSteps={totalSteps} config={config} />
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto bg-white min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {state.step === 1 && (
              <ZipStep
                state={state}
                setState={setState}
                config={config}
                onNext={() => goToStep(2)}
              />
            )}
            {state.step === 2 && (
              <SqftStep
                state={state}
                setState={setState}
                config={config}
                onNext={() => goToStep(3)}
                onBack={() => goToStep(1)}
              />
            )}
            {state.step === 3 && (
              <ServiceStep
                state={state}
                setState={setState}
                config={config}
                onNext={() => goToStep(4)}
                onBack={() => goToStep(2)}
              />
            )}
            {state.step === 4 && (
              <CheckoutStep
                state={state}
                setState={setState}
                config={config}
                onNext={() => goToStep(5)}
                onBack={() => goToStep(3)}
              />
            )}
            {state.step === 5 && (
              <SchedulingStep
                state={state}
                setState={setState}
                config={config}
                onNext={() => goToStep(6)}
                onBack={() => goToStep(4)}
              />
            )}
            {state.step === 6 && (
              <ConfirmationStep
                state={state}
                config={config}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-muted-foreground">
        By booking, you agree to {config.businessName}'s Terms & Privacy Policy
      </div>
    </div>
  );
}

export default PublicBookingWidget;
