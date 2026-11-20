import React, { useEffect, useState } from 'react';

const DURATION_MS = 900;

export function Preloader({ reducedMotion }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DURATION_MS);
      setProgress(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 180);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  if (done) return null;

  return (
    <div data-testid="preloader" role="status" aria-live="polite" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void px-6 text-center">
      <p className="overline text-brass">53.2244° N · 4.2096° W · Ynys Môn</p>
      <p className="mt-4 animate-flicker font-blackletter text-5xl text-bone sm:text-6xl">Spectre Forge</p>
      <div className="mt-8 h-[3px] w-64 overflow-hidden rounded-full bg-steel">
        <div className="h-full bg-ember" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 flex items-center gap-4 font-mono text-xs text-ash">
        <span>Heating the forge · {progress}%</span>
        <button type="button" data-testid="preloader-skip" onClick={() => setDone(true)} className="uppercase tracking-widest text-spectral hover:text-bone">
          Enter
        </button>
      </div>
    </div>
  );
}
