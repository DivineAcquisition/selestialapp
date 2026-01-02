import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QuoteStatus } from '@/types';

interface QuoteStatusBadgeProps {
  status: QuoteStatus | string;
  size?: 'sm' | 'default';
  className?: string;
}

const statusConfig: Record<QuoteStatus, { label: string; className: string }> = {
  new: {
    label: 'New',
    className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  },
  active: {
    label: 'Active',
    className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  },
  paused: {
    label: 'Paused',
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
  },
  won: {
    label: 'Won',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  },
  lost: {
    label: 'Lost',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  },
  no_response: {
    label: 'No Response',
    className: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100',
  },
};

export default function QuoteStatusBadge({ status, size = 'default', className }: QuoteStatusBadgeProps) {
  const config = statusConfig[status as QuoteStatus] || statusConfig.new;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.className,
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
