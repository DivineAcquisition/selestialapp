"use client";

import { Bell, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MobileSidebar from './MobileSidebar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex h-12 items-center justify-between gap-3 px-3 md:px-4">
        {/* Left side - Mobile menu + title */}
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-foreground">{title}</h1>
              {subtitle && (
                <Badge variant="secondary" className="hidden sm:inline-flex text-[10px]">
                  {subtitle}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-3">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="w-full pl-9 pr-16 h-8 text-sm bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-border"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
              <kbd className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                <Command className="h-2 w-2 inline mr-0.5" />K
              </kbd>
            </div>
          </div>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-1.5">
          {actions}
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-secondary h-8 w-8"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-20"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary text-[7px] text-primary-foreground font-bold items-center justify-center">
                3
              </span>
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
