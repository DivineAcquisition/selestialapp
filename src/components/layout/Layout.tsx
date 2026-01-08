"use client";

import Sidebar from './Sidebar';
import Header from './Header';
import QuickAddFAB from '@/components/quotes/QuickAddFAB';
import { GridPattern } from '@/components/ui/grid-pattern';
import { cn } from '@/lib/utils';

interface LayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  showPattern?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'max-w-[1600px]',
  '4xl': 'max-w-[1800px]',
  '5xl': 'max-w-[2000px]',
  '6xl': 'max-w-[2200px]',
  '7xl': 'max-w-[2400px]',
  full: 'max-w-full',
};

export default function Layout({ 
  title, 
  subtitle, 
  actions, 
  children,
  maxWidth = 'full',
  showPattern = true,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Background pattern */}
        {showPattern && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <GridPattern 
              className="opacity-40" 
              squares={[[1, 1], [3, 3], [5, 2], [7, 4]]} 
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.01]" />
            {/* Top glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
        )}
        
        <Header title={title} />
        
        <main className="relative flex-1 p-4 md:p-5 lg:p-6 overflow-auto scrollbar-thin">
          <div className={cn(
            "mx-auto",
            maxWidthClasses[maxWidth],
            "animate-fade-in"
          )}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile FAB for quick quote entry */}
      <QuickAddFAB />
    </div>
  );
}
