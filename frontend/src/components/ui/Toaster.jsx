import React from 'react';
import { Flame, X } from 'lucide-react';

export function Toaster({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      data-testid="toast-region"
      className="pointer-events-none fixed inset-x-0 top-20 z-[90] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:top-auto sm:items-start"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          data-testid="toast"
          className="glass pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-2xl border border-ember/40 px-4 py-3 shadow-ember"
        >
          <Flame className="h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
          <p data-testid="toast-message" className="min-w-0 flex-1 text-sm text-bone">
            {t.message}
          </p>
          {t.action && (
            <button
              type="button"
              data-testid="toast-action"
              onClick={() => {
                t.action.onClick();
                onDismiss(t.id);
              }}
              className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-widest text-spectral hover:text-bone"
            >
              {t.action.label}
            </button>
          )}
          <button type="button" aria-label="Dismiss notification" onClick={() => onDismiss(t.id)} className="shrink-0 text-ash hover:text-bone">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
