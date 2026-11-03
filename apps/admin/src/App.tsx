import { isNonProduction, normalizeEgyptPhone, parseAppEnv, toErrorCode } from '@benben/shared';
import { Button, OtpInput, PhoneField } from '@benben/ui';
import type { Session } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import logoUrl from '../../../docs/design/brand/logo/lockup-horizontal.svg';
import { hasAdminRole } from './roles';
import { getSupabase } from './supabase';

function useSession() {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [supabase]);
  return { session, loading };
}

function Login({ env }: { env: string }) {
  const supabase = getSupabase();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [input, setInput] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const normalized = normalizeEgyptPhone(input);

  const send = async () => {
    if (!supabase || !normalized) return;
    setBusy(true);
    setError(undefined);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: normalized });
    setBusy(false);
    if (err) return setError(toErrorCode(err));
    setPhone(normalized);
    setStep('otp');
  };
  const verify = async (token: string) => {
    if (!supabase) return;
    setBusy(true);
    setError(undefined);
    const { error: err } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    setBusy(false);
    if (err) setError(toErrorCode(err));
  };
  const fillDev = async () => {
    if (!supabase) return;
    const { data } = await supabase.rpc('dev_sms_inbox', { p_phone: phone });
    if (data) {
      setCode(data);
      void verify(data);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col gap-5 px-6 pt-16">
      <img src={logoUrl} alt="BEN-BEN" className="h-8 w-auto self-start" />
      <h1 className="font-display text-h2">لوحة إدارة BEN-BEN</h1>
      {step === 'phone' ? (
        <>
          <PhoneField label="رقم الموبايل" error={error} value={input} onChange={(e) => setInput(e.target.value)} />
          <Button block loading={busy} disabled={!normalized || !supabase} onClick={() => void send()}>
            ابعت الكود
          </Button>
        </>
      ) : (
        <>
          <OtpInput label="كود التحقق" value={code} onChange={setCode} onComplete={(c) => void verify(c)} error={Boolean(error)} disabled={busy} />
          {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
          <Button block loading={busy} disabled={code.length !== 6} onClick={() => void verify(code)}>
            تأكيد
          </Button>
          {isNonProduction(parseAppEnv(env)) ? (
            <Button variant="secondary" onClick={() => void fillDev()} data-testid="dev-fill">
              املأ كود الاختبار
            </Button>
          ) : null}
        </>
      )}
      <p className="mt-auto pb-6 text-center text-xs text-ink-muted" data-testid="env-badge">
        <span lang="en" dir="ltr">{env}</span> · BEN-BEN staff
      </p>
    </main>
  );
}

function Gate({ session, env }: { session: Session; env: string }) {
  const supabase = getSupabase();
  const roles = useQuery({
    queryKey: ['roles', session.user.id],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });
  const signOut = () => void supabase?.auth.signOut();

  if (roles.isLoading) return <p className="p-6 text-ink-muted">جارٍ التحميل…</p>;
  const allowed = hasAdminRole(roles.data ?? []);
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col gap-4 px-6 pt-16" data-testid={allowed ? 'admin-home' : 'no-access'}>
      <img src={logoUrl} alt="BEN-BEN" className="h-8 w-auto self-start" />
      <h1 className="font-display text-h2">{allowed ? 'لوحة إدارة BEN-BEN' : 'غير مسموح'}</h1>
      <p className="text-ink-muted" lang="en" dir="ltr">
        {allowed ? 'Staff dashboard. Screens arrive in B6.' : 'This account has no staff role.'}
      </p>
      <Button variant="secondary" onClick={signOut}>تسجيل الخروج</Button>
      <p className="mt-auto pb-6 text-center text-xs text-ink-muted" data-testid="env-badge">
        <span lang="en" dir="ltr">{env}</span>
      </p>
    </main>
  );
}

export function App() {
  const env = parseAppEnv(import.meta.env.VITE_APP_ENV);
  const { session, loading } = useSession();
  if (loading) return <p className="p-6 text-ink-muted">…</p>;
  return session ? <Gate session={session} env={env} /> : <Login env={env} />;
}
