'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

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
  Star,
  Shield,
  Loader2,
  AlertCircle,
  Check,
  Lock,
  CreditCard,
  ArrowRight,
  Zap,
  BadgeCheck,
  Gift
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
  features?: string[];
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
  description?: string;
  badge?: string;
}

interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  enabled: boolean;
}

interface BookingData {
  zipCode: string;
  homeSize: string;
  bedrooms: number;
  bathrooms: number;
  serviceType: string;
  frequency: string;
  selectedAddOns: string[];
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  time: string;
  notes: string;
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
    { 
      id: 'standard', 
      name: 'Standard Clean', 
      description: 'Regular maintenance cleaning for a fresh home',
      features: ['All rooms dusted & vacuumed', 'Bathrooms sanitized', 'Kitchen cleaned', 'Floors mopped'],
      basePrice: 0, 
      discountPercent: 0, 
      popular: false, 
      enabled: true 
    },
    { 
      id: 'deep', 
      name: 'Deep Clean', 
      description: 'Intensive top-to-bottom cleaning',
      features: ['Everything in Standard', 'Inside appliances', 'Baseboards & blinds', 'Light fixtures'],
      basePrice: 75, 
      discountPercent: 20, 
      popular: true, 
      enabled: true 
    },
    { 
      id: 'move', 
      name: 'Move In/Out Clean', 
      description: 'Complete cleaning for move transitions',
      features: ['Everything in Deep Clean', 'Inside all cabinets', 'Garage sweep', 'Window tracks'],
      basePrice: 125, 
      discountPercent: 0, 
      popular: false, 
      enabled: true 
    },
  ],
  trustBadges: [
    { id: '1', type: 'insured', enabled: true, label: 'Fully Insured' },
    { id: '2', type: 'guarantee', enabled: true, label: '100% Satisfaction' },
    { id: '3', type: 'background', enabled: true, label: 'Background Checked' },
  ],
  showRating: true,
  ratingValue: 4.9,
  reviewCount: 500,
  promotionEnabled: true,
  promotionHeadline: '🎉 Get 20% Off Your First Clean!',
  promotionSubheadline: 'Limited time offer for new customers',
  discountPercent: 20,
  depositPercent: 25,
  minimumPrice: 99,
  serviceZips: [],
  pricingConfig: {
    basePrices: {},
    sqftTiers: [
      { id: 'small', label: 'Under 1,500 sq ft', minSqft: 0, maxSqft: 1500, price: 149, bedroomRange: '1-2 Bedrooms', enabled: true },
      { id: 'medium', label: '1,500 - 2,500 sq ft', minSqft: 1500, maxSqft: 2500, price: 199, bedroomRange: '2-3 Bedrooms', enabled: true },
      { id: 'large', label: '2,500 - 3,500 sq ft', minSqft: 2500, maxSqft: 3500, price: 269, bedroomRange: '3-4 Bedrooms', enabled: true },
      { id: 'xlarge', label: '3,500+ sq ft', minSqft: 3500, maxSqft: 10000, price: 349, bedroomRange: '4+ Bedrooms', enabled: true },
    ],
    frequencies: [
      { id: 'one_time', name: 'One-Time Clean', discount: 0, description: 'Perfect for a fresh start' },
      { id: 'weekly', name: 'Weekly', discount: 0.25, description: 'Most popular choice', badge: 'Save 25%' },
      { id: 'biweekly', name: 'Every 2 Weeks', discount: 0.20, description: 'Great balance', badge: 'Save 20%' },
      { id: 'monthly', name: 'Monthly', discount: 0.15, description: 'Light maintenance', badge: 'Save 15%' },
    ],
    addOns: [
      { id: 'fridge', name: 'Inside Refrigerator', description: 'Deep clean shelves & drawers', price: 35, enabled: true },
      { id: 'oven', name: 'Inside Oven', description: 'Remove grease & buildup', price: 35, enabled: true },
      { id: 'cabinets', name: 'Inside Cabinets', description: 'Wipe down all shelves', price: 45, enabled: true },
      { id: 'windows', name: 'Interior Windows', description: 'Crystal clear windows', price: 5, enabled: true },
      { id: 'laundry', name: 'Laundry Service', description: 'Wash, dry & fold', price: 35, enabled: true },
      { id: 'organizing', name: 'Light Organizing', description: 'Declutter & organize', price: 50, enabled: true },
    ],
  },
};

const STEPS = [
  { id: 1, label: 'Location', icon: MapPin },
  { id: 2, label: 'Home', icon: Home },
  { id: 3, label: 'Service', icon: Sparkles },
  { id: 4, label: 'Schedule', icon: Calendar },
  { id: 5, label: 'Details', icon: User },
  { id: 6, label: 'Confirm', icon: Check },
];

// ═══════════════════════════════════════════════════════════
// STEP PROGRESS BAR
// ═══════════════════════════════════════════════════════════

function StepProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="w-full">
      {/* Desktop: Show all steps */}
      <div className="hidden sm:flex items-center justify-between mb-2">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = idx + 1 === currentStep;
          const isCompleted = idx + 1 < currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                isActive && 'bg-white text-primary',
                isCompleted && 'bg-white/20 text-white',
                !isActive && !isCompleted && 'text-white/60'
              )}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
                <span className="hidden md:inline">{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  'w-8 lg:w-12 h-0.5 mx-1',
                  idx + 1 < currentStep ? 'bg-white/60' : 'bg-white/20'
                )} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mobile: Progress bar */}
      <div className="sm:hidden">
        <div className="flex justify-between text-sm text-white/80 mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{STEPS[currentStep - 1]?.label}</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SELECTION CARD
// ═══════════════════════════════════════════════════════════

function SelectionCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden',
        selected
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-gray-200 hover:border-primary/40 hover:shadow-md bg-white',
        className
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {selected && (
        <motion.div 
          className="absolute top-3 right-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        </motion.div>
      )}
      {children}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN WIDGET COMPONENT
// ═══════════════════════════════════════════════════════════

export function ModernBookingWidget({ businessId }: BookingWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<BookingData>({
    zipCode: '',
    homeSize: '',
    bedrooms: 3,
    bathrooms: 2,
    serviceType: '',
    frequency: '',
    selectedAddOns: [],
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    notes: '',
  });

  // Fetch configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const widgetRes = await fetch(`/api/booking/widget-config?businessId=${businessId}`);
        const widgetData = await widgetRes.json();
        
        if (widgetData.config) {
          setConfig({ ...DEFAULT_CONFIG, ...widgetData.config });
        } else {
          const bookingRes = await fetch(`/api/booking/${businessId}/config`);
          if (bookingRes.ok) {
            const bookingData = await bookingRes.json();
            setConfig({
              ...DEFAULT_CONFIG,
              businessName: bookingData.business?.name || DEFAULT_CONFIG.businessName,
              phone: bookingData.business?.phone || DEFAULT_CONFIG.phone,
              logoUrl: bookingData.business?.logo || DEFAULT_CONFIG.logoUrl,
              primaryColor: bookingData.config?.primary_color || DEFAULT_CONFIG.primaryColor,
              depositPercent: bookingData.config?.deposit_value || DEFAULT_CONFIG.depositPercent,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching config:', err);
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
    let discountReasons: string[] = [];

    // Service discount
    if (service?.discountPercent) {
      const serviceDiscount = basePrice * (service.discountPercent / 100);
      discount += serviceDiscount;
      discountReasons.push(`${service.discountPercent}% ${service.name} discount`);
    }

    // Frequency discount
    if (frequency?.discount) {
      const freqDiscount = (basePrice - discount) * frequency.discount;
      discount += freqDiscount;
      discountReasons.push(`${(frequency.discount * 100).toFixed(0)}% recurring discount`);
    }

    // First-time promo
    if (config.promotionEnabled && formData.frequency === 'one_time') {
      const promoDiscount = (basePrice - discount) * (config.discountPercent / 100);
      discount += promoDiscount;
      discountReasons.push(`${config.discountPercent}% new customer discount`);
    }

    // Add-ons
    const addOnsTotal = formData.selectedAddOns.reduce((sum, addOnId) => {
      const addOn = config.pricingConfig?.addOns.find(a => a.id === addOnId);
      return sum + (addOn?.price || 0);
    }, 0);

    const finalPrice = Math.max(Math.round(basePrice - discount + addOnsTotal), config.minimumPrice);
    const depositAmount = Math.ceil(finalPrice * (config.depositPercent / 100));

    return {
      basePrice,
      discount: Math.round(discount),
      addOnsTotal,
      finalPrice,
      depositAmount,
      discountReasons,
      perClean: frequency?.discount ? Math.round(finalPrice) : null,
    };
  }, [formData, config]);

  const updateFormData = useCallback((field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleAddOn = useCallback((addOnId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(addOnId)
        ? prev.selectedAddOns.filter(id => id !== addOnId)
        : [...prev.selectedAddOns, addOnId],
    }));
  }, []);

  const canProceed = () => {
    switch (step) {
      case 1: return formData.zipCode.length === 5;
      case 2: return !!formData.homeSize;
      case 3: return !!formData.serviceType && !!formData.frequency;
      case 4: return !!formData.date;
      case 5: return !!(formData.name && formData.email && formData.phone && formData.address);
      case 6: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/booking/${businessId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price: calculatedPrice, businessId }),
      });
      if (response.ok) {
        setStep(7);
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
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-pulse">
          <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600" />
          <div className="p-8 space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto" />
            <div className="space-y-4">
              <div className="h-24 bg-gray-100 rounded-2xl" />
              <div className="h-24 bg-gray-100 rounded-2xl" />
              <div className="h-24 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primaryColor = config.primaryColor || '#7c3aed';

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div 
          className="px-6 py-6 md:px-10 md:py-8"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
        >
          {/* Business Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="" className="h-12 w-12 md:h-14 md:w-14 rounded-xl object-cover bg-white/20" />
              ) : (
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                  {config.businessName.charAt(0)}
                </div>
              )}
              <div className="text-white">
                <h1 className="text-xl md:text-2xl font-bold">{config.businessName}</h1>
                <div className="flex items-center gap-3 text-sm text-white/80 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {config.phone}
                  </span>
                  {config.showRating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {config.ratingValue} ({config.reviewCount}+)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Trust Badges - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {config.trustBadges.filter(b => b.enabled).slice(0, 3).map(badge => (
                <div key={badge.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-full text-white text-xs">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Progress */}
          {step < 7 && <StepProgress currentStep={step} totalSteps={6} />}
        </div>

        {/* Promo Banner */}
        {config.promotionEnabled && step === 1 && (
          <div className="px-6 py-4 md:px-10 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
            <div className="flex items-center justify-center gap-2 text-amber-800">
              <Gift className="h-5 w-5" />
              <span className="font-semibold">{config.promotionHeadline}</span>
            </div>
            <p className="text-center text-sm text-amber-600 mt-0.5">{config.promotionSubheadline}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* STEP 1: ZIP CODE */}
              {step === 1 && (
                <div className="max-w-md mx-auto space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                      <MapPin className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Where are you located?</h2>
                    <p className="text-gray-500 mt-2 text-lg">Enter your ZIP code to check service availability</p>
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter ZIP Code"
                      value={formData.zipCode}
                      onChange={(e) => updateFormData('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                      className="text-center text-3xl md:text-4xl h-20 md:h-24 font-bold rounded-2xl border-2 focus:border-primary"
                      maxLength={5}
                    />
                    {formData.zipCode.length === 5 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </motion.div>
                    )}
                  </div>

                  {/* Trust indicators */}
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    {[
                      { icon: Shield, text: 'Fully Insured' },
                      { icon: BadgeCheck, text: 'Background Checked' },
                      { icon: Lock, text: 'Secure Booking' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-sm text-gray-500">
                        <item.icon className="h-4 w-4 text-green-500" />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: HOME SIZE */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Tell us about your home</h2>
                    <p className="text-gray-500 mt-2 text-lg">Select your home size for accurate pricing</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {config.pricingConfig?.sqftTiers.filter(t => t.enabled).map((tier, idx) => (
                      <SelectionCard
                        key={tier.id}
                        selected={formData.homeSize === tier.id}
                        onClick={() => updateFormData('homeSize', tier.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'p-3 rounded-xl transition-colors',
                            formData.homeSize === tier.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                          )}>
                            <Home className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 text-lg">{tier.label}</h3>
                              {idx === 1 && (
                                <Badge className="bg-primary/10 text-primary text-xs">Popular</Badge>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm mt-0.5">{tier.bedroomRange}</p>
                            <p className="text-primary font-bold text-lg mt-2">
                              From ${tier.price}
                            </p>
                          </div>
                        </div>
                      </SelectionCard>
                    ))}
                  </div>

                  {/* Bedroom/Bathroom Counter */}
                  {formData.homeSize && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid sm:grid-cols-2 gap-4 pt-4"
                    >
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <label className="text-sm font-medium text-gray-600 block mb-3">Bedrooms</label>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => updateFormData('bedrooms', Math.max(1, formData.bedrooms - 1))}
                            className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-primary transition-colors"
                          >
                            -
                          </button>
                          <span className="text-3xl font-bold text-gray-900">{formData.bedrooms}</span>
                          <button
                            onClick={() => updateFormData('bedrooms', Math.min(10, formData.bedrooms + 1))}
                            className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-primary transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <label className="text-sm font-medium text-gray-600 block mb-3">Bathrooms</label>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => updateFormData('bathrooms', Math.max(1, formData.bathrooms - 1))}
                            className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-primary transition-colors"
                          >
                            -
                          </button>
                          <span className="text-3xl font-bold text-gray-900">{formData.bathrooms}</span>
                          <button
                            onClick={() => updateFormData('bathrooms', Math.min(10, formData.bathrooms + 1))}
                            className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-primary transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 3: SERVICE & FREQUENCY */}
              {step === 3 && (
                <div className="space-y-8">
                  {/* Service Type */}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
                      Choose your service
                    </h2>
                    <p className="text-gray-500 text-center text-lg mb-6">What type of cleaning do you need?</p>
                    
                    <div className="grid gap-4">
                      {config.services.filter(s => s.enabled).map(service => (
                        <SelectionCard
                          key={service.id}
                          selected={formData.serviceType === service.id}
                          onClick={() => updateFormData('serviceType', service.id)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className={cn(
                              'p-3 rounded-xl transition-colors shrink-0',
                              formData.serviceType === service.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                            )}>
                              {service.id === 'deep' ? <Brush className="h-6 w-6" /> :
                               service.id === 'move' ? <Truck className="h-6 w-6" /> :
                               <Sparkles className="h-6 w-6" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                                {service.popular && (
                                  <Badge className="bg-amber-100 text-amber-700">Most Popular</Badge>
                                )}
                                {service.discountPercent > 0 && (
                                  <Badge className="bg-green-100 text-green-700">{service.discountPercent}% Off</Badge>
                                )}
                              </div>
                              <p className="text-gray-500 mt-1">{service.description}</p>
                              {service.features && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {service.features.slice(0, 4).map((feature, i) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {service.basePrice > 0 && (
                              <div className="text-right shrink-0">
                                <span className="text-primary font-bold text-lg">+${service.basePrice}</span>
                              </div>
                            )}
                          </div>
                        </SelectionCard>
                      ))}
                    </div>
                  </div>

                  {/* Frequency */}
                  {formData.serviceType && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Separator className="my-8" />
                      <h3 className="text-xl font-bold text-gray-900 text-center mb-2">How often?</h3>
                      <p className="text-gray-500 text-center mb-6">Save more with recurring service</p>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {config.pricingConfig?.frequencies.map(freq => (
                          <SelectionCard
                            key={freq.id}
                            selected={formData.frequency === freq.id}
                            onClick={() => updateFormData('frequency', freq.id)}
                            className="text-center"
                          >
                            <div>
                              <h4 className="font-bold text-gray-900">{freq.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">{freq.description}</p>
                              {freq.badge && (
                                <Badge className="mt-2 bg-green-100 text-green-700">{freq.badge}</Badge>
                              )}
                            </div>
                          </SelectionCard>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Add-ons */}
                  {formData.frequency && (config.pricingConfig?.addOns?.filter(a => a.enabled)?.length ?? 0) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Separator className="my-8" />
                      <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Add extras?</h3>
                      <p className="text-gray-500 text-center mb-6">Customize your cleaning</p>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {config.pricingConfig?.addOns.filter(a => a.enabled).map(addOn => (
                          <button
                            key={addOn.id}
                            onClick={() => toggleAddOn(addOn.id)}
                            className={cn(
                              'p-4 rounded-xl border-2 text-left transition-all',
                              formData.selectedAddOns.includes(addOn.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-primary/40'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{addOn.name}</p>
                                {addOn.description && (
                                  <p className="text-sm text-gray-500">{addOn.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary">+${addOn.price}</span>
                                <Checkbox 
                                  checked={formData.selectedAddOns.includes(addOn.id)}
                                  className="pointer-events-none"
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Price Preview */}
                  {calculatedPrice && formData.frequency && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 font-medium">Your Estimated Price</p>
                          {calculatedPrice.discount > 0 && (
                            <p className="text-sm text-green-600 mt-1">
                              You save ${calculatedPrice.discount}!
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {calculatedPrice.discount > 0 && (
                            <p className="text-gray-400 line-through text-lg">
                              ${calculatedPrice.basePrice + calculatedPrice.addOnsTotal}
                            </p>
                          )}
                          <p className="text-4xl font-bold text-primary">
                            ${calculatedPrice.finalPrice}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 4: SCHEDULE */}
              {step === 4 && (
                <div className="max-w-lg mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Pick your date & time</h2>
                    <p className="text-gray-500 mt-2 text-lg">When would you like us to come?</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Preferred Date
                      </label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => updateFormData('date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-14 text-lg rounded-xl"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Preferred Time (Optional)
                      </label>
                      <Input
                        type="time"
                        value={formData.time}
                        onChange={(e) => updateFormData('time', e.target.value)}
                        className="h-14 text-lg rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => updateFormData('notes', e.target.value)}
                        placeholder="Any special requests, access codes, pet info, etc."
                        className="w-full h-24 px-4 py-3 border-2 rounded-xl resize-none focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: CONTACT DETAILS */}
              {step === 5 && (
                <div className="max-w-lg mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Your Details</h2>
                    <p className="text-gray-500 mt-2 text-lg">How can we reach you?</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-2" />
                        Full Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="John Smith"
                        className="h-14 text-lg rounded-xl"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          placeholder="john@email.com"
                          className="h-14 text-lg rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Phone className="h-4 w-4 inline mr-2" />
                          Phone
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          placeholder="(555) 123-4567"
                          className="h-14 text-lg rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Service Address
                      </label>
                      <Input
                        value={formData.address}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        placeholder="123 Main St, City, State"
                        className="h-14 text-lg rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: CONFIRMATION */}
              {step === 6 && calculatedPrice && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Review Your Booking</h2>
                    <p className="text-gray-500 mt-2 text-lg">Almost there! Review and confirm.</p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-bold text-gray-900">{config.services.find(s => s.id === formData.serviceType)?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Home Size</p>
                        <p className="font-bold text-gray-900">{config.pricingConfig?.sqftTiers.find(t => t.id === formData.homeSize)?.label}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Frequency</p>
                        <p className="font-bold text-gray-900">{config.pricingConfig?.frequencies.find(f => f.id === formData.frequency)?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-bold text-gray-900">
                          {formData.date ? new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'TBD'}
                        </p>
                      </div>
                    </div>

                    {formData.selectedAddOns.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500 mb-2">Add-ons</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedAddOns.map(id => {
                            const addOn = config.pricingConfig?.addOns.find(a => a.id === id);
                            return addOn && (
                              <Badge key={id} variant="secondary">{addOn.name} (+${addOn.price})</Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Pricing Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Base Price</span>
                        <span>${calculatedPrice.basePrice}</span>
                      </div>
                      {calculatedPrice.addOnsTotal > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Add-ons</span>
                          <span>+${calculatedPrice.addOnsTotal}</span>
                        </div>
                      )}
                      {calculatedPrice.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-${calculatedPrice.discount}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="text-primary">${calculatedPrice.finalPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 bg-amber-50 p-3 rounded-lg">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          Deposit Due Today ({config.depositPercent}%)
                        </span>
                        <span className="font-bold text-amber-700">${calculatedPrice.depositAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Summary */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <p><span className="text-gray-500">Name:</span> {formData.name}</p>
                      <p><span className="text-gray-500">Email:</span> {formData.email}</p>
                      <p><span className="text-gray-500">Phone:</span> {formData.phone}</p>
                      <p><span className="text-gray-500">Address:</span> {formData.address}</p>
                    </div>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex flex-wrap justify-center gap-6 py-4">
                    {[
                      { icon: Shield, text: 'Insured & Bonded' },
                      { icon: Star, text: '5-Star Service' },
                      { icon: Lock, text: 'Secure Payment' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-500">
                        <item.icon className="h-5 w-5 text-green-500" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: SUCCESS */}
              {step === 7 && (
                <div className="text-center py-12 max-w-md mx-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
                  <p className="text-gray-500 text-lg mb-8">
                    We&apos;ve sent a confirmation email to<br />
                    <span className="font-semibold text-gray-700">{formData.email}</span>
                  </p>
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <p className="text-sm text-gray-500 mb-2">Your booking reference</p>
                    <p className="text-2xl font-mono font-bold text-primary">
                      #{Math.random().toString(36).substring(2, 8).toUpperCase()}
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.reload()} 
                    size="lg"
                    className="rounded-xl"
                  >
                    Book Another Service
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {step < 7 && (
          <div className="px-6 py-5 md:px-10 bg-gray-50 border-t flex justify-between items-center gap-4">
            {step > 1 ? (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                size="lg"
                className="rounded-xl"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {/* Price indicator */}
            {calculatedPrice && step > 2 && step < 6 && (
              <div className="hidden sm:block text-center">
                <p className="text-sm text-gray-500">Estimated Total</p>
                <p className="text-2xl font-bold text-primary">${calculatedPrice.finalPrice}</p>
              </div>
            )}

            {step < 6 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                size="lg"
                className="rounded-xl min-w-[160px]"
                style={{ backgroundColor: canProceed() ? primaryColor : undefined }}
              >
                Continue
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                size="lg"
                className="rounded-xl min-w-[200px] bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Pay ${calculatedPrice?.depositAmount} Deposit
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModernBookingWidget;
