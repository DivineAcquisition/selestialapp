import { Quote, QuoteStatus } from '@/types';
import QuoteCard from './QuoteCard';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface QuotePipelineProps {
  quotes: Quote[];
  onQuoteClick: (quoteId: string) => void;
}

interface ColumnConfig {
  status: QuoteStatus;
  label: string;
  dotColor: string;
  bgGradient: string;
  borderColor: string;
}

const columns: ColumnConfig[] = [
  { 
    status: 'new', 
    label: 'New', 
    dotColor: 'bg-info', 
    bgGradient: 'from-info/10 to-info/5',
    borderColor: 'border-info/20'
  },
  { 
    status: 'active', 
    label: 'Active', 
    dotColor: 'bg-warning', 
    bgGradient: 'from-warning/10 to-warning/5',
    borderColor: 'border-warning/20'
  },
  { 
    status: 'paused', 
    label: 'Paused', 
    dotColor: 'bg-muted-foreground', 
    bgGradient: 'from-muted/30 to-muted/10',
    borderColor: 'border-muted'
  },
  { 
    status: 'won', 
    label: 'Won', 
    dotColor: 'bg-success', 
    bgGradient: 'from-success/10 to-success/5',
    borderColor: 'border-success/20'
  },
  { 
    status: 'lost', 
    label: 'Lost', 
    dotColor: 'bg-destructive', 
    bgGradient: 'from-destructive/10 to-destructive/5',
    borderColor: 'border-destructive/20'
  },
  { 
    status: 'no_response', 
    label: 'No Response', 
    dotColor: 'bg-muted-foreground/50', 
    bgGradient: 'from-secondary/50 to-secondary/30',
    borderColor: 'border-border'
  },
];

export default function QuotePipeline({ quotes, onQuoteClick }: QuotePipelineProps) {
  const getQuotesByStatus = (status: QuoteStatus) => 
    quotes.filter(q => q.status === status);
  
  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex gap-4 min-w-max">
        {columns.map((column, index) => {
          const columnQuotes = getQuotesByStatus(column.status);
          
          return (
            <div 
              key={column.status}
              className="w-72 flex-shrink-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Column header */}
              <div className={cn(
                "flex items-center justify-between px-4 py-3 rounded-t-xl border border-b-0 bg-gradient-to-r",
                column.bgGradient,
                column.borderColor
              )}>
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "h-2.5 w-2.5 rounded-full shadow-sm",
                    column.dotColor
                  )} />
                  <span className="font-semibold text-sm text-foreground">{column.label}</span>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-full",
                  columnQuotes.length > 0 
                    ? "bg-foreground/10 text-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {columnQuotes.length}
                </span>
              </div>
              
              {/* Column body */}
              <Card className={cn(
                "rounded-t-none border-t-0 min-h-[250px] p-2 space-y-2",
                column.borderColor
              )}>
                {columnQuotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                      <div className={cn("w-3 h-3 rounded-full opacity-50", column.dotColor)} />
                    </div>
                    <p className="text-xs text-muted-foreground">No {column.label.toLowerCase()} quotes</p>
                  </div>
                ) : (
                  columnQuotes.map((quote, quoteIndex) => (
                    <div 
                      key={quote.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${quoteIndex * 30}ms` }}
                    >
                      <QuoteCard
                        quote={quote}
                        onClick={() => onQuoteClick(quote.id)}
                      />
                    </div>
                  ))
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
