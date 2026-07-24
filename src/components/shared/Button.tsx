import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--sys-corner-sm)] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-[var(--sys-primary)] text-white hover:bg-[var(--sys-primary-container)] hover:text-[var(--sys-on-primary-container)] shadow-sm',
        destructive: 'bg-[var(--sys-error)] text-white hover:bg-[var(--sys-error)]/90 shadow-sm',
        outline:
          'border border-[var(--sys-outline)] bg-transparent hover:bg-[var(--sys-surface-container)] hover:text-[var(--sys-on-surface)]',
        secondary:
          'bg-[var(--sys-secondary)] text-[var(--sys-on-secondary)] hover:bg-[var(--sys-secondary)]/90 shadow-sm',
        ghost: 'hover:bg-[var(--sys-surface-container)] hover:text-[var(--sys-on-surface)]',
        link: 'text-[var(--sys-primary)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-[var(--sys-corner-sm)] px-3 text-xs',
        lg: 'h-12 rounded-[var(--sys-corner-sm)] px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
