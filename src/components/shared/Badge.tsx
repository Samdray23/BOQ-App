import { cn } from '@/lib/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-[var(--sys-surface-container)] text-[var(--sys-on-surface-variant)]',
  success: 'bg-[var(--sys-secondary)]/15 text-[var(--sys-secondary)]',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-[var(--sys-error)]/15 text-[var(--sys-error)]',
  info: 'bg-[var(--sys-primary)]/15 text-[var(--sys-primary)]',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
