import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCampaigns, Campaign, CampaignFormData } from '@/hooks/useCampaigns';
import { useBusiness } from '@/contexts/BusinessContext';
import { Loader2, Calendar, Users, MessageSquare, Percent } from 'lucide-react';

interface CampaignBuilderProps {
  open: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
}

const CAMPAIGN_TYPES = [
  { value: 'seasonal', label: '🌸 Seasonal', description: 'Spring cleaning, fall prep, etc.' },
  { value: 'holiday', label: '🎉 Holiday', description: 'Memorial Day, Thanksgiving, etc.' },
  { value: 'slow_season', label: '📉 Slow Season', description: 'Discounts during low demand' },
  { value: 'custom', label: '✏️ Custom', description: 'Create your own campaign' },
];

const AUDIENCES = [
  { value: 'all', label: 'All Customers' },
  { value: 'past_customers', label: 'Past Customers' },
  { value: 'dormant', label: 'Dormant (60+ days)' },
  { value: 'recurring', label: 'Recurring Customers' },
  { value: 'one_time', label: 'One-Time Customers' },
  { value: 'at_risk', label: 'At-Risk Customers' },
];

export default function CampaignBuilder({ open, onClose, campaign }: CampaignBuilderProps) {
  const { business } = useBusiness();
  const { createCampaign, updateCampaign } = useCampaigns();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    campaign_type: 'seasonal',
    target_audience: 'past_customers',
    min_days_since_service: undefined,
    exclude_recent_days: 7,
    start_date: '',
    channel: 'sms',
    sms_message: '',
    has_promotion: false,
    promotion_type: 'percentage',
    promotion_value: undefined,
    promotion_code: '',
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        campaign_type: campaign.campaign_type || 'seasonal',
        target_audience: campaign.target_audience || 'past_customers',
        min_days_since_service: campaign.min_days_since_service || undefined,
        max_days_since_service: campaign.max_days_since_service || undefined,
        exclude_recent_days: campaign.exclude_recent_days || 7,
        start_date: campaign.started_at?.split('T')[0] || '',
        end_date: campaign.completed_at?.split('T')[0] || '',
        send_time: campaign.send_time?.toString() || '10:00',
        channel: campaign.channel || 'sms',
        sms_message: campaign.sms_message || '',
        email_subject: campaign.email_subject || '',
        email_body: campaign.email_body || '',
        has_promotion: false,
        promotion_type: 'percentage',
        promotion_value: undefined,
        promotion_code: '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        campaign_type: 'seasonal',
        target_audience: 'past_customers',
        min_days_since_service: undefined,
        exclude_recent_days: 7,
        start_date: '',
        channel: 'sms',
        sms_message: '',
        has_promotion: false,
        promotion_type: 'percentage',
        promotion_value: undefined,
        promotion_code: '',
      });
    }
  }, [campaign, open]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.sms_message) return;
    
    setSaving(true);
    try {
      if (campaign?.id) {
        await updateCampaign(campaign.id, formData);
      } else {
        await createCampaign(formData);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const insertMergeField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      sms_message: prev.sms_message + `{{${field}}}`,
    }));
  };

  const mergeFields = [
    { key: 'customer_first_name', label: 'First Name' },
    { key: 'customer_name', label: 'Full Name' },
    { key: 'business_name', label: 'Business Name' },
    { key: 'owner_first_name', label: 'Owner Name' },
    { key: 'promotion_value', label: 'Discount Value' },
    { key: 'promotion_code', label: 'Promo Code' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign?.id ? 'Edit Campaign' : 'Create Campaign'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Spring Cleaning Special"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this campaign"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Campaign Type</Label>
                <Select
                  value={formData.campaign_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Audience</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map(aud => (
                      <SelectItem key={aud.value} value={aud.value}>
                        {aud.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Send Time</Label>
                <Input
                  type="time"
                  value={formData.send_time || '10:00'}
                  onChange={(e) => setFormData(prev => ({ ...prev, send_time: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Targeting Filters
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Days Since Service</Label>
                <Input
                  type="number"
                  value={formData.min_days_since_service || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    min_days_since_service: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="e.g., 30"
                />
              </div>
              <div>
                <Label>Exclude Recently Contacted (days)</Label>
                <Input
                  type="number"
                  value={formData.exclude_recent_days || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    exclude_recent_days: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="e.g., 7"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message
            </h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>SMS Message</Label>
                <div className="flex gap-1">
                  {mergeFields.map(field => (
                    <Button
                      key={field.key}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => insertMergeField(field.key)}
                    >
                      {field.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                value={formData.sms_message}
                onChange={(e) => setFormData(prev => ({ ...prev, sms_message: e.target.value }))}
                placeholder="Hi {{customer_first_name}}, spring cleaning season is here! Book now and save..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.sms_message?.length || 0} characters
              </p>
            </div>
          </div>

          {/* Promotion */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Promotion
              </h3>
              <Switch
                checked={formData.has_promotion}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_promotion: checked }))}
              />
            </div>
            
            {formData.has_promotion && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Discount Type</Label>
                  <Select
                    value={formData.promotion_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, promotion_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Off</SelectItem>
                      <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                      <SelectItem value="free_addon">Free Add-On</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={formData.promotion_value || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      promotion_value: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder={formData.promotion_type === 'percentage' ? '15' : '25'}
                  />
                </div>
                <div>
                  <Label>Promo Code (optional)</Label>
                  <Input
                    value={formData.promotion_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, promotion_code: e.target.value.toUpperCase() }))}
                    placeholder="SPRING15"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !formData.name || !formData.sms_message}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {campaign?.id ? 'Save Changes' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
