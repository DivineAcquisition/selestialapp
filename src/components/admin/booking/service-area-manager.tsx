'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface ServiceArea {
  id: string;
  name: string;
  slug: string;
  description?: string;
  zone_type: 'zip' | 'radius' | 'city' | 'county';
  zip_codes: string[];
  cities: string[];
  center_lat?: number;
  center_lng?: number;
  radius_miles?: number;
  price_adjustment_type: 'none' | 'percentage' | 'flat' | 'multiplier';
  price_adjustment_value: number;
  minimum_order: number;
  travel_fee: number;
  travel_fee_waive_above?: number;
  available: boolean;
  available_days: string[];
  lead_time_hours?: number;
  max_bookings_per_day?: number;
  area_message?: string;
  travel_message?: string;
  display_order: number;
  color?: string;
}

interface ServiceAreaManagerProps {
  businessId: string;
  areas: ServiceArea[];
  onSave: (areas: ServiceArea[]) => Promise<void>;
}

// ============================================================================
// SCHEMA
// ============================================================================

const serviceAreaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1),
  description: z.string().optional(),
  zone_type: z.enum(['zip', 'radius', 'city', 'county']),
  zip_codes: z.array(z.string()),
  cities: z.array(z.string()),
  center_lat: z.number().optional(),
  center_lng: z.number().optional(),
  radius_miles: z.number().optional(),
  price_adjustment_type: z.enum(['none', 'percentage', 'flat', 'multiplier']),
  price_adjustment_value: z.number(),
  minimum_order: z.number().min(0),
  travel_fee: z.number().min(0),
  travel_fee_waive_above: z.number().optional(),
  available: z.boolean(),
  available_days: z.array(z.string()),
  lead_time_hours: z.number().optional(),
  max_bookings_per_day: z.number().optional(),
  area_message: z.string().optional(),
  travel_message: z.string().optional(),
  color: z.string().optional(),
});

// ============================================================================
// DAYS OF WEEK
// ============================================================================

const DAYS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ServiceAreaManager({ businessId, areas: initialAreas, onSave }: ServiceAreaManagerProps) {
  const [areas, setAreas] = React.useState<ServiceArea[]>(initialAreas);
  const [editingArea, setEditingArea] = React.useState<ServiceArea | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  
  const form = useForm({
    resolver: zodResolver(serviceAreaSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      zone_type: 'zip' as const,
      zip_codes: [] as string[],
      cities: [] as string[],
      price_adjustment_type: 'none' as const,
      price_adjustment_value: 0,
      minimum_order: 0,
      travel_fee: 0,
      travel_fee_waive_above: undefined,
      available: true,
      available_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      lead_time_hours: undefined,
      max_bookings_per_day: undefined,
      area_message: '',
      travel_message: '',
      color: '#7c3aed',
    },
  });
  
  const [zipInput, setZipInput] = React.useState('');
  const [cityInput, setCityInput] = React.useState('');
  
  // Open dialog for new area
  const handleAddArea = () => {
    form.reset({
      name: '',
      slug: '',
      zone_type: 'zip',
      zip_codes: [],
      cities: [],
      price_adjustment_type: 'none',
      price_adjustment_value: 0,
      minimum_order: 0,
      travel_fee: 0,
      available: true,
      available_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      color: '#7c3aed',
    });
    setEditingArea(null);
    setIsDialogOpen(true);
  };
  
  // Open dialog for editing
  const handleEditArea = (area: ServiceArea) => {
    form.reset(area);
    setEditingArea(area);
    setIsDialogOpen(true);
  };
  
  // Save area
  const handleSaveArea = async (data: z.infer<typeof serviceAreaSchema>) => {
    setSaving(true);
    
    try {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      
      let updatedAreas: ServiceArea[];
      
      if (editingArea) {
        // Update existing
        updatedAreas = areas.map((a) =>
          a.id === editingArea.id ? { ...a, ...data } : a
        );
      } else {
        // Add new
        const newArea: ServiceArea = {
          ...data,
          id: crypto.randomUUID(),
          display_order: areas.length,
        } as ServiceArea;
        updatedAreas = [...areas, newArea];
      }
      
      await onSave(updatedAreas);
      setAreas(updatedAreas);
      setIsDialogOpen(false);
      toast.success(editingArea ? 'Area updated' : 'Area added');
    } catch (error) {
      toast.error('Failed to save area');
    } finally {
      setSaving(false);
    }
  };
  
  // Delete area
  const handleDeleteArea = async (id: string) => {
    const updatedAreas = areas.filter((a) => a.id !== id);
    await onSave(updatedAreas);
    setAreas(updatedAreas);
    setDeleteConfirm(null);
    toast.success('Area deleted');
  };
  
  // Add zip code
  const addZipCode = () => {
    if (zipInput.trim()) {
      const current = form.getValues('zip_codes');
      form.setValue('zip_codes', [...current, zipInput.trim()]);
      setZipInput('');
    }
  };
  
  // Remove zip code
  const removeZipCode = (zip: string) => {
    const current = form.getValues('zip_codes');
    form.setValue('zip_codes', current.filter((z) => z !== zip));
  };
  
  // Add city
  const addCity = () => {
    if (cityInput.trim()) {
      const current = form.getValues('cities');
      form.setValue('cities', [...current, cityInput.trim()]);
      setCityInput('');
    }
  };
  
  // Toggle day
  const toggleDay = (day: string) => {
    const current = form.getValues('available_days');
    if (current.includes(day)) {
      form.setValue('available_days', current.filter((d) => d !== day));
    } else {
      form.setValue('available_days', [...current, day]);
    }
  };
  
  const zoneType = form.watch('zone_type');
  const adjustmentType = form.watch('price_adjustment_type');
  const zipCodes = form.watch('zip_codes');
  const cities = form.watch('cities');
  const availableDays = form.watch('available_days');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Service Areas</h2>
          <p className="text-sm text-muted-foreground">
            Define geographic zones with custom pricing and availability
          </p>
        </div>
        <Button onClick={handleAddArea} className="bg-violet-600 hover:bg-violet-700">
          <Icon name="plus" size="sm" className="mr-2" />
          Add Area
        </Button>
      </div>
      
      {/* Areas List */}
      {areas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Icon name="mapPin" size="4xl" className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No service areas defined</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first service area to customize pricing by location
            </p>
            <Button onClick={handleAddArea} variant="outline">
              <Icon name="plus" size="sm" className="mr-2" />
              Add Service Area
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {areas.map((area) => (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn(!area.available && 'opacity-60')}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Color indicator */}
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: area.color || '#7c3aed' }}
                      >
                        <Icon name="mapPin" size="lg" className="text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{area.name}</h3>
                          {!area.available && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        
                        {/* Zone info */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {area.zone_type === 'zip' && area.zip_codes.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {area.zip_codes.length} ZIP code{area.zip_codes.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {area.zone_type === 'city' && area.cities.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {area.cities.join(', ')}
                            </span>
                          )}
                          {area.zone_type === 'radius' && (
                            <span className="text-sm text-muted-foreground">
                              {area.radius_miles} mile radius
                            </span>
                          )}
                        </div>
                        
                        {/* Pricing info */}
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          {area.price_adjustment_type !== 'none' && (
                            <Badge variant="outline" className="font-normal">
                              {area.price_adjustment_type === 'percentage' && `+${area.price_adjustment_value}%`}
                              {area.price_adjustment_type === 'flat' && `+$${area.price_adjustment_value}`}
                              {area.price_adjustment_type === 'multiplier' && `×${area.price_adjustment_value}`}
                            </Badge>
                          )}
                          {area.travel_fee > 0 && (
                            <Badge variant="outline" className="font-normal">
                              <Icon name="car" size="xs" className="mr-1" />
                              ${area.travel_fee} travel
                            </Badge>
                          )}
                          {area.minimum_order > 0 && (
                            <Badge variant="outline" className="font-normal">
                              ${area.minimum_order} min
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditArea(area)}
                      >
                        <Icon name="edit" size="sm" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(area.id)}
                      >
                        <Icon name="trash" size="sm" className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArea ? 'Edit Service Area' : 'Add Service Area'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleSaveArea)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Area Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Downtown, Suburbs"
                  {...form.register('name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    className="w-12 h-9 p-1"
                    {...form.register('color')}
                  />
                  <Input
                    placeholder="#7c3aed"
                    {...form.register('color')}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description for internal reference"
                {...form.register('description')}
              />
            </div>
            
            <Separator />
            
            {/* Zone Type */}
            <div className="space-y-4">
              <Label>Zone Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'zip', label: 'ZIP Codes', icon: 'mapPin' as IconName },
                  { value: 'city', label: 'Cities', icon: 'target' as IconName },
                  { value: 'radius', label: 'Radius', icon: 'crosshair' as IconName },
                  { value: 'county', label: 'County', icon: 'map' as IconName },
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => form.setValue('zone_type', value as any)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                      zoneType === value
                        ? 'border-violet-600 bg-violet-50 text-violet-700'
                        : 'hover:border-violet-300'
                    )}
                  >
                    <Icon name={icon} size="lg" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              
              {/* Zone-specific inputs */}
              {zoneType === 'zip' && (
                <div className="space-y-2">
                  <Label>ZIP Codes</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter ZIP code"
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addZipCode())}
                    />
                    <Button type="button" onClick={addZipCode} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {zipCodes.map((zip) => (
                      <Badge key={zip} variant="secondary" className="gap-1">
                        {zip}
                        <button
                          type="button"
                          onClick={() => removeZipCode(zip)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Icon name="x" size="xs" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {zoneType === 'city' && (
                <div className="space-y-2">
                  <Label>Cities</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter city name"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                    />
                    <Button type="button" onClick={addCity} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cities.map((city) => (
                      <Badge key={city} variant="secondary" className="gap-1">
                        {city}
                        <button
                          type="button"
                          onClick={() => {
                            const current = form.getValues('cities');
                            form.setValue('cities', current.filter((c) => c !== city));
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <Icon name="x" size="xs" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {zoneType === 'radius' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Center Latitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="40.7128"
                      {...form.register('center_lat', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Center Longitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="-74.0060"
                      {...form.register('center_lng', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Radius (miles)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="10"
                      {...form.register('radius_miles', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Pricing Adjustments */}
            <div className="space-y-4">
              <Label>Price Adjustment</Label>
              <Select
                value={adjustmentType}
                onValueChange={(v) => form.setValue('price_adjustment_type', v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No adjustment</SelectItem>
                  <SelectItem value="percentage">Percentage (+/- %)</SelectItem>
                  <SelectItem value="flat">Flat amount (+/- $)</SelectItem>
                  <SelectItem value="multiplier">Multiplier (×)</SelectItem>
                </SelectContent>
              </Select>
              
              {adjustmentType !== 'none' && (
                <div className="flex items-center gap-2">
                  {adjustmentType === 'percentage' && <Icon name="percent" size="sm" className="text-muted-foreground" />}
                  {adjustmentType === 'flat' && <Icon name="dollarSign" size="sm" className="text-muted-foreground" />}
                  <Input
                    type="number"
                    step={adjustmentType === 'multiplier' ? '0.01' : '1'}
                    placeholder={adjustmentType === 'multiplier' ? '1.15' : '10'}
                    {...form.register('price_adjustment_value', { valueAsNumber: true })}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    {adjustmentType === 'percentage' && '% adjustment'}
                    {adjustmentType === 'flat' && 'flat fee'}
                    {adjustmentType === 'multiplier' && 'multiplier'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Travel Fee */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Travel Fee</Label>
                <div className="flex items-center gap-2">
                  <Icon name="dollarSign" size="sm" className="text-muted-foreground" />
                  <Input
                    type="number"
                    step="1"
                    placeholder="0"
                    {...form.register('travel_fee', { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Waive Travel Fee Above</Label>
                <div className="flex items-center gap-2">
                  <Icon name="dollarSign" size="sm" className="text-muted-foreground" />
                  <Input
                    type="number"
                    step="1"
                    placeholder="e.g., 150"
                    {...form.register('travel_fee_waive_above', { valueAsNumber: true })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to always charge travel fee
                </p>
              </div>
            </div>
            
            {/* Minimum Order */}
            <div className="space-y-2">
              <Label>Minimum Order for This Area</Label>
              <div className="flex items-center gap-2">
                <Icon name="dollarSign" size="sm" className="text-muted-foreground" />
                <Input
                  type="number"
                  step="1"
                  placeholder="0"
                  {...form.register('minimum_order', { valueAsNumber: true })}
                  className="w-32"
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Availability */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Available Days</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                      availableDays.includes(day.value)
                        ? 'bg-violet-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Additional Settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Lead Time Override (hours)</Label>
                <Input
                  type="number"
                  placeholder="Use default"
                  {...form.register('lead_time_hours', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Override default booking lead time for this area
                </p>
              </div>
              <div className="space-y-2">
                <Label>Max Bookings Per Day</Label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  {...form.register('max_bookings_per_day', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Limit daily bookings in this area
                </p>
              </div>
            </div>
            
            <Separator />
            
            {/* Messaging */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Area Message</Label>
                <Textarea
                  placeholder="e.g., We love serving the downtown area!"
                  {...form.register('area_message')}
                />
                <p className="text-xs text-muted-foreground">
                  Shown to customers when this area is detected
                </p>
              </div>
              <div className="space-y-2">
                <Label>Travel Fee Message</Label>
                <Textarea
                  placeholder="e.g., A $15 travel fee applies to this area"
                  {...form.register('travel_message')}
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable bookings from this area
                </p>
              </div>
              <Switch
                checked={form.watch('available')}
                onCheckedChange={(checked) => form.setValue('available', checked)}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                {saving ? 'Saving...' : 'Save Area'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Area?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the area and its pricing rules. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteArea(deleteConfirm)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
