import React, { useMemo, useState } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { TrackRow } from './TrackRow';
import { cx, slugify } from '../../lib/format';

const toSeconds = (rt = '0:00') => rt.split(':').reduce((acc, v) => acc * 60 + Number(v), 0);
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function SideLabel({ side }) {
  return (
    <li aria-hidden="true" className="flex items-center gap-3 border-b border-white/[0.06] bg-void/50 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.28em] text-spectral">
      Side {side}
      <span className="h-px flex-1 bg-spectral/20" />
    </li>
  );
}

export function CatalogSection({ equipment, crateItems, onInspect, onAddToCrate, perf, paused }) {
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...new Set(equipment.map((e) => e.category))], [equipment]);
  const tracks = useMemo(() => [...equipment].sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0)), [equipment]);
  const visible = category === 'All' ? tracks : tracks.filter((e) => e.category === category);
  const qtyBySlug = Object.fromEntries(crateItems.map((c) => [c.item.slug, c.quantity]));
  const total = fmt(tracks.reduce((s, t) => s + toSeconds(t.runtime), 0));

  return (
    <section id="armoury" data-testid="catalog-section" className="shell scroll-mt-24 py-24 lg:py-32">
      <SectionHeader chapter="II" overline="The Spectral Armoury" logo="Armoury" title="Six rigs, forged for the dead of night">
        <p>The armoury is pressed as a six-track LP. Every rig is a live 3D model you can drag around. Open a track to inspect it, then throw it in the crate.</p>
      </SectionHeader>

      <Reveal delay={160} className="no-scrollbar -mx-5 mt-12 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={category === cat}
            data-testid={`category-filter-${slugify(cat)}`}
            onClick={() => setCategory(cat)}
            className={cx('btn btn-sm shrink-0', category === cat ? 'bg-bone text-void' : 'border border-rim bg-pit text-ash hover:border-bone/40 hover:text-bone')}
          >
            {cat}
          </button>
        ))}
      </Reveal>

      <Reveal delay={200} className="mt-8">
        <div data-testid="tracklist" className="card-forge overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-white/[0.08] px-6 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
            <span className="text-bone">Spectre Forge · Rigs for the Dead of Night</span>
            <span data-testid="tracklist-total-runtime">Total runtime {total}</span>
            <span className="hidden md:inline">33⅓ RPM · Pressed in Llanfairpwll</span>
          </div>
          <ol data-testid="catalog-grid">
            {visible.map((item, i) => (
              <React.Fragment key={item.slug}>
                {category === 'All' && (i === 0 || i === 3) && <SideLabel side={i === 0 ? 'A' : 'B'} />}
                <TrackRow item={item} inCrateQty={qtyBySlug[item.slug] || 0} onInspect={onInspect} onAddToCrate={onAddToCrate} perf={perf} paused={paused} />
              </React.Fragment>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
