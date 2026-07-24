import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && <div className="mb-4 text-[var(--sys-on-surface-variant)]/40">{icon}</div>}
      <h3 className="text-lg font-semibold text-[var(--sys-on-surface)]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--sys-on-surface-variant)] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
