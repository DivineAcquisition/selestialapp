import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DangerZoneProps {
  businessName: string;
  onDeleteAccount: () => void;
}

export default function DangerZone({ businessName, onDeleteAccount }: DangerZoneProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  
  const canDelete = confirmText === businessName;
  
  const handleDelete = () => {
    if (canDelete) {
      onDeleteAccount();
      setShowConfirm(false);
    }
  };
  
  return (
    <>
      <Card className="p-6 border-destructive/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">Irreversible actions</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <Button 
            variant="destructive" 
            onClick={() => setShowConfirm(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </Card>
      
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your quotes, sequences, and data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-4">
            <p className="text-sm text-foreground">
              Type <span className="font-mono font-semibold">{businessName}</span> to confirm:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={businessName}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={!canDelete}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
