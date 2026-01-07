import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'sm' as const,
    md: 'lg' as const,
    lg: '2xl' as const,
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Icon name="spinner" size={sizeMap[size]} className="animate-spin text-primary" />
    </div>
  );
}
