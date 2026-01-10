'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Edit2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Addon {
  id?: string;
  business_id?: string | null;
  category: string;
  name: string;
  slug: string;
  description: string | null;
  price_type: string;
  price: number;
  unit_name: string | null;
  additional_minutes: number;
  icon: string | null;
  display_order: number;
  active: boolean;
}

interface AddonsManagerProps {
  businessId: string;
}

const CATEGORIES = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'windows', label: 'Windows & Blinds' },
  { value: 'specialty', label: 'Detail/Specialty' },
  { value: 'laundry', label: 'Laundry & Linens' },
  { value: 'floors', label: 'Floors' },
  { value: 'outdoor', label: 'Outdoor' },
];

const PRICE_TYPES = [
  { value: 'flat', label: 'Flat Price' },
  { value: 'per_unit', label: 'Per Unit' },
  { value: 'per_sqft', label: 'Per Sq Ft' },
  { value: 'percentage', label: 'Percentage of Total' },
];

const DEFAULT_ADDON: Addon = {
  category: 'specialty',
  name: '',
  slug: '',
  description: null,
  price_type: 'flat',
  price: 0,
  unit_name: null,
  additional_minutes: 15,
  icon: null,
  display_order: 0,
  active: true,
};

export function AddonsManager({ businessId }: AddonsManagerProps) {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [categories, setCategories] = useState<Record<string, Addon[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchAddons();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/booking/${businessId}/pricing/addons`);
      const data = await response.json();
      if (data.addons) {
        setAddons(data.addons);
        setCategories(data.categories || {});
      }
    } catch (error) {
      console.error('Failed to fetch addons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingAddon) return;
    
    setSaving(true);
    try {
      const method = editingAddon.id ? 'PUT' : 'POST';
      const body = editingAddon.id 
        ? editingAddon 
        : { ...editingAddon, slug: editingAddon.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') };
      
      const response = await fetch(`/api/booking/${businessId}/pricing/addons`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        setDialogOpen(false);
        setEditingAddon(null);
        await fetchAddons();
      }
    } catch (error) {
      console.error('Failed to save addon:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addon: Addon) => {
    if (!addon.id) return;
    if (!confirm(`Are you sure you want to delete "${addon.name}"?`)) return;
    
    try {
      await fetch(`/api/booking/${businessId}/pricing/addons?id=${addon.id}`, {
        method: 'DELETE',
      });
      await fetchAddons();
    } catch (error) {
      console.error('Failed to delete addon:', error);
    }
  };

  const handleEdit = (addon: Addon) => {
    setEditingAddon({ ...addon });
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddon({
      ...DEFAULT_ADDON,
      display_order: addons.length,
    });
    setDialogOpen(true);
  };

  const toggleActive = async (addon: Addon) => {
    if (!addon.id) return;
    
    try {
      await fetch(`/api/booking/${businessId}/pricing/addons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addon, active: !addon.active }),
      });
      await fetchAddons();
    } catch (error) {
      console.error('Failed to toggle addon:', error);
    }
  };

  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || addon.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
          <h2 className="text-2xl font-bold tracking-tight">Add-On Services</h2>
          <p className="text-muted-foreground">
            Manage additional services customers can add to their booking
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search add-ons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
              <Badge variant="secondary" className="ml-2">
                {categories[cat.value]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAddons.map((addon) => (
              <Card key={addon.id || addon.slug} className={!addon.active ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{addon.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {CATEGORIES.find(c => c.value === addon.category)?.label}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(addon)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {addon.business_id && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(addon)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {addon.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {addon.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-lg">
                      ${addon.price.toFixed(2)}
                      {addon.price_type === 'per_unit' && addon.unit_name && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /{addon.unit_name}
                        </span>
                      )}
                      {addon.price_type === 'per_sqft' && (
                        <span className="text-sm font-normal text-muted-foreground">/sqft</span>
                      )}
                      {addon.price_type === 'percentage' && (
                        <span className="text-sm font-normal text-muted-foreground">%</span>
                      )}
                    </div>
                    <Switch
                      checked={addon.active}
                      onCheckedChange={() => toggleActive(addon)}
                    />
                  </div>
                  {addon.additional_minutes > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{addon.additional_minutes} min estimated
                    </p>
                  )}
                  {!addon.business_id && (
                    <Badge variant="outline" className="mt-2">Template</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddon?.id ? 'Edit Add-On' : 'Add New Add-On'}
            </DialogTitle>
            <DialogDescription>
              Configure the add-on service details and pricing
            </DialogDescription>
          </DialogHeader>
          {editingAddon && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={editingAddon.name}
                  onChange={(e) => setEditingAddon({
                    ...editingAddon,
                    name: e.target.value,
                  })}
                  placeholder="e.g., Inside Oven Cleaning"
                />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={editingAddon.category}
                  onValueChange={(value) => setEditingAddon({
                    ...editingAddon,
                    category: value,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={editingAddon.description || ''}
                  onChange={(e) => setEditingAddon({
                    ...editingAddon,
                    description: e.target.value,
                  })}
                  placeholder="Describe this add-on service..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Price Type</Label>
                  <Select
                    value={editingAddon.price_type}
                    onValueChange={(value) => setEditingAddon({
                      ...editingAddon,
                      price_type: value,
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingAddon.price}
                    onChange={(e) => setEditingAddon({
                      ...editingAddon,
                      price: parseFloat(e.target.value) || 0,
                    })}
                  />
                </div>
              </div>
              {editingAddon.price_type === 'per_unit' && (
                <div className="grid gap-2">
                  <Label>Unit Name</Label>
                  <Input
                    value={editingAddon.unit_name || ''}
                    onChange={(e) => setEditingAddon({
                      ...editingAddon,
                      unit_name: e.target.value,
                    })}
                    placeholder="e.g., window, load, fan"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label>Additional Time (minutes)</Label>
                <Input
                  type="number"
                  value={editingAddon.additional_minutes}
                  onChange={(e) => setEditingAddon({
                    ...editingAddon,
                    additional_minutes: parseInt(e.target.value) || 0,
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Show in booking widget
                  </p>
                </div>
                <Switch
                  checked={editingAddon.active}
                  onCheckedChange={(checked) => setEditingAddon({
                    ...editingAddon,
                    active: checked,
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddonsManager;
