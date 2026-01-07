"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ChevronRight, Sparkles } from 'lucide-react';
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
          'group relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
          isActive
            ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25'
            : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
        )}
      >
        {/* Active indicator glow */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl -z-10" />
        )}
        
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
            isActive 
              ? "bg-white/20" 
              : "bg-gray-100 group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            <Icon className={cn(
              "transition-colors",
              isActive ? "text-white" : "text-gray-500 group-hover:text-primary"
            )} size={18} />
          </div>
          <span>{item.name}</span>
        </div>
        
        {item.showBadge && totalUnread > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-sm animate-pulse">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
        
        {isActive && (
          <ChevronRight className="h-4 w-4 opacity-70" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/60">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-gray-200/60">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={36} 
              height={36} 
              className="rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300" 
            />
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
              Selestial
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              Quote Follow-Up
            </span>
          </div>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="mb-3 px-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
        </div>
        {navigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
        
        {/* Divider */}
        <div className="py-4 px-3">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
        
        <div className="mb-3 px-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">System</p>
        </div>
        {bottomNavigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </nav>
      
      {/* AI Assistant Promo */}
      <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-gray-900">AI Assistant</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Press <kbd className="px-1.5 py-0.5 text-[10px] bg-white rounded border">⌘J</kbd> to chat with AI
        </p>
        <Link 
          href="/settings?tab=ai"
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Configure AI →
        </Link>
      </div>
      
      {/* User section */}
      <div className="border-t border-gray-200/60 p-3">
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-300 cursor-pointer group">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#9D96FF] text-white text-sm font-semibold shadow-lg shadow-primary/20">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
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
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
