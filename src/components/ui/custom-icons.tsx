"use client";

import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// Helper to convert size to text class
function getSizeClass(size?: number): string {
  if (!size) return "text-lg";
  if (size <= 14) return "text-sm";
  if (size <= 16) return "text-base";
  if (size <= 18) return "text-lg";
  if (size <= 20) return "text-xl";
  if (size <= 24) return "text-2xl";
  return "text-3xl";
}

// Dashboard/Home Icon
export function DashboardIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-home leading-none", getSizeClass(size), className)} />
  );
}

// Inbox/Message Icon
export function InboxIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-inbox leading-none", getSizeClass(size), className)} />
  );
}

// Quote/Document Icon
export function QuoteIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-file-invoice-dollar leading-none", getSizeClass(size), className)} />
  );
}

// Customer/Person Icon
export function CustomerIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-users leading-none", getSizeClass(size), className)} />
  );
}

// Sequence/Flow Icon
export function SequenceIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-arrows-repeat leading-none", getSizeClass(size), className)} />
  );
}

// Campaign/Megaphone Icon
export function CampaignIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-megaphone leading-none", getSizeClass(size), className)} />
  );
}

// Analytics/Chart Icon
export function AnalyticsIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-chart-histogram leading-none", getSizeClass(size), className)} />
  );
}

// Retention Icon
export function RetentionIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-heart leading-none", getSizeClass(size), className)} />
  );
}

// Connection/Link Icon
export function ConnectionIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-puzzle-piece leading-none", getSizeClass(size), className)} />
  );
}

// Billing/Wallet Icon
export function BillingIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-credit-card leading-none", getSizeClass(size), className)} />
  );
}

// Settings Icon
export function SettingsIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-settings leading-none", getSizeClass(size), className)} />
  );
}

// AI/Sparkle Icon
export function AIIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-sparkles leading-none", getSizeClass(size), className)} />
  );
}

// Phone Icon
export function PhoneIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-phone-call leading-none", getSizeClass(size), className)} />
  );
}

// Review/Star Icon
export function ReviewIcon({ className, size = 18 }: IconProps) {
  return (
    <i className={cn("fi fi-sr-star leading-none", getSizeClass(size), className)} />
  );
}

// Selestial Brand Logo Icon (keeping SVG for brand identity)
export function SelestialIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 2L4 9V23L16 30L28 23V9L16 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M16 11L10 14.5V21.5L16 25L22 21.5V14.5L16 11Z"
        fill="currentColor"
        opacity="0.2"
      />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
    </svg>
  );
}

// Export all icons as a map for easy lookup
export const CustomIcons = {
  selestial: SelestialIcon,
  quote: QuoteIcon,
  customer: CustomerIcon,
  inbox: InboxIcon,
  analytics: AnalyticsIcon,
  sequence: SequenceIcon,
  campaign: CampaignIcon,
  retention: RetentionIcon,
  ai: AIIcon,
  settings: SettingsIcon,
  dashboard: DashboardIcon,
  billing: BillingIcon,
  connection: ConnectionIcon,
  phone: PhoneIcon,
  review: ReviewIcon,
} as const;

export type CustomIconName = keyof typeof CustomIcons;
