import { MoreHorizontal, ArrowUpRight, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type QuoteStatus = 'new' | 'active' | 'paused' | 'won' | 'lost' | 'no_response';

interface Quote {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_type: string;
  quote_amount: number;
  status: QuoteStatus;
  created_at: string;
  current_step_index: number;
  next_message_at?: string;
}

const statusConfig: Record<QuoteStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  new: { label: "New", variant: "outline", className: "border-primary/30 text-primary bg-primary/5" },
  active: { label: "Active", variant: "default", className: "bg-primary text-primary-foreground" },
  paused: { label: "Paused", variant: "secondary", className: "bg-muted text-muted-foreground" },
  won: { label: "Won", variant: "default", className: "bg-success text-success-foreground" },
  lost: { label: "Lost", variant: "destructive", className: "bg-destructive/10 text-destructive" },
  no_response: { label: "No Response", variant: "secondary", className: "bg-warning/10 text-warning" },
};

// Mock data
const mockQuotes: Quote[] = [
  {
    id: "1",
    customer_name: "Sarah Williams",
    customer_phone: "+15559876543",
    customer_email: "sarah@email.com",
    service_type: "AC Repair",
    quote_amount: 250000,
    status: "active",
    created_at: "2025-01-02T10:30:00Z",
    current_step_index: 1,
    next_message_at: "2025-01-03T10:30:00Z",
  },
  {
    id: "2",
    customer_name: "David Chen",
    customer_phone: "+15551234567",
    service_type: "Water Heater Install",
    quote_amount: 450000,
    status: "new",
    created_at: "2025-01-02T09:15:00Z",
    current_step_index: 0,
  },
  {
    id: "3",
    customer_name: "Emily Rodriguez",
    customer_phone: "+15552468135",
    customer_email: "emily.r@gmail.com",
    service_type: "Pipe Replacement",
    quote_amount: 180000,
    status: "won",
    created_at: "2024-12-28T14:00:00Z",
    current_step_index: 3,
  },
  {
    id: "4",
    customer_name: "James Wilson",
    customer_phone: "+15557891234",
    service_type: "Drain Cleaning",
    quote_amount: 35000,
    status: "lost",
    created_at: "2024-12-25T11:45:00Z",
    current_step_index: 2,
  },
  {
    id: "5",
    customer_name: "Lisa Thompson",
    customer_phone: "+15553691472",
    customer_email: "lisa.t@company.com",
    service_type: "HVAC Maintenance",
    quote_amount: 89900,
    status: "active",
    created_at: "2025-01-01T16:20:00Z",
    current_step_index: 1,
    next_message_at: "2025-01-04T09:00:00Z",
  },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function QuotesTable() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Recent Quotes</h2>
          <p className="text-sm text-muted-foreground">Track and manage your quote follow-ups</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          View All
          <ArrowUpRight size={14} />
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockQuotes.map((quote) => {
              const status = statusConfig[quote.status];
              
              return (
                <tr key={quote.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-sm font-medium text-accent-foreground">
                          {quote.customer_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{quote.customer_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone size={12} />
                          <span>{quote.customer_phone}</span>
                          {quote.customer_email && (
                            <>
                              <Mail size={12} className="ml-2" />
                              <span>{quote.customer_email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-card-foreground">{quote.service_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-card-foreground">{formatCurrency(quote.quote_amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn("font-medium", status.className)}>
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{formatDate(quote.created_at)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Won</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Mark as Lost</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
