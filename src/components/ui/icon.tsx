"use client";

import { cn } from "@/lib/utils";

// All available Flaticon Uicons (Solid Rounded)
export const icons = {
  // Navigation & UI
  home: "home",
  menu: "menu-burger",
  apps: "apps",
  appsAdd: "apps-add",
  search: "search",
  settings: "settings",
  settingsSliders: "settings-sliders",
  filter: "filter",
  list: "list",
  listCheck: "list-check",
  browser: "browser",
  globe: "globe",
  world: "world",
  layers: "layers",
  dashboard: "dashboard",
  grid: "grid",
  
  // Arrows & Chevrons
  chevronLeft: "angle-left",
  chevronRight: "angle-right",
  chevronUp: "angle-up",
  chevronDown: "angle-down",
  angleCircleRight: "angle-circle-right",
  arrowCircleRight: "arrow-circle-right",
  arrowLeft: "arrow-left",
  arrowRight: "arrow-right",
  arrowUp: "arrow-up",
  arrowDown: "arrow-down",
  
  // Users
  user: "user",
  userPlus: "user-add",
  users: "users",
  usersAlt: "users-alt",
  following: "following",
  
  // Communication
  phone: "phone-call",
  phoneCircle: "circle-phone",
  phoneCircleFlip: "circle-phone-flip",
  email: "envelope",
  inbox: "inbox",
  message: "comment",
  messageAlt: "comment-alt",
  messages: "comments",
  send: "paper-plane",
  megaphone: "megaphone",
  bell: "bell",
  bellRing: "bell-ring",
  headset: "headset",
  
  // Actions
  add: "add",
  plus: "plus",
  plusSmall: "plus-small",
  close: "cross",
  closeSmall: "cross-small",
  closeCircle: "cross-circle",
  check: "check",
  checkbox: "checkbox",
  edit: "edit",
  pencil: "pencil",
  trash: "trash",
  refresh: "refresh",
  download: "download",
  upload: "upload",
  share: "share",
  copy: "copy",
  link: "link",
  externalLink: "arrow-up-right",
  more: "menu-dots",
  moreVertical: "menu-dots-vertical",
  
  // Media
  play: "play",
  playAlt: "play-alt",
  pause: "pause",
  stop: "stop",
  volume: "volume",
  camera: "camera",
  video: "video-camera-alt",
  image: "picture",
  music: "music-alt",
  
  // Files & Documents
  document: "document",
  documentSigned: "document-signed",
  file: "file",
  fileAdd: "file-add",
  folder: "folder",
  folderAdd: "folder-add",
  clipboard: "clipboard",
  
  // Social & Feedback
  heart: "heart",
  heartFilled: "heart",
  star: "star",
  starFilled: "star",
  bookmark: "bookmark",
  thumbsUp: "thumbs-up",
  thumbsDown: "thumbs-down",
  care: "hand-holding-heart",
  
  // E-commerce & Business
  cart: "shopping-cart",
  cartAdd: "shopping-cart-add",
  bag: "shopping-bag",
  creditCard: "credit-card",
  wallet: "wallet",
  dollar: "usd-circle",
  dollarSign: "dollar",
  coins: "coins",
  moneyBag: "sack-dollar",
  bank: "bank",
  briefcase: "briefcase",
  receipt: "receipt",
  
  // Time & Calendar
  clock: "clock",
  alarm: "alarm-clock",
  calendar: "calendar",
  calendarClock: "calendar-clock",
  calendarLines: "calendar-lines",
  calendarPlus: "calendar-plus",
  
  // Location
  mapPin: "marker",
  map: "map",
  compass: "compass",
  
  // Security
  lock: "lock",
  unlock: "unlock",
  key: "key",
  shield: "shield-check",
  shieldAlt: "shield",
  verified: "badge-check",
  eye: "eye",
  eyeOff: "eye-crossed",
  
  // Info & Status
  info: "info",
  infoCircle: "circle-info",
  question: "interrogation",
  questionCircle: "circle-question",
  warning: "exclamation",
  warningTriangle: "triangle-warning",
  error: "circle-xmark",
  success: "circle-check",
  
  // Charts & Analytics
  chart: "chart-histogram",
  chartLine: "chart-line-up",
  chartPie: "chart-pie",
  stats: "stats",
  trendUp: "arrow-trend-up",
  trendDown: "arrow-trend-down",
  target: "target",
  
  // Tech & Development
  code: "code-simple",
  terminal: "terminal",
  database: "database",
  server: "server",
  cloud: "cloud",
  wifi: "wifi",
  bluetooth: "bluetooth",
  
  // Misc
  lightbulb: "bulb",
  bolt: "bolt",
  magic: "magic-wand",
  sparkles: "sparkles",
  crown: "crown",
  trophy: "trophy",
  graduationCap: "graduation-cap",
  paw: "paw",
  ballot: "ballot",
  rocket: "rocket",
  gift: "gift",
  fire: "flame",
  
  // Layout
  sidebar: "sidebar",
  layout: "layout-fluid",
  columns: "columns-3",
  rows: "rows-3",
  
  // Integrations
  plug: "plug",
  puzzle: "puzzle-piece",
  api: "api",
  
  // Sequences & Automation
  sequence: "arrows-repeat",
  automation: "process",
  workflow: "workflow",
  
  // Campaigns
  campaign: "flag",
  broadcast: "broadcast-tower",
  
  // Retention
  retention: "rotate-right",
  repeat: "arrows-repeat",
  
  // Quotes
  quote: "file-invoice-dollar",
  invoice: "receipt",
  estimate: "file-edit",
  
  // AI
  ai: "brain",
  robot: "head-side-brain",
  
  // Loading
  spinner: "spinner",
  loading: "loading",
  
  // Logout
  logout: "sign-out-alt",
  login: "sign-in-alt",
  
  // Zap/Lightning
  zap: "bolt",
} as const;

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

const sizeClasses = {
  xs: "text-xs",     // 12px
  sm: "text-sm",     // 14px
  md: "text-base",   // 16px
  lg: "text-lg",     // 18px
  xl: "text-xl",     // 20px
  "2xl": "text-2xl", // 24px
  "3xl": "text-3xl", // 30px
};

export function Icon({ name, size = "md", className }: IconProps) {
  return (
    <i 
      className={cn(
        "fi",
        `fi-sr-${icons[name]}`,
        sizeClasses[size],
        "leading-none inline-flex items-center justify-center",
        className
      )} 
    />
  );
}

// Export icon names for autocomplete
export { icons as iconNames };
