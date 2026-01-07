"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePhoneNumber } from '@/hooks/usePhoneNumber';
import { formatPhone } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

export default function PhoneSetup() {
  const {
    phoneNumber,
    loading,
    searching,
    purchasing,
    availableNumbers,
    searchNumbers,
    purchaseNumber,
    releaseNumber,
  } = usePhoneNumber();

  const [showSearch, setShowSearch] = useState(false);
  const [showRelease, setShowRelease] = useState(false);
  const [areaCode, setAreaCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);

  const handleSearch = async () => {
    setError(null);
    const { error } = await searchNumbers(areaCode || undefined);
    if (error) {
      setError(error.message);
    }
  };

  const handlePurchase = async () => {
    if (!selectedNumber) return;
    
    setError(null);
    const { error } = await purchaseNumber(selectedNumber);
    
    if (error) {
      setError(error.message);
    } else {
      setShowSearch(false);
      setSelectedNumber(null);
    }
  };

  const handleRelease = async () => {
    const { error } = await releaseNumber();
    if (!error) {
      setShowRelease(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-center py-8">
          <Icon name="spinner" size="2xl" className="animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (phoneNumber) {
    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl border border-emerald-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Icon name="phone" size="2xl" className="text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPhone(phoneNumber.phone_number)}
                  </p>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0">
                    <Icon name="checkCircle" size="xs" className="mr-1" />
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">Ready to send messages</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
              onClick={() => setShowRelease(true)}
            >
              <Icon name="trash" size="md" className="mr-2" />
              Release
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 text-center">
              <Icon name="message" size="lg" className="text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">SMS Enabled</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 text-center">
              <Icon name="bolt" size="lg" className="text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Auto-replies</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 text-center">
              <Icon name="shield" size="lg" className="text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Verified</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 text-sm">
            <Icon name="message" size="lg" className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-blue-800">
              All follow-up messages will be sent from this number. 
              Customer replies will automatically pause the sequence.
            </p>
          </div>
        </div>

        {/* Release confirmation dialog */}
        <Dialog open={showRelease} onOpenChange={setShowRelease}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Release Phone Number</DialogTitle>
              <DialogDescription>
                Are you sure you want to release {formatPhone(phoneNumber.phone_number)}? 
                This will stop all SMS sending until you get a new number.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRelease(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRelease} className="rounded-xl">
                Release Number
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
          <Icon name="alertCircle" size="3xl" className="text-amber-600" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">No phone number configured</h4>
        <p className="text-sm text-gray-500 max-w-sm mb-8">
          You need a phone number to send SMS follow-ups. 
          Get one now to start automating your quote follow-up.
        </p>
        <Button onClick={() => setShowSearch(true)} className="gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF]">
          <Icon name="plus" size="md" />
          Get Phone Number
        </Button>
      </div>

      {/* Search and purchase dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Get a Phone Number</DialogTitle>
            <DialogDescription>
              Search for available phone numbers. Cost is $2/month per number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                <Icon name="alertCircle" size="md" className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Field name="areaCode">
                  <FieldLabel>Area Code</FieldLabel>
                  <Input
                    placeholder="e.g. 415"
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    className="h-11 rounded-xl"
                  />
                  <FieldDescription>Leave empty to search all areas</FieldDescription>
                </Field>
              </div>
              <Button onClick={handleSearch} disabled={searching} className="h-11 rounded-xl gap-2">
                {searching ? (
                  <Icon name="spinner" size="md" className="animate-spin" />
                ) : (
                  <Icon name="search" size="md" />
                )}
                Search
              </Button>
            </div>

            {availableNumbers.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableNumbers.map((number) => (
                  <button
                    key={number.phone_number}
                    type="button"
                    onClick={() => setSelectedNumber(number.phone_number)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                      selectedNumber === number.phone_number
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                    )}
                  >
                    <span className="font-semibold text-gray-900">
                      {formatPhone(number.phone_number)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {number.friendly_name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!searching && availableNumbers.length === 0 && areaCode && (
              <p className="text-sm text-gray-500 text-center py-4">
                No numbers found. Try a different area code.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSearch(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={!selectedNumber || purchasing} 
              className="rounded-xl bg-gradient-to-r from-primary to-[#9D96FF]"
            >
              {purchasing ? (
                <>
                  <Icon name="spinner" size="md" className="mr-2 animate-spin" />
                  Purchasing...
                </>
              ) : (
                'Get This Number'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
