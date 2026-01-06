"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import QuickAddQuote from './QuickAddQuote';
import { Plus } from 'lucide-react';

export default function QuickAddFAB() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      {/* FAB - visible on mobile, bottom right */}
      <Button
        onClick={() => setOpen(true)}
        variant="gradient"
        className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl shadow-xl shadow-primary/30 lg:hidden z-40 hover:scale-105 transition-transform active:scale-95"
        size="icon"
      >
        <Plus className="w-7 h-7" />
      </Button>
      
      <QuickAddQuote open={open} onClose={() => setOpen(false)} />
    </>
  );
}
