"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createBrowserClient } from '@supabase/ssr';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<{
    amount: number;
    customerName: string;
  } | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const supabaseClient = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: paymentData } = await supabaseClient
          .from('payments')
          .select('amount, quote_id')
          .eq('stripe_session_id', sessionId)
          .limit(1);

        if (paymentData && paymentData.length > 0) {
          const payment = paymentData[0];
          let customerName = 'Customer';
          
          if (payment.quote_id) {
            const { data: quoteData } = await supabaseClient
              .from('quotes')
              .select('customer_name')
              .eq('id', payment.quote_id)
              .limit(1);
            
            if (quoteData && quoteData.length > 0) {
              customerName = quoteData[0].customer_name;
            }
          }
          
          setPaymentDetails({
            amount: payment.amount / 100,
            customerName,
          });
        }
      } catch (err) {
        console.error('Failed to fetch payment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {loading ? (
          <div className="py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Confirming payment...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Payment Successful!
            </h1>
            
            {paymentDetails ? (
              <p className="text-muted-foreground mb-6">
                Thank you, {paymentDetails.customerName}! Your payment of{' '}
                <span className="font-semibold text-foreground">
                  ${paymentDetails.amount.toFixed(2)}
                </span>{' '}
                has been processed successfully.
              </p>
            ) : (
              <p className="text-muted-foreground mb-6">
                Your payment has been processed successfully. You will receive a confirmation email shortly.
              </p>
            )}
            
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                A receipt has been sent to your email address.
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              You can safely close this page.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
