"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
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
  { name: 'Dashboard', href: '/', icon: 'home' },
  { name: 'Inbox', href: '/inbox', icon: 'inbox', showBadge: true },
];

const manageNavigation: NavItem[] = [
  { name: 'Quotes', href: '/quotes', icon: 'quote' },
  { name: 'Payment Links', href: '/payments', icon: 'link' },
  { name: 'Customers', href: '/customers', icon: 'users' },
];

const engageNavigation: NavItem[] = [
  { name: 'Sequences', href: '/sequences', icon: 'sequence' },
  { name: 'Campaigns', href: '/campaigns', icon: 'megaphone' },
];

const analyzeNavigation: NavItem[] = [
  { name: 'Analytics', href: '/analytics', icon: 'chart' },
  { name: 'Pricing Wizard', href: '/pricing', icon: 'sparkles' },
];

const settingsNavigation: NavItem[] = [
  { name: 'Connections', href: '/connections', icon: 'plug' },
  { name: 'Billing', href: '/billing', icon: 'creditCard' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
  { name: 'Support', href: '/settings/support', icon: 'help' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { business } = useBusiness();
  const { user, signOut } = useAuth();
  const { totalUnread } = useConversations();
  const { theme, setTheme } = useTheme();
  
  const initials = business?.owner_name
    ? business.owner_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Routes that should only match exactly (have sub-routes in nav)
  const exactMatchRoutes = ['/settings'];
  
  const NavLink = ({ item }: { item: NavItem }) => {
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
        </div>
        
        {item.showBadge && totalUnread > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold bg-primary text-white rounded-full">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </Link>
    );
  };

  const NavSection = ({ label, items }: { label: string; items: NavItem[] }) => (
    <div className="space-y-1">
      <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{label}</p>
      {items.map((item) => (
        <NavLink key={item.name} item={item} />
      ))}
    </div>
  );

  return (
    <div className="flex h-screen w-60 flex-col bg-card border-r border-border">
      {/* Header with Business Selector */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          {/* Light mode: colored logo, Dark mode: white logo */}
          <Image 
            src="/logo-icon-new.png" 
            alt="Selestial" 
            width={28} 
            height={28} 
            className="rounded-lg dark:hidden" 
          />
          <Image 
            src="/logo-icon-white.png" 
            alt="Selestial" 
            width={28} 
            height={28} 
            className="rounded-lg hidden dark:block" 
          />
          <span className="text-base font-semibold text-foreground">
            Selestial
          </span>
        </Link>
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Icon name="sun" size="sm" className="text-muted-foreground hidden dark:block" />
          <Icon name="moon" size="sm" className="text-muted-foreground dark:hidden" />
        </button>
      </div>
      
      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Icon name="search" size="sm" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Search for anything"
            className="w-full h-8 pl-8 text-sm bg-accent/50 border-border rounded-lg placeholder:text-muted-foreground/50 focus:bg-background"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/70 font-medium">⌘K</kbd>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>

        <NavSection label="Manage" items={manageNavigation} />
        <NavSection label="Engage" items={engageNavigation} />
        <NavSection label="Analyze" items={analyzeNavigation} />
        
        {/* Divider */}
        <div className="h-px bg-border" />
        
        <NavSection label="Settings" items={settingsNavigation} />
      </nav>
      
      {/* User section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
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
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          >
            <Icon name="logout" size="sm" />
          </Button>
        </div>
      </div>
    </div>
  );
}
