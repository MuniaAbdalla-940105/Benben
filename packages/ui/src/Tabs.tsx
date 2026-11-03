import { cx } from './cx';

export type TabItem = { id: string; label: string };

/** Accessible tab list (arrow keys move the selection). The panel content is rendered by the caller. */
export function Tabs({ items, value, onChange, label }: { items: TabItem[]; value: string; onChange: (id: string) => void; label: string }) {
  const move = (dir: 1 | -1) => {
    const i = items.findIndex((x) => x.id === value);
    const next = items[(i + dir + items.length) % items.length];
    if (next) onChange(next.id);
  };
  return (
    <div role="tablist" aria-label={label} className="flex border-b border-line">
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          type="button"
          aria-selected={it.id === value}
          tabIndex={it.id === value ? 0 : -1}
          onClick={() => onChange(it.id)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') move(document.dir === 'rtl' ? -1 : 1);
            if (e.key === 'ArrowLeft') move(document.dir === 'rtl' ? 1 : -1);
          }}
          className={cx(
            'min-h-target flex-1 border-b-2 px-3 text-sm font-medium',
            it.id === value ? 'border-accent text-accent-text' : 'border-transparent text-ink-muted',
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
