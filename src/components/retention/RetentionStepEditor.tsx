import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RetentionStep } from '@/hooks/useRetentionSequences';
import MergeFieldPicker from '@/components/sequences/MergeFieldPicker';
import { Icon } from '@/components/ui/icon';
import { useRef } from 'react';

interface RetentionStepEditorProps {
  step: RetentionStep;
  stepNumber: number;
  onChange: (updates: Partial<RetentionStep>) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export default function RetentionStepEditor({
  step,
  stepNumber,
  onChange,
  onDelete,
  canDelete,
}: RetentionStepEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFieldInsert = (field: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = 
      step.message.substring(0, start) + 
      field + 
      step.message.substring(end);
    
    onChange({ message: newMessage });

    // Restore cursor position after field
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + field.length, start + field.length);
    }, 0);
  };

  const charCount = step.message.length;
  const smsLimit = 160;
  const isOverLimit = step.channel === 'sms' && charCount > smsLimit;

  return (
    <Card className={step.is_active ? '' : 'opacity-60'}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="grip" size="md" className="text-muted-foreground cursor-grab" />
              <span className="text-sm font-medium">Step {stepNumber}</span>
              {step.channel === 'sms' ? (
                <Icon name="message" size="md" className="text-blue-600" />
              ) : (
                <Icon name="email" size="md" className="text-purple-600" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={step.is_active}
                  onCheckedChange={(checked) => onChange({ is_active: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {step.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {canDelete && (
                <Button variant="ghost" size="icon" onClick={onDelete}>
                  <Icon name="trash" size="md" className="text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Timing */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Send after</Label>
              <Input
                type="number"
                min={0}
                value={step.delay_days}
                onChange={(e) => onChange({ delay_days: parseInt(e.target.value) || 0 })}
                className="w-16 h-8"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={23}
                value={step.delay_hours}
                onChange={(e) => onChange({ delay_hours: parseInt(e.target.value) || 0 })}
                className="w-16 h-8"
              />
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
            <Select value={step.channel} onValueChange={(value) => onChange({ channel: value as 'sms' | 'email' })}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject (email only) */}
          {step.channel === 'email' && (
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                value={step.subject || ''}
                onChange={(e) => onChange({ subject: e.target.value })}
                placeholder="Email subject..."
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Message</Label>
              <MergeFieldPicker onSelect={handleFieldInsert} />
            </div>
            <Textarea
              ref={textareaRef}
              value={step.message}
              onChange={(e) => onChange({ message: e.target.value })}
              placeholder="Write your follow-up message..."
              rows={3}
              className="resize-none"
            />
            {step.channel === 'sms' && (
              <div className="flex justify-end">
                <span className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {charCount}/{smsLimit} characters
                  {charCount > smsLimit && ` (${Math.ceil(charCount / smsLimit)} segments)`}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
