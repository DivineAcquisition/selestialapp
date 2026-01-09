'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Icon, IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ============================================================================
// PAGE SECTIONS
// ============================================================================

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    icon: 'eye' as IconName,
    content: `The Selestial Booking Widget is a fully customizable online booking system designed for home service businesses. It allows your customers to book appointments 24/7, see real-time pricing, and pay deposits—all without leaving your website.`,
    features: [
      'Embeddable on any website',
      'Mobile-responsive design',
      'Real-time pricing calculations',
      'Secure Stripe payments',
      'Customizable branding',
    ],
  },
  {
    id: 'branding',
    title: 'Branding & Colors',
    icon: 'palette' as IconName,
    content: `Make the booking widget match your brand identity perfectly.`,
    settings: [
      { name: 'Business Name', desc: 'Displayed in the widget header' },
      { name: 'Phone Number', desc: 'Shown for customers who prefer to call' },
      { name: 'Logo URL', desc: 'Your company logo (recommended: 200x200px)' },
      { name: 'Primary Color', desc: 'Main color for buttons and headers' },
      { name: 'Accent Color', desc: 'Used for highlights and promotions' },
      { name: 'Rating Display', desc: 'Show your star rating and review count' },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing Configuration',
    icon: 'dollarSign' as IconName,
    content: `Set up your pricing structure using industry-standard methods.`,
    pricingMethods: [
      {
        name: 'Square Footage',
        desc: 'Price based on home size in square feet',
        best: 'Most accurate, scales well for all home sizes',
      },
      {
        name: 'Bedroom/Bathroom',
        desc: 'Base price + per-room charges',
        best: 'Easy for customers to understand',
      },
      {
        name: 'Flat Rate',
        desc: 'Fixed prices by home type',
        best: 'Simple pricing, good for standard homes',
      },
      {
        name: 'Hourly',
        desc: 'Charge by the hour',
        best: 'Flexible, good for variable jobs',
      },
    ],
  },
  {
    id: 'services',
    title: 'Service Types',
    icon: 'layers' as IconName,
    content: `Configure the cleaning services you offer.`,
    settings: [
      { name: 'Standard Clean', desc: 'Regular maintenance cleaning' },
      { name: 'Deep Clean', desc: 'Intensive cleaning with higher multiplier (1.5x-2x)' },
      { name: 'Move In/Out', desc: 'Comprehensive cleaning for moving' },
      { name: 'Post-Construction', desc: 'Heavy-duty cleaning after renovations' },
    ],
    tip: 'Mark your most popular service to help guide customer decisions.',
  },
  {
    id: 'addons',
    title: 'Add-On Services',
    icon: 'plus' as IconName,
    content: `Upsell additional services to increase average ticket value.`,
    categories: [
      { name: 'Kitchen', items: ['Inside Oven', 'Inside Fridge', 'Cabinet Interiors'] },
      { name: 'Windows', items: ['Interior Windows', 'Exterior Windows', 'Blinds'] },
      { name: 'Detail', items: ['Baseboards', 'Ceiling Fans', 'Wall Washing'] },
      { name: 'Laundry', items: ['Wash & Fold', 'Linen Change', 'Dish Washing'] },
      { name: 'Specialty', items: ['Organizing', 'Pet Areas', 'Eco Products'] },
    ],
  },
  {
    id: 'trust',
    title: 'Trust Badges',
    icon: 'shield' as IconName,
    content: `Display credentials to build customer confidence.`,
    badges: [
      { name: 'Google Guaranteed', desc: 'Backed by Google\'s guarantee program' },
      { name: 'Google Screened', desc: 'Background-checked by Google' },
      { name: 'BBB Accredited', desc: 'Better Business Bureau rating' },
      { name: 'Angi\'s List', desc: 'Super Service Award winner' },
      { name: 'Thumbtack Pro', desc: 'Top Pro status' },
      { name: 'HomeAdvisor', desc: 'Screened & Approved' },
    ],
  },
  {
    id: 'promotion',
    title: 'Promotions',
    icon: 'tag' as IconName,
    content: `Create limited-time offers to attract new customers.`,
    settings: [
      { name: 'Headline', desc: 'Main promotional message (e.g., "Get 20% Off!")' },
      { name: 'Subheadline', desc: 'Supporting text for the promotion' },
      { name: 'Discount Percent', desc: 'The discount amount to apply' },
      { name: 'Expiry Date', desc: 'When the promotion ends' },
    ],
    tip: 'First-time customer discounts of 15-25% have the highest conversion rates.',
  },
  {
    id: 'settings',
    title: 'Business Settings',
    icon: 'settings' as IconName,
    content: `Configure operational settings for your business.`,
    settings: [
      { name: 'Minimum Price', desc: 'Lowest amount you\'ll accept (industry: $100-$150)' },
      { name: 'Deposit Percent', desc: 'Required upfront payment (industry: 25-50%)' },
      { name: 'Service ZIP Codes', desc: 'Areas you service (leave empty for all)' },
    ],
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function DocSection({ section }: { section: typeof sections[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      id={section.id}
      className="scroll-mt-24"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon name={section.icon} size="lg" className="text-primary" />
            </div>
            <div>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.content}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {section.features && (
            <div className="grid md:grid-cols-2 gap-2">
              {section.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {section.settings && (
            <div className="space-y-2">
              {section.settings.map((setting, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <p className="font-medium text-sm">{setting.name}</p>
                  <p className="text-xs text-muted-foreground">{setting.desc}</p>
                </div>
              ))}
            </div>
          )}

          {section.pricingMethods && (
            <div className="grid md:grid-cols-2 gap-3">
              {section.pricingMethods.map((method, i) => (
                <div key={i} className="p-4 border rounded-xl">
                  <p className="font-semibold">{method.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">{method.desc}</p>
                  <Badge variant="secondary" className="text-xs">Best for: {method.best}</Badge>
                </div>
              ))}
            </div>
          )}

          {section.badges && (
            <div className="grid md:grid-cols-3 gap-2">
              {section.badges.map((badge, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <Icon name="shield" size="sm" className="text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section.categories && (
            <div className="space-y-2">
              {section.categories.map((cat, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <p className="font-medium text-sm mb-2">{cat.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.items.map((item, j) => (
                      <Badge key={j} variant="outline" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {section.tip && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Icon name="lightbulb" size="sm" className="text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800"><strong>Tip:</strong> {section.tip}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function BookingWidgetDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-icon-new.png" alt="Selestial" className="h-8 w-8" />
              <span className="font-bold text-lg">Selestial Docs</span>
            </Link>
            <Badge variant="outline">Booking Widget</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="https://app.selestial.io/login">Login</a>
            </Button>
            <Button asChild>
              <a href="https://app.selestial.io/signup">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">On This Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon name={section.icon} size="sm" />
                      {section.title}
                    </a>
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="helpCircle" size="lg" className="text-primary" />
                    <span className="font-medium">Need Help?</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact our support team for assistance.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="mailto:support@selestial.io">
                      <Icon name="mail" size="sm" className="mr-2" />
                      Contact Support
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero */}
            <div className="text-center mb-8">
              <Badge className="mb-4">Documentation</Badge>
              <h1 className="text-4xl font-bold mb-4">Booking Widget Guide</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Learn how to configure and customize your online booking widget to match your business needs.
              </p>
            </div>

            {/* Quick Start */}
            <Card className="bg-gradient-to-r from-primary to-violet-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    <Icon name="zap" size="xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Quick Start</h3>
                    <p className="text-white/80 mb-4">
                      Get your booking widget live in minutes:
                    </p>
                    <ol className="space-y-2 text-white/90">
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</span>
                        Connect your Stripe account for payments
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</span>
                        Configure your pricing and services
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</span>
                        Customize branding and colors
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">4</span>
                        Embed the widget on your website
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            {sections.map((section) => (
              <DocSection key={section.id} section={section} />
            ))}

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="helpCircle" size="lg" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="1">
                    <AccordionTrigger>How do I embed the widget on my website?</AccordionTrigger>
                    <AccordionContent>
                      Copy the embed code from the Settings tab and paste it into your website's HTML. The widget will automatically load and adapt to your container's width.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="2">
                    <AccordionTrigger>Can customers pay online?</AccordionTrigger>
                    <AccordionContent>
                      Yes! Once you connect your Stripe account, customers can pay deposits securely through the booking widget. You control the deposit percentage.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="3">
                    <AccordionTrigger>How do I set my prices?</AccordionTrigger>
                    <AccordionContent>
                      Use the Pricing tab to configure your base rates. You can choose square footage, bedroom/bathroom count, flat rates, or hourly pricing. Our Pricing Wizard can also recommend optimal prices based on your market.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="4">
                    <AccordionTrigger>Can I restrict service areas?</AccordionTrigger>
                    <AccordionContent>
                      Yes, in the Settings tab you can specify which ZIP codes you service. Customers outside your service area will be notified when they enter their address.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="5">
                    <AccordionTrigger>How do I run promotions?</AccordionTrigger>
                    <AccordionContent>
                      Enable the Promotion Banner in the Promotion tab. Set your headline, discount percentage, and expiry date. The promotion will automatically display to all customers viewing your widget.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo-icon-new.png" alt="Selestial" className="h-6 w-6" />
              <span className="font-semibold">Selestial</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://selestial.io/terms" className="hover:text-foreground">Terms</a>
              <a href="https://selestial.io/privacy" className="hover:text-foreground">Privacy</a>
              <a href="mailto:support@selestial.io" className="hover:text-foreground">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
