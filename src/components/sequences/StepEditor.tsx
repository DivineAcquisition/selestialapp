import { SequenceStep } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import MergeFieldPicker from './MergeFieldPicker';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface StepEditorProps {
  step: SequenceStep;
  stepNumber: number;
  onChange: (step: SequenceStep) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export default function StepEditor({
  step,
  stepNumber,
  onChange,
  onDelete,
  canDelete,
}: StepEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleFieldInsert = (field: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange({ ...step, message: step.message + field });
      return;
    }
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = 
      step.message.substring(0, start) + 
      field + 
      step.message.substring(end);
    
    onChange({ ...step, message: newMessage });
    
    // Restore cursor position after field
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + field.length, start + field.length);
    }, 0);
  };
  
  const charCount = step.message.length;
  const isOverLimit = step.channel === 'sms' && charCount > 160;
  
  return (
    <Card className={cn("p-4", !step.is_active && "opacity-60")}>
      <div className="flex gap-3">
        {/* Drag handle */}
        <div className="flex items-start pt-1">
          <Icon name="grip" size="lg" className="text-muted-foreground cursor-grab" />
        </div>
        
        {/* Main content */}
        <div className="flex-1 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-medium text-sm">Step {stepNumber}</span>
              
              {/* Channel toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                    step.channel === 'sms' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground"
                  )}
                  onClick={() => onChange({ ...step, channel: 'sms' })}
                >
                  <Icon name="message" size="xs" />
                  SMS
                </button>
                <button
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                    step.channel === 'email' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground"
                  )}
                  onClick={() => onChange({ ...step, channel: 'email' })}
                >
                  <Icon name="email" size="xs" />
                  Email
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={step.is_active}
                onCheckedChange={(checked) => onChange({ ...step, is_active: checked })}
              />
              
              {canDelete && (
                <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive hover:text-destructive">
                  <Icon name="trash" size="sm" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Timing */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="clock" size="sm" className="text-muted-foreground" />
              <span className="text-muted-foreground">Send after</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min="0"
                value={step.delay_days}
                onChange={(e) => onChange({ ...step, delay_days: parseInt(e.target.value) || 0 })}
                className="w-16 text-center"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min="0"
                max="23"
                value={step.delay_hours}
                onChange={(e) => onChange({ ...step, delay_hours: parseInt(e.target.value) || 0 })}
                className="w-16 text-center"
              />
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
          </div>
          
          {/* Subject (email only) */}
          {step.channel === 'email' && (
            <div className="space-y-1.5">
              <Label className="text-sm">Subject Line</Label>
              <Input
                value={step.subject || ''}
                onChange={(e) => onChange({ ...step, subject: e.target.value })}
                placeholder="Enter email subject..."
              />
            </div>
          )}
          
          {/* Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Message</Label>
              <MergeFieldPicker onSelect={handleFieldInsert} />
            </div>
            <Textarea
              ref={textareaRef}
              value={step.message}
              onChange={(e) => onChange({ ...step, message: e.target.value })}
              placeholder="Enter your message..."
              rows={4}
              className={cn(isOverLimit && 'border-amber-500')}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Use merge fields to personalize your message
              </span>
              <span className={cn(
                step.channel === 'sms' && (isOverLimit ? 'text-amber-600' : 'text-muted-foreground')
              )}>
                {step.channel === 'sms' && (
                  <>
                    {charCount}/160 characters
                    {isOverLimit && ' (will send as multiple messages)'}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
