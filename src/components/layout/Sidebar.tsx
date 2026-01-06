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
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/providers';
import { useAuth } from '@/providers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, description: 'Overview & insights' },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare, showBadge: true, description: 'Messages & replies' },
  { name: 'Quotes', href: '/quotes', icon: FileText, description: 'Manage quotes' },
  { name: 'Customers', href: '/customers', icon: Users, description: 'Customer database' },
  { name: 'Sequences', href: '/sequences', icon: Zap, description: 'Automation flows' },
  { name: 'Retention', href: '/retention', icon: RefreshCw, description: 'Win back customers' },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone, description: 'Marketing campaigns' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Performance data' },
];

const bottomNavigation = [
  { name: 'Connections', href: '/connections', icon: Link2, description: 'Integrations' },
  { name: 'Billing', href: '/billing', icon: CreditCard, description: 'Subscription & usage' },
  { name: 'Settings', href: '/settings', icon: Settings, description: 'Preferences' },
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
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                'group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" 
                    : "bg-sidebar-accent group-hover:bg-secondary"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span>{item.name}</span>
              </div>
              {item.showBadge && totalUnread > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full animate-pulse-subtle">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
              {isActive && (
                <ChevronRight className="h-4 w-4 text-primary opacity-50" />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="hidden lg:block">
            {item.description}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex h-screen w-72 flex-col bg-sidebar-background border-r border-sidebar-border/50">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-sidebar-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={36} 
              height={36} 
              className="relative rounded-xl" 
            />
          </div>
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
          <div className="h-px bg-sidebar-border/50" />
        </div>
        
        <div className="mb-2 px-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">System</p>
        </div>
        {bottomNavigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </nav>
      
      {/* Upgrade Banner */}
      <div className="px-3 pb-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-4 border border-primary/20">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Pro Features</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock AI-powered replies and advanced analytics
            </p>
            <Button size="sm" variant="gradient" className="w-full h-8 text-xs">
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
      
      {/* User section */}
      <div className="border-t border-sidebar-border/50 p-3">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer group">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20">
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
