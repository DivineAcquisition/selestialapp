import { Quote, QuoteStatus } from '@/types';
import QuoteCard from './QuoteCard';
import { cn } from '@/lib/utils';

interface QuotePipelineProps {
  quotes: Quote[];
  onQuoteClick: (quoteId: string) => void;
}

interface ColumnConfig {
  status: QuoteStatus;
  label: string;
  dotColor: string;
  bgColor: string;
}

const columns: ColumnConfig[] = [
  { status: 'new', label: 'New', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50' },
  { status: 'active', label: 'Active', dotColor: 'bg-amber-500', bgColor: 'bg-amber-50' },
  { status: 'paused', label: 'Paused', dotColor: 'bg-gray-500', bgColor: 'bg-gray-50' },
  { status: 'won', label: 'Won', dotColor: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
  { status: 'lost', label: 'Lost', dotColor: 'bg-red-500', bgColor: 'bg-red-50' },
  { status: 'no_response', label: 'No Response', dotColor: 'bg-slate-500', bgColor: 'bg-slate-50' },
];

export default function QuotePipeline({ quotes, onQuoteClick }: QuotePipelineProps) {
  const getQuotesByStatus = (status: QuoteStatus) => 
    quotes.filter(q => q.status === status);
  
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {columns.map((column) => {
          const columnQuotes = getQuotesByStatus(column.status);
          
          return (
            <div 
              key={column.status}
              className="w-64 flex-shrink-0"
            >
              {/* Column header */}
              <div className={cn(
                "flex items-center justify-between px-3 py-2 rounded-t-lg",
                column.bgColor
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", column.dotColor)} />
                  <span className="font-medium text-sm">{column.label}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                  {columnQuotes.length}
                </span>
              </div>
              
              {/* Column body */}
              <div className="bg-muted/30 rounded-b-lg p-2 min-h-[200px] space-y-2">
                {columnQuotes.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                    No quotes
                  </div>
                ) : (
                  columnQuotes.map((quote) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onClick={() => onQuoteClick(quote.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
