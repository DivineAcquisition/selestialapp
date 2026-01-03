import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Database,
  Zap,
  Users,
  FileText,
  MessageSquare,
  Sparkles,
  BarChart3,
  Megaphone,
  Play,
  Settings,
  Activity,
  Copy,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthCheck {
  business: { exists: boolean; name: string; industry: string; subscription: string };
  customers: { count: number; has_data: boolean };
  quotes: { count: number; has_data: boolean };
  sequences: { count: number; has_data: boolean };
  messages: { count: number; has_data: boolean };
  ai_settings: { configured: boolean };
  campaigns: { count: number };
  status: string;
  checked_at: string;
}

interface SchemaCheck {
  tables: Record<string, boolean>;
  total_expected: number;
  missing_count: number;
  all_present: boolean;
}

export default function AdminTestPage() {
  const { toast } = useToast();
  const { business } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [schemaCheck, setSchemaCheck] = useState<SchemaCheck | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

  useEffect(() => {
    if (business) {
      runAllChecks();
    }
  }, [business]);

  const runAllChecks = async () => {
    setLoading(true);
    try {
      // Health check
      const { data: health, error: healthError } = await supabase.rpc('system_health_check', {
        p_business_id: business!.id,
      });
      
      if (healthError) {
        console.error('Health check error:', healthError);
      } else if (health) {
        setHealthCheck(health as unknown as HealthCheck);
      }

      // Schema check
      const { data: schema, error: schemaError } = await supabase.rpc('verify_database_schema');
      
      if (schemaError) {
        console.error('Schema check error:', schemaError);
      } else if (schema) {
        setSchemaCheck(schema as unknown as SchemaCheck);
      }

    } catch (err) {
      console.error('Check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const seedTestData = async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.rpc('seed_test_data', {
        p_business_id: business!.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; created: { customers: number; quotes: number; sequences: number } };
      
      toast({
        title: 'Test data created!',
        description: `Created ${result.created.customers} customers, ${result.created.quotes} quotes, ${result.created.sequences} sequences`,
      });

      await runAllChecks();
    } catch (err) {
      console.error('Seed error:', err);
      toast({ title: 'Failed to seed data', variant: 'destructive' });
    } finally {
      setSeeding(false);
    }
  };

  const runFeatureTest = async (feature: string) => {
    setTestResults(prev => ({ ...prev, [feature]: null }));
    
    try {
      let success = false;

      switch (feature) {
        case 'auth':
          const { data: session } = await supabase.auth.getSession();
          success = !!session?.session;
          break;

        case 'database':
          const { data: biz } = await supabase.from('businesses').select('id').limit(1);
          success = Array.isArray(biz);
          break;

        case 'customers':
          const { data: customers } = await supabase
            .from('customers')
            .select('id')
            .eq('business_id', business!.id)
            .limit(1);
          success = Array.isArray(customers);
          break;

        case 'quotes':
          const { data: quotes } = await supabase
            .from('quotes')
            .select('id')
            .eq('business_id', business!.id)
            .limit(1);
          success = Array.isArray(quotes);
          break;

        case 'sequences':
          const { data: sequences } = await supabase
            .from('sequences')
            .select('id')
            .eq('business_id', business!.id)
            .limit(1);
          success = Array.isArray(sequences);
          break;

        case 'ai_settings':
          const { data: ai } = await supabase
            .from('ai_settings')
            .select('id')
            .eq('business_id', business!.id);
          success = Array.isArray(ai);
          break;

        case 'campaigns':
          const { data: campaigns } = await supabase
            .from('seasonal_campaigns')
            .select('id')
            .eq('business_id', business!.id)
            .limit(1);
          success = Array.isArray(campaigns);
          break;

        case 'messages':
          const { data: messages } = await supabase
            .from('messages')
            .select('id')
            .eq('business_id', business!.id)
            .limit(1);
          success = Array.isArray(messages);
          break;

        case 'activity':
          const { data: activity } = await supabase
            .from('activity_logs')
            .select('id')
            .eq('business_id', business!.id)
            .limit(1);
          success = Array.isArray(activity);
          break;

        default:
          success = false;
      }

      setTestResults(prev => ({ ...prev, [feature]: success }));
    } catch (err) {
      console.error(`Test ${feature} failed:`, err);
      setTestResults(prev => ({ ...prev, [feature]: false }));
    }
  };

  const runAllTests = async () => {
    const features = ['auth', 'database', 'customers', 'quotes', 'sequences', 'ai_settings', 'campaigns', 'messages', 'activity'];
    for (const feature of features) {
      await runFeatureTest(feature);
    }
  };

  const StatusIcon = ({ status }: { status: boolean | null | undefined }) => {
    if (status === null) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (status === undefined) return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    return status ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  const featureTests = [
    { key: 'auth', label: 'Authentication', icon: Settings },
    { key: 'database', label: 'Database Connection', icon: Database },
    { key: 'customers', label: 'Customers Table', icon: Users },
    { key: 'quotes', label: 'Quotes Table', icon: FileText },
    { key: 'sequences', label: 'Sequences Table', icon: Zap },
    { key: 'ai_settings', label: 'AI Settings', icon: Sparkles },
    { key: 'campaigns', label: 'Campaigns Table', icon: Megaphone },
    { key: 'messages', label: 'Messages Table', icon: MessageSquare },
    { key: 'activity', label: 'Activity Logs', icon: Activity },
  ];

  if (loading && !healthCheck) {
    return (
      <Layout title="System Tests">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Tests">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Test Dashboard</h1>
            <p className="text-muted-foreground">Verify all Selestial features are working</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={runAllChecks} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={runAllTests}>
              <Play className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        {healthCheck && (
          <Card className={cn(
            "border-2",
            healthCheck.status === 'healthy' ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {healthCheck.status === 'healthy' ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-destructive" />
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {healthCheck.status === 'healthy' ? 'System Healthy' : 'Issues Detected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Business: {healthCheck.business.name} ({healthCheck.business.industry}) • {healthCheck.business.subscription}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schema Check */}
          {schemaCheck && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Database Schema</CardTitle>
                  </div>
                  <Badge variant={schemaCheck.all_present ? "default" : "destructive"}>
                    {schemaCheck.all_present ? 'All Tables Present' : `${schemaCheck.missing_count} Missing`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(schemaCheck.tables).map(([table, exists]) => (
                    <div
                      key={table}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded",
                        exists ? "text-green-600 bg-green-500/10" : "text-destructive bg-destructive/10"
                      )}
                    >
                      {exists ? '✓' : '✗'} {table}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Tests */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Feature Tests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {featureTests.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={testResults[key]} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => runFeatureTest(key)}
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Summary */}
          {healthCheck && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Data Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold">{healthCheck.customers.count}</p>
                    <p className="text-xs text-muted-foreground">Customers</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold">{healthCheck.quotes.count}</p>
                    <p className="text-xs text-muted-foreground">Quotes</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Zap className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold">{healthCheck.sequences.count}</p>
                    <p className="text-xs text-muted-foreground">Sequences</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <MessageSquare className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold">{healthCheck.messages.count}</p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={seedTestData}
                  disabled={seeding}
                >
                  {seeding ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Database className="h-5 w-5" />
                  )}
                  <span className="text-xs">Seed Test Data</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => window.location.href = '/settings'}
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Settings</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => window.location.href = '/inbox'}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs">Test Inbox</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => window.location.href = '/quotes'}
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Create Quote</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auth Config Debug Panel */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Auth Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { 
                  label: 'Supabase URL', 
                  value: import.meta.env.VITE_SUPABASE_URL || 'Not set'
                },
                { 
                  label: 'Frontend Origin', 
                  value: window.location.origin 
                },
                { 
                  label: 'Expected Google Callback', 
                  value: `${import.meta.env.VITE_SUPABASE_URL || '[VITE_SUPABASE_URL]'}/auth/v1/callback`
                },
                { 
                  label: 'App Redirect URL', 
                  value: `${window.location.origin}/auth/callback`
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground font-mono break-all">{item.value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(item.value);
                      toast({ title: 'Copied!', description: item.label });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={async () => {
                  const { data } = await supabase.auth.getSession();
                  toast({ 
                    title: data?.session ? 'Session Active' : 'No Session',
                    description: data?.session ? `User: ${data.session.user.email}` : 'User not logged in'
                  });
                }}
              >
                Check Current Session
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Launch Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Launch Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Supabase connected', check: !!healthCheck?.business.exists },
                { label: 'Business profile created', check: !!healthCheck?.business.name },
                { label: 'Industry selected', check: !!healthCheck?.business.industry },
                { label: 'At least one sequence', check: (healthCheck?.sequences.count || 0) > 0 },
                { label: 'AI settings configured', check: healthCheck?.ai_settings.configured },
                { label: 'Customers table exists', check: schemaCheck?.tables?.customers },
                { label: 'Quotes table exists', check: schemaCheck?.tables?.quotes },
                { label: 'Messages table exists', check: schemaCheck?.tables?.messages },
              ].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg",
                    item.check ? "bg-green-500/10" : "bg-muted"
                  )}
                >
                  <StatusIcon status={item.check} />
                  <span className={cn(
                    "text-sm",
                    item.check ? "text-green-600" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
