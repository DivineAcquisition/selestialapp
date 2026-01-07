import { useState } from 'react';
import { SequenceTemplate, TemplateType, SequenceStep } from '@/types';
import { useSequenceTemplates, calculateSequenceDuration } from '@/hooks/useSequenceTemplates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (steps: SequenceStep[], name: string, description: string) => void;
  defaultType?: TemplateType;
}

export default function TemplateLibrary({ 
  open, 
  onClose, 
  onSelect,
  defaultType = 'quote_followup'
}: TemplateLibraryProps) {
  const [activeType, setActiveType] = useState<TemplateType>(defaultType);
  const { templates, loading, incrementUsageCount } = useSequenceTemplates(activeType);
  const [selectedTemplate, setSelectedTemplate] = useState<SequenceTemplate | null>(null);

  const handleApply = async () => {
    if (!selectedTemplate) return;
    
    await incrementUsageCount(selectedTemplate.id);
    onSelect(
      selectedTemplate.steps, 
      selectedTemplate.name, 
      selectedTemplate.description || ''
    );
    setSelectedTemplate(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    onClose();
  };

  const getTypeLabel = (type: TemplateType) => {
    switch (type) {
      case 'quote_followup': return 'Quote Follow-Up';
      case 'post_job': return 'Post-Job';
      case 'reengagement': return 'Re-engagement';
      default: return type;
    }
  };

  const getTypeColor = (type: TemplateType) => {
    switch (type) {
      case 'quote_followup': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'post_job': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'reengagement': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatIndustryLabel = (slug: string | null) => {
    if (!slug) return 'Universal';
    return slug.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="sparkles" size="lg" className="text-primary" />
            Sequence Templates
          </DialogTitle>
          <DialogDescription>
            Pre-built sequences optimized for your industry. Select one to use as a starting point.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as TemplateType)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quote_followup">Quote Follow-Up</TabsTrigger>
            <TabsTrigger value="post_job">Post-Job</TabsTrigger>
            <TabsTrigger value="reengagement">Re-engagement</TabsTrigger>
          </TabsList>

          <TabsContent value={activeType} className="flex-1 min-h-0 mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="spinner" size="xl" className="animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No templates available for this category.</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={cn(
                        'p-4 border rounded-xl cursor-pointer transition-all',
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-medium text-foreground truncate">
                              {template.name}
                            </h3>
                            {template.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                            {template.industry_slug && (
                              <Badge variant="outline" className="text-xs">
                                {formatIndustryLabel(template.industry_slug)}
                              </Badge>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {template.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="message" size="xs" />
                              {template.steps.length} messages
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="clock" size="xs" />
                              {calculateSequenceDuration(template.steps)}
                            </span>
                          </div>
                        </div>
                        
                        {selectedTemplate?.id === template.id && (
                          <Icon name="check" size="lg" className="text-primary shrink-0" />
                        )}
                      </div>

                      {/* Preview steps when selected */}
                      {selectedTemplate?.id === template.id && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            PREVIEW
                          </p>
                          <div className="space-y-2">
                            {template.steps.slice(0, 3).map((step, index) => (
                              <div 
                                key={step.id} 
                                className="p-2 bg-background rounded border border-border"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Step {index + 1}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {step.delay_days > 0 
                                      ? `Day ${step.delay_days}` 
                                      : step.delay_hours > 0 
                                        ? `${step.delay_hours}h later` 
                                        : 'Immediately'}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {step.channel.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground line-clamp-2">
                                  {step.message}
                                </p>
                              </div>
                            ))}
                            {template.steps.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center py-1">
                                +{template.steps.length - 3} more steps
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-3 sm:gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={!selectedTemplate}
          >
            <Icon name="copy" size="md" className="mr-2" />
            Use Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
