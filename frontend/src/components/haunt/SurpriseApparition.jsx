import React, { useEffect, useRef, useState } from 'react';

const FAST = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('haunt') === 'fast';
const nextDelay = () => (FAST ? 4000 + Math.random() * 3000 : 60000 + Math.random() * 90000);
const RETRY = FAST ? 3000 : 20000;

function busy() {
  const el = document.activeElement;
  return Boolean(el?.matches?.('input, textarea, select, [contenteditable="true"]') || document.querySelector('[role="dialog"]'));
}

// One silent face in the fog at a screen edge, every 60-150s, never while a modal/drawer/input is active.
export function SurpriseApparition({ enabled, suppressed }) {
  const [vision, setVision] = useState(null);
  const blocked = useRef(suppressed);
  blocked.current = suppressed;

  useEffect(() => {
    if (!enabled) {
      setVision(null);
      return undefined;
    }
    let timer;
    const schedule = (ms) => {
      timer = setTimeout(() => {
        if (blocked.current || busy() || document.hidden) return schedule(RETRY);
        setVision({ id: Date.now(), side: Math.random() < 0.5 ? 'left' : 'right', top: 18 + Math.random() * 45 });
        schedule(nextDelay() + 7000);
      }, ms);
    };
    schedule(nextDelay());
    return () => clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    if (suppressed) setVision(null);
  }, [suppressed]);

  if (!vision) return null;
  return (
    <img
      key={vision.id}
      src="/assets/fog-face.webp"
      alt=""
      aria-hidden="true"
      data-testid="surprise-apparition"
      onAnimationEnd={() => setVision(null)}
      className="surprise-apparition pointer-events-none fixed z-[1] w-[180px] sm:w-[240px]"
      style={{ top: `${vision.top}%`, [vision.side]: '-40px', transform: vision.side === 'right' ? 'scaleX(-1)' : undefined }}
    />
  );
}
