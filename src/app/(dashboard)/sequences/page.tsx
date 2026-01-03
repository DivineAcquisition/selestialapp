"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SequenceList from '@/components/sequences/SequenceList';
import SequenceEditor from '@/components/sequences/SequenceEditor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSequences } from '@/hooks/useSequences';
import { Plus, Loader2, Zap } from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import type { Sequence } from '@/types';

type SequenceRow = Tables<'sequences'>;

export default function SequencesPage() {
  const { 
    sequences, 
    loading, 
    createSequence, 
    updateSequence, 
    setDefaultSequence, 
    deleteSequence 
  } = useSequences();
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Transform DB sequences to the Sequence type expected by components
  const transformedSequences: Sequence[] = sequences.map(s => ({
    id: s.id,
    created_at: s.created_at,
    updated_at: s.updated_at,
    business_id: s.business_id,
    name: s.name,
    description: s.description || undefined,
    is_active: s.is_active,
    is_default: s.is_default,
    steps: Array.isArray(s.steps) ? s.steps as any : [],
  }));
  
  const handleCreate = () => {
    setEditingSequence(null);
    setShowEditor(true);
  };
  
  const handleEdit = (sequence: Sequence) => {
    setEditingSequence(sequence);
    setShowEditor(true);
  };
  
  const handleSave = async (sequenceData: Sequence) => {
    if (editingSequence) {
      // Update existing
      await updateSequence(editingSequence.id, {
        name: sequenceData.name,
        description: sequenceData.description,
        steps: sequenceData.steps as any,
        is_active: sequenceData.is_active,
      });
    } else {
      // Create new
      const sequence: Omit<TablesInsert<'sequences'>, 'business_id'> = {
        name: sequenceData.name,
        description: sequenceData.description,
        steps: sequenceData.steps as any,
        is_active: true,
        is_default: false,
      };
      
      await createSequence(sequence);
    }
  };
  
  const handleDelete = async (sequenceId: string) => {
    setDeleting(true);
    try {
      await deleteSequence(sequenceId);
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };
  
  const handleToggleActive = async (sequenceId: string, active: boolean) => {
    await updateSequence(sequenceId, { is_active: active });
  };
  
  const handleSetDefault = async (sequenceId: string) => {
    await setDefaultSequence(sequenceId);
  };
  
  const sequenceToDelete = transformedSequences.find(s => s.id === deleteConfirm);
  
  if (loading) {
    return (
      <Layout title="Sequences">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Sequences">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              Create and manage your follow-up sequences
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {transformedSequences.filter(s => s.is_active).length} active sequence{transformedSequences.filter(s => s.is_active).length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Sequence
          </Button>
        </div>
        
        {transformedSequences.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No sequences yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first follow-up sequence to start automating your quote follow-ups.
            </p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Sequence
            </Button>
          </Card>
        ) : (
          <SequenceList
            sequences={transformedSequences}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteConfirm(id)}
            onToggleActive={handleToggleActive}
            onSetDefault={handleSetDefault}
          />
        )}
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
              Are you sure you want to delete &quot;{sequenceToDelete?.name}&quot;? 
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
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
