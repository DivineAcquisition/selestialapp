"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface PaymentLink {
  id: string;
  link_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  amount: number;
  description: string;
  services: { name: string; price: number; quantity: number }[];
  status: "pending" | "paid" | "expired" | "cancelled";
  expires_at: string | null;
  paid_at: string | null;
  created_at: string;
  stripe_checkout_url: string;
  quote?: {
    id: string;
    service_type: string;
    customer_name: string;
  };
}

interface PaymentLinkResponse {
  id: string;
  linkId: string;
  checkoutUrl: string;
  amount: number;
  expiresAt: string;
}

interface UsePaymentLinksReturn {
  links: PaymentLink[];
  loading: boolean;
  stripeConfigured: boolean;
  error: string | null;
  createLink: (data: CreateLinkData) => Promise<{ success: boolean; paymentLink?: PaymentLinkResponse; error?: string }>;
  sendLink: (linkId: string, method: "email" | "sms" | "both") => Promise<{ success: boolean; error?: string }>;
  cancelLink: (linkId: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

interface CreateLinkData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  amount: number;
  description?: string;
  services?: { name: string; price: number; quantity: number }[];
  expiresInDays?: number;
  quoteId?: string;
}

export function usePaymentLinks(): UsePaymentLinksReturn {
  const { toast } = useToast();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/payments/links");
      
      if (!response.ok) {
        throw new Error("Failed to fetch payment links");
      }
      
      const data = await response.json();
      setLinks(data.links || []);
      setStripeConfigured(data.stripeConfigured || false);
    } catch (err) {
      console.error("Error fetching payment links:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch payment links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const createLink = useCallback(async (data: CreateLinkData) => {
    try {
      const response = await fetch("/api/payments/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "STRIPE_NOT_CONFIGURED") {
          toast({
            title: "Stripe not configured",
            description: "Please complete Stripe Connect setup in Settings > Connections",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create payment link",
            variant: "destructive",
          });
        }
        return { success: false, error: result.error };
      }

      toast({
        title: "Payment link created!",
        description: "Ready to send to your customer",
      });

      // Refetch links
      await fetchLinks();

      return { success: true, paymentLink: result.paymentLink };
    } catch {
      toast({
        title: "Error",
        description: "Failed to create payment link",
        variant: "destructive",
      });
      return { success: false, error: "Failed to create payment link" };
    }
  }, [fetchLinks, toast]);

  const sendLink = useCallback(async (linkId: string, method: "email" | "sms" | "both") => {
    try {
      const response = await fetch(`/api/payments/links/${linkId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to send payment link",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }

      toast({
        title: "Payment link sent!",
        description: result.message,
      });

      return { success: true };
    } catch {
      toast({
        title: "Error",
        description: "Failed to send payment link",
        variant: "destructive",
      });
      return { success: false, error: "Failed to send payment link" };
    }
  }, [toast]);

  const cancelLink = useCallback(async (linkId: string) => {
    try {
      const response = await fetch(`/api/payments/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel payment link",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }

      toast({
        title: "Payment link cancelled",
      });

      // Refetch links
      await fetchLinks();

      return { success: true };
    } catch {
      toast({
        title: "Error",
        description: "Failed to cancel payment link",
        variant: "destructive",
      });
      return { success: false, error: "Failed to cancel payment link" };
    }
  }, [fetchLinks, toast]);

  return {
    links,
    loading,
    stripeConfigured,
    error,
    createLink,
    sendLink,
    cancelLink,
    refetch: fetchLinks,
  };
}
