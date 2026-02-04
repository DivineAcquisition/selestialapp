"use client";

import { useState } from "react";
import { BookingWidget } from "@/components/embed/booking";
import { BookingWidgetConfig } from "@/components/embed/booking/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";

// Sample configurations for demo
const SAMPLE_CONFIGS: Record<string, Partial<BookingWidgetConfig>> = {
  cleaning: {
    branding: {
      businessName: "Novara Cleaning",
      logoUrl: undefined,
      phone: "(555) 123-4567",
      email: "hello@novaracleaning.com",
      website: "https://novaracleaning.com",
      showRating: true,
      ratingValue: 4.9,
      reviewCount: 250,
    },
    theme: {
      primaryColor: "#6366f1",
      primaryHoverColor: "#4f46e5",
      accentColor: "#a78bfa",
      successColor: "#10b981",
      warningColor: "#f59e0b",
      heroGradient: "linear-gradient(180deg, #ffffff, #f5f3ff)",
      primaryGradient: "linear-gradient(135deg, #6366f1, #a78bfa)",
      headingFont: '"Plus Jakarta Sans", system-ui, sans-serif',
      bodyFont: '"Inter", system-ui, sans-serif',
      borderRadius: "xl",
      cardShadow: "0 2px 12px rgba(99, 102, 241, 0.08)",
      buttonShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
    },
    promo: {
      enabled: true,
      headline: "New Year Special: Book Today For Only $39",
      subheadline: "Limited time offer",
      badgeText: "50% OFF",
    },
    services: [
      {
        id: "deep",
        name: "Deep Clean",
        description: "Thorough top-to-bottom cleaning",
        features: ["40-point cleaning checklist", "Inside oven & fridge", "Baseboards & door frames", "Interior windows", "2-person team"],
        basePrice: 75,
        badge: "$50 Off Today",
        badgeColor: "amber",
        enabled: true,
      },
      {
        id: "recurring",
        name: "Membership",
        description: "Keep your home guest-ready",
        features: ["Bi-weekly or monthly", "Same trusted team", "Priority scheduling", "Cancel anytime", "48-hr guarantee"],
        basePrice: 0,
        popular: true,
        enabled: true,
      },
    ],
    depositPercent: 25,
    fullPaymentDiscount: 10,
    captureContactFirst: true,
    waitlistEnabled: true,
  },
  landscaping: {
    branding: {
      businessName: "Green Thumb Landscaping",
      logoUrl: undefined,
      phone: "(555) 987-6543",
      email: "info@greenthumb.com",
      website: "https://greenthumb.com",
      showRating: true,
      ratingValue: 4.8,
      reviewCount: 180,
    },
    theme: {
      primaryColor: "#059669",
      primaryHoverColor: "#047857",
      accentColor: "#34d399",
      successColor: "#22c55e",
      warningColor: "#eab308",
      heroGradient: "linear-gradient(180deg, #ffffff, #ecfdf5)",
      primaryGradient: "linear-gradient(135deg, #059669, #34d399)",
      headingFont: '"Plus Jakarta Sans", system-ui, sans-serif',
      bodyFont: '"Inter", system-ui, sans-serif',
      borderRadius: "xl",
      cardShadow: "0 2px 12px rgba(5, 150, 105, 0.08)",
      buttonShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
    },
    promo: {
      enabled: true,
      headline: "Spring Special: 20% Off First Service",
      badgeText: "LIMITED",
    },
    services: [
      {
        id: "mowing",
        name: "Lawn Mowing",
        description: "Weekly lawn maintenance",
        features: ["Mowing & edging", "Blowing debris", "Trimming walkways"],
        basePrice: 0,
        enabled: true,
      },
      {
        id: "full",
        name: "Full Service",
        description: "Complete yard care",
        features: ["Mowing & edging", "Hedge trimming", "Weeding", "Seasonal cleanup"],
        basePrice: 50,
        popular: true,
        enabled: true,
      },
    ],
    homeSizes: [
      { id: "small", label: "Small Yard", sqftRange: "Under 2,500 sq ft", bedroomRange: "", basePrice: 45, estimatedHours: 1 },
      { id: "medium", label: "Medium Yard", sqftRange: "2,500 - 5,000 sq ft", bedroomRange: "", basePrice: 65, estimatedHours: 1.5 },
      { id: "large", label: "Large Yard", sqftRange: "5,000 - 10,000 sq ft", bedroomRange: "", basePrice: 95, estimatedHours: 2 },
      { id: "estate", label: "Estate", sqftRange: "10,000+ sq ft", bedroomRange: "", basePrice: 0, estimatedHours: 0 },
    ],
    depositPercent: 0,
    acceptDeposit: false,
    acceptFullPayment: true,
    fullPaymentDiscount: 0,
    captureContactFirst: true,
  },
  handyman: {
    branding: {
      businessName: "Fix-It Pro",
      logoUrl: undefined,
      phone: "(555) 246-8135",
      email: "help@fixitpro.com",
      website: "https://fixitpro.com",
      showRating: true,
      ratingValue: 4.7,
      reviewCount: 320,
    },
    theme: {
      primaryColor: "#f97316",
      primaryHoverColor: "#ea580c",
      accentColor: "#fdba74",
      successColor: "#22c55e",
      warningColor: "#eab308",
      heroGradient: "linear-gradient(180deg, #ffffff, #fff7ed)",
      primaryGradient: "linear-gradient(135deg, #f97316, #fdba74)",
      headingFont: '"Plus Jakarta Sans", system-ui, sans-serif',
      bodyFont: '"Inter", system-ui, sans-serif',
      borderRadius: "lg",
      cardShadow: "0 2px 12px rgba(249, 115, 22, 0.08)",
      buttonShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
    },
    promo: {
      enabled: false,
      headline: "",
    },
    services: [
      {
        id: "hourly",
        name: "Hourly Service",
        description: "Pay by the hour",
        features: ["Flexible scheduling", "Multiple tasks", "No minimum"],
        basePrice: 0,
        enabled: true,
      },
      {
        id: "project",
        name: "Project Quote",
        description: "Fixed price for larger jobs",
        features: ["Free estimate", "Guaranteed price", "Parts included"],
        basePrice: 0,
        popular: true,
        enabled: true,
      },
    ],
    homeSizes: [
      { id: "1hr", label: "1 Hour", sqftRange: "Quick fixes", bedroomRange: "", basePrice: 75, estimatedHours: 1 },
      { id: "2hr", label: "2 Hours", sqftRange: "Small projects", bedroomRange: "", basePrice: 140, estimatedHours: 2 },
      { id: "4hr", label: "Half Day", sqftRange: "Medium projects", bedroomRange: "", basePrice: 260, estimatedHours: 4 },
      { id: "8hr", label: "Full Day", sqftRange: "Large projects", bedroomRange: "", basePrice: 480, estimatedHours: 8 },
    ],
    flowSteps: ["zip", "home-size", "schedule", "checkout"],
    depositPercent: 50,
    fullPaymentDiscount: 5,
  },
};

export default function WidgetPreviewPage() {
  const [selectedConfig, setSelectedConfig] = useState<keyof typeof SAMPLE_CONFIGS>("cleaning");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const currentConfig = SAMPLE_CONFIGS[selectedConfig];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Control Panel */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Icon name="eye" size="lg" />
                Booking Widget Preview
              </h1>
              <p className="text-sm text-gray-500">
                Preview how the booking widget looks with different configurations
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Config Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Template:</span>
                <div className="flex rounded-lg border bg-white overflow-hidden">
                  {Object.keys(SAMPLE_CONFIGS).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedConfig(key as keyof typeof SAMPLE_CONFIGS)}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedConfig === key
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">View:</span>
                <div className="flex rounded-lg border bg-white overflow-hidden">
                  <button
                    onClick={() => setViewMode("desktop")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      viewMode === "desktop"
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon name="monitor" size="sm" />
                  </button>
                  <button
                    onClick={() => setViewMode("mobile")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      viewMode === "mobile"
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon name="smartphone" size="sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div
            className={`bg-white shadow-2xl rounded-xl overflow-hidden transition-all duration-300 ${
              viewMode === "mobile"
                ? "w-[375px] h-[812px]"
                : "w-full max-w-6xl min-h-[800px]"
            }`}
          >
            {/* Device Frame for Mobile */}
            {viewMode === "mobile" && (
              <div className="h-6 bg-black flex items-center justify-center">
                <div className="w-20 h-4 bg-gray-800 rounded-full" />
              </div>
            )}

            {/* Widget Container */}
            <div
              className={`overflow-auto ${
                viewMode === "mobile" ? "h-[calc(100%-24px)]" : "h-full"
              }`}
            >
              <BookingWidget
                config={currentConfig}
                persistKey={`widget-preview-${selectedConfig}`}
                onPaymentSubmit={(data) => {
                  console.log("Payment submitted:", data);
                  alert(`Payment of $${data.amount} (${data.option}) would be processed here`);
                }}
              />
            </div>
          </div>
        </div>

        {/* Config Details */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="ring-1 ring-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="settings" size="lg" />
                Current Configuration
              </CardTitle>
              <CardDescription>
                Customize these settings in your dashboard to create your own widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="branding">
                <TabsList>
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                  <TabsTrigger value="theme">Theme</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Business Name:</span>
                      <p className="font-medium">{currentConfig.branding?.businessName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium">{currentConfig.branding?.phone || "Not set"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{currentConfig.branding?.email || "Not set"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <p className="font-medium">
                        {currentConfig.branding?.ratingValue} ({currentConfig.branding?.reviewCount} reviews)
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="theme" className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: currentConfig.theme?.primaryColor }}
                      />
                      <span className="text-sm">Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: currentConfig.theme?.accentColor }}
                      />
                      <span className="text-sm">Accent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: currentConfig.theme?.successColor }}
                      />
                      <span className="text-sm">Success</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Border Radius:</span>
                    <Badge variant="secondary" className="ml-2">
                      {currentConfig.theme?.borderRadius}
                    </Badge>
                  </div>
                </TabsContent>

                <TabsContent value="services" className="mt-4">
                  <div className="space-y-2">
                    {currentConfig.services?.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {service.popular && (
                            <Badge variant="secondary">Popular</Badge>
                          )}
                          {service.basePrice > 0 && (
                            <Badge>+${service.basePrice}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Deposit:</span>
                      <p className="font-medium">{currentConfig.depositPercent}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Full Payment Discount:</span>
                      <p className="font-medium">{currentConfig.fullPaymentDiscount}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Accept Deposit:</span>
                      <p className="font-medium">{currentConfig.acceptDeposit !== false ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Accept Full Payment:</span>
                      <p className="font-medium">{currentConfig.acceptFullPayment !== false ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
