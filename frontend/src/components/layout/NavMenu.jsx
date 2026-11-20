import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Ghost, Leaf, MoreHorizontal, ScrollText, Volume2, VolumeX, Zap } from 'lucide-react';
import { cx } from '../../lib/format';

function MenuRow({ icon: Icon, label, hint, on, testId, onClick, href }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      {...(href ? { href } : { type: 'button' })}
      data-testid={testId}
      onClick={onClick}
      aria-pressed={on === undefined ? undefined : on}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.05] focus-visible:outline-none"
    >
      <Icon className={cx('h-4 w-4 shrink-0', on ? 'text-spectral' : 'text-ash')} />
      <span className="flex-1 text-sm font-bold text-bone">{label}</span>
      {hint && <span className={cx('font-mono text-[10px] uppercase tracking-widest', on ? 'text-spectral' : 'text-ash')}>{hint}</span>}
    </Tag>
  );
}

export function NavMenu({ onOpenBookings, synth, eco, haunting, backendOnline }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-testid="navbar-utility-menu-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="More: bookings, synth, 3D quality and haunting"
        onClick={() => setOpen((o) => !o)}
        className={cx('btn-icon', open && 'border-bone/40 text-bone')}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div data-testid="navbar-utility-menu" className="glass absolute right-0 top-[calc(100%+10px)] w-72 animate-menu-in rounded-2xl border border-white/10 p-2 shadow-2xl">
          <MenuRow
            icon={ScrollText}
            label="My Bookings"
            testId="my-bookings-button"
            onClick={() => {
              setOpen(false);
              onOpenBookings();
            }}
          />
          <MenuRow icon={BookOpen} label="Field Logs" href="#field-logs" testId="nav-link-field-logs" onClick={() => setOpen(false)} />
          <div className="my-1.5 h-px bg-white/[0.07]" />
          <MenuRow icon={synth.active ? Volume2 : VolumeX} label="Doom drone synth" hint={synth.active ? 'On' : 'Muted'} on={synth.active} testId="synth-toggle-button" onClick={synth.onToggle} />
          <MenuRow
            icon={eco.on ? Leaf : Zap}
            label="3D quality"
            hint={`${eco.on ? 'Eco' : 'Ultra'}${eco.isAuto ? ' · auto' : ''}`}
            on={!eco.on}
            testId="eco-mode-toggle-button"
            onClick={eco.onToggle}
          />
          <MenuRow icon={Ghost} label="Haunting" hint={haunting.on ? 'On' : 'Off'} on={haunting.on} testId="haunting-toggle-button" onClick={haunting.onToggle} />
          <p className="mt-1.5 flex items-center gap-2 border-t border-white/[0.07] px-3 pb-1 pt-2.5 font-mono text-[10px] uppercase tracking-widest text-ash">
            <span data-testid="backend-status-indicator" className={cx('h-1.5 w-1.5 rounded-full', backendOnline ? 'bg-spectral' : 'bg-brass')} />
            {backendOnline ? 'Forge online' : 'Offline mode · local data'}
          </p>
        </div>
      )}
    </div>
  );
}
