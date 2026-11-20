import React, { useId } from 'react';

// Symmetric band-logo lettering: blackletter core, mirrored thorns, ember underglow. Decorative only.
export function BandLogo({ text, testId }) {
  const core = Math.min(text.length * 44, 640);
  const W = core + 140;
  const H = 150;
  const mid = W / 2;
  const base = 120;
  const gradId = `bl-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const thorns = [];
  for (let i = 1; i <= 9; i += 1) {
    const len = 26 - i * 2.4;
    for (const s of [-1, 1]) {
      const x = mid + s * (i * (core / 20) + 8);
      thorns.push(`M${x - 2.4},${base} L${x + 2.4},${base} L${x + s * 1.5},${base + len} Z`);
      if (i % 3 === 0) thorns.push(`M${x - 1.6},26 L${x + 1.6},26 L${x},${26 - len * 0.55} Z`);
    }
  }
  return (
    <svg data-testid={testId} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-[min(100%,560px)] [filter:drop-shadow(0_3px_10px_rgba(0,0,0,0.85))]" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4ede4" />
          <stop offset="70%" stopColor="#c9bfb2" />
          <stop offset="100%" stopColor="#8a7f74" />
        </linearGradient>
      </defs>
      <ellipse cx={mid} cy={base - 44} rx={W * 0.46} ry="58" fill="#07070a" opacity="0.55" />
      <path d={`M${W * 0.05},${base} L${mid},${base - 3} L${W * 0.95},${base} L${mid},${base + 3} Z`} fill="#ff4a1c" opacity="0.85" />
      <path d={`M${W * 0.2},26 L${mid},24 L${W * 0.8},26 L${mid},28 Z`} fill="#ff4a1c" opacity="0.5" />
      <path d={thorns.join(' ')} fill="#ff4a1c" opacity="0.8" />
      <path d={`M${mid},${base - 9} L${mid + 8},${base} L${mid},${base + 30} L${mid - 8},${base} Z`} fill="#ff4a1c" />
      <text x={mid} y={base - 14} textAnchor="middle" textLength={core} lengthAdjust="spacingAndGlyphs" fontFamily="'Pirata One', serif" fontSize="94" fill="#ff4a1c" opacity="0.35" transform="translate(0 4)">
        {text}
      </text>
      <text x={mid} y={base - 14} textAnchor="middle" textLength={core} lengthAdjust="spacingAndGlyphs" fontFamily="'Pirata One', serif" fontSize="94" fill={`url(#${gradId}) #ede8df`} stroke="#07070a" strokeWidth="2" paintOrder="stroke">
        {text}
      </text>
    </svg>
  );
}

export function AlbumCover({ src, alt, testId }) {
  return (
    <figure data-testid={testId} className="group relative w-full max-w-[220px] pr-8 sm:max-w-[260px] lg:max-w-[300px] xl:max-w-none">
      <div aria-hidden="true" className="vinyl absolute inset-y-[4%] right-0 aspect-square rounded-full transition-transform duration-700 ease-out group-hover:translate-x-3" />
      <img
        src={src}
        alt={alt}
        width="720"
        height="720"
        loading="lazy"
        decoding="async"
        className="relative aspect-square w-full rounded-[4px] object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-transform duration-700 ease-out group-hover:-rotate-1"
      />
    </figure>
  );
}
