"use client";

import { Icon, IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: IconName;
  color?: "primary" | "emerald" | "amber" | "blue" | "purple" | "red";
  onClick: () => void;
  badge?: string;
}

const colorConfig = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    hoverBg: "group-hover:bg-primary",
    hoverText: "group-hover:text-white",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    hoverBg: "group-hover:bg-emerald-500",
    hoverText: "group-hover:text-white",
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-600",
    hoverBg: "group-hover:bg-amber-500",
    hoverText: "group-hover:text-white",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    hoverBg: "group-hover:bg-blue-500",
    hoverText: "group-hover:text-white",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    hoverBg: "group-hover:bg-purple-500",
    hoverText: "group-hover:text-white",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    hoverBg: "group-hover:bg-red-500",
    hoverText: "group-hover:text-white",
  },
};

export function QuickActionCard({
  title,
  description,
  icon,
  color = "primary",
  onClick,
  badge,
}: QuickActionCardProps) {
  const colors = colorConfig[color];

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full p-4 rounded-xl border border-gray-200 bg-white",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300 text-left overflow-hidden",
        "ring-1 ring-white/50"
      )}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            colors.bg,
            colors.text,
            colors.hoverBg,
            colors.hoverText
          )}
        >
          <Icon name={icon} size="lg" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{title}</p>
            {badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{description}</p>
        </div>
        
        <Icon
          name="chevronRight"
          size="sm"
          className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  );
}
