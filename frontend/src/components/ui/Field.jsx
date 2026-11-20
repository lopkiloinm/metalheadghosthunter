import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cx } from '../../lib/format';

export function FieldError({ id, children, testId }) {
  if (!children) return null;
  return (
    <p id={id} data-testid={testId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-bold text-danger">
      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function Field({ label, htmlFor, error, errorTestId, hint, className, children }) {
  return (
    <div className={cx('min-w-0', className)}>
      <label htmlFor={htmlFor} className="label-forge">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ash">{hint}</p>}
      <FieldError id={`${htmlFor}-error`} testId={errorTestId}>
        {error}
      </FieldError>
    </div>
  );
}
