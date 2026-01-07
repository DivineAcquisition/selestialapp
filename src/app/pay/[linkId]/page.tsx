"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon, IconName } from "@/components/ui/icon";

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
}

type PaymentStatus = "idle" | "processing" | "success" | "error";

// ============================================================================
// MOCK DATA (would come from API in real implementation)
// ============================================================================

const MOCK_PAYMENT_DATA: PaymentLinkData = {
  id: "1",
  linkId: "pay_abc123xyz",
  businessName: "Sparkle Clean Co.",
  businessLogo: undefined,
  businessEmail: "hello@sparkleclean.com",
  businessPhone: "(555) 123-4567",
  customerName: "Sarah Johnson",
  customerEmail: "sarah@example.com",
  amount: 275,
  description: "Deep Cleaning - 3BR Home",
  services: [
    { name: "Deep Cleaning", price: 225, quantity: 1 },
    { name: "Inside Refrigerator", price: 35, quantity: 1 },
    { name: "Inside Oven", price: 15, quantity: 1 },
  ],
  status: "pending",
  expiresAt: "2026-01-14T00:00:00Z",
  createdAt: "2026-01-07T10:30:00Z",
};

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

function CardInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  maxLength,
  iconName,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  iconName?: IconName;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {iconName && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon name={iconName} size="lg" className="text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${iconName ? "pl-11" : "pl-4"}`}
        />
      </div>
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

function SuccessPage({ data }: { data: PaymentLinkData }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <Icon name="checkCircle" size="xl" className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="mt-2 text-gray-600">
          Thank you for your payment. A receipt has been sent to your email.
        </p>

        <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
          <p className="text-sm opacity-80">Amount Paid</p>
          <p className="text-3xl font-bold">{formatCurrency(data.amount)}</p>
        </div>

        <div className="mt-6 space-y-3 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Paid to</span>
            <span className="font-medium">{data.businessName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">For</span>
            <span className="font-medium">{data.description}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Receipt sent to</span>
            <span className="font-medium">{data.customerEmail}</span>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">
            Questions about your service? Contact:
          </p>
          <p className="mt-1 font-medium">{data.businessName}</p>
          <div className="mt-2 flex justify-center gap-4">
            <a
              href={`mailto:${data.businessEmail}`}
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
            >
              <Icon name="email" size="sm" />
              Email
            </a>
            <a
              href={`tel:${data.businessPhone}`}
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
            >
              <Icon name="phone" size="sm" />
              Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CHECKOUT PAGE
// ============================================================================

export default function PaymentCheckoutPage() {
  // In real app, get linkId from URL params and fetch data
  const [data] = useState<PaymentLinkData>(MOCK_PAYMENT_DATA);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [email, setEmail] = useState(data.customerEmail);

  const [showDetails, setShowDetails] = useState(true);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  // Format expiry as MM/YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    setPaymentStatus("processing");

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2500));

    // In real app, call Stripe API here
    setPaymentStatus("success");
  };

  const isFormValid =
    cardNumber.replace(/\s/g, "").length === 16 &&
    cardExpiry.length === 5 &&
    cardCvc.length >= 3 &&
    cardName.length > 0 &&
    email.includes("@");

  // Handle different statuses
  if (data.status === "expired") {
    return <ExpiredPage data={data} />;
  }

  if (paymentStatus === "success") {
    return <SuccessPage data={data} />;
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
          {/* Left: Payment Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter your card information to complete the payment
              </p>

              <div className="mt-6 space-y-4">
                {/* Email */}
                <CardInput
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  iconName="email"
                />

                {/* Card Number */}
                <CardInput
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(v) => setCardNumber(formatCardNumber(v))}
                  maxLength={19}
                  iconName="creditCard"
                />

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <CardInput
                  label="Cardholder Name"
                  placeholder="John Smith"
                  value={cardName}
                  onChange={setCardName}
                />
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={!isFormValid || paymentStatus === "processing"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentStatus === "processing" ? (
                  <>
                    <Icon name="spinner" size="lg" className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon name="lock" size="lg" />
                    Pay {formatCurrency(data.amount)}
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
