import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  block?: boolean;
  loading?: boolean;
};

const VARIANTS = {
  primary: 'bg-primary text-primary-on hover:bg-primary-hover',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-2',
  danger: 'bg-danger text-white',
} as const;

export function Button({ variant = 'primary', block, loading, disabled, className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex min-h-target items-center justify-center gap-2 rounded-md px-5 text-base font-semibold',
        'transition-colors duration-fast ease-standard motion-reduce:transition-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        'disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-ink-disabled',
        VARIANTS[variant],
        block && 'w-full',
        loading && 'opacity-70',
        className,
      )}
    >
      {children}
    </button>
  );
}
