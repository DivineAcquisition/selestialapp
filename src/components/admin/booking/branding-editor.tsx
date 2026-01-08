'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface BrandingConfig {
  colors: {
    primary: string;
    primary_hover: string;
    primary_light: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
    text_primary: string;
    text_secondary: string;
    text_muted: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    font_family: string;
    font_family_headings: string | null;
    font_size_base: string;
    font_size_sm: string;
    font_size_lg: string;
    font_size_xl: string;
    font_weight_normal: string;
    font_weight_medium: string;
    font_weight_semibold: string;
    font_weight_bold: string;
    line_height: string;
    letter_spacing: string;
  };
  layout: {
    border_radius_sm: string;
    border_radius_md: string;
    border_radius_lg: string;
    border_radius_xl: string;
    border_radius_full: string;
    shadow_sm: string;
    shadow_md: string;
    shadow_lg: string;
    spacing_unit: string;
    container_max_width: string;
    widget_padding: string;
    card_padding: string;
  };
  branding_assets: {
    logo_url: string | null;
    logo_height: string;
    logo_position: 'left' | 'center' | 'right';
    favicon_url: string | null;
    background_image_url: string | null;
    background_overlay: string;
    hero_image_url: string | null;
    trust_badges: string[];
  };
  buttons: {
    primary: {
      background: string;
      text: string;
      border: string;
      border_radius: string;
      padding: string;
      font_weight: string;
      hover_background: string;
      hover_transform: string;
      shadow: string;
    };
    secondary: {
      background: string;
      text: string;
      border: string;
      border_radius: string;
      padding: string;
      font_weight: string;
      hover_background: string;
      hover_transform: string;
      shadow: string;
    };
    ghost: {
      background: string;
      text: string;
      border: string;
      padding: string;
      hover_background: string;
    };
  };
  animations: {
    enabled: boolean;
    duration_fast: string;
    duration_normal: string;
    duration_slow: string;
    easing: string;
    hover_scale: number;
    tap_scale: number;
    page_transition: string;
    loading_animation: string;
  };
  custom_css: string | null;
}

interface BrandingEditorProps {
  businessId: string;
  branding: Partial<BrandingConfig>;
  onSave: (branding: Partial<BrandingConfig>) => Promise<void>;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_BRANDING: BrandingConfig = {
  colors: {
    primary: '#7c3aed',
    primary_hover: '#6d28d9',
    primary_light: '#ede9fe',
    secondary: '#10b981',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f9fafb',
    border: '#e5e7eb',
    text_primary: '#111827',
    text_secondary: '#6b7280',
    text_muted: '#9ca3af',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  typography: {
    font_family: 'Inter, system-ui, sans-serif',
    font_family_headings: null,
    font_size_base: '16px',
    font_size_sm: '14px',
    font_size_lg: '18px',
    font_size_xl: '24px',
    font_weight_normal: '400',
    font_weight_medium: '500',
    font_weight_semibold: '600',
    font_weight_bold: '700',
    line_height: '1.5',
    letter_spacing: '0',
  },
  layout: {
    border_radius_sm: '6px',
    border_radius_md: '8px',
    border_radius_lg: '12px',
    border_radius_xl: '16px',
    border_radius_full: '9999px',
    shadow_sm: '0 1px 2px rgba(0,0,0,0.05)',
    shadow_md: '0 4px 6px rgba(0,0,0,0.1)',
    shadow_lg: '0 10px 15px rgba(0,0,0,0.1)',
    spacing_unit: '4px',
    container_max_width: '1200px',
    widget_padding: '24px',
    card_padding: '20px',
  },
  branding_assets: {
    logo_url: null,
    logo_height: '40px',
    logo_position: 'left',
    favicon_url: null,
    background_image_url: null,
    background_overlay: 'rgba(0,0,0,0.5)',
    hero_image_url: null,
    trust_badges: [],
  },
  buttons: {
    primary: {
      background: 'var(--primary)',
      text: '#ffffff',
      border: 'none',
      border_radius: '8px',
      padding: '12px 24px',
      font_weight: '600',
      hover_background: 'var(--primary-hover)',
      hover_transform: 'translateY(-1px)',
      shadow: '0 2px 4px rgba(124,58,237,0.3)',
    },
    secondary: {
      background: 'transparent',
      text: 'var(--text-primary)',
      border: '1px solid var(--border)',
      border_radius: '8px',
      padding: '12px 24px',
      font_weight: '500',
      hover_background: 'var(--surface)',
      hover_transform: 'none',
      shadow: 'none',
    },
    ghost: {
      background: 'transparent',
      text: 'var(--primary)',
      border: 'none',
      padding: '8px 16px',
      hover_background: 'var(--primary-light)',
    },
  },
  animations: {
    enabled: true,
    duration_fast: '150ms',
    duration_normal: '200ms',
    duration_slow: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    hover_scale: 1.02,
    tap_scale: 0.98,
    page_transition: 'fade',
    loading_animation: 'pulse',
  },
  custom_css: null,
};

// ============================================================================
// COLOR PRESETS
// ============================================================================

const COLOR_PRESETS = [
  { name: 'Violet', primary: '#7c3aed', primaryHover: '#6d28d9', primaryLight: '#ede9fe' },
  { name: 'Blue', primary: '#3b82f6', primaryHover: '#2563eb', primaryLight: '#dbeafe' },
  { name: 'Green', primary: '#10b981', primaryHover: '#059669', primaryLight: '#d1fae5' },
  { name: 'Rose', primary: '#f43f5e', primaryHover: '#e11d48', primaryLight: '#ffe4e6' },
  { name: 'Orange', primary: '#f97316', primaryHover: '#ea580c', primaryLight: '#ffedd5' },
  { name: 'Teal', primary: '#14b8a6', primaryHover: '#0d9488', primaryLight: '#ccfbf1' },
  { name: 'Indigo', primary: '#6366f1', primaryHover: '#4f46e5', primaryLight: '#e0e7ff' },
  { name: 'Pink', primary: '#ec4899', primaryHover: '#db2777', primaryLight: '#fce7f3' },
];

// ============================================================================
// FONT OPTIONS
// ============================================================================

const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
  { value: 'system-ui, sans-serif', label: 'System Default' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BrandingEditor({
  businessId,
  branding: initialBranding,
  onSave,
}: BrandingEditorProps) {
  const [branding, setBranding] = React.useState<BrandingConfig>({
    ...DEFAULT_BRANDING,
    ...initialBranding,
    colors: { ...DEFAULT_BRANDING.colors, ...initialBranding.colors },
    typography: { ...DEFAULT_BRANDING.typography, ...initialBranding.typography },
    layout: { ...DEFAULT_BRANDING.layout, ...initialBranding.layout },
    branding_assets: { ...DEFAULT_BRANDING.branding_assets, ...initialBranding.branding_assets },
    buttons: { ...DEFAULT_BRANDING.buttons, ...initialBranding.buttons },
    animations: { ...DEFAULT_BRANDING.animations, ...initialBranding.animations },
  });
  const [saving, setSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  
  // Update branding
  const updateColors = (updates: Partial<BrandingConfig['colors']>) => {
    setBranding((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...updates },
    }));
    setHasChanges(true);
  };
  
  const updateTypography = (updates: Partial<BrandingConfig['typography']>) => {
    setBranding((prev) => ({
      ...prev,
      typography: { ...prev.typography, ...updates },
    }));
    setHasChanges(true);
  };
  
  const updateLayout = (updates: Partial<BrandingConfig['layout']>) => {
    setBranding((prev) => ({
      ...prev,
      layout: { ...prev.layout, ...updates },
    }));
    setHasChanges(true);
  };
  
  const updateAssets = (updates: Partial<BrandingConfig['branding_assets']>) => {
    setBranding((prev) => ({
      ...prev,
      branding_assets: { ...prev.branding_assets, ...updates },
    }));
    setHasChanges(true);
  };
  
  const updateAnimations = (updates: Partial<BrandingConfig['animations']>) => {
    setBranding((prev) => ({
      ...prev,
      animations: { ...prev.animations, ...updates },
    }));
    setHasChanges(true);
  };
  
  // Apply color preset
  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    updateColors({
      primary: preset.primary,
      primary_hover: preset.primaryHover,
      primary_light: preset.primaryLight,
    });
  };
  
  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(branding);
      setHasChanges(false);
      toast.success('Branding saved');
    } catch (error) {
      toast.error('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };
  
  // Reset
  const handleReset = () => {
    setBranding({
      ...DEFAULT_BRANDING,
      ...initialBranding,
      colors: { ...DEFAULT_BRANDING.colors, ...initialBranding.colors },
      typography: { ...DEFAULT_BRANDING.typography, ...initialBranding.typography },
      layout: { ...DEFAULT_BRANDING.layout, ...initialBranding.layout },
      branding_assets: { ...DEFAULT_BRANDING.branding_assets, ...initialBranding.branding_assets },
      buttons: { ...DEFAULT_BRANDING.buttons, ...initialBranding.buttons },
      animations: { ...DEFAULT_BRANDING.animations, ...initialBranding.animations },
    });
    setHasChanges(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Widget Branding</h2>
          <p className="text-sm text-muted-foreground">
            Customize colors, fonts, and visual appearance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="ghost" onClick={handleReset}>
              <Icon name="rotateCcw" size="sm" className="mr-2" />
              Reset
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Icon name="save" size="sm" className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="animations">Animations</TabsTrigger>
          <TabsTrigger value="custom">Custom CSS</TabsTrigger>
        </TabsList>
        
        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          {/* Color Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Color Presets</CardTitle>
              <CardDescription>Quick start with a predefined color scheme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                      branding.colors.primary === preset.primary
                        ? 'border-2 border-violet-600'
                        : 'hover:border-violet-300'
                    )}
                  >
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span className="text-sm font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Primary Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <ColorInput
                  label="Primary"
                  value={branding.colors.primary}
                  onChange={(v) => updateColors({ primary: v })}
                />
                <ColorInput
                  label="Primary Hover"
                  value={branding.colors.primary_hover}
                  onChange={(v) => updateColors({ primary_hover: v })}
                />
                <ColorInput
                  label="Primary Light"
                  value={branding.colors.primary_light}
                  onChange={(v) => updateColors({ primary_light: v })}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Background Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <ColorInput
                  label="Background"
                  value={branding.colors.background}
                  onChange={(v) => updateColors({ background: v })}
                />
                <ColorInput
                  label="Surface"
                  value={branding.colors.surface}
                  onChange={(v) => updateColors({ surface: v })}
                />
                <ColorInput
                  label="Border"
                  value={branding.colors.border}
                  onChange={(v) => updateColors({ border: v })}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Text Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Text Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <ColorInput
                  label="Primary Text"
                  value={branding.colors.text_primary}
                  onChange={(v) => updateColors({ text_primary: v })}
                />
                <ColorInput
                  label="Secondary Text"
                  value={branding.colors.text_secondary}
                  onChange={(v) => updateColors({ text_secondary: v })}
                />
                <ColorInput
                  label="Muted Text"
                  value={branding.colors.text_muted}
                  onChange={(v) => updateColors({ text_muted: v })}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Status Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <ColorInput
                  label="Success"
                  value={branding.colors.success}
                  onChange={(v) => updateColors({ success: v })}
                />
                <ColorInput
                  label="Warning"
                  value={branding.colors.warning}
                  onChange={(v) => updateColors({ warning: v })}
                />
                <ColorInput
                  label="Error"
                  value={branding.colors.error}
                  onChange={(v) => updateColors({ error: v })}
                />
                <ColorInput
                  label="Info"
                  value={branding.colors.info}
                  onChange={(v) => updateColors({ info: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Font Family</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select
                    value={branding.typography.font_family}
                    onValueChange={(v) => updateTypography({ font_family: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select
                    value={branding.typography.font_family_headings || branding.typography.font_family}
                    onValueChange={(v) => updateTypography({ font_family_headings: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Same as body" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Same as body</SelectItem>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Font Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Base Size</Label>
                  <Input
                    value={branding.typography.font_size_base}
                    onChange={(e) => updateTypography({ font_size_base: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Small</Label>
                  <Input
                    value={branding.typography.font_size_sm}
                    onChange={(e) => updateTypography({ font_size_sm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Large</Label>
                  <Input
                    value={branding.typography.font_size_lg}
                    onChange={(e) => updateTypography({ font_size_lg: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>XL</Label>
                  <Input
                    value={branding.typography.font_size_xl}
                    onChange={(e) => updateTypography({ font_size_xl: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Font Weights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Normal</Label>
                  <Select
                    value={branding.typography.font_weight_normal}
                    onValueChange={(v) => updateTypography({ font_weight_normal: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">300 Light</SelectItem>
                      <SelectItem value="400">400 Normal</SelectItem>
                      <SelectItem value="500">500 Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Medium</Label>
                  <Select
                    value={branding.typography.font_weight_medium}
                    onValueChange={(v) => updateTypography({ font_weight_medium: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="400">400 Normal</SelectItem>
                      <SelectItem value="500">500 Medium</SelectItem>
                      <SelectItem value="600">600 Semibold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semibold</Label>
                  <Select
                    value={branding.typography.font_weight_semibold}
                    onValueChange={(v) => updateTypography({ font_weight_semibold: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">500 Medium</SelectItem>
                      <SelectItem value="600">600 Semibold</SelectItem>
                      <SelectItem value="700">700 Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bold</Label>
                  <Select
                    value={branding.typography.font_weight_bold}
                    onValueChange={(v) => updateTypography({ font_weight_bold: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="600">600 Semibold</SelectItem>
                      <SelectItem value="700">700 Bold</SelectItem>
                      <SelectItem value="800">800 Extra Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Border Radius</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Small</Label>
                  <Input
                    value={branding.layout.border_radius_sm}
                    onChange={(e) => updateLayout({ border_radius_sm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medium</Label>
                  <Input
                    value={branding.layout.border_radius_md}
                    onChange={(e) => updateLayout({ border_radius_md: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Large</Label>
                  <Input
                    value={branding.layout.border_radius_lg}
                    onChange={(e) => updateLayout({ border_radius_lg: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>XL</Label>
                  <Input
                    value={branding.layout.border_radius_xl}
                    onChange={(e) => updateLayout({ border_radius_xl: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Preview */}
              <div className="mt-4 flex gap-4">
                <div
                  className="w-12 h-12 bg-violet-600"
                  style={{ borderRadius: branding.layout.border_radius_sm }}
                />
                <div
                  className="w-12 h-12 bg-violet-600"
                  style={{ borderRadius: branding.layout.border_radius_md }}
                />
                <div
                  className="w-12 h-12 bg-violet-600"
                  style={{ borderRadius: branding.layout.border_radius_lg }}
                />
                <div
                  className="w-12 h-12 bg-violet-600"
                  style={{ borderRadius: branding.layout.border_radius_xl }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Container & Padding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Max Width</Label>
                  <Input
                    value={branding.layout.container_max_width}
                    onChange={(e) => updateLayout({ container_max_width: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Widget Padding</Label>
                  <Input
                    value={branding.layout.widget_padding}
                    onChange={(e) => updateLayout({ widget_padding: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Card Padding</Label>
                  <Input
                    value={branding.layout.card_padding}
                    onChange={(e) => updateLayout({ card_padding: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  placeholder="https://..."
                  value={branding.branding_assets.logo_url || ''}
                  onChange={(e) => updateAssets({ logo_url: e.target.value || null })}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo Height</Label>
                  <Input
                    value={branding.branding_assets.logo_height}
                    onChange={(e) => updateAssets({ logo_height: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo Position</Label>
                  <Select
                    value={branding.branding_assets.logo_position}
                    onValueChange={(v) => updateAssets({ logo_position: v as 'left' | 'center' | 'right' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Logo Preview */}
              {branding.branding_assets.logo_url && (
                <div className="p-4 border rounded-lg flex justify-center">
                  <img
                    src={branding.branding_assets.logo_url}
                    alt="Logo preview"
                    style={{ height: branding.branding_assets.logo_height }}
                    className="object-contain"
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Background Image URL</Label>
                <Input
                  placeholder="https://..."
                  value={branding.branding_assets.background_image_url || ''}
                  onChange={(e) => updateAssets({ background_image_url: e.target.value || null })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Background Overlay</Label>
                <Input
                  placeholder="rgba(0,0,0,0.5)"
                  value={branding.branding_assets.background_overlay}
                  onChange={(e) => updateAssets({ background_overlay: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Use rgba() for transparent overlays
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Animations Tab */}
        <TabsContent value="animations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Animation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on/off all widget animations
                  </p>
                </div>
                <Switch
                  checked={branding.animations.enabled}
                  onCheckedChange={(checked) => updateAnimations({ enabled: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Fast Duration</Label>
                  <Input
                    value={branding.animations.duration_fast}
                    onChange={(e) => updateAnimations({ duration_fast: e.target.value })}
                    disabled={!branding.animations.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Normal Duration</Label>
                  <Input
                    value={branding.animations.duration_normal}
                    onChange={(e) => updateAnimations({ duration_normal: e.target.value })}
                    disabled={!branding.animations.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slow Duration</Label>
                  <Input
                    value={branding.animations.duration_slow}
                    onChange={(e) => updateAnimations({ duration_slow: e.target.value })}
                    disabled={!branding.animations.enabled}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Hover Scale</Label>
                    <span className="text-sm text-muted-foreground">
                      {branding.animations.hover_scale}
                    </span>
                  </div>
                  <Slider
                    value={[branding.animations.hover_scale * 100]}
                    onValueChange={([v]) => updateAnimations({ hover_scale: v / 100 })}
                    min={100}
                    max={110}
                    step={1}
                    disabled={!branding.animations.enabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Tap Scale</Label>
                    <span className="text-sm text-muted-foreground">
                      {branding.animations.tap_scale}
                    </span>
                  </div>
                  <Slider
                    value={[branding.animations.tap_scale * 100]}
                    onValueChange={([v]) => updateAnimations({ tap_scale: v / 100 })}
                    min={90}
                    max={100}
                    step={1}
                    disabled={!branding.animations.enabled}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Page Transition</Label>
                  <Select
                    value={branding.animations.page_transition}
                    onValueChange={(v) => updateAnimations({ page_transition: v })}
                    disabled={!branding.animations.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Loading Animation</Label>
                  <Select
                    value={branding.animations.loading_animation}
                    onValueChange={(v) => updateAnimations({ loading_animation: v })}
                    disabled={!branding.animations.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pulse">Pulse</SelectItem>
                      <SelectItem value="spin">Spin</SelectItem>
                      <SelectItem value="bounce">Bounce</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Custom CSS Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custom CSS</CardTitle>
              <CardDescription>
                Add custom CSS to further customize the widget appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`/* Custom CSS */
.booking-widget {
  /* Your custom styles */
}
`}
                value={branding.custom_css || ''}
                onChange={(e) => {
                  setBranding((prev) => ({ ...prev, custom_css: e.target.value || null }));
                  setHasChanges(true);
                }}
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Use with caution. Invalid CSS may break the widget appearance.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// COLOR INPUT COMPONENT
// ============================================================================

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}
