"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBooking } from "../BookingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

interface ServiceStepProps {
  onSelect?: (serviceId: string) => void;
  showScheduleAfterSelect?: boolean;
}

export function ServiceStep({ onSelect, showScheduleAfterSelect = false }: ServiceStepProps) {
  const { config, bookingData, updateBookingData, goToNextStep } = useBooking();
  const { theme, branding } = config;
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsServiceId, setDetailsServiceId] = useState<string | null>(null);

  // Get home size for pricing
  const homeSize = config.homeSizes.find(h => h.id === bookingData.homeSizeId);
  const basePrice = homeSize?.basePrice || 0;

  const handleSelect = (serviceId: string) => {
    updateBookingData({ serviceId });
    
    if (onSelect) {
      onSelect(serviceId);
    } else if (!showScheduleAfterSelect) {
      goToNextStep();
    }
  };

  const showServiceDetails = (serviceId: string) => {
    setDetailsServiceId(serviceId);
    setShowDetailsModal(true);
  };

  const enabledServices = config.services.filter(s => s.enabled);
  const selectedService = enabledServices.find(s => s.id === detailsServiceId);

  return (
    <div className="min-h-screen pb-32 md:pb-8" style={{ background: theme.heroGradient }}>
      <div className="container max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Choose Your Service
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Select the service that best fits your needs
          </p>

          {/* Trust Badge */}
          {config.trustBadges.some(b => b.type === 'google_guaranteed' && b.enabled) && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 border-2 rounded-full"
              style={{
                borderColor: theme.successColor,
                backgroundColor: `${theme.successColor}08`
              }}
            >
              <Icon name="shieldCheck" size="sm" style={{ color: theme.successColor }} />
              <span className="text-sm font-medium" style={{ color: theme.successColor }}>
                Verified & Insured
              </span>
            </div>
          )}
        </div>

        {/* Service Cards */}
        <div className={cn(
          "grid gap-4 md:gap-6",
          enabledServices.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        )}>
          {enabledServices.map((service) => {
            const isSelected = bookingData.serviceId === service.id;
            const servicePrice = basePrice + (service.basePrice || 0);
            const finalPrice = service.discountPrice !== undefined
              ? basePrice + service.discountPrice
              : servicePrice;
            const hasDiscount = service.discountPrice !== undefined || (service.discountPercent && service.discountPercent > 0);

            return (
              <div key={service.id} className="relative">
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge
                      className="font-bold shadow-lg px-4 py-1.5"
                      style={{ backgroundColor: theme.successColor }}
                    >
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer h-full",
                    isSelected
                      ? "ring-2"
                      : "hover:border-opacity-60"
                  )}
                  style={{
                    borderColor: service.popular ? `${theme.successColor}50` : `${theme.primaryColor}30`,
                    borderWidth: '2px',
                    // @ts-expect-error - CSS custom property for ring color
                    '--tw-ring-color': isSelected ? (service.popular ? theme.successColor : theme.primaryColor) : undefined,
                  }}
                  onClick={() => handleSelect(service.id)}
                >
                  {/* Promo Badge */}
                  {service.badge && (
                    <div className="absolute top-3 left-3">
                      <Badge
                        className="font-bold"
                        style={{
                          backgroundColor: service.badgeColor === 'amber' ? '#f59e0b' :
                            service.badgeColor === 'success' ? theme.successColor :
                            theme.primaryColor,
                          color: service.badgeColor === 'amber' ? 'black' : 'white'
                        }}
                      >
                        <Icon name="gift" size="xs" className="mr-1" />
                        {service.badge}
                      </Badge>
                    </div>
                  )}

                  <CardContent className={cn("pt-6 pb-6 px-5 space-y-5", service.badge && "pt-14")}>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-gray-500">{service.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        {hasDiscount && (
                          <span className="text-lg text-gray-400 line-through">
                            ${servicePrice}
                          </span>
                        )}
                        <span
                          className="text-3xl font-black"
                          style={{ color: service.popular ? theme.successColor : theme.primaryColor }}
                        >
                          ${finalPrice}
                        </span>
                      </div>
                      {config.depositPercent > 0 && (
                        <p className="text-sm text-gray-500">
                          Pay only ${Math.round(finalPrice * (config.depositPercent / 100))} today ({config.depositPercent}% deposit)
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5">
                      {service.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: service.popular
                                ? `${theme.successColor}15`
                                : `${theme.primaryColor}15`
                            }}
                          >
                            <Icon
                              name="check"
                              size="xs"
                              style={{ color: service.popular ? theme.successColor : theme.primaryColor }}
                            />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Actions */}
                    <div className="space-y-2 pt-2">
                      <Button
                        size="lg"
                        className="w-full font-semibold rounded-xl ring-2 ring-white/30"
                        style={{
                          backgroundColor: service.popular ? theme.successColor : theme.primaryColor,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(service.id);
                        }}
                      >
                        Get Started — ${Math.round(finalPrice * (config.depositPercent / 100))} Today
                        <Icon name="chevronRight" size="sm" className="ml-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          showServiceDetails(service.id);
                        }}
                      >
                        What is Included?
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Back button */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => window.history.back()} className="text-gray-500">
            <Icon name="arrowLeft" size="sm" className="mr-2" />
            Back to Home Size
          </Button>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedService?.name} — What's Included
            </DialogTitle>
            <DialogDescription>
              {selectedService?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-3">
              {selectedService?.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Icon
                    name="check"
                    size="sm"
                    style={{ color: selectedService.popular ? theme.successColor : theme.primaryColor }}
                  />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <Button
              className="w-full rounded-xl"
              style={{ backgroundColor: selectedService?.popular ? theme.successColor : theme.primaryColor }}
              onClick={() => {
                setShowDetailsModal(false);
                if (selectedService) handleSelect(selectedService.id);
              }}
            >
              Select {selectedService?.name}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
