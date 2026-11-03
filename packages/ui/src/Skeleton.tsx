import { cx } from './cx';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx('rounded-md bg-surface-3 motion-safe:animate-pulse', className ?? 'h-4 w-full')} />;
}
