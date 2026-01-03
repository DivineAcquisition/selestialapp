"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRetentionSequences, TRIGGER_TYPES, DEFAULT_RETENTION_STEPS } from '@/hooks/useRetentionSequences';
import RetentionSequenceEditor from '@/components/retention/RetentionSequenceEditor';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Loader2,
  RefreshCw,
  Calendar,
  Clock,
  MessageSquare,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

export default function RetentionSequencesPage() {
  const { sequences, loading, refetch, createSequence, updateSequence, deleteSequence } = useRetentionSequences();
  const [showEditor, setShowEditor] = useState(false);
  const [editingSequence, setEditingSequence] = useState<typeof sequences[0] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = () => {
    setEditingSequence(null);
    setShowEditor(true);
  };

  const handleEdit = (sequence: typeof sequences[0]) => {
    setEditingSequence(sequence);
    setShowEditor(true);
  };

  const handleSave = async (data: {
    name: string;
    description: string;
    trigger_type: string;
    trigger_days: number;
    steps: typeof DEFAULT_RETENTION_STEPS;
  }) => {
    try {
      if (editingSequence) {
        const { error } = await updateSequence(editingSequence.id, {
          ...data,
          steps: data.steps,
        });
        if (error) throw error;
        toast.success('Retention sequence updated');
      } else {
        const { error } = await createSequence({
          ...data,
          conditions: {},
          is_active: true,
          is_default: false,
          steps: data.steps,
        });
        if (error) throw error;
        toast.success('Retention sequence created');
      }
      setShowEditor(false);
    } catch (err) {
      toast.error('Failed to save sequence');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const { error } = await deleteSequence(id);
      if (error) throw error;
      toast.success('Sequence deleted');
    } catch (err) {
      toast.error('Failed to delete sequence');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleToggleActive = async (id: string, is_active: boolean) => {
    try {
      await updateSequence(id, { is_active });
      toast.success(is_active ? 'Sequence activated' : 'Sequence paused');
    } catch (err) {
      toast.error('Failed to update sequence');
    }
  };

  const getTriggerLabel = (type: string) => {
    return TRIGGER_TYPES.find(t => t.value === type)?.label || type;
  };

  const getStepsSummary = (steps: typeof DEFAULT_RETENTION_STEPS) => {
    const smsCount = steps.filter(s => s.channel === 'sms' && s.is_active).length;
    const emailCount = steps.filter(s => s.channel === 'email' && s.is_active).length;
    const totalDays = Math.max(...steps.map(s => s.delay_days), 0);
    return { smsCount, emailCount, totalDays };
  };

  return (
    <Layout title="Retention Sequences">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Send automated messages after jobs are completed to keep customers coming back.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Sequence
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sequences.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No retention sequences yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Create your first sequence to automatically follow up with customers after jobs
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Sequence
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sequences.map((sequence) => {
              const { smsCount, emailCount, totalDays } = getStepsSummary(sequence.steps);
              
              return (
                <Card key={sequence.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{sequence.name}</CardTitle>
                          {sequence.is_default && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        {sequence.description && (
                          <CardDescription>{sequence.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sequence.is_active}
                          onCheckedChange={(checked) => handleToggleActive(sequence.id, checked)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(sequence)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteConfirm(sequence.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{getTriggerLabel(sequence.trigger_type)}</span>
                        {sequence.trigger_days > 0 && (
                          <span className="text-foreground font-medium">
                            +{sequence.trigger_days} days
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>{smsCount} SMS</span>
                      </div>
                      {emailCount > 0 && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{emailCount} Email</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{totalDays} day span</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor */}
      <RetentionSequenceEditor
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleSave}
        sequence={editingSequence}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sequence</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this retention sequence? This action cannot be undone.
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
