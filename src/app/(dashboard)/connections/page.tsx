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
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'ignored':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <Layout title="Connections">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Connections">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Integrations & Connections</h2>
            <p className="text-sm text-muted-foreground">
              Connect your tools and automate your workflow
            </p>
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
          <TabsList className="bg-muted/50">
            <TabsTrigger value="integrations" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="webhook" className="gap-2">
              <Webhook className="h-4 w-4" />
              Webhook API
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Clock className="h-4 w-4" />
              Event Log
            </TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-6 space-y-8">
            {integrationCategories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-4">
                  <category.icon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.integrations.map((integration) => {
                    const isConnected = getIntegration(integration.id)?.status === 'connected' || ('connected' in integration && integration.connected);
                    const LogoComponent = integration.logo;
                    
                    return (
                      <Card 
                        key={integration.id}
                        className={cn(
                          "p-4 hover:shadow-md transition-all cursor-pointer group",
                          isConnected && "border-primary/30 bg-primary/5"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm border">
                              <LogoComponent />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{integration.name}</h4>
                                {'popular' in integration && integration.popular && (
                                  <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 border-0">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {integration.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          {isConnected ? (
                            <>
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                <Check className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => disconnectIntegration(integration.id)}
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-muted-foreground">Not connected</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-1"
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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Webhook className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Webhook Endpoint</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive events from external platforms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="webhook-active" className="text-sm text-muted-foreground">
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
                  <Label className="text-sm font-medium">Your Webhook URL</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input 
                      value={webhookUrl} 
                      readOnly 
                      className="font-mono text-sm bg-muted"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleRegenerateKey}
                      disabled={regenerating}
                    >
                      <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} />
                    </Button>
                  </div>
                </div>

                {config && (
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold">{config.total_events_received}</p>
                      <p className="text-xs text-muted-foreground">Events Received</p>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-600">{config.total_events_processed}</p>
                      <p className="text-xs text-muted-foreground">Processed</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <p className="text-2xl font-bold text-red-600">{config.total_events_failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Supported Events */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Supported Events</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { event: 'customer.created', desc: 'New customers', icon: '👤' },
                  { event: 'customer.updated', desc: 'Updates', icon: '✏️' },
                  { event: 'job.scheduled', desc: 'Bookings', icon: '📅' },
                  { event: 'job.completed', desc: 'Completions', icon: '✅' },
                  { event: 'invoice.paid', desc: 'Payments', icon: '💰' },
                  { event: 'quote.created', desc: 'New quotes', icon: '📝' },
                ].map(({ event, desc, icon }) => (
                  <div key={event} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-lg">{icon}</span>
                    <div>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {event}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Events Log Tab */}
          <TabsContent value="events" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Events</h3>
                <Button variant="outline" size="sm" onClick={refetch}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No events received yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Events will appear here when your integrations send data
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(event.status)}
                        <Badge variant="outline" className="font-mono text-xs">
                          {event.event_type}
                        </Badge>
                        {event.result_type && (
                          <span className="text-sm text-muted-foreground">
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
                        <span className="text-xs text-muted-foreground">
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
