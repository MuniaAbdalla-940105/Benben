import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  help?: string;
  error?: string | undefined;
  /** Fixed prefix inside the box, e.g. the country code. Always left-to-right. */
  prefix?: ReactNode;
};

export function TextField({ label, help, error, prefix, className, ...rest }: TextFieldProps) {
  const id = useId();
  const note = error ?? help;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={cx(
          'flex min-h-target items-center gap-2 rounded-md border bg-surface px-3',
          'focus-within:outline focus-within:outline-2 focus-within:outline-focus',
          error ? 'border-danger' : 'border-line-strong',
        )}
        dir={prefix ? 'ltr' : undefined}
      >
        {prefix ? <span className="font-num text-ink-muted">{prefix}</span> : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? `${id}-note` : undefined}
          className={cx('min-w-0 flex-1 bg-transparent py-2 text-base text-ink outline-none placeholder:text-ink-disabled', className)}
          {...rest}
        />
      </div>
      {note ? (
        <p id={`${id}-note`} role={error ? 'alert' : undefined} className={cx('text-xs', error ? 'text-danger' : 'text-ink-muted')}>
          {note}
        </p>
      ) : null}
    </div>
  );
}
