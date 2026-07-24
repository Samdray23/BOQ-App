import { cn } from '@/lib/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  className,
  label,
  error,
  options,
  placeholder,
  id,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--sys-on-surface-variant)]">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'flex h-10 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-2 text-sm text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 focus-visible:border-[var(--sys-primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error &&
            'border-[var(--sys-error)] focus-visible:ring-[var(--sys-error)]/50 focus-visible:border-[var(--sys-error)]',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[var(--sys-error)]">{error}</p>}
    </div>
  );
}
