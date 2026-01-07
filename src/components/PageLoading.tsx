import Image from 'next/image';

interface PageLoadingProps {
  message?: string;
}

export default function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center overflow-hidden">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={48} 
              height={48} 
              className="rounded-lg"
            />
          </div>
        </div>
        
        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          {/* Animated dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          
          {/* Message */}
          <p className="text-sm text-muted-foreground font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}
