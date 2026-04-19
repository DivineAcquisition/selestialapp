'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const STEPS = ['ZIP', 'Home Size', 'Service', 'Pay'] as const;

/**
 * Visual demo of the actual Selestial booking widget — auto-cycles through
 * the 4-step funnel so prospects can see the product without clicking.
 * Mirrors the real /book/[businessId] flow visually.
 */
export function BookingFlowPreview() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-3 bg-gradient-to-r from-primary/15 via-violet-500/15 to-primary/15 rounded-3xl blur-2xl" />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/40 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-1 bg-white border border-gray-200 rounded-md text-[10px] sm:text-xs text-gray-500 flex items-center gap-1.5">
              <Icon name="lock" size="xs" className="text-emerald-500" />
              book.sparklecleanco.com
            </div>
          </div>
        </div>

        {/* Brand bar */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold">
            SC
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Sparkle Clean Co.</p>
            <p className="text-[10px] text-gray-500">Powered by Selestial</p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Icon name="shield" size="xs" />
            Insured & Bonded
          </div>
        </div>

        {/* Step indicator */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between text-[10px] font-medium text-gray-500">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 flex items-center">
                <div
                  className={cn(
                    'flex items-center gap-1.5 transition-colors',
                    i <= step ? 'text-primary' : 'text-gray-400'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold',
                      i < step
                        ? 'bg-primary text-white'
                        : i === step
                        ? 'bg-primary/20 text-primary ring-2 ring-primary'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {i < step ? <Icon name="check" size="xs" /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 transition-colors',
                      i < step ? 'bg-primary' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-5 min-h-[260px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="zip"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="text-center space-y-3"
              >
                <Icon name="mapPin" size="xl" className="mx-auto text-primary" />
                <h3 className="font-semibold text-gray-900">Enter your ZIP</h3>
                <p className="text-xs text-gray-500">We&apos;ll check if we service your area</p>
                <div className="max-w-[200px] mx-auto">
                  <div className="px-4 py-3 rounded-lg border-2 border-primary bg-primary/5 text-center text-lg font-semibold tracking-widest text-primary">
                    75218
                  </div>
                </div>
                <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 max-w-[260px] mx-auto">
                  ✓ We service Dallas, TX
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="size"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">How big is your home?</h3>
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
                        'p-3 rounded-lg border-2 text-center transition-all',
                        opt.selected
                          ? 'bg-primary/5 border-primary'
                          : 'bg-gray-50 border-gray-200'
                      )}
                    >
                      <p className="text-xs font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-[10px] text-gray-500">{opt.sub}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="service"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Choose your service</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Deep Clean</p>
                      <p className="text-[10px] text-gray-500">One-time</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                      <span className="text-xs text-gray-400 line-through mr-1">$350</span>$325
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-primary bg-primary/5 flex items-center justify-between relative">
                    <span className="absolute -top-2 left-3 px-2 py-0.5 bg-primary text-white text-[9px] rounded font-medium">
                      Most Popular
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Recurring (Biweekly)</p>
                      <p className="text-[10px] text-emerald-700 font-medium">Save $22/visit</p>
                    </div>
                    <p className="text-sm font-bold text-primary">
                      <span className="text-xs text-gray-400 line-through mr-1">$220</span>$198
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Move-In/Out</p>
                      <p className="text-[10px] text-gray-500">One-time</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700">$455</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="pay"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white">
                  <div>
                    <p className="text-[11px] text-white/80">Today&apos;s deposit (25%)</p>
                    <p className="text-2xl font-bold">$49.50</p>
                  </div>
                  <div className="text-right text-[10px] text-white/80">
                    <p>Total: $198.00</p>
                    <p>Balance after service</p>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="lock" size="xs" className="text-gray-400" />
                    <p className="text-[10px] text-gray-500">Powered by Stripe</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-7 rounded bg-white border border-gray-200" />
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="h-7 rounded bg-white border border-gray-200" />
                      <div className="h-7 rounded bg-white border border-gray-200" />
                    </div>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold">
                  Pay $49.50 — Reserve My Time
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
