import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onAddQuote: () => void;
}

export default function QuickActions({ onAddQuote }: QuickActionsProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onAddQuote} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Quote
      </Button>
      <Button 
        variant="outline" 
        onClick={() => navigate('/quotes')}
        className="gap-2"
      >
        View All Quotes
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
