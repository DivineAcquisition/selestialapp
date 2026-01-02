import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logoFull from '@/assets/logo-full.png';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-white">Selestial</span>
          </Link>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Stop losing jobs to slow follow-up
            </h1>
            <p className="text-xl text-white/80">
              Automatically follow up on every quote until they book or say no.
            </p>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">80%</p>
              <p className="text-sm text-white/70">of sales require 5+ follow-ups</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">$20K+</p>
              <p className="text-sm text-white/70">lost annually to missed follow-ups</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {['MJ', 'SK', 'RL', 'AP'].map((initials, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium"
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-white/80 text-sm">
            Join 500+ home service businesses
          </p>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">Selestial</span>
            </Link>
          </div>
          
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
