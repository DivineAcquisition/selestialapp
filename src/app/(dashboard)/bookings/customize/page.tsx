'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import Layout from '@/components/layout/Layout';
import { Icon, IconName } from '@/components/ui/icon';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

type Niche = 'cleaning' | 'hvac' | 'plumbing' | null;
type PricingModel = 'sqft' | 'hourly' | 'flat' | 'bedroom_bathroom' | 'custom';

interface TrustBadgeConfig {
  id: string;
  type: 'google_guaranteed' | 'google_screened' | 'bbb' | 'angies_list' | 'thumbtack' | 'homeadvisor' | 'custom';
  enabled: boolean;
  label: string;
  sublabel?: string;
  imageUrl?: string;
  verificationUrl?: string;
}

interface PricingTier {
  id: string;
  label: string;
  minValue: number;
  maxValue: number | null;
  price: number;
  enabled: boolean;
}

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  features: string[];
  basePrice: number;
  discountPercent: number;
  badge: string;
  popular: boolean;
  enabled: boolean;
}

interface BookingWidgetConfig {
  id: string;
  name: string;
  niche: Niche;
  status: 'draft' | 'active' | 'paused';
  
  // Branding
  businessName: string;
  phone: string;
  email: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  
  // Pricing Configuration
  pricingModel: PricingModel;
  pricingTiers: PricingTier[];
  hourlyRate?: number;
  flatRatePrice?: number;
  minimumPrice: number;
  
  // Services
  services: ServiceOption[];
  
  // Trust & Credibility
  trustBadges: TrustBadgeConfig[];
  showRating: boolean;
  ratingValue: number;
  reviewCount: number;
  
  // Promotion
  promotionEnabled: boolean;
  promotionHeadline: string;
  promotionSubheadline: string;
  discountPercent: number;
  promotionExpiry: string;
  
  // Settings
  depositPercent: number;
  serviceZips: string[];
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_TRUST_BADGES: TrustBadgeConfig[] = [
  { id: '1', type: 'google_guaranteed', enabled: false, label: 'Google Guaranteed', sublabel: "Backed by Google's guarantee" },
  { id: '2', type: 'google_screened', enabled: false, label: 'Google Screened', sublabel: 'Background checked' },
  { id: '3', type: 'bbb', enabled: false, label: 'BBB Accredited', sublabel: 'A+ Rating' },
  { id: '4', type: 'angies_list', enabled: false, label: "Angi's List", sublabel: 'Super Service Award' },
  { id: '5', type: 'thumbtack', enabled: false, label: 'Thumbtack Pro', sublabel: 'Top Pro' },
  { id: '6', type: 'homeadvisor', enabled: false, label: 'HomeAdvisor', sublabel: 'Screened & Approved' },
];

const DEFAULT_SQFT_TIERS: PricingTier[] = [
  { id: '1', label: 'Under 1,000', minValue: 0, maxValue: 1000, price: 149, enabled: true },
  { id: '2', label: '1,000-1,500', minValue: 1000, maxValue: 1500, price: 189, enabled: true },
  { id: '3', label: '1,500-2,000', minValue: 1500, maxValue: 2000, price: 229, enabled: true },
  { id: '4', label: '2,000-2,500', minValue: 2000, maxValue: 2500, price: 269, enabled: true },
  { id: '5', label: '2,500-3,000', minValue: 2500, maxValue: 3000, price: 309, enabled: true },
  { id: '6', label: '3,000-4,000', minValue: 3000, maxValue: 4000, price: 369, enabled: true },
  { id: '7', label: '4,000+', minValue: 4000, maxValue: null, price: 449, enabled: true },
];

const DEFAULT_BEDROOM_TIERS: PricingTier[] = [
  { id: '1', label: '1 Bedroom', minValue: 1, maxValue: 1, price: 99, enabled: true },
  { id: '2', label: '2 Bedrooms', minValue: 2, maxValue: 2, price: 149, enabled: true },
  { id: '3', label: '3 Bedrooms', minValue: 3, maxValue: 3, price: 199, enabled: true },
  { id: '4', label: '4 Bedrooms', minValue: 4, maxValue: 4, price: 249, enabled: true },
  { id: '5', label: '5+ Bedrooms', minValue: 5, maxValue: null, price: 299, enabled: true },
];

const DEFAULT_SERVICES: ServiceOption[] = [
  {
    id: '1',
    name: 'Standard Clean',
    description: 'Regular maintenance cleaning',
    features: ['Surface cleaning', 'Vacuuming & mopping', 'Kitchen & bathroom wipe-down', 'Trash removal'],
    basePrice: 0,
    discountPercent: 0,
    badge: '',
    popular: false,
    enabled: true,
  },
  {
    id: '2',
    name: 'Deep Clean',
    description: 'Intensive top-to-bottom cleaning',
    features: ['All standard clean services', 'Inside appliances', 'Baseboards & door frames', 'Window sills', 'Light fixtures'],
    basePrice: 50,
    discountPercent: 20,
    badge: 'Most Popular',
    popular: true,
    enabled: true,
  },
  {
    id: '3',
    name: 'Move In/Out',
    description: 'Complete move preparation cleaning',
    features: ['Deep clean services', 'Inside cabinets & drawers', 'Garage sweep', 'Wall spot cleaning'],
    basePrice: 100,
    discountPercent: 0,
    badge: '',
    popular: false,
    enabled: true,
  },
];

const createDefaultConfig = (businessId: string, businessName: string): BookingWidgetConfig => ({
  id: crypto.randomUUID(),
  name: 'My Booking Widget',
  niche: null,
  status: 'draft',
  businessName,
  phone: '',
  email: '',
  logoUrl: '',
  primaryColor: '#1E3A5F',
  accentColor: '#10B981',
  pricingModel: 'sqft',
  pricingTiers: DEFAULT_SQFT_TIERS,
  hourlyRate: 50,
  flatRatePrice: 200,
  minimumPrice: 99,
  services: DEFAULT_SERVICES,
  trustBadges: DEFAULT_TRUST_BADGES,
  showRating: true,
  ratingValue: 4.9,
  reviewCount: 127,
  promotionEnabled: true,
  promotionHeadline: 'Get 20% Off Your First Clean!',
  promotionSubheadline: 'Professional cleaning you can trust',
  discountPercent: 20,
  promotionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  depositPercent: 25,
  serviceZips: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// ============================================================================
// PLAN LIMITS
// ============================================================================

const PLAN_LIMITS = {
  free: { widgets: 0, name: 'Free' },
  starter: { widgets: 1, name: 'Starter' },
  basic: { widgets: 1, name: 'Basic' },
  pro: { widgets: 2, name: 'Pro' },
  enterprise: { widgets: 10, name: 'Enterprise' },
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Widget Card Component
function WidgetCard({
  widget,
  businessId,
  onEdit,
  onDelete,
  onToggleStatus,
  onPreview,
}: {
  widget: BookingWidgetConfig;
  businessId: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onPreview: () => void;
}) {
  const [showEmbed, setShowEmbed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
  };

  const bookingUrl = `https://book.selestial.io/${businessId}/${encodeURIComponent(widget.businessName.toLowerCase().replace(/\s+/g, '-'))}`;
  const embedCode = `<iframe src="${bookingUrl}" width="100%" height="800" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card className="hover:border-primary/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: widget.primaryColor }}
              >
                {widget.businessName.charAt(0) || 'B'}
              </div>
              <div>
                <h3 className="font-semibold">{widget.name}</h3>
                <p className="text-sm text-muted-foreground">{widget.businessName}</p>
              </div>
            </div>
            <Badge className={statusColors[widget.status]}>
              {widget.status.charAt(0).toUpperCase() + widget.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground">Pricing</p>
              <p className="font-medium capitalize">{widget.pricingModel.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Services</p>
              <p className="font-medium">{widget.services.filter(s => s.enabled).length} active</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deposit</p>
              <p className="font-medium">{widget.depositPercent}%</p>
            </div>
          </div>

          {/* Trust Badges Preview */}
          {widget.trustBadges.some(b => b.enabled) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {widget.trustBadges.filter(b => b.enabled).map(badge => (
                <Badge key={badge.id} variant="outline" className="text-xs">
                  <Icon name="shield" size="xs" className="mr-1" />
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={onEdit} className="flex-1 min-w-[120px]">
              <Icon name="settings" size="sm" className="mr-1" />
              Configure
            </Button>
            <Button size="sm" variant="outline" onClick={onPreview}>
              <Icon name="eye" size="sm" className="mr-1" />
              Preview
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowEmbed(true)}>
              <Icon name="code" size="sm" className="mr-1" />
              Embed
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onToggleStatus}
            >
              {widget.status === 'active' ? (
                <Icon name="pause" size="sm" />
              ) : (
                <Icon name="play" size="sm" />
              )}
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Icon name="trash" size="sm" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Embed Code Dialog */}
      <Dialog open={showEmbed} onOpenChange={setShowEmbed}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed Your Booking Widget</DialogTitle>
            <DialogDescription>
              Copy the code below to embed this widget on your website
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Booking Link */}
            <div>
              <Label className="text-xs text-muted-foreground">Direct Booking Link</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={bookingUrl} readOnly className="text-sm" />
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(bookingUrl)}>
                  <Icon name={copied ? 'check' : 'copy'} size="sm" />
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                    <Icon name="externalLink" size="sm" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Embed Code */}
            <div>
              <Label className="text-xs text-muted-foreground">Embed Code</Label>
              <div className="mt-1 relative">
                <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                  {embedCode}
                </pre>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(embedCode)}
                >
                  <Icon name={copied ? 'check' : 'copy'} size="sm" className="mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Quick Share */}
            <div className="pt-2">
              <Label className="text-xs text-muted-foreground">Quick Share</Label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`mailto:?subject=Book with ${widget.businessName}&body=Schedule your appointment: ${bookingUrl}`}>
                    <Icon name="mail" size="sm" className="mr-1" />
                    Email
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`sms:?body=Book with ${widget.businessName}: ${bookingUrl}`}>
                    <Icon name="messageSquare" size="sm" className="mr-1" />
                    SMS
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Pricing Model Selector
function PricingModelSelector({
  value,
  onChange,
}: {
  value: PricingModel;
  onChange: (model: PricingModel) => void;
}) {
  const models = [
    { id: 'sqft', label: 'Square Footage', icon: 'ruler' as IconName, description: 'Price based on home size' },
    { id: 'bedroom_bathroom', label: 'Bedroom/Bathroom', icon: 'bed' as IconName, description: 'Price based on room count' },
    { id: 'hourly', label: 'Hourly Rate', icon: 'clock' as IconName, description: 'Charge by the hour' },
    { id: 'flat', label: 'Flat Rate', icon: 'dollarSign' as IconName, description: 'Single fixed price' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onChange(model.id as PricingModel)}
          className={cn(
            "p-4 rounded-xl border-2 text-left transition-all",
            value === model.id 
              ? "border-primary bg-primary/5" 
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <Icon name={model.icon} size="lg" className={value === model.id ? "text-primary" : "text-muted-foreground"} />
          <p className="font-medium mt-2">{model.label}</p>
          <p className="text-xs text-muted-foreground">{model.description}</p>
        </button>
      ))}
    </div>
  );
}

// Trust Badge Editor
function TrustBadgeEditor({
  badges,
  onChange,
}: {
  badges: TrustBadgeConfig[];
  onChange: (badges: TrustBadgeConfig[]) => void;
}) {
  const updateBadge = (id: string, updates: Partial<TrustBadgeConfig>) => {
    onChange(badges.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const badgeIcons: Record<string, IconName> = {
    google_guaranteed: 'shield',
    google_screened: 'shieldCheck',
    bbb: 'award',
    angies_list: 'star',
    thumbtack: 'thumbsUp',
    homeadvisor: 'home',
    custom: 'badge',
  };

  return (
    <div className="space-y-3">
      {badges.map((badge) => (
        <div 
          key={badge.id}
          className={cn(
            "p-4 rounded-xl border transition-colors",
            badge.enabled ? "bg-white border-primary/30" : "bg-gray-50 border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={badge.enabled}
                onCheckedChange={(checked) => updateBadge(badge.id, { enabled: checked })}
              />
              <div className={cn("p-2 rounded-lg", badge.enabled ? "bg-primary/10" : "bg-gray-200")}>
                <Icon 
                  name={badgeIcons[badge.type] || 'badge'} 
                  size="lg" 
                  className={badge.enabled ? "text-primary" : "text-gray-400"}
                />
              </div>
              <div>
                <p className={cn("font-medium", !badge.enabled && "text-muted-foreground")}>
                  {badge.label}
                </p>
                <p className="text-xs text-muted-foreground">{badge.sublabel}</p>
              </div>
            </div>
          </div>

          {badge.enabled && (
            <div className="mt-3 pl-14 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Display Label</Label>
                  <Input
                    value={badge.label}
                    onChange={(e) => updateBadge(badge.id, { label: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sublabel</Label>
                  <Input
                    value={badge.sublabel || ''}
                    onChange={(e) => updateBadge(badge.id, { sublabel: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              {badge.type === 'google_guaranteed' && (
                <div>
                  <Label className="text-xs">Verification URL (optional)</Label>
                  <Input
                    value={badge.verificationUrl || ''}
                    onChange={(e) => updateBadge(badge.id, { verificationUrl: e.target.value })}
                    placeholder="https://google.com/localservices/..."
                    className="h-8 text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function BookingCustomizePage() {
  const { business } = useBusiness();
  const businessId = business?.id || '';
  const businessName = business?.name || 'My Business';
  const businessPlan = (business as any)?.plan || 'starter';

  // State
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [widgets, setWidgets] = React.useState<BookingWidgetConfig[]>([]);
  const [editingWidget, setEditingWidget] = React.useState<BookingWidgetConfig | null>(null);
  const [showEditor, setShowEditor] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [editorStep, setEditorStep] = React.useState<'niche' | 'config'>('niche');

  // Plan limits
  const planLimit = PLAN_LIMITS[businessPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.starter;
  const canCreateWidget = widgets.length < planLimit.widgets;

  // Load existing widgets
  React.useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    const loadWidgets = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('booking_widget_configs')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Parse config from JSON
        const parsedWidgets = (data || []).map((row: any) => ({
          ...row.config,
          id: row.id,
        }));

        setWidgets(parsedWidgets);
      } catch (error) {
        console.error('Error loading widgets:', error);
        // Don't show error toast - table might not exist yet
      } finally {
        setLoading(false);
      }
    };

    loadWidgets();
  }, [businessId]);

  // Save widget
  const saveWidget = async (widget: BookingWidgetConfig) => {
    if (!businessId) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('booking_widget_configs')
        .upsert({
          id: widget.id,
          business_id: businessId,
          config: widget,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local state
      setWidgets(prev => {
        const exists = prev.find(w => w.id === widget.id);
        if (exists) {
          return prev.map(w => w.id === widget.id ? widget : w);
        }
        return [...prev, widget];
      });

      toast.success('Booking widget saved!');
      setShowEditor(false);
      setEditingWidget(null);
    } catch (error) {
      console.error('Error saving widget:', error);
      toast.error('Failed to save widget');
    } finally {
      setSaving(false);
    }
  };

  // Delete widget
  const deleteWidget = async (id: string) => {
    if (!businessId) return;

    try {
      const { error } = await (supabase as any)
        .from('booking_widget_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWidgets(prev => prev.filter(w => w.id !== id));
      toast.success('Widget deleted');
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast.error('Failed to delete widget');
    }
    setDeleteConfirm(null);
  };

  // Toggle widget status
  const toggleWidgetStatus = async (widget: BookingWidgetConfig) => {
    const newStatus = widget.status === 'active' ? 'paused' : 'active';
    await saveWidget({ ...widget, status: newStatus, updatedAt: new Date().toISOString() });
  };

  // Create new widget
  const createNewWidget = () => {
    if (!canCreateWidget) {
      toast.error(`Your ${planLimit.name} plan allows ${planLimit.widgets} widget(s). Upgrade to create more.`);
      return;
    }

    const newWidget = createDefaultConfig(businessId, businessName);
    setEditingWidget(newWidget);
    setEditorStep('niche');
    setShowEditor(true);
  };

  // Edit existing widget
  const editWidget = (widget: BookingWidgetConfig) => {
    setEditingWidget(widget);
    setEditorStep('config');
    setShowEditor(true);
  };

  // Preview state
  const [previewWidget, setPreviewWidget] = React.useState<BookingWidgetConfig | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewStep, setPreviewStep] = React.useState(0);

  const openPreview = (widget: BookingWidgetConfig) => {
    setPreviewWidget(widget);
    setPreviewStep(0);
    setShowPreview(true);
  };

  // Handle niche selection
  const handleNicheSelect = (niche: Niche) => {
    if (!editingWidget) return;

    // Set appropriate defaults based on niche
    let pricingModel: PricingModel = 'sqft';
    let pricingTiers = DEFAULT_SQFT_TIERS;

    if (niche === 'hvac' || niche === 'plumbing') {
      pricingModel = 'flat';
    }

    setEditingWidget({
      ...editingWidget,
      niche,
      pricingModel,
      pricingTiers,
    });
    setEditorStep('config');
  };

  // Update editing widget
  const updateEditingWidget = (updates: Partial<BookingWidgetConfig>) => {
    if (!editingWidget) return;
    setEditingWidget({ ...editingWidget, ...updates, updatedAt: new Date().toISOString() });
  };

  if (loading) {
    return (
      <Layout title="Booking Widgets">
        <div className="flex items-center justify-center min-h-96">
          <Icon name="spinner" size="xl" className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Booking Widgets">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Booking Widgets</h1>
            <p className="text-muted-foreground">
              Create and manage your online booking interfaces
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <Icon name="layers" size="xs" />
              {widgets.length} / {planLimit.widgets} widgets
            </Badge>
            <Button onClick={createNewWidget} disabled={!canCreateWidget}>
              <Icon name="plus" size="sm" className="mr-2" />
              New Widget
            </Button>
          </div>
        </div>

        {/* Plan Upgrade Notice */}
        {!canCreateWidget && widgets.length > 0 && (
          <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100">
                  <Icon name="sparkles" size="lg" className="text-violet-600" />
                </div>
                <div>
                  <p className="font-medium">Need more booking widgets?</p>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to Pro for up to 2 widgets with advanced features
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <a href="/billing">Upgrade Plan</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Widgets Grid */}
        {widgets.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {widgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                businessId={businessId}
                onEdit={() => editWidget(widget)}
                onDelete={() => setDeleteConfirm(widget.id)}
                onToggleStatus={() => toggleWidgetStatus(widget)}
                onPreview={() => openPreview(widget)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="calendar" size="2xl" className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Booking Widgets Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first booking widget to let customers schedule appointments online
              </p>
              <Button onClick={createNewWidget}>
                <Icon name="plus" size="sm" className="mr-2" />
                Create Your First Widget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Widget Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={(open) => {
        if (!open) {
          setShowEditor(false);
          setEditingWidget(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editorStep === 'niche' ? 'Select Your Industry' : 'Configure Booking Widget'}
            </DialogTitle>
            <DialogDescription>
              {editorStep === 'niche' 
                ? 'Choose your home service niche to get started' 
                : 'Customize every aspect of your booking experience'
              }
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <AnimatePresence mode="wait">
              {editorStep === 'niche' ? (
                <motion.div
                  key="niche"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="py-4 space-y-4"
                >
                  {[
                    { id: 'cleaning', name: 'Cleaning', icon: 'sparkles' as IconName, available: true },
                    { id: 'hvac', name: 'HVAC', icon: 'thermometer' as IconName, available: false },
                    { id: 'plumbing', name: 'Plumbing', icon: 'droplet' as IconName, available: false },
                  ].map((niche) => (
                    <button
                      key={niche.id}
                      onClick={() => niche.available && handleNicheSelect(niche.id as Niche)}
                      disabled={!niche.available}
                      className={cn(
                        "w-full p-6 rounded-xl border-2 text-left transition-all flex items-center gap-4",
                        niche.available 
                          ? "hover:border-primary hover:bg-primary/5 cursor-pointer" 
                          : "opacity-50 cursor-not-allowed bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        niche.available ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-400"
                      )}>
                        <Icon name={niche.icon} size="xl" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{niche.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {niche.available ? 'Click to configure' : 'Coming soon'}
                        </p>
                      </div>
                      {!niche.available && (
                        <Badge variant="secondary">Coming Soon</Badge>
                      )}
                    </button>
                  ))}
                </motion.div>
              ) : editingWidget && (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="py-4 space-y-6"
                >
                  {/* Widget Name */}
                  <div>
                    <Label>Widget Name</Label>
                    <Input
                      value={editingWidget.name}
                      onChange={(e) => updateEditingWidget({ name: e.target.value })}
                      placeholder="My Booking Widget"
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  {/* Branding Section */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Icon name="palette" size="lg" />
                      Branding
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Business Name</Label>
                        <Input
                          value={editingWidget.businessName}
                          onChange={(e) => updateEditingWidget({ businessName: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={editingWidget.phone}
                          onChange={(e) => updateEditingWidget({ phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={editingWidget.primaryColor}
                            onChange={(e) => updateEditingWidget({ primaryColor: e.target.value })}
                            className="w-16 h-10 cursor-pointer"
                          />
                          <Input
                            value={editingWidget.primaryColor}
                            onChange={(e) => updateEditingWidget({ primaryColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Accent Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={editingWidget.accentColor}
                            onChange={(e) => updateEditingWidget({ accentColor: e.target.value })}
                            className="w-16 h-10 cursor-pointer"
                          />
                          <Input
                            value={editingWidget.accentColor}
                            onChange={(e) => updateEditingWidget({ accentColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Model Section */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Icon name="dollarSign" size="lg" />
                      Pricing Model
                    </h3>
                    <PricingModelSelector
                      value={editingWidget.pricingModel}
                      onChange={(model) => {
                        let tiers = editingWidget.pricingTiers;
                        if (model === 'sqft') tiers = DEFAULT_SQFT_TIERS;
                        if (model === 'bedroom_bathroom') tiers = DEFAULT_BEDROOM_TIERS;
                        updateEditingWidget({ pricingModel: model, pricingTiers: tiers });
                      }}
                    />

                    {/* Pricing Tiers */}
                    {(editingWidget.pricingModel === 'sqft' || editingWidget.pricingModel === 'bedroom_bathroom') && (
                      <div className="mt-4 space-y-2">
                        <Label>Pricing Tiers</Label>
                        {editingWidget.pricingTiers.map((tier, idx) => (
                          <div key={tier.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <Switch
                              checked={tier.enabled}
                              onCheckedChange={(checked) => {
                                const newTiers = [...editingWidget.pricingTiers];
                                newTiers[idx] = { ...tier, enabled: checked };
                                updateEditingWidget({ pricingTiers: newTiers });
                              }}
                            />
                            <span className="flex-1 font-medium">{tier.label}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <Input
                                type="number"
                                value={tier.price}
                                onChange={(e) => {
                                  const newTiers = [...editingWidget.pricingTiers];
                                  newTiers[idx] = { ...tier, price: Number(e.target.value) };
                                  updateEditingWidget({ pricingTiers: newTiers });
                                }}
                                className="w-24"
                                disabled={!tier.enabled}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {editingWidget.pricingModel === 'hourly' && (
                      <div className="mt-4">
                        <Label>Hourly Rate ($)</Label>
                        <Input
                          type="number"
                          value={editingWidget.hourlyRate}
                          onChange={(e) => updateEditingWidget({ hourlyRate: Number(e.target.value) })}
                          className="mt-1 w-32"
                        />
                      </div>
                    )}

                    {editingWidget.pricingModel === 'flat' && (
                      <div className="mt-4">
                        <Label>Flat Rate Price ($)</Label>
                        <Input
                          type="number"
                          value={editingWidget.flatRatePrice}
                          onChange={(e) => updateEditingWidget({ flatRatePrice: Number(e.target.value) })}
                          className="mt-1 w-32"
                        />
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum Price ($)</Label>
                        <Input
                          type="number"
                          value={editingWidget.minimumPrice}
                          onChange={(e) => updateEditingWidget({ minimumPrice: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Deposit Percentage: {editingWidget.depositPercent}%</Label>
                        <Slider
                          value={[editingWidget.depositPercent]}
                          onValueChange={([v]) => updateEditingWidget({ depositPercent: v })}
                          min={0}
                          max={100}
                          step={5}
                          className="mt-3"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Trust Badges Section */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Icon name="shield" size="lg" />
                      Trust Badges & Credentials
                    </h3>
                    <TrustBadgeEditor
                      badges={editingWidget.trustBadges}
                      onChange={(badges) => updateEditingWidget({ trustBadges: badges })}
                    />

                    <div className="mt-4 p-4 bg-muted rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Show Rating</Label>
                        <Switch
                          checked={editingWidget.showRating}
                          onCheckedChange={(checked) => updateEditingWidget({ showRating: checked })}
                        />
                      </div>
                      {editingWidget.showRating && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Rating (1-5)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              value={editingWidget.ratingValue}
                              onChange={(e) => updateEditingWidget({ ratingValue: Number(e.target.value) })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Review Count</Label>
                            <Input
                              type="number"
                              value={editingWidget.reviewCount}
                              onChange={(e) => updateEditingWidget({ reviewCount: Number(e.target.value) })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Services Section */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Icon name="layers" size="lg" />
                      Service Options
                    </h3>
                    <div className="space-y-3">
                      {editingWidget.services.map((service, idx) => (
                        <div 
                          key={service.id}
                          className={cn(
                            "p-4 rounded-xl border transition-colors",
                            service.enabled ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-70"
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={service.enabled}
                                onCheckedChange={(checked) => {
                                  const newServices = [...editingWidget.services];
                                  newServices[idx] = { ...service, enabled: checked };
                                  updateEditingWidget({ services: newServices });
                                }}
                              />
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-xs text-muted-foreground">{service.description}</p>
                              </div>
                            </div>
                            {service.popular && (
                              <Badge className="bg-violet-100 text-violet-700">Popular</Badge>
                            )}
                          </div>
                          
                          {service.enabled && (
                            <div className="pl-12 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Service Name</Label>
                                  <Input
                                    value={service.name}
                                    onChange={(e) => {
                                      const newServices = [...editingWidget.services];
                                      newServices[idx] = { ...service, name: e.target.value };
                                      updateEditingWidget({ services: newServices });
                                    }}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Add-on Price ($)</Label>
                                  <Input
                                    type="number"
                                    value={service.basePrice}
                                    onChange={(e) => {
                                      const newServices = [...editingWidget.services];
                                      newServices[idx] = { ...service, basePrice: Number(e.target.value) };
                                      updateEditingWidget({ services: newServices });
                                    }}
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Description</Label>
                                <Input
                                  value={service.description}
                                  onChange={(e) => {
                                    const newServices = [...editingWidget.services];
                                    newServices[idx] = { ...service, description: e.target.value };
                                    updateEditingWidget({ services: newServices });
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={service.popular}
                                    onCheckedChange={(checked) => {
                                      const newServices = [...editingWidget.services];
                                      newServices[idx] = { ...service, popular: checked };
                                      updateEditingWidget({ services: newServices });
                                    }}
                                  />
                                  <Label className="text-xs">Mark as Popular</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Discount %</Label>
                                  <Input
                                    type="number"
                                    value={service.discountPercent}
                                    onChange={(e) => {
                                      const newServices = [...editingWidget.services];
                                      newServices[idx] = { ...service, discountPercent: Number(e.target.value) };
                                      updateEditingWidget({ services: newServices });
                                    }}
                                    className="h-8 w-20 text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const newService: ServiceOption = {
                            id: crypto.randomUUID(),
                            name: 'New Service',
                            description: 'Service description',
                            features: [],
                            basePrice: 0,
                            discountPercent: 0,
                            badge: '',
                            popular: false,
                            enabled: true,
                          };
                          updateEditingWidget({ services: [...editingWidget.services, newService] });
                        }}
                      >
                        <Icon name="plus" size="sm" className="mr-1" />
                        Add Service Option
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Promotion Section */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Icon name="tag" size="lg" />
                      Promotion
                    </h3>
                    <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
                      <Label>Enable Promotion Banner</Label>
                      <Switch
                        checked={editingWidget.promotionEnabled}
                        onCheckedChange={(checked) => updateEditingWidget({ promotionEnabled: checked })}
                      />
                    </div>
                    {editingWidget.promotionEnabled && (
                      <div className="space-y-4">
                        <div>
                          <Label>Headline</Label>
                          <Input
                            value={editingWidget.promotionHeadline}
                            onChange={(e) => updateEditingWidget({ promotionHeadline: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Subheadline</Label>
                          <Input
                            value={editingWidget.promotionSubheadline}
                            onChange={(e) => updateEditingWidget({ promotionSubheadline: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Discount %</Label>
                            <Input
                              type="number"
                              value={editingWidget.discountPercent}
                              onChange={(e) => updateEditingWidget({ discountPercent: Number(e.target.value) })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Expiry Date</Label>
                            <Input
                              type="date"
                              value={editingWidget.promotionExpiry.split('T')[0]}
                              onChange={(e) => updateEditingWidget({ promotionExpiry: new Date(e.target.value).toISOString() })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Service Zones */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Icon name="mapPin" size="lg" />
                      Service Zones
                    </h3>
                    <div>
                      <Label>Service ZIP Codes</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Enter ZIP codes separated by commas
                      </p>
                      <Textarea
                        value={editingWidget.serviceZips.join(', ')}
                        onChange={(e) => {
                          const zips = e.target.value.split(',').map(z => z.trim()).filter(Boolean);
                          updateEditingWidget({ serviceZips: zips });
                        }}
                        placeholder="90210, 90211, 90212..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            {editorStep === 'config' && (
              <Button variant="ghost" onClick={() => setEditorStep('niche')}>
                <Icon name="chevronLeft" size="sm" className="mr-1" />
                Change Industry
              </Button>
            )}
            <div className="flex-1" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              {editorStep === 'config' && editingWidget && (
                <Button onClick={() => saveWidget(editingWidget)} disabled={saving}>
                  {saving ? (
                    <><Icon name="spinner" size="sm" className="animate-spin mr-2" /> Saving...</>
                  ) : (
                    <><Icon name="save" size="sm" className="mr-2" /> Save Widget</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking Widget?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The widget will be permanently deleted and any
              embedded instances will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteWidget(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Widget Preview</DialogTitle>
            <DialogDescription>
              See how your booking widget will look to customers
            </DialogDescription>
          </DialogHeader>

          {previewWidget && (
            <div className="flex-1 overflow-auto">
              {/* Step Selector */}
              <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
                {['ZIP Code', 'Home Size', 'Service', 'Checkout', 'Schedule', 'Confirm'].map((step, idx) => (
                  <button
                    key={step}
                    onClick={() => setPreviewStep(idx)}
                    className={cn(
                      "flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors",
                      previewStep === idx 
                        ? "bg-white shadow text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {step}
                  </button>
                ))}
              </div>

              {/* Preview Frame */}
              <div 
                className="rounded-xl border-2 overflow-hidden"
                style={{ borderColor: previewWidget.primaryColor + '30' }}
              >
                {/* Header Preview */}
                <div 
                  className="p-4 text-white"
                  style={{ backgroundColor: previewWidget.primaryColor }}
                >
                  <div className="flex items-center gap-3">
                    {previewWidget.logoUrl ? (
                      <img src={previewWidget.logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center font-bold">
                        {previewWidget.businessName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{previewWidget.businessName}</p>
                      <p className="text-sm opacity-80">{previewWidget.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Promotion Banner Preview */}
                {previewWidget.promotionEnabled && (
                  <div 
                    className="p-3 text-center text-sm"
                    style={{ backgroundColor: previewWidget.accentColor + '20' }}
                  >
                    <p className="font-semibold" style={{ color: previewWidget.accentColor }}>
                      {previewWidget.promotionHeadline}
                    </p>
                    <p className="text-xs text-muted-foreground">{previewWidget.promotionSubheadline}</p>
                  </div>
                )}

                {/* Trust Badges Preview */}
                {previewWidget.trustBadges.some(b => b.enabled) && (
                  <div className="p-3 flex flex-wrap justify-center gap-2 border-b">
                    {previewWidget.trustBadges.filter(b => b.enabled).map(badge => (
                      <div key={badge.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                        <Icon name="shield" size="xs" className="text-green-600" />
                        <span className="font-medium">{badge.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step Content Preview */}
                <div className="p-6 min-h-[300px]">
                  {previewStep === 0 && (
                    <div className="text-center">
                      <Icon name="mapPin" size="2xl" className="mx-auto mb-3 text-muted-foreground" />
                      <h3 className="font-semibold mb-1">Enter Your ZIP Code</h3>
                      <p className="text-sm text-muted-foreground mb-4">Check if we service your area</p>
                      <Input placeholder="Enter ZIP code" className="max-w-[200px] mx-auto" readOnly />
                    </div>
                  )}

                  {previewStep === 1 && (
                    <div>
                      <h3 className="font-semibold mb-3">Select Your Home Size</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {previewWidget.pricingTiers.filter(t => t.enabled).slice(0, 4).map(tier => (
                          <div key={tier.id} className="p-3 border rounded-lg text-center hover:border-primary/50 transition-colors">
                            <p className="font-medium text-sm">{tier.label}</p>
                            <p className="text-lg font-bold" style={{ color: previewWidget.primaryColor }}>
                              ${tier.price}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewStep === 2 && (
                    <div>
                      <h3 className="font-semibold mb-3">Choose Your Service</h3>
                      <div className="space-y-2">
                        {previewWidget.services.filter(s => s.enabled).map(service => (
                          <div 
                            key={service.id} 
                            className={cn(
                              "p-3 border rounded-lg flex items-center justify-between",
                              service.popular && "border-primary/50 bg-primary/5"
                            )}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{service.name}</p>
                                {service.popular && (
                                  <Badge className="text-[10px]" style={{ backgroundColor: previewWidget.accentColor }}>
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{service.description}</p>
                            </div>
                            <p className="font-bold text-sm">
                              {service.basePrice > 0 ? `+$${service.basePrice}` : 'Included'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewStep === 3 && (
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Checkout Preview</h3>
                      <div className="p-4 bg-gray-50 rounded-lg max-w-sm mx-auto">
                        <div className="flex justify-between mb-2 text-sm">
                          <span>Deep Clean</span>
                          <span>$249</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm text-green-600">
                          <span>First-time Discount</span>
                          <span>-$50</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>$199</span>
                        </div>
                        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                          <span>Deposit ({previewWidget.depositPercent}%): </span>
                          <span className="font-medium">${Math.round(199 * previewWidget.depositPercent / 100)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {previewStep === 4 && (
                    <div className="text-center">
                      <Icon name="calendar" size="2xl" className="mx-auto mb-3 text-muted-foreground" />
                      <h3 className="font-semibold mb-1">Select Date & Time</h3>
                      <p className="text-sm text-muted-foreground">Choose your preferred appointment slot</p>
                    </div>
                  )}

                  {previewStep === 5 && (
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                        style={{ backgroundColor: previewWidget.accentColor + '20' }}
                      >
                        <span style={{ color: previewWidget.accentColor }}>
                          <Icon name="check" size="2xl" />
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">Booking Confirmed!</h3>
                      <p className="text-sm text-muted-foreground">Thank you for booking with {previewWidget.businessName}</p>
                    </div>
                  )}
                </div>

                {/* Rating Footer */}
                {previewWidget.showRating && (
                  <div className="p-3 border-t bg-gray-50 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon 
                          key={star} 
                          name="star" 
                          size="sm" 
                          className={star <= Math.round(previewWidget.ratingValue) ? "text-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                      <span className="ml-1 font-semibold">{previewWidget.ratingValue}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Based on {previewWidget.reviewCount} reviews</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button asChild>
              <a 
                href={`https://book.selestial.io/${businessId}/${encodeURIComponent(previewWidget?.businessName.toLowerCase().replace(/\s+/g, '-') || '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="externalLink" size="sm" className="mr-1" />
                Open Full Preview
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
