import { Card } from '@/components/ui/card';
import QuoteStatusBadge from './QuoteStatusBadge';
import { formatCurrency, formatPhone, formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;

interface QuoteListProps {
  quotes: Quote[];
  selectedId?: string;
  onSelect: (quote: Quote) => void;
}

export default function QuoteList({ quotes, selectedId, onSelect }: QuoteListProps) {
  if (quotes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No quotes found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {quotes.map((quote) => (
        <Card
          key={quote.id}
          onClick={() => onSelect(quote)}
          className={cn(
            'p-4 cursor-pointer transition-colors hover:bg-muted/50',
            selectedId === quote.id && 'ring-2 ring-primary bg-muted/50'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">
                {quote.customer_name}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {quote.service_type}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatPhone(quote.customer_phone)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-foreground">
                {formatCurrency(quote.quote_amount)}
              </p>
              <QuoteStatusBadge status={quote.status} className="mt-1" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formatRelativeTime(quote.created_at)}
          </p>
        </Card>
      ))}
    </div>
  );
}
