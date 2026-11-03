import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export function EmptyState({ icon = 'info', title, body, action }: { icon?: IconName; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-ink-muted">
        <Icon name={icon} size={28} />
      </span>
      <h2 className="font-display text-h3 text-ink">{title}</h2>
      {body ? <p className="max-w-xs text-sm text-ink-muted">{body}</p> : null}
      {action}
    </div>
  );
}
