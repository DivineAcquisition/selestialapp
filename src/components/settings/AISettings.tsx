"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAISettings } from '@/hooks/useAISettings';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Loader2,
  MessageSquare,
  Settings2,
  Zap,
  Brain,
  TrendingUp,
  DollarSign,
  Smile,
  FileText,
  CheckCircle2,
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
      {/* Hero Usage Card with Glow */}
      <Card className="relative overflow-hidden glow-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center glow-sm">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground">AI Smart Replies</h3>
                <Badge variant="secondary" className="text-xs">
                  {settings.smart_replies_enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Intelligent response suggestions powered by Claude AI
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">
                    {settings.suggestions_used_this_month} of {settings.monthly_suggestion_limit} suggestions used
                  </span>
                  <span className={cn(
                    "font-medium",
                    usagePercent > 80 ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    {Math.round(usagePercent)}%
                  </span>
                </div>
                <Progress value={usagePercent} className="h-2" />
                
                {usagePercent > 80 && (
                  <p className="text-sm text-amber-600 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Running low on AI suggestions this month
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 card-glow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{settings.suggestions_used_this_month}</p>
              <p className="text-xs text-muted-foreground">Used this month</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 card-glow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{settings.monthly_suggestion_limit - settings.suggestions_used_this_month}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 card-glow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold capitalize">{settings.tone}</p>
              <p className="text-xs text-muted-foreground">Current tone</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Enable Toggle */}
      <Card className="p-6 feature-card">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Enable Smart Replies</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Show AI-generated reply suggestions in your inbox conversations
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>Saves time</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>Professional tone</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>Context-aware</span>
                </div>
              </div>
            </div>
          </div>
          <Switch
            checked={settings.smart_replies_enabled}
            onCheckedChange={(checked) => updateSettings({ smart_replies_enabled: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </Card>

      {/* Response Style Settings */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Response Style</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Customize how the AI writes reply suggestions
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-muted-foreground" />
              Tone
            </Label>
            <Select
              value={settings.tone}
              onValueChange={(v) => updateSettings({ tone: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">😊 Friendly</SelectItem>
                <SelectItem value="professional">💼 Professional</SelectItem>
                <SelectItem value="casual">🤙 Casual</SelectItem>
                <SelectItem value="formal">📋 Formal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">How the AI sounds</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              Emoji Usage
            </Label>
            <Select
              value={settings.emoji_usage}
              onValueChange={(v) => updateSettings({ emoji_usage: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="minimal">Minimal (1-2)</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="heavy">Heavy 🎉✨</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Emoji frequency</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Length
            </Label>
            <Select
              value={settings.response_length}
              onValueChange={(v) => updateSettings({ response_length: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief (&lt;100 chars)</SelectItem>
                <SelectItem value="concise">Concise (~150 chars)</SelectItem>
                <SelectItem value="detailed">Detailed (~250 chars)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Message length</p>
          </div>
        </div>
      </Card>

      {/* Custom Instructions */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Custom Instructions</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Add specific guidance for how the AI should respond
            </p>
          </div>
        </div>
        
        <Textarea
          value={settings.custom_instructions || ''}
          onChange={(e) => updateSettings({ custom_instructions: e.target.value })}
          placeholder="Example: Always mention our 100% satisfaction guarantee. Use the customer's first name when possible. Emphasize same-day service availability."
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          These instructions help the AI understand your business and communication style
        </p>
      </Card>

      {/* Additional Options */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Smart Features</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Enable additional AI capabilities
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Suggest Upsells</p>
                <p className="text-xs text-muted-foreground">
                  AI may suggest relevant add-on services in replies
                </p>
              </div>
            </div>
            <Switch
              checked={settings.suggest_upsells}
              onCheckedChange={(checked) => updateSettings({ suggest_upsells: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Include Pricing</p>
                <p className="text-xs text-muted-foreground">
                  AI may reference quote pricing in replies when relevant
                </p>
              </div>
            </div>
            <Switch
              checked={settings.include_pricing}
              onCheckedChange={(checked) => updateSettings({ include_pricing: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Saving indicator */}
      {saving && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving changes...
        </div>
      )}
    </div>
  );
}
