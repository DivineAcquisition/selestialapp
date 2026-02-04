import { Card } from '@/components/ui/card';
import { Quote } from '@/types';
import { formatCurrency, getDaysSince, formatRelativeTime } from '@/lib/formatters';
import { Clock, ArrowRight } from 'lucide-react';

interface QuoteCardProps {
  quote: Quote;
  onClick: () => void;
}

export default function QuoteCard({ quote, onClick }: QuoteCardProps) {
  const daysSince = getDaysSince(quote.created_at);
  
  return (
    <Card 
      className="p-3 cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      <div className="space-y-2">
        {/* Customer name and arrow */}
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm text-foreground truncate">{quote.customer_name}</p>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Service type */}
        <p className="text-xs text-muted-foreground truncate">{quote.service_type}</p>
        
        {/* Bottom row: amount and days */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(quote.quote_amount)}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysSince}d ago
          </span>
        </div>
        
        {/* Next message indicator (if active) */}
        {quote.next_message_at && quote.status === 'active' && (
          <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
            Next: {formatRelativeTime(quote.next_message_at)}
          </div>
        )}
      </div>
    </Card>
  );
}
