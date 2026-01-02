import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onAddQuote: () => void;
}

export default function QuickActions({ onAddQuote }: QuickActionsProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onAddQuote} className="gap-2">
          <Plus className="w-4 h-4" />
          Quick Add Quote
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/quotes')}
          className="gap-2"
        >
          View All Quotes
          <ArrowRight className="w-4 h-4" />
        </Button>
        
        <span className="text-xs text-muted-foreground hidden sm:inline ml-auto">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded">N</kbd> anytime
        </span>
      </div>
    </Card>
  );
}
