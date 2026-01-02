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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg lg:hidden z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
      
      <QuickAddQuote open={open} onClose={() => setOpen(false)} />
    </>
  );
}
