"use client";

import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// Selestial Brand Logo Icon
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

// Quote/Document Icon with Selestial style
export function QuoteIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="15" r="3" fill="currentColor" opacity="0.3" />
      <path d="M16 15L17.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Customer/Person Icon
export function CustomerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// Inbox/Message Icon
export function InboxIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10L12 14L22 10" stroke="currentColor" strokeWidth="2" />
      <circle cx="19" cy="5" r="3" fill="currentColor" className="animate-pulse" opacity="0.8" />
    </svg>
  );
}

// Analytics/Chart Icon
export function AnalyticsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M6 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 18V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 18V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 12L10 8L14 10L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  );
}

// Sequence/Flow Icon
export function SequenceIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3" />
      <path d="M9 6H15" stroke="currentColor" strokeWidth="2" />
      <path d="M6 9V15" stroke="currentColor" strokeWidth="2" />
      <path d="M18 9V15" stroke="currentColor" strokeWidth="2" />
      <path d="M9 18H15" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Campaign/Megaphone Icon
export function CampaignIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M19 10C19 10 21 11.5 21 14C21 16.5 19 18 19 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 10H7L17 4V20L7 14H3V10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M7 14V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="12" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// Retention/Heart-Refresh Icon
export function RetentionIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 21C12 21 4 16 4 10C4 7.23858 6.23858 5 9 5C10.5 5 11.8 5.7 12 7C12.2 5.7 13.5 5 15 5C17.7614 5 20 7.23858 20 10C20 16 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 12C8 12 9 11 10 12C11 13 12 12 12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// AI/Sparkle Brain Icon
export function AIIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 3L13 6L16 7L13 8L12 11L11 8L8 7L11 6L12 3Z"
        fill="currentColor"
        className="animate-pulse"
      />
      <path
        d="M19 8L19.5 10L21.5 10.5L19.5 11L19 13L18.5 11L16.5 10.5L18.5 10L19 8Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M8 14C8 12 10 10 12 10C14 10 16 12 16 14C16 16 14 18 12 20C10 18 8 16 8 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// Settings/Gear Icon with accent
export function SettingsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74493 20.1656 6.23584 20.3766 5.705 20.3766C5.17416 20.3766 4.66507 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95232 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87232 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74493 3.62343 6.23584 3.62343 5.705C3.62343 5.17416 3.83445 4.66507 4.21 4.29C4.58507 3.91445 5.09416 3.70343 5.625 3.70343C6.15584 3.70343 6.66493 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95232 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87232 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58507 20.2966 5.09416 20.2966 5.625C20.2966 6.15584 20.0856 6.66493 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// Dashboard/Home Icon
export function DashboardIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2" />
      <circle cx="17" cy="17" r="2" fill="currentColor" />
    </svg>
  );
}

// Billing/Wallet Icon
export function BillingIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
      <rect x="15" y="13" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
      <circle cx="7" cy="14.5" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// Connection/Link Icon
export function ConnectionIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3" />
      <path d="M8.5 10.5L15.5 7.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 13.5L15.5 16.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Phone/Call Icon
export function PhoneIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22 16.92V19.92C22 20.4835 21.7893 21.0241 21.4142 21.4242C21.0391 21.8243 20.5304 22.0493 20 22.08C16.7428 21.7587 13.609 20.6969 10.83 18.98C8.25087 17.4289 6.07145 15.2495 4.52 12.67C2.79 9.87 1.73 6.70999 1.42 3.42C1.39 2.89001 1.61001 2.37001 2.01001 2C2.41001 1.63 2.95001 1.42001 3.51001 1.42001H6.51C7.50282 1.41139 8.35659 2.11267 8.54 3.09001C8.71 4.11001 9.01 5.11001 9.44 6.05001C9.70337 6.62001 9.60282 7.29001 9.19 7.76001L8 9.05001C9.44144 11.6088 11.5412 13.7086 14.1 15.15L15.39 13.96C15.86 13.5472 16.53 13.4466 17.1 13.71C18.04 14.14 19.04 14.44 20.06 14.61C21.0473 14.7948 21.7529 15.664 21.74 16.67L22 16.92Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="4" r="2" fill="currentColor" opacity="0.4" className="animate-pulse" />
    </svg>
  );
}

// Star/Review Icon
export function ReviewIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6L13.5 9.5L17 10L14.5 12.5L15 16L12 14L9 16L9.5 12.5L7 10L10.5 9.5L12 6Z"
        fill="currentColor"
        opacity="0.3"
      />
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
