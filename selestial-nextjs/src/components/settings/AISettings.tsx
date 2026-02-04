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
import { useAISettings } from '@/hooks/useAISettings';
import {
  Sparkles,
  Save,
  Loader2,
  MessageSquare,
  Settings2,
} from 'lucide-react';

export default function AISettings() {
  const { settings, loading, saving, updateSettings, usagePercent } = useAISettings();

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
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">AI Smart Replies</h3>
            <p className="text-sm text-muted-foreground mb-3">Usage this month</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">
                  {settings.suggestions_used_this_month} / {settings.monthly_suggestion_limit} suggestions
                </span>
                <span className="text-muted-foreground">
                  {Math.round(usagePercent)}%
                </span>
              </div>
              <Progress value={usagePercent} className="h-2" />
            </div>
            
            {usagePercent > 80 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
                ⚠️ Running low on AI suggestions.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Enable/Disable */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Smart Replies</h4>
              <p className="text-sm text-muted-foreground">
                Show AI suggestions in your inbox
              </p>
            </div>
          </div>
          <Switch
            checked={settings.smart_replies_enabled}
            onCheckedChange={(checked) => updateSettings({ smart_replies_enabled: checked })}
          />
        </div>
      </Card>

      {/* Tone Settings */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Response Style</h4>
            <p className="text-sm text-muted-foreground">
              Customize how AI writes replies
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select
              value={settings.tone}
              onValueChange={(v) => updateSettings({ tone: v })}
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
              onValueChange={(v) => updateSettings({ emoji_usage: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="minimal">Minimal (1-2)</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="heavy">Heavy 🎉✨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Response Length</Label>
            <Select
              value={settings.response_length}
              onValueChange={(v) => updateSettings({ response_length: v })}
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
      </Card>

      {/* Custom Instructions */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Custom Instructions</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Special instructions for the AI (e.g., "Always mention our 100% satisfaction guarantee")
            </p>
            <Textarea
              value={settings.custom_instructions || ''}
              onChange={(e) => updateSettings({ custom_instructions: e.target.value })}
              placeholder="Enter any special instructions..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <Label>Suggest Upsells</Label>
              <p className="text-sm text-muted-foreground">
                AI may suggest relevant add-on services
              </p>
            </div>
            <Switch
              checked={settings.suggest_upsells}
              onCheckedChange={(checked) => updateSettings({ suggest_upsells: checked })}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <Label>Include Pricing</Label>
              <p className="text-sm text-muted-foreground">
                AI may reference pricing in replies
              </p>
            </div>
            <Switch
              checked={settings.include_pricing}
              onCheckedChange={(checked) => updateSettings({ include_pricing: checked })}
            />
          </div>
        </div>
      </Card>

      {saving && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
