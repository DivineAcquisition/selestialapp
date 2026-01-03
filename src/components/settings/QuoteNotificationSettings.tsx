import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Loader2, 
  Check,
  Palette,
  Info,
  Upload,
  Image,
  X
} from 'lucide-react';

export default function QuoteNotificationSettings() {
  const { business, refetch } = useBusiness();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [companyColor, setCompanyColor] = useState('#4F46E5');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (business) {
      setSendEmail(business.send_quote_email ?? true);
      setSendSms(business.send_quote_sms ?? true);
      setEmailSubject(business.quote_email_subject || 'Your Quote from {{business_name}}');
      setEmailMessage(business.quote_email_message || '');
      setSmsMessage(business.quote_sms_message || 'Hi {{customer_first_name}}, thanks for requesting a quote from {{business_name}}! We\'ve sent the details to your email. Questions? Reply here or call {{business_phone}}. - {{owner_first_name}}');
      setCompanyColor(business.company_color || '#4F46E5');
      setLogoUrl(business.company_logo_url || null);
    }
  }, [business]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${business.id}/logo.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      // Update business record
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ company_logo_url: publicUrl })
        .eq('id', business.id);

      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      await refetch();

      toast({
        title: 'Logo uploaded',
        description: 'Your company logo will now appear in quote emails',
      });
    } catch (err) {
      console.error('Logo upload error:', err);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload logo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!business) return;

    try {
      // Remove from storage
      const fileName = `${business.id}/logo`;
      await supabase.storage
        .from('company-logos')
        .remove([`${fileName}.png`, `${fileName}.jpg`, `${fileName}.jpeg`, `${fileName}.webp`]);

      // Update business record
      await supabase
        .from('businesses')
        .update({ company_logo_url: null })
        .eq('id', business.id);

      setLogoUrl(null);
      await refetch();

      toast({
        title: 'Logo removed',
        description: 'Your company logo has been removed',
      });
    } catch (err) {
      console.error('Logo remove error:', err);
    }
  };

  const handleSave = async () => {
    if (!business) return;

    setSaving(true);
    setSaved(false);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          send_quote_email: sendEmail,
          send_quote_sms: sendSms,
          quote_email_subject: emailSubject,
          quote_email_message: emailMessage || null,
          quote_sms_message: smsMessage,
          company_color: companyColor,
        })
        .eq('id', business.id);

      if (error) throw error;

      await refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const mergeFields = [
    { field: '{{customer_name}}', desc: 'Full name' },
    { field: '{{customer_first_name}}', desc: 'First name' },
    { field: '{{business_name}}', desc: 'Your company' },
    { field: '{{owner_name}}', desc: 'Your name' },
    { field: '{{owner_first_name}}', desc: 'Your first name' },
    { field: '{{quote_amount}}', desc: 'Quote $' },
    { field: '{{service_type}}', desc: 'Service' },
    { field: '{{business_phone}}', desc: 'Your phone' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Send className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Quote Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Automatically notify customers when you create a quote
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Send Email</p>
                <p className="text-sm text-muted-foreground">Branded quote email</p>
              </div>
            </div>
            <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Send SMS</p>
                <p className="text-sm text-muted-foreground">Quick text notification</p>
              </div>
            </div>
            <Switch checked={sendSms} onCheckedChange={setSendSms} />
          </div>
        </div>

        {/* Company Logo */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Company Logo
          </Label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="w-16 h-16 rounded-lg object-cover border border-border"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                <Image className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                PNG or JPG, max 2MB. Appears in quote emails.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Color */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Brand Color
          </Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={companyColor}
              onChange={(e) => setCompanyColor(e.target.value)}
              className="w-12 h-10 rounded-lg border border-border cursor-pointer"
            />
            <Input
              value={companyColor}
              onChange={(e) => setCompanyColor(e.target.value)}
              className="w-32"
              placeholder="#4F46E5"
            />
            <span className="text-sm text-muted-foreground">Used in email template</span>
          </div>
        </div>

        {/* Email Subject */}
        {sendEmail && (
          <div className="space-y-2">
            <Label htmlFor="emailSubject">Email Subject</Label>
            <Input
              id="emailSubject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Your Quote from {{business_name}}"
            />
          </div>
        )}

        {/* Email Message */}
        {sendEmail && (
          <div className="space-y-2">
            <Label htmlFor="emailMessage">
              Personal Message in Email (optional)
            </Label>
            <Textarea
              id="emailMessage"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Add a personal touch to your quote emails..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This appears as a highlighted message in the email
            </p>
          </div>
        )}

        {/* SMS Message */}
        {sendSms && (
          <div className="space-y-2">
            <Label htmlFor="smsMessage">SMS Message</Label>
            <Textarea
              id="smsMessage"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder="Hi {{customer_first_name}}, thanks for requesting a quote..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {smsMessage.length}/160 characters (1 SMS segment)
            </p>
          </div>
        )}

        {/* Merge Fields Reference */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Available Merge Fields</p>
              <div className="flex flex-wrap gap-2">
                {mergeFields.map((mf) => (
                  <span
                    key={mf.field}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-mono"
                    title={mf.desc}
                  >
                    {mf.field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
