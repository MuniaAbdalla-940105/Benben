import { localizeDigits, serverNow, type Locale } from '@benben/shared';
import { useEffect, useState } from 'react';
import { formatRemaining } from './formatRemaining';

/** Time left until `endsAt` (ISO), on the server clock. Ticks once a second. */
export function CountdownText({ endsAt, locale }: { endsAt: string; locale: Locale }) {
  const end = Date.parse(endsAt);
  const [now, setNow] = useState(serverNow());
  useEffect(() => {
    const id = setInterval(() => setNow(serverNow()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <time dateTime={endsAt} dir="ltr" className="font-num">
      {localizeDigits(formatRemaining(end - now), locale)}
    </time>
  );
}

/** Ring that drains as the deadline nears. `totalMs` is the full duration. Static when reduced motion is preferred. */
export function CountdownRing({ endsAt, totalMs, size = 56 }: { endsAt: string; totalMs: number; size?: number }) {
  const end = Date.parse(endsAt);
  const [now, setNow] = useState(serverNow());
  useEffect(() => {
    const id = setInterval(() => setNow(serverNow()), 1000);
    return () => clearInterval(id);
  }, []);
  const frac = Math.min(1, Math.max(0, (end - now) / totalMs));
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={formatRemaining(end - now)}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ds-line)" strokeWidth="4" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--ds-live)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - frac)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
