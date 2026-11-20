import React from 'react';
import { cx } from '../../lib/format';

// Literal class names so Tailwind's content scanner keeps them.
const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  spectral: 'btn-spectral',
  ghost: 'btn-ghost',
};
const SIZES = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }) {
  return <button type={type} className={cx('btn', VARIANTS[variant], SIZES[size], className)} {...props} />;
}

export function IconButton({ label, className, type = 'button', ...props }) {
  return <button type={type} aria-label={label} title={label} className={cx('btn-icon', className)} {...props} />;
}
