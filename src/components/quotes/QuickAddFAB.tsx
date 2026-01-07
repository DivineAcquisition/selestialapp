"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import QuickAddQuote from './QuickAddQuote';
import { Icon } from '@/components/ui/icon';

export default function QuickAddFAB() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      {/* FAB - visible on mobile, bottom right */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg lg:hidden z-40"
        size="icon"
      >
        <Icon name="plus" size="xl" />
      </Button>
      
      <QuickAddQuote open={open} onClose={() => setOpen(false)} />
    </>
  );
}
