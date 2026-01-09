"use client";

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import SequenceList from '@/components/sequences/SequenceList';
import SequenceEditor from '@/components/sequences/SequenceEditor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { Icon, IconName } from '@/components/ui/icon';
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
import type { TablesInsert } from '@/integrations/supabase/types';
import type { Sequence, SequenceStep } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ALL_TEMPLATES, TEMPLATES_BY_CATEGORY } from '@/lib/sequences/templates';

const TEMPLATE_ICONS: Record<string, IconName> = {
  zap: 'bolt',
  leaf: 'leaf',
  flame: 'fire',
  hand: 'loyalty',
  refresh: 'repeat',
  gift: 'gift',
};

const sequenceTemplates = [
  {
    id: 'quick-follow-up',
    name: 'Quick Follow-Up',
    icon: 'zap',
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
    icon: 'leaf',
    description: 'Soft touch sequence over 2 weeks',
    type: 'quote',
    steps: 5,
    duration: '14 days',
    color: 'bg-emerald-500',
  },
  {
    id: 'urgency-builder',
    name: 'Urgency Builder',
    icon: 'flame',
    description: 'Create FOMO with limited availability',
    type: 'quote',
    steps: 4,
    duration: '4 days',
    color: 'bg-red-500',
  },
  {
    id: 'retention-welcome',
    name: 'Welcome & Thank You',
    icon: 'hand',
    description: 'Post-job follow-up for reviews & referrals',
    type: 'retention',
    steps: 3,
    duration: '30 days',
    color: 'bg-purple-500',
  },
  {
    id: 'retention-reactivation',
    name: 'Customer Reactivation',
    icon: 'refresh',
    description: 'Win back past customers',
    type: 'retention',
    steps: 4,
    duration: '90 days',
    color: 'bg-blue-500',
  },
  {
    id: 'seasonal-promo',
    name: 'Seasonal Promo',
    icon: 'gift',
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

  // Template ID can be used in future to pre-populate the editor with template data
  const handleSelectTemplate = async (/* templateId: string */) => {
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
        steps: sequenceData.steps as unknown as TablesInsert<'sequences'>['steps'],
        is_active: sequenceData.is_active,
      });
    } else {
      const sequence: Omit<TablesInsert<'sequences'>, 'business_id'> = {
        name: sequenceData.name,
        description: sequenceData.description,
        steps: sequenceData.steps as unknown as TablesInsert<'sequences'>['steps'],
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
        <div className="flex items-center justify-center py-20">
          <Icon name="spinner" size="2xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Sequences">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
            <Icon name="bolt" size="xl" className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Sequence Builder</h1>
            <p className="text-gray-500">Automated follow-ups and customer engagement</p>
          </div>
        </div>

        {/* Stats - Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group card-elevated p-5 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary text-white">
                <Icon name="robot" size="lg" />
              </div>
              <Icon name="arrowRight" size="sm" className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.total} />
            </div>
            <p className="text-sm text-gray-500">Total Sequences</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Icon name="play" size="lg" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                Live
              </Badge>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              <AnimatedCounter value={stats.active} />
            </div>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Icon name="message" size="lg" />
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-600 mb-1">
              <AnimatedCounter value={stats.quoteFollowUp} />
            </div>
            <p className="text-sm text-gray-500">Quote Follow-ups</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Icon name="heart" size="lg" />
              </div>
              <Icon name="sparkles" size="sm" className="text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              <AnimatedCounter value={stats.retention} />
            </div>
            <p className="text-sm text-gray-500">Retention</p>
          </div>
        </div>

        {/* Template Library Promo */}
        <Card className="card-elevated p-5 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
                <Icon name="bookOpen" size="xl" className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {ALL_TEMPLATES.length}+ Pre-Built Sequence Templates
                </h3>
                <p className="text-sm text-gray-600">
                  Speed-to-lead, quote follow-up, retention, seasonal campaigns, and more
                </p>
              </div>
            </div>
            <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 rounded-xl gap-2">
              <Link href="/sequences/templates">
                <Icon name="sparkles" size="sm" />
                Browse Templates
              </Link>
            </Button>
          </div>
        </Card>

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
              <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search sequences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <div className="flex items-center border rounded-xl overflow-hidden">
              <button
                onClick={() => setFilterType('all')}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  filterType === 'all' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('quote')}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  filterType === 'quote' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                Quote
              </button>
              <button
                onClick={() => setFilterType('retention')}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  filterType === 'retention' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                Retention
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon name="grid" size="sm" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon name="list" size="sm" />
              </button>
            </div>
            
            {hasAIBuilder && (
              <Button variant="outline" className="gap-2 rounded-xl" onClick={handleGenerateWithAI}>
                <Icon name="magic" size="sm" />
                AI Generate
              </Button>
            )}
            <Button onClick={handleCreate} className="gap-2 bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl">
              <Icon name="plus" size="sm" />
              New Sequence
            </Button>
          </div>
        </div>
        
        {filteredSequences.length === 0 ? (
          <Card className="card-elevated flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="sparkles" size="3xl" className="text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">
              {searchQuery || filterType !== 'all' ? 'No sequences found' : 'No sequences yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-8 max-w-md">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create automated follow-up sequences to nurture leads and retain customers.'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Button onClick={handleCreate} className="gap-2 bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl">
                <Icon name="plus" size="sm" />
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
                    "card-elevated p-5 hover:shadow-lg transition-all cursor-pointer group",
                    !sequence.is_active && "opacity-60"
                  )}
                  onClick={() => handleEdit(sequence)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        isQuoteType ? "bg-amber-100" : "bg-purple-100"
                      )}>
                        {isQuoteType ? <Icon name="message" size="xl" className="text-amber-600" /> : <Icon name="heart" size="xl" className="text-purple-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{sequence.name}</h3>
                          {sequence.is_default && (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] gap-1">
                              <Icon name="crown" size="xs" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] mt-1 rounded-lg">
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
                        "p-2 rounded-xl transition-colors",
                        sequence.is_active 
                          ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" 
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      )}
                    >
                      {sequence.is_active ? <Icon name="play" size="sm" /> : <Icon name="pause" size="sm" />}
                    </button>
                  </div>
                  
                  {sequence.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {sequence.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                      <Icon name="message" size="xs" />
                      {smsCount} SMS
                    </span>
                    {emailCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        {emailCount} Email
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Icon name="clock" size="xs" />
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="sparkles" size="lg" className="text-primary" />
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
                className="w-full p-5 bg-gradient-to-r from-primary/10 to-[#9D96FF]/10 border border-primary/20 rounded-2xl hover:border-primary/40 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl text-white shadow-lg shadow-primary/20">
                    {generatingAI ? (
                      <Icon name="spinner" size="xl" className="animate-spin" />
                    ) : (
                      <Icon name="magic" size="xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      Generate with AI
                    </h4>
                    <p className="text-sm text-gray-500">
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
              <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Icon name="message" size="sm" />
                Quote Follow-up
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sequenceTemplates.filter(t => t.type === 'quote').map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate()}
                    className="p-4 bg-white border rounded-xl hover:border-primary/40 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", template.color, "text-white shadow-lg")}>
                        <Icon name={TEMPLATE_ICONS[template.icon] || 'bolt'} size="xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                            {template.name}
                          </h5>
                          {template.popular && (
                            <Badge className="text-[10px] bg-amber-100 text-amber-700 border-0">Popular</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
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
              <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Icon name="heart" size="sm" />
                Retention & Engagement
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sequenceTemplates.filter(t => t.type === 'retention').map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate()}
                    className="p-4 bg-white border rounded-xl hover:border-primary/40 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", template.color, "text-white shadow-lg")}>
                        <Icon name={TEMPLATE_ICONS[template.icon] || 'heart'} size="xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                            {template.name}
                          </h5>
                          {template.popular && (
                            <Badge className="text-[10px] bg-amber-100 text-amber-700 border-0">Popular</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
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
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Icon name="plus" size="sm" />
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
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Sequence</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{sequenceToDelete?.name}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleting}
              className="rounded-xl"
            >
              {deleting && <Icon name="spinner" size="sm" className="mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
