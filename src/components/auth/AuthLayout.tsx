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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with logo */}
      <header className="py-6 px-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src={logoIcon} alt="Selestial" className="h-8 w-8 rounded-lg" />
          <span className="font-semibold text-lg text-foreground">Selestial</span>
        </Link>
      </header>

      {/* Main content - centered form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
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
      </footer>
    </div>
  );
}
