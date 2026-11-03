import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cx } from './cx';

type Tone = 'info' | 'ok' | 'danger';
type ToastItem = { id: number; tone: Tone; text: string };
const ToastContext = createContext<(text: string, tone?: Tone) => void>(() => undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}

const TONES: Record<Tone, string> = { info: 'bg-surface-3 text-ink', ok: 'bg-ok-tint text-ok', danger: 'bg-danger-tint text-danger' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((text: string, tone: Tone = 'info') => {
    const id = Date.now() + Math.random();
    setItems((cur) => [...cur, { id, tone, text }]);
    setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), 4000);
  }, []);
  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div key={t.id} role="status" className={cx('pointer-events-auto rounded-md px-4 py-3 text-sm shadow-toast', TONES[t.tone])}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
