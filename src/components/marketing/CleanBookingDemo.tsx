'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['ZIP', 'Home', 'Service', 'Pay'] as const;

/**
 * Minimal, monochrome product demo. No gradient halos, no violet. Designed
 * to fit a Linear/Vercel-style landing page.
 *
 * Auto-cycles through the real 4-step Selestial booking funnel inside a
 * macOS-style window so prospects can see the actual product without clicking.
 */
export function CleanBookingDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white border border-zinc-200 px-3 py-1 text-[11px] text-zinc-500 font-mono">
          <Lock className="h-3 w-3" />
          book.sparkleclean.co
        </div>
      </div>

      {/* Brand bar */}
      <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-semibold text-white">
          SC
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-900">Sparkle Clean Co.</p>
          <p className="text-[10px] text-zinc-500">Powered by Selestial</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="border-b border-zinc-200 px-5 py-3">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  i <= step ? 'text-zinc-900' : 'text-zinc-400'
                )}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                    i < step
                      ? 'bg-zinc-900 text-white'
                      : i === step
                      ? 'border-2 border-zinc-900 bg-white text-zinc-900'
                      : 'border border-zinc-200 bg-white text-zinc-400'
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className="hidden text-xs font-medium sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-px flex-1 transition-colors',
                    i < step ? 'bg-zinc-900' : 'bg-zinc-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[280px] p-5">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="zip"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 text-center"
            >
              <MapPin className="mx-auto h-8 w-8 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-900">Enter your ZIP</h3>
              <p className="text-xs text-zinc-500">We&apos;ll check if we service your area</p>
              <div className="mx-auto max-w-[200px] rounded-md border-2 border-zinc-900 bg-white px-4 py-3 text-center text-lg font-semibold tracking-widest text-zinc-900">
                75218
              </div>
              <div className="mx-auto max-w-[260px] rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                ✓ We service Dallas, TX
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="size"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mb-3 text-sm font-semibold text-zinc-900">How big is your home?</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '1,000 – 1,499 sq ft', sub: '1–2 BR' },
                  { label: '1,500 – 1,999 sq ft', sub: '2–3 BR' },
                  { label: '2,000 – 2,499 sq ft', sub: '3 BR', selected: true },
                  { label: '2,500 – 2,999 sq ft', sub: '3–4 BR' },
                ].map((opt) => (
                  <div
                    key={opt.label}
                    className={cn(
                      'rounded-md border p-3 text-center transition-colors',
                      opt.selected
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-200 bg-white'
                    )}
                  >
                    <p className="text-xs font-semibold text-zinc-900">{opt.label}</p>
                    <p className="text-[10px] text-zinc-500">{opt.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="service"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mb-3 text-sm font-semibold text-zinc-900">Choose your service</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Deep Clean</p>
                    <p className="text-[10px] text-zinc-500">One-time</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900">
                    <span className="mr-1 text-xs text-zinc-400 line-through">$350</span>$325
                  </p>
                </div>
                <div className="relative flex items-center justify-between rounded-md border-2 border-zinc-900 bg-zinc-50 p-3">
                  <span className="absolute -top-2 left-3 rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
                    Most popular
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Recurring (Biweekly)</p>
                    <p className="text-[10px] font-medium text-emerald-700">Save $22/visit</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900">
                    <span className="mr-1 text-xs text-zinc-400 line-through">$220</span>$198
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Move-In/Out</p>
                    <p className="text-[10px] text-zinc-500">One-time</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900">$455</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="pay"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-900 p-4 text-white">
                <div>
                  <p className="text-[11px] text-zinc-400">Today&apos;s deposit (25%)</p>
                  <p className="text-2xl font-semibold">$49.50</p>
                </div>
                <div className="text-right text-[10px] text-zinc-400">
                  <p>Total: $198.00</p>
                  <p>Balance after service</p>
                </div>
              </div>
              <div className="rounded-md border border-zinc-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2 text-[10px] text-zinc-500">
                  <Lock className="h-3 w-3" />
                  Powered by Stripe
                </div>
                <div className="space-y-1.5">
                  <div className="h-7 rounded border border-zinc-200 bg-zinc-50" />
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="h-7 rounded border border-zinc-200 bg-zinc-50" />
                    <div className="h-7 rounded border border-zinc-200 bg-zinc-50" />
                  </div>
                </div>
              </div>
              <button className="w-full rounded-md bg-zinc-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800">
                Pay $49.50 — Reserve My Time
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
