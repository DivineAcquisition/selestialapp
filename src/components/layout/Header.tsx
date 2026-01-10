"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

import type { IconName } from '@/components/ui/icon';

interface QuickAction {
  label: string;
  icon: IconName;
  href: string;
  shortcut: string;
}

interface NavigationItem {
  label: string;
  icon: IconName;
  href: string;
}

const quickActions: QuickAction[] = [
  { label: 'New Quote', icon: 'fileText', href: '/quotes/new', shortcut: 'Q' },
  { label: 'New Booking', icon: 'calendar', href: '/bookings', shortcut: 'B' },
  { label: 'New Customer', icon: 'users', href: '/customers', shortcut: 'C' },
  { label: 'Payment Link', icon: 'link', href: '/payments', shortcut: 'P' },
];

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', icon: 'home', href: '/' },
  { label: 'Quotes', icon: 'fileText', href: '/quotes' },
  { label: 'Bookings', icon: 'calendar', href: '/bookings' },
  { label: 'Customers', icon: 'users', href: '/customers' },
  { label: 'Analytics', icon: 'chart', href: '/analytics' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
];

export default function Header({ title, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        {/* Left: Menu & Title */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden h-9 w-9">
              <Icon name="menu" size="lg" className="text-muted-foreground" />
            </Button>
          )}
          {title && (
            <h1 className="text-base font-semibold text-foreground">{title}</h1>
          )}
        </div>
        
        {/* Center: Command Search (Desktop) */}
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden md:flex items-center gap-2 h-9 px-4 rounded-lg bg-accent/50 hover:bg-accent text-muted-foreground text-sm transition-colors"
        >
          <Icon name="search" size="sm" />
          <span>Search...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCommandOpen(true)}
            className="md:hidden h-9 w-9 rounded-lg"
          >
            <Icon name="search" size="lg" className="text-muted-foreground" />
          </Button>
          
          {/* Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm"
                className="h-9 px-3 md:px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30"
              >
                <Icon name="plus" size="sm" className="md:mr-1.5" />
                <span className="hidden md:inline">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem 
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="cursor-pointer"
                >
                  <Icon name={action.icon} size="sm" className="mr-2 text-muted-foreground" />
                  {action.label}
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                    {action.shortcut}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9 rounded-lg hover:bg-accent transition-colors"
              >
                <Icon name="bell" size="lg" className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary" className="text-[10px]">3 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-1 p-1">
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                  <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-600">
                    <Icon name="checkCircle" size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Quote Won</p>
                    <p className="text-xs text-muted-foreground truncate">John Doe accepted your quote</p>
                    <p className="text-xs text-muted-foreground mt-0.5">2 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                  <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                    <Icon name="message" size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">New Message</p>
                    <p className="text-xs text-muted-foreground truncate">Jane replied to your follow-up</p>
                    <p className="text-xs text-muted-foreground mt-0.5">15 min ago</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search or jump to..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.label}
                onSelect={() => {
                  router.push(action.href);
                  setCommandOpen(false);
                }}
              >
                <Icon name={action.icon} size="sm" className="mr-2" />
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => {
                  router.push(item.href);
                  setCommandOpen(false);
                }}
              >
                <Icon name={item.icon} size="sm" className="mr-2" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
