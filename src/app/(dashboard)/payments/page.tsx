"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon, IconName } from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { usePaymentLinks, PaymentLink } from "@/hooks/usePaymentLinks";
import { cn } from "@/lib/utils";

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<PaymentLink["status"], { label: string; color: string; icon: IconName }> = {
  pending: { label: "Pending", color: "amber", icon: "clock" },
  paid: { label: "Paid", color: "emerald", icon: "checkCircle" },
  expired: { label: "Expired", color: "gray", icon: "alertCircle" },
  cancelled: { label: "Cancelled", color: "red", icon: "close" },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: PaymentLink["status"] }) {
  const config = STATUS_CONFIG[status];

  const colorClasses: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", colorClasses[config.color])}>
      <Icon name={config.icon} size="xs" />
      {config.label}
    </span>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-muted"
    >
      {copied ? (
        <>
          <Icon name="check" size="sm" className="text-emerald-500" />
          <span className="text-emerald-600">Copied!</span>
        </>
      ) : (
        <>
          <Icon name="copy" size="sm" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}

function StripeNotConfiguredBanner() {
  return (
    <Card className="p-4 border-2 border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Icon name="alertCircle" size="lg" className="text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">Stripe Connect Required</p>
            <p className="text-sm text-amber-700">Connect your Stripe account to create and accept payment links</p>
          </div>
        </div>
        <Link href="/connections">
          <Button className="gap-2 whitespace-nowrap">
            <Icon name="plug" size="sm" />
            Connect Stripe
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function CreateLinkModal({
  isOpen,
  onClose,
  onCreate,
  stripeConfigured,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<{ success: boolean; paymentLink?: any }>;
  stripeConfigured: boolean;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState([{ name: "", price: 0, quantity: 1 }]);
  const [expiresIn, setExpiresIn] = useState("7");
  const [isCreating, setIsCreating] = useState(false);

  const total = services.reduce((sum, s) => sum + s.price * s.quantity, 0);

  const addService = () => {
    setServices([...services, { name: "", price: 0, quantity: 1 }]);
  };

  const updateService = (index: number, field: string, value: string | number) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setDescription("");
    setServices([{ name: "", price: 0, quantity: 1 }]);
    setExpiresIn("7");
  };

  const handleCreate = async () => {
    if (!stripeConfigured) return;
    
    setIsCreating(true);

    const result = await onCreate({
      customerName,
      customerEmail,
      customerPhone,
      description,
      services: services.filter((s) => s.name && s.price > 0),
      amount: Math.round(total * 100), // Convert to cents
      expiresInDays: expiresIn ? parseInt(expiresIn) : 30,
    });

    setIsCreating(false);
    
    if (result.success) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Payment Link</DialogTitle>
          <DialogDescription>Create a new payment link to send to your customer</DialogDescription>
        </DialogHeader>

        {!stripeConfigured && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <div className="flex items-center gap-2">
              <Icon name="alertCircle" size="sm" />
              <span>You need to connect Stripe before creating payment links.</span>
            </div>
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Customer Info */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Name *</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Smith"
                  disabled={!stripeConfigured}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                    disabled={!stripeConfigured}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    disabled={!stripeConfigured}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Services */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Services</h3>
              <button 
                onClick={addService} 
                className="text-sm text-primary hover:underline"
                disabled={!stripeConfigured}
              >
                + Add Service
              </button>
            </div>
            <div className="space-y-2">
              {services.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={service.name}
                    onChange={(e) => updateService(index, "name", e.target.value)}
                    placeholder="Service name"
                    className="flex-1"
                    disabled={!stripeConfigured}
                  />
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={service.price || ""}
                      onChange={(e) => updateService(index, "price", Number(e.target.value))}
                      placeholder="0"
                      className="pl-6"
                      disabled={!stripeConfigured}
                    />
                  </div>
                  {services.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeService(index)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      disabled={!stripeConfigured}
                    >
                      <Icon name="trash" size="sm" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Deep cleaning for 3BR home"
              disabled={!stripeConfigured}
            />
          </div>

          {/* Expiration */}
          <div>
            <label className="mb-1 block text-sm font-medium">Link expires in</label>
            <Select value={expiresIn} onValueChange={setExpiresIn} disabled={!stripeConfigured}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!customerName || !customerEmail || total <= 0 || isCreating || !stripeConfigured}
            className="gap-2"
          >
            {isCreating ? (
              <>
                <Icon name="spinner" size="sm" className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Icon name="link" size="sm" />
                Create Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SendLinkModal({
  isOpen,
  onClose,
  link,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  link: PaymentLink | null;
  onSend: (linkId: string, method: "email" | "sms" | "both") => Promise<{ success: boolean }>;
}) {
  const [sendMethod, setSendMethod] = useState<"sms" | "email" | "both">("both");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!link) return;
    setIsSending(true);
    await onSend(link.link_id, sendMethod);
    setIsSending(false);
    onClose();
  };

  if (!link) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Payment Link</DialogTitle>
          <DialogDescription>Send the payment link to {link.customer_name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipient */}
          <Card className="p-4">
            <p className="font-medium">{link.customer_name}</p>
            <p className="text-sm text-muted-foreground">{link.customer_email}</p>
            {link.customer_phone && (
              <p className="text-sm text-muted-foreground">{link.customer_phone}</p>
            )}
          </Card>

          {/* Send Method */}
          <div>
            <label className="mb-2 block text-sm font-medium">Send via</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "sms" as const, label: "SMS", icon: "message" as IconName },
                { id: "email" as const, label: "Email", icon: "email" as IconName },
                { id: "both" as const, label: "Both", icon: "send" as IconName },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSendMethod(method.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all",
                    sendMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted hover:border-border"
                  )}
                >
                  <Icon name={method.icon} size="lg" />
                  <span className="text-xs font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Link */}
          <div className="flex items-center gap-2 rounded-xl bg-muted p-3">
            <Icon name="link" size="sm" className="text-muted-foreground" />
            <span className="flex-1 truncate text-sm">{link.stripe_checkout_url}</span>
            <CopyButton text={link.stripe_checkout_url} label="Copy" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending} className="gap-2">
            {isSending ? (
              <>
                <Icon name="spinner" size="sm" className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Icon name="send" size="sm" />
                Send {sendMethod === "both" ? "SMS & Email" : sendMethod.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinkDetailsModal({
  isOpen,
  onClose,
  link,
  onCancel,
}: {
  isOpen: boolean;
  onClose: () => void;
  link: PaymentLink | null;
  onCancel: (linkId: string) => Promise<{ success: boolean }>;
}) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!link) return;
    setIsCancelling(true);
    await onCancel(link.link_id);
    setIsCancelling(false);
    onClose();
  };

  if (!link) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Payment Link Details</DialogTitle>
            <StatusBadge status={link.status} />
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount */}
          <div className="rounded-xl bg-gradient-to-r from-primary to-[#9D96FF] p-6 text-white">
            <p className="text-sm opacity-80">Total Amount</p>
            <p className="text-4xl font-bold">{formatCurrency(link.amount)}</p>
            {link.description && <p className="mt-2 text-sm opacity-80">{link.description}</p>}
          </div>

          {/* Customer */}
          <Card className="p-4">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Customer</h3>
            <p className="font-medium">{link.customer_name}</p>
            <p className="text-sm text-muted-foreground">{link.customer_email}</p>
            {link.customer_phone && (
              <p className="text-sm text-muted-foreground">{link.customer_phone}</p>
            )}
          </Card>

          {/* Services */}
          {link.services && link.services.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Services</h3>
              <div className="space-y-2">
                {link.services.map((service, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{service.name}</span>
                    <span className="font-medium">${service.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Payment Link */}
          <Card className="p-4">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Payment Link</h3>
            <div className="flex items-center gap-2">
              <Input value={link.stripe_checkout_url} readOnly className="flex-1 bg-muted text-sm" />
              <CopyButton text={link.stripe_checkout_url} />
              <a
                href={link.stripe_checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border p-2 hover:bg-muted"
              >
                <Icon name="externalLink" size="sm" />
              </a>
            </div>
          </Card>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{formatDateTime(link.created_at)}</p>
            </div>
            {link.status === "paid" && link.paid_at && (
              <div>
                <p className="text-muted-foreground">Paid</p>
                <p className="font-medium text-emerald-600">{formatDateTime(link.paid_at)}</p>
              </div>
            )}
            {link.expires_at && link.status === "pending" && (
              <div>
                <p className="text-muted-foreground">Expires</p>
                <p className="font-medium">{formatDate(link.expires_at)}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {link.status === "pending" && (
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10" 
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <Icon name="spinner" size="sm" className="animate-spin" />
                ) : (
                  <Icon name="close" size="sm" />
                )}
                Cancel Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PaymentLinksPage() {
  const { toast } = useToast();
  const { links, loading, stripeConfigured, createLink, sendLink, cancelLink, refetch } = usePaymentLinks();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);

  // Filter links
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchesSearch =
        link.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || link.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [links, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: links.length,
    pending: links.filter((l) => l.status === "pending").length,
    pendingAmount: links.filter((l) => l.status === "pending").reduce((sum, l) => sum + l.amount, 0),
    paid: links.filter((l) => l.status === "paid").length,
    paidAmount: links.filter((l) => l.status === "paid").reduce((sum, l) => sum + l.amount, 0),
  }), [links]);

  const handleCreateLink = async (data: any) => {
    const result = await createLink(data);
    if (result.success && result.paymentLink) {
      setSelectedLink(null);
      // Could auto-open send modal here
    }
    return result;
  };

  const handleSendLink = (link: PaymentLink) => {
    setSelectedLink(link);
    setShowSendModal(true);
  };

  const handleViewDetails = (link: PaymentLink) => {
    setSelectedLink(link);
    setShowDetailsModal(true);
  };

  return (
    <Layout title="Payment Links">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <Icon name="link" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Payment Links</h1>
              <p className="text-muted-foreground">Create and manage payment links for your customers</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)} 
            className="gap-2"
            disabled={!stripeConfigured}
          >
            <Icon name="plus" size="sm" />
            Create Link
          </Button>
        </div>

        {/* Stripe Not Configured Banner */}
        {!loading && !stripeConfigured && <StripeNotConfiguredBanner />}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Icon name="link" size="lg" className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Links</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-2.5">
                <Icon name="clock" size="lg" className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-2.5">
                <Icon name="dollar" size="lg" className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</p>
                <p className="text-xs text-muted-foreground">Pending Amount</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/30 p-2.5">
                <Icon name="checkCircle" size="lg" className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.paidAmount)}</p>
                <p className="text-xs text-muted-foreground">Collected</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer or description..."
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Links Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Icon name="spinner" size="xl" className="animate-spin mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading payment links...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium">{link.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{link.customer_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm">{link.description || "-"}</p>
                          {link.services && link.services.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {link.services.length} service{link.services.length !== 1 ? "s" : ""}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold">{formatCurrency(link.amount)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={link.status} />
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm">{formatDate(link.created_at)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(link)}
                              className="h-8 w-8"
                              title="View Details"
                            >
                              <Icon name="eye" size="sm" />
                            </Button>
                            <CopyButton text={link.stripe_checkout_url} />
                            {link.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSendLink(link)}
                                className="h-8 w-8"
                                title="Send Link"
                              >
                                <Icon name="send" size="sm" />
                              </Button>
                            )}
                            <a
                              href={link.stripe_checkout_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Open Link"
                            >
                              <Icon name="externalLink" size="sm" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredLinks.length === 0 && (
                <div className="p-12 text-center">
                  <Icon name="link" size="xl" className="mx-auto text-muted-foreground/30" />
                  <h3 className="mt-4 font-medium">No payment links found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : stripeConfigured
                        ? "Create your first payment link to get started"
                        : "Connect Stripe to start creating payment links"}
                  </p>
                  {!searchQuery && statusFilter === "all" && stripeConfigured && (
                    <Button onClick={() => setShowCreateModal(true)} className="mt-4 gap-2">
                      <Icon name="plus" size="sm" />
                      Create Payment Link
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Modals */}
      <CreateLinkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateLink}
        stripeConfigured={stripeConfigured}
      />
      <SendLinkModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        link={selectedLink}
        onSend={sendLink}
      />
      <LinkDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        link={selectedLink}
        onCancel={cancelLink}
      />
    </Layout>
  );
}
