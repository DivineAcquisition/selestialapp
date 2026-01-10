'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Calendar, TrendingDown } from 'lucide-react';

interface FrequencyDiscount {
  id?: string;
  business_id?: string | null;
  frequency: string;
  display_name: string;
  description?: string | null;
  discount_percent: number;
  discount_amount?: number | null;
  is_baseline: boolean;
  badge_text?: string | null;
  sort_order: number;
  is_active: boolean;
}

interface FrequencyDiscountsEditorProps {
  businessId: string;
}

export function FrequencyDiscountsEditor({ businessId }: FrequencyDiscountsEditorProps) {
  const [discounts, setDiscounts] = useState<FrequencyDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sample base price for preview
  const sampleBasePrice = 180;

  useEffect(() => {
    fetchDiscounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/booking/${businessId}/pricing/config`);
      const data = await response.json();
      if (data.frequencyDiscounts) {
        setDiscounts(data.frequencyDiscounts);
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each discount
      for (const discount of discounts) {
        await fetch(`/api/booking/${businessId}/pricing/config`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            frequency_discounts: discounts,
          }),
        });
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save discounts:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateDiscount = (index: number, field: keyof FrequencyDiscount, value: unknown) => {
    setDiscounts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasChanges(true);
  };

  const calculateDiscountedPrice = (discount: FrequencyDiscount) => {
    if (discount.is_baseline) return sampleBasePrice;
    return sampleBasePrice * (1 - discount.discount_percent);
  };

  const calculateAnnualSavings = (discount: FrequencyDiscount) => {
    if (discount.is_baseline) return 0;
    
    const visitsPerYear = 
      discount.frequency === 'weekly' ? 52 :
      discount.frequency === 'biweekly' ? 26 :
      discount.frequency === 'monthly' ? 12 :
      discount.frequency === 'quarterly' ? 4 : 1;
    
    const savingsPerVisit = sampleBasePrice * discount.discount_percent;
    return savingsPerVisit * visitsPerYear;
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
          <h2 className="text-2xl font-bold tracking-tight">Frequency Discounts</h2>
          <p className="text-muted-foreground">
            Encourage recurring bookings with automatic discounts
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {discounts.map((discount, index) => (
          <Card key={discount.id || discount.frequency} className={!discount.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{discount.display_name}</CardTitle>
                </div>
                <Switch
                  checked={discount.is_active}
                  onCheckedChange={(checked) => updateDiscount(index, 'is_active', checked)}
                />
              </div>
              {discount.badge_text && (
                <Badge variant="secondary">{discount.badge_text}</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {discount.description && (
                <p className="text-sm text-muted-foreground">{discount.description}</p>
              )}
              
              <div className="space-y-2">
                <Label>Discount Percentage</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="1"
                    value={discount.discount_percent * 100}
                    onChange={(e) => updateDiscount(
                      index, 
                      'discount_percent', 
                      (parseFloat(e.target.value) || 0) / 100
                    )}
                    disabled={discount.is_baseline}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">%</span>
                  {discount.is_baseline && (
                    <Badge variant="outline">Baseline</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input
                  value={discount.badge_text || ''}
                  onChange={(e) => updateDiscount(index, 'badge_text', e.target.value || null)}
                  placeholder="e.g., Best Value"
                />
              </div>

              {/* Price Preview */}
              <div className="rounded-lg bg-muted p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sample price (${sampleBasePrice})</span>
                  <span className="font-medium">
                    ${calculateDiscountedPrice(discount).toFixed(2)}
                    {!discount.is_baseline && (
                      <span className="text-green-600 ml-1">
                        (-{(discount.discount_percent * 100).toFixed(0)}%)
                      </span>
                    )}
                  </span>
                </div>
                {!discount.is_baseline && discount.frequency !== 'one_time' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingDown className="h-4 w-4" />
                      Annual savings
                    </span>
                    <span className="font-medium text-green-600">
                      ${calculateAnnualSavings(discount).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Comparison</CardTitle>
          <CardDescription>
            Show customers how much they save with recurring service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Frequency</th>
                  <th className="text-right py-2 px-4">Per Visit</th>
                  <th className="text-right py-2 px-4">Discount</th>
                  <th className="text-right py-2 px-4">Visits/Year</th>
                  <th className="text-right py-2 px-4">Annual Cost</th>
                  <th className="text-right py-2 px-4">Annual Savings</th>
                </tr>
              </thead>
              <tbody>
                {discounts.filter(d => d.is_active).map((discount) => {
                  const visitsPerYear = 
                    discount.frequency === 'weekly' ? 52 :
                    discount.frequency === 'biweekly' ? 26 :
                    discount.frequency === 'monthly' ? 12 :
                    discount.frequency === 'quarterly' ? 4 : 1;
                  const perVisit = calculateDiscountedPrice(discount);
                  const annualCost = perVisit * visitsPerYear;
                  const baselineAnnual = sampleBasePrice * visitsPerYear;
                  const annualSavings = baselineAnnual - annualCost;

                  return (
                    <tr key={discount.frequency} className="border-b">
                      <td className="py-2 px-4 font-medium">{discount.display_name}</td>
                      <td className="text-right py-2 px-4">${perVisit.toFixed(2)}</td>
                      <td className="text-right py-2 px-4">
                        {discount.is_baseline ? '-' : `${(discount.discount_percent * 100).toFixed(0)}%`}
                      </td>
                      <td className="text-right py-2 px-4">{visitsPerYear}</td>
                      <td className="text-right py-2 px-4">${annualCost.toFixed(0)}</td>
                      <td className="text-right py-2 px-4 text-green-600 font-medium">
                        {discount.is_baseline ? '-' : `$${annualSavings.toFixed(0)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FrequencyDiscountsEditor;
