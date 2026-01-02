import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Page title */}
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        
        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Mobile avatar (visible on mobile, hidden on desktop since sidebar has it) */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold md:hidden">
            MJ
          </div>
        </div>
      </div>
    </header>
  );
}
