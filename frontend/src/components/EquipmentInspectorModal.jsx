import React, { useState } from 'react';
import { Disc3, Flame, Plus, RotateCw, X, Zap } from 'lucide-react';
import { HeroStage3D } from './3d/HeroStage3D';
import { spectralSynth } from '../audio/spectralSynth';

export function EquipmentInspectorModal({
  item,
  onClose,
  onAddToCrate,
  reducedMotion,
  lowPower,
}) {
  const [overdrive, setOverdrive] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('hero');

  if (!item) return null;

  function handleOverdriveToggle() {
    const next = !overdrive;
    setOverdrive(next);
    if (next) spectralSynth.playOverdrivePulse(item.modelKey);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6">
      <div className="grid max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/15 bg-[#08090d] shadow-2xl lg:grid-cols-12">
        {/* Left: Interactive 3D Inspection Stage */}
        <div className="relative border-b border-white/10 lg:col-span-7 lg:border-b-0 lg:border-r">
          <HeroStage3D
            modelKey={item.modelKey}
            accentColor={item.accentColor}
            overdrive={overdrive}
            reducedMotion={reducedMotion}
            lowPower={lowPower}
            cameraPreset={cameraPreset}
            heightClass="h-[340px] sm:h-[440px] lg:h-[560px]"
          />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {['hero', 'close', 'top'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCameraPreset(preset)}
                className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur ${
                  cameraPreset === preset
                    ? 'border-crimson bg-crimson/25 text-white'
                    : 'border-white/15 bg-black/60 text-bone/75 hover:border-white/35'
                }`}
              >
                {preset === 'hero' ? '3/4 Rig' : preset === 'close' ? 'Macro' : 'Overhead'}
              </button>
            ))}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-black/70 px-2.5 py-1 font-mono text-[10px] text-bone/70 backdrop-blur">
              <RotateCw className="h-3 w-3 text-brass" />
              Drag to orbit • Scroll to zoom
            </span>
            <button
              type="button"
              onClick={handleOverdriveToggle}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition ${
                overdrive
                  ? 'border-ecto bg-ecto text-black shadow-ecto'
                  : 'border-crimson bg-crimson/20 text-crimson hover:bg-crimson hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{overdrive ? 'OVERDRIVE ACTIVE' : item.overdriveLabel || 'TEST FIRE'}</span>
            </button>
          </div>
        </div>

        {/* Right: Technical & Metalhead Spec Sheet */}
        <div className="flex flex-col justify-between p-6 lg:col-span-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className="rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    borderColor: `${item.accentColor}66`,
                    color: item.accentColor,
                  }}
                >
                  {item.category}
                </span>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-bone">
                  {item.name}
                </h2>
                <p className="font-mono text-xs text-brass">{item.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/15 p-2 text-bone/70 hover:border-crimson hover:text-white"
                aria-label="Close 3D inspector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-bone/80">{item.description}</p>

            <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-bone/45">
                // FORGED SPECIFICATIONS
              </div>
              {Object.entries(item.specs || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-white/5 pb-1.5 text-xs last:border-none last:pb-0">
                  <span className="font-mono text-bone/55">{k}</span>
                  <span className="text-right font-mono text-bone">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-brass/25 bg-brass/5 px-3 py-2 font-mono text-xs text-brass">
              <Disc3 className="h-4 w-4 shrink-0" />
              <span>Soundtrack Pairing: {item.soundtrackPairing}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-display text-3xl font-black text-bone">
                  £{item.dailyRate}
                </span>
                <span className="ml-1 font-mono text-xs text-bone/55">/ night</span>
              </div>
              <span className="font-mono text-xs text-bone/55">
                Deposit: £{item.deposit} (refundable)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onAddToCrate(item);
                onClose();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-crimson transition hover:bg-[#ff4260]"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Iron Rental Crate</span>
            </button>
            <p className="mt-2 flex items-center justify-center gap-1.5 font-mono text-[10px] text-bone/45">
              <Flame className="h-3 w-3 text-crimson" />
              Same-night pickup in Llanfairpwllgwyngyll until 03:33 GMT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
