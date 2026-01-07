"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-6 border-b border-gray-200 bg-white">
      {/* Left: Menu & Title */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden h-9 w-9">
            <Icon name="menu" size="lg" className="text-gray-600" />
          </Button>
        )}
        {title && (
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        )}
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Create Button */}
        <Button 
          size="sm"
          className="h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Icon name="plus" size="sm" className="mr-1.5" />
          Create
        </Button>
        
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="bell" size="lg" className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  );
}
