import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ className, label, error, icon, rightIcon, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--sys-on-surface-variant)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sys-on-surface-variant)]">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={cn(
            'flex h-10 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 focus-visible:border-[var(--sys-primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            icon && 'pl-10',
            rightIcon && 'pr-10',
            error &&
              'border-[var(--sys-error)] focus-visible:ring-[var(--sys-error)]/50 focus-visible:border-[var(--sys-error)]',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[var(--sys-error)]">{error}</p>}
    </div>
  );
}
