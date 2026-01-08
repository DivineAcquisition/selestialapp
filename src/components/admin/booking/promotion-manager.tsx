'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon, IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

interface Promotion {
  id: string;
  name: string;
  slug: string;
  promo_type: 'banner' | 'badge' | 'popup' | 'countdown' | 'seasonal_pricing' | 'flash_sale';
  active: boolean;
  start_date?: string;
  end_date?: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  cta_text?: string;
  banner_config: {
    position: 'top' | 'bottom' | 'inline';
    sticky: boolean;
    dismissible: boolean;
    background_type: 'solid' | 'gradient';
    background_color: string;
    gradient_from: string;
    gradient_to: string;
    text_color: string;
    animation: 'none' | 'pulse' | 'slide' | 'fade';
  };
  countdown_config: {
    show_days: boolean;
    show_hours: boolean;
    show_minutes: boolean;
    show_seconds: boolean;
    expired_message: string;
    style: 'boxes' | 'inline' | 'minimal';
  };
  has_pricing_impact: boolean;
  discount_type?: 'percentage' | 'flat' | 'fixed_price';
  discount_value?: number;
  promo_code?: string;
  discount_conditions: {
    applies_to_services: string[];
    minimum_order?: number;
    first_time_only: boolean;
    new_customers_only: boolean;
    requires_code: boolean;
  };
  priority: number;
}

interface PromotionManagerProps {
  businessId: string;
  promotions: Promotion[];
  serviceTypes: Array<{ id: string; name: string }>;
  onSave: (promotions: Promotion[]) => Promise<void>;
}

// ============================================================================
// PROMO TYPE OPTIONS
// ============================================================================

const PROMO_TYPES: Array<{ value: string; label: string; description: string; icon: IconName }> = [
  { value: 'banner', label: 'Banner', description: 'Top/bottom announcement bar', icon: 'megaphone' },
  { value: 'badge', label: 'Badge', description: 'Label on services', icon: 'tag' },
  { value: 'countdown', label: 'Countdown', description: 'Limited time offer timer', icon: 'timer' },
  { value: 'popup', label: 'Popup', description: 'Modal announcement', icon: 'gift' },
  { value: 'seasonal_pricing', label: 'Seasonal', description: 'Automatic price adjustments', icon: 'calendar' },
  { value: 'flash_sale', label: 'Flash Sale', description: 'Quick limited offer', icon: 'sparkles' },
];

// ============================================================================
// DEFAULT PROMO
// ============================================================================

const DEFAULT_PROMO: Partial<Promotion> = {
  name: '',
  slug: '',
  promo_type: 'banner',
  active: false,
  headline: '',
  subheadline: '',
  cta_text: '',
  banner_config: {
    position: 'top',
    sticky: false,
    dismissible: true,
    background_type: 'gradient',
    background_color: '#7c3aed',
    gradient_from: '#7c3aed',
    gradient_to: '#4f46e5',
    text_color: '#ffffff',
    animation: 'none',
  },
  countdown_config: {
    show_days: true,
    show_hours: true,
    show_minutes: true,
    show_seconds: false,
    expired_message: 'Offer has ended',
    style: 'boxes',
  },
  has_pricing_impact: false,
  discount_conditions: {
    applies_to_services: [],
    first_time_only: false,
    new_customers_only: false,
    requires_code: false,
  },
  priority: 0,
};

// ============================================================================
// PREVIEW COMPONENT
// ============================================================================

function BannerPreview({ promo }: { promo: Partial<Promotion> }) {
  const config = promo.banner_config || DEFAULT_PROMO.banner_config!;
  
  const style: React.CSSProperties = {
    background: config.background_type === 'gradient'
      ? `linear-gradient(to right, ${config.gradient_from}, ${config.gradient_to})`
      : config.background_color,
    color: config.text_color,
  };
  
  return (
    <div
      className={cn(
        'p-3 rounded-lg text-center',
        config.animation === 'pulse' && 'animate-pulse'
      )}
      style={style}
    >
      <p className="font-semibold">{promo.headline || 'Your headline here'}</p>
      {promo.subheadline && (
        <p className="text-sm opacity-90">{promo.subheadline}</p>
      )}
      {promo.cta_text && (
        <button
          className="mt-2 px-4 py-1 rounded-full text-sm font-medium"
          style={{ background: config.text_color, color: config.background_color }}
        >
          {promo.cta_text}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// COUNTDOWN PREVIEW
// ============================================================================

function CountdownPreview({ promo }: { promo: Partial<Promotion> }) {
  const config = promo.countdown_config || DEFAULT_PROMO.countdown_config!;
  
  // Mock countdown values
  const values = { days: 3, hours: 14, minutes: 32, seconds: 45 };
  
  if (config.style === 'boxes') {
    return (
      <div className="flex justify-center gap-2">
        {config.show_days && (
          <div className="bg-violet-600 text-white px-3 py-2 rounded-lg text-center min-w-14">
            <p className="text-2xl font-bold">{values.days}</p>
            <p className="text-xs opacity-80">Days</p>
          </div>
        )}
        {config.show_hours && (
          <div className="bg-violet-600 text-white px-3 py-2 rounded-lg text-center min-w-14">
            <p className="text-2xl font-bold">{values.hours}</p>
            <p className="text-xs opacity-80">Hours</p>
          </div>
        )}
        {config.show_minutes && (
          <div className="bg-violet-600 text-white px-3 py-2 rounded-lg text-center min-w-14">
            <p className="text-2xl font-bold">{values.minutes}</p>
            <p className="text-xs opacity-80">Mins</p>
          </div>
        )}
        {config.show_seconds && (
          <div className="bg-violet-600 text-white px-3 py-2 rounded-lg text-center min-w-14">
            <p className="text-2xl font-bold">{values.seconds}</p>
            <p className="text-xs opacity-80">Secs</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-violet-600">
        {config.show_days && `${values.days}d `}
        {config.show_hours && `${values.hours}h `}
        {config.show_minutes && `${values.minutes}m `}
        {config.show_seconds && `${values.seconds}s`}
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PromotionManager({
  businessId,
  promotions: initialPromotions,
  serviceTypes,
  onSave,
}: PromotionManagerProps) {
  const [promotions, setPromotions] = React.useState<Promotion[]>(initialPromotions);
  const [editingPromo, setEditingPromo] = React.useState<Promotion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('content');
  
  // Form state
  const [formData, setFormData] = React.useState<Partial<Promotion>>(DEFAULT_PROMO);
  
  // Initialize form for new promo
  const handleAddPromo = () => {
    setFormData({ ...DEFAULT_PROMO });
    setEditingPromo(null);
    setActiveTab('content');
    setIsDialogOpen(true);
  };
  
  // Initialize form for editing
  const handleEditPromo = (promo: Promotion) => {
    setFormData(promo);
    setEditingPromo(promo);
    setActiveTab('content');
    setIsDialogOpen(true);
  };
  
  // Update form data
  const updateForm = (updates: Partial<Promotion>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };
  
  const updateBannerConfig = (updates: Partial<Promotion['banner_config']>) => {
    setFormData((prev) => ({
      ...prev,
      banner_config: { ...prev.banner_config, ...updates } as Promotion['banner_config'],
    }));
  };
  
  const updateCountdownConfig = (updates: Partial<Promotion['countdown_config']>) => {
    setFormData((prev) => ({
      ...prev,
      countdown_config: { ...prev.countdown_config, ...updates } as Promotion['countdown_config'],
    }));
  };
  
  const updateDiscountConditions = (updates: Partial<Promotion['discount_conditions']>) => {
    setFormData((prev) => ({
      ...prev,
      discount_conditions: { ...prev.discount_conditions, ...updates } as Promotion['discount_conditions'],
    }));
  };
  
  // Save promotion
  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }
    
    setSaving(true);
    
    try {
      // Generate slug
      if (!formData.slug) {
        formData.slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      
      let updatedPromotions: Promotion[];
      
      if (editingPromo) {
        updatedPromotions = promotions.map((p) =>
          p.id === editingPromo.id ? { ...p, ...formData } as Promotion : p
        );
      } else {
        const newPromo: Promotion = {
          ...formData,
          id: crypto.randomUUID(),
        } as Promotion;
        updatedPromotions = [...promotions, newPromo];
      }
      
      await onSave(updatedPromotions);
      setPromotions(updatedPromotions);
      setIsDialogOpen(false);
      toast.success(editingPromo ? 'Promotion updated' : 'Promotion created');
    } catch (error) {
      toast.error('Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };
  
  // Toggle active state
  const toggleActive = async (promoId: string) => {
    const updatedPromotions = promotions.map((p) =>
      p.id === promoId ? { ...p, active: !p.active } : p
    );
    await onSave(updatedPromotions);
    setPromotions(updatedPromotions);
  };
  
  // Delete promotion
  const handleDelete = async (promoId: string) => {
    const updatedPromotions = promotions.filter((p) => p.id !== promoId);
    await onSave(updatedPromotions);
    setPromotions(updatedPromotions);
    toast.success('Promotion deleted');
  };
  
  // Duplicate promotion
  const handleDuplicate = (promo: Promotion) => {
    setFormData({
      ...promo,
      id: undefined,
      name: `${promo.name} (Copy)`,
      slug: `${promo.slug}-copy`,
      active: false,
    });
    setEditingPromo(null);
    setIsDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Promotions & Banners</h2>
          <p className="text-sm text-muted-foreground">
            Create seasonal offers, announcements, and discounts
          </p>
        </div>
        <Button onClick={handleAddPromo} className="bg-violet-600 hover:bg-violet-700">
          <Icon name="plus" size="sm" className="mr-2" />
          Add Promotion
        </Button>
      </div>
      
      {/* Promotions List */}
      {promotions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Icon name="megaphone" size="4xl" className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No promotions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create banners, countdown timers, and seasonal discounts
            </p>
            <Button onClick={handleAddPromo} variant="outline">
              <Icon name="plus" size="sm" className="mr-2" />
              Create Promotion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promo) => {
            const typeInfo = PROMO_TYPES.find((t) => t.value === promo.promo_type);
            
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={cn(!promo.active && 'opacity-60')}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Type icon */}
                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Icon name={typeInfo?.icon || 'megaphone'} size="lg" className="text-violet-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{promo.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {typeInfo?.label || promo.promo_type}
                            </Badge>
                            {promo.active ? (
                              <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            {promo.has_pricing_impact && (
                              <Badge className="bg-amber-100 text-amber-700">
                                <Icon name="percent" size="xs" className="mr-1" />
                                {promo.discount_type === 'percentage' && `${promo.discount_value}% off`}
                                {promo.discount_type === 'flat' && `$${promo.discount_value} off`}
                              </Badge>
                            )}
                          </div>
                          
                          {promo.headline && (
                            <p className="text-sm text-muted-foreground mt-1">
                              &quot;{promo.headline}&quot;
                            </p>
                          )}
                          
                          {/* Schedule info */}
                          {(promo.start_date || promo.end_date) && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Icon name="calendar" size="xs" />
                              {promo.start_date && format(new Date(promo.start_date), 'MMM d, yyyy')}
                              {promo.start_date && promo.end_date && ' → '}
                              {promo.end_date && format(new Date(promo.end_date), 'MMM d, yyyy')}
                            </div>
                          )}
                          
                          {/* Promo code */}
                          {promo.promo_code && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="font-mono">
                                {promo.promo_code}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(promo.id)}
                        >
                          <Icon name={promo.active ? 'eyeOff' : 'eye'} size="sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(promo)}
                        >
                          <Icon name="copy" size="sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPromo(promo)}
                        >
                          <Icon name="edit" size="sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(promo.id)}
                        >
                          <Icon name="trash" size="sm" className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Preview for banners */}
                    {promo.promo_type === 'banner' && promo.active && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <BannerPreview promo={promo} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Edit Promotion' : 'Create Promotion'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="discount">Discount</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Promotion Name *</Label>
                  <Input
                    placeholder="e.g., Spring Cleaning Sale"
                    value={formData.name || ''}
                    onChange={(e) => updateForm({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.promo_type || 'banner'}
                    onValueChange={(v) => updateForm({ promo_type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMO_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon name={type.icon} size="sm" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Headline & Subheadline */}
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input
                  placeholder="🌸 Spring Cleaning Special!"
                  value={formData.headline || ''}
                  onChange={(e) => updateForm({ headline: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Subheadline</Label>
                <Input
                  placeholder="Book this week and save 20% on deep cleaning"
                  value={formData.subheadline || ''}
                  onChange={(e) => updateForm({ subheadline: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Additional details about the promotion..."
                  value={formData.description || ''}
                  onChange={(e) => updateForm({ description: e.target.value })}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>CTA Button Text</Label>
                  <Input
                    placeholder="Book Now"
                    value={formData.cta_text || ''}
                    onChange={(e) => updateForm({ cta_text: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Preview */}
              {formData.promo_type === 'banner' && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <BannerPreview promo={formData} />
                </div>
              )}
              
              {formData.promo_type === 'countdown' && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <CountdownPreview promo={formData} />
                </div>
              )}
            </TabsContent>
            
            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6 mt-6">
              {formData.promo_type === 'banner' && (
                <>
                  {/* Position */}
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['top', 'bottom', 'inline'].map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => updateBannerConfig({ position: pos as any })}
                          className={cn(
                            'p-3 rounded-lg border text-sm capitalize transition-all',
                            formData.banner_config?.position === pos
                              ? 'border-violet-600 bg-violet-50 text-violet-700'
                              : 'hover:border-violet-300'
                          )}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Background */}
                  <div className="space-y-4">
                    <Label>Background</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['solid', 'gradient'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateBannerConfig({ background_type: type as any })}
                          className={cn(
                            'p-3 rounded-lg border text-sm capitalize transition-all',
                            formData.banner_config?.background_type === type
                              ? 'border-violet-600 bg-violet-50 text-violet-700'
                              : 'hover:border-violet-300'
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    
                    {formData.banner_config?.background_type === 'solid' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={formData.banner_config?.background_color || '#7c3aed'}
                          onChange={(e) => updateBannerConfig({ background_color: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={formData.banner_config?.background_color || '#7c3aed'}
                          onChange={(e) => updateBannerConfig({ background_color: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">From</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={formData.banner_config?.gradient_from || '#7c3aed'}
                              onChange={(e) => updateBannerConfig({ gradient_from: e.target.value })}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={formData.banner_config?.gradient_from || '#7c3aed'}
                              onChange={(e) => updateBannerConfig({ gradient_from: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">To</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={formData.banner_config?.gradient_to || '#4f46e5'}
                              onChange={(e) => updateBannerConfig({ gradient_to: e.target.value })}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={formData.banner_config?.gradient_to || '#4f46e5'}
                              onChange={(e) => updateBannerConfig({ gradient_to: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={formData.banner_config?.text_color || '#ffffff'}
                        onChange={(e) => updateBannerConfig({ text_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={formData.banner_config?.text_color || '#ffffff'}
                        onChange={(e) => updateBannerConfig({ text_color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  {/* Animation */}
                  <div className="space-y-2">
                    <Label>Animation</Label>
                    <Select
                      value={formData.banner_config?.animation || 'none'}
                      onValueChange={(v) => updateBannerConfig({ animation: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="pulse">Pulse</SelectItem>
                        <SelectItem value="slide">Slide In</SelectItem>
                        <SelectItem value="fade">Fade In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sticky</Label>
                        <p className="text-sm text-muted-foreground">Stay visible while scrolling</p>
                      </div>
                      <Switch
                        checked={formData.banner_config?.sticky || false}
                        onCheckedChange={(checked) => updateBannerConfig({ sticky: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dismissible</Label>
                        <p className="text-sm text-muted-foreground">Allow users to close the banner</p>
                      </div>
                      <Switch
                        checked={formData.banner_config?.dismissible !== false}
                        onCheckedChange={(checked) => updateBannerConfig({ dismissible: checked })}
                      />
                    </div>
                  </div>
                  
                  {/* Live Preview */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Live Preview</Label>
                    <BannerPreview promo={formData} />
                  </div>
                </>
              )}
              
              {formData.promo_type === 'countdown' && (
                <>
                  {/* Countdown Display Options */}
                  <div className="space-y-4">
                    <Label>Display Options</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {['show_days', 'show_hours', 'show_minutes', 'show_seconds'].map((key) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="capitalize">{key.replace('show_', '').replace('_', ' ')}</Label>
                          <Switch
                            checked={formData.countdown_config?.[key as keyof typeof formData.countdown_config] as boolean}
                            onCheckedChange={(checked) => updateCountdownConfig({ [key]: checked })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Style */}
                  <div className="space-y-2">
                    <Label>Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['boxes', 'inline', 'minimal'].map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => updateCountdownConfig({ style: style as any })}
                          className={cn(
                            'p-3 rounded-lg border text-sm capitalize transition-all',
                            formData.countdown_config?.style === style
                              ? 'border-violet-600 bg-violet-50 text-violet-700'
                              : 'hover:border-violet-300'
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Expired Message */}
                  <div className="space-y-2">
                    <Label>Expired Message</Label>
                    <Input
                      placeholder="Offer has ended"
                      value={formData.countdown_config?.expired_message || ''}
                      onChange={(e) => updateCountdownConfig({ expired_message: e.target.value })}
                    />
                  </div>
                  
                  {/* Preview */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Preview</Label>
                    <CountdownPreview promo={formData} />
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Discount Tab */}
            <TabsContent value="discount" className="space-y-6 mt-6">
              {/* Has Discount */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Discount</Label>
                  <p className="text-sm text-muted-foreground">
                    This promotion includes a price discount
                  </p>
                </div>
                <Switch
                  checked={formData.has_pricing_impact || false}
                  onCheckedChange={(checked) => updateForm({ has_pricing_impact: checked })}
                />
              </div>
              
              {formData.has_pricing_impact && (
                <>
                  <Separator />
                  
                  {/* Discount Type & Value */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Discount Type</Label>
                      <Select
                        value={formData.discount_type || 'percentage'}
                        onValueChange={(v) => updateForm({ discount_type: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage Off</SelectItem>
                          <SelectItem value="flat">Fixed Amount Off</SelectItem>
                          <SelectItem value="fixed_price">Fixed Price</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {formData.discount_type === 'percentage' ? 'Percentage' : 'Amount'}
                      </Label>
                      <div className="flex items-center gap-2">
                        {formData.discount_type !== 'percentage' && (
                          <span className="text-muted-foreground">$</span>
                        )}
                        <Input
                          type="number"
                          step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                          value={formData.discount_value || ''}
                          onChange={(e) => updateForm({ discount_value: parseFloat(e.target.value) || 0 })}
                        />
                        {formData.discount_type === 'percentage' && (
                          <span className="text-muted-foreground">%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Promo Code */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Promo Code</Label>
                        <p className="text-sm text-muted-foreground">
                          Customer must enter a code to get the discount
                        </p>
                      </div>
                      <Switch
                        checked={formData.discount_conditions?.requires_code || false}
                        onCheckedChange={(checked) => updateDiscountConditions({ requires_code: checked })}
                      />
                    </div>
                    
                    {formData.discount_conditions?.requires_code && (
                      <div className="space-y-2">
                        <Label>Promo Code</Label>
                        <Input
                          placeholder="SPRING20"
                          value={formData.promo_code || ''}
                          onChange={(e) => updateForm({ promo_code: e.target.value.toUpperCase() })}
                          className="font-mono"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Conditions */}
                  <div className="space-y-4">
                    <Label>Conditions</Label>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Minimum Order</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          type="number"
                          placeholder="No minimum"
                          value={formData.discount_conditions?.minimum_order || ''}
                          onChange={(e) => updateDiscountConditions({
                            minimum_order: parseFloat(e.target.value) || undefined,
                          })}
                          className="w-32"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Applies to Services</Label>
                      <div className="flex flex-wrap gap-2">
                        {serviceTypes.map((service) => {
                          const isSelected = formData.discount_conditions?.applies_to_services?.includes(service.id);
                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => {
                                const current = formData.discount_conditions?.applies_to_services || [];
                                updateDiscountConditions({
                                  applies_to_services: isSelected
                                    ? current.filter((id) => id !== service.id)
                                    : [...current, service.id],
                                });
                              }}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-sm transition-all',
                                isSelected
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-muted hover:bg-muted/80'
                              )}
                            >
                              {service.name}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to apply to all services
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>First-Time Booking Only</Label>
                        <p className="text-sm text-muted-foreground">
                          Only applies to customer&apos;s first booking
                        </p>
                      </div>
                      <Switch
                        checked={formData.discount_conditions?.first_time_only || false}
                        onCheckedChange={(checked) => updateDiscountConditions({ first_time_only: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>New Customers Only</Label>
                        <p className="text-sm text-muted-foreground">
                          Only for customers without previous bookings
                        </p>
                      </div>
                      <Switch
                        checked={formData.discount_conditions?.new_customers_only || false}
                        onCheckedChange={(checked) => updateDiscountConditions({ new_customers_only: checked })}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6 mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date || ''}
                    onChange={(e) => updateForm({ start_date: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to start immediately
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date || ''}
                    onChange={(e) => updateForm({ end_date: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no end date
                  </p>
                </div>
              </div>
              
              <Separator />
              
              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={formData.priority || 0}
                  onChange={(e) => updateForm({ priority: parseInt(e.target.value) || 0 })}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Higher priority promotions are shown first when multiple are active
                </p>
              </div>
              
              <Separator />
              
              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this promotion
                  </p>
                </div>
                <Switch
                  checked={formData.active || false}
                  onCheckedChange={(checked) => updateForm({ active: checked })}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {saving ? 'Saving...' : 'Save Promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
