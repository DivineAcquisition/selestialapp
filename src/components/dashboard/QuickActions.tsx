"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, FileText, MessageSquare } from 'lucide-react';

interface QuickActionsProps {
  onAddQuote: () => void;
}

export default function QuickActions({ onAddQuote }: QuickActionsProps) {
  const router = useRouter();
  
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Primary action with neon style */}
        <Button 
          onClick={onAddQuote} 
          variant="neon"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Quick Add Quote
        </Button>
        
        {/* Secondary actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/quotes')}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            All Quotes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/inbox')}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Inbox
          </Button>
        </div>
        
        {/* Keyboard hint */}
        <div className="hidden sm:flex items-center gap-2 ml-auto text-xs text-muted-foreground">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">N</kbd>
          <span>to add quote</span>
        </div>
      </div>
    </Card>
  );
}
