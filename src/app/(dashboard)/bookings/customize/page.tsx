'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Layout from '@/components/layout/Layout';
import { Icon, IconName } from '@/components/ui/icon';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PublicBookingWidget } from '@/components/booking/public-booking-widget';
import {
  BookingWidgetConfig,
  SqftOption,
  ServiceOffer,
  TrustBadge,
  TimeSlot,
  FormField,
  getDefaultConfig,
  DEFAULT_SQFT_OPTIONS,
  DEFAULT_SERVICE_OFFERS,
  DEFAULT_TRUST_BADGES,
  DEFAULT_TIME_SLOTS,
  DEFAULT_LEAD_FIELDS,
  DEFAULT_REVIEWS,
  DEFAULT_CONFIRMATION,
} from '@/lib/booking/types';

// ============================================================================
// CUSTOMIZATION SECTIONS
// ============================================================================

// Header Customization
function HeaderSection({
  config,
  updateConfig,
}: {
  config: BookingWidgetConfig;
  updateConfig: (updates: Partial<BookingWidgetConfig>) => void;
}) {
  const { header } = config;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="layout" size="lg" />
          Header Configuration
        </CardTitle>
        <CardDescription>Configure the top navigation bar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Business Name</Label>
            <Input
              value={header.businessName}
              onChange={(e) => updateConfig({ header: { ...header, businessName: e.target.value } })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input
              value={header.logoUrl}
              onChange={(e) => updateConfig({ header: { ...header, logoUrl: e.target.value } })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <Label>Show Phone Number</Label>
            <p className="text-xs text-muted-foreground">Display click-to-call button</p>
          </div>
          <Switch
            checked={header.showPhone}
            onCheckedChange={(checked) => updateConfig({ header: { ...header, showPhone: checked } })}
          />
        </div>
        
        {header.showPhone && (
          <div>
            <Label>Phone Number</Label>
            <Input
              value={header.phoneNumber}
              onChange={(e) => updateConfig({ header: { ...header, phoneNumber: e.target.value } })}
              placeholder="(555) 123-4567"
              className="mt-1"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <Label>Show Website Link</Label>
            <p className="text-xs text-muted-foreground">Link back to your website</p>
          </div>
          <Switch
            checked={header.showWebsiteLink}
            onCheckedChange={(checked) => updateConfig({ header: { ...header, showWebsiteLink: checked } })}
          />
        </div>
        
        {header.showWebsiteLink && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Website URL</Label>
              <Input
                value={header.websiteUrl}
                onChange={(e) => updateConfig({ header: { ...header, websiteUrl: e.target.value } })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Button Label</Label>
              <Input
                value={header.websiteLabel}
                onChange={(e) => updateConfig({ header: { ...header, websiteLabel: e.target.value } })}
                placeholder="Visit Website"
                className="mt-1"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Branding Customization
function BrandingSection({
  config,
  updateConfig,
}: {
  config: BookingWidgetConfig;
  updateConfig: (updates: Partial<BookingWidgetConfig>) => void;
}) {
  const { branding } = config;
  
  const colorFields = [
    { key: 'primaryColor', label: 'Primary Color', description: 'Main buttons, headers' },
    { key: 'secondaryColor', label: 'Secondary Color', description: 'Gradients, accents' },
    { key: 'accentColor', label: 'Accent Color', description: 'Success states, highlights' },
    { key: 'backgroundColor', label: 'Background', description: 'Page background' },
    { key: 'cardBackground', label: 'Card Background', description: 'Card surfaces' },
    { key: 'textColor', label: 'Text Color', description: 'Main text' },
  ] as const;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="palette" size="lg" />
          Brand Colors
        </CardTitle>
        <CardDescription>Customize your color scheme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {colorFields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label className="flex items-center justify-between">
                <span>{field.label}</span>
                <div 
                  className="w-6 h-6 rounded-md border shadow-sm"
                  style={{ backgroundColor: branding[field.key] }}
                />
              </Label>
              <Input
                type="color"
                value={branding[field.key]}
                onChange={(e) => updateConfig({ branding: { ...branding, [field.key]: e.target.value } })}
                className="h-10 cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div>
          <Label>Border Radius: {branding.borderRadius}px</Label>
          <Slider
            value={[branding.borderRadius]}
            onValueChange={([v]) => updateConfig({ branding: { ...branding, borderRadius: v } })}
            min={0}
            max={24}
            step={2}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Square</span>
            <span>Rounded</span>
          </div>
        </div>
        
        <div>
          <Label>Button Style</Label>
          <Select
            value={branding.buttonStyle}
            onValueChange={(v) => updateConfig({ branding: { ...branding, buttonStyle: v as any } })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

// Promotion Customization
function PromotionSection({
  config,
  updateConfig,
}: {
  config: BookingWidgetConfig;
  updateConfig: (updates: Partial<BookingWidgetConfig>) => void;
}) {
  const { promotion } = config;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="tag" size="lg" />
          Promotional Banner
        </CardTitle>
        <CardDescription>Configure your special offer display</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <Label>Enable Promotion</Label>
            <p className="text-xs text-muted-foreground">Show promotional banner</p>
          </div>
          <Switch
            checked={promotion.enabled}
            onCheckedChange={(checked) => updateConfig({ promotion: { ...promotion, enabled: checked } })}
          />
        </div>
        
        {promotion.enabled && (
          <>
            <div>
              <Label>Headline</Label>
              <Input
                value={promotion.headline}
                onChange={(e) => updateConfig({ promotion: { ...promotion, headline: e.target.value } })}
                placeholder="New Year Special: $50 Off..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Subheadline</Label>
              <Input
                value={promotion.subheadline}
                onChange={(e) => updateConfig({ promotion: { ...promotion, subheadline: e.target.value } })}
                placeholder="+ 15% Off Recurring Service"
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>One-Time Discount ($)</Label>
                <Input
                  type="number"
                  value={promotion.discountAmount}
                  onChange={(e) => updateConfig({ promotion: { ...promotion, discountAmount: Number(e.target.value) } })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Recurring Discount (%)</Label>
                <Input
                  type="number"
                  value={promotion.recurringDiscount}
                  onChange={(e) => updateConfig({ promotion: { ...promotion, recurringDiscount: Number(e.target.value) } })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={promotion.expiryDate.split('T')[0]}
                onChange={(e) => updateConfig({ promotion: { ...promotion, expiryDate: new Date(e.target.value).toISOString() } })}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label>Show Countdown</Label>
                <p className="text-xs text-muted-foreground">Display urgency timer</p>
              </div>
              <Switch
                checked={promotion.showCountdown}
                onCheckedChange={(checked) => updateConfig({ promotion: { ...promotion, showCountdown: checked } })}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Trust Badges Customization
function TrustBadgesSection({
  config,
  updateConfig,
}: {
  config: BookingWidgetConfig;
  updateConfig: (updates: Partial<BookingWidgetConfig>) => void;
}) {
  const { trustBadges } = config;
  
  const updateBadge = (id: string, updates: Partial<TrustBadge>) => {
    updateConfig({
      trustBadges: trustBadges.map(badge =>
        badge.id === id ? { ...badge, ...updates } : badge
      ),
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="shield" size="lg" />
          Trust Badges
        </CardTitle>
        <CardDescription>Build credibility with trust signals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {trustBadges.map((badge) => (
          <div key={badge.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: badge.color }}
                >
                  <Icon name={badge.icon as IconName} size="sm" className="text-white" />
                </div>
                <div>
                  <p className="font-medium">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.sublabel}</p>
                </div>
              </div>
              <Switch
                checked={badge.enabled}
                onCheckedChange={(checked) => updateBadge(badge.id, { enabled: checked })}
              />
            </div>
            
            {badge.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={badge.label}
                    onChange={(e) => updateBadge(badge.id, { label: e.target.value })}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={badge.color}
                    onChange={(e) => updateBadge(badge.id, { color: e.target.value })}
                    className="mt-1 h-8"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Square Footage Options
function SqftOptionsSection({
  config,
  updateConfig,
}: {
  config: BookingWidgetConfig;
  updateConfig: (updates: Partial<BookingWidgetConfig>) => void;
}) {
  const { sqftOptions } = config;
  
  const updateOption = (id: string, updates: Partial<SqftOption>) => {
    updateConfig({
      sqftOptions: sqftOptions.map(opt =>
        opt.id === id ? { ...opt, ...updates } : opt
      ),
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="home" size="lg" />
          Home Size Options
        </CardTitle>
        <CardDescription>Configure square footage tiers and base pricing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sqftOptions.map((option) => (
          <div 
            key={option.id} 
            className={cn(
              "p-3 border rounded-lg",
              !option.enabled && "opacity-50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Switch
                  checked={option.enabled}
                  onCheckedChange={(checked) => updateOption(option.id, { enabled: checked })}
                />
                <span className="font-medium">{option.label} sq ft</span>
              </div>
              {option.requiresCall ? (
                <Badge variant="secondary">Call Required</Badge>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={option.basePrice}
                    onChange={(e) => updateOption(option.id, { basePrice: Number(e.target.value) })}
                    className="w-20 h-8"
                    disabled={!option.enabled}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Service Offers Customization
function ServiceOffersSection({
  config,
  updateConfig,
}: {
  config: BookingWidgetConfig;
  updateConfig: (updates: Partial<BookingWidgetConfig>) => void;
}) {
  const { serviceOffers } = config;
  
  const updateOffer = (id: string, updates: Partial<ServiceOffer>) => {
    updateConfig({
      serviceOffers: serviceOffers.map(offer =>
        offer.id === id ? { ...offer, ...updates } : offer
      ),
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="sparkles" size="lg" />
          Service Offers
        </CardTitle>
        <CardDescription>Configure your service packages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {serviceOffers.map((offer) => (
          <div 
            key={offer.id}
            className={cn(
              "p-4 border rounded-lg space-y-4",
              !offer.enabled && "opacity-50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={offer.enabled}
                  onCheckedChange={(checked) => updateOffer(offer.id, { enabled: checked })}
                />
                <Input
                  value={offer.name}
                  onChange={(e) => updateOffer(offer.id, { name: e.target.value })}
                  className="w-40 font-medium"
                  disabled={!offer.enabled}
                />
                {offer.popular && (
                  <Badge style={{ backgroundColor: offer.color }} className="text-white">
                    Popular
                  </Badge>
                )}
              </div>
              <Input
                type="color"
                value={offer.color}
                onChange={(e) => updateOffer(offer.id, { color: e.target.value })}
                className="w-12 h-8"
                disabled={!offer.enabled}
              />
            </div>
            
            {offer.enabled && (
              <>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={offer.description}
                    onChange={(e) => updateOffer(offer.id, { description: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Base Price ($)</Label>
                    <Input
                      type="number"
                      value={offer.basePrice}
                      onChange={(e) => updateOffer(offer.id, { basePrice: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Discounted ($)</Label>
                    <Input
                      type="number"
                      value={offer.discountedPrice}
                      onChange={(e) => updateOffer(offer.id, { discountedPrice: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Deposit %</Label>
                    <Input
                      type="number"
                      value={offer.depositPercent}
                      onChange={(e) => updateOffer(offer.id, { depositPercent: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs">Discount Badge</Label>
                  <Input
                    value={offer.discountBadge}
                    onChange={(e) => updateOffer(offer.id, { discountBadge: e.target.value })}
                    placeholder="$50 Off"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Features (one per line)</Label>
                  <Textarea
                    value={offer.features.join('\n')}
                    onChange={(e) => updateOffer(offer.id, { features: e.target.value.split('\n').filter(Boolean) })}
                    rows={4}
                    className="mt-1 text-sm"
                  />
                </div>
                
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <Label className="text-xs">Mark as Popular</Label>
                  <Switch
                    checked={offer.popular}
                    onCheckedChange={(checked) => updateOffer(offer.id, { popular: checked })}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Time Slots Customization
function TimeSlotsSection({
  config,
  updateConfig,
}: {
  config: BookingWidgetConfig;
  updateConfig: (updates: Partial<BookingWidgetConfig>) => void;
}) {
  const { timeSlots } = config;
  
  const updateSlot = (id: string, updates: Partial<TimeSlot>) => {
    updateConfig({
      timeSlots: timeSlots.map(slot =>
        slot.id === id ? { ...slot, ...updates } : slot
      ),
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="clock" size="lg" />
          Time Slots
        </CardTitle>
        <CardDescription>Configure available scheduling windows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {timeSlots.map((slot) => (
          <div 
            key={slot.id}
            className={cn(
              "p-3 border rounded-lg flex items-center gap-4",
              !slot.enabled && "opacity-50"
            )}
          >
            <Switch
              checked={slot.enabled}
              onCheckedChange={(checked) => updateSlot(slot.id, { enabled: checked })}
            />
            <Input
              value={slot.label}
              onChange={(e) => updateSlot(slot.id, { label: e.target.value })}
              className="w-32"
              disabled={!slot.enabled}
            />
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(slot.id, { startTime: e.target.value })}
                className="w-28"
                disabled={!slot.enabled}
              />
              <span>to</span>
              <Input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(slot.id, { endTime: e.target.value })}
                className="w-28"
                disabled={!slot.enabled}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Reviews Customization
function ReviewsSection({
  config,
  updateConfig,
}: {
  config: BookingWidgetConfig;
  updateConfig: (updates: Partial<BookingWidgetConfig>) => void;
}) {
  const { reviews } = config;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="star" size="lg" />
          Reviews Section
        </CardTitle>
        <CardDescription>Configure customer testimonials</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <Label>Show Reviews</Label>
            <p className="text-xs text-muted-foreground">Display customer testimonials</p>
          </div>
          <Switch
            checked={reviews.enabled}
            onCheckedChange={(checked) => updateConfig({ reviews: { ...reviews, enabled: checked } })}
          />
        </div>
        
        {reviews.enabled && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Section Headline</Label>
                <Input
                  value={reviews.headline}
                  onChange={(e) => updateConfig({ reviews: { ...reviews, headline: e.target.value } })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Average Rating</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={reviews.averageRating}
                  onChange={(e) => updateConfig({ reviews: { ...reviews, averageRating: Number(e.target.value) } })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Total Reviews Count</Label>
              <Input
                type="number"
                value={reviews.totalReviews}
                onChange={(e) => updateConfig({ reviews: { ...reviews, totalReviews: Number(e.target.value) } })}
                className="mt-1"
              />
            </div>
            
            <Separator />
            
            <div>
              <Label className="mb-2 block">Individual Reviews</Label>
              {reviews.reviews.map((review, idx) => (
                <div key={review.id} className="p-3 border rounded-lg mb-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={review.author}
                      onChange={(e) => {
                        const newReviews = [...reviews.reviews];
                        newReviews[idx] = { ...newReviews[idx], author: e.target.value };
                        updateConfig({ reviews: { ...reviews, reviews: newReviews } });
                      }}
                      placeholder="Author name"
                    />
                    <Select
                      value={String(review.rating)}
                      onValueChange={(v) => {
                        const newReviews = [...reviews.reviews];
                        newReviews[idx] = { ...newReviews[idx], rating: Number(v) };
                        updateConfig({ reviews: { ...reviews, reviews: newReviews } });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map(r => (
                          <SelectItem key={r} value={String(r)}>{r} stars</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    value={review.text}
                    onChange={(e) => {
                      const newReviews = [...reviews.reviews];
                      newReviews[idx] = { ...newReviews[idx], text: e.target.value };
                      updateConfig({ reviews: { ...reviews, reviews: newReviews } });
                    }}
                    rows={2}
                    placeholder="Review text..."
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Confirmation Page Customization
function ConfirmationSection({
  config,
  updateConfig,
}: {
  config: BookingWidgetConfig;
  updateConfig: (updates: Partial<BookingWidgetConfig>) => void;
}) {
  const { confirmation } = config;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="checkCircle" size="lg" />
          Confirmation Page
        </CardTitle>
        <CardDescription>Customize the success page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Success Headline</Label>
          <Input
            value={confirmation.headline}
            onChange={(e) => updateConfig({ confirmation: { ...confirmation, headline: e.target.value } })}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Subheadline</Label>
          <Input
            value={confirmation.subheadline}
            onChange={(e) => updateConfig({ confirmation: { ...confirmation, subheadline: e.target.value } })}
            className="mt-1"
          />
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          {[
            { key: 'showBookingDetails', label: 'Show Booking Details', desc: 'Display summary card' },
            { key: 'showAddToCalendar', label: 'Show Add to Calendar', desc: 'Calendar button' },
            { key: 'showNextSteps', label: 'Show Next Steps', desc: 'What happens next' },
            { key: 'showReferralCode', label: 'Show Referral Code', desc: 'Enable referral program' },
            { key: 'showContactInfo', label: 'Show Contact Info', desc: 'Support contact' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <Label className="text-sm">{item.label}</Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={confirmation[item.key as keyof typeof confirmation] as boolean}
                onCheckedChange={(checked) => updateConfig({ confirmation: { ...confirmation, [item.key]: checked } })}
              />
            </div>
          ))}
        </div>
        
        {confirmation.showReferralCode && (
          <div>
            <Label>Referral Reward Amount ($)</Label>
            <Input
              type="number"
              value={confirmation.referralReward}
              onChange={(e) => updateConfig({ confirmation: { ...confirmation, referralReward: Number(e.target.value) } })}
              className="mt-1"
            />
          </div>
        )}
        
        {confirmation.showNextSteps && (
          <div>
            <Label>Next Steps (one per line)</Label>
            <Textarea
              value={confirmation.nextSteps.join('\n')}
              onChange={(e) => updateConfig({ confirmation: { ...confirmation, nextSteps: e.target.value.split('\n').filter(Boolean) } })}
              rows={4}
              className="mt-1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function BookingCustomizePage() {
  const { business } = useBusiness();
  const businessId = business?.id || '';
  const businessName = business?.name || 'Your Business';
  
  const [loading, setLoading] = React.useState(false);
  const [config, setConfig] = React.useState<BookingWidgetConfig>(() => 
    getDefaultConfig(businessId, businessName)
  );
  const [previewStep, setPreviewStep] = React.useState(1);
  const [showFullPreview, setShowFullPreview] = React.useState(false);
  
  // Update config when business loads
  React.useEffect(() => {
    if (business?.name) {
      setConfig(prev => ({
        ...prev,
        businessId: business.id,
        header: { ...prev.header, businessName: business.name },
        slug: business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }));
    }
  }, [business]);
  
  const updateConfig = (updates: Partial<BookingWidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
  };
  
  const handleSave = async () => {
    if (!businessId) {
      toast.error('No business configured');
      return;
    }
    
    setLoading(true);
    try {
      await fetch(`/api/booking/${businessId}/customization`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'full_config',
          data: config,
        }),
      });
      toast.success('Booking widget saved!');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };
  
  const copyEmbedCode = () => {
    const code = `<script src="https://book.selestial.io/embed.js" data-business="${businessId}"></script>`;
    navigator.clipboard.writeText(code);
    toast.success('Embed code copied!');
  };
  
  const bookingUrl = `https://book.selestial.io/${businessId}/${config.slug}`;
  
  return (
    <Layout title="Booking Widget Builder">
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Booking Widget Builder</h1>
            <p className="text-muted-foreground">
              Full control over every component of your booking experience
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Icon name="externalLink" size="sm" />
                  Full Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[90vh] p-0">
                <ScrollArea className="h-full">
                  <PublicBookingWidget config={config} preview />
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              {loading ? (
                <Icon name="spinner" size="sm" className="animate-spin" />
              ) : (
                <Icon name="save" size="sm" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: Customization Controls */}
          <div className="xl:col-span-3 space-y-6">
            <Tabs defaultValue="branding" className="space-y-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="branding" className="text-xs">
                  <Icon name="palette" size="sm" className="mr-1" />
                  Brand
                </TabsTrigger>
                <TabsTrigger value="content" className="text-xs">
                  <Icon name="type" size="sm" className="mr-1" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="services" className="text-xs">
                  <Icon name="grid" size="sm" className="mr-1" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs">
                  <Icon name="star" size="sm" className="mr-1" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="finish" className="text-xs">
                  <Icon name="check" size="sm" className="mr-1" />
                  Finish
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="branding" className="space-y-4">
                <HeaderSection config={config} updateConfig={updateConfig} />
                <BrandingSection config={config} updateConfig={updateConfig} />
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                <PromotionSection config={config} updateConfig={updateConfig} />
                <TrustBadgesSection config={config} updateConfig={updateConfig} />
              </TabsContent>
              
              <TabsContent value="services" className="space-y-4">
                <SqftOptionsSection config={config} updateConfig={updateConfig} />
                <ServiceOffersSection config={config} updateConfig={updateConfig} />
                <TimeSlotsSection config={config} updateConfig={updateConfig} />
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                <ReviewsSection config={config} updateConfig={updateConfig} />
              </TabsContent>
              
              <TabsContent value="finish" className="space-y-4">
                <ConfirmationSection config={config} updateConfig={updateConfig} />
                
                {/* Embed & Share */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="code" size="lg" />
                      Embed & Share
                    </CardTitle>
                    <CardDescription>Get your booking widget live</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Direct Booking Link</Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={bookingUrl} readOnly />
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            navigator.clipboard.writeText(bookingUrl);
                            toast.success('Link copied!');
                          }}
                        >
                          <Icon name="copy" size="sm" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Embed Code</Label>
                      <code className="block p-3 bg-muted rounded-lg text-xs mt-1 overflow-x-auto">
                        {`<script src="https://book.selestial.io/embed.js" data-business="${businessId}"></script>`}
                      </code>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 gap-2"
                        onClick={copyEmbedCode}
                      >
                        <Icon name="copy" size="sm" />
                        Copy Embed Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right: Live Preview */}
          <div className="xl:col-span-2">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="eye" size="sm" />
                  Live Preview
                </h3>
                <Select value={String(previewStep)} onValueChange={(v) => setPreviewStep(Number(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Step 1: ZIP</SelectItem>
                    <SelectItem value="2">Step 2: Size</SelectItem>
                    <SelectItem value="3">Step 3: Offer</SelectItem>
                    <SelectItem value="4">Step 4: Pay</SelectItem>
                    <SelectItem value="5">Step 5: Details</SelectItem>
                    <SelectItem value="6">Step 6: Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-xl border bg-gray-100 p-4 overflow-hidden">
                <div 
                  className="rounded-xl overflow-hidden shadow-2xl transform scale-[0.85] origin-top"
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                >
                  <ScrollArea className="h-[700px]">
                    <PublicBookingWidget config={config} preview />
                  </ScrollArea>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                Preview is scaled to fit. Click "Full Preview" for actual size.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
