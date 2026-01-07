"use client";

import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card container */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg animate-fade-in-up">
            {/* Logo and header */}
            <div className="flex flex-col items-center mb-8">
              <Link href="/" className="group mb-6">
                <Image 
                  src="/logo-icon-new.png" 
                  alt="Selestial" 
                  width={56} 
                  height={56} 
                  className="rounded-xl shadow-md group-hover:scale-105 transition-transform" 
                />
              </Link>
              
              <h1 className="text-2xl font-bold text-foreground text-center">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-2 text-center">{subtitle}</p>
              )}
            </div>
            
            {children}
          </div>
          
          {/* Trust badges */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>256-bit encryption</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <span className="text-border">•</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <span className="text-border">•</span>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} Selestial. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
