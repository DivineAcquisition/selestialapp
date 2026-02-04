"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Icon, IconName } from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  color: string;
  category: 'communication' | 'crm' | 'payment' | 'marketing' | 'productivity';
  connected: boolean;
  popular?: boolean;
  comingSoon?: boolean;
}

const integrations: Integration[] = [
  // Communication
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Send SMS messages and make calls',
    icon: 'phone',
    color: 'bg-red-500',
    category: 'communication',
    connected: false,
    popular: true,
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Transactional and marketing emails',
    icon: 'email',
    color: 'bg-blue-500',
    category: 'communication',
    connected: false,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Message customers on WhatsApp',
    icon: 'message',
    color: 'bg-emerald-500',
    category: 'communication',
    connected: false,
    comingSoon: true,
  },
  
  // CRM
  {
    id: 'jobber',
    name: 'Jobber',
    description: 'Sync customers and jobs',
    icon: 'briefcase',
    color: 'bg-emerald-600',
    category: 'crm',
    connected: false,
    popular: true,
  },
  {
    id: 'housecall',
    name: 'Housecall Pro',
    description: 'Field service management',
    icon: 'home',
    color: 'bg-orange-500',
    category: 'crm',
    connected: false,
  },
  {
    id: 'servicetitan',
    name: 'ServiceTitan',
    description: 'Enterprise field service software',
    icon: 'building',
    color: 'bg-blue-600',
    category: 'crm',
    connected: false,
    comingSoon: true,
  },
  
  // Payment
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept online payments',
    icon: 'creditCard',
    color: 'bg-purple-600',
    category: 'payment',
    connected: false,
    popular: true,
  },
  {
    id: 'square',
    name: 'Square',
    description: 'In-person and online payments',
    icon: 'wallet',
    color: 'bg-gray-900',
    category: 'payment',
    connected: false,
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and invoicing',
    icon: 'receipt',
    color: 'bg-emerald-600',
    category: 'payment',
    connected: false,
  },
  
  // Marketing
  {
    id: 'google_reviews',
    name: 'Google Reviews',
    description: 'Request and manage reviews',
    icon: 'star',
    color: 'bg-amber-500',
    category: 'marketing',
    connected: false,
    popular: true,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing campaigns',
    icon: 'megaphone',
    color: 'bg-yellow-500',
    category: 'marketing',
    connected: false,
  },
  {
    id: 'facebook',
    name: 'Facebook Leads',
    description: 'Import leads from Facebook',
    icon: 'facebook',
    color: 'bg-blue-600',
    category: 'marketing',
    connected: false,
    comingSoon: true,
  },
  
  // Productivity
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync appointments and schedules',
    icon: 'calendar',
    color: 'bg-blue-500',
    category: 'productivity',
    connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect 5000+ apps',
    icon: 'bolt',
    color: 'bg-orange-500',
    category: 'productivity',
    connected: false,
    popular: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications in Slack',
    icon: 'message',
    color: 'bg-purple-500',
    category: 'productivity',
    connected: false,
  },
];

const categories = [
  { id: 'all', label: 'All', icon: 'apps' as IconName },
  { id: 'communication', label: 'Communication', icon: 'message' as IconName },
  { id: 'crm', label: 'CRM', icon: 'users' as IconName },
  { id: 'payment', label: 'Payments', icon: 'creditCard' as IconName },
  { id: 'marketing', label: 'Marketing', icon: 'megaphone' as IconName },
  { id: 'productivity', label: 'Productivity', icon: 'bolt' as IconName },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.connected).length;

  const handleConnect = async (integration: Integration) => {
    if (integration.comingSoon) {
      toast({
        title: 'Coming Soon',
        description: `${integration.name} integration will be available soon!`,
      });
      return;
    }
    
    setSelectedIntegration(integration);
    setConnectDialogOpen(true);
  };

  const handleConfirmConnect = async () => {
    if (!selectedIntegration) return;
    
    setConnecting(true);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Integration Connected',
      description: `${selectedIntegration.name} has been connected successfully.`,
    });
    
    setConnecting(false);
    setConnectDialogOpen(false);
  };

  return (
    <Layout title="Integrations">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/settings')}
              className="rounded-xl"
            >
              <Icon name="arrowLeft" size="lg" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
              <p className="text-gray-500">Connect your favorite tools and services</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-0">
            <Icon name="plug" size="xs" className="mr-1" />
            {connectedCount} connected
          </Badge>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded-xl whitespace-nowrap",
                  activeCategory === cat.id && "ring-2 ring-white/30"
                )}
              >
                <Icon name={cat.icon} size="sm" className="mr-1.5" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Popular Integrations */}
        {activeCategory === 'all' && !searchQuery && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="star" size="lg" className="text-amber-500" />
              Popular Integrations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {integrations.filter(i => i.popular).map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={() => handleConnect(integration)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Integrations */}
        <div className="space-y-4">
          {activeCategory !== 'all' || searchQuery ? null : (
            <h2 className="text-lg font-semibold text-gray-900">All Integrations</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={() => handleConnect(integration)}
              />
            ))}
          </div>
          
          {filteredIntegrations.length === 0 && (
            <Card className="p-12 text-center rounded-2xl">
              <Icon name="search" size="2xl" className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
              <p className="text-gray-500">Try adjusting your search or filter</p>
            </Card>
          )}
        </div>

        {/* Request Integration */}
        <Card className="p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-purple-50 border-primary/10 ring-1 ring-white/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon name="sparkles" size="xl" className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Can&apos;t find what you need?</h3>
              <p className="text-sm text-gray-600">Request a new integration and we&apos;ll consider adding it.</p>
            </div>
            <Button variant="outline" className="rounded-xl">
              <Icon name="plus" size="sm" className="mr-2" />
              Request Integration
            </Button>
          </div>
        </Card>
      </div>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedIntegration && (
                <div className={cn("p-2 rounded-lg text-white", selectedIntegration.color)}>
                  <Icon name={selectedIntegration.icon} size="lg" />
                </div>
              )}
              Connect {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input placeholder="Enter your API key" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Account ID (optional)</Label>
              <Input placeholder="Enter account ID if required" className="rounded-xl" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleConfirmConnect} disabled={connecting} className="rounded-xl ring-2 ring-white/30">
              {connecting ? (
                <>
                  <Icon name="spinner" size="sm" className="mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Icon name="plug" size="sm" className="mr-2" />
                  Connect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function IntegrationCard({
  integration,
  onConnect,
}: {
  integration: Integration;
  onConnect: () => void;
}) {
  return (
    <Card className={cn(
      "p-4 rounded-2xl transition-all hover:shadow-md ring-1 ring-white/50",
      integration.connected && "bg-emerald-50/50 border-emerald-200"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("p-2.5 rounded-xl text-white shrink-0", integration.color)}>
          <Icon name={integration.icon} size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
            {integration.comingSoon && (
              <Badge className="text-[10px] bg-gray-100 text-gray-600 border-0">
                Soon
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        {integration.connected ? (
          <>
            <Badge className="bg-emerald-100 text-emerald-700 border-0">
              <Icon name="check" size="xs" className="mr-1" />
              Connected
            </Badge>
            <Button variant="ghost" size="sm" className="text-gray-500 rounded-lg">
              <Icon name="settings" size="sm" />
            </Button>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-400">Not connected</span>
            <Button
              size="sm"
              variant={integration.comingSoon ? 'outline' : 'default'}
              onClick={onConnect}
              disabled={integration.comingSoon}
              className="rounded-lg"
            >
              {integration.comingSoon ? 'Coming Soon' : 'Connect'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
