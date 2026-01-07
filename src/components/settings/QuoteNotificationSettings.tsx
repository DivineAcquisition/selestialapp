"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Icon } from '@/components/ui/icon';

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
    <Card className="card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Icon name="send" size="lg" className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Quote Notifications</h3>
          <p className="text-sm text-gray-500">
            Automatically notify customers when you create a quote
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Icon name="email" size="lg" className="text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Send Email</p>
                <p className="text-sm text-gray-500">Branded quote email</p>
              </div>
            </div>
            <Switch checked={sendEmail} onCheckedChange={setSendEmail} className="data-[state=checked]:bg-primary" />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Icon name="message" size="lg" className="text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Send SMS</p>
                <p className="text-sm text-gray-500">Quick text notification</p>
              </div>
            </div>
            <Switch checked={sendSms} onCheckedChange={setSendSms} className="data-[state=checked]:bg-primary" />
          </div>
        </div>

        {/* Company Logo */}
        <Field name="logo">
          <FieldLabel className="flex items-center gap-2">
            <Icon name="image" size="md" className="text-gray-400" />
            Company Logo
          </FieldLabel>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Icon name="close" size="xs" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                <Icon name="image" size="xl" className="text-gray-400" />
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
                className="gap-2 rounded-xl"
              >
                {uploading ? (
                  <Icon name="spinner" size="md" className="animate-spin" />
                ) : (
                  <Icon name="upload" size="md" />
                )}
                {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                PNG or JPG, max 2MB. Appears in quote emails.
              </p>
            </div>
          </div>
        </Field>

        {/* Brand Color */}
        <Field name="color">
          <FieldLabel className="flex items-center gap-2">
            <Icon name="palette" size="md" className="text-gray-400" />
            Brand Color
          </FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={companyColor}
              onChange={(e) => setCompanyColor(e.target.value)}
              className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer"
            />
            <Input
              value={companyColor}
              onChange={(e) => setCompanyColor(e.target.value)}
              className="w-32 rounded-xl"
              placeholder="#4F46E5"
            />
          </div>
          <FieldDescription>Used in your email template</FieldDescription>
        </Field>

        {/* Email Subject */}
        {sendEmail && (
          <Field name="subject">
            <FieldLabel>Email Subject</FieldLabel>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Your Quote from {{business_name}}"
              className="rounded-xl"
            />
          </Field>
        )}

        {/* Email Message */}
        {sendEmail && (
          <Field name="emailMessage">
            <FieldLabel>Personal Message in Email</FieldLabel>
            <Textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Add a personal touch to your quote emails..."
              rows={3}
              className="rounded-xl resize-none"
            />
            <FieldDescription>
              This appears as a highlighted message in the email (optional)
            </FieldDescription>
          </Field>
        )}

        {/* SMS Message */}
        {sendSms && (
          <Field name="smsMessage">
            <FieldLabel>SMS Message</FieldLabel>
            <Textarea
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder="Hi {{customer_first_name}}, thanks for requesting a quote..."
              rows={3}
              className="rounded-xl resize-none"
            />
            <FieldDescription>
              {smsMessage.length}/160 characters (1 SMS segment)
            </FieldDescription>
          </Field>
        )}

        {/* Merge Fields Reference */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-2">
            <Icon name="info" size="md" className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-2">Available Merge Fields</p>
              <div className="flex flex-wrap gap-2">
                {mergeFields.map((mf) => (
                  <span
                    key={mf.field}
                    className="text-xs px-2.5 py-1.5 bg-white text-blue-700 rounded-lg font-mono border border-blue-100 cursor-help"
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
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl">
            {saving ? (
              <Icon name="spinner" size="md" className="animate-spin" />
            ) : saved ? (
              <Icon name="check" size="md" />
            ) : null}
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
