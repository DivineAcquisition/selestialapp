import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { 
  Phone, 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2,
  MessageSquare
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
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">SMS Phone Number</h3>
                <p className="text-sm text-muted-foreground">Your dedicated number for sending follow-ups</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {formatPhone(phoneNumber.phone_number)}
                </p>
                <p className="text-sm text-muted-foreground">Active and ready to send</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={() => setShowRelease(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Release
            </Button>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              All follow-up messages will be sent from this number. 
              Customer replies will pause the sequence automatically.
            </p>
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
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">SMS Phone Number</h3>
            <p className="text-sm text-muted-foreground">Get a phone number to send automated follow-ups</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-6 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="font-medium text-foreground">No phone number configured</p>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            You need a phone number to send SMS follow-ups. 
            Get one now to start automating your quote follow-up.
          </p>
        </div>

        <Button onClick={() => setShowSearch(true)} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Get Phone Number
        </Button>
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
              <div className="flex-1 space-y-1">
                <Label htmlFor="areaCode">Area Code</Label>
                <Input
                  id="areaCode"
                  placeholder="e.g. 415"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                />
              </div>
              <Button className="mt-6" onClick={handleSearch} disabled={searching}>
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
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedNumber === number.phone_number
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <span className="font-medium text-foreground">
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
            <Button onClick={handlePurchase} disabled={!selectedNumber || purchasing}>
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
