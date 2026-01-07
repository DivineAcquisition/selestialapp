"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SequenceList from '@/components/sequences/SequenceList';
import SequenceEditor from '@/components/sequences/SequenceEditor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSequences } from '@/hooks/useSequences';
import { useRetentionSequences } from '@/hooks/useRetentionSequences';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import UpgradePrompt from '@/components/shared/UpgradePrompt';
import { 
  Plus, 
  Loader2, 
  Zap, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  Target,
  Heart,
  RefreshCw,
  TrendingUp,
  Gift,
  Mail,
  Bot,
  Wand2,
} from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import type { Sequence } from '@/types';
import { cn } from '@/lib/utils';

type SequenceRow = Tables<'sequences'>;

const sequenceTemplates = [
  {
    id: 'quick-follow-up',
    name: '⚡ Quick Follow-Up',
    description: '3 messages over 5 days to convert quotes fast',
    type: 'quote',
    steps: 3,
    duration: '5 days',
    popular: true,
    icon: Zap,
    color: 'text-amber-600 bg-amber-50',
  },
  {
    id: 'gentle-nurture',
    name: '🌱 Gentle Nurture',
    description: 'Soft touch sequence over 2 weeks',
    type: 'quote',
    steps: 5,
    duration: '14 days',
    icon: Heart,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    id: 'urgency-builder',
    name: '🔥 Urgency Builder',
    description: 'Create FOMO with limited availability',
    type: 'quote',
    steps: 4,
    duration: '4 days',
    icon: TrendingUp,
    color: 'text-red-600 bg-red-50',
  },
  {
    id: 'retention-welcome',
    name: '👋 Welcome & Thank You',
    description: 'Post-job follow-up for reviews & referrals',
    type: 'retention',
    steps: 3,
    duration: '30 days',
    icon: Gift,
    color: 'text-purple-600 bg-purple-50',
  },
  {
    id: 'retention-reactivation',
    name: '🔄 Customer Reactivation',
    description: 'Win back past customers',
    type: 'retention',
    steps: 4,
    duration: '90 days',
    icon: RefreshCw,
    color: 'text-blue-600 bg-blue-50',
  },
];

export default function SequencesPage() {
  const { 
    sequences, 
    loading, 
    createSequence, 
    updateSequence, 
    setDefaultSequence, 
    deleteSequence 
  } = useSequences();
  
  const { hasFeature } = useFeatureGate();
  const hasAIBuilder = hasFeature('aiSequenceBuilder');
  
  const [activeTab, setActiveTab] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Transform DB sequences to the Sequence type expected by components
  const transformedSequences = sequences.map(s => ({
    id: s.id,
    created_at: s.created_at,
    updated_at: s.updated_at,
    business_id: s.business_id,
    name: s.name,
    description: s.description || undefined,
    is_active: s.is_active,
    is_default: s.is_default,
    steps: Array.isArray(s.steps) ? s.steps as any : [],
    trigger_type: ((s as any).trigger_type as string) || 'quote_created',
  }));
  
  // Filter sequences based on tab
  const filteredSequences = transformedSequences.filter(s => {
    if (activeTab === 'all') return true;
    if (activeTab === 'quote') return s.trigger_type === 'quote_created' || s.trigger_type === 'quote_pending';
    if (activeTab === 'retention') return s.trigger_type === 'job_completed' || s.trigger_type === 'retention';
    return true;
  }) as Sequence[];
  
  const handleCreate = () => {
    setShowTemplates(true);
  };

  const handleSelectTemplate = async (templateId: string) => {
    setShowTemplates(false);
    // For now, just open editor with template data
    // In future, could pre-fill with template steps
    setEditingSequence(null);
    setShowEditor(true);
  };

  const handleGenerateWithAI = async () => {
    if (!hasAIBuilder) return;
    setGeneratingAI(true);
    // Simulated AI generation - would call API
    setTimeout(() => {
      setGeneratingAI(false);
      setShowTemplates(false);
      setShowEditor(true);
    }, 1500);
  };
  
  const handleEdit = (sequence: Sequence) => {
    setEditingSequence(sequence);
    setShowEditor(true);
  };
  
  const handleSave = async (sequenceData: Sequence) => {
    if (editingSequence) {
      await updateSequence(editingSequence.id, {
        name: sequenceData.name,
        description: sequenceData.description,
        steps: sequenceData.steps as any,
        is_active: sequenceData.is_active,
      });
    } else {
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
      <Layout title="AI Sequence Builder">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="AI Sequence Builder">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Automated Sequences
                <Badge variant="secondary" className="text-xs font-normal">
                  {transformedSequences.filter(s => s.is_active).length} active
                </Badge>
              </h2>
              <p className="text-sm text-muted-foreground">
                Build smart follow-up workflows with AI assistance
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasAIBuilder && (
              <Button variant="outline" className="gap-2" onClick={handleGenerateWithAI}>
                <Wand2 className="h-4 w-4" />
                Generate with AI
              </Button>
            )}
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Sequence
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="gap-2">
              <Zap className="h-4 w-4" />
              All Sequences
            </TabsTrigger>
            <TabsTrigger value="quote" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Quote Follow-ups
            </TabsTrigger>
            <TabsTrigger value="retention" className="gap-2">
              <Heart className="h-4 w-4" />
              Retention
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* AI Builder Promo (if not on Growth) */}
        {!hasAIBuilder && (
          <UpgradePrompt 
            feature="AI Sequence Builder"
            description="Let AI create optimized follow-up sequences tailored to your business"
            variant="banner"
          />
        )}
        
        {filteredSequences.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No sequences yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Create automated follow-up sequences to nurture leads and retain customers without lifting a finger.
            </p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Sequence
            </Button>
          </Card>
        ) : (
          <SequenceList
            sequences={filteredSequences}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteConfirm(id)}
            onToggleActive={handleToggleActive}
            onSetDefault={handleSetDefault}
          />
        )}
      </div>
      
      {/* Template Selector Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Choose a Starting Point
            </DialogTitle>
            <DialogDescription>
              Select a template or let AI build one for you
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* AI Option */}
            {hasAIBuilder && (
              <button
                onClick={handleGenerateWithAI}
                disabled={generatingAI}
                className="w-full p-4 bg-gradient-to-r from-primary/10 to-[#9D96FF]/10 border border-primary/20 rounded-xl hover:border-primary/40 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl text-white">
                    {generatingAI ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Wand2 className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      ✨ Generate with AI
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Tell us your goal and we'll create the perfect sequence
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0">
                    Recommended
                  </Badge>
                </div>
              </button>
            )}

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sequenceTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className="p-4 bg-background border rounded-xl hover:border-primary/40 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", template.color)}>
                      <template.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                          {template.name}
                        </h4>
                        {template.popular && (
                          <Badge variant="secondary" className="text-[10px]">Popular</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {template.steps} steps
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Start Blank */}
            <button
              onClick={() => {
                setShowTemplates(false);
                setEditingSequence(null);
                setShowEditor(true);
              }}
              className="w-full p-4 border-2 border-dashed rounded-xl hover:border-primary/40 transition-colors text-center"
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Plus className="h-4 w-4" />
                <span className="font-medium">Start from scratch</span>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
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
