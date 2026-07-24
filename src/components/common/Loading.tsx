import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function Loading({ className, size = 'md', fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 stroke-[2.5]',
    md: 'h-8 w-8 stroke-[2]',
    lg: 'h-12 w-12 stroke-[1.5]',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-[var(--sys-primary)]', sizeClasses[size])} />
      <span className="text-sm font-medium text-[var(--sys-on-surface-variant)] animate-pulse">
        Loading...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--sys-surface)]/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
