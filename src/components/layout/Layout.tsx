"use client";

import Sidebar from './Sidebar';
import Header from './Header';
import QuickAddFAB from '@/components/quotes/QuickAddFAB';

interface LayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
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
}: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} actions={actions} />
        
        <main className="flex-1 p-4 md:p-5 lg:p-6 overflow-auto">
          <div className={`mx-auto ${maxWidthClasses[maxWidth]} animate-fade-in`}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile FAB for quick quote entry */}
      <QuickAddFAB />
    </div>
  );
}
