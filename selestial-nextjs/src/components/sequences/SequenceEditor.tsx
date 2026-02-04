import { useState, useEffect } from 'react';
import { Sequence, SequenceStep } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import StepEditor from './StepEditor';
import TemplateLibrary from './TemplateLibrary';
import { generateId } from '@/lib/formatters';
import { Plus, Sparkles } from 'lucide-react';

interface SequenceEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (sequence: Sequence) => void;
  sequence?: Sequence | null;
}

const createEmptyStep = (order: number): SequenceStep => ({
  id: generateId(),
  order,
  delay_days: order === 0 ? 0 : order * 2,
  delay_hours: 0,
  channel: 'sms',
  message: '',
  is_active: true,
});

export default function SequenceEditor({ open, onClose, onSave, sequence }: SequenceEditorProps) {
  const isEditing = !!sequence;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<SequenceStep[]>([createEmptyStep(0)]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Reset form when sequence changes or modal opens
  useEffect(() => {
    if (open) {
      setName(sequence?.name || '');
      setDescription(sequence?.description || '');
      setSteps(sequence?.steps || [createEmptyStep(0)]);
      setErrors({});
    }
  }, [open, sequence]);

  const handleSelectTemplate = (templateSteps: SequenceStep[], templateName: string, templateDescription: string) => {
    // Transform steps to ensure they have proper IDs
    const transformedSteps = templateSteps.map((step, index) => ({
      ...step,
      id: generateId(),
      order: index,
    }));
    setSteps(transformedSteps);
    if (!name) setName(templateName);
    if (!description) setDescription(templateDescription);
  };
  
  const handleAddStep = () => {
    const newStep = createEmptyStep(steps.length);
    setSteps([...steps, newStep]);
  };
  
  const handleUpdateStep = (index: number, updatedStep: SequenceStep) => {
    const newSteps = [...steps];
    newSteps[index] = updatedStep;
    setSteps(newSteps);
  };
  
  const handleDeleteStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index);
    // Re-order remaining steps
    newSteps.forEach((step, i) => {
      step.order = i;
    });
    setSteps(newSteps);
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Sequence name is required';
    }
    
    if (steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }
    
    const activeSteps = steps.filter(s => s.is_active);
    if (activeSteps.length === 0) {
      newErrors.steps = 'At least one active step is required';
    }
    
    const hasEmptyMessage = steps.some(s => s.is_active && !s.message.trim());
    if (hasEmptyMessage) {
      newErrors.steps = 'All active steps must have a message';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (!validate()) return;
    
    const now = new Date().toISOString();
    
    const savedSequence: Sequence = {
      id: sequence?.id || generateId(),
      created_at: sequence?.created_at || now,
      updated_at: now,
      business_id: sequence?.business_id || '1',
      name: name.trim(),
      description: description.trim() || undefined,
      is_active: sequence?.is_active ?? true,
      is_default: sequence?.is_default ?? false,
      steps: steps.map((step, index) => ({
        ...step,
        order: index,
      })),
    };
    
    onSave(savedSequence);
    handleClose();
  };
  
  const handleClose = () => {
    setName('');
    setDescription('');
    setSteps([createEmptyStep(0)]);
    setErrors({});
    onClose();
  };
  
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Edit Sequence' : 'Create Sequence'}
          </SheetTitle>
          <SheetDescription>
            {isEditing 
              ? 'Modify the sequence steps and timing.' 
              : 'Build a follow-up sequence with multiple touchpoints.'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Template button for new sequences */}
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setShowTemplates(true)}
              className="w-full gap-2 border-dashed"
            >
              <Sparkles className="w-4 h-4" />
              Start from Template
            </Button>
          )}

          {/* Basic info */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sequence-name">
                Sequence Name *
              </Label>
              <Input
                id="sequence-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Standard Follow-Up"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="sequence-description">Description (optional)</Label>
              <Textarea
                id="sequence-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this sequence..."
                rows={2}
              />
            </div>
          </div>
          
          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Sequence Steps</Label>
              <Button variant="outline" size="sm" onClick={handleAddStep} className="gap-1">
                <Plus className="w-3 h-3" />
                Add Step
              </Button>
            </div>
            
            {errors.steps && (
              <p className="text-sm text-red-500">{errors.steps}</p>
            )}
            
            <div className="space-y-3">
              {steps.map((step, index) => (
                <StepEditor
                  key={step.id}
                  step={step}
                  stepNumber={index + 1}
                  onChange={(updatedStep) => handleUpdateStep(index, updatedStep)}
                  onDelete={() => handleDeleteStep(index)}
                  canDelete={steps.length > 1}
                />
              ))}
            </div>
          </div>
        </div>
        
        <SheetFooter className="gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Create Sequence'}
          </Button>
        </SheetFooter>
      </SheetContent>

      {/* Template Library Modal */}
      <TemplateLibrary
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleSelectTemplate}
        defaultType="quote_followup"
      />
    </Sheet>
  );
}
