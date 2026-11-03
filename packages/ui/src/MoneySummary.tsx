import { formatEGP, type Locale } from '@benben/shared';

export type MoneyLine = { label: string; piasters: number; strong?: boolean };

/** A list of labelled amounts (piasters in, formatted EGP out), for deposits, fees and totals. */
export function MoneySummary({ lines, locale }: { lines: MoneyLine[]; locale: Locale }) {
  return (
    <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
      {lines.map((l) => (
        <div key={l.label} className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-sm text-ink-muted">{l.label}</dt>
          <dd className={l.strong ? 'font-num text-num-md text-ink' : 'font-num text-base text-ink'}>{formatEGP(l.piasters, locale)}</dd>
        </div>
      ))}
    </dl>
  );
}
