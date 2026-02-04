'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Documentation categories
const docCategories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of Selestial and get up and running quickly',
    icon: 'rocket' as const,
    color: 'violet',
    links: [
      { title: 'Quick Start Guide', href: '/docs/getting-started', description: 'Get started in 5 minutes' },
      { title: 'Account Setup', href: '/docs/account-setup', description: 'Configure your business profile' },
      { title: 'Dashboard Overview', href: '/docs/dashboard', description: 'Navigate the main dashboard' },
    ],
  },
  {
    title: 'Booking Widget',
    description: 'Set up and customize your online booking system',
    icon: 'calendar' as const,
    color: 'blue',
    links: [
      { title: 'Widget Setup', href: '/docs/booking-widget', description: 'Complete setup guide' },
      { title: 'Pricing Configuration', href: '/docs/booking-widget#pricing', description: 'Configure your pricing' },
      { title: 'Embedding', href: '/docs/booking-widget#embed', description: 'Add to your website' },
    ],
  },
  {
    title: 'Quotes & Invoicing',
    description: 'Create and manage quotes and payment links',
    icon: 'fileText' as const,
    color: 'emerald',
    links: [
      { title: 'Creating Quotes', href: '/docs/quotes', description: 'Build professional quotes' },
      { title: 'Payment Links', href: '/docs/payment-links', description: 'Accept payments easily' },
      { title: 'Pricing Wizard', href: '/docs/pricing-wizard', description: 'AI-powered pricing' },
    ],
  },
  {
    title: 'Sequences & Automation',
    description: 'Automate your customer communication workflows',
    icon: 'gitBranch' as const,
    color: 'amber',
    links: [
      { title: 'Sequence Builder', href: '/docs/sequences', description: 'Create automated workflows' },
      { title: 'Templates', href: '/docs/sequence-templates', description: 'Pre-built templates' },
      { title: 'Triggers & Actions', href: '/docs/triggers', description: 'Configure automation rules' },
    ],
  },
  {
    title: 'Customer Management',
    description: 'Manage your customer database and interactions',
    icon: 'users' as const,
    color: 'pink',
    links: [
      { title: 'Customer Profiles', href: '/docs/customers', description: 'View and manage customers' },
      { title: 'Importing Data', href: '/docs/import', description: 'Import from CSV' },
      { title: 'Health Scores', href: '/docs/health-scores', description: 'Track customer health' },
    ],
  },
  {
    title: 'Integrations',
    description: 'Connect Selestial with your favorite tools',
    icon: 'link' as const,
    color: 'cyan',
    links: [
      { title: 'Stripe Setup', href: '/docs/stripe', description: 'Accept payments' },
      { title: 'Twilio SMS', href: '/docs/twilio', description: 'Send text messages' },
      { title: 'Google Calendar', href: '/docs/calendar', description: 'Sync appointments' },
    ],
  },
];

const colorClasses: Record<string, string> = {
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
};

export default function DocsIndexPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredCategories = docCategories.filter(category => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.title.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      category.links.some(link => 
        link.title.toLowerCase().includes(query) ||
        link.description.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/docs" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Icon name="book" className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl">Selestial Docs</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="https://app.selestial.io" className="text-sm text-muted-foreground hover:text-foreground">
              Go to App
            </Link>
            <Link href="https://selestial.io" className="text-sm text-muted-foreground hover:text-foreground">
              Website
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Selestial Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to grow your home service business with Selestial
            </p>
            
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-violet-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {['Getting Started', 'Booking Widget', 'Pricing', 'Sequences', 'API Reference'].map((link) => (
              <Button key={link} variant="outline" size="sm" className="rounded-full">
                {link}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${colorClasses[category.color]} flex items-center justify-center mb-3`}>
                      <Icon name={category.icon} className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted transition-colors group"
                          >
                            <div>
                              <p className="font-medium text-sm group-hover:text-violet-600 transition-colors">
                                {link.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {link.description}
                              </p>
                            </div>
                            <Icon name="chevronRight" className="h-4 w-4 text-muted-foreground group-hover:text-violet-600 transition-colors" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="px-6 pb-16 bg-gray-50">
        <div className="max-w-6xl mx-auto py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'How to set up your booking widget', views: '2.4k views', icon: 'calendar' as const },
              { title: 'Configure Stripe for payments', views: '1.8k views', icon: 'creditCard' as const },
              { title: 'Create your first automated sequence', views: '1.5k views', icon: 'gitBranch' as const },
              { title: 'Import customers from CSV', views: '1.2k views', icon: 'upload' as const },
            ].map((article) => (
              <Link
                key={article.title}
                href="#"
                className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:border-violet-300 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={article.icon} className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{article.title}</p>
                  <p className="text-sm text-muted-foreground">{article.views}</p>
                </div>
                <Icon name="chevronRight" className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Cannot find what you are looking for?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you get the most out of Selestial
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link href="mailto:support@selestial.io">
                <Icon name="mail" className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://selestial.io">
                <Icon name="globe" className="h-4 w-4 mr-2" />
                Visit Website
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Selestial. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="https://selestial.io/terms" className="text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="https://selestial.io/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="mailto:support@selestial.io" className="text-muted-foreground hover:text-foreground">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
