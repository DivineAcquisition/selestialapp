'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const GHL_BOOKING_WIDGET_SRC =
  'https://api.divineacquisition.io/widget/booking/bdGyTVXFRxIW5RI49fGp';
const GHL_BOOKING_WIDGET_ID = '09O94JadkIsrarld4LMd_demo_modal';
const GHL_FORM_EMBED_SCRIPT_SRC =
  'https://api.divineacquisition.io/js/form_embed.js';

interface BookDemoDialogProps {
  /** Trigger button or link that opens the modal. */
  children: ReactNode;
}

/**
 * Modal that mounts the GHL booking calendar iframe. Single CTA target for the
 * /demo ad landing page — ad creative → /demo → click any CTA → modal opens
 * → 15-min demo booked.
 *
 * The form_embed.js helper script is loaded lazily on first open so the
 * landing page itself doesn't carry its weight on initial paint.
 */
export function BookDemoDialog({ children }: BookDemoDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (typeof document === 'undefined') return;
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GHL_FORM_EMBED_SCRIPT_SRC}"]`
    );
    if (existing) return;
    const script = document.createElement('script');
    script.src = GHL_FORM_EMBED_SCRIPT_SRC;
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Book your 15-minute Selestial demo
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Pick a time and we&apos;ll show you Selestial running on a real cleaning company&apos;s
            schedule and pricing.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-white">
          <iframe
            src={GHL_BOOKING_WIDGET_SRC}
            id={GHL_BOOKING_WIDGET_ID}
            title="Book a Selestial demo"
            loading="lazy"
            scrolling="no"
            style={{
              width: '100%',
              border: 'none',
              overflow: 'hidden',
              minHeight: 720,
              maxHeight: '80vh',
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
