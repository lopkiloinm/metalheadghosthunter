import React, { useState } from 'react';
import { LANDMARKS, ROADS, SHORE } from './geo';
import { SigilGlyph } from './MapSigil';

const W = 1000;
const H = 600;
const B = { n: 53.2272, s: 53.1995, w: -4.2445, e: -4.1645 };
const FORGE_NUDGE = [30, 34];
const px = (lat, lng) => [((lng - B.w) / (B.e - B.w)) * W, ((B.n - lat) / (B.n - B.s)) * H];
const line = (pts) => pts.map(([lat, lng], i) => `${i ? 'L' : 'M'}${px(lat, lng).map((v) => v.toFixed(1)).join(',')}`).join(' ');

const MAINLAND = SHORE.map(([lat, lng]) => [lat - 0.0052, lng + 0.0052]);
const WATER = `${line(SHORE)} L${W},${H + 40} L${px(MAINLAND[0][0], MAINLAND[0][1])[0]},${H + 40} ${line([...MAINLAND].reverse()).replace(/^M/, 'L')} Z`;
const STRAIT = `${line(SHORE)} ${line([...MAINLAND].reverse()).replace(/^M/, 'L')} Z`;

function Compass() {
  return (
    <g transform="translate(70 92)" aria-hidden="true">
      <circle r="38" fill="none" stroke="#e8b04a" strokeOpacity="0.4" strokeDasharray="3 4" />
      <path d="M0,-34 L7,0 L0,34 L-7,0 Z" fill="#e8b04a" opacity="0.9" />
      <path d="M-34,0 L0,-6 L34,0 L0,6 Z" fill="#e8b04a" opacity="0.45" />
      <text y="-42" textAnchor="middle" fontFamily="'Pirata One', serif" fontSize="18" fill="#f4ede4">N</text>
    </g>
  );
}

function Landmarks() {
  const station = px(LANDMARKS.station.lat, LANDMARKS.station.lng);
  const column = px(LANDMARKS.column.lat, LANDMARKS.column.lng);
  const church = px(LANDMARKS.stMarys.lat, LANDMARKS.stMarys.lng);
  const bridge = px(LANDMARKS.britannia.lat, LANDMARKS.britannia.lng);
  return (
    <g fontFamily="'IBM Plex Mono', monospace" fontSize="11" fill="#c9bfb2">
      <g transform={`translate(${station[0] - 196} ${station[1] - 78})`}>
        <rect width="236" height="38" rx="3" fill="#0d0a08" stroke="#e8b04a" strokeWidth="1.2" />
        <text x="118" y="16" textAnchor="middle" fontSize="11" letterSpacing="0.6" fill="#e8b04a">LLANFAIRPWLLGWYNGYLLGOGERY</text>
        <text x="118" y="31" textAnchor="middle" fontSize="11" letterSpacing="0.2" fill="#e8b04a">CHWYRNDROBWLLLLANTYSILIOGOGOGOCH</text>
        <line x1="196" y1="38" x2="196" y2="66" stroke="#e8b04a" strokeOpacity="0.5" />
      </g>
      <g transform={`translate(${column[0]} ${column[1]})`}>
        <rect x="-3" y="-30" width="6" height="26" fill="#c9bfb2" />
        <rect x="-6" y="-34" width="12" height="5" fill="#c9bfb2" />
        <text x="10" y="-30">The Column · 27m</text>
      </g>
      <g transform={`translate(${church[0]} ${church[1]})`}>
        <path d="M-6,0 V-10 L0,-17 L6,-10 V0 Z M-1,-21 H1 V-17 H-1 Z M-3,-19 H3" fill="#c9bfb2" stroke="#c9bfb2" />
        <text x="10" y="2">St Mary's Church</text>
      </g>
      <g transform={`translate(${bridge[0]} ${bridge[1]})`}>
        <path d="M-26,18 L26,-18" stroke="#f4ede4" strokeWidth="5" />
        <path d="M-26,18 L26,-18" stroke="#0d0a08" strokeWidth="1.2" strokeDasharray="5 4" />
        <text x="18" y="22" fill="#f4ede4">Britannia Bridge → Bangor</text>
      </g>
    </g>
  );
}

function HotspotSigils({ hotspots, active, setActive }) {
  return hotspots.map((h, i) => {
    const [x, y] = px(h.lat, h.lng);
    const on = active === h.id;
    return (
      <g
        key={h.id}
        transform={`translate(${x} ${y})`}
        tabIndex={0}
        role="button"
        aria-label={`${h.name}, dread ${h.threatSkulls} of 10`}
        data-testid={`illustrated-hotspot-${h.id}`}
        className="cursor-pointer outline-none"
        onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(h.id)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
        onFocus={() => setActive(h.id)}
        onBlur={() => setActive(null)}
        onClick={(e) => {
          e.stopPropagation();
          setActive(h.id);
        }}
      >
        <SigilGlyph type="hotspot" label={i + 1} active={on} />
      </g>
    );
  });
}

function ActiveLabel({ spot }) {
  if (!spot) return null;
  const [x, y] = px(spot.lat, spot.lng);
  const flip = x > W * 0.62;
  const w = Math.max(200, spot.name.length * 7.4 + 24);
  return (
    <g transform={`translate(${flip ? x - w - 22 : x + 22} ${Math.max(10, y - 30)})`} pointerEvents="none" data-testid="illustrated-hotspot-label">
      <rect width={w} height="52" rx="8" fill="#0b0807" stroke="#ff4a1c" strokeWidth="1.2" />
      <text x="12" y="21" fontFamily="'Big Shoulders Display', sans-serif" fontWeight="800" fontSize="15" fill="#f4ede4">{spot.name}</text>
      <text x="12" y="40" fontFamily="'IBM Plex Mono', monospace" fontSize="11" fill="#e8b04a">Dread {spot.threatSkulls}/10 · {spot.distance.split(' (')[0]}</text>
    </g>
  );
}

export function IllustratedMap({ hotspots, forge, routes }) {
  const [active, setActive] = useState(null);
  const spot = hotspots.find((h) => h.id === active);
  const [fx, fy] = forge ? px(forge.lat, forge.lng) : [0, 0];

  return (
    <figure data-testid="illustrated-map" className="relative overflow-hidden rounded-[1.75rem] border border-brass/25 bg-[#120d0a]">
      <div data-testid="illustrated-map-scroller" className="overflow-x-auto overscroll-x-contain">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[760px] sm:min-w-0" role="img" aria-label="Illustrated chart of Llanfairpwllgwyngyll and the Menai Strait">
        <defs>
          <pattern id="chart-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0H0V50" fill="none" stroke="#e8b04a" strokeOpacity="0.06" />
          </pattern>
          <pattern id="tide" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
            <path d="M0 7 Q3.5 3 7 7 T14 7" fill="none" stroke="#00f5a0" strokeOpacity="0.22" />
          </pattern>
          <radialGradient id="char" cx="40%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#2a1a10" />
            <stop offset="100%" stopColor="#0d0907" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#char)" onClick={() => setActive(null)} />
        <rect width={W} height={H} fill="url(#chart-grid)" />
        <path d={WATER} fill="#06120f" />
        <path d={STRAIT} fill="url(#tide)" />
        <path d={line(SHORE)} fill="none" stroke="#00f5a0" strokeOpacity="0.6" strokeWidth="1.6" />
        <path d={line(MAINLAND)} fill="none" stroke="#00f5a0" strokeOpacity="0.35" strokeWidth="1.2" />
        <text transform={`translate(${px(53.2072, -4.2005).join(' ')}) rotate(-33)`} fontFamily="'Pirata One', serif" fontSize="24" fill="#00f5a0" fillOpacity="0.75" letterSpacing="3">Afon Menai · Menai Strait</text>
        <text x="830" y="590" fontFamily="'IBM Plex Mono', monospace" fontSize="11" fill="#7a8f88">GWYNEDD · mainland</text>
        <text x={px(53.2262, -4.168)[0] - 40} y={px(53.2262, -4.168)[1] - 22} fontFamily="'IBM Plex Mono', monospace" fontSize="11" fill="#c9bfb2">Menai Bridge ↗</text>

        <path d={line(ROADS.A4080)} fill="none" stroke="#5b4636" strokeWidth="5" strokeLinecap="round" />
        <path d={line(ROADS.A5)} fill="none" stroke="#6e5644" strokeWidth="6" strokeLinecap="round" />
        <path d={line(ROADS.RAIL)} fill="none" stroke="#c9bfb2" strokeOpacity="0.55" strokeWidth="1.5" />
        <path d={line(ROADS.RAIL)} fill="none" stroke="#c9bfb2" strokeOpacity="0.55" strokeWidth="6" strokeDasharray="1 7" />
        <g fontFamily="'IBM Plex Mono', monospace" fontSize="11" fontWeight="600" fill="#e8b04a">
          <text x={px(53.2228, -4.238)[0]} y={px(53.2228, -4.238)[1] - 10}>A5</text>
          <text x={px(53.2045, -4.2265)[0] - 46} y={px(53.2045, -4.2265)[1]}>A4080</text>
          <text x={px(53.2238, -4.235)[0]} y={px(53.2238, -4.235)[1] - 24} fill="#c9bfb2" fontWeight="400">railway</text>
        </g>

        {routes.map((r) => (
          <path key={r.id} d={line(r.path)} fill="none" stroke={r.color} strokeOpacity="0.85" strokeWidth="2.2" strokeDasharray="7 6" strokeLinecap="round" data-testid={`illustrated-route-${r.id}`} />
        ))}

        <Landmarks />
        <Compass />
        {forge && (
          <g data-testid="illustrated-forge">
            <line x1={fx} y1={fy} x2={fx + FORGE_NUDGE[0]} y2={fy + FORGE_NUDGE[1]} stroke="#e8b04a" strokeDasharray="2 3" />
            <circle cx={fx} cy={fy} r="2.5" fill="#e8b04a" />
            <g transform={`translate(${fx + FORGE_NUDGE[0]} ${fy + FORGE_NUDGE[1]})`}>
              <SigilGlyph type="forge" />
              <text x="22" y="6" fontFamily="'Pirata One', serif" fontSize="19" fill="#e8b04a">The Forge</text>
            </g>
          </g>
        )}
        <HotspotSigils hotspots={hotspots} active={active} setActive={setActive} />
        <ActiveLabel spot={spot} />
      </svg>
      </div>
      <figcaption className="border-t border-white/[0.06] px-5 py-3 font-mono text-[11px] text-ash">
        <span className="sm:hidden">Swipe the chart sideways. </span>Hover or tap a sigil to read the haunt. Chart not to scale; walking routes plotted from OpenStreetMap footpaths.
      </figcaption>
    </figure>
  );
}
