"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/providers';
import { useAuth } from '@/providers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DashboardIcon,
  InboxIcon,
  QuoteIcon,
  CustomerIcon,
  SequenceIcon,
  CampaignIcon,
  AnalyticsIcon,
  ConnectionIcon,
  BillingIcon,
  SettingsIcon,
} from '@/components/ui/custom-icons';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: DashboardIcon },
  { name: 'Inbox', href: '/inbox', icon: InboxIcon, showBadge: true },
];

const manageNavigation = [
  { name: 'Quotes', href: '/quotes', icon: QuoteIcon },
  { name: 'Customers', href: '/customers', icon: CustomerIcon },
];

const engageNavigation = [
  { name: 'Sequences', href: '/sequences', icon: SequenceIcon },
  { name: 'Campaigns', href: '/campaigns', icon: CampaignIcon },
];

const analyzeNavigation = [
  { name: 'Analytics', href: '/analytics', icon: AnalyticsIcon },
];

const settingsNavigation = [
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

  const NavLink = ({ item }: { item: typeof mainNavigation[0] & { showBadge?: boolean } }) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    const Icon = item.icon;
    
    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn(
            "transition-colors",
            isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
          )} size={18} />
          <span>{item.name}</span>
        </div>
        
        {item.showBadge && totalUnread > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold bg-primary text-white rounded-full">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </Link>
    );
  };

  const NavSection = ({ label, items }: { label: string; items: typeof mainNavigation }) => (
    <div className="space-y-1">
      <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      {items.map((item) => (
        <NavLink key={item.name} item={item} />
      ))}
    </div>
  );

  return (
    <div className="flex h-screen w-60 flex-col bg-white border-r border-gray-200">
      {/* Header with Business Selector */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2.5">
          <Image 
            src="/logo-icon-new.png" 
            alt="Selestial" 
            width={28} 
            height={28} 
            className="rounded-lg" 
          />
          <span className="text-base font-semibold text-gray-900">
            Selestial
          </span>
        </Link>
        <button className="p-1 rounded hover:bg-gray-100">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      
      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for anything"
            className="w-full h-8 pl-8 text-sm bg-gray-50 border-gray-200 rounded-lg placeholder:text-gray-400 focus:bg-white"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">⌘K</kbd>
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
        <div className="h-px bg-gray-200" />
        
        <NavSection label="Settings" items={settingsNavigation} />
      </nav>
      
      {/* User section */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {business?.owner_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ''}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut} 
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
