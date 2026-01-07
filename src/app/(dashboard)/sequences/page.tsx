"use client";

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import SequenceList from '@/components/sequences/SequenceList';
import SequenceEditor from '@/components/sequences/SequenceEditor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSequences } from '@/hooks/useSequences';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import UpgradePrompt from '@/components/shared/UpgradePrompt';
import { 
  Plus, 
  Loader2, 
  Zap, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  Heart,
  RefreshCw,
  TrendingUp,
  Gift,
  Bot,
  Wand2,
  Search,
  Filter,
  LayoutGrid,
  List,
  Play,
  Pause,
  Crown,
  Copy,
  MoreHorizontal,
} from 'lucide-react';
import type { TablesInsert } from '@/integrations/supabase/types';
import type { Sequence, SequenceStep } from '@/types';
import { cn } from '@/lib/utils';


const sequenceTemplates = [
  {
    id: 'quick-follow-up',
    name: 'Quick Follow-Up',
    emoji: '⚡',
    description: '3 messages over 5 days to convert quotes fast',
    type: 'quote',
    steps: 3,
    duration: '5 days',
    popular: true,
    color: 'bg-amber-500',
  },
  {
    id: 'gentle-nurture',
    name: 'Gentle Nurture',
    emoji: '🌱',
    description: 'Soft touch sequence over 2 weeks',
    type: 'quote',
    steps: 5,
    duration: '14 days',
    color: 'bg-emerald-500',
  },
  {
    id: 'urgency-builder',
    name: 'Urgency Builder',
    emoji: '🔥',
    description: 'Create FOMO with limited availability',
    type: 'quote',
    steps: 4,
    duration: '4 days',
    color: 'bg-red-500',
  },
  {
    id: 'retention-welcome',
    name: 'Welcome & Thank You',
    emoji: '👋',
    description: 'Post-job follow-up for reviews & referrals',
    type: 'retention',
    steps: 3,
    duration: '30 days',
    color: 'bg-purple-500',
  },
  {
    id: 'retention-reactivation',
    name: 'Customer Reactivation',
    emoji: '🔄',
    description: 'Win back past customers',
    type: 'retention',
    steps: 4,
    duration: '90 days',
    color: 'bg-blue-500',
  },
  {
    id: 'seasonal-promo',
    name: 'Seasonal Promo',
    emoji: '🎁',
    description: 'Holiday and seasonal offers',
    type: 'retention',
    steps: 3,
    duration: '7 days',
    color: 'bg-pink-500',
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
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'quote' | 'retention'>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Extended sequence type with trigger_type
  type ExtendedSequence = Sequence & { trigger_type?: string };
  
  // Transform DB sequences to the Sequence type expected by components
  const transformedSequences: ExtendedSequence[] = sequences.map(s => ({
    id: s.id,
    created_at: s.created_at,
    updated_at: s.updated_at,
    business_id: s.business_id,
    name: s.name,
    description: s.description || undefined,
    is_active: s.is_active,
    is_default: s.is_default,
    steps: Array.isArray(s.steps) ? (s.steps as unknown as SequenceStep[]) : [],
    trigger_type: ((s as Record<string, unknown>).trigger_type as string) || 'quote_created',
  }));
  
  // Filter sequences based on search and type
  const filteredSequences = useMemo(() => {
    return transformedSequences.filter(s => {
      const matchesSearch = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const triggerType = s.trigger_type || 'quote_created';
      const matchesType = filterType === 'all' ||
        (filterType === 'quote' && (triggerType === 'quote_created' || triggerType === 'quote_pending')) ||
        (filterType === 'retention' && (triggerType === 'job_completed' || triggerType === 'retention'));
      
      return matchesSearch && matchesType;
    });
  }, [transformedSequences, searchQuery, filterType]);

  // Stats
  const stats = {
    total: transformedSequences.length,
    active: transformedSequences.filter(s => s.is_active).length,
    quoteFollowUp: transformedSequences.filter(s => {
      const t = s.trigger_type || 'quote_created';
      return t === 'quote_created' || t === 'quote_pending';
    }).length,
    retention: transformedSequences.filter(s => {
      const t = s.trigger_type || 'quote_created';
      return t === 'job_completed' || t === 'retention';
    }).length,
  };
  
  const handleCreate = () => {
    setShowTemplates(true);
  };

  const handleSelectTemplate = async (templateId: string) => {
    setShowTemplates(false);
    setEditingSequence(null);
    setShowEditor(true);
  };

  const handleGenerateWithAI = async () => {
    if (!hasAIBuilder) return;
    setGeneratingAI(true);
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
        {/* Header with Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Sequences</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Play className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.quoteFollowUp}</p>
                <p className="text-sm text-muted-foreground">Quote Follow-ups</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.retention}</p>
                <p className="text-sm text-muted-foreground">Retention</p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Builder Promo */}
        {!hasAIBuilder && (
          <UpgradePrompt 
            feature="AI Sequence Builder"
            description="Let AI create optimized follow-up sequences tailored to your business"
            variant="banner"
          />
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sequences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors",
                  filterType === 'all' ? 'bg-primary text-white rounded-l-lg' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('quote')}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors",
                  filterType === 'quote' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Quote
              </button>
              <button
                onClick={() => setFilterType('retention')}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors rounded-r-lg",
                  filterType === 'retention' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Retention
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 transition-colors rounded-l-lg",
                  viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 transition-colors rounded-r-lg",
                  viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            {hasAIBuilder && (
              <Button variant="outline" className="gap-2" onClick={handleGenerateWithAI}>
                <Wand2 className="h-4 w-4" />
                AI Generate
              </Button>
            )}
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Sequence
            </Button>
          </div>
        </div>
        
        {filteredSequences.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {searchQuery || filterType !== 'all' ? 'No sequences found' : 'No sequences yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create automated follow-up sequences to nurture leads and retain customers.'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Sequence
              </Button>
            )}
          </Card>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSequences.map((sequence) => {
              const smsCount = sequence.steps.filter(s => s.channel === 'sms').length;
              const emailCount = sequence.steps.filter(s => s.channel === 'email').length;
              const totalDays = sequence.steps.reduce((max, step) => 
                Math.max(max, step.delay_days), 0
              );
              const triggerType = sequence.trigger_type || 'quote_created';
              const isQuoteType = triggerType === 'quote_created' || triggerType === 'quote_pending';
              
              return (
                <Card 
                  key={sequence.id} 
                  className={cn(
                    "p-5 hover:shadow-md transition-all cursor-pointer group",
                    !sequence.is_active && "opacity-60"
                  )}
                  onClick={() => handleEdit(sequence)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                        isQuoteType ? "bg-amber-100" : "bg-purple-100"
                      )}>
                        {isQuoteType ? '💬' : '❤️'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{sequence.name}</h3>
                          {sequence.is_default && (
                            <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-0 text-[10px]">
                              <Crown className="h-2.5 w-2.5" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {isQuoteType ? 'Quote Follow-up' : 'Retention'}
                        </Badge>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(sequence.id, !sequence.is_active);
                      }}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        sequence.is_active 
                          ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" 
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      )}
                    >
                      {sequence.is_active ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {sequence.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {sequence.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {smsCount} SMS
                    </span>
                    {emailCount > 0 && (
                      <span className="flex items-center gap-1">
                        📧 {emailCount} Email
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {totalDays}d
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* List View */
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Choose a Template
            </DialogTitle>
            <DialogDescription>
              Select a pre-built template or start from scratch
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* AI Option */}
            {hasAIBuilder && (
              <button
                onClick={handleGenerateWithAI}
                disabled={generatingAI}
                className="w-full p-5 bg-gradient-to-r from-primary/10 to-[#9D96FF]/10 border border-primary/20 rounded-xl hover:border-primary/40 transition-all text-left group"
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
                      Describe your goal and let AI create the perfect sequence
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0">
                    Recommended
                  </Badge>
                </div>
              </button>
            )}

            {/* Quote Follow-up Templates */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                QUOTE FOLLOW-UP
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sequenceTemplates.filter(t => t.type === 'quote').map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className="p-4 bg-background border rounded-xl hover:border-primary/40 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", template.color, "text-white")}>
                        {template.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {template.name}
                          </h5>
                          {template.popular && (
                            <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 border-0">Popular</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                          <span>{template.steps} steps</span>
                          <span>•</span>
                          <span>{template.duration}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Retention Templates */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                RETENTION & ENGAGEMENT
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sequenceTemplates.filter(t => t.type === 'retention').map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className="p-4 bg-background border rounded-xl hover:border-primary/40 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", template.color, "text-white")}>
                        {template.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {template.name}
                          </h5>
                          {template.popular && (
                            <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 border-0">Popular</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                          <span>{template.steps} steps</span>
                          <span>•</span>
                          <span>{template.duration}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
