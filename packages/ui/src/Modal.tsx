import { useEffect, useRef, type ReactNode } from 'react';
import { cx } from './cx';

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode; /** 'sheet' slides from the bottom on phones. */ variant?: 'modal' | 'sheet' };

/** Dialog built on the native <dialog>: focus trap, Escape and backdrop handled by the browser. */
function Dialog({ open, onClose, title, children, variant = 'modal' }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cx(
        'bg-surface p-0 text-ink backdrop:bg-scrim',
        variant === 'sheet'
          ? 'fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none rounded-t-sheet shadow-sheet'
          : 'm-auto w-[min(92vw,28rem)] rounded-xl shadow-raised',
      )}
    >
      <div className="flex flex-col gap-3 p-5">
        <h2 className="font-display text-h3">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

export function Modal(props: Omit<Props, 'variant'>) {
  return <Dialog {...props} variant="modal" />;
}

export function BottomSheet(props: Omit<Props, 'variant'>) {
  return <Dialog {...props} variant="sheet" />;
}
