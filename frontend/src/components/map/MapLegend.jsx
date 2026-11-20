import React from 'react';
import { SigilSvg } from './MapSigil';

const ITEMS = [
  { type: 'hotspot', label: 'Haunt', text: 'Haunted site' },
  { type: 'forge', text: 'The Forge · gear pickup' },
  { type: 'sighting', text: 'Field-log sighting' },
];

export function MapLegend({ testId, compact = false, extra }) {
  return (
    <div data-testid={testId} className="pointer-events-auto rounded-xl border border-white/10 bg-void/85 p-3 backdrop-blur-md">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brass">Legend</p>
      <ul className={compact ? 'mt-2 flex flex-wrap gap-x-4 gap-y-1.5' : 'mt-2 space-y-1.5'}>
        {ITEMS.map((it) => (
          <li key={it.type} className="flex items-center gap-2 text-xs text-bone">
            <SigilSvg type={it.type} label={it.type === 'hotspot' ? '1' : undefined} size={20} />
            {it.text}
          </li>
        ))}
        <li className="flex items-center gap-2 text-xs text-bone">
          <svg width="20" height="8" aria-hidden="true"><line x1="0" y1="4" x2="20" y2="4" stroke="#00f5a0" strokeWidth="2.5" strokeDasharray="4 3" /></svg>
          Walking route
        </li>
        {extra}
      </ul>
    </div>
  );
}
