import React, { useState } from 'react';
import { ArrowDown, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { HeroStagePanel } from './HeroStagePanel';
import { spectralSynth } from '../../audio/spectralSynth';

const STATS = [
  ['06', 'Forged 3D rigs'],
  ['05', 'Anglesey raid zones'],
  ['03:33', 'Last pickup, GMT'],
];

export function HeroSection({ equipment, onAddToCrate, onForgeCta, perf, paused, soundOn }) {
  const [heroSlug, setHeroSlug] = useState(equipment[0]?.slug);
  const [overdrive, setOverdrive] = useState(false);
  const [camera, setCamera] = useState('hero');
  const heroItem = equipment.find((e) => e.slug === heroSlug) || equipment[0];

  function selectGear(slug) {
    setHeroSlug(slug);
    setOverdrive(false);
  }

  function toggleOverdrive() {
    const next = !overdrive;
    setOverdrive(next);
    if (next && soundOn) spectralSynth.playOverdrivePulse(heroItem.modelKey);
  }

  return (
    <section id="top" data-testid="hero-section" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <img src="/images/hero-fog.jpg" alt="" className="h-full w-full object-cover opacity-[0.22]" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/70 to-void" />
        <div className="scanlines absolute inset-0 opacity-50" />
      </div>

      <div className="shell relative grid items-center gap-12 pb-20 pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-16">
        <div className="min-w-0 lg:col-span-6 xl:col-span-5">
          <span data-testid="hero-location-badge" className="chip border-ember/40 bg-ember/10 text-ember">
            <MapPin className="h-3.5 w-3.5" />
            Llanfairpwllgwyngyll · Anglesey
          </span>
          <h1 className="mt-7 font-blackletter text-[clamp(2.75rem,13vw,4.5rem)] leading-[0.9] text-bone lg:text-[clamp(3.75rem,6.2vw,5.5rem)]">
            Hunt the Abyss
          </h1>
          <p className="mt-2 font-display text-4xl font-black uppercase leading-none tracking-tight text-ember-fade sm:text-5xl lg:text-[clamp(2.5rem,4.2vw,3.75rem)]">
            At full volume
          </p>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ash">
            Doom-grade ghost hunting gear for metalheads raiding Church Island, Bryn Celli Ddu and the 58-letter platform.
            Inspect every rig in 3D, forge your crate, and pick up before 03:33.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button size="lg" data-testid="hero-forge-crate-cta" onClick={onForgeCta}>
              Forge Your Crate
              <ArrowDown className="h-4 w-4" />
            </Button>
            <a href="#hotspots" data-testid="hero-raid-link" className="btn btn-lg btn-ghost">
              Plan a raid
            </a>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {STATS.map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-black text-bone">{value}</dd>
                <dd className="mt-1 font-mono text-[10px] uppercase leading-snug tracking-[0.16em] text-ash">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="min-w-0 lg:col-span-6 xl:col-span-7">
          {heroItem && (
            <HeroStagePanel
              equipment={equipment}
              heroItem={heroItem}
              onSelectGear={selectGear}
              overdrive={overdrive}
              onToggleOverdrive={toggleOverdrive}
              camera={camera}
              onCamera={setCamera}
              onAddToCrate={onAddToCrate}
              perf={perf}
              paused={paused}
            />
          )}
        </div>
      </div>
    </section>
  );
}
