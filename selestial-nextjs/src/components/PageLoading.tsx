import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
  message?: string;
}

export default function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
