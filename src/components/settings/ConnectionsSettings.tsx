import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useWebhookConfig } from '@/hooks/useWebhookConfig';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Icon, IconName } from '@/components/ui/icon';
import { format } from 'date-fns';

const SUPPORTED_PLATFORMS = [
  { 
    id: 'jobber', 
    name: 'Jobber', 
    description: 'Field service management',
    color: 'bg-blue-500'
  },
  { 
    id: 'housecall_pro', 
    name: 'Housecall Pro', 
    description: 'Home service business software',
    color: 'bg-orange-500'
  },
  { 
    id: 'servicetitan', 
    name: 'ServiceTitan', 
    description: 'Enterprise field management',
    color: 'bg-purple-500'
  },
  { 
    id: 'zapier', 
    name: 'Zapier', 
    description: 'Connect with 5000+ apps',
    color: 'bg-orange-400'
  },
];

export default function ConnectionsSettings() {
  const { toast } = useToast();
  const { 
    config, 
    events, 
    loading, 
    regenerateKey, 
    toggleActive, 
    getWebhookUrl,
    refetch 
  } = useWebhookConfig();
  const { integrations, getIntegration, markAsConnected, disconnectIntegration } = useIntegrations();
  
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

  const handleToggleActive = async () => {
    try {
      await toggleActive();
      toast({ 
        title: config?.is_active ? 'Webhook disabled' : 'Webhook enabled',
      });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const getStatusIcon = (status: string): { name: IconName; className: string } => {
    switch (status) {
      case 'processed':
        return { name: 'checkCircle', className: 'text-green-500' };
      case 'failed':
        return { name: 'xCircle', className: 'text-red-500' };
      case 'ignored':
        return { name: 'alertCircle', className: 'text-yellow-500' };
      default:
        return { name: 'clock', className: 'text-muted-foreground' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="spinner" size="2xl" className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon name="webhook" size="lg" className="text-primary" />
              </div>
              <div>
                <CardTitle>Webhook Endpoint</CardTitle>
                <CardDescription>
                  Receive events from Jobber, Housecall Pro, and other platforms via Zapier
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="webhook-active" className="text-sm text-muted-foreground">
                {config?.is_active ? 'Active' : 'Inactive'}
              </Label>
              <Switch 
                id="webhook-active"
                checked={config?.is_active || false}
                onCheckedChange={handleToggleActive}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Your Webhook URL</Label>
            <div className="flex gap-2">
              <Input 
                value={webhookUrl} 
                readOnly 
                className="font-mono text-sm bg-muted"
              />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Icon name="check" size="md" /> : <Icon name="copy" size="md" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRegenerateKey}
                disabled={regenerating}
              >
                <Icon name="refresh" size="md" className={regenerating ? 'animate-spin' : ''} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this URL in Zapier or your integration platform to send events to Selestial
            </p>
          </div>

          {config && (
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{config.total_events_received}</p>
                <p className="text-xs text-muted-foreground">Events Received</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{config.total_events_processed}</p>
                <p className="text-xs text-muted-foreground">Processed</p>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{config.total_events_failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supported Events */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Events</CardTitle>
          <CardDescription>
            Send these event types to sync data with Selestial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { event: 'customer.created', desc: 'Sync new customers' },
              { event: 'customer.updated', desc: 'Update customer info' },
              { event: 'job.scheduled', desc: 'Mark quotes as won' },
              { event: 'job.completed', desc: 'Track completed jobs' },
              { event: 'invoice.paid', desc: 'Update customer spend' },
              { event: 'quote.created', desc: 'Create new quotes' },
              { event: 'quote.accepted', desc: 'Mark quotes as won' },
            ].map(({ event, desc }) => (
              <div key={event} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="font-mono text-xs">
                  {event}
                </Badge>
                <span className="text-sm text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Last 20 webhook events received</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={refetch}>
                <Icon name="refresh" size="md" className="mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.map((event) => {
                const statusIcon = getStatusIcon(event.status);
                return (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon name={statusIcon.name} size="md" className={statusIcon.className} />
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
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>
            Platforms sending data to your webhook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SUPPORTED_PLATFORMS.map((platform) => {
              const integration = getIntegration(platform.id);
              const isConnected = integration?.status === 'connected';
              
              return (
                <div 
                  key={platform.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {platform.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isConnected ? (
                      <>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          <Icon name="check" size="xs" className="mr-1" />
                          Connected
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => disconnectIntegration(platform.id)}
                        >
                          <Icon name="close" size="md" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsConnected(platform.id, platform.name)}
                      >
                        Mark Connected
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Zapier Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup with Zapier</CardTitle>
          <CardDescription>
            Connect your field service software in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              <span className="text-muted-foreground">
                Create a new Zap in{' '}
                <a 
                  href="https://zapier.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Zapier <Icon name="externalLink" size="xs" />
                </a>
              </span>
            </li>
            <li>
              <span className="text-muted-foreground">
                Choose your trigger app (Jobber, Housecall Pro, etc.) and event
              </span>
            </li>
            <li>
              <span className="text-muted-foreground">
                Add a "Webhooks by Zapier" action with "POST" method
              </span>
            </li>
            <li>
              <span className="text-muted-foreground">
                Paste your webhook URL and map the fields:
              </span>
              <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-xs">
                <pre>{`{
  "event": "job.completed",
  "customer_name": "{{customer_name}}",
  "customer_phone": "{{customer_phone}}",
  "customer_email": "{{customer_email}}",
  "job_id": "{{job_id}}",
  "job_amount": {{job_amount_cents}},
  "source": "jobber"
}`}</pre>
              </div>
            </li>
            <li>
              <span className="text-muted-foreground">
                Test the Zap and turn it on!
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
