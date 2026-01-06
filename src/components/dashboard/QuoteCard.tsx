import { Card } from '@/components/ui/card';
import { Quote } from '@/types';
import { formatCurrency, getDaysSince, formatRelativeTime } from '@/lib/formatters';
import { Clock, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuoteCardProps {
  quote: Quote;
  onClick: () => void;
}

export default function QuoteCard({ quote, onClick }: QuoteCardProps) {
  const daysSince = getDaysSince(quote.created_at);
  
  return (
    <Card 
      className={cn(
        "p-3.5 cursor-pointer transition-all duration-200 group",
        "hover:bg-secondary/50 hover:shadow-md hover:-translate-y-0.5",
        "border-border/50"
      )}
      onClick={onClick}
    >
      <div className="space-y-2.5">
        {/* Customer name and arrow */}
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm text-foreground truncate">{quote.customer_name}</p>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        
        {/* Service type */}
        <p className="text-xs text-muted-foreground truncate">{quote.service_type}</p>
        
        {/* Bottom row: amount and days */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-foreground">
            {formatCurrency(quote.quote_amount)}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3" />
            {daysSince}d ago
          </span>
        </div>
        
        {/* Next message indicator (if active) */}
        {quote.next_message_at && quote.status === 'active' && (
          <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg border border-primary/20">
            <Zap className="h-3 w-3" />
            <span className="font-medium">Next: {formatRelativeTime(quote.next_message_at)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
