import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RetentionStep, 
  RetentionSequence, 
  TRIGGER_TYPES, 
  DEFAULT_RETENTION_STEPS 
} from '@/hooks/useRetentionSequences';
import RetentionStepEditor from './RetentionStepEditor';
import { Icon } from '@/components/ui/icon';

interface RetentionSequenceEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    trigger_type: string;
    trigger_days: number;
    steps: RetentionStep[];
  }) => Promise<void>;
  sequence: RetentionSequence | null;
}

export default function RetentionSequenceEditor({
  open,
  onClose,
  onSave,
  sequence,
}: RetentionSequenceEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('job_completed');
  const [triggerDays, setTriggerDays] = useState(0);
  const [steps, setSteps] = useState<RetentionStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (sequence) {
        setName(sequence.name);
        setDescription(sequence.description || '');
        setTriggerType(sequence.trigger_type);
        setTriggerDays(sequence.trigger_days);
        setSteps(sequence.steps);
      } else {
        setName('');
        setDescription('');
        setTriggerType('job_completed');
        setTriggerDays(0);
        setSteps(DEFAULT_RETENTION_STEPS);
      }
      setErrors({});
    }
  }, [open, sequence]);

  const handleAddStep = () => {
    const maxDelay = Math.max(...steps.map(s => s.delay_days), 0);
    setSteps([
      ...steps,
      {
        delay_days: maxDelay + 7,
        delay_hours: 0,
        channel: 'sms',
        message: '',
        is_active: true,
      },
    ]);
  };

  const handleUpdateStep = (index: number, updates: Partial<RetentionStep>) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, ...updates } : step
    ));
  };

  const handleDeleteStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }
    
    const activeSteps = steps.filter(s => s.is_active);
    if (activeSteps.some(s => !s.message.trim())) {
      newErrors.steps = 'All active steps must have a message';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setSaving(true);
    try {
      await onSave({
        name,
        description,
        trigger_type: triggerType,
        trigger_days: triggerDays,
        steps,
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedTrigger = TRIGGER_TYPES.find(t => t.value === triggerType);
  const showTriggerDays = triggerType === 'days_since_service' || triggerType === 'dormant';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {sequence ? 'Edit Retention Sequence' : 'New Retention Sequence'}
          </SheetTitle>
          <SheetDescription>
            Automated follow-ups to encourage repeat business
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sequence Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Post-Job Follow-Up"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this sequence for?"
                  rows={2}
                />
              </div>
            </div>

            {/* Trigger */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Trigger</h3>
              
              <div className="space-y-2">
                <Label>When to Start</Label>
                <Select value={triggerType} onValueChange={setTriggerType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTrigger && (
                  <p className="text-sm text-muted-foreground">
                    {selectedTrigger.description}
                  </p>
                )}
              </div>

              {showTriggerDays && (
                <div className="space-y-2">
                  <Label htmlFor="triggerDays">
                    {triggerType === 'days_since_service' 
                      ? 'Days since last service' 
                      : 'Days inactive'}
                  </Label>
                  <Input
                    id="triggerDays"
                    type="number"
                    min={0}
                    value={triggerDays}
                    onChange={(e) => setTriggerDays(parseInt(e.target.value) || 0)}
                    className="w-32"
                  />
                </div>
              )}
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Message Steps</h3>
                <Button variant="outline" size="sm" onClick={handleAddStep}>
                  <Icon name="plus" size="md" className="mr-1" />
                  Add Step
                </Button>
              </div>

              {errors.steps && (
                <p className="text-sm text-destructive">{errors.steps}</p>
              )}

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <RetentionStepEditor
                    key={index}
                    step={step}
                    stepNumber={index + 1}
                    onChange={(updates) => handleUpdateStep(index, updates)}
                    onDelete={() => handleDeleteStep(index)}
                    canDelete={steps.length > 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Icon name="spinner" size="md" className="mr-2 animate-spin" />
            ) : (
              <Icon name="save" size="md" className="mr-2" />
            )}
            Save Sequence
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
