"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCampaigns, Campaign } from '@/hooks/useCampaigns';
import { format } from 'date-fns';
import Layout from '@/components/layout/Layout';
import CampaignBuilder from '@/components/campaigns/CampaignBuilder';
import CampaignTemplateLibrary from '@/components/campaigns/CampaignTemplateLibrary';
import {
  Megaphone,
  Plus,
  Calendar,
  Users,
  TrendingUp,
  Play,
  Pause,
  Trash2,
  Edit,
  Loader2,
  Sparkles,
  Send,
  Target,
  MessageSquare,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CampaignsPage() {
  const { campaigns, loading, stats, scheduleCampaign, pauseCampaign, deleteCampaign } = useCampaigns();
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'paused': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'completed': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seasonal': return '🌸';
      case 'holiday': return '🎉';
      case 'weather': return '🌤️';
      case 'slow_season': return '📉';
      case 'custom': return '✏️';
      default: return '📣';
    }
  };

  const handleSchedule = async (id: string) => {
    await scheduleCampaign(id);
  };

  const handlePause = async (id: string) => {
    await pauseCampaign(id);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteCampaign(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setShowTemplates(false);
    setEditingCampaign({
      id: '',
      name: template.name,
      description: template.description,
      campaign_type: template.campaign_type,
      target_audience: template.default_audience || 'past_customers',
      min_days_since_service: template.default_min_days,
      max_days_since_service: template.default_max_days,
      sms_message: template.sms_template,
      has_promotion: !!template.suggested_promotion_type,
      promotion_type: template.suggested_promotion_type,
      promotion_value: template.suggested_promotion_value,
      channel: 'sms',
      status: 'draft',
    } as any);
    setShowBuilder(true);
  };

  return (
    <Layout title="Campaigns">
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground">Seasonal promotions & re-engagement campaigns</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button onClick={() => { setEditingCampaign(null); setShowBuilder(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Campaigns</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Send className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSent}</p>
                <p className="text-sm text-muted-foreground">Sent</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalResponses}</p>
                <p className="text-sm text-muted-foreground">Responses</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Target className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
                <p className="text-sm text-muted-foreground">Bookings</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Megaphone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create seasonal promotions and re-engagement campaigns to keep your customers coming back.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setShowTemplates(true)}>
                Browse Templates
              </Button>
              <Button onClick={() => setShowBuilder(true)}>
                Create Campaign
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getTypeIcon(campaign.campaign_type)}</span>
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <Badge className={cn('text-xs', getStatusColor(campaign.status))}>
                        {campaign.status}
                      </Badge>
                      {campaign.has_promotion && (
                        <Badge variant="outline" className="text-xs">
                          {campaign.promotion_type === 'percentage' 
                            ? `${campaign.promotion_value}% off`
                            : `$${campaign.promotion_value} off`}
                        </Badge>
                      )}
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {campaign.start_date 
                          ? format(new Date(campaign.start_date), 'MMM d, yyyy')
                          : 'Not scheduled'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {campaign.total_targeted} targeted
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Send className="w-4 h-4" />
                        {campaign.total_sent} sent
                      </span>
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" />
                        {campaign.total_bookings} booked
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'draft' && (
                      <Button size="sm" onClick={() => handleSchedule(campaign.id)}>
                        <Play className="w-4 h-4 mr-1" />
                        Schedule
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => handlePause(campaign.id)}>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingCampaign(campaign); setShowBuilder(true); }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteConfirm(campaign.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Builder Dialog */}
      <CampaignBuilder
        open={showBuilder}
        onClose={() => { setShowBuilder(false); setEditingCampaign(null); }}
        campaign={editingCampaign}
      />

      {/* Template Library Dialog */}
      <CampaignTemplateLibrary
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The campaign and all its data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
