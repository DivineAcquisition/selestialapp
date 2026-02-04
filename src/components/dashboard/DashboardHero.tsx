"use client";

import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  ownerName?: string;
  activeQuotes: number;
  conversionTrend?: number;
  onNewQuote: () => void;
  onOpenInbox: () => void;
}

export function DashboardHero({
  ownerName,
  activeQuotes,
  conversionTrend = 5,
  onNewQuote,
  onOpenInbox,
}: DashboardHeroProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = ownerName?.split(" ")[0] || "there";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[#9D96FF] p-6 md:p-8 text-white ring-2 ring-white/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9D96FF]/30 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="sparkles" size="lg" className="animate-pulse" />
              <span className="text-sm font-medium text-white/80">
                {getGreeting()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {firstName}!
            </h1>
            <p className="text-white/70 max-w-lg">
              You have{" "}
              <span className="text-white font-semibold">
                {activeQuotes} active quote{activeQuotes !== 1 ? "s" : ""}
              </span>{" "}
              awaiting follow-up.
              {conversionTrend > 0 && (
                <>
                  {" "}
                  Your conversion rate is up{" "}
                  <span className="text-emerald-300 font-semibold">
                    {conversionTrend}%
                  </span>{" "}
                  this month!
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="lg"
              onClick={onNewQuote}
              className={cn(
                "bg-white text-primary hover:bg-white/90",
                "shadow-xl shadow-black/10 rounded-xl",
                "ring-2 ring-white/30 hover:ring-white/50"
              )}
            >
              <Icon name="plus" size="lg" className="mr-2" />
              New Quote
            </Button>
            <Button
              size="lg"
              variant="outline-white"
              onClick={onOpenInbox}
              className="rounded-xl"
            >
              <Icon name="message" size="lg" className="mr-2" />
              Inbox
            </Button>
          </div>
        </div>
        
        {/* Quick stats mini row */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10">
              <Icon name="clock" size="sm" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Response Time</p>
              <p className="text-white font-semibold text-sm">2.4h avg</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10">
              <Icon name="target" size="sm" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Win Rate</p>
              <p className="text-white font-semibold text-sm">42%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10">
              <Icon name="send" size="sm" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Sent Today</p>
              <p className="text-white font-semibold text-sm">12 msgs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
