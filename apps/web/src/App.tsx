import { parseAppEnv } from '@benben/shared';
import logoUrl from '../../../docs/design/brand/logo/lockup-arabic.svg';
import { getSupabase } from './supabase';

/** ST-001 placeholder. The app shell, routing and i18n arrive in ST-002. */
export function App() {
  const env = parseAppEnv(import.meta.env.VITE_APP_ENV);
  const backend = getSupabase() ? 'متصل بإعدادات Supabase' : 'Supabase غير مُعد';

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-6 text-center">
      <img src={logoUrl} alt="BEN-BEN مزاد عقارات" className="h-auto w-64" />
      <h1 className="font-display text-h2">قريبًا: مزادات عقارية مباشرة في مصر</h1>
      <p className="text-ink-muted" lang="en" dir="ltr">
        Coming soon: live real-estate auctions in Egypt.
      </p>
      <p className="rounded-full bg-surface-2 px-4 py-1 text-sm text-ink-muted" data-testid="env-badge">
        <span lang="en" dir="ltr">{env}</span> · {backend}
      </p>
    </main>
  );
}
