"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { 
  Phone, 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2,
  MessageSquare,
  Zap,
  Shield,
} from 'lucide-react';

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
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (phoneNumber) {
    return (
      <>
        <Card className="overflow-hidden feature-card">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-green-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">SMS Phone Number</h3>
                  <p className="text-sm text-muted-foreground">Your dedicated number for sending follow-ups</p>
                </div>
              </div>
              <Badge variant="default" className="gap-1.5 bg-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                Active
              </Badge>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary/5 to-transparent rounded-xl glow-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center glow-sm">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPhone(phoneNumber.phone_number)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Ready to send messages</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowRelease(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Release
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <MessageSquare className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">SMS Enabled</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <Zap className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Auto-replies</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <Shield className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-sm">
              <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-blue-800 dark:text-blue-200">
                All follow-up messages will be sent from this number. 
                Customer replies will automatically pause the sequence.
              </p>
            </div>
          </div>
        </Card>

        {/* Release confirmation dialog */}
        <Dialog open={showRelease} onOpenChange={setShowRelease}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Release Phone Number</DialogTitle>
              <DialogDescription>
                Are you sure you want to release {formatPhone(phoneNumber.phone_number)}? 
                This will stop all SMS sending until you get a new number.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRelease(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRelease}>
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
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Phone className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">SMS Phone Number</h3>
              <p className="text-sm text-muted-foreground">Get a phone number to send automated follow-ups</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-amber-600" />
            </div>
            <h4 className="text-lg font-semibold mb-2">No phone number configured</h4>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              You need a phone number to send SMS follow-ups. 
              Get one now to start automating your quote follow-up.
            </p>
            <Button onClick={() => setShowSearch(true)} className="gap-2 glow-sm">
              <Plus className="h-4 w-4" />
              Get Phone Number
            </Button>
          </div>
        </div>
      </Card>

      {/* Search and purchase dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Get a Phone Number</DialogTitle>
            <DialogDescription>
              Search for available phone numbers. Cost is $2/month per number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="areaCode">Area Code</Label>
                <Input
                  id="areaCode"
                  placeholder="e.g. 415"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                />
              </div>
              <Button className="mt-7" onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Search</span>
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
                        ? 'border-primary bg-primary/5 glow-border'
                        : 'border-border hover:border-primary/30 card-glow'
                    )}
                  >
                    <span className="font-semibold text-foreground">
                      {formatPhone(number.phone_number)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {number.friendly_name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!searching && availableNumbers.length === 0 && areaCode && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No numbers found. Try a different area code.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSearch(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={!selectedNumber || purchasing} className="glow-sm">
              {purchasing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
