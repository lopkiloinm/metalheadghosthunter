import React, { useEffect, useState } from 'react';
import { Flame, Radio } from 'lucide-react';

export function Preloader({ onReady, reducedMotion = false }) {
  const [progress, setProgress] = useState(reducedMotion ? 100 : 12);
  const [dismissed, setDismissed] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      onReady?.();
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDismissed(true);
            onReady?.();
          }, 220);
          return 100;
        }
        return Math.min(100, prev + Math.floor(14 + Math.random() * 18));
      });
    }, 140);
    return () => clearInterval(interval);
  }, [reducedMotion, onReady]);

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050507] px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="mb-6 flex items-center gap-3 text-crimson">
        <Flame className="h-7 w-7 animate-pulse" />
        <Radio className="h-7 w-7 text-ecto" />
      </div>

      <p className="font-mono text-xs tracking-[0.35em] text-brass">
        53.2244° N, 4.2096° W // YNYS MÔN
      </p>
      <h1 className="mt-2 font-gothic text-2xl tracking-wider text-bone sm:text-4xl">
        LLANFAIR SPECTRE FORGE
      </h1>
      <p className="mt-2 max-w-md font-mono text-xs text-bone/60">
        TUNING 55 Hz DOOM CARRIER WAVE &amp; CALIBRATING 6 SPECTRAL 3D INSTRUMENTS...
      </p>

      <div className="mt-6 h-1.5 w-72 overflow-hidden rounded-full bg-steel">
        <div
          className="h-full bg-gradient-to-r from-crimson via-brass to-ecto transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center gap-4 font-mono text-xs text-bone/70">
        <span>CALIBRATION: {progress}%</span>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onReady?.();
          }}
          className="rounded border border-crimson/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-crimson transition hover:bg-crimson hover:text-white"
        >
          ENTER NOW
        </button>
      </div>
    </div>
  );
}
