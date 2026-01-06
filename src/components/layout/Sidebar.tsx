"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/providers';
import { useAuth } from '@/providers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import {
  DashboardIcon,
  InboxIcon,
  QuoteIcon,
  CustomerIcon,
  SequenceIcon,
  RetentionIcon,
  CampaignIcon,
  AnalyticsIcon,
  ConnectionIcon,
  BillingIcon,
  SettingsIcon,
} from '@/components/ui/custom-icons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: DashboardIcon },
  { name: 'Inbox', href: '/inbox', icon: InboxIcon, showBadge: true },
  { name: 'Quotes', href: '/quotes', icon: QuoteIcon },
  { name: 'Customers', href: '/customers', icon: CustomerIcon },
  { name: 'Sequences', href: '/sequences', icon: SequenceIcon },
  { name: 'Retention', href: '/retention', icon: RetentionIcon },
  { name: 'Campaigns', href: '/campaigns', icon: CampaignIcon },
  { name: 'Analytics', href: '/analytics', icon: AnalyticsIcon },
];

const bottomNavigation = [
  { name: 'Connections', href: '/connections', icon: ConnectionIcon },
  { name: 'Billing', href: '/billing', icon: BillingIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

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

  const NavLink = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    const Icon = item.icon;
    
    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground glow-sm'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={cn(
            "transition-colors",
            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
          )} size={18} />
          <span>{item.name}</span>
        </div>
        {item.showBadge && totalUnread > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-4 px-1 text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full animate-pulse">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
        {isActive && (
          <ChevronRight className="h-3.5 w-3.5 opacity-70" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-56 flex-col bg-sidebar-background border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image 
            src="/logo-icon-new.png" 
            alt="Selestial" 
            width={28} 
            height={28} 
            className="rounded-md glow-sm" 
          />
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">Selestial</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Quote Follow-Up</span>
          </div>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <div className="mb-1.5 px-2">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Main Menu</p>
        </div>
        {navigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
        
        {/* Divider */}
        <div className="pt-3 pb-1.5 px-2">
          <div className="h-px bg-sidebar-border" />
        </div>
        
        <div className="mb-1.5 px-2">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">System</p>
        </div>
        {bottomNavigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </nav>
      
      {/* User section */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-secondary transition-colors cursor-pointer group">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold glow-sm">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-sidebar-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">
              {business?.owner_name || 'User'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user?.email || ''}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut} 
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
