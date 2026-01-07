"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, FileText, MessageSquare, Command } from 'lucide-react';

interface QuickActionsProps {
  onAddQuote: () => void;
}

export default function QuickActions({ onAddQuote }: QuickActionsProps) {
  const router = useRouter();
  
  return (
    <Card className="p-4 glow-border">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button 
          onClick={onAddQuote}
          className="glow-sm"
        >
          <Plus className="w-4 h-4" />
          Quick Add Quote
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/quotes')}
            className="hover:border-primary/30 transition-colors"
          >
            <FileText className="w-4 h-4" />
            All Quotes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/inbox')}
            className="hover:border-primary/30 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Inbox
          </Button>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 ml-auto text-xs text-muted-foreground">
          <Command className="w-3 h-3 text-primary" />
          <span>Press</span>
          <kbd className="px-2 py-1 bg-muted rounded-md text-[10px] font-mono border border-border">N</kbd>
          <span>to add quote</span>
        </div>
      </div>
    </Card>
  );
}
