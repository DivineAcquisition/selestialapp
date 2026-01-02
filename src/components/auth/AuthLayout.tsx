import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import selestialLogo from '@/assets/selestial-logo.png';
import logoIcon from '@/assets/logo-icon-new.png';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center">
              <img src={selestialLogo} alt="Selestial" className="h-10 brightness-0 invert" />
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
        <div className="w-full lg:w-1/2 flex flex-col bg-background">
          <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md space-y-8">
              {/* Mobile logo */}
              <div className="lg:hidden text-center">
                <Link to="/" className="inline-flex items-center">
                  <img src={selestialLogo} alt="Selestial" className="h-8" />
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
          
          {/* Footer */}
          <footer className="py-4 px-6 border-t border-border">
            <div className="flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <img src={logoIcon} alt="Selestial" className="h-8 w-8 rounded-lg" />
              <div className="flex items-center gap-4">
                <span>© {new Date().getFullYear()} Selestial</span>
                <span>·</span>
                <a 
                  href="https://selestial.io/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy
                </a>
                <span>·</span>
                <a 
                  href="https://selestial.io/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Terms
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
