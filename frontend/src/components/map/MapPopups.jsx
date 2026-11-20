import React from 'react';
import { Search } from 'lucide-react';
import { SIGHTING_LABEL_TIME } from './geo';

export function HotspotPopup({ spot, onInvestigate }) {
  return (
    <div data-testid={`map-popup-${spot.id}`}>
      <p className="font-display text-base font-extrabold uppercase leading-tight text-bone">{spot.name}</p>
      <p className="mt-1 font-mono text-[11px] text-brass">Dread {spot.threatSkulls}/10 · {spot.anomalyType}</p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
        <div className="h-full rounded-full bg-ember" style={{ width: `${spot.threatSkulls * 10}%` }} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ash">{spot.lore.slice(0, 150)}…</p>
      <button
        type="button"
        data-testid={`map-popup-investigate-${spot.id}`}
        onClick={() => onInvestigate(spot.name)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-spectral/50 bg-spectral/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-spectral hover:bg-spectral/20"
      >
        <Search className="h-3.5 w-3.5" /> Investigate
      </button>
    </div>
  );
}

export function SightingPopup({ log }) {
  return (
    <div data-testid={`map-sighting-popup-${log.id}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-spectral">Sighting · {log.peakEmf} mG</p>
      <p className="mt-1 font-display text-sm font-extrabold uppercase text-bone">{log.location}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-ash">“{log.report.slice(0, 160)}{log.report.length > 160 ? '…' : ''}”</p>
      <p className="mt-2 text-xs font-bold text-bone">{log.hunterName}</p>
      <p className="font-mono text-[10px] text-brass">{SIGHTING_LABEL_TIME(log.createdAt)}</p>
    </div>
  );
}

export function ForgePopup({ forge }) {
  return (
    <div data-testid="map-forge-popup">
      <p className="font-blackletter text-xl text-brass">{forge.name}</p>
      <p className="mt-1 text-xs text-ash">{forge.address}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-bone">Gear pickup · open until 03:33</p>
    </div>
  );
}
