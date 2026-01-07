"use client";

import { Sequence } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface SequenceCardProps {
  sequence: Sequence;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
  onSetDefault: () => void;
}

export default function SequenceCard({
  sequence,
  onEdit,
  onDelete,
  onToggleActive,
  onSetDefault,
}: SequenceCardProps) {
  const smsCount = sequence.steps.filter(s => s.channel === 'sms').length;
  const emailCount = sequence.steps.filter(s => s.channel === 'email').length;
  const totalDays = sequence.steps.reduce((max, step) => 
    Math.max(max, step.delay_days), 0
  );
  
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="bolt" size="lg" className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{sequence.name}</h3>
              {sequence.is_default && (
                <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-0">
                  <Icon name="crown" size="xs" />
                  Default
                </Badge>
              )}
            </div>
            {sequence.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{sequence.description}</p>
            )}
          </div>
        </div>
        
        <Switch
          checked={sequence.is_active}
          onCheckedChange={onToggleActive}
        />
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Icon name="message" size="sm" />
          {smsCount} SMS
        </span>
        {emailCount > 0 && (
          <span className="flex items-center gap-1">
            <Icon name="email" size="sm" />
            {emailCount} Email
          </span>
        )}
        <span>{sequence.steps.length} steps over {totalDays} days</span>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1">
          <Icon name="edit" size="sm" />
          Edit
        </Button>
        
        {!sequence.is_default && (
          <Button variant="ghost" size="sm" onClick={onSetDefault}>
            Set as Default
          </Button>
        )}
        
        <div className="flex-1" />
        
        {!sequence.is_default && (
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Icon name="trash" size="sm" />
          </Button>
        )}
      </div>
    </Card>
  );
}
