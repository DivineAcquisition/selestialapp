"use client";

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
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
  Bot,
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
  Wand2,
} from 'lucide-react';

export default function AISettings() {
  const { settings, loading, saving, updateSettings, usagePercent } = useAISettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Usage Card */}
      <Card className="card-elevated relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-[#9D96FF]/20 rounded-2xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">AI Smart Replies</h3>
                <Badge className={cn(
                  "text-xs",
                  settings.smart_replies_enabled 
                    ? "bg-emerald-100 text-emerald-700 border-0" 
                    : "bg-gray-100 text-gray-600 border-0"
                )}>
                  {settings.smart_replies_enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Intelligent response suggestions powered by Claude AI
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    {settings.suggestions_used_this_month} of {settings.monthly_suggestion_limit} suggestions used
                  </span>
                  <span className={cn(
                    "font-medium",
                    usagePercent > 80 ? "text-amber-600" : "text-gray-500"
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
        <Card className="card-elevated p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{settings.suggestions_used_this_month}</p>
              <p className="text-xs text-gray-500">Used this month</p>
            </div>
          </div>
        </Card>
        
        <Card className="card-elevated p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{settings.monthly_suggestion_limit - settings.suggestions_used_this_month}</p>
              <p className="text-xs text-gray-500">Remaining</p>
            </div>
          </div>
        </Card>
        
        <Card className="card-elevated p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{settings.tone}</p>
              <p className="text-xs text-gray-500">Current tone</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Enable Toggle */}
      <Card className="card-elevated p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Enable Smart Replies</h4>
              <p className="text-sm text-gray-500 mt-1">
                Show AI-generated reply suggestions in your inbox conversations
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Saves time</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Professional tone</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
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
      <Card className="card-elevated p-6 rounded-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Response Style</h4>
            <p className="text-sm text-gray-500 mt-1">
              Customize how the AI writes reply suggestions
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Field name="tone">
            <FieldLabel className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-gray-400" />
              Tone
            </FieldLabel>
            <Select
              value={settings.tone}
              onValueChange={(v) => updateSettings({ tone: v })}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">😊 Friendly</SelectItem>
                <SelectItem value="professional">💼 Professional</SelectItem>
                <SelectItem value="casual">🤙 Casual</SelectItem>
                <SelectItem value="formal">📋 Formal</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>How the AI sounds</FieldDescription>
          </Field>

          <Field name="emoji">
            <FieldLabel className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-gray-400" />
              Emoji Usage
            </FieldLabel>
            <Select
              value={settings.emoji_usage}
              onValueChange={(v) => updateSettings({ emoji_usage: v })}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="minimal">Minimal (1-2)</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="heavy">Heavy 🎉✨</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>Emoji frequency</FieldDescription>
          </Field>

          <Field name="length">
            <FieldLabel className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Length
            </FieldLabel>
            <Select
              value={settings.response_length}
              onValueChange={(v) => updateSettings({ response_length: v })}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief (&lt;100 chars)</SelectItem>
                <SelectItem value="concise">Concise (~150 chars)</SelectItem>
                <SelectItem value="detailed">Detailed (~250 chars)</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>Message length</FieldDescription>
          </Field>
        </div>
      </Card>

      {/* Custom Instructions */}
      <Card className="card-elevated p-6 rounded-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Custom Instructions</h4>
            <p className="text-sm text-gray-500 mt-1">
              Add specific guidance for how the AI should respond
            </p>
          </div>
        </div>
        
        <Field name="instructions">
          <Textarea
            value={settings.custom_instructions || ''}
            onChange={(e) => updateSettings({ custom_instructions: e.target.value })}
            placeholder="Example: Always mention our 100% satisfaction guarantee. Use the customer's first name when possible. Emphasize same-day service availability."
            className="min-h-[120px] resize-none rounded-xl"
          />
          <FieldDescription>
            These instructions help the AI understand your business and communication style
          </FieldDescription>
        </Field>
      </Card>

      {/* Additional Options */}
      <Card className="card-elevated p-6 rounded-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Smart Features</h4>
            <p className="text-sm text-gray-500 mt-1">
              Enable additional AI capabilities
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">Suggest Upsells</p>
                <p className="text-xs text-gray-500">
                  AI may suggest relevant add-on services in replies
                </p>
              </div>
            </div>
            <Switch
              checked={settings.suggest_upsells}
              onCheckedChange={(checked) => updateSettings({ suggest_upsells: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <DollarSign className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">Include Pricing</p>
                <p className="text-xs text-gray-500">
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
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving changes...
        </div>
      )}
    </div>
  );
}
