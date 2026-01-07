"use client";

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="xCircle" size="3xl" className="text-amber-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Cancelled
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            If you have any questions or need assistance, please contact the service provider directly.
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground">
          You can safely close this page.
        </p>
      </Card>
    </div>
  );
}
