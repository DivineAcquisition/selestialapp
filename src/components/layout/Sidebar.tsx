"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useBusiness, useFeatureAwareness } from '@/providers';
import { useAuth } from '@/providers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import type { FeatureKey } from '@/lib/features/feature-registry';
import type { IconName } from '@/components/ui/icon';

interface NavItem {
  name: string;
  href: string;
  icon: IconName;
  showBadge?: boolean;
  badge?: string;
  feature?: FeatureKey;
}

const mainNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: 'home' },
  { name: 'Inbox', href: '/inbox', icon: 'inbox', showBadge: true },
];

const manageNavigation: NavItem[] = [
  { name: 'Bookings', href: '/bookings', icon: 'calendar', feature: 'calendar' },
  { name: 'Quotes', href: '/quotes', icon: 'quote' },
  { name: 'Payment Links', href: '/payments', icon: 'link', feature: 'payment_links' },
  { name: 'Customers', href: '/customers', icon: 'users' },
];

const engageNavigation: NavItem[] = [
  { name: 'Sequences', href: '/sequences', icon: 'sequence', feature: 'sequences' },
  { name: 'Campaigns', href: '/campaigns', icon: 'megaphone' },
];

const analyzeNavigation: NavItem[] = [
  { name: 'Analytics', href: '/analytics', icon: 'chart', feature: 'reports' },
  { name: 'Pricing Wizard', href: '/pricing', icon: 'sparkles', feature: 'pricing_engine' },
];

const settingsNavigation: NavItem[] = [
  { name: 'Connections', href: '/connections', icon: 'plug' },
  { name: 'Billing', href: '/billing', icon: 'creditCard' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
  { name: 'Support', href: '/settings/support', icon: 'help' },
];

// Routes that should only match exactly (have sub-routes in nav)
const exactMatchRoutes = ['/settings'];

interface NavLinkProps {
  item: NavItem;
  pathname: string;
  totalUnread: number;
  hasWarning: boolean;
}

function NavLink({ item, pathname, totalUnread, hasWarning }: NavLinkProps) {
  const isExactMatchOnly = exactMatchRoutes.includes(item.href);
  const isActive = isExactMatchOnly 
    ? pathname === item.href
    : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
  
  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon 
          name={item.icon} 
          size="md"
          className={cn(
            "transition-colors",
            isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
          )} 
        />
        <span>{item.name}</span>
        {item.badge && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary/10 text-primary">
            {item.badge}
          </span>
        )}
        {hasWarning && (
          <span className="w-2 h-2 rounded-full bg-amber-500" title="Setup required" />
        )}
      </div>
      
      {item.showBadge && totalUnread > 0 && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold bg-primary text-white rounded-full">
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
    </Link>
  );
}

interface NavSectionProps {
  label: string;
  items: NavItem[];
  pathname: string;
  totalUnread: number;
  shouldShowNavItem: (item: NavItem) => boolean;
  hasNavItemWarning: (item: NavItem) => boolean;
}

function NavSection({ label, items, pathname, totalUnread, shouldShowNavItem, hasNavItemWarning }: NavSectionProps) {
  const visibleItems = items.filter(shouldShowNavItem);
  if (visibleItems.length === 0) return null;
  
  return (
    <div className="space-y-1">
      <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{label}</p>
      {visibleItems.map((item) => (
        <NavLink 
          key={item.name} 
          item={item} 
          pathname={pathname}
          totalUnread={totalUnread}
          hasWarning={hasNavItemWarning(item)}
        />
      ))}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { business } = useBusiness();
  const { user, signOut } = useAuth();
  const { totalUnread } = useConversations();
  const { isFeatureAvailable, isFeatureEnabled, canUseFeature } = useFeatureAwareness();
  
  const initials = business?.owner_name
    ? business.owner_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  // Check if a nav item should be shown based on feature availability
  const shouldShowNavItem = (item: NavItem): boolean => {
    if (!item.feature) return true;
    return isFeatureAvailable(item.feature);
  };
  
  // Check if a nav item has issues (enabled but missing dependencies)
  const hasNavItemWarning = (item: NavItem): boolean => {
    if (!item.feature) return false;
    return isFeatureEnabled(item.feature) && !canUseFeature(item.feature);
  };

  return (
    <div className="flex h-screen w-60 flex-col bg-card border-r border-border">
      {/* Header with Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={28} 
              height={28} 
              className="rounded-lg transition-transform group-hover:scale-105" 
            />
            <div className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            Selestial
          </span>
        </Link>
      </div>
      
      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative group">
          <Icon name="search" size="sm" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search..."
            className="w-full h-9 pl-8 text-sm bg-accent/50 border-transparent hover:border-border focus:border-primary/50 rounded-lg placeholder:text-muted-foreground/50 focus:bg-background transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/70 font-medium pointer-events-none inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border">
            ⌘K
          </kbd>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <NavLink 
              key={item.name} 
              item={item} 
              pathname={pathname}
              totalUnread={totalUnread}
              hasWarning={hasNavItemWarning(item)}
            />
          ))}
        </div>

        <NavSection 
          label="Manage" 
          items={manageNavigation}
          pathname={pathname}
          totalUnread={totalUnread}
          shouldShowNavItem={shouldShowNavItem}
          hasNavItemWarning={hasNavItemWarning}
        />
        <NavSection 
          label="Engage" 
          items={engageNavigation}
          pathname={pathname}
          totalUnread={totalUnread}
          shouldShowNavItem={shouldShowNavItem}
          hasNavItemWarning={hasNavItemWarning}
        />
        <NavSection 
          label="Analyze" 
          items={analyzeNavigation}
          pathname={pathname}
          totalUnread={totalUnread}
          shouldShowNavItem={shouldShowNavItem}
          hasNavItemWarning={hasNavItemWarning}
        />
        
        {/* Divider */}
        <div className="h-px bg-border" />
        
        <NavSection 
          label="Settings" 
          items={settingsNavigation}
          pathname={pathname}
          totalUnread={totalUnread}
          shouldShowNavItem={shouldShowNavItem}
          hasNavItemWarning={hasNavItemWarning}
        />
      </nav>
      
      {/* Upgrade Banner */}
      <div className="px-3 py-2">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="sparkles" size="sm" className="text-primary" />
            <span className="text-xs font-semibold text-primary">Pro Features</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Unlock AI insights, advanced analytics & more
          </p>
          <Button size="sm" variant="default" className="w-full h-7 text-xs rounded-lg">
            Upgrade Now
          </Button>
        </div>
      </div>
      
      {/* User section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-semibold shadow-sm shadow-primary/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {business?.owner_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || ''}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut} 
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          >
            <Icon name="logout" size="sm" />
          </Button>
        </div>
      </div>
    </div>
  );
}
