"use client";

import { ReactNode } from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main content - centered form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Centered logo */}
          <div className="flex justify-center">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={56} 
              height={56} 
              className="h-14 w-14 rounded-xl" 
            />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={20} 
              height={20} 
              className="h-5 w-5 rounded opacity-50" 
            />
          </div>
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Selestial. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
