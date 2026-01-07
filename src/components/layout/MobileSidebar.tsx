"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth, useBusiness } from '@/providers';
import { useConversations } from '@/hooks/useConversations';
import { cn } from '@/lib/utils';
import { 
  Menu, 
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

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare, showBadge: true },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Sequences', href: '/sequences', icon: Zap },
  { name: 'Retention', href: '/retention', icon: RefreshCw },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Connections', href: '/connections', icon: Link2 },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { business } = useBusiness();
  const { totalUnread } = useConversations();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const initials = business?.owner_name
    ? business.owner_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden hover:bg-secondary">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar-background border-sidebar-border/50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-sidebar-border/50">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={36} 
              height={36}
              className="h-9 w-9 rounded-xl"
            />
            <div>
              <p className="font-bold text-foreground">Selestial</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Quote Follow-Up</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" 
                        : "bg-sidebar-accent"
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.showBadge && totalUnread > 0 && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
                        {totalUnread > 99 ? '99+' : totalUnread}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-primary opacity-50" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          {business && (
            <div className="p-3 border-t border-sidebar-border/50">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/50 mb-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20">
                    {initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {business.owner_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {business.name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
