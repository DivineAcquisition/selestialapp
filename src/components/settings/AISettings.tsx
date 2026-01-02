import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Sparkles,
  Save,
  Loader2,
  MessageSquare,
  Zap,
  Settings2,
} from 'lucide-react';

interface AISettingsData {
  smart_replies_enabled: boolean;
  tone: string;
  emoji_usage: string;
  response_length: string;
  include_pricing: boolean;
  suggest_upsells: boolean;
  custom_instructions: string;
  monthly_suggestion_limit: number;
  suggestions_used_this_month: number;
}

export default function AISettings() {
  const { business } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AISettingsData>({
    smart_replies_enabled: true,
    tone: 'friendly',
    emoji_usage: 'moderate',
    response_length: 'concise',
    include_pricing: true,
    suggest_upsells: true,
    custom_instructions: '',
    monthly_suggestion_limit: 500,
    suggestions_used_this_month: 0,
  });

  useEffect(() => {
    if (business) {
      fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('business_id', business!.id)
        .single();

      if (data) {
        setSettings({
          smart_replies_enabled: data.smart_replies_enabled,
          tone: data.tone,
          emoji_usage: data.emoji_usage,
          response_length: data.response_length,
          include_pricing: data.include_pricing,
          suggest_upsells: data.suggest_upsells,
          custom_instructions: data.custom_instructions || '',
          monthly_suggestion_limit: data.monthly_suggestion_limit,
          suggestions_used_this_month: data.suggestions_used_this_month,
        });
      }
      // If no settings exist, use defaults (already set in initial state)
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching AI settings:', error);
      }
    } catch (err) {
      console.error('Failed to fetch AI settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_settings')
        .upsert({
          business_id: business!.id,
          smart_replies_enabled: settings.smart_replies_enabled,
          tone: settings.tone,
          emoji_usage: settings.emoji_usage,
          response_length: settings.response_length,
          include_pricing: settings.include_pricing,
          suggest_upsells: settings.suggest_upsells,
          custom_instructions: settings.custom_instructions || null,
        });

      if (error) throw error;
      toast({ title: 'AI settings saved!' });
    } catch (err) {
      console.error('Failed to save AI settings:', err);
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const usagePercent = (settings.suggestions_used_this_month / settings.monthly_suggestion_limit) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Smart Replies</h3>
            <p className="text-sm text-muted-foreground">Usage this month</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {settings.suggestions_used_this_month} / {settings.monthly_suggestion_limit} suggestions
            </span>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {Math.round(usagePercent)}%
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>
        
        {usagePercent > 80 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
            ⚠️ Running low on AI suggestions. Consider upgrading for unlimited access.
          </p>
        )}
      </Card>

      {/* Enable/Disable */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Smart Replies</h3>
              <p className="text-sm text-muted-foreground">Show AI suggestions in your inbox</p>
            </div>
          </div>
          <Switch
            checked={settings.smart_replies_enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, smart_replies_enabled: checked })}
          />
        </div>
      </Card>

      {/* Tone Settings */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Response Style</h3>
            <p className="text-sm text-muted-foreground">Customize how AI writes replies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select 
              value={settings.tone} 
              onValueChange={(v) => setSettings({ ...settings, tone: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">😊 Friendly</SelectItem>
                <SelectItem value="professional">💼 Professional</SelectItem>
                <SelectItem value="casual">🤙 Casual</SelectItem>
                <SelectItem value="formal">📋 Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Emoji Usage</Label>
            <Select 
              value={settings.emoji_usage} 
              onValueChange={(v) => setSettings({ ...settings, emoji_usage: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="minimal">Minimal (1-2)</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="heavy">Heavy 🎉✨🔥</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Response Length</Label>
            <Select 
              value={settings.response_length} 
              onValueChange={(v) => setSettings({ ...settings, response_length: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief (&lt;100 chars)</SelectItem>
                <SelectItem value="concise">Concise (~150 chars)</SelectItem>
                <SelectItem value="detailed">Detailed (~250 chars)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Include Pricing</p>
              <p className="text-sm text-muted-foreground">AI will mention prices when relevant</p>
            </div>
            <Switch
              checked={settings.include_pricing}
              onCheckedChange={(checked) => setSettings({ ...settings, include_pricing: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Suggest Upsells</p>
              <p className="text-sm text-muted-foreground">AI will suggest add-on services</p>
            </div>
            <Switch
              checked={settings.suggest_upsells}
              onCheckedChange={(checked) => setSettings({ ...settings, suggest_upsells: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Custom Instructions */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <Settings2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Custom Instructions</h3>
            <p className="text-sm text-muted-foreground">Tell AI anything special about your business</p>
          </div>
        </div>

        <Textarea
          value={settings.custom_instructions}
          onChange={(e) => setSettings({ ...settings, custom_instructions: e.target.value })}
          placeholder={`Examples:
- Always mention our 100% satisfaction guarantee
- We offer 10% off for first-time customers
- Our deep cleans include inside the fridge
- Don't offer discounts unless they ask`}
          rows={5}
        />
        <p className="text-xs text-muted-foreground mt-2">
          {settings.custom_instructions.length}/500 characters
        </p>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save AI Settings
        </Button>
      </div>
    </div>
  );
}
