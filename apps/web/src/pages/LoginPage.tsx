import { isNonProduction, normalizeEgyptPhone, parseAppEnv, toErrorCode } from '@benben/shared';
import { Button, Icon, OtpInput, PhoneField, useToast } from '@benben/ui';
import { useState } from 'react';
import { Navigate } from 'react-router';
import logoUrl from '../../../../docs/design/brand/logo/lockup-horizontal.svg';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { errorKey } from '../i18n/messages';
import { DEFAULT_PATH } from '../routes';
import { getSupabase } from '../supabase';

export default function LoginPage() {
  const { t, num, locale } = useI18n();
  const toast = useToast();
  const { session, configured } = useAuth();
  const env = parseAppEnv(import.meta.env.VITE_APP_ENV);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  if (session) return <Navigate to={DEFAULT_PATH} replace />;

  const normalized = normalizeEgyptPhone(phoneInput);
  const supabase = getSupabase();

  const send = async () => {
    if (!supabase || !normalized) return;
    setBusy(true);
    setError(undefined);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: normalized });
    setBusy(false);
    if (err) return setError(t(errorKey(toErrorCode(err))));
    setPhone(normalized);
    setCode('');
    setStep('otp');
  };

  const verify = async (token: string) => {
    if (!supabase || busy) return;
    setBusy(true);
    setError(undefined);
    const { error: err } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    setBusy(false);
    if (err) return setError(t(errorKey(toErrorCode(err))));
  };

  const fillDevCode = async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase.rpc('dev_sms_inbox', { p_phone: phone });
    if (err || !data) return toast(t(errorKey(toErrorCode(err))), 'danger');
    setCode(data);
    void verify(data);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-6 pt-10">
      <img src={logoUrl} alt="BEN-BEN" className="h-8 w-auto self-start" />
      {step === 'phone' ? (
        <>
          <div>
            <h1 className="font-display text-h1 text-ink">{t('login.title')}</h1>
            <p className="mt-1 text-sm text-ink-muted">{t('login.subtitle')}</p>
          </div>
          <PhoneField
            label={t('login.phone')}
            help={t('login.phoneHelp')}
            error={error}
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void send()}
          />
          <Button block loading={busy} disabled={!normalized || !configured} onClick={() => void send()}>
            {t('login.send')}
          </Button>
          {!configured ? <p className="text-sm text-warn">{t('login.notConfigured')}</p> : null}
        </>
      ) : (
        <>
          <div>
            <h1 className="font-display text-h1 text-ink">{t('login.otpTitle')}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {t('login.otpSent')} <span dir="ltr" className="font-num text-ink">{num(phone)}</span> ·{' '}
              <button type="button" className="underline" onClick={() => setStep('phone')}>
                {t('login.change')}
              </button>
            </p>
          </div>
          <OtpInput label={t('login.otpLabel')} value={code} onChange={setCode} onComplete={(c) => void verify(c)} error={Boolean(error)} disabled={busy} />
          {error ? (
            <p role="alert" className="text-center text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button block loading={busy} disabled={code.length !== 6} onClick={() => void verify(code)}>
            {t('login.confirm')}
          </Button>
          <Button variant="ghost" block onClick={() => void send()}>
            {t('login.resend')}
          </Button>
          {isNonProduction(env) ? (
            <div className="flex flex-col gap-2 rounded-md bg-accent-tint p-3 text-xs text-accent-text">
              <span className="flex items-center gap-2">
                <Icon name="info" size={16} />
                {t('login.devNote')}
              </span>
              <Button variant="secondary" onClick={() => void fillDevCode()} data-testid="dev-fill">
                {t('login.devFill')}
              </Button>
            </div>
          ) : null}
        </>
      )}
      <p className="mt-auto pb-6 text-center text-xs text-ink-muted" data-testid="env-badge">
        <span lang="en" dir="ltr">{env}</span> · {locale === 'ar' ? t('app.tagline') : t('app.tagline')}
      </p>
    </main>
  );
}
