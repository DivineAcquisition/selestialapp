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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare, showBadge: true },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Sequences', href: '/sequences', icon: Zap },
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
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={32} 
              height={32}
              className="h-8 w-8"
            />
            <div>
              <p className="font-semibold text-sidebar-foreground">Selestial</p>
              <p className="text-xs text-sidebar-foreground/60">Quote Follow-Up</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </div>
                  {item.showBadge && totalUnread > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          {business && (
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {business.owner_name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {business.name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground"
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
