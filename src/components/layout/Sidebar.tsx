"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/providers';
import { useAuth } from '@/providers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';

interface NavItem {
  name: string;
  href: string;
  icon: IconName;
  showBadge?: boolean;
  badge?: string;
}

const mainNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/analytics', icon: 'chart' },
  { name: 'Inbox', href: '/inbox', icon: 'inbox', showBadge: true },
];

const manageNavigation: NavItem[] = [
  { name: 'Calendar', href: '/bookings/calendar', icon: 'calendar' },
  { name: 'Bookings', href: '/bookings', icon: 'briefcase' },
  { name: 'Quotes', href: '/quotes', icon: 'quote' },
  { name: 'Payments', href: '/payments', icon: 'creditCard' },
  { name: 'Customers', href: '/customers', icon: 'users' },
];

const engageNavigation: NavItem[] = [
  { name: 'Sequences', href: '/sequences', icon: 'sequence' },
  { name: 'Campaigns', href: '/campaigns', icon: 'megaphone' },
  { name: 'Retention', href: '/retention', icon: 'heart' },
];

const analyzeNavigation: NavItem[] = [
  { name: 'Reports', href: '/analytics', icon: 'chartBar' },
  { name: 'Pricing Wizard', href: '/pricing', icon: 'sparkles' },
];

const settingsNavigation: NavItem[] = [
  { name: 'Connections', href: '/connections', icon: 'plug' },
  { name: 'Billing', href: '/billing', icon: 'wallet' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
];

// Routes that should only match exactly (have sub-routes in nav)
const exactMatchRoutes = ['/settings'];

interface NavLinkProps {
  item: NavItem;
  pathname: string;
  totalUnread: number;
}

function NavLink({ item, pathname, totalUnread }: NavLinkProps) {
  const isExactMatchOnly = exactMatchRoutes.includes(item.href);
  const isActive = isExactMatchOnly 
    ? pathname === item.href
    : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')) || (item.href === '/analytics' && pathname === '/');
  
  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon 
          name={item.icon} 
          size="lg"
          className={cn(
            "transition-colors",
            isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
          )} 
        />
        <span>{item.name}</span>
        {item.badge && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary/10 text-primary">
            {item.badge}
          </span>
        )}
      </div>
      
      {item.showBadge && totalUnread > 0 && (
        <span className="flex items-center justify-center min-w-[22px] h-5.5 px-1.5 text-[11px] font-semibold bg-primary text-white rounded-full">
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
}

function NavSection({ label, items, pathname, totalUnread }: NavSectionProps) {
  return (
    <div className="space-y-1">
      <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{label}</p>
      {items.map((item) => (
        <NavLink 
          key={item.name} 
          item={item} 
          pathname={pathname}
          totalUnread={totalUnread}
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
  
  const initials = business?.owner_name
    ? business.owner_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border fixed left-0 top-0 z-40">
      {/* Header with Logo */}
      <div className="flex items-center h-16 px-5 border-b border-border">
        <Link href="/analytics" className="flex items-center gap-3 group">
          <div className="relative">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={32} 
              height={32} 
              className="rounded-xl transition-transform group-hover:scale-105" 
            />
            <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            Selestial
          </span>
        </Link>
      </div>
      
      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative group">
          <Icon name="search" size="md" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search..."
            className="w-full h-11 pl-10 text-[15px] bg-accent/50 border-transparent hover:border-border focus:border-primary/50 rounded-xl placeholder:text-muted-foreground/50 focus:bg-background transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/70 font-medium pointer-events-none inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-background border border-border">
            ⌘K
          </kbd>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <NavLink 
              key={item.name} 
              item={item} 
              pathname={pathname}
              totalUnread={totalUnread}
            />
          ))}
        </div>

        <NavSection 
          label="Manage" 
          items={manageNavigation}
          pathname={pathname}
          totalUnread={totalUnread}
        />
        <NavSection 
          label="Engage" 
          items={engageNavigation}
          pathname={pathname}
          totalUnread={totalUnread}
        />
        <NavSection 
          label="Analyze" 
          items={analyzeNavigation}
          pathname={pathname}
          totalUnread={totalUnread}
        />
        
        {/* Divider */}
        <div className="h-px bg-border" />
        
        <NavSection 
          label="Settings" 
          items={settingsNavigation}
          pathname={pathname}
          totalUnread={totalUnread}
        />
      </nav>
      
      {/* Upgrade Banner */}
      <div className="px-4 py-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="sparkles" size="md" className="text-primary" />
            <span className="text-sm font-semibold text-primary">Pro Features</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Unlock AI insights & advanced analytics
          </p>
          <Button size="sm" variant="default" className="w-full h-9 text-sm rounded-xl">
            Upgrade Now
          </Button>
        </div>
      </div>
      
      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition-colors cursor-pointer group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-white text-sm font-semibold shadow-sm shadow-primary/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-foreground truncate">
              {business?.owner_name || 'User'}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email || ''}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut} 
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
          >
            <Icon name="logout" size="md" />
          </Button>
        </div>
      </div>
    </div>
  );
}
