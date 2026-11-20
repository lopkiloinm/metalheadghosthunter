import React from 'react';
import { Clock, Compass, Disc3, Flame, Radio, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThreatMeter } from '../ui/ThreatMeter';

export function HotspotDossier({ spot, equipment, onArm, onInvestigate }) {
  const eqBySlug = Object.fromEntries(equipment.map((e) => [e.slug, e]));
  const telemetry = [
    [Radio, 'Baseline EMF', spot.baselineEmf, 'text-ember'],
    [Clock, 'Peak activity', spot.peakHour, 'text-bone'],
    [Compass, 'Anomaly', spot.anomalyType, 'text-spectral'],
  ];

  return (
    <article data-testid="hotspot-dossier" className="card-forge flex h-full flex-col p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="chip border-spectral/40 text-spectral">{spot.coordinates}</span>
        <ThreatMeter value={spot.threatSkulls} max={10} label="Dread" />
      </div>
      <h3 data-testid="hotspot-dossier-title" className="mt-6 font-display text-3xl font-black uppercase leading-[0.95] tracking-tight text-bone sm:text-4xl">
        {spot.name}
      </h3>
      <p className="mt-2 break-words font-mono text-xs text-brass">{spot.welshName}</p>
      <p className="mt-5 leading-relaxed text-ash">{spot.lore}</p>

      <dl className="mt-7 grid gap-3 sm:grid-cols-3">
        {telemetry.map(([Icon, label, value, color]) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-void/60 p-4">
            <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ash">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
            </dt>
            <dd className={`mt-1.5 text-sm font-bold ${color}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 flex items-center gap-2 text-sm text-brass">
        <Disc3 className="h-4 w-4 shrink-0" aria-hidden="true" /> Raid soundtrack: {spot.soundtrack}
      </p>

      <div className="mt-6">
        <p className="label-forge">Recommended rigs</p>
        <ul className="flex flex-wrap gap-2">
          {spot.recommendedSlugs.map((slug) => (
            <li key={slug} className="rounded-full border border-white/10 bg-steel/60 px-3 py-1 text-xs text-bone">
              {eqBySlug[slug]?.name || slug}
            </li>
          ))}
        </ul>
      </div>

      <Button size="lg" className="mt-8 w-full whitespace-normal text-center" data-testid="hotspot-arm-crate-button" onClick={() => onArm(spot)}>
        <Flame className="h-4 w-4 shrink-0" /> Arm crate for this haunt
      </Button>
      <Button variant="spectral" className="mt-3 w-full" data-testid="hotspot-investigate-button" onClick={() => onInvestigate(spot.name)}>
        <Search className="h-4 w-4 shrink-0" /> Investigate with Spectre Intel
      </Button>
    </article>
  );
}
