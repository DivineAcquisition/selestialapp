import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SequenceList from '@/components/sequences/SequenceList';
import SequenceEditor from '@/components/sequences/SequenceEditor';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sequence } from '@/types';
import { mockSequences as initialMockSequences } from '@/lib/mockData';
import { Plus } from 'lucide-react';

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>(initialMockSequences);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const handleCreate = () => {
    setEditingSequence(null);
    setShowEditor(true);
  };
  
  const handleEdit = (sequence: Sequence) => {
    setEditingSequence(sequence);
    setShowEditor(true);
  };
  
  const handleSave = (sequence: Sequence) => {
    if (editingSequence) {
      // Update existing
      setSequences(sequences.map(s => s.id === sequence.id ? sequence : s));
    } else {
      // Add new
      setSequences([...sequences, sequence]);
    }
  };
  
  const handleDelete = (sequenceId: string) => {
    setSequences(sequences.filter(s => s.id !== sequenceId));
    setDeleteConfirm(null);
  };
  
  const handleToggleActive = (sequenceId: string, active: boolean) => {
    setSequences(sequences.map(s => 
      s.id === sequenceId ? { ...s, is_active: active } : s
    ));
  };
  
  const handleSetDefault = (sequenceId: string) => {
    setSequences(sequences.map(s => ({
      ...s,
      is_default: s.id === sequenceId,
    })));
  };
  
  const sequenceToDelete = sequences.find(s => s.id === deleteConfirm);
  
  return (
    <Layout title="Sequences">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              Create and manage your follow-up sequences
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {sequences.filter(s => s.is_active).length} active sequence{sequences.filter(s => s.is_active).length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Sequence
          </Button>
        </div>
        
        <SequenceList
          sequences={sequences}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteConfirm(id)}
          onToggleActive={handleToggleActive}
          onSetDefault={handleSetDefault}
        />
      </div>
      
      {/* Editor */}
      <SequenceEditor
        open={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingSequence(null);
        }}
        onSave={handleSave}
        sequence={editingSequence}
      />
      
      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sequence</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{sequenceToDelete?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
