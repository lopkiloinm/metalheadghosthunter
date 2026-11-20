import React from 'react';
import { Flame, Package, ScrollText, Skull, Volume2, VolumeX, Zap } from 'lucide-react';

export function Navbar({
  crateCount,
  droneActive,
  onToggleDrone,
  lowPower,
  onToggleLowPower,
  onOpenCrate,
  onOpenBookings,
  backendOnline,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060608]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="#top" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-crimson/50 bg-crimson/15 shadow-crimson transition group-hover:scale-105">
            <Skull className="h-5 w-5 text-crimson" />
          </div>
          <div>
            <div className="font-gothic text-base leading-none tracking-wide text-bone sm:text-lg">
              LLANFAIR SPECTRE FORGE
            </div>
            <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] tracking-widest text-brass">
              <span>LLANFAIRPWLLGWYNGYLL • WALES</span>
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  backendOnline ? 'bg-ecto' : 'bg-amber-400'
                }`}
                title={backendOnline ? 'FastAPI Forge Backend Online' : 'Offline Browser Mode'}
              />
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-widest text-bone/75 lg:flex">
          <a href="#armoury" className="transition hover:text-crimson">
            3D Armoury
          </a>
          <a href="#bundles" className="transition hover:text-crimson">
            Coven Loadouts
          </a>
          <a href="#hotspots" className="transition hover:text-crimson">
            Anglesey Raids
          </a>
          <a href="#field-logs" className="transition hover:text-crimson">
            Field Logs
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleDrone}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider transition ${
              droneActive
                ? 'border-ecto bg-ecto/15 text-ecto shadow-ecto'
                : 'border-white/15 bg-steel/70 text-bone/80 hover:border-crimson/50 hover:text-bone'
            }`}
            title="Toggle 55Hz A1 Sunn O))) Doom Drone Synth"
          >
            {droneActive ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{droneActive ? '55Hz ON' : 'DOOM AMP'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleLowPower}
            className={`hidden items-center gap-1 rounded-lg border px-2.5 py-2 font-mono text-[11px] uppercase tracking-wider transition md:flex ${
              lowPower
                ? 'border-brass/60 bg-brass/15 text-brass'
                : 'border-white/15 bg-steel/70 text-bone/70 hover:text-bone'
            }`}
            title="Toggle Post-Processing Bloom for Low-Power Devices"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{lowPower ? 'ECO 3D' : 'ULTRA 3D'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenBookings}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-steel/70 px-2.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-bone/85 transition hover:border-brass hover:text-brass"
            title="Look up your forged rental booking manifests"
          >
            <ScrollText className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Manifests</span>
          </button>

          <button
            type="button"
            onClick={onOpenCrate}
            className="relative flex items-center gap-2 rounded-lg border border-crimson bg-crimson px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-crimson transition hover:bg-[#ff4260]"
          >
            <Package className="h-4 w-4" />
            <span>Crate</span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded bg-black/40 px-1.5 font-mono text-[11px]">
              {crateCount}
            </span>
          </button>
        </div>
      </div>

      {/* Subtle ticker bar celebrating the legendary 58-letter Welsh village */}
      <div className="overflow-hidden border-t border-white/5 bg-[#0a0b0f] px-3 py-1 text-center font-mono text-[10px] tracking-[0.14em] text-bone/60">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 truncate">
          <Flame className="h-3 w-3 shrink-0 text-crimson" />
          <span className="truncate">
            FORGE BUNKER OPEN UNTIL 03:33 GMT • LLANFAIRPWLLGWYNGYLLGOGERYCHWYRNDROBWLLLLANTYSILIOGOGOGOCH
          </span>
          <Flame className="h-3 w-3 shrink-0 text-crimson" />
        </div>
      </div>
    </header>
  );
}
