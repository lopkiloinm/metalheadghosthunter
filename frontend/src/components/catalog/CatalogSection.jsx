import React, { useMemo, useState } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { EquipmentCard } from './EquipmentCard';
import { cx, slugify } from '../../lib/format';

export function CatalogSection({ equipment, crateItems, onInspect, onAddToCrate, perf, paused }) {
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...new Set(equipment.map((e) => e.category))], [equipment]);
  const visible = category === 'All' ? equipment : equipment.filter((e) => e.category === category);
  const qtyBySlug = Object.fromEntries(crateItems.map((c) => [c.item.slug, c.quantity]));

  return (
    <section id="armoury" data-testid="catalog-section" className="shell scroll-mt-24 py-24 lg:py-32">
      <SectionHeader chapter="II" overline="The Spectral Armoury" title="Six rigs, forged for the dead of night">
        <p>Every instrument is a live, draggable 3D model. Spin it, inspect it, then throw it in the crate.</p>
      </SectionHeader>

      <Reveal delay={160} className="no-scrollbar -mx-5 mt-12 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={category === cat}
            data-testid={`category-filter-${slugify(cat)}`}
            onClick={() => setCategory(cat)}
            className={cx(
              'btn btn-sm shrink-0',
              category === cat ? 'bg-bone text-void' : 'border border-rim bg-pit text-ash hover:border-bone/40 hover:text-bone'
            )}
          >
            {cat}
          </button>
        ))}
      </Reveal>

      <div data-testid="catalog-grid" className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item, i) => (
          <Reveal key={item.slug} delay={(i % 3) * 110}>
            <EquipmentCard
              item={item}
              inCrateQty={qtyBySlug[item.slug] || 0}
              onInspect={onInspect}
              onAddToCrate={onAddToCrate}
              perf={perf}
              paused={paused}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
