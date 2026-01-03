"use client";

import { Sequence } from '@/types';
import SequenceCard from './SequenceCard';

interface SequenceListProps {
  sequences: Sequence[];
  onEdit: (sequence: Sequence) => void;
  onDelete: (sequenceId: string) => void;
  onToggleActive: (sequenceId: string, active: boolean) => void;
  onSetDefault: (sequenceId: string) => void;
}

export default function SequenceList({
  sequences,
  onEdit,
  onDelete,
  onToggleActive,
  onSetDefault,
}: SequenceListProps) {
  if (sequences.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No sequences yet. Create your first one!</p>
      </div>
    );
  }
  
  // Sort: default first, then by name
  const sortedSequences = [...sequences].sort((a, b) => {
    if (a.is_default) return -1;
    if (b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sortedSequences.map((sequence) => (
        <SequenceCard
          key={sequence.id}
          sequence={sequence}
          onEdit={() => onEdit(sequence)}
          onDelete={() => onDelete(sequence.id)}
          onToggleActive={(active) => onToggleActive(sequence.id, active)}
          onSetDefault={() => onSetDefault(sequence.id)}
        />
      ))}
    </div>
  );
}
