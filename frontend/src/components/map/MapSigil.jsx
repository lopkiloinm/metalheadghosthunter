import React from 'react';

export const SIGIL_COLORS = { hotspot: '#ff4a1c', forge: '#e8b04a', sighting: '#00f5a0' };

const PENTAGRAM = 'M0,-11 L6.5,8.9 L-10.5,-3.4 L10.5,-3.4 L-6.5,8.9 Z';
const ANVIL = 'M-9,-5 H8 C8,-1 5,1 2,1.5 V4 H5 V7 H-5 V4 H-2 V1.5 C-6,1 -9,-1.5 -9,-5 Z';
const GHOST = 'M-6,7 V-1 C-6,-5 -3.3,-8 0,-8 C3.3,-8 6,-5 6,-1 V7 L3,5 L0,7 L-3,5 Z';

// Shared marker art: rendered inline in the illustrated SVG and as Leaflet divIcon HTML.
export function SigilGlyph({ type, label, active = false }) {
  const color = SIGIL_COLORS[type];
  if (type === 'sighting') {
    return (
      <g>
        <circle r="13" fill={color} opacity="0.18" className="sigil-pulse" />
        <circle r="9" fill="#06100c" stroke={color} strokeWidth="1.5" />
        <path d={GHOST} transform="scale(0.85)" fill={color} />
        <circle cx="-1.8" cy="-1.5" r="1" fill="#06100c" />
        <circle cx="1.8" cy="-1.5" r="1" fill="#06100c" />
      </g>
    );
  }
  if (type === 'forge') {
    return (
      <g>
        <rect x="-14" y="-14" width="28" height="28" rx="7" transform="rotate(45)" fill="#140d08" stroke={color} strokeWidth="2" />
        <path d={ANVIL} fill={color} />
      </g>
    );
  }
  return (
    <g>
      <circle r="16" fill="#150806" stroke={color} strokeWidth={active ? 3 : 2} />
      <circle r="12" fill="none" stroke={color} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2.4" />
      <path d={PENTAGRAM} fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round" opacity="0.75" />
      {label != null && (
        <text y="4.5" textAnchor="middle" fontFamily="'Big Shoulders Display', sans-serif" fontWeight="900" fontSize="13" fill="#f4ede4">
          {label}
        </text>
      )}
    </g>
  );
}

export function SigilSvg({ type, label, size = 40, active }) {
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true" style={{ overflow: 'visible' }}>
      <SigilGlyph type={type} label={label} active={active} />
    </svg>
  );
}
