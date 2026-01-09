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
import {
  BookingWidgetConfig,
  SqftOption,
  ServiceOffer,
  calculatePrice,
  getDefaultConfig,
} from '@/lib/booking/types';

// ============================================================================
// TYPES
// ============================================================================

interface BookingState {
  step: number;
  zip: string;
  zipValid: boolean;
  cityState: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sqftOption: SqftOption | null;
  serviceOffer: ServiceOffer | null;
  address1: string;
  address2: string;
  city: string;
  state: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  paymentComplete: boolean;
  bookingId: string;
}

interface PublicBookingWidgetProps {
  config: BookingWidgetConfig;
  preview?: boolean;
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

// Header Component
function WidgetHeader({ config }: { config: BookingWidgetConfig }) {
  const { header, branding } = config;
  
  return (
    <div 
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{ backgroundColor: branding.cardBackground }}
    >
      <div className="flex items-center gap-3">
        {header.logoUrl ? (
          <img src={header.logoUrl} alt={header.businessName} className="h-8 w-auto" />
        ) : (
          <div 
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: branding.primaryColor }}
          >
            {header.businessName.charAt(0)}
          </div>
        )}
        <span className="font-semibold text-sm" style={{ color: branding.textColor }}>
          {header.businessName}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {header.showWebsiteLink && (
          <a 
            href={header.websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium hover:bg-gray-50"
            style={{ color: branding.textColor }}
          >
            <Icon name="globe" size="xs" />
            {header.websiteLabel}
          </a>
        )}
        {header.showPhone && (
          <a 
            href={`tel:${header.phoneNumber}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium hover:bg-gray-50"
            style={{ color: branding.textColor }}
          >
            <Icon name="phone" size="xs" />
            {header.phoneNumber}
          </a>
        )}
      </div>
    </div>
  );
}

// Progress Bar
function ProgressBar({ 
  step, 
  totalSteps, 
  config 
}: { 
  step: number; 
  totalSteps: number; 
  config: BookingWidgetConfig;
}) {
  const { progress, branding } = config;
  const percentage = Math.round((step / totalSteps) * 100);
  
  return (
    <div className="px-4 py-3 border-b" style={{ backgroundColor: branding.cardBackground }}>
      <div className="flex items-center justify-between text-xs mb-2">
        <span style={{ color: branding.textColor }}>Step {step} of {totalSteps}</span>
        {progress.showPercentage && (
          <span style={{ color: branding.primaryColor }} className="font-medium">{percentage}%</span>
        )}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: progress.color || branding.primaryColor }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// Trust Badge
function TrustBadge({ config }: { config: BookingWidgetConfig }) {
  const activeBadge = config.trustBadges.find(b => b.enabled && b.type === 'google_guaranteed');
  if (!activeBadge) return null;
  
  return (
    <div className="flex justify-center py-4">
      <div 
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
        style={{ 
          backgroundColor: `${activeBadge.color}10`,
          borderColor: `${activeBadge.color}30`,
        }}
      >
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: activeBadge.color }}
        >
          <Icon name="check" size="xs" className="text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium" style={{ color: activeBadge.color }}>
            {activeBadge.label}
          </p>
          {activeBadge.sublabel && (
            <p className="text-xs text-gray-500">{activeBadge.sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Promotion Banner
function PromotionBanner({ config }: { config: BookingWidgetConfig }) {
  const { promotion, branding } = config;
  if (!promotion.enabled) return null;
  
  const expiryDate = new Date(promotion.expiryDate);
  const formattedDate = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return (
    <div className="text-center py-6 px-4">
      <h1 
        className="text-2xl md:text-3xl font-bold mb-2"
        style={{ color: branding.primaryColor }}
      >
        {promotion.headline}
      </h1>
      <p 
        className="text-xl md:text-2xl font-semibold"
        style={{ color: branding.accentColor }}
      >
        {promotion.subheadline}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Book by {formattedDate} — Enter your ZIP to get started
      </p>
    </div>
  );
}

// Showcase Carousel
function ShowcaseCarousel({ config }: { config: BookingWidgetConfig }) {
  const [current, setCurrent] = React.useState(0);
  const images = config.showcaseImages.filter(img => img.enabled);
  
  if (images.length === 0) return null;
  
  return (
    <div className="px-4 py-6">
      <h3 className="text-center font-semibold mb-2" style={{ color: config.branding.textColor }}>
        See Our Professional Results
      </h3>
      <p className="text-center text-sm text-gray-500 mb-4">
        Real photos from our cleaning services
      </p>
      <div className="relative rounded-xl overflow-hidden bg-gray-200 aspect-video">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <Icon name="image" size="3xl" />
        </div>
        {images[current]?.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-sm font-medium">{images[current].caption}</p>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                idx === current ? "bg-gray-800" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Reviews Section
function ReviewsSection({ config }: { config: BookingWidgetConfig }) {
  const { reviews, branding } = config;
  const [currentReview, setCurrentReview] = React.useState(0);
  
  if (!reviews.enabled || reviews.reviews.length === 0) return null;
  
  return (
    <div className="px-4 py-6 border-t">
      <h3 className="text-center font-semibold mb-1" style={{ color: branding.textColor }}>
        {reviews.headline}
      </h3>
      <p className="text-center text-sm text-gray-500 mb-4">{reviews.subheadline}</p>
      
      <Card className="max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">Check Out Our Happy Client</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-3xl font-bold">{reviews.averageRating.toFixed(2)}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon key={star} name="star" size="sm" className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-500">{reviews.totalReviews} reviews</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon 
                  key={star} 
                  name="star" 
                  size="sm" 
                  className={star <= reviews.reviews[currentReview].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                />
              ))}
              <span className="text-xs text-gray-500 ml-2">
                {new Date(reviews.reviews[currentReview].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-gray-600 italic">"{reviews.reviews[currentReview].text}"</p>
            <p className="text-sm font-medium">— {reviews.reviews[currentReview].author}</p>
          </div>
          
          {reviews.reviews.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentReview(prev => prev === 0 ? reviews.reviews.length - 1 : prev - 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Icon name="chevronLeft" size="sm" />
              </button>
              <span className="text-xs text-gray-500">
                {currentReview + 1} / {reviews.reviews.length}
              </span>
              <button
                onClick={() => setCurrentReview(prev => prev === reviews.reviews.length - 1 ? 0 : prev + 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Icon name="chevronRight" size="sm" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Step 1: ZIP Code & Lead Capture
function ZipStep({
  state,
  setState,
  config,
  onNext,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingWidgetConfig;
  onNext: () => void;
}) {
  const { branding, leadCaptureFields } = config;
  const [checking, setChecking] = React.useState(false);
  
  const checkZip = async () => {
    setChecking(true);
    // Simulate ZIP validation
    await new Promise(r => setTimeout(r, 800));
    
    // Mock validation - in production, check against serviceAreaZips
    const isValid = state.zip.length === 5 && /^\d+$/.test(state.zip);
    setState(prev => ({
      ...prev,
      zipValid: isValid,
      cityState: isValid ? 'Houston, TX' : '', // Would come from API
    }));
    setChecking(false);
    
    if (!isValid) {
      toast.error('Sorry, we don\'t service this area yet');
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
    <div className="px-4 py-6">
      {!state.zipValid ? (
        // Phase 1: ZIP Code Entry
        <div className="max-w-sm mx-auto space-y-4">
          <div>
            <Label className="text-sm font-medium">ZIP Code</Label>
            <Input
              value={state.zip}
              onChange={(e) => setState(prev => ({ ...prev, zip: e.target.value.slice(0, 5) }))}
              placeholder="75001"
              className="mt-1 text-center text-lg"
              style={{ borderRadius: branding.borderRadius }}
              maxLength={5}
            />
          </div>
          <Button
            onClick={checkZip}
            disabled={state.zip.length !== 5 || checking}
            className="w-full text-white"
            style={{ 
              backgroundColor: branding.primaryColor,
              borderRadius: branding.borderRadius,
            }}
          >
            {checking ? (
              <>
                <Icon name="spinner" size="sm" className="animate-spin mr-2" />
                Checking...
              </>
            ) : (
              'Check Availability'
            )}
          </Button>
        </div>
      ) : (
        // Phase 2: Lead Capture Form
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div 
            className="p-4 rounded-xl border mb-6"
            style={{ 
              backgroundColor: `${branding.accentColor}10`,
              borderColor: `${branding.accentColor}30`,
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: branding.accentColor }}
              >
                <Icon name="check" size="xs" className="text-white" />
              </div>
              <div>
                <p className="font-medium" style={{ color: branding.textColor }}>
                  Great news! We service {state.cityState}
                </p>
                <p className="text-sm text-gray-500">
                  Enter your details to claim your New Year discount
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">First Name</Label>
                <Input
                  value={state.firstName}
                  onChange={(e) => setState(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className="mt-1"
                  style={{ borderRadius: branding.borderRadius }}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Last Name</Label>
                <Input
                  value={state.lastName}
                  onChange={(e) => setState(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Smith"
                  className="mt-1"
                  style={{ borderRadius: branding.borderRadius }}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input
                type="email"
                value={state.email}
                onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                className="mt-1"
                style={{ borderRadius: branding.borderRadius }}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Phone Number</Label>
              <Input
                type="tel"
                value={state.phone}
                onChange={(e) => setState(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
                className="mt-1"
                style={{ borderRadius: branding.borderRadius }}
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              className="w-full text-white"
              style={{ 
                backgroundColor: branding.primaryColor,
                borderRadius: branding.borderRadius,
              }}
            >
              Claim My Discount →
            </Button>
            
            <button
              onClick={() => setState(prev => ({ ...prev, zipValid: false, zip: '' }))}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Change ZIP code ({state.zip})
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Step 2: Square Footage Selection
function SqftStep({
  state,
  setState,
  config,
  onNext,
  onBack,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingWidgetConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const { branding, sqftOptions } = config;
  const enabledOptions = sqftOptions.filter(opt => opt.enabled);
  
  const handleSelect = (option: SqftOption) => {
    if (option.requiresCall) {
      toast.info('Please call us for homes over 5,000 sq ft');
      return;
    }
    setState(prev => ({ ...prev, sqftOption: option }));
    onNext();
  };
  
  return (
    <div className="px-4 py-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: branding.textColor }}>
          What size is your home?
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          This helps us provide an accurate estimate
        </p>
      </div>
      
      <div className="max-w-lg mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
        {enabledOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            className={cn(
              "p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
              state.sqftOption?.id === option.id 
                ? "border-current shadow-lg" 
                : "border-gray-200 hover:border-gray-300"
            )}
            style={{ 
              borderRadius: branding.borderRadius,
              borderColor: state.sqftOption?.id === option.id ? branding.primaryColor : undefined,
              backgroundColor: state.sqftOption?.id === option.id ? `${branding.primaryColor}10` : undefined,
            }}
          >
            <p className="font-medium" style={{ color: branding.textColor }}>
              {option.label}
            </p>
            <p className="text-xs text-gray-500">sq ft</p>
            {option.requiresCall && (
              <Badge variant="secondary" className="mt-2 text-xs">Call us</Badge>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// Step 3: Service Offer Selection
function OfferStep({
  state,
  setState,
  config,
  onNext,
  onBack,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingWidgetConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const { branding, serviceOffers, promotion } = config;
  const enabledOffers = serviceOffers.filter(offer => offer.enabled);
  
  const handleSelect = (offer: ServiceOffer) => {
    setState(prev => ({ ...prev, serviceOffer: offer }));
    onNext();
  };
  
  const getPricing = (offer: ServiceOffer) => {
    if (!state.sqftOption) return { basePrice: 0, total: 0, deposit: 0 };
    return calculatePrice(state.sqftOption, offer, config);
  };
  
  return (
    <div className="px-4 py-6">
      {/* Sticky banner */}
      {promotion.enabled && (
        <div 
          className="sticky top-0 -mx-4 px-4 py-2 text-center text-sm font-medium text-white mb-4"
          style={{ backgroundColor: branding.primaryColor }}
        >
          ${promotion.discountAmount} Off + {promotion.recurringDiscount}% Off — Limited Time
        </div>
      )}
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: branding.textColor }}>
          Start 2025 With a Spotless Home
        </h2>
        <TrustBadge config={config} />
      </div>
      
      <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-4">
        {enabledOffers.map((offer) => {
          const pricing = getPricing(offer);
          return (
            <div
              key={offer.id}
              className={cn(
                "relative p-6 rounded-xl border-2 transition-all",
                offer.popular && "ring-2"
              )}
              style={{ 
                borderRadius: branding.borderRadius,
                borderColor: offer.color,
                ...(offer.popular && { ringColor: offer.color }),
              }}
            >
              {offer.popular && (
                <Badge 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-white"
                  style={{ backgroundColor: offer.color }}
                >
                  Most Popular
                </Badge>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: branding.textColor }}>
                  {offer.name}
                </h3>
                {offer.discountBadge && (
                  <Badge style={{ backgroundColor: branding.accentColor }} className="text-white">
                    {offer.discountBadge}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
              
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: offer.color }}>
                    ${pricing.total}
                  </span>
                  <span className="text-gray-400 line-through">${pricing.basePrice}</span>
                </div>
                {offer.type === 'recurring' && (
                  <p className="text-xs text-gray-500">per visit</p>
                )}
              </div>
              
              <ul className="space-y-2 mb-6">
                {offer.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span style={{ color: branding.accentColor }}><Icon name="check" size="sm" className="mt-0.5" /></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handleSelect(offer)}
                className="w-full text-white"
                style={{ 
                  backgroundColor: offer.color,
                  borderRadius: branding.borderRadius,
                }}
              >
                Get Started — ${pricing.deposit} deposit
              </Button>
              
              <button className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700">
                What's included?
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Home Size
        </button>
      </div>
    </div>
  );
}

// Step 4: Checkout/Payment
function CheckoutStep({
  state,
  setState,
  config,
  onNext,
  onBack,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingWidgetConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const { branding, promotion } = config;
  const [processing, setProcessing] = React.useState(false);
  
  const pricing = state.sqftOption && state.serviceOffer 
    ? calculatePrice(state.sqftOption, state.serviceOffer, config)
    : { basePrice: 0, discount: 0, total: 0, deposit: 0, balance: 0 };
  
  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    setState(prev => ({ ...prev, paymentComplete: true }));
    setProcessing(false);
    onNext();
  };
  
  return (
    <div className="px-4 py-6">
      {promotion.enabled && (
        <div 
          className="p-4 rounded-xl mb-6 text-center"
          style={{ backgroundColor: `${branding.accentColor}10` }}
        >
          <span className="text-lg">🎉</span>
          <p className="font-medium" style={{ color: branding.accentColor }}>
            New Year Special Applied!
          </p>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: branding.textColor }}>
          Your New Year Discount is Applied!
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Pay only 25% today to reserve your spot
        </p>
        <TrustBadge config={config} />
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        {/* Booking Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{state.serviceOffer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Home Size</span>
                <span className="font-medium">{state.sqftOption?.label} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="font-medium">{state.cityState}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-gray-500">Original Price</span>
                <span className="text-gray-400 line-through">${pricing.basePrice}</span>
              </div>
              <div className="flex justify-between" style={{ color: branding.accentColor }}>
                <span>🎉 New Year Special</span>
                <span>-${pricing.discount}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span style={{ color: branding.primaryColor }}>${pricing.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Breakdown */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="creditCard" size="sm" />
              Payment Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between font-medium" style={{ color: branding.primaryColor }}>
                <span>Today (25% deposit)</span>
                <span>${pricing.deposit}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>After service</span>
                <span>${pricing.balance}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Form */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Payment Method</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Card Number</Label>
                <Input 
                  placeholder="1234 5678 9012 3456" 
                  className="mt-1"
                  style={{ borderRadius: branding.borderRadius }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Expiry</Label>
                  <Input 
                    placeholder="MM/YY" 
                    className="mt-1"
                    style={{ borderRadius: branding.borderRadius }}
                  />
                </div>
                <div>
                  <Label className="text-sm">CVC</Label>
                  <Input 
                    placeholder="123" 
                    className="mt-1"
                    style={{ borderRadius: branding.borderRadius }}
                  />
                </div>
              </div>
            </div>
            
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="w-full mt-4 text-white"
              style={{ 
                backgroundColor: branding.primaryColor,
                borderRadius: branding.borderRadius,
              }}
            >
              {processing ? (
                <>
                  <Icon name="spinner" size="sm" className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon name="lock" size="sm" className="mr-2" />
                  Pay ${pricing.deposit} Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Icon name="lock" size="xs" />
            <span>Secure</span>
          </div>
          <span>•</span>
          <span>48-Hr Guarantee</span>
          <span>•</span>
          <span>No Contracts</span>
          <span>•</span>
          <span>Insured</span>
        </div>
        
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Service Selection
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 5: Address & Scheduling
function DetailsStep({
  state,
  setState,
  config,
  onNext,
  onBack,
}: {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  config: BookingWidgetConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const { branding, timeSlots } = config;
  const enabledTimeSlots = timeSlots.filter(ts => ts.enabled);
  
  const handleSubmit = () => {
    if (!state.address1 || !state.city || !state.preferredDate || !state.preferredTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    setState(prev => ({ ...prev, bookingId: `BK${Date.now().toString(36).toUpperCase()}` }));
    onNext();
  };
  
  return (
    <div className="px-4 py-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: branding.textColor }}>
          Almost Done! Let's Schedule Your Clean
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          We have your payment. Now let's get your home details.
        </p>
      </div>
      
      <div className="max-w-md mx-auto space-y-6">
        {/* Service Address */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Service Address</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Address Line 1 *</Label>
                <Input
                  value={state.address1}
                  onChange={(e) => setState(prev => ({ ...prev, address1: e.target.value }))}
                  placeholder="123 Main Street"
                  className="mt-1"
                  style={{ borderRadius: branding.borderRadius }}
                />
              </div>
              <div>
                <Label className="text-sm">Address Line 2</Label>
                <Input
                  value={state.address2}
                  onChange={(e) => setState(prev => ({ ...prev, address2: e.target.value }))}
                  placeholder="Apt, Suite, Unit"
                  className="mt-1"
                  style={{ borderRadius: branding.borderRadius }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">City *</Label>
                  <Input
                    value={state.city}
                    onChange={(e) => setState(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Dallas"
                    className="mt-1"
                    style={{ borderRadius: branding.borderRadius }}
                  />
                </div>
                <div>
                  <Label className="text-sm">State *</Label>
                  <Input
                    value={state.state}
                    onChange={(e) => setState(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="TX"
                    className="mt-1"
                    style={{ borderRadius: branding.borderRadius }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Scheduling */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="calendar" size="sm" />
              Preferred Scheduling
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Preferred Date *</Label>
                <Input
                  type="date"
                  value={state.preferredDate}
                  onChange={(e) => setState(prev => ({ ...prev, preferredDate: e.target.value }))}
                  className="mt-1"
                  style={{ borderRadius: branding.borderRadius }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label className="text-sm">Preferred Time Block *</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {enabledTimeSlots.map((slot) => (
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
                        borderRadius: branding.borderRadius,
                        borderColor: state.preferredTime === slot.id ? branding.primaryColor : undefined,
                        backgroundColor: state.preferredTime === slot.id ? `${branding.primaryColor}10` : undefined,
                      }}
                    >
                      <p className="font-medium text-sm">{slot.label}</p>
                      <p className="text-xs text-gray-500">{slot.startTime}-{slot.endTime}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Notes */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Additional Notes</h3>
            <Textarea
              value={state.notes}
              onChange={(e) => setState(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Gate code, pets, parking instructions, or any special requests..."
              rows={3}
              style={{ borderRadius: branding.borderRadius }}
            />
          </CardContent>
        </Card>
        
        <Button
          onClick={handleSubmit}
          className="w-full text-white"
          style={{ 
            backgroundColor: branding.primaryColor,
            borderRadius: branding.borderRadius,
          }}
        >
          Complete Booking
        </Button>
      </div>
    </div>
  );
}

// Step 6: Confirmation
function ConfirmationStep({
  state,
  config,
}: {
  state: BookingState;
  config: BookingWidgetConfig;
}) {
  const { branding, confirmation, header } = config;
  
  const pricing = state.sqftOption && state.serviceOffer 
    ? calculatePrice(state.sqftOption, state.serviceOffer, config)
    : { basePrice: 0, discount: 0, total: 0, deposit: 0, balance: 0 };
  
  const selectedTimeSlot = config.timeSlots.find(ts => ts.id === state.preferredTime);
  const referralCode = `REF${state.bookingId.slice(-4)}`;
  
  return (
    <div className="px-4 py-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: branding.accentColor }}
      >
        <Icon name="check" size="2xl" className="text-white" />
      </motion.div>
      
      <h1 className="text-2xl font-bold mb-2" style={{ color: branding.textColor }}>
        🎉 {confirmation.headline}
      </h1>
      <p className="text-gray-500 mb-2">{confirmation.subheadline}</p>
      <p className="text-sm text-gray-500">
        Confirmation sent to {state.email}
      </p>
      
      {confirmation.showBookingDetails && (
        <Card className="max-w-md mx-auto mt-6 text-left">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-mono font-medium">{state.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{state.serviceOffer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Date</span>
                <span className="font-medium">
                  {state.preferredDate ? new Date(state.preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time Window</span>
                <span className="font-medium">
                  {selectedTimeSlot ? `${selectedTimeSlot.label} (${selectedTimeSlot.startTime}-${selectedTimeSlot.endTime})` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="font-medium text-right">
                  {state.address1}, {state.city}, {state.state}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-gray-500">Total Cost</span>
                <span className="font-medium">${pricing.total}</span>
              </div>
              <div className="flex justify-between" style={{ color: branding.accentColor }}>
                <span>✓ Deposit Paid Today</span>
                <span className="font-medium">${pricing.deposit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Balance Due After Service</span>
                <span className="font-medium">${pricing.balance}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {confirmation.showAddToCalendar && (
        <Button
          variant="outline"
          className="mt-4"
          style={{ borderRadius: branding.borderRadius }}
        >
          <Icon name="calendar" size="sm" className="mr-2" />
          Add to Calendar
        </Button>
      )}
      
      {confirmation.showNextSteps && confirmation.nextSteps.length > 0 && (
        <div className="max-w-md mx-auto mt-6 text-left">
          <h3 className="font-semibold mb-3">What happens next?</h3>
          <ul className="space-y-2">
            {confirmation.nextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span style={{ color: branding.accentColor }}><Icon name="check" size="sm" className="mt-0.5" /></span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {confirmation.showReferralCode && (
        <div 
          className="max-w-md mx-auto mt-6 p-4 rounded-xl border"
          style={{ backgroundColor: `${branding.accentColor}10`, borderColor: `${branding.accentColor}30` }}
        >
          <p className="font-semibold flex items-center justify-center gap-2">
            <span>🌟</span>
            Earn ${confirmation.referralReward} for Every Friend
          </p>
          <p className="text-sm text-gray-500 mt-1">Share your code:</p>
          <p className="font-mono font-bold text-lg" style={{ color: branding.primaryColor }}>
            {referralCode}
          </p>
        </div>
      )}
      
      {confirmation.showContactInfo && (
        <div className="mt-6 text-sm text-gray-500">
          Need help? Call{' '}
          <a href={`tel:${header.phoneNumber}`} style={{ color: branding.primaryColor }}>
            {header.phoneNumber}
          </a>
        </div>
      )}
      
      <Button
        variant="outline"
        className="mt-6"
        style={{ borderRadius: branding.borderRadius }}
      >
        Return Home
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN WIDGET COMPONENT
// ============================================================================

export function PublicBookingWidget({ config, preview = false }: PublicBookingWidgetProps) {
  const [state, setState] = React.useState<BookingState>({
    step: 1,
    zip: '',
    zipValid: false,
    cityState: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    sqftOption: null,
    serviceOffer: null,
    address1: '',
    address2: '',
    city: '',
    state: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    paymentComplete: false,
    bookingId: '',
  });
  
  const totalSteps = 6;
  
  const goToStep = (step: number) => {
    setState(prev => ({ ...prev, step }));
  };
  
  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: config.branding.backgroundColor,
        fontFamily: config.branding.fontFamily,
      }}
    >
      <WidgetHeader config={config} />
      <ProgressBar step={state.step} totalSteps={totalSteps} config={config} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {state.step === 1 && (
            <>
              <TrustBadge config={config} />
              <PromotionBanner config={config} />
              <ZipStep
                state={state}
                setState={setState}
                config={config}
                onNext={() => goToStep(2)}
              />
              <ShowcaseCarousel config={config} />
              <ReviewsSection config={config} />
            </>
          )}
          
          {state.step === 2 && (
            <>
              <SqftStep
                state={state}
                setState={setState}
                config={config}
                onNext={() => goToStep(3)}
                onBack={() => goToStep(1)}
              />
              <ShowcaseCarousel config={config} />
              <ReviewsSection config={config} />
              <TrustBadge config={config} />
            </>
          )}
          
          {state.step === 3 && (
            <OfferStep
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
            <DetailsStep
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
      
      {/* Footer */}
      <div className="py-6 text-center text-xs text-gray-400 border-t">
        By booking, you agree to {config.header.businessName}'s{' '}
        <a href="#" className="underline">Terms</a> &{' '}
        <a href="#" className="underline">Privacy Policy</a>
      </div>
    </div>
  );
}

export default PublicBookingWidget;
