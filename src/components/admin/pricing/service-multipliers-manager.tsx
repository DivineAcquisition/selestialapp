'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, GripVertical, Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ServiceMultiplier {
  id?: string;
  business_id?: string;
  service_type: string;
  display_name: string;
  description: string | null;
  multiplier: number;
  time_multiplier: number;
  is_active: boolean;
  required_for_first_time: boolean;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

interface ServiceMultipliersManagerProps {
  businessId: string;
}

const DEFAULT_MULTIPLIER: ServiceMultiplier = {
  service_type: '',
  display_name: '',
  description: null,
  multiplier: 1.0,
  time_multiplier: 1.0,
  is_active: true,
  required_for_first_time: false,
  icon: null,
  color: null,
  sort_order: 0,
};

export function ServiceMultipliersManager({ businessId }: ServiceMultipliersManagerProps) {
  const [multipliers, setMultipliers] = useState<ServiceMultiplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMultiplier, setEditingMultiplier] = useState<ServiceMultiplier | null>(null);

  useEffect(() => {
    fetchMultipliers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const fetchMultipliers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/booking/${businessId}/pricing/multipliers`);
      const data = await response.json();
      if (data.multipliers) {
        // Sort by sort_order and filter for business-specific or global
        const sorted = [...data.multipliers].sort((a, b) => a.sort_order - b.sort_order);
        setMultipliers(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch multipliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/booking/${businessId}/pricing/multipliers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multipliers }),
      });
      
      if (response.ok) {
        setHasChanges(false);
        await fetchMultipliers();
      }
    } catch (error) {
      console.error('Failed to save multipliers:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOne = async (multiplier: ServiceMultiplier) => {
    try {
      const response = await fetch(`/api/booking/${businessId}/pricing/multipliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(multiplier),
      });
      
      if (response.ok) {
        setDialogOpen(false);
        setEditingMultiplier(null);
        await fetchMultipliers();
      }
    } catch (error) {
      console.error('Failed to save multiplier:', error);
    }
  };

  const updateMultiplier = (index: number, field: keyof ServiceMultiplier, value: unknown) => {
    setMultipliers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasChanges(true);
  };

  const handleEdit = (multiplier: ServiceMultiplier) => {
    setEditingMultiplier({ ...multiplier });
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingMultiplier({
      ...DEFAULT_MULTIPLIER,
      sort_order: multipliers.length,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (serviceType: string) => {
    if (!confirm('Are you sure you want to deactivate this service type?')) return;
    
    try {
      await fetch(`/api/booking/${businessId}/pricing/multipliers?serviceType=${serviceType}`, {
        method: 'DELETE',
      });
      await fetchMultipliers();
    } catch (error) {
      console.error('Failed to delete multiplier:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Types</h2>
          <p className="text-muted-foreground">
            Configure cleaning service types and their price multipliers
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Service Type
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingMultiplier?.id ? 'Edit Service Type' : 'Add Service Type'}
                </DialogTitle>
                <DialogDescription>
                  Configure the service type details and pricing multiplier
                </DialogDescription>
              </DialogHeader>
              {editingMultiplier && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Service Type ID</Label>
                    <Input
                      value={editingMultiplier.service_type}
                      onChange={(e) => setEditingMultiplier({
                        ...editingMultiplier,
                        service_type: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                      })}
                      placeholder="e.g., deep_clean"
                      disabled={!!editingMultiplier.id}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Display Name</Label>
                    <Input
                      value={editingMultiplier.display_name}
                      onChange={(e) => setEditingMultiplier({
                        ...editingMultiplier,
                        display_name: e.target.value,
                      })}
                      placeholder="e.g., Deep Cleaning"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editingMultiplier.description || ''}
                      onChange={(e) => setEditingMultiplier({
                        ...editingMultiplier,
                        description: e.target.value,
                      })}
                      placeholder="Describe this service type..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Price Multiplier</Label>
                      <Input
                        type="number"
                        step="0.05"
                        value={editingMultiplier.multiplier}
                        onChange={(e) => setEditingMultiplier({
                          ...editingMultiplier,
                          multiplier: parseFloat(e.target.value) || 1,
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        1.0 = base price, 1.5 = 50% more
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label>Time Multiplier</Label>
                      <Input
                        type="number"
                        step="0.05"
                        value={editingMultiplier.time_multiplier}
                        onChange={(e) => setEditingMultiplier({
                          ...editingMultiplier,
                          time_multiplier: parseFloat(e.target.value) || 1,
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Affects time estimates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Required for First-Time</Label>
                      <p className="text-sm text-muted-foreground">
                        New customers must book this first
                      </p>
                    </div>
                    <Switch
                      checked={editingMultiplier.required_for_first_time}
                      onCheckedChange={(checked) => setEditingMultiplier({
                        ...editingMultiplier,
                        required_for_first_time: checked,
                      })}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => editingMultiplier && handleSaveOne(editingMultiplier)}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSaveAll} disabled={saving || !hasChanges}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Types</CardTitle>
          <CardDescription>
            Drag to reorder. Active services appear in the booking widget.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {multipliers.map((multiplier, index) => (
                <TableRow key={multiplier.id || multiplier.service_type}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  </TableCell>
                  <TableCell>
                    <div 
                      className="cursor-pointer hover:text-primary"
                      onClick={() => handleEdit(multiplier)}
                    >
                      <div className="font-medium">{multiplier.display_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {multiplier.service_type}
                        {multiplier.required_for_first_time && (
                          <Badge variant="secondary" className="ml-2">First-time required</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.05"
                      value={multiplier.multiplier}
                      onChange={(e) => updateMultiplier(index, 'multiplier', parseFloat(e.target.value) || 1)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.05"
                      value={multiplier.time_multiplier}
                      onChange={(e) => updateMultiplier(index, 'time_multiplier', parseFloat(e.target.value) || 1)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={multiplier.is_active}
                      onCheckedChange={(checked) => updateMultiplier(index, 'is_active', checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(multiplier.service_type)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ServiceMultipliersManager;
