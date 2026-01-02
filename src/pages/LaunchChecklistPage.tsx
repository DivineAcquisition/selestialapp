import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Shield,
  Database,
  Key,
  Mail,
  CreditCard,
  MessageSquare,
  Users,
  Zap,
  Settings,
  FileText,
  Rocket,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  critical?: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'auth',
    title: 'Authentication & Onboarding',
    icon: <Key className="h-4 w-4" />,
    items: [
      { id: 'auth-signup', label: 'Email/password signup works', critical: true },
      { id: 'auth-google', label: 'Google OAuth works (if enabled)' },
      { id: 'auth-verify-send', label: 'Verification email sends', critical: true },
      { id: 'auth-verify-receive', label: 'Email received within 2 minutes' },
      { id: 'auth-verify-link', label: 'Verification link works', critical: true },
      { id: 'auth-login', label: 'Email/password login works', critical: true },
      { id: 'auth-session', label: 'Session persists on refresh', critical: true },
      { id: 'auth-forgot', label: 'Forgot password sends email' },
      { id: 'auth-reset', label: 'Password reset completes successfully' },
      { id: 'auth-logout', label: 'Logout clears session' },
      { id: 'onboard-business', label: 'Onboarding: Business info saves', critical: true },
      { id: 'onboard-phone', label: 'Onboarding: Phone number purchase works', critical: true },
      { id: 'onboard-hours', label: 'Onboarding: Business hours save' },
      { id: 'onboard-sequence', label: 'Onboarding: Default sequence created' },
      { id: 'onboard-complete', label: 'Onboarding: Redirects to dashboard' },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <FileText className="h-4 w-4" />,
    items: [
      { id: 'dash-stats', label: 'Stats cards show correct data' },
      { id: 'dash-pipeline', label: 'Quote pipeline shows quotes by status' },
      { id: 'dash-activity', label: 'Recent activity shows real activity' },
      { id: 'dash-actions', label: 'Quick actions work' },
      { id: 'dash-queue', label: 'Queue status shows pending messages' },
    ],
  },
  {
    id: 'quotes',
    title: 'Quotes',
    icon: <FileText className="h-4 w-4" />,
    items: [
      { id: 'quote-list', label: 'Quote list loads', critical: true },
      { id: 'quote-search', label: 'Search works' },
      { id: 'quote-filter', label: 'Status filter works' },
      { id: 'quote-create', label: 'Create quote works', critical: true },
      { id: 'quote-fields', label: 'All fields save correctly' },
      { id: 'quote-amount', label: 'Quote amount formats correctly' },
      { id: 'quote-sequence', label: 'Sequence assignment works' },
      { id: 'quote-fab', label: 'Quick add FAB works' },
      { id: 'quote-detail', label: 'Quote detail view loads' },
      { id: 'quote-status', label: 'Status change works (Active → Won/Lost)' },
      { id: 'quote-notify-sms', label: 'Quote notification SMS sends', critical: true },
      { id: 'quote-notify-email', label: 'Quote notification email sends' },
      { id: 'quote-sequence-start', label: 'Sequence starts on quote creation' },
    ],
  },
  {
    id: 'sequences',
    title: 'Sequences',
    icon: <Zap className="h-4 w-4" />,
    items: [
      { id: 'seq-list', label: 'Sequence list loads' },
      { id: 'seq-create', label: 'Create sequence works' },
      { id: 'seq-edit', label: 'Edit sequence works' },
      { id: 'seq-steps', label: 'Add/remove steps works' },
      { id: 'seq-merge', label: 'Merge field picker inserts fields' },
      { id: 'seq-delay', label: 'Delay settings save' },
      { id: 'seq-default', label: 'Default sequence toggle works' },
      { id: 'seq-delete', label: 'Delete sequence works (with confirmation)' },
    ],
  },
  {
    id: 'inbox',
    title: 'Inbox',
    icon: <MessageSquare className="h-4 w-4" />,
    items: [
      { id: 'inbox-list', label: 'Conversation list loads', critical: true },
      { id: 'inbox-unread', label: 'Unread count shows correctly' },
      { id: 'inbox-detail', label: 'Conversation detail loads messages' },
      { id: 'inbox-reply', label: 'Reply sends successfully', critical: true },
      { id: 'inbox-inbound', label: 'Inbound SMS appears in real-time' },
      { id: 'inbox-read', label: 'Mark as read works' },
      { id: 'inbox-quick', label: 'Quick replies work' },
    ],
  },
  {
    id: 'customers',
    title: 'Customers',
    icon: <Users className="h-4 w-4" />,
    items: [
      { id: 'cust-list', label: 'Customer list loads' },
      { id: 'cust-search', label: 'Search works' },
      { id: 'cust-filter', label: 'Type filter works' },
      { id: 'cust-detail', label: 'Customer detail modal opens' },
      { id: 'cust-edit', label: 'Edit customer works' },
      { id: 'cust-health', label: 'Health score displays' },
      { id: 'cust-history', label: 'Job history shows' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    items: [
      { id: 'set-profile', label: 'Business info updates' },
      { id: 'set-phone-display', label: 'Phone: Current number displays' },
      { id: 'set-phone-search', label: 'Phone: Can search for new numbers' },
      { id: 'set-phone-purchase', label: 'Phone: Can purchase number', critical: true },
      { id: 'set-hours', label: 'Business hours save correctly' },
      { id: 'set-notify', label: 'Notification toggles work' },
      { id: 'set-webhook', label: 'Webhook URL displays and copies' },
      { id: 'set-review-link', label: 'Google review link saves' },
      { id: 'set-review-msg', label: 'Review message saves' },
    ],
  },
  {
    id: 'payments',
    title: 'Stripe Connect & Payments',
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      { id: 'pay-connect', label: 'Stripe Connect button initiates OAuth' },
      { id: 'pay-onboard', label: 'Onboarding completes', critical: true },
      { id: 'pay-status', label: 'Status shows "Connected"' },
      { id: 'pay-balance', label: 'Balance displays' },
      { id: 'pay-dashboard', label: 'Dashboard link works' },
      { id: 'pay-link-create', label: 'Payment link creation works' },
      { id: 'pay-checkout', label: 'Stripe checkout loads' },
      { id: 'pay-test', label: 'Test payment succeeds' },
      { id: 'pay-success', label: 'Quote marked as "Paid" after payment' },
      { id: 'pay-webhook', label: 'Payment webhooks fire correctly' },
    ],
  },
  {
    id: 'billing',
    title: 'Subscription & Billing',
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      { id: 'bill-plan', label: 'Current plan shows', critical: true },
      { id: 'bill-trial', label: 'Trial days remaining shows' },
      { id: 'bill-upgrade', label: 'Upgrade button works' },
      { id: 'bill-checkout', label: 'Stripe checkout loads' },
      { id: 'bill-activate', label: 'Subscription activates after payment', critical: true },
      { id: 'bill-portal', label: 'Billing portal accessible' },
      { id: 'bill-cancel', label: 'Cancel subscription works' },
    ],
  },
  {
    id: 'messaging',
    title: 'Messaging System',
    icon: <MessageSquare className="h-4 w-4" />,
    items: [
      { id: 'msg-out-sms', label: 'Outbound SMS sends', critical: true },
      { id: 'msg-out-schedule', label: 'Scheduled messages send at correct time' },
      { id: 'msg-merge', label: 'Merge fields replace correctly', critical: true },
      { id: 'msg-hours', label: 'Business hours respected' },
      { id: 'msg-in-webhook', label: 'Inbound webhook receives messages', critical: true },
      { id: 'msg-in-save', label: 'Inbound messages save to database' },
      { id: 'msg-in-respond', label: 'Quote marked as "responded"' },
      { id: 'msg-in-pause', label: 'Sequence pauses on response' },
      { id: 'msg-email-send', label: 'Quote notification email sends' },
      { id: 'msg-email-render', label: 'Email renders correctly' },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: <Shield className="h-4 w-4" />,
    items: [
      { id: 'sec-rls', label: 'RLS enabled on all tables', critical: true },
      { id: 'sec-isolation', label: 'User A cannot see User B data', critical: true },
      { id: 'sec-unauth', label: 'Unauthenticated users blocked', critical: true },
      { id: 'sec-jwt', label: 'All Edge Functions verify JWT', critical: true },
      { id: 'sec-rate', label: 'Rate limiting on webhooks' },
      { id: 'sec-input', label: 'Phone/email inputs validated' },
      { id: 'sec-xss', label: 'No XSS in user inputs' },
      { id: 'sec-secrets', label: 'All secrets in Supabase Secrets', critical: true },
      { id: 'sec-no-expose', label: 'No secrets in frontend code', critical: true },
      { id: 'sec-https', label: 'HTTPS everywhere' },
      { id: 'sec-cors', label: 'CORS configured correctly' },
    ],
  },
  {
    id: 'database',
    title: 'Database',
    icon: <Database className="h-4 w-4" />,
    items: [
      { id: 'db-indexes', label: 'Critical indexes created' },
      { id: 'db-triggers', label: 'Updated_at triggers work' },
      { id: 'db-cascade', label: 'Cascade deletes work correctly' },
      { id: 'db-backup', label: 'Backup strategy configured' },
      { id: 'db-performance', label: 'Query performance acceptable' },
    ],
  },
  {
    id: 'email',
    title: 'Email Deliverability',
    icon: <Mail className="h-4 w-4" />,
    items: [
      { id: 'email-provider', label: 'Email provider configured (Resend)', critical: true },
      { id: 'email-domain', label: 'Sending domain verified' },
      { id: 'email-spf', label: 'SPF record configured' },
      { id: 'email-dkim', label: 'DKIM record configured' },
      { id: 'email-test', label: 'Test emails arrive in inbox (not spam)' },
      { id: 'email-template', label: 'Email templates render correctly' },
    ],
  },
  {
    id: 'go-live',
    title: 'Go-Live Procedures',
    icon: <Rocket className="h-4 w-4" />,
    items: [
      { id: 'live-domain', label: 'Custom domain configured' },
      { id: 'live-ssl', label: 'SSL certificate active' },
      { id: 'live-stripe', label: 'Stripe in live mode', critical: true },
      { id: 'live-twilio', label: 'Twilio in production', critical: true },
      { id: 'live-resend', label: 'Resend in production' },
      { id: 'live-monitoring', label: 'Error monitoring configured' },
      { id: 'live-analytics', label: 'Analytics configured' },
      { id: 'live-terms', label: 'Terms of Service page' },
      { id: 'live-privacy', label: 'Privacy Policy page' },
      { id: 'live-support', label: 'Support email configured' },
    ],
  },
];

const STORAGE_KEY = 'selestial-launch-checklist';

export default function LaunchChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    if (confirm('Reset all checklist items? This cannot be undone.')) {
      setCheckedItems({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Calculate stats
  const totalItems = CHECKLIST_SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = Math.round((checkedCount / totalItems) * 100);

  const criticalItems = CHECKLIST_SECTIONS.flatMap((s) =>
    s.items.filter((i) => i.critical)
  );
  const criticalChecked = criticalItems.filter((i) => checkedItems[i.id]).length;
  const criticalProgress = Math.round((criticalChecked / criticalItems.length) * 100);

  const getSectionProgress = (section: ChecklistSection) => {
    const checked = section.items.filter((i) => checkedItems[i.id]).length;
    return { checked, total: section.items.length };
  };

  return (
    <Layout title="Launch Checklist">
      <div className="max-w-4xl space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Overall Progress</h3>
              <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                {checkedCount} / {totalItems}
              </Badge>
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </Card>

          <Card className="p-6 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h3 className="font-semibold">Critical Items</h3>
              </div>
              <Badge variant={criticalProgress === 100 ? 'default' : 'destructive'}>
                {criticalChecked} / {criticalItems.length}
              </Badge>
            </div>
            <Progress
              value={criticalProgress}
              className="h-3 mb-2"
            />
            <p className="text-sm text-muted-foreground">
              {criticalProgress === 100
                ? 'All critical items verified!'
                : `${criticalItems.length - criticalChecked} critical items remaining`}
            </p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={resetChecklist} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset Checklist
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open('https://supabase.com/dashboard/project/vbmahppxoffjovtuflkh', '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Supabase Dashboard
          </Button>
        </div>

        {/* Checklist Sections */}
        <Card>
          <ScrollArea className="h-[calc(100vh-400px)]">
            <Accordion type="multiple" className="w-full" defaultValue={['auth', 'security']}>
              {CHECKLIST_SECTIONS.map((section) => {
                const { checked, total } = getSectionProgress(section);
                const isComplete = checked === total;

                return (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="px-6 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isComplete
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {section.icon}
                          </div>
                          <span className="font-medium">{section.title}</span>
                        </div>
                        <Badge variant={isComplete ? 'default' : 'secondary'}>
                          {checked} / {total}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="space-y-3 pt-2">
                        {section.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => toggleItem(item.id)}
                          >
                            <Checkbox
                              id={item.id}
                              checked={checkedItems[item.id] || false}
                              onCheckedChange={() => toggleItem(item.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={item.id}
                                  className={`text-sm cursor-pointer ${
                                    checkedItems[item.id]
                                      ? 'text-muted-foreground line-through'
                                      : ''
                                  }`}
                                >
                                  {item.label}
                                </label>
                                {item.critical && (
                                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                    Critical
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {checkedItems[item.id] ? (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </Card>
      </div>
    </Layout>
  );
}
