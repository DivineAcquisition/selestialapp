'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/utils';

/**
 * Animated dashboard preview for the Selestial hero. Shows:
 *  - 3 stat cards with NumberTicker
 *  - Active sequence enrollment progress
 *  - Animated SMS conversation that ticks message-by-message
 *  - Floating "New Booking" notification + "Voice drop delivered"
 *
 * Pattern adapted from Vistrial's HeroAnimation — same visual language,
 * cleaning-business copy.
 */
export function HeroDashboardPreview() {
  const [activeMessage, setActiveMessage] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const messages = [
    {
      type: 'received' as const,
      text: "Hi, looking for biweekly cleaning for a 3BR townhome in 75218.",
      time: '9:02 PM',
    },
    {
      type: 'sent' as const,
      text: "Hi Sarah! Quick instant quote — 3BR biweekly is $145/visit. Book a time here: book.sparklecleanco.com",
      time: '9:02 PM',
    },
    {
      type: 'received' as const,
      text: 'Booked! Saturday 10 AM. Deposit paid. 🎉',
      time: '9:04 PM',
    },
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % (messages.length + 1));
    }, 2200);
    const notificationInterval = setInterval(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 9000);
    setTimeout(() => setShowNotification(true), 1800);
    setTimeout(() => setShowNotification(false), 5000);
    return () => {
      clearInterval(messageInterval);
      clearInterval(notificationInterval);
    };
  }, [messages.length]);

  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-300/40">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="mx-4 flex-1">
            <div className="mx-auto max-w-md rounded-md border border-gray-200 bg-white px-3 py-1.5 text-center text-xs sm:text-sm text-gray-500">
              app.selestial.io / dashboard
            </div>
          </div>
        </div>

        <div className="bg-gray-50/50 p-4 sm:p-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <StatCard
                  icon="message"
                  label="Replies sent <60s"
                  value={2847}
                  delta="+12%"
                  delay={0.1}
                />
                <StatCard
                  icon="trendUp"
                  label="Bookings this wk"
                  value={47}
                  delta="+18%"
                  delay={0.2}
                />
                <StatCard
                  icon="dollar"
                  label="Recovered MRR"
                  value={14100}
                  prefix="$"
                  delay={0.3}
                />
              </div>

              {/* Active sequence */}
              <div
                className="animate-fade-in rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      90-Day Reactivation
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">847 customers enrolled</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                    Active
                  </Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-1000"
                    style={{ width: '68%' }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">576 of 847 contacts reached</p>
              </div>
            </div>

            {/* Conversation */}
            <div
              className="animate-fade-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <p className="text-xs sm:text-sm font-medium text-gray-900">Live conversation</p>
              </div>
              <div className="min-h-[260px] space-y-3 p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      'transition-all duration-500',
                      index <= activeMessage
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-3 opacity-0'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-lg p-3 text-xs sm:text-sm',
                        msg.type === 'sent'
                          ? 'ml-4 bg-primary text-white'
                          : 'mr-4 bg-gray-100 text-gray-900'
                      )}
                    >
                      {msg.text}
                    </div>
                    <p
                      className={cn(
                        'mt-1 text-[10px] sm:text-xs text-gray-500',
                        msg.type === 'sent' ? 'text-right' : ''
                      )}
                    >
                      {msg.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notifications */}
      <div
        className={cn(
          'absolute -right-2 -top-3 sm:-right-4 sm:-top-4 rounded-xl border border-gray-200 bg-white p-3 shadow-lg transition-all duration-500',
          showNotification ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
            <Icon name="check" size="sm" className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900">New booking!</p>
            <p className="text-[10px] text-gray-500">Just now • $245 deposit</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-3 -left-2 sm:-bottom-4 sm:-left-4 rounded-xl border border-gray-200 bg-white p-3 shadow-lg animate-float">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
            <Icon name="bolt" size="sm" className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900">Speed-to-Lead fired</p>
            <p className="text-[10px] text-gray-500">Reply sent in 47s</p>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -bottom-10 -right-10 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-10 -top-10 -z-10 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl" />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  delta,
  prefix,
  delay,
}: {
  icon: 'message' | 'trendUp' | 'dollar';
  label: string;
  value: number;
  delta?: string;
  prefix?: string;
  delay: number;
}) {
  return (
    <div
      className="animate-fade-in rounded-xl border border-gray-100 bg-white p-3 sm:p-4 shadow-sm transition-all hover:shadow-md"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="mb-1.5 sm:mb-2 flex items-center gap-1.5 text-gray-500">
        <Icon name={icon} size="xs" />
        <span className="text-[10px] sm:text-xs">{label}</span>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-gray-900">
        <NumberTicker value={value} prefix={prefix ?? ''} />
      </p>
      {delta && <p className="text-[10px] sm:text-xs text-emerald-600">↑ {delta} this week</p>}
    </div>
  );
}
