import { localizeDigits, type Locale } from '@benben/shared';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MESSAGES, type MessageKey } from './messages';

type I18n = {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (l: Locale) => void;
  t: (key: MessageKey) => string;
  /** Digits follow the language: Arabic-Indic in Arabic, Latin in English. */
  num: (value: string | number) => string;
};

const I18nContext = createContext<I18n | null>(null);
const STORAGE_KEY = 'bb.locale';

function readStored(): Locale {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStored);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage blocked: the choice lasts for this visit only */
    }
  }, []);

  const value = useMemo<I18n>(
    () => ({
      locale,
      dir,
      setLocale,
      t: (key) => MESSAGES[locale][key],
      num: (v) => localizeDigits(String(v), locale),
    }),
    [locale, dir, setLocale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
