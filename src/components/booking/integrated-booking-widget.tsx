'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

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
  Loader2,
  Building,
  AlertCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface BookingWidgetProps {
  businessId: string;
}

interface WidgetConfig {
  businessName: string;
  phone: string;
  email: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  services: ServiceOption[];
  trustBadges: TrustBadge[];
  showRating: boolean;
  ratingValue: number;
  reviewCount: number;
  promotionEnabled: boolean;
  promotionHeadline: string;
  promotionSubheadline: string;
  discountPercent: number;
  depositPercent: number;
  minimumPrice: number;
  serviceZips: string[];
  pricingConfig?: PricingConfig;
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

interface TrustBadge {
  id: string;
  type: string;
  enabled: boolean;
  label: string;
  sublabel?: string;
}

interface PricingConfig {
  basePrices: { [key: string]: number };
  sqftTiers: SqftTier[];
  frequencies: Frequency[];
  addOns: AddOn[];
}

interface SqftTier {
  id: string;
  label: string;
  minSqft: number;
  maxSqft: number;
  price: number;
  bedroomRange: string;
  enabled: boolean;
}

interface Frequency {
  id: string;
  name: string;
  discount: number;
  badge?: string;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
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
  selectedAddOns: string[];
}

// ═══════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════

const DEFAULT_CONFIG: WidgetConfig = {
  businessName: 'Professional Cleaning',
  phone: '(555) 123-4567',
  email: '',
  logoUrl: '',
  primaryColor: '#7c3aed',
  accentColor: '#10B981',
  services: [
    { id: '1', name: 'Standard Clean', description: 'Regular maintenance cleaning', basePrice: 0, discountPercent: 0, popular: false, enabled: true },
    { id: '2', name: 'Deep Clean', description: 'Intensive top-to-bottom cleaning', basePrice: 50, discountPercent: 20, popular: true, enabled: true },
    { id: '3', name: 'Move In/Out', description: 'Complete move preparation cleaning', basePrice: 100, discountPercent: 0, popular: false, enabled: true },
  ],
  trustBadges: [],
  showRating: true,
  ratingValue: 4.9,
  reviewCount: 127,
  promotionEnabled: true,
  promotionHeadline: 'Get 20% Off Your First Clean!',
  promotionSubheadline: 'Professional cleaning you can trust',
  discountPercent: 20,
  depositPercent: 25,
  minimumPrice: 99,
  serviceZips: [],
  pricingConfig: {
    basePrices: {
      'small': 149,
      'medium': 199,
      'large': 249,
      'xlarge': 299,
    },
    sqftTiers: [
      { id: 'small', label: '< 1,500 sq ft', minSqft: 0, maxSqft: 1500, price: 149, bedroomRange: '1-2 bed', enabled: true },
      { id: 'medium', label: '1,500 - 2,500 sq ft', minSqft: 1500, maxSqft: 2500, price: 199, bedroomRange: '2-3 bed', enabled: true },
      { id: 'large', label: '2,500 - 3,500 sq ft', minSqft: 2500, maxSqft: 3500, price: 249, bedroomRange: '3-4 bed', enabled: true },
      { id: 'xlarge', label: '3,500+ sq ft', minSqft: 3500, maxSqft: 5000, price: 299, bedroomRange: '4+ bed', enabled: true },
    ],
    frequencies: [
      { id: 'one_time', name: 'One-Time', discount: 0 },
      { id: 'weekly', name: 'Weekly', discount: 0.20, badge: 'Save 20%' },
      { id: 'biweekly', name: 'Bi-Weekly', discount: 0.15, badge: 'Popular' },
      { id: 'monthly', name: 'Monthly', discount: 0.10, badge: 'Save 10%' },
    ],
    addOns: [
      { id: 'inside_fridge', name: 'Inside Fridge', price: 35, enabled: true },
      { id: 'inside_oven', name: 'Inside Oven', price: 35, enabled: true },
      { id: 'inside_cabinets', name: 'Inside Cabinets', price: 45, enabled: true },
      { id: 'laundry', name: 'Laundry (wash & fold)', price: 25, enabled: true },
      { id: 'windows_interior', name: 'Interior Windows', price: 40, enabled: true },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// TRUST BADGE ICONS
// ═══════════════════════════════════════════════════════════

function TrustBadgeIcon({ type }: { type: string }) {
  switch (type) {
    case 'google_guaranteed':
      return <CheckCircle className="h-3 w-3 text-green-600" />;
    case 'bbb':
      return <Shield className="h-3 w-3 text-blue-600" />;
    default:
      return <Shield className="h-3 w-3 text-gray-600" />;
  }
}

// ═══════════════════════════════════════════════════════════
// SELECTION CARD
// ═══════════════════════════════════════════════════════════

function SelectionCard({
  selected,
  onClick,
  icon,
  title,
  description,
  badge,
  price,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  price?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2 rounded-lg transition-colors',
          selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('font-semibold', selected ? 'text-primary' : 'text-gray-900')}>
              {title}
            </span>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
          {price && (
            <p className="text-sm font-medium text-primary mt-1">{price}</p>
          )}
        </div>
        {selected && (
          <CheckCircle className="h-5 w-5 text-primary shrink-0" />
        )}
      </div>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN WIDGET COMPONENT
// ═══════════════════════════════════════════════════════════

export function IntegratedBookingWidget({ businessId }: BookingWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
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
    selectedAddOns: [],
  });

  // Fetch configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Try to fetch widget config first
        const widgetRes = await fetch(`/api/booking/widget-config?businessId=${businessId}`);
        const widgetData = await widgetRes.json();
        
        if (widgetData.config) {
          setConfig({ ...DEFAULT_CONFIG, ...widgetData.config });
        } else {
          // Fallback to booking config API
          const bookingRes = await fetch(`/api/booking/${businessId}/config`);
          if (bookingRes.ok) {
            const bookingData = await bookingRes.json();
            
            // Map booking data to widget config format
            setConfig({
              ...DEFAULT_CONFIG,
              businessName: bookingData.business?.name || DEFAULT_CONFIG.businessName,
              phone: bookingData.business?.phone || DEFAULT_CONFIG.phone,
              email: bookingData.business?.email || DEFAULT_CONFIG.email,
              logoUrl: bookingData.business?.logo || DEFAULT_CONFIG.logoUrl,
              primaryColor: bookingData.config?.primary_color || DEFAULT_CONFIG.primaryColor,
              depositPercent: bookingData.config?.deposit_value || DEFAULT_CONFIG.depositPercent,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching config:', err);
        setError('Unable to load booking configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [businessId]);

  // Calculate price
  const calculatedPrice = useMemo(() => {
    if (!formData.homeSize || !formData.serviceType) return null;

    const tier = config.pricingConfig?.sqftTiers.find(t => t.id === formData.homeSize);
    const service = config.services.find(s => s.id === formData.serviceType);
    const frequency = config.pricingConfig?.frequencies.find(f => f.id === formData.frequency);

    if (!tier) return null;

    let basePrice = tier.price + (service?.basePrice || 0);
    let discount = 0;

    // Apply service discount
    if (service?.discountPercent) {
      discount += basePrice * (service.discountPercent / 100);
    }

    // Apply frequency discount
    if (frequency?.discount) {
      discount += (basePrice - discount) * frequency.discount;
    }

    // Apply promotion discount for first-time
    if (config.promotionEnabled && formData.frequency === 'one_time') {
      discount += (basePrice - discount) * (config.discountPercent / 100);
    }

    // Add add-ons
    const addOnsTotal = formData.selectedAddOns.reduce((sum, addOnId) => {
      const addOn = config.pricingConfig?.addOns.find(a => a.id === addOnId);
      return sum + (addOn?.price || 0);
    }, 0);

    const finalPrice = Math.max(basePrice - discount + addOnsTotal, config.minimumPrice);
    const depositAmount = Math.ceil(finalPrice * (config.depositPercent / 100));

    return {
      basePrice,
      discount,
      addOnsTotal,
      finalPrice,
      depositAmount,
    };
  }, [formData, config]);

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAddOn = (addOnId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(addOnId)
        ? prev.selectedAddOns.filter(id => id !== addOnId)
        : [...prev.selectedAddOns, addOnId],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.zipCode && formData.zipCode.length === 5;
      case 2: return !!formData.homeSize;
      case 3: return !!formData.serviceType;
      case 4: return !!formData.frequency;
      case 5: return !!(formData.name && formData.email && formData.phone && formData.date);
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 6 && canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/booking/${businessId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: calculatedPrice,
          businessId,
        }),
      });

      if (response.ok) {
        setStep(7); // Success step
      } else {
        throw new Error('Booking failed');
      }
    } catch (err) {
      setError('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
          <div className="h-20 bg-gray-200 animate-pulse" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !config) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const primaryColor = config.primaryColor || '#7c3aed';

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
        {/* Header */}
        <div 
          className="px-6 py-4 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover bg-white/20" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center font-bold">
                {config.businessName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-bold">{config.businessName}</h1>
              <p className="text-sm opacity-80">{config.phone}</p>
            </div>
          </div>
          
          {/* Trust Badges */}
          {config.trustBadges.filter(b => b.enabled).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {config.trustBadges.filter(b => b.enabled).map(badge => (
                <span key={badge.id} className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                  <TrustBadgeIcon type={badge.type} />
                  {badge.label}
                </span>
              ))}
            </div>
          )}
          
          {/* Progress */}
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5, 6].map(s => (
              <div
                key={s}
                className={cn(
                  'flex-1 h-1 rounded-full transition-colors',
                  s <= step ? 'bg-white' : 'bg-white/30'
                )}
              />
            ))}
          </div>
        </div>

        {/* Promotion Banner */}
        {config.promotionEnabled && step === 1 && (
          <div 
            className="px-4 py-3 text-center"
            style={{ backgroundColor: `${config.accentColor}15` }}
          >
            <p className="font-semibold" style={{ color: config.accentColor }}>
              {config.promotionHeadline}
            </p>
            <p className="text-sm text-gray-600">{config.promotionSubheadline}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: ZIP Code */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-900">Enter Your ZIP Code</h2>
                    <p className="text-gray-500 mt-1">Let&apos;s check if we service your area</p>
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter ZIP Code"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="text-center text-xl h-14"
                    maxLength={5}
                  />
                  {config.serviceZips.length > 0 && formData.zipCode.length === 5 && 
                   !config.serviceZips.includes(formData.zipCode) && (
                    <p className="text-sm text-amber-600 text-center">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      We may have limited availability in your area
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Home Size */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <Home className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-900">Select Your Home Size</h2>
                    <p className="text-gray-500 mt-1">This helps us provide accurate pricing</p>
                  </div>
                  <div className="space-y-3">
                    {config.pricingConfig?.sqftTiers.filter(t => t.enabled).map(tier => (
                      <SelectionCard
                        key={tier.id}
                        selected={formData.homeSize === tier.id}
                        onClick={() => updateFormData('homeSize', tier.id)}
                        icon={<Home className="h-5 w-5" />}
                        title={tier.label}
                        description={tier.bedroomRange}
                        price={`Starting at $${tier.price}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Service Type */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-900">Choose Your Service</h2>
                    <p className="text-gray-500 mt-1">What type of cleaning do you need?</p>
                  </div>
                  <div className="space-y-3">
                    {config.services.filter(s => s.enabled).map(service => (
                      <SelectionCard
                        key={service.id}
                        selected={formData.serviceType === service.id}
                        onClick={() => updateFormData('serviceType', service.id)}
                        icon={service.name.toLowerCase().includes('deep') ? <Brush className="h-5 w-5" /> : 
                              service.name.toLowerCase().includes('move') ? <Truck className="h-5 w-5" /> :
                              <Sparkles className="h-5 w-5" />}
                        title={service.name}
                        description={service.description}
                        badge={service.popular ? 'Popular' : service.discountPercent ? `${service.discountPercent}% Off` : undefined}
                        price={service.basePrice > 0 ? `+$${service.basePrice}` : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Frequency */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-900">How Often?</h2>
                    <p className="text-gray-500 mt-1">Save more with recurring service</p>
                  </div>
                  <div className="space-y-3">
                    {config.pricingConfig?.frequencies.map(freq => (
                      <SelectionCard
                        key={freq.id}
                        selected={formData.frequency === freq.id}
                        onClick={() => updateFormData('frequency', freq.id)}
                        icon={<Calendar className="h-5 w-5" />}
                        title={freq.name}
                        description={freq.discount ? `Save ${(freq.discount * 100).toFixed(0)}% per clean` : 'Single visit'}
                        badge={freq.badge}
                      />
                    ))}
                  </div>

                  {/* Add-ons */}
                  {(config.pricingConfig?.addOns?.filter(a => a.enabled)?.length ?? 0) > 0 && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Add Extra Services</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {config.pricingConfig?.addOns.filter(a => a.enabled).map(addOn => (
                            <button
                              key={addOn.id}
                              onClick={() => toggleAddOn(addOn.id)}
                              className={cn(
                                'p-3 rounded-lg border-2 text-left text-sm transition-colors',
                                formData.selectedAddOns.includes(addOn.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              )}
                            >
                              <p className="font-medium">{addOn.name}</p>
                              <p className="text-gray-500">+${addOn.price}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Price Preview */}
                  {calculatedPrice && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estimated Total</span>
                        <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                          ${calculatedPrice.finalPrice}
                        </span>
                      </div>
                      {calculatedPrice.discount > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          You save ${calculatedPrice.discount.toFixed(0)}!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Contact & Schedule */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-900">Your Details</h2>
                    <p className="text-gray-500 mt-1">How can we reach you?</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          placeholder="john@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => updateFormData('date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                        <Input
                          type="time"
                          value={formData.time}
                          onChange={(e) => updateFormData('time', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Summary */}
              {step === 6 && calculatedPrice && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <h2 className="text-xl font-bold text-gray-900">Confirm Your Booking</h2>
                    <p className="text-gray-500 mt-1">Review your selection</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service</span>
                      <span className="font-medium">{config.services.find(s => s.id === formData.serviceType)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Size</span>
                      <span className="font-medium">{config.pricingConfig?.sqftTiers.find(t => t.id === formData.homeSize)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency</span>
                      <span className="font-medium">{config.pricingConfig?.frequencies.find(f => f.id === formData.frequency)?.name}</span>
                    </div>
                    {formData.selectedAddOns.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Add-ons</span>
                        <span className="font-medium">{formData.selectedAddOns.length} selected</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span style={{ color: primaryColor }}>${calculatedPrice.finalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Deposit Due Now ({config.depositPercent}%)</span>
                      <span>${calculatedPrice.depositAmount}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      A {config.depositPercent}% deposit is required to secure your booking. 
                      The remaining balance is due after service completion.
                    </p>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex justify-center gap-4 pt-2">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Shield className="h-4 w-4 text-green-500" />
                      Insured
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Guaranteed
                    </span>
                    {config.showRating && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {config.ratingValue} ({config.reviewCount})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Step 7: Success */}
              {step === 7 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                  <p className="text-gray-500 mb-6">
                    We&apos;ve sent a confirmation to {formData.email}
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Book Another Service
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {step < 7 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center gap-4">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                style={{ backgroundColor: canProceed() ? primaryColor : undefined }}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm & Pay ${calculatedPrice?.depositAmount}
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Rating Footer */}
        {config.showRating && step < 7 && (
          <div className="px-6 py-3 border-t bg-white text-center">
            <div className="flex items-center justify-center gap-0.5 text-yellow-400">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-700">
                {config.ratingValue} • {config.reviewCount} reviews
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegratedBookingWidget;
