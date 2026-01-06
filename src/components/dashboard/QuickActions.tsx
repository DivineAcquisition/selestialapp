"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Sparkles, FileText, MessageSquare } from 'lucide-react';

interface QuickActionsProps {
  onAddQuote: () => void;
}

export default function QuickActions({ onAddQuote }: QuickActionsProps) {
  const router = useRouter();
  
  return (
    <Card className="p-4 bg-gradient-to-br from-card to-secondary/20 border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Primary action */}
        <Button 
          onClick={onAddQuote} 
          variant="gradient"
          className="gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Quick Add Quote
          <Sparkles className="w-3.5 h-3.5 ml-1 opacity-70" />
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
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 font-mono text-[10px]">N</kbd>
          <span>to add quote</span>
        </div>
      </div>
    </Card>
  );
}
