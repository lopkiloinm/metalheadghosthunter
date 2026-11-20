import React, { useEffect, useRef, useState } from 'react';
import { Ghost, Leaf, Package, ScrollText, Volume2, VolumeX, Zap } from 'lucide-react';
import { cx } from '../../lib/format';

export function SynthToggle({ active, onToggle, testId, wide = false }) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={active}
      onClick={onToggle}
      title="Toggle the 55 Hz doom drone synth"
      className={cx('btn btn-sm', active ? 'btn-spectral shadow-spectral' : 'btn-secondary', wide && 'w-full')}
    >
      {active ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      <span>{active ? 'Synth on' : 'Synth muted'}</span>
    </button>
  );
}

export function EcoToggle({ eco, isAuto, onToggle, testId, wide = false }) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={eco}
      onClick={onToggle}
      title="Eco mode lowers 3D effects for smoother performance"
      className={cx('btn btn-sm', eco ? 'border border-brass/60 bg-brass/10 text-brass hover:bg-brass hover:text-void' : 'btn-secondary', wide && 'w-full')}
    >
      {eco ? <Leaf className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
      <span>{eco ? 'Eco 3D' : 'Ultra 3D'}</span>
      {isAuto && <span className="rounded bg-white/10 px-1 text-[9px] tracking-widest">Auto</span>}
    </button>
  );
}

export function BookingsButton({ onClick, testId, wide = false }) {
  return (
    <button type="button" data-testid={testId} onClick={onClick} aria-label="My Bookings" title="My Bookings" className={cx('btn btn-sm btn-secondary', wide && 'w-full')}>
      <ScrollText className="h-4 w-4" />
      <span className={wide ? '' : 'hidden 2xl:inline'}>My Bookings</span>
    </button>
  );
}

export function HauntingToggle({ on, onToggle, testId }) {
  return (
    <button type="button" data-testid={testId} aria-pressed={on} onClick={onToggle} className={cx('btn btn-sm w-full', on ? 'border border-spectral/50 bg-spectral/10 text-spectral' : 'btn-secondary')}>
      <Ghost className="h-4 w-4" />
      <span>{on ? 'Haunting on' : 'Haunting off'}</span>
    </button>
  );
}

function useHeadbang(count) {
  const prev = useRef(count);
  const [banging, setBanging] = useState(false);
  useEffect(() => {
    if (count > prev.current) {
      setBanging(true);
      const t = setTimeout(() => setBanging(false), 650);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
    return undefined;
  }, [count]);
  return banging;
}

export function CrateButton({ count, onClick, testId, badgeTestId, wide = false }) {
  const banging = useHeadbang(count);
  return (
    <button
      type="button"
      data-testid={testId}
      data-headbang={banging ? 'true' : 'false'}
      onClick={onClick}
      aria-label={`Open crate, ${count} items`}
      className={cx('btn btn-sm btn-primary', wide && 'w-full', banging && 'animate-headbang')}
    >
      <Package className="h-4 w-4" />
      <span className={wide ? '' : 'hidden sm:inline'}>Crate</span>
      <span key={count} data-testid={badgeTestId} className={cx('flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ember-ink px-1.5 text-[11px] text-ember', count > 0 && 'animate-bump')}>
        {count}
      </span>
    </button>
  );
}
