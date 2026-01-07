"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ThumbsUp, 
  Loader2, 
  Check, 
  ExternalLink,
  Info,
} from 'lucide-react';

export default function ReviewSettings() {
  const { business, refetch } = useBusiness();
  
  const [googleLink, setGoogleLink] = useState('');
  const [yelpLink, setYelpLink] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [defaultPlatform, setDefaultPlatform] = useState('google');
  const [autoRequest, setAutoRequest] = useState(true);
  const [delayDays, setDelayDays] = useState('1');
  const [message, setMessage] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (business) {
      setGoogleLink((business as any).google_review_link || '');
      setYelpLink((business as any).yelp_review_link || '');
      setFacebookLink((business as any).facebook_review_link || '');
      setDefaultPlatform((business as any).default_review_platform || 'google');
      setAutoRequest((business as any).auto_request_reviews ?? true);
      setDelayDays(String((business as any).review_request_delay_days || 1));
      setMessage((business as any).review_request_message || getDefaultMessage());
    }
  }, [business]);

  const getDefaultMessage = () => {
    return "Hi {{customer_first_name}}, thank you for choosing {{business_name}}! If you were happy with our service, we'd really appreciate a quick review: {{review_link}} - {{owner_first_name}}";
  };

  const handleSave = async () => {
    if (!business) return;

    setSaving(true);
    setSaved(false);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          google_review_link: googleLink || null,
          yelp_review_link: yelpLink || null,
          facebook_review_link: facebookLink || null,
          default_review_platform: defaultPlatform,
          auto_request_reviews: autoRequest,
          review_request_delay_days: parseInt(delayDays),
          review_request_message: message,
        })
        .eq('id', business.id);

      if (error) throw error;

      await refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success('Review settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const mergeFields = [
    '{{customer_first_name}}',
    '{{customer_name}}',
    '{{business_name}}',
    '{{owner_first_name}}',
    '{{review_link}}',
  ];

  return (
    <Card className="card-elevated rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100">
            <ThumbsUp className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Review Requests</CardTitle>
            <p className="text-sm text-gray-500">Collect customer reviews automatically</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Auto-request
          </span>
          <Switch
            checked={autoRequest}
            onCheckedChange={setAutoRequest}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Review Links */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Review Platform Links</p>
          
          {/* Google */}
          <Field name="google_link">
            <FieldLabel className="flex items-center gap-2">
              🔍 Google Review Link
            </FieldLabel>
            <Input
              value={googleLink}
              onChange={(e) => setGoogleLink(e.target.value)}
              placeholder="https://g.page/r/YOUR_REVIEW_LINK"
              className="rounded-xl"
            />
            <a 
              href="https://support.google.com/business/answer/7035772"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              How to get your Google review link
              <ExternalLink className="h-3 w-3" />
            </a>
          </Field>

          {/* Yelp */}
          <Field name="yelp_link">
            <FieldLabel className="flex items-center gap-2">
              ⭐ Yelp Review Link
            </FieldLabel>
            <Input
              value={yelpLink}
              onChange={(e) => setYelpLink(e.target.value)}
              placeholder="https://www.yelp.com/writeareview/biz/YOUR_BIZ_ID"
              className="rounded-xl"
            />
          </Field>

          {/* Facebook */}
          <Field name="facebook_link">
            <FieldLabel className="flex items-center gap-2">
              📘 Facebook Review Link
            </FieldLabel>
            <Input
              value={facebookLink}
              onChange={(e) => setFacebookLink(e.target.value)}
              placeholder="https://www.facebook.com/YOUR_PAGE/reviews"
              className="rounded-xl"
            />
          </Field>
        </div>

        {/* Default Platform */}
        <Field name="platform">
          <FieldLabel>Default Platform</FieldLabel>
          <Select value={defaultPlatform} onValueChange={setDefaultPlatform}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="yelp">Yelp</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>Primary platform for review requests</FieldDescription>
        </Field>

        {/* Delay */}
        <Field name="delay">
          <FieldLabel>Send request after job completion</FieldLabel>
          <Select value={delayDays} onValueChange={setDelayDays}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Immediately</SelectItem>
              <SelectItem value="1">1 day later</SelectItem>
              <SelectItem value="2">2 days later</SelectItem>
              <SelectItem value="3">3 days later</SelectItem>
              <SelectItem value="7">1 week later</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>Gives customers time to experience your service</FieldDescription>
        </Field>

        {/* Message */}
        <Field name="message">
          <FieldLabel>Review Request Message</FieldLabel>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Hi {{customer_first_name}}, thanks for choosing us..."
            className="rounded-xl resize-none"
          />
          <FieldDescription>
            {message.length}/160 characters
          </FieldDescription>
        </Field>

        {/* Merge Fields */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Available Merge Fields</p>
              <div className="flex flex-wrap gap-2">
                {mergeFields.map((field) => (
                  <button
                    key={field}
                    onClick={() => {
                      setMessage(message + field);
                      toast.success('Field added to message');
                    }}
                    className="text-xs px-2.5 py-1.5 bg-white text-gray-700 rounded-lg font-mono border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
