import React from 'react';
import { Disc3, Eye, Plus } from 'lucide-react';
import { EquipmentCardViewport } from '../3d/EquipmentCardViewport';
import { Button } from '../ui/Button';
import { ThreatMeter } from '../ui/ThreatMeter';

export function EquipmentCard({ item, inCrateQty, onInspect, onAddToCrate, perf, paused }) {
  const specs = Object.entries(item.specs || {}).slice(0, 2);

  return (
    <article data-testid={`gear-card-${item.slug}`} className="card-forge card-lift group flex h-full flex-col overflow-hidden">
      <div className="relative border-b border-white/[0.06]">
        <EquipmentCardViewport
          modelKey={item.modelKey}
          accentColor={item.accentColor}
          reducedMotion={perf.reducedMotion}
          eco={perf.eco}
          webglSupported={perf.webglSupported}
          paused={paused}
        />
        <span
          className="chip pointer-events-none absolute left-4 top-4 bg-void/80 backdrop-blur"
          style={{ borderColor: `${item.accentColor}66`, color: item.accentColor }}
        >
          {item.category}
        </span>
        <span className="pointer-events-none absolute right-4 top-4 font-mono text-[10px] uppercase tracking-widest text-ash">{item.stock} in bunker</span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <button type="button" onClick={() => onInspect(item)} className="text-left" data-testid={`card-title-${item.slug}`}>
          <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-bone transition-colors group-hover:text-ember">
            {item.name}
          </h3>
        </button>
        <p className="mt-1 font-mono text-[11px] text-brass">{item.subtitle}</p>
        <p className="mt-4 text-sm leading-relaxed text-ash">{item.metalTagline}</p>

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] bg-void/60 p-3.5">
          {specs.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-ash">{k}</dt>
              <dd className="mt-0.5 truncate text-sm text-bone" title={v}>
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 flex items-center gap-2 text-xs text-ash">
          <Disc3 className="h-3.5 w-3.5 shrink-0 text-ember" aria-hidden="true" />
          <span className="truncate">Pairs with {item.soundtrackPairing}</span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/[0.06] pt-5">
          <div>
            <p data-testid={`card-price-${item.slug}`} className="whitespace-nowrap font-display text-4xl font-black leading-none text-bone">
              £{item.dailyRate}
              <span className="ml-1 font-mono text-xs font-normal text-ash">/ night</span>
            </p>
            <div className="mt-2">
              <ThreatMeter value={item.threatRating || 4} />
            </div>
          </div>
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
    </article>
  );
}
