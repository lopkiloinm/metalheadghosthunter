import React, { useState } from 'react';
import { Compass, Disc3, Flame, MapPin, Radio, Skull, Clock } from 'lucide-react';

export function HauntedHotspots({ hotspots, equipment, onLoadHotspotRig }) {
  const [selectedId, setSelectedId] = useState(hotspots[0]?.id || 'spot-church-island');
  const eqBySlug = Object.fromEntries(equipment.map((e) => [e.slug, e]));
  const active = hotspots.find((h) => h.id === selectedId) || hotspots[0];

  if (!active) return null;

  return (
    <section
      id="hotspots"
      className="border-y border-white/10 bg-[#08090d]/90 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-ecto">
              // LOCAL PARANORMAL INTEL • ANGLESEY
            </p>
            <h2 className="mt-2 font-gothic text-3xl text-bone sm:text-4xl">
              LLANFAIRPWLL HAUNTED RAID ZONES
            </h2>
          </div>
          <p className="max-w-md text-sm text-bone/65">
            Every rental includes waterproof local field maps. Select a haunted site around
            Llanfairpwllgwyngyll to auto-load its recommended doom rig.
          </p>
        </div>

        {/* Iconic 58-letter railway station signboard reimagined in forged iron & brass */}
        <div className="station-sign mt-8 overflow-x-auto rounded-lg px-5 py-3 text-center">
          <div className="whitespace-nowrap font-display text-xs font-bold tracking-[0.14em] text-brass sm:text-sm md:text-base">
            LLANFAIRPWLLGWYNGYLLGOGERYCHWYRNDROBWLLLLANTYSILIOGOGOGOCH
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.28em] text-bone/55">
            GROUND ZERO • MENAI STRAIT PARANORMAL CORRIDOR • YNYS MÔN, NORTH WALES
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Left selector list */}
          <div className="space-y-3 lg:col-span-5">
            {hotspots.map((spot) => {
              const isSelected = spot.id === active.id;
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setSelectedId(spot.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-crimson bg-crimson/10 shadow-crimson'
                      : 'border-white/10 bg-iron/80 hover:border-white/25'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin
                        className={`h-4 w-4 shrink-0 ${
                          isSelected ? 'text-crimson' : 'text-brass'
                        }`}
                      />
                      <span className="font-display text-sm font-bold text-bone">{spot.name}</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-bone/55">{spot.distance}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-xs font-bold text-crimson">
                      {spot.threatSkulls}/10
                    </div>
                    <div className="font-mono text-[10px] text-bone/45">SKULLS</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right detail dossier */}
          <div className="forge-card flex flex-col justify-between rounded-xl p-6 sm:p-8 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded border border-ecto/40 bg-ecto/10 px-2.5 py-1 font-mono text-[11px] text-ecto">
                  {active.coordinates}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(10, active.threatSkulls) }).map((_, i) => (
                    <Skull
                      key={i}
                      className={`h-3.5 w-3.5 ${i < 7 ? 'text-crimson' : 'text-amber-400'}`}
                    />
                  ))}
                </div>
              </div>

              <h3 className="mt-4 font-display text-2xl font-extrabold text-bone sm:text-3xl">
                {active.name}
              </h3>
              <p className="mt-1 font-mono text-xs text-brass">{active.welshName}</p>

              <p className="mt-4 text-sm leading-relaxed text-bone/80">{active.lore}</p>

              {/* Telemetry Grid */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-black/45 p-3">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-bone/50">
                    <Radio className="h-3.5 w-3.5 text-crimson" />
                    Baseline EMF
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-crimson">
                    {active.baselineEmf}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/45 p-3">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-bone/50">
                    <Clock className="h-3.5 w-3.5 text-brass" />
                    Peak Activity
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-bone">
                    {active.peakHour}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/45 p-3">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-bone/50">
                    <Compass className="h-3.5 w-3.5 text-ecto" />
                    Anomaly Class
                  </div>
                  <div className="mt-1 font-mono text-xs font-semibold text-ecto">
                    {active.anomalyType}
                  </div>
                </div>
              </div>

              {/* Soundtrack + Recommended Gear */}
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-brass/25 bg-brass/5 px-3.5 py-2.5 font-mono text-xs text-brass">
                <Disc3 className="h-4 w-4 shrink-0" />
                <span>Recommended Raid Soundtrack: {active.soundtrack}</span>
              </div>

              <div className="mt-5">
                <div className="font-mono text-[11px] uppercase tracking-widest text-bone/55">
                  Recommended Instruments for this Site:
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {active.recommendedSlugs.map((slug) => (
                    <span
                      key={slug}
                      className="rounded-md border border-white/15 bg-steel px-3 py-1 font-mono text-xs text-bone"
                    >
                      {eqBySlug[slug]?.name || slug}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onLoadHotspotRig(active)}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-crimson transition hover:bg-[#ff4260]"
            >
              <Flame className="h-4 w-4" />
              <span>Arm Crate for {active.name}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
