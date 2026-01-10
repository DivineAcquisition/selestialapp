"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface ReceiptData {
  id: string;
  paymentId: string;
  businessName: string;
  businessLogo?: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  description: string;
  services: { name: string; price: number; quantity: number }[];
  paidAt: string;
  paymentMethod: string;
  last4?: string;
}

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
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ReceiptPage() {
  const params = useParams();
  const paymentId = params.paymentId as string;
  
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      try {
        // In production, fetch from API
        // For now, use mock data
        setReceipt({
          id: paymentId,
          paymentId: paymentId,
          businessName: "Sparkle Clean Co.",
          businessEmail: "hello@sparkleclean.com",
          businessPhone: "(555) 123-4567",
          businessAddress: "123 Main St, Austin, TX 78701",
          customerName: "Sarah Johnson",
          customerEmail: "sarah@example.com",
          amount: 27500, // cents
          description: "Deep Cleaning Service",
          services: [
            { name: "Deep Cleaning", price: 225, quantity: 1 },
            { name: "Inside Refrigerator", price: 35, quantity: 1 },
            { name: "Inside Oven", price: 15, quantity: 1 },
          ],
          paidAt: new Date().toISOString(),
          paymentMethod: "card",
          last4: "4242",
        });
        setLoading(false);
      } catch (err) {
        setError("Receipt not found");
        setLoading(false);
      }
    }

    fetchReceipt();
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon name="spinner" size="xl" className="animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
          <Icon name="alertCircle" size="2xl" className="text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold">Receipt Not Found</h1>
          <p className="text-gray-600 mt-2">This receipt doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto">
        {/* Actions - hide on print */}
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Icon name="printer" size="sm" className="mr-2" />
            Print Receipt
          </Button>
          <Button variant="outline">
            <Icon name="download" size="sm" className="mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-violet-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {receipt.businessLogo ? (
                  <Image 
                    src={receipt.businessLogo} 
                    alt="" 
                    width={56} 
                    height={56} 
                    className="rounded-xl bg-white p-1" 
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon name="building" size="xl" className="text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{receipt.businessName}</h1>
                  <p className="text-violet-200">{receipt.businessEmail}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-violet-200 text-sm">Receipt</p>
                <p className="font-mono text-sm">#{receipt.paymentId.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-center justify-center gap-2">
            <Icon name="checkCircle" size="lg" className="text-emerald-600" />
            <span className="font-medium text-emerald-700">Payment Successful</span>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Amount */}
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm">Amount Paid</p>
              <p className="text-4xl font-bold text-gray-900">{formatCurrency(receipt.amount / 100)}</p>
              <p className="text-gray-500 text-sm mt-1">{formatDate(receipt.paidAt)}</p>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Paid By</p>
                <p className="font-medium">{receipt.customerName}</p>
                <p className="text-sm text-gray-600">{receipt.customerEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Method</p>
                <div className="flex items-center gap-2">
                  <Icon name="creditCard" size="sm" className="text-gray-400" />
                  <span className="font-medium">
                    {receipt.paymentMethod === "card" ? `Card ending in ${receipt.last4}` : receipt.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="border-t border-b py-6 mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Services</p>
              <div className="space-y-3">
                {receipt.services.map((service, i) => (
                  <div key={i} className="flex justify-between">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.quantity > 1 && (
                        <p className="text-sm text-gray-500">Qty: {service.quantity}</p>
                      )}
                    </div>
                    <p className="font-medium">{formatCurrency(service.price * service.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Paid</span>
              <span className="text-violet-600">{formatCurrency(receipt.amount / 100)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 text-center text-sm text-gray-500">
            <p>Thank you for your payment!</p>
            <p className="mt-1">
              Questions? Contact {receipt.businessName} at{" "}
              <a href={`mailto:${receipt.businessEmail}`} className="text-violet-600 hover:underline">
                {receipt.businessEmail}
              </a>
            </p>
          </div>
        </div>

        {/* Powered by */}
        <div className="text-center mt-6 text-sm text-gray-400 print:hidden">
          Powered by <span className="font-medium">Selestial</span>
        </div>
      </div>
    </div>
  );
}
