import React from 'react';
import { Footprints, Ghost, MapPin, Route, Search } from 'lucide-react';
import { cx } from '../../lib/format';

const LAYERS = [
  { key: 'hotspots', label: 'Hotspots', Icon: MapPin },
  { key: 'routes', label: 'Routes', Icon: Route },
  { key: 'sightings', label: 'Sightings', Icon: Ghost },
];

export function LayerToggle({ layers, onToggle }) {
  return (
    <div role="group" aria-label="Map layers" className="flex flex-wrap gap-2">
      {LAYERS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          aria-pressed={layers[key]}
          data-testid={`map-layer-toggle-${key}`}
          onClick={() => onToggle(key)}
          className={cx(
            'chip transition-colors',
            layers[key] ? 'border-spectral/60 bg-spectral/10 text-spectral' : 'border-white/15 bg-pit text-ash hover:text-bone'
          )}
        >
          <Icon className="h-3.5 w-3.5" /> {label}
        </button>
      ))}
    </div>
  );
}

export function RouteList({ routes, hotspots, focusId, onFocus }) {
  const names = Object.fromEntries(hotspots.map((h) => [h.id, h.name]));
  return (
    <ul data-testid="map-route-list" className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
      {routes.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            data-testid={`map-route-${r.id}`}
            aria-pressed={focusId === r.id}
            onClick={() => onFocus(r)}
            className={cx(
              'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
              focusId === r.id ? 'border-spectral/60 bg-spectral/[0.07]' : 'border-white/[0.07] bg-pit/90 hover:border-white/25'
            )}
          >
            <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-base font-extrabold uppercase tracking-wide text-bone">{r.name}</span>
              <span className="block truncate text-xs text-ash">Forge → {r.hotspotIds.map((id) => names[id]?.split(' (')[0]).join(' → ')}</span>
            </span>
            <span data-testid={`map-route-stats-${r.id}`} className="shrink-0 text-right font-mono text-xs text-spectral">
              {r.distanceKm} km
              <span className="flex items-center justify-end gap-1 text-[10px] text-ash">
                <Footprints className="h-3 w-3" /> {r.walkMinutes} min
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function HotspotKey({ hotspots, onInvestigate }) {
  return (
    <ol data-testid="map-hotspot-key" className="space-y-2">
      {hotspots.map((h, i) => (
        <li key={h.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-pit/90 p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ember font-display text-sm font-black text-bone">{i + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-sm font-extrabold uppercase tracking-wide text-bone">{h.name}</span>
            <span className="block font-mono text-[10px] text-brass">Dread {h.threatSkulls}/10</span>
          </span>
          <button type="button" aria-label={`Investigate ${h.name}`} data-testid={`map-key-investigate-${h.id}`} onClick={() => onInvestigate(h.name)} className="rounded-full p-2 text-spectral hover:bg-spectral/10">
            <Search className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ol>
  );
}
