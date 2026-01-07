import { useQuotes } from '@/hooks/useQuotes';
import { formatCurrency } from '@/lib/formatters';
import { Icon } from '@/components/ui/icon';

interface QuoteData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  service_type: string;
  quote_amount: number;
  description?: string | null;
}

interface RecentQuotesBarProps {
  onDuplicate: (quote: QuoteData) => void;
}

export default function RecentQuotesBar({ onDuplicate }: RecentQuotesBarProps) {
  const { quotes } = useQuotes();
  
  // Get 3 most recent quotes
  const recentQuotes = quotes
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
  
  if (recentQuotes.length === 0) return null;
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <span className="text-xs text-muted-foreground flex-shrink-0">Recent:</span>
      {recentQuotes.map((quote) => (
        <button
          key={quote.id}
          onClick={() => onDuplicate({
            customer_name: quote.customer_name,
            customer_phone: quote.customer_phone,
            customer_email: quote.customer_email,
            service_type: quote.service_type,
            quote_amount: quote.quote_amount,
            description: quote.description,
          })}
          className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors flex-shrink-0"
        >
          <span className="font-medium text-foreground truncate max-w-[100px]">
            {quote.customer_name.split(' ')[0]}
          </span>
          <span className="text-muted-foreground">
            {formatCurrency(quote.quote_amount)}
          </span>
          <Icon name="copy" size="xs" className="text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
