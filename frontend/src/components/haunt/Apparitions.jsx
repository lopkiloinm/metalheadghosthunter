import React, { useEffect, useRef } from 'react';
import { ApparitionShape } from './ApparitionShape';

const FIGURES = [
  { left: '4%', top: '18%', w: 150, dur: 38, delay: 0 },
  { left: '82%', top: '46%', w: 190, dur: 46, delay: -12 },
  { left: '58%', top: '78%', w: 130, dur: 41, delay: -24 },
  { left: '24%', top: '62%', w: 110, dur: 52, delay: -6 },
];
const RADIUS = 240;

function useRecoil(refs, enabled) {
  useEffect(() => {
    if (!enabled || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    let raf = 0;
    let pt = null;
    const update = () => {
      raf = 0;
      refs.current.forEach((el) => {
        if (!el) return;
        const r = el.parentElement.getBoundingClientRect();
        const dx = r.left + r.width / 2 - pt.x;
        const dy = r.top + r.height / 2 - pt.y;
        const d = Math.hypot(dx, dy) || 1;
        const near = d < RADIUS;
        const push = near ? ((RADIUS - d) / RADIUS) * 90 : 0;
        el.style.transform = `translate(${(dx / d) * push}px, ${(dy / d) * push}px)`;
        el.style.opacity = near ? String(Math.max(0, d / RADIUS - 0.25)) : '1';
        el.dataset.recoiled = near ? 'true' : 'false';
      });
    };
    const onMove = (e) => {
      pt = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [refs, enabled]);
}

export function Apparitions({ eco, reducedMotion }) {
  const refs = useRef([]);
  const still = reducedMotion;
  const figures = eco || reducedMotion ? FIGURES.slice(0, 2) : FIGURES;
  useRecoil(refs, !reducedMotion);

  return (
    <div data-testid="haunt-apparitions" aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {figures.map((f, i) => (
        <div
          key={f.left}
          data-testid={`apparition-${i}`}
          className={still ? 'absolute opacity-[0.13]' : 'apparition-drift absolute'}
          style={{ left: f.left, top: f.top, width: f.w, animationDuration: `${eco ? f.dur * 1.6 : f.dur}s`, animationDelay: `${f.delay}s` }}
        >
          <div ref={(el) => (refs.current[i] = el)} className="transition-[transform,opacity] duration-700 ease-out">
            <ApparitionShape id={`a${i}`} className="h-auto w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
