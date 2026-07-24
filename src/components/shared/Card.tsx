import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' };

export function Card({ children, className, hover, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--sys-corner-md)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] shadow-sm',
        hover &&
          'hover:shadow-md hover:border-[var(--sys-primary)]/30 transition-all duration-200 cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-[var(--sys-on-surface)]', className)}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('', className)}>{children}</div>;
}
