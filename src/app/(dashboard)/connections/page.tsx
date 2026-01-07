"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { useToast } from '@/hooks/use-toast';
import { useWebhookConfig } from '@/hooks/useWebhookConfig';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import UpgradePrompt from '@/components/shared/UpgradePrompt';
import { cn } from '@/lib/utils';
import { 
  Copy, 
  RefreshCw, 
  Check, 
  Loader2,
  Webhook,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Sparkles,
  Building2,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';

// Company Logo Components
const ServiceTitanLogo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#FF6B35"/>
    <path d="M12 12h16v4H12zM12 20h12v4H12zM12 28h8v4H12z" fill="white"/>
  </svg>
);

const HousecallProLogo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#00A651"/>
    <path d="M20 8L8 18v14h8v-8h8v8h8V18L20 8z" fill="white"/>
  </svg>
);

const JobberLogo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#7C3AED"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">J</text>
  </svg>
);

const ServiceM8Logo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#00B4D8"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">M8</text>
  </svg>
);

const TwilioLogo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#F22F46"/>
    <circle cx="14" cy="14" r="4" fill="white"/>
    <circle cx="26" cy="14" r="4" fill="white"/>
    <circle cx="14" cy="26" r="4" fill="white"/>
    <circle cx="26" cy="26" r="4" fill="white"/>
  </svg>
);

const GoogleBusinessLogo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#4285F4"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">G</text>
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#635BFF"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">S</text>
  </svg>
);

const QuickBooksLogo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#2CA01C"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">QB</text>
  </svg>
);

const ZapierLogo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#FF4A00"/>
    <path d="M20 8l4 8h-8l4-8zM20 32l-4-8h8l-4 8zM8 20l8-4v8l-8-4zM32 20l-8 4v-8l8 4z" fill="white"/>
  </svg>
);

const MakeLogo = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8">
    <rect width="40" height="40" rx="8" fill="#6D00CC"/>
    <circle cx="20" cy="20" r="10" fill="none" stroke="white" strokeWidth="3"/>
    <circle cx="20" cy="20" r="4" fill="white"/>
  </svg>
);

const integrationCategories = [
  {
    id: 'field-service',
    name: 'Field Service Management',
    icon: Building2,
    integrations: [
      { 
        id: 'servicetitan', 
        name: 'ServiceTitan', 
        description: 'Enterprise field management with advanced scheduling',
        logo: ServiceTitanLogo,
        popular: true,
      },
      { 
        id: 'housecall_pro', 
        name: 'Housecall Pro', 
        description: 'All-in-one home service business solution',
        logo: HousecallProLogo,
        popular: true,
      },
      { 
        id: 'jobber', 
        name: 'Jobber', 
        description: 'Sync customers, jobs, and invoices automatically',
        logo: JobberLogo,
        popular: true,
      },
      { 
        id: 'servicem8', 
        name: 'ServiceM8', 
        description: 'Job management for trades and service businesses',
        logo: ServiceM8Logo,
      },
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: MessageSquare,
    integrations: [
      { 
        id: 'twilio', 
        name: 'Twilio', 
        description: 'SMS messaging and voice calls',
        logo: TwilioLogo,
        connected: true,
      },
      { 
        id: 'google_business', 
        name: 'Google Business', 
        description: 'Manage reviews and messages',
        logo: GoogleBusinessLogo,
      },
    ],
  },
  {
    id: 'payments',
    name: 'Payments & Accounting',
    icon: CreditCard,
    integrations: [
      { 
        id: 'stripe', 
        name: 'Stripe', 
        description: 'Accept payments via payment links',
        logo: StripeLogo,
      },
      { 
        id: 'quickbooks', 
        name: 'QuickBooks', 
        description: 'Sync invoices and payments',
        logo: QuickBooksLogo,
      },
    ],
  },
  {
    id: 'automation',
    name: 'Automation',
    icon: Zap,
    integrations: [
      { 
        id: 'zapier', 
        name: 'Zapier', 
        description: 'Connect to 5000+ apps and automate workflows',
        logo: ZapierLogo,
        popular: true,
      },
      { 
        id: 'make', 
        name: 'Make', 
        description: 'Advanced automation scenarios',
        logo: MakeLogo,
      },
    ],
  },
];

export default function ConnectionsPage() {
  const { toast } = useToast();
  const { hasFeature } = useFeatureGate();
  const hasIntegrations = hasFeature('integrations');
  const { 
    config, 
    events, 
    loading, 
    regenerateKey, 
    toggleActive, 
    getWebhookUrl,
    refetch 
  } = useWebhookConfig();
  const { getIntegration, markAsConnected, disconnectIntegration } = useIntegrations();
  
  const [activeTab, setActiveTab] = useState('integrations');
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const webhookUrl = getWebhookUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Webhook URL copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    try {
      await regenerateKey();
      toast({ 
        title: 'Webhook URL regenerated', 
        description: 'Update your integrations with the new URL' 
      });
    } catch {
      toast({ title: 'Failed to regenerate', variant: 'destructive' });
    } finally {
      setRegenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'ignored':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Layout title="Connections">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Connections">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations & Connections</h1>
            <p className="text-gray-500">Connect your tools and automate your workflow</p>
          </div>
        </div>

        {/* Upgrade Prompt if needed */}
        {!hasIntegrations && (
          <UpgradePrompt 
            feature="Integrations"
            description="Connect your favorite tools and sync data automatically"
            variant="banner"
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100/80 p-1 rounded-xl">
            <TabsTrigger value="integrations" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="webhook" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Webhook className="h-4 w-4" />
              Webhook API
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4" />
              Event Log
            </TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-6 space-y-8">
            {integrationCategories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-4">
                  <category.icon className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.integrations.map((integration) => {
                    const isConnected = getIntegration(integration.id)?.status === 'connected' || ('connected' in integration && integration.connected);
                    const LogoComponent = integration.logo;
                    
                    return (
                      <Card 
                        key={integration.id}
                        className={cn(
                          "card-elevated p-5 hover:shadow-lg transition-all cursor-pointer group",
                          isConnected && "border-primary/30 bg-primary/5"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white shadow-sm border p-2">
                              <LogoComponent />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                                {'popular' in integration && integration.popular && (
                                  <Badge className="text-[10px] bg-amber-100 text-amber-700 border-0">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {integration.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                          {isConnected ? (
                            <>
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                <Check className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-600"
                                onClick={() => disconnectIntegration(integration.id)}
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-gray-400">Not connected</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-1 rounded-xl"
                                onClick={() => markAsConnected(integration.id, integration.name)}
                                disabled={!hasIntegrations}
                              >
                                Connect
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Webhook Tab */}
          <TabsContent value="webhook" className="mt-6 space-y-6">
            <Card className="card-elevated p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Webhook className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Webhook Endpoint</h3>
                    <p className="text-sm text-gray-500">
                      Receive events from external platforms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="webhook-active" className="text-sm text-gray-500">
                    {config?.is_active ? 'Active' : 'Inactive'}
                  </Label>
                  <Switch 
                    id="webhook-active"
                    checked={config?.is_active || false}
                    onCheckedChange={() => toggleActive()}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Your Webhook URL</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input 
                      value={webhookUrl} 
                      readOnly 
                      className="font-mono text-sm bg-gray-50 rounded-xl"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopy} className="rounded-xl">
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleRegenerateKey}
                      disabled={regenerating}
                      className="rounded-xl"
                    >
                      <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} />
                    </Button>
                  </div>
                </div>

                {config && (
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-5 bg-gray-50 rounded-xl">
                      <p className="text-3xl font-bold text-gray-900">
                        <AnimatedCounter value={config.total_events_received} />
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Events Received</p>
                    </div>
                    <div className="text-center p-5 bg-emerald-50 rounded-xl">
                      <p className="text-3xl font-bold text-emerald-600">
                        <AnimatedCounter value={config.total_events_processed} />
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Processed</p>
                    </div>
                    <div className="text-center p-5 bg-red-50 rounded-xl">
                      <p className="text-3xl font-bold text-red-600">
                        <AnimatedCounter value={config.total_events_failed} />
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Failed</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Supported Events */}
            <Card className="card-elevated p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Supported Events</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { event: 'customer.created', desc: 'New customers', color: 'bg-blue-100 text-blue-600' },
                  { event: 'customer.updated', desc: 'Updates', color: 'bg-amber-100 text-amber-600' },
                  { event: 'job.scheduled', desc: 'Bookings', color: 'bg-purple-100 text-purple-600' },
                  { event: 'job.completed', desc: 'Completions', color: 'bg-emerald-100 text-emerald-600' },
                  { event: 'invoice.paid', desc: 'Payments', color: 'bg-green-100 text-green-600' },
                  { event: 'quote.created', desc: 'New quotes', color: 'bg-primary/10 text-primary' },
                ].map(({ event, desc, color }) => (
                  <div key={event} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <Badge variant="outline" className="font-mono text-[10px] rounded-lg">
                        {event}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Events Log Tab */}
          <TabsContent value="events" className="mt-6">
            <Card className="card-elevated p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Recent Events</h3>
                <Button variant="outline" size="sm" onClick={refetch} className="rounded-xl">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No events received yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Events will appear here when your integrations send data
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(event.status)}
                        <Badge variant="outline" className="font-mono text-xs rounded-lg">
                          {event.event_type}
                        </Badge>
                        {event.result_type && (
                          <span className="text-sm text-gray-500">
                            → {event.result_type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {event.error_message && (
                          <span className="text-xs text-red-500 max-w-[200px] truncate">
                            {event.error_message}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {format(new Date(event.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
