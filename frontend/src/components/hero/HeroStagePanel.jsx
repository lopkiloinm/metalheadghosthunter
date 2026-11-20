import React from 'react';
import { Plus, Radio, RotateCw, Zap } from 'lucide-react';
import { HeroStage3D } from '../3d/HeroStage3D';
import { CAMERA_PRESETS } from '../3d/CameraRig';
import { Button } from '../ui/Button';
import { cx, shortName } from '../../lib/format';

export function CameraPresetBar({ value, onChange, testIdPrefix }) {
  return (
    <div className="flex gap-1.5" role="group" aria-label="Camera angle">
      {Object.entries(CAMERA_PRESETS).map(([key, { label }]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          data-testid={`${testIdPrefix}-${key}`}
          onClick={() => onChange(key)}
          className={cx(
            'rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest backdrop-blur transition-colors',
            value === key ? 'border-ember bg-ember/25 text-bone' : 'border-white/15 bg-void/70 text-ash hover:text-bone'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function GearSwitcher({ equipment, activeSlug, onSelect }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6" role="group" aria-label="Choose the rig on stage">
      {equipment.map((eq) => (
        <button
          key={eq.slug}
          type="button"
          aria-pressed={eq.slug === activeSlug}
          data-testid={`hero-gear-pill-${eq.slug}`}
          onClick={() => onSelect(eq.slug)}
          className={cx(
            'group flex flex-col items-start rounded-2xl border px-3 py-2.5 text-left transition-colors',
            eq.slug === activeSlug ? 'border-ember bg-ember/10' : 'border-white/10 bg-pit hover:border-white/25'
          )}
        >
          <span className="h-1 w-6 rounded-full" style={{ backgroundColor: eq.accentColor }} />
          <span className="mt-2 w-full truncate font-display text-sm font-extrabold uppercase tracking-wide text-bone">{shortName(eq.name)}</span>
          <span className="font-mono text-[10px] text-ash">£{eq.dailyRate}/night</span>
        </button>
      ))}
    </div>
  );
}

export function HeroStagePanel({ equipment, heroItem, onSelectGear, overdrive, onToggleOverdrive, camera, onCamera, onAddToCrate, perf, paused }) {
  return (
    <div>
      <div className="relative">
        <div className="frame-corners relative overflow-hidden rounded-[28px] border border-white/10 bg-void">
          <HeroStage3D
            testId="hero-stage"
            className="h-[340px] sm:h-[460px] lg:h-[540px]"
            modelKey={heroItem.modelKey}
            accentColor={heroItem.accentColor}
            overdrive={overdrive}
            reducedMotion={perf.reducedMotion}
            eco={perf.eco}
            cameraPreset={camera}
            paused={paused}
            webglSupported={perf.webglSupported}
            wraiths={perf.haunting ? (perf.eco ? 1 : 3) : 0}
          />
          <div data-testid="hero-stage-status" className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-void/75 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-bone backdrop-blur">
            <Radio className="h-3.5 w-3.5 animate-pulse text-ember" />
            {!perf.webglSupported ? 'Static stage · 3D unavailable' : overdrive ? 'Surge active' : perf.eco ? 'Eco stage' : 'Live forge stage'}
          </div>
          {perf.webglSupported && (
            <div className="absolute right-5 top-5 z-10">
              <CameraPresetBar value={camera} onChange={onCamera} testIdPrefix="hero-camera" />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-5 right-5 z-10 hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ash sm:flex lg:hidden">
            <RotateCw className="h-3 w-3 text-brass" /> Drag to orbit
          </div>
        </div>

        <div data-testid="hero-active-rig" className="glass mt-4 rounded-3xl border border-white/10 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="overline" style={{ color: heroItem.accentColor }}>
              {heroItem.category}
            </span>
            <span data-testid="hero-active-price" className="font-mono text-sm font-semibold text-bone">
              £{heroItem.dailyRate}
              <span className="text-ash">/night</span>
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-tight text-bone">{heroItem.name}</p>
          <p className="mt-1 text-sm text-ash">{heroItem.metalTagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" data-testid="hero-add-to-crate-button" onClick={() => onAddToCrate(heroItem)}>
              <Plus className="h-4 w-4" /> Add to Crate
            </Button>
            <Button
              size="sm"
              variant={overdrive ? 'spectral' : 'secondary'}
              aria-pressed={overdrive}
              data-testid="hero-test-fire-button"
              onClick={onToggleOverdrive}
            >
              <Zap className="h-4 w-4" /> {overdrive ? 'Overdrive on' : 'Test fire'}
            </Button>
          </div>
        </div>
      </div>
      <GearSwitcher equipment={equipment} activeSlug={heroItem.slug} onSelect={onSelectGear} />
    </div>
  );
}
