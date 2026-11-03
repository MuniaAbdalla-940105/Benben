import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cx } from './cx';

const LENGTH = 6;
const AR = '٠١٢٣٤٥٦٧٨٩';
const toLatin = (s: string) => s.replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)));

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called once all six digits are present (typing or paste). */
  onComplete?: (value: string) => void;
  label: string;
  error?: boolean;
  disabled?: boolean;
};

/** Six single-digit boxes. Paste fills all, backspace walks back, one-time-code autofill supported. */
export function OtpInput({ value, onChange, onComplete, label, error, disabled }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(LENGTH, ' ').split('');

  const commit = (next: string) => {
    const clean = toLatin(next).replace(/\D/g, '').slice(0, LENGTH);
    onChange(clean);
    if (clean.length === LENGTH) onComplete?.(clean);
    refs.current[Math.min(clean.length, LENGTH - 1)]?.focus();
  };

  const onPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    commit(e.clipboardData.getData('text'));
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i]?.trim() && i > 0) {
      e.preventDefault();
      commit(value.slice(0, i - 1));
    }
  };

  return (
    <div role="group" aria-label={label} dir="ltr" className="flex justify-center gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d.trim()}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`${label} ${i + 1}`}
          aria-invalid={error || undefined}
          maxLength={LENGTH}
          onPaste={onPaste}
          onKeyDown={(e) => onKey(i, e)}
          onChange={(e) => {
            const typed = toLatin(e.target.value).replace(/\D/g, '');
            if (typed.length > 1) return commit(typed);
            commit(value.slice(0, i) + typed + value.slice(i + 1));
          }}
          className={cx(
            'h-14 w-11 rounded-md border bg-surface text-center font-num text-num-md text-ink outline-none',
            'focus:outline focus:outline-2 focus:outline-focus',
            error ? 'border-danger' : 'border-line-strong',
          )}
        />
      ))}
    </div>
  );
}
