"use client";

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon';
import { useBusiness } from '@/providers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface EmailSettings {
  // Sender Settings
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  
  // White-label Domain
  customDomain: string;
  domainVerified: boolean;
  
  // Email Branding
  logoUrl: string;
  headerColor: string;
  accentColor: string;
  footerText: string;
  
  // Email Preferences
  sendBookingConfirmations: boolean;
  sendBookingReminders: boolean;
  sendPaymentReceipts: boolean;
  sendFollowUpEmails: boolean;
  sendReviewRequests: boolean;
  
  // Reminder Settings
  reminderHoursBefore: number;
  reminderDaysBefore: number;
  
  // Social Links
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: 'booking_confirmation' | 'booking_reminder' | 'payment_receipt' | 'review_request' | 'follow_up' | 'custom';
  subject: string;
  body: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: EmailSettings = {
  fromName: '',
  fromEmail: '',
  replyToEmail: '',
  customDomain: '',
  domainVerified: false,
  logoUrl: '',
  headerColor: '#7c3aed',
  accentColor: '#10b981',
  footerText: '',
  sendBookingConfirmations: true,
  sendBookingReminders: true,
  sendPaymentReceipts: true,
  sendFollowUpEmails: true,
  sendReviewRequests: true,
  reminderHoursBefore: 24,
  reminderDaysBefore: 1,
  websiteUrl: '',
  facebookUrl: '',
  instagramUrl: '',
};

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    name: 'Booking Confirmation',
    type: 'booking_confirmation',
    subject: 'Your booking is confirmed - {{booking_number}}',
    body: `Hi {{customer_name}},

Your booking has been confirmed!

**Booking Details:**
- Service: {{service_name}}
- Date: {{booking_date}}
- Time: {{booking_time}}
- Address: {{address}}

**Total: {{total_price}}**

If you need to make any changes, please contact us at {{business_phone}} or reply to this email.

Thank you for choosing {{business_name}}!

Best regards,
{{business_name}}`,
    enabled: true,
  },
  {
    id: '2',
    name: 'Booking Reminder',
    type: 'booking_reminder',
    subject: 'Reminder: Your appointment is tomorrow',
    body: `Hi {{customer_name}},

Just a friendly reminder that your appointment is scheduled for tomorrow!

**Appointment Details:**
- Service: {{service_name}}
- Date: {{booking_date}}
- Time: {{booking_time}}
- Address: {{address}}

Please ensure someone is home to let our team in. If you need to reschedule, please contact us as soon as possible.

See you soon!

{{business_name}}`,
    enabled: true,
  },
  {
    id: '3',
    name: 'Payment Receipt',
    type: 'payment_receipt',
    subject: 'Payment received - Receipt #{{receipt_number}}',
    body: `Hi {{customer_name}},

Thank you for your payment!

**Payment Details:**
- Amount: {{amount}}
- Date: {{payment_date}}
- Receipt #: {{receipt_number}}
- Payment Method: {{payment_method}}

**Service:**
- {{service_name}}
- {{booking_date}} at {{booking_time}}

Thank you for your business!

{{business_name}}`,
    enabled: true,
  },
  {
    id: '4',
    name: 'Review Request',
    type: 'review_request',
    subject: 'How did we do? Leave a review',
    body: `Hi {{customer_name}},

Thank you for choosing {{business_name}}! We hope you were satisfied with your recent service.

We'd love to hear your feedback! A quick review helps us improve and helps other customers find us.

**Leave a Review:**
[Review Link]

Thank you for your support!

{{business_name}}`,
    enabled: true,
  },
  {
    id: '5',
    name: 'Follow-Up',
    type: 'follow_up',
    subject: 'Ready for your next service?',
    body: `Hi {{customer_name}},

It's been a while since your last service with {{business_name}}. We wanted to check in and see if you're ready to schedule your next appointment!

**Your Last Service:**
- {{last_service_name}}
- {{last_service_date}}

[Book Now Button]

We look forward to seeing you again!

{{business_name}}`,
    enabled: true,
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function DomainVerification({ settings, onVerify }: { settings: EmailSettings; onVerify: () => void }) {
  const [verifying, setVerifying] = useState(false);
  
  const handleVerify = async () => {
    setVerifying(true);
    // Simulate verification
    await new Promise(r => setTimeout(r, 2000));
    setVerifying(false);
    onVerify();
  };
  
  if (!settings.customDomain) {
    return (
      <Alert>
        <Icon name="info" size="lg" className="text-blue-500" />
        <AlertTitle>No Custom Domain</AlertTitle>
        <AlertDescription>
          Enter a custom domain above to send emails from your own branded address (e.g., bookings@yourbusiness.com).
          Without a custom domain, emails will be sent from noreply@mail.selestial.io
        </AlertDescription>
      </Alert>
    );
  }
  
  if (settings.domainVerified) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <Icon name="checkCircle" size="lg" className="text-green-600" />
        <AlertTitle className="text-green-800">Domain Verified</AlertTitle>
        <AlertDescription className="text-green-700">
          Your domain {settings.customDomain} is verified and ready to use.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <Alert className="border-yellow-500 bg-yellow-50">
        <Icon name="alertTriangle" size="lg" className="text-yellow-600" />
        <AlertTitle className="text-yellow-800">Domain Verification Required</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Add these DNS records to verify ownership of {settings.customDomain}
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="text-sm">
            <p className="font-medium mb-2">Add these TXT records to your DNS:</p>
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 rounded font-mono text-xs">
                <p><span className="text-gray-500">Type:</span> TXT</p>
                <p><span className="text-gray-500">Host:</span> @</p>
                <p><span className="text-gray-500">Value:</span> selestial-verify=abc123xyz</p>
              </div>
              <div className="p-3 bg-gray-100 rounded font-mono text-xs">
                <p><span className="text-gray-500">Type:</span> CNAME</p>
                <p><span className="text-gray-500">Host:</span> mail</p>
                <p><span className="text-gray-500">Value:</span> mail.selestial.io</p>
              </div>
            </div>
          </div>
          
          <Button onClick={handleVerify} disabled={verifying}>
            {verifying ? (
              <>
                <Icon name="loader" size="sm" className="mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Icon name="checkCircle" size="sm" className="mr-2" />
                Verify Domain
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function EmailPreview({ settings }: { settings: EmailSettings }) {
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon name="eye" size="sm" />
          Email Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border rounded-lg mx-4 mb-4 overflow-hidden">
          {/* Email Header */}
          <div 
            className="p-4 text-white"
            style={{ backgroundColor: settings.headerColor }}
          >
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover bg-white p-1" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon name="image" size="lg" className="text-white/70" />
                </div>
              )}
              <div>
                <p className="font-semibold">{settings.fromName || 'Your Business'}</p>
                <p className="text-xs opacity-80">
                  {settings.fromEmail || 'noreply@mail.selestial.io'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Email Body Preview */}
          <div className="p-4 text-sm">
            <p className="font-medium mb-2">Subject: Your booking is confirmed</p>
            <div className="text-gray-600 text-xs space-y-2">
              <p>Hi John,</p>
              <p>Your booking has been confirmed!</p>
              <p className="font-medium" style={{ color: settings.accentColor }}>
                ✓ Standard Clean - Jan 15, 2026 at 9:00 AM
              </p>
              <p className="text-gray-500">Thank you for choosing us!</p>
            </div>
          </div>
          
          {/* Email Footer */}
          <div className="p-3 bg-gray-50 border-t text-center text-xs text-gray-500">
            {settings.footerText || '© 2026 Your Business. All rights reserved.'}
            {(settings.websiteUrl || settings.facebookUrl || settings.instagramUrl) && (
              <div className="flex justify-center gap-3 mt-2">
                {settings.websiteUrl && <Icon name="globe" size="sm" className="text-gray-400" />}
                {settings.facebookUrl && <Icon name="facebook" size="sm" className="text-gray-400" />}
                {settings.instagramUrl && <Icon name="instagram" size="sm" className="text-gray-400" />}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateEditor({ 
  template, 
  onSave 
}: { 
  template: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localTemplate, setLocalTemplate] = useState(template);
  
  const handleSave = () => {
    onSave(localTemplate);
    setEditing(false);
    toast.success('Template saved');
  };
  
  const availableVariables = [
    '{{customer_name}}', '{{customer_email}}', '{{customer_phone}}',
    '{{business_name}}', '{{business_phone}}', '{{business_email}}',
    '{{booking_number}}', '{{service_name}}', '{{booking_date}}', '{{booking_time}}',
    '{{address}}', '{{total_price}}', '{{deposit_amount}}',
    '{{receipt_number}}', '{{payment_date}}', '{{payment_method}}', '{{amount}}',
  ];
  
  return (
    <Card className={cn(!template.enabled && 'opacity-60')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={localTemplate.enabled}
              onCheckedChange={(enabled) => {
                const updated = { ...localTemplate, enabled };
                setLocalTemplate(updated);
                onSave(updated);
              }}
            />
            <div>
              <CardTitle className="text-sm">{template.name}</CardTitle>
              <p className="text-xs text-muted-foreground capitalize">{template.type.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <Button 
            variant={editing ? "default" : "outline"} 
            size="sm"
            onClick={() => editing ? handleSave() : setEditing(true)}
          >
            {editing ? (
              <><Icon name="check" size="xs" className="mr-1" />Save</>
            ) : (
              <><Icon name="edit" size="xs" className="mr-1" />Edit</>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {editing && (
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Subject Line</Label>
            <Input
              value={localTemplate.subject}
              onChange={(e) => setLocalTemplate({ ...localTemplate, subject: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-xs">Email Body</Label>
            <Textarea
              value={localTemplate.body}
              onChange={(e) => setLocalTemplate({ ...localTemplate, body: e.target.value })}
              className="mt-1 font-mono text-xs min-h-[200px]"
            />
          </div>
          
          <div>
            <Label className="text-xs mb-2 block">Available Variables</Label>
            <div className="flex flex-wrap gap-1">
              {availableVariables.map((v) => (
                <Badge
                  key={v}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-primary/10"
                  onClick={() => {
                    setLocalTemplate({
                      ...localTemplate,
                      body: localTemplate.body + ' ' + v
                    });
                  }}
                >
                  {v}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function EmailSettingsPage() {
  const { business } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<EmailSettings>(DEFAULT_SETTINGS);
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTab, setActiveTab] = useState('sender');
  
  // Load settings
  useEffect(() => {
    if (!business?.id) {
      setLoading(false);
      return;
    }
    
    // Initialize with business defaults
    setSettings({
      ...DEFAULT_SETTINGS,
      fromName: business.name || '',
      fromEmail: business.email || '',
      replyToEmail: business.email || '',
    });
    setLoading(false);
  }, [business]);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // API call would go here
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Email settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };
  
  const handleTemplateUpdate = (updatedTemplate: EmailTemplate) => {
    setTemplates(templates.map(t => 
      t.id === updatedTemplate.id ? updatedTemplate : t
    ));
  };
  
  if (loading) {
    return (
      <Layout title="Email Settings">
        <div className="flex items-center justify-center min-h-96">
          <Icon name="loader" size="xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Email Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
              <Icon name="email" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Email Settings</h1>
              <p className="text-muted-foreground">Configure email communications and templates</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Icon name="loader" size="sm" className="mr-2 animate-spin" />Saving...</>
            ) : (
              <><Icon name="save" size="sm" className="mr-2" />Save Changes</>
            )}
          </Button>
        </div>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="sender">Sender</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
              </TabsList>
              
              {/* SENDER TAB */}
              <TabsContent value="sender" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sender Information</CardTitle>
                    <CardDescription>Configure how your emails appear to recipients</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>From Name</Label>
                        <Input
                          value={settings.fromName}
                          onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                          placeholder="Your Business Name"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This name appears in the "From" field
                        </p>
                      </div>
                      <div>
                        <Label>Reply-To Email</Label>
                        <Input
                          value={settings.replyToEmail}
                          onChange={(e) => setSettings({ ...settings, replyToEmail: e.target.value })}
                          placeholder="hello@yourbusiness.com"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Replies will be sent to this address
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Sending Domain</CardTitle>
                    <CardDescription>
                      Send emails from your own domain (e.g., bookings@yourbusiness.com)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Custom Domain</Label>
                      <Input
                        value={settings.customDomain}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          customDomain: e.target.value,
                          domainVerified: false
                        })}
                        placeholder="yourbusiness.com"
                        className="mt-1"
                      />
                    </div>
                    
                    <DomainVerification 
                      settings={settings}
                      onVerify={() => setSettings({ ...settings, domainVerified: true })}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* BRANDING TAB */}
              <TabsContent value="branding" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Branding</CardTitle>
                    <CardDescription>Customize the look of your emails</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Logo URL</Label>
                      <Input
                        value={settings.logoUrl}
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Header Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={settings.headerColor}
                            onChange={(e) => setSettings({ ...settings, headerColor: e.target.value })}
                            className="w-14 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={settings.headerColor}
                            onChange={(e) => setSettings({ ...settings, headerColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Accent Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={settings.accentColor}
                            onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                            className="w-14 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={settings.accentColor}
                            onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Footer Text</Label>
                      <Input
                        value={settings.footerText}
                        onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                        placeholder="© 2026 Your Business. All rights reserved."
                        className="mt-1"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Website URL</Label>
                        <Input
                          value={settings.websiteUrl}
                          onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Facebook URL</Label>
                        <Input
                          value={settings.facebookUrl}
                          onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Instagram URL</Label>
                        <Input
                          value={settings.instagramUrl}
                          onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* TEMPLATES TAB */}
              <TabsContent value="templates" className="space-y-4 mt-6">
                {templates.map(template => (
                  <TemplateEditor
                    key={template.id}
                    template={template}
                    onSave={handleTemplateUpdate}
                  />
                ))}
              </TabsContent>
              
              {/* AUTOMATION TAB */}
              <TabsContent value="automation" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Automatic Emails</CardTitle>
                    <CardDescription>Configure which emails are sent automatically</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'sendBookingConfirmations', label: 'Booking Confirmations', desc: 'Send when a booking is confirmed' },
                      { key: 'sendBookingReminders', label: 'Booking Reminders', desc: 'Send reminders before appointments' },
                      { key: 'sendPaymentReceipts', label: 'Payment Receipts', desc: 'Send receipts after payments' },
                      { key: 'sendFollowUpEmails', label: 'Follow-Up Emails', desc: 'Send follow-ups after services' },
                      { key: 'sendReviewRequests', label: 'Review Requests', desc: 'Request reviews after completed jobs' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={settings[item.key as keyof EmailSettings] as boolean}
                          onCheckedChange={(checked) => setSettings({ 
                            ...settings, 
                            [item.key]: checked 
                          })}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Reminder Timing</CardTitle>
                    <CardDescription>When to send booking reminders</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Hours Before Appointment</Label>
                        <Select
                          value={String(settings.reminderHoursBefore)}
                          onValueChange={(v) => setSettings({ ...settings, reminderHoursBefore: Number(v) })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 hours</SelectItem>
                            <SelectItem value="4">4 hours</SelectItem>
                            <SelectItem value="12">12 hours</SelectItem>
                            <SelectItem value="24">24 hours</SelectItem>
                            <SelectItem value="48">48 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Days Before Appointment</Label>
                        <Select
                          value={String(settings.reminderDaysBefore)}
                          onValueChange={(v) => setSettings({ ...settings, reminderDaysBefore: Number(v) })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 day</SelectItem>
                            <SelectItem value="2">2 days</SelectItem>
                            <SelectItem value="3">3 days</SelectItem>
                            <SelectItem value="7">1 week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <EmailPreview settings={settings} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
