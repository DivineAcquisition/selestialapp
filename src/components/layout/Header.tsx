"use client";

import { useState } from 'react';
import { Bell, Search, Wand2, Command, Menu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-6 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
      {/* Left: Menu & Title */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {title && (
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">{title}</h1>
        )}
      </div>
      
      {/* Center: Search */}
      <div className={cn(
        "hidden md:flex items-center relative transition-all duration-300 ease-out",
        searchFocused ? "w-96" : "w-72"
      )}>
        <div className={cn(
          "absolute inset-0 rounded-xl transition-all duration-300",
          searchFocused ? "bg-primary/5 shadow-lg shadow-primary/10" : ""
        )} />
        <div className="relative w-full">
          <Search className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
            searchFocused ? "text-primary" : "text-gray-400"
          )} />
          <Input
            placeholder="Search quotes, customers..."
            className={cn(
              "w-full h-10 pl-10 pr-20 bg-gray-100/80 border-transparent rounded-xl",
              "placeholder:text-gray-400 text-sm",
              "transition-all duration-300",
              "focus:bg-white focus:border-primary/30 focus:shadow-lg focus:shadow-primary/5"
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-400 bg-white rounded-md border border-gray-200 shadow-sm">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </div>
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* AI Assistant Button */}
        <Button 
          variant="ghost" 
          size="sm"
          className="hidden sm:flex items-center gap-2 px-3 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-300"
        >
          <Wand2 className="h-4 w-4" />
          <span className="text-sm font-medium">AI</span>
          <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded">
            ⌘J
          </kbd>
        </Button>
        
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-300"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg shadow-primary/30">
              3
            </span>
          </span>
        </Button>
        
        {/* Upgrade Button */}
        <Button 
          size="sm"
          className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-primary to-[#9D96FF] text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:opacity-95 transition-all duration-300"
        >
          <Zap className="h-4 w-4" />
          Upgrade
        </Button>
      </div>
    </header>
  );
}
