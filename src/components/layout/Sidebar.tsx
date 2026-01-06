"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Zap, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Users, 
  Link2, 
  CreditCard, 
  RefreshCw, 
  Megaphone, 
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/providers';
import { useAuth } from '@/providers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare, showBadge: true },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Sequences', href: '/sequences', icon: Zap },
  { name: 'Retention', href: '/retention', icon: RefreshCw },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'Connections', href: '/connections', icon: Link2 },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
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
    
    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </div>
        {item.showBadge && totalUnread > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
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
    <div className="flex h-screen w-64 flex-col bg-sidebar-background border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="/logo-icon-new.png" 
            alt="Selestial" 
            width={36} 
            height={36} 
            className="rounded-lg" 
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">Selestial</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Quote Follow-Up</span>
          </div>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-2 px-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Main Menu</p>
        </div>
        {navigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
        
        {/* Divider */}
        <div className="pt-4 pb-2 px-3">
          <div className="h-px bg-sidebar-border" />
        </div>
        
        <div className="mb-2 px-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">System</p>
        </div>
        {bottomNavigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </nav>
      
      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer group">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {business?.owner_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || ''}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={handleSignOut} 
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
