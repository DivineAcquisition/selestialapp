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
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Left side - Mobile menu + title */}
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <Badge variant="secondary" size="sm" className="hidden sm:inline-flex">
                  {subtitle}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="w-full pl-10 pr-20 h-10 bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-border"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
              <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                <Command className="h-2.5 w-2.5 inline mr-0.5" />K
              </kbd>
            </div>
          </div>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {actions}
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-secondary"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-20"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary text-[8px] text-primary-foreground font-bold items-center justify-center">
                3
              </span>
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
