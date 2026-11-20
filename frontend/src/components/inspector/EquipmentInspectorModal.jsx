import React, { useEffect, useState } from 'react';
import { Disc3, Plus, RotateCw, X, Zap } from 'lucide-react';
import { HeroStage3D } from '../3d/HeroStage3D';
import { CameraPresetBar } from '../hero/HeroStagePanel';
import { Modal } from '../ui/Overlay';
import { Button, IconButton } from '../ui/Button';
import { spectralSynth } from '../../audio/spectralSynth';

export function EquipmentInspectorModal({ item, onClose, onAddToCrate, perf, soundOn }) {
  const [overdrive, setOverdrive] = useState(false);
  const [camera, setCamera] = useState('hero');

  useEffect(() => {
    setOverdrive(false);
    setCamera('hero');
  }, [item?.slug]);

  if (!item) return null;

  function toggleOverdrive() {
    const next = !overdrive;
    setOverdrive(next);
    if (next && soundOn) spectralSynth.playOverdrivePulse(item.modelKey);
  }

  return (
    <Modal open onClose={onClose} labelledBy="inspector-title" testId="inspector-modal" className="max-w-6xl">
      <div className="grid lg:grid-cols-12">
        <div className="relative border-b border-white/[0.06] lg:col-span-7 lg:border-b-0 lg:border-r">
          <HeroStage3D
            testId="inspector-stage"
            className="h-[320px] sm:h-[440px] lg:h-[640px]"
            modelKey={item.modelKey}
            accentColor={item.accentColor}
            overdrive={overdrive}
            reducedMotion={perf.reducedMotion}
            eco={perf.eco}
            cameraPreset={camera}
            webglSupported={perf.webglSupported}
          />
          {perf.webglSupported && (
            <div className="absolute left-4 top-4 z-10">
              <CameraPresetBar value={camera} onChange={setCamera} testIdPrefix="inspector-camera" />
            </div>
          )}
          <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-void/75 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ash backdrop-blur sm:inline-flex">
              <RotateCw className="h-3 w-3 text-brass" /> {perf.webglSupported ? 'Drag to orbit · scroll to zoom' : 'Static view · 3D unavailable'}
            </span>
            <Button size="sm" variant={overdrive ? 'spectral' : 'secondary'} aria-pressed={overdrive} data-testid="inspector-test-fire-button" onClick={toggleOverdrive}>
              <Zap className="h-4 w-4" /> {overdrive ? 'Overdrive on' : item.overdriveLabel || 'Test fire'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col p-6 sm:p-8 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="overline" style={{ color: item.accentColor }}>
                {item.category}
              </span>
              <h2 id="inspector-title" data-testid="inspector-title" className="mt-2 font-display text-3xl font-black uppercase leading-tight tracking-tight text-bone">
                {item.name}
              </h2>
              <p className="mt-1 font-mono text-xs text-brass">{item.subtitle}</p>
            </div>
            <IconButton label="Close inspector" data-testid="inspector-close-button" onClick={onClose}>
              <X className="h-4 w-4" />
            </IconButton>
          </div>

          <p className="mt-5 leading-relaxed text-ash">{item.description}</p>

          <dl data-testid="inspector-specs" className="mt-6 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-void/60 px-4">
            {Object.entries(item.specs || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="font-mono text-xs uppercase tracking-wider text-ash">{k}</dt>
                <dd className="text-right text-bone">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 flex items-center gap-2 text-sm text-brass">
            <Disc3 className="h-4 w-4 shrink-0" aria-hidden="true" /> {item.soundtrackPairing}
          </p>

          <div className="mt-auto border-t border-white/[0.06] pt-6">
            <div className="flex items-baseline justify-between gap-3">
              <p data-testid="inspector-price" className="font-display text-5xl font-black leading-none text-bone">
                £{item.dailyRate}
                <span className="ml-1 font-mono text-xs font-normal text-ash">/ night</span>
              </p>
              <span className="text-right font-mono text-xs text-ash">£{item.deposit} refundable deposit</span>
            </div>
            <Button
              size="lg"
              className="mt-5 w-full"
              data-testid="inspector-add-to-crate-button"
              onClick={() => {
                onAddToCrate(item);
                onClose();
              }}
            >
              <Plus className="h-4 w-4" /> Add to Crate
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
