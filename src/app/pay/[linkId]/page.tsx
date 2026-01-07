"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

// ============================================================================
// TYPES
// ============================================================================

interface PaymentLinkData {
  id: string;
  linkId: string;
  businessName: string;
  businessLogo?: string;
  businessEmail: string;
  businessPhone: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  description: string;
  services: { name: string; price: number; quantity: number }[];
  status: "pending" | "paid" | "expired" | "cancelled";
  expiresAt: string | null;
  createdAt: string;
  checkoutUrl?: string;
}

type PaymentStatus = "idle" | "processing" | "success" | "error" | "loading";

// ============================================================================
// HELPERS
// ============================================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// ============================================================================
// COMPONENTS
// ============================================================================

function ServiceLineItem({ service }: { service: { name: string; price: number; quantity: number } }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
          <Icon name="check" size="sm" className="text-violet-600" />
        </div>
        <div>
          <p className="font-medium">{service.name}</p>
          {service.quantity > 1 && (
            <p className="text-sm text-gray-500">Qty: {service.quantity}</p>
          )}
        </div>
      </div>
      <p className="font-medium">{formatCurrency(service.price * service.quantity)}</p>
    </div>
  );
}

function ExpiredPage({ data }: { data: PaymentLinkData }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Icon name="clock" size="xl" className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Link Expired</h1>
        <p className="mt-2 text-gray-600">
          This payment link has expired and is no longer valid.
        </p>
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Original amount</p>
          <p className="text-xl font-bold text-gray-400 line-through">
            {formatCurrency(data.amount)}
          </p>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Please contact {data.businessName} for a new payment link.
        </p>
        <a
          href={`mailto:${data.businessEmail}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          <Icon name="email" size="sm" />
          {data.businessEmail}
        </a>
      </div>
    </div>
  );
}

function PaidPage({ data }: { data: PaymentLinkData }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Icon name="checkCircle" size="xl" className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Already Paid</h1>
        <p className="mt-2 text-gray-600">
          This invoice has already been paid. Thank you!
        </p>
        <div className="mt-6 rounded-lg bg-emerald-50 p-4">
          <p className="text-sm text-emerald-600">Amount paid</p>
          <p className="text-2xl font-bold text-emerald-700">
            {formatCurrency(data.amount)}
          </p>
        </div>
        <div className="mt-6 text-left rounded-lg border p-4">
          <p className="text-sm text-gray-500">Paid to</p>
          <p className="font-medium">{data.businessName}</p>
          <p className="mt-2 text-sm text-gray-500">For</p>
          <p className="font-medium">{data.description}</p>
        </div>
      </div>
    </div>
  );
}

function CancelledPage({ data }: { data: PaymentLinkData }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Icon name="close" size="xl" className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Link Cancelled</h1>
        <p className="mt-2 text-gray-600">
          This payment link has been cancelled by the merchant.
        </p>
        <p className="mt-6 text-sm text-gray-500">
          Please contact {data.businessName} if you have questions.
        </p>
        <a
          href={`mailto:${data.businessEmail}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          <Icon name="email" size="sm" />
          Contact Business
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING PAGE
// ============================================================================

function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <Icon name="spinner" size="xl" className="animate-spin text-violet-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading payment details...</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Icon name="alertCircle" size="xl" className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Link Not Found</h1>
        <p className="mt-2 text-gray-600">
          This payment link doesn&apos;t exist or may have been removed.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CHECKOUT PAGE
// ============================================================================

export default function PaymentCheckoutPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  
  const [data, setData] = useState<PaymentLinkData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const [showDetails, setShowDetails] = useState(true);

  // Fetch payment link data
  useEffect(() => {
    async function fetchPaymentLink() {
      try {
        const response = await fetch(`/api/payments/links/${linkId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("not_found");
          } else {
            setError("error");
          }
          setPaymentStatus("error");
          return;
        }
        
        const linkData = await response.json();
        setData(linkData);
        setPaymentStatus("idle");
      } catch (err) {
        console.error("Failed to fetch payment link:", err);
        setError("error");
        setPaymentStatus("error");
      }
    }

    if (linkId) {
      fetchPaymentLink();
    }
  }, [linkId]);

  const handlePayment = async () => {
    if (!data?.checkoutUrl) return;
    
    setPaymentStatus("processing");
    
    // Redirect to Stripe Checkout
    window.location.href = data.checkoutUrl;
  };

  // Handle loading state
  if (paymentStatus === "loading") {
    return <LoadingPage />;
  }

  // Handle not found
  if (error === "not_found" || !data) {
    return <NotFoundPage />;
  }

  // Handle different statuses
  if (data.status === "expired") {
    return <ExpiredPage data={data} />;
  }

  if (data.status === "paid") {
    return <PaidPage data={data} />;
  }

  if (data.status === "cancelled") {
    return <CancelledPage data={data} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {data.businessLogo ? (
              <Image src={data.businessLogo} alt="" width={40} height={40} className="h-10 w-10 rounded-lg" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <Icon name="building" size="lg" className="text-violet-600" />
              </div>
            )}
            <div>
              <p className="font-semibold">{data.businessName}</p>
              <p className="text-xs text-gray-500">Secure Checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Icon name="lock" size="sm" />
            <span>SSL Secured</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Payment Summary & Button */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Complete Your Payment</h2>
              <p className="mt-1 text-sm text-gray-500">
                Click below to securely pay via Stripe
              </p>

              {/* Amount Display */}
              <div className="mt-6 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 p-6 text-white text-center">
                <p className="text-sm opacity-80">Amount Due</p>
                <p className="text-4xl font-bold mt-1">{formatCurrency(data.amount / 100)}</p>
                {data.description && (
                  <p className="text-sm opacity-80 mt-2">{data.description}</p>
                )}
              </div>

              {/* Customer Info */}
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Paying as</p>
                <p className="font-medium">{data.customerName}</p>
                <p className="text-sm text-gray-500">{data.customerEmail}</p>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={paymentStatus === "processing"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentStatus === "processing" ? (
                  <>
                    <Icon name="spinner" size="lg" className="animate-spin" />
                    Redirecting to payment...
                  </>
                ) : (
                  <>
                    <Icon name="lock" size="lg" />
                    Pay {formatCurrency(data.amount / 100)}
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Icon name="shield" size="sm" />
                  <span>Secure payment</span>
                </div>
                <span>•</span>
                <span>Powered by Stripe</span>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between lg:pointer-events-none"
              >
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <Icon 
                  name="chevronDown" 
                  size="lg" 
                  className={`text-gray-400 transition-transform lg:hidden ${showDetails ? "rotate-180" : ""}`} 
                />
              </button>

              <div className={`${showDetails ? "block" : "hidden lg:block"}`}>
                {/* Description */}
                {data.description && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-sm font-medium text-gray-700">{data.description}</p>
                  </div>
                )}

                {/* Services */}
                <div className="mt-4 divide-y">
                  {data.services.map((service, i) => (
                    <ServiceLineItem key={i} service={service} />
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-violet-600">
                      {formatCurrency(data.amount)}
                    </span>
                  </div>
                </div>

                {/* Expiry Notice */}
                {data.expiresAt && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                    <Icon name="clock" size="sm" />
                    <span>
                      Link expires {formatDate(data.expiresAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Business Contact */}
            <div className="mt-4 rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-500">Questions? Contact</p>
              <p className="mt-1 font-medium">{data.businessName}</p>
              <div className="mt-2 flex gap-3 text-sm">
                <a
                  href={`mailto:${data.businessEmail}`}
                  className="flex items-center gap-1 text-violet-600 hover:text-violet-700"
                >
                  <Icon name="email" size="sm" />
                  Email
                </a>
                <a
                  href={`tel:${data.businessPhone}`}
                  className="flex items-center gap-1 text-violet-600 hover:text-violet-700"
                >
                  <Icon name="phone" size="sm" />
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-gray-500 sm:flex-row sm:text-left">
            <div className="flex items-center gap-2">
              <Icon name="lock" size="sm" />
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Powered by Selestial</span>
              <a href="/terms" className="hover:text-gray-700">Terms</a>
              <a href="/privacy" className="hover:text-gray-700">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
