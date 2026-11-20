import React, { useEffect } from 'react';
import { cx } from '../../lib/format';

function useOverlay(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

function Backdrop({ onClose, testId }) {
  return (
    <div
      aria-hidden="true"
      data-testid={`${testId}-backdrop`}
      onClick={onClose}
      className="absolute inset-0 animate-fade-in bg-black/80 backdrop-blur-sm"
    />
  );
}

export function Modal({ open, onClose, labelledBy, testId, className, children }) {
  useOverlay(open, onClose);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <Backdrop onClose={onClose} testId={testId} />
      <div
        data-testid={testId}
        className={cx(
          'relative max-h-[94vh] w-full animate-modal-in overflow-y-auto rounded-t-[28px] border border-white/10 bg-pit shadow-plate sm:rounded-[28px]',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, labelledBy, testId, children }) {
  useOverlay(open, onClose);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="fixed inset-0 z-[70] flex justify-end">
      <Backdrop onClose={onClose} testId={testId} />
      <aside
        data-testid={testId}
        className="relative flex h-full w-full max-w-[32rem] animate-drawer-in flex-col border-l border-white/10 bg-pit shadow-plate"
      >
        {children}
      </aside>
    </div>
  );
}
