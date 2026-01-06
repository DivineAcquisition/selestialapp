import Image from 'next/image';

interface PageLoadingProps {
  message?: string;
}

export default function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-6 animate-fade-in">
        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse-subtle" />
          <div className="relative w-16 h-16 rounded-2xl bg-card border border-border/50 shadow-lg shadow-black/10 flex items-center justify-center overflow-hidden">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={48} 
              height={48} 
              className="rounded-xl animate-float"
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
