import React from 'react';
import { Disc3, Eye, Plus, Skull } from 'lucide-react';
import { EquipmentCardViewport } from './3d/CatalogModelCanvas';

export function EquipmentCard({
  item,
  reducedMotion,
  onInspect,
  onAddToCrate,
  inCrateQty = 0,
}) {
  const specEntries = Object.entries(item.specs || {}).slice(0, 2);

  return (
    <article className="forge-card group flex flex-col overflow-hidden rounded-xl transition duration-300">
      {/* Dedicated live 3D WebGL viewport (rendered by SharedCatalogCanvas via View) */}
      <div className="relative border-b border-white/10">
        <EquipmentCardViewport
          modelKey={item.modelKey}
          accentColor={item.accentColor}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest"
            style={{
              borderColor: `${item.accentColor}55`,
              color: item.accentColor,
              backgroundColor: `${item.accentColor}15`,
            }}
          >
            {item.category}
          </span>
          <span className="font-mono text-[11px] text-bone/60">
            {item.stock} IN BUNKER • DRAG 3D ↑
          </span>
        </div>

        <h3 className="mt-3 font-display text-lg font-bold tracking-wide text-bone group-hover:text-white">
          {item.name}
        </h3>
        <p className="font-mono text-[11px] text-brass">{item.subtitle}</p>

        <p className="mt-3 text-sm leading-relaxed text-bone/75">{item.metalTagline}</p>

        {/* Key Specs */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-white/5 bg-black/40 p-2.5">
          {specEntries.map(([k, v]) => (
            <div key={k}>
              <div className="font-mono text-[10px] uppercase tracking-wider text-bone/45">{k}</div>
              <div className="truncate font-mono text-xs text-bone/90" title={v}>
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Metal Soundtrack Pairing */}
        <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-bone/60">
          <Disc3 className="h-3.5 w-3.5 shrink-0 text-crimson" />
          <span className="truncate">Best paired with: {item.soundtrackPairing}</span>
        </div>

        {/* Price + Actions */}
        <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl font-extrabold text-bone">
                £{item.dailyRate}
              </span>
              <span className="font-mono text-xs text-bone/55">/ night</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-bone/50">
              <span>Threat:</span>
              {Array.from({ length: item.threatRating || 4 }).map((_, i) => (
                <Skull key={i} className="h-3 w-3 text-crimson" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onInspect(item)}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-steel px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-bone/90 transition hover:border-ecto hover:text-ecto"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>3D Rig</span>
            </button>
            <button
              type="button"
              onClick={() => onAddToCrate(item)}
              className="flex items-center gap-1.5 rounded-lg bg-crimson px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#ff4260]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{inCrateQty > 0 ? `Crate (${inCrateQty})` : 'Rent'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
