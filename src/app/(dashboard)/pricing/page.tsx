"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

// ============================================================================
// CONFIGURATION - Industry & Regional Data
// ============================================================================

const INDUSTRIES = [
  { id: "cleaning", name: "Cleaning", emoji: "🧹", cvr: 17.65, ticket: [75, 400], margin: 45 },
  { id: "hvac", name: "HVAC", emoji: "❄️", cvr: 5, ticket: [350, 5750], margin: 38 },
  { id: "plumbing", name: "Plumbing", emoji: "🔧", cvr: 14, ticket: [175, 600], margin: 55 },
  { id: "electrical", name: "Electrical", emoji: "⚡", cvr: 12, ticket: [150, 500], margin: 50 },
  { id: "landscaping", name: "Landscaping", emoji: "🌿", cvr: 15, ticket: [50, 500], margin: 45 },
  { id: "pest", name: "Pest Control", emoji: "🐜", cvr: 18, ticket: [100, 300], margin: 60 },
  { id: "roofing", name: "Roofing", emoji: "🏠", cvr: 5, ticket: [350, 25000], margin: 35 },
  { id: "painting", name: "Painting", emoji: "🎨", cvr: 12, ticket: [300, 8000], margin: 50 },
  { id: "flooring", name: "Flooring", emoji: "🪵", cvr: 10, ticket: [1500, 12000], margin: 40 },
  { id: "handyman", name: "Handyman", emoji: "🛠️", cvr: 13.45, ticket: [150, 800], margin: 50 },
  { id: "moving", name: "Moving", emoji: "📦", cvr: 15, ticket: [300, 5000], margin: 35 },
  { id: "pool", name: "Pool/Spa", emoji: "🏊", cvr: 20, ticket: [100, 500], margin: 55 },
] as const;

const REGIONS = [
  { id: "premium", name: "Premium Metro", desc: "SF, NYC, LA, Boston", mult: 1.35 },
  { id: "high", name: "Above Average", desc: "Seattle, Denver, Austin", mult: 1.15 },
  { id: "average", name: "Baseline", desc: "Most US cities", mult: 1.0 },
  { id: "below", name: "Below Average", desc: "Smaller metros", mult: 0.9 },
  { id: "low", name: "Low Cost", desc: "Rural areas", mult: 0.75 },
] as const;

type Industry = typeof INDUSTRIES[number];
type Region = typeof REGIONS[number];

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: {
    prices?: { name: string; low: number; avg: number; high: number }[];
    tips?: string[];
    metrics?: { label: string; value: string; color?: string }[];
    model?: { name: string; adoption: number; impact: number };
  };
}

// ============================================================================
// AI RESPONSE GENERATOR (Replace with actual API call)
// ============================================================================

async function generateAIResponse(
  query: string,
  industry: Industry,
  region: Region
): Promise<Message> {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));

  const mult = region.mult;
  const avgTicket = Math.round(((industry.ticket[0] + industry.ticket[1]) / 2) * mult);
  const q = query.toLowerCase();

  // Determine response type based on query
  if (q.includes("price") || q.includes("pricing") || q.includes("charge") || q.includes("rate")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Here's the pricing analysis for **${industry.name}** in **${region.name}** markets:\n\n**Recommended Model:** Flat-rate pricing\n_92% of homeowners prefer transparent, upfront pricing._`,
      timestamp: new Date(),
      data: {
        prices: [
          {
            name: "Basic Service",
            low: Math.round(industry.ticket[0] * mult),
            avg: Math.round(industry.ticket[0] * 1.3 * mult),
            high: Math.round(industry.ticket[0] * 1.6 * mult),
          },
          {
            name: "Standard Service",
            low: Math.round(avgTicket * 0.75),
            avg: avgTicket,
            high: Math.round(avgTicket * 1.25),
          },
          {
            name: "Premium Service",
            low: Math.round(industry.ticket[1] * 0.5 * mult),
            avg: Math.round(industry.ticket[1] * 0.75 * mult),
            high: Math.round(industry.ticket[1] * mult),
          },
        ],
        model: { name: "Flat Rate", adoption: 65, impact: 15 },
        tips: [
          "Use charm pricing ($297 vs $300) for 24% conversion lift",
          "Offer 3-4 tiers — 42% of customers choose the middle option",
          "Include financing option for 30% higher close rate",
        ],
      },
    };
  }

  if (q.includes("convert") || q.includes("conversion") || q.includes("close")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `**Conversion Optimization for ${industry.name}:**\n\nYour industry baseline is **${industry.cvr}%**. Here's how top performers achieve 2-3x that:`,
      timestamp: new Date(),
      data: {
        metrics: [
          { label: "Response < 5 min", value: "21x higher", color: "emerald" },
          { label: "Flat-rate quotes", value: "+15-20%", color: "emerald" },
          { label: "Same-day availability", value: "+35%", color: "emerald" },
          { label: "Follow-up within 24h", value: "+27%", color: "blue" },
        ],
        tips: [
          "78% of customers choose the first business to respond",
          "Automate quote follow-ups at 1hr, 24hr, and 72hr intervals",
          "Include social proof and reviews in every quote",
        ],
      },
    };
  }

  if (q.includes("margin") || q.includes("profit") || q.includes("cost")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `**Margin Analysis for ${industry.name}:**\n\nTarget gross margin: **${industry.margin}%**`,
      timestamp: new Date(),
      data: {
        metrics: [
          { label: "Target Gross Margin", value: `${industry.margin}%`, color: "violet" },
          { label: "Labor Cost Target", value: `${100 - industry.margin - 15}%`, color: "blue" },
          { label: "Parts/Materials", value: "15-20%", color: "amber" },
          { label: "Net Profit Goal", value: "10-20%", color: "emerald" },
        ],
        tips: [
          "Flat-rate pricing protects margins from scope creep",
          "Emergency/after-hours premiums: 1.5-2x standard rate",
          "Membership plans increase LTV by 3x",
        ],
      },
    };
  }

  if (q.includes("competitor") || q.includes("competition") || q.includes("market")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `**Competitive Landscape for ${industry.name} in ${region.name}:**`,
      timestamp: new Date(),
      data: {
        prices: [
          {
            name: "Budget Competitors",
            low: Math.round(industry.ticket[0] * 0.7 * mult),
            avg: Math.round(industry.ticket[0] * 0.85 * mult),
            high: Math.round(industry.ticket[0] * mult),
          },
          {
            name: "Market Average",
            low: Math.round(avgTicket * 0.85),
            avg: avgTicket,
            high: Math.round(avgTicket * 1.15),
          },
          {
            name: "Premium Players",
            low: Math.round(industry.ticket[1] * 0.6 * mult),
            avg: Math.round(industry.ticket[1] * 0.8 * mult),
            high: Math.round(industry.ticket[1] * mult),
          },
        ],
        tips: [
          "Compete on speed and reliability, not just price",
          "94% of customers value price transparency",
          "Highlight guarantees, warranties, and insurance",
        ],
      },
    };
  }

  // Default response
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: `Here's what I know about **${industry.name}** in **${region.name}**:\n\n• **Average Ticket:** $${avgTicket}\n• **Conversion Rate:** ${industry.cvr}%\n• **Target Margin:** ${industry.margin}%\n\nI can help you with:\n• Pricing strategies and tiers\n• Conversion optimization\n• Margin analysis\n• Competitive positioning\n\nWhat would you like to explore?`,
    timestamp: new Date(),
  };
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StatCard({
  icon,
  label,
  value,
  subtext,
  color = "violet",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color?: "violet" | "emerald" | "blue" | "amber";
}) {
  const colors = {
    violet: "bg-primary/10 text-primary",
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className={cn("inline-flex rounded-lg p-2", colors[color])}>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subtext && <p className="mt-1 text-xs text-gray-400">{subtext}</p>}
    </div>
  );
}

function Dropdown<T extends { id: string; name: string }>({
  label,
  value,
  options,
  onChange,
  renderOption,
  renderValue,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (option: T) => void;
  renderOption?: (option: T) => React.ReactNode;
  renderValue?: (option: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </label>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-gray-50"
      >
        {renderValue ? renderValue(value) : <span>{value.name}</span>}
        <Icon name="chevronDown" size="sm" className={cn("text-gray-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-50",
                value.id === option.id && "bg-primary/5"
              )}
            >
              {renderOption ? renderOption(option) : <span>{option.name}</span>}
              {value.id === option.id && <Icon name="check" size="sm" className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : "bg-primary/10"
        )}
      >
        {isUser ? (
          <Icon name="user" size="sm" className="text-white" />
        ) : (
          <Icon name="robot" size="sm" className="text-primary" />
        )}
      </div>
      <div
        className={cn(
          "max-w-xl rounded-2xl px-4 py-3",
          isUser ? "bg-primary text-white" : "bg-gray-100"
        )}
      >
        <div
          className={cn(
            "text-sm leading-relaxed [&_strong]:font-semibold",
            isUser ? "[&_em]:text-white/80" : "[&_em]:text-gray-500"
          )}
          dangerouslySetInnerHTML={{
            __html: message.content
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/_(.*?)_/g, "<em>$1</em>")
              .replace(/\n/g, "<br />"),
          }}
        />

        {/* Price Table */}
        {message.data?.prices && (
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Service</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Low</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Avg</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">High</th>
                </tr>
              </thead>
              <tbody>
                {message.data.prices.map((p, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-2 text-gray-900">{p.name}</td>
                    <td className="px-3 py-2 text-right text-gray-500">${p.low}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">${p.avg}</td>
                    <td className="px-3 py-2 text-right text-gray-500">${p.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Metrics Grid */}
        {message.data?.metrics && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {message.data.metrics.map((m, i) => (
              <div key={i} className="rounded-lg bg-white border border-gray-200 p-3">
                <p className="text-xs text-gray-500">{m.label}</p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-semibold",
                    m.color === "emerald" && "text-emerald-600",
                    m.color === "violet" && "text-primary",
                    m.color === "amber" && "text-amber-600",
                    m.color === "blue" && "text-blue-600"
                  )}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {message.data?.tips && (
          <div className="mt-3 space-y-1.5 rounded-lg bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
              <Icon name="lightbulb" size="xs" />
              Pro Tips
            </p>
            {message.data.tips.map((tip, i) => (
              <p key={i} className="flex items-start gap-2 text-xs text-amber-800">
                <Icon name="bolt" size="xs" className="mt-0.5 shrink-0" />
                {tip}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function PricingIntelligencePage() {
  const [industry, setIndustry] = useState<Industry>(INDUSTRIES[0]);
  const [region, setRegion] = useState<Region>(REGIONS[2]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Welcome to **Pricing Intelligence**!\n\nI'm configured for **${industry.name}** in **${region.name}** markets. I can help you with:\n\n• Optimal pricing strategies\n• Conversion optimization\n• Margin analysis\n• Competitive positioning\n\nAsk me anything or try a quick question below!`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Update context when industry/region changes
  useEffect(() => {
    if (messages.length > 1) {
      const avgTicket = Math.round(((industry.ticket[0] + industry.ticket[1]) / 2) * region.mult);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Updated to **${industry.name}** in **${region.name}**.\n\n• Avg Ticket: **$${avgTicket}**\n• Conversion: **${industry.cvr}%**\n• Target Margin: **${industry.margin}%**`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [industry, region]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (query?: string) => {
    const finalQuery = query || input.trim();
    if (!finalQuery || isLoading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: finalQuery,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);
    const response = await generateAIResponse(finalQuery, industry, region);
    setMessages((prev) => [...prev, response]);
    setIsLoading(false);
  };

  const avgTicket = Math.round(((industry.ticket[0] + industry.ticket[1]) / 2) * region.mult);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 shrink-0 border-r border-gray-200 bg-gray-50/50 p-5">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-primary to-primary/80 p-2">
              <Icon name="sparkles" size="lg" className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Pricing Intelligence</h1>
              <p className="text-xs text-gray-500">AI-powered insights</p>
            </div>
          </div>
        </div>

        {/* Industry Selector */}
        <div className="mb-4">
          <Dropdown
            label="Industry"
            value={industry}
            options={INDUSTRIES}
            onChange={setIndustry}
            renderValue={(opt) => (
              <span className="flex items-center gap-2">
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-gray-900">{opt.name}</span>
              </span>
            )}
            renderOption={(opt) => (
              <span className="flex items-center gap-2">
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-gray-900">{opt.name}</span>
              </span>
            )}
          />
        </div>

        {/* Region Selector */}
        <div className="mb-6">
          <Dropdown
            label="Region"
            value={region}
            options={REGIONS}
            onChange={setRegion}
            renderValue={(opt) => (
              <span className="flex items-center gap-2">
                <Icon name="mapPin" size="sm" className="text-gray-400" />
                <span className="text-gray-900">{opt.name}</span>
              </span>
            )}
            renderOption={(opt) => (
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className="text-gray-900">{opt.name}</p>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    opt.mult > 1 ? "text-emerald-600" : opt.mult < 1 ? "text-amber-600" : "text-gray-500"
                  )}
                >
                  {opt.mult > 1 ? "+" : ""}
                  {((opt.mult - 1) * 100).toFixed(0)}%
                </span>
              </div>
            )}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={<Icon name="dollarSign" size="sm" />} 
            label="Avg Ticket" 
            value={`$${avgTicket}`} 
            color="violet" 
          />
          <StatCard 
            icon={<Icon name="trendUp" size="sm" />} 
            label="CVR" 
            value={`${industry.cvr}%`} 
            color="emerald" 
          />
          <StatCard 
            icon={<Icon name="target" size="sm" />} 
            label="Margin" 
            value={`${industry.margin}%`} 
            color="blue" 
          />
          <StatCard 
            icon={<Icon name="clock" size="sm" />} 
            label="5min Rule" 
            value="21x" 
            color="amber" 
          />
        </div>

        {/* Quick Questions */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Quick Questions
          </p>
          <div className="space-y-2">
            {[
              "What should I charge?",
              "How to improve conversion?",
              "Analyze my margins",
              "Competitive pricing",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <Icon name="bolt" size="xs" className="text-amber-500" />
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col bg-white">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Icon name="robot" size="sm" className="text-primary" />
                </div>
                <div className="rounded-2xl bg-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon name="spinner" size="sm" className="animate-spin" />
                    Analyzing...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-gray-50/50 p-4">
          <div className="mx-auto flex max-w-2xl gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about pricing, margins, conversion..."
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Icon name="send" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
