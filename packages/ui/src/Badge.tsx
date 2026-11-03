import type { ReactNode } from 'react';
import { cx } from './cx';

const TONES = {
  neutral: 'bg-surface-2 text-ink-muted',
  ok: 'bg-ok-tint text-ok',
  warn: 'bg-warn-tint text-warn',
  danger: 'bg-danger-tint text-danger',
  accent: 'bg-accent-tint text-accent-text',
} as const;

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', TONES[tone])}>{children}</span>;
}

/** The red "LIVE" pill used on running auctions. Pulses unless the user prefers reduced motion. */
export function LivePill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-live px-2.5 py-0.5 text-xs font-semibold text-live-on">
      <span className="h-1.5 w-1.5 rounded-full bg-live-on motion-safe:animate-pulse" aria-hidden="true" />
      {children}
    </span>
  );
}
