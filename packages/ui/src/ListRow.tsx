import type { ReactNode } from 'react';
import { cx } from './cx';

export type ListRowProps = {
  title: string;
  subtitle?: string | undefined;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function ListRow({ title, subtitle, leading, trailing, onClick, className }: ListRowProps) {
  const body = (
    <>
      {leading ? <span className="text-ink-muted">{leading}</span> : null}
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate text-base text-ink">{title}</span>
        {subtitle ? <span className="block truncate text-sm text-ink-muted">{subtitle}</span> : null}
      </span>
      {trailing ? <span className="text-sm text-ink-muted">{trailing}</span> : null}
    </>
  );
  const cls = cx('flex min-h-target w-full items-center gap-3 px-4 py-2', className);
  return onClick ? (
    <button type="button" onClick={onClick} className={cx(cls, 'hover:bg-surface-2')}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}
