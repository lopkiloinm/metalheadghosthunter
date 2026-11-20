import React from 'react';
import { Eye, Plus } from 'lucide-react';
import { EquipmentCardViewport } from '../3d/EquipmentCardViewport';
import { Button } from '../ui/Button';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export function TrackRow({ item, inCrateQty, onInspect, onAddToCrate, perf, paused }) {
  const num = ROMAN[(item.trackNumber || 1) - 1];
  return (
    <li data-testid={`gear-card-${item.slug}`} className="group border-b border-white/[0.06] last:border-b-0">
      <div
        data-testid={`tracklist-row-${item.slug}`}
        className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-x-4 gap-y-4 p-4 transition-colors hover:bg-white/[0.02] sm:p-6 lg:grid-cols-[72px_200px_minmax(0,1fr)_232px] lg:gap-x-7"
      >
        <span data-testid={`track-number-${item.slug}`} className="font-blackletter text-4xl leading-none text-ember lg:text-5xl" aria-label={`Track ${item.trackNumber}`}>
          {num}.
        </span>

        <div className="order-3 col-span-2 overflow-hidden rounded-xl border border-white/[0.07] lg:order-none lg:col-span-1">
          <EquipmentCardViewport
            modelKey={item.modelKey}
            accentColor={item.accentColor}
            reducedMotion={perf.reducedMotion}
            eco={perf.eco}
            webglSupported={perf.webglSupported}
            paused={paused}
            heightClass="h-48 lg:h-36"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <button type="button" onClick={() => onInspect(item)} className="min-w-0 text-left" data-testid={`card-title-${item.slug}`}>
              <h3 data-testid={`track-name-${item.slug}`} className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-bone transition-colors group-hover:text-ember sm:text-3xl">
                {item.trackName}
              </h3>
            </button>
            <span data-testid={`track-runtime-${item.slug}`} className="shrink-0 font-mono text-sm tabular-nums text-ash">
              {item.runtime}
            </span>
          </div>
          <p data-testid={`track-product-${item.slug}`} className="mt-1 font-mono text-[11px] uppercase tracking-wider text-brass">
            {item.name}
          </p>
          <p className="mt-2 hidden text-sm leading-relaxed text-ash sm:block">{item.metalTagline}</p>
        </div>

        <div className="order-4 col-span-2 flex items-center justify-between gap-4 lg:order-none lg:col-span-1 lg:flex-col lg:items-end">
          <p data-testid={`card-price-${item.slug}`} className="whitespace-nowrap font-display text-3xl font-black leading-none text-bone">
            £{item.dailyRate}
            <span className="ml-1 font-mono text-xs font-normal text-ash">/ night</span>
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" data-testid={`card-inspect-button-${item.slug}`} onClick={() => onInspect(item)} aria-label={`Inspect ${item.name}`}>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Inspect</span>
            </Button>
            <Button size="sm" data-testid={`card-add-button-${item.slug}`} onClick={() => onAddToCrate(item)} aria-label={`Add ${item.name} to crate`}>
              <Plus className="h-4 w-4" />
              {inCrateQty > 0 ? `Crate ${inCrateQty}` : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
