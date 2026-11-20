import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { HotspotDossier } from './HotspotDossier';
import { cx } from '../../lib/format';

const VILLAGE = 'LLANFAIRPWLLGWYNGYLLGOGERYCHWYRNDROBWLLLLANTYSILIOGOGOGOCH';

export function HauntedHotspots({ hotspots, equipment, onArmHotspot, onInvestigate }) {
  const [selectedId, setSelectedId] = useState(hotspots[0]?.id);
  const active = hotspots.find((h) => h.id === selectedId) || hotspots[0];
  if (!active) return null;

  return (
    <section id="hotspots" data-testid="hotspots-section" className="relative scroll-mt-24 overflow-hidden border-y border-white/[0.06] py-24 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <img src="/images/raid-backdrop.jpg" alt="" loading="lazy" className="h-full w-full object-cover opacity-[0.18]" />
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void/80 to-void" />
      </div>

      <div className="shell relative">
        <SectionHeader chapter="IV" overline="Haunted Raid Planner" title="Choose your haunt on Ynys Môn">
          <p>Every rental includes a waterproof field map. Pick a site and arm your crate with the rigs it demands.</p>
        </SectionHeader>

        <Reveal className="station-sign mt-12 overflow-hidden rounded-xl py-3" aria-hidden="true">
          <div className="flex w-max animate-marquee whitespace-nowrap font-display text-lg font-extrabold tracking-[0.18em] text-brass sm:text-xl">
            <span className="px-6">{VILLAGE} · YNYS MÔN ·</span>
            <span className="px-6">{VILLAGE} · YNYS MÔN ·</span>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <Reveal className="space-y-2.5 lg:col-span-5" role="list" aria-label="Haunted sites">
            {hotspots.map((spot, i) => {
              const selected = spot.id === active.id;
              return (
                <button
                  key={spot.id}
                  type="button"
                  role="listitem"
                  aria-current={selected}
                  data-testid={`hotspot-select-${spot.id}`}
                  onClick={() => setSelectedId(spot.id)}
                  className={cx(
                    'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors',
                    selected ? 'border-ember bg-ember/10' : 'border-white/[0.07] bg-pit/90 hover:border-white/25'
                  )}
                >
                  <span className={cx('font-blackletter text-2xl leading-none', selected ? 'text-ember' : 'text-ash')}>{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg font-extrabold uppercase tracking-wide text-bone">{spot.name}</span>
                    <span className="flex items-center gap-1.5 text-xs text-ash">
                      <MapPin className="h-3 w-3 text-brass" /> {spot.distance}
                    </span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-sm font-semibold text-ember">
                    {spot.threatSkulls}/10
                    <span className="block text-[10px] font-normal uppercase tracking-widest text-ash">dread</span>
                  </span>
                </button>
              );
            })}
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <HotspotDossier spot={active} equipment={equipment} onArm={onArmHotspot} onInvestigate={onInvestigate} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
