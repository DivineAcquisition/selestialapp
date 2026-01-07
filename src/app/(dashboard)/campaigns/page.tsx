"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCampaigns, Campaign, CampaignTemplate } from '@/hooks/useCampaigns';
import { AnimatedCounter } from '@/components/ui/text-effects';
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
  ArrowRight,
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
      case 'draft': return 'bg-gray-100 text-gray-600 border-0';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-0';
      case 'active': return 'bg-emerald-100 text-emerald-700 border-0';
      case 'paused': return 'bg-amber-100 text-amber-700 border-0';
      case 'completed': return 'bg-purple-100 text-purple-700 border-0';
      default: return 'bg-gray-100 text-gray-600 border-0';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seasonal': return <Sparkles className="w-5 h-5 text-pink-500" />;
      case 'holiday': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'weather': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'slow_season': return <Target className="w-5 h-5 text-amber-500" />;
      case 'custom': return <Edit className="w-5 h-5 text-gray-500" />;
      default: return <Megaphone className="w-5 h-5 text-primary" />;
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

  const handleTemplateSelect = (template: CampaignTemplate) => {
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
    } as Campaign);
    setShowBuilder(true);
  };

  return (
    <Layout title="Campaigns">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <Megaphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
              <p className="text-gray-500">Seasonal promotions & re-engagement campaigns</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowTemplates(true)} className="rounded-xl">
              <Sparkles className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button 
              onClick={() => { setEditingCampaign(null); setShowBuilder(true); }}
              className="bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats - Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Megaphone className="w-5 h-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.total} />
            </div>
            <p className="text-sm text-gray-500">Campaigns</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Send className="w-5 h-5" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Active</Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.totalSent} />
            </div>
            <p className="text-sm text-gray-500">Messages Sent</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.totalResponses} />
            </div>
            <p className="text-sm text-gray-500">Responses</p>
          </div>
          
          <div className="group card-elevated p-5 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Target className="w-5 h-5" />
              </div>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.totalBookings} />
            </div>
            <p className="text-sm text-gray-500">Bookings</p>
          </div>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="card-elevated p-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
              <Megaphone className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Create seasonal promotions and re-engagement campaigns to keep your customers coming back.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setShowTemplates(true)} className="rounded-xl">
                Browse Templates
              </Button>
              <Button 
                onClick={() => setShowBuilder(true)}
                className="bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl"
              >
                Create Campaign
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="card-elevated p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">{getTypeIcon(campaign.campaign_type)}</div>
                      <h3 className="font-semibold text-gray-900 text-lg">{campaign.name}</h3>
                      <Badge className={cn('text-xs', getStatusColor(campaign.status))}>
                        {campaign.status}
                      </Badge>
                      {campaign.has_promotion && (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          {campaign.promotion_type === 'percentage' 
                            ? `${campaign.promotion_value}% off`
                            : `$${campaign.promotion_value} off`}
                        </Badge>
                      )}
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-gray-500 mb-4">{campaign.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {campaign.start_date 
                          ? format(new Date(campaign.start_date), 'MMM d, yyyy')
                          : 'Not scheduled'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {campaign.total_targeted} targeted
                      </span>
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        {campaign.total_sent} sent
                      </span>
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {campaign.total_bookings} booked
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'draft' && (
                      <Button size="sm" onClick={() => handleSchedule(campaign.id)} className="rounded-xl">
                        <Play className="w-4 h-4 mr-1" />
                        Schedule
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => handlePause(campaign.id)} className="rounded-xl">
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => { setEditingCampaign(campaign); setShowBuilder(true); }} className="rounded-lg">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteConfirm(campaign.id)}
                          className="text-red-600 rounded-lg"
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
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The campaign and all its data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
