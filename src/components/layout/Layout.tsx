"use client";

import Sidebar from './Sidebar';
import Header from './Header';
import QuickAddFAB from '@/components/quotes/QuickAddFAB';

interface LayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function Layout({ title, subtitle, actions, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} actions={actions} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile FAB for quick quote entry */}
      <QuickAddFAB />
    </div>
  );
}
