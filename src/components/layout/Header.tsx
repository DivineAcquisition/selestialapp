"use client";

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileSidebar from './MobileSidebar';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile menu + title */}
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
