import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Flame,
  MapPin,
  Plus,
  Radio,
  RotateCw,
  ShieldCheck,
  Skull,
  Zap,
} from 'lucide-react';
import {
  FALLBACK_ADDONS,
  FALLBACK_BUNDLES,
  FALLBACK_EQUIPMENT,
  FALLBACK_HOTSPOTS,
  FALLBACK_SIGHTINGS,
} from './data/equipmentCatalog';
import { fetchInitialForgeData } from './services/api';
import { spectralSynth } from './audio/spectralSynth';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { HeroStage3D } from './components/3d/HeroStage3D';
import { EquipmentCard } from './components/EquipmentCard';
import { BundlesSection } from './components/BundlesSection';
import { HauntedHotspots } from './components/HauntedHotspots';
import { FieldLogs } from './components/FieldLogs';
import { RentalCrateDrawer } from './components/RentalCrateDrawer';
import { BookingsModal } from './components/BookingsModal';
import { EquipmentInspectorModal } from './components/EquipmentInspectorModal';

const CATEGORIES = ['All', 'EMF & Fields', 'EVP & Audio', 'Optics & Thermal', 'Perimeter Traps'];

export default function App() {
  const appContainerRef = useRef(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [droneActive, setDroneActive] = useState(false);

  const [backendOnline, setBackendOnline] = useState(false);
  const [storageMode, setStorageMode] = useState('loading');
  const [equipment, setEquipment] = useState(FALLBACK_EQUIPMENT);
  const [addons, setAddons] = useState(FALLBACK_ADDONS);
  const [bundles, setBundles] = useState(FALLBACK_BUNDLES);
  const [hotspots, setHotspots] = useState(FALLBACK_HOTSPOTS);
  const [sightings, setSightings] = useState(FALLBACK_SIGHTINGS);

  const [heroSlug, setHeroSlug] = useState('doomspike-emf');
  const [heroOverdrive, setHeroOverdrive] = useState(false);
  const [heroCamera, setHeroCamera] = useState('hero');
  const [activeCategory, setActiveCategory] = useState('All');

  const [crateItems, setCrateItems] = useState([]);
  const [crateOpen, setCrateOpen] = useState(false);
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [inspectedItem, setInspectedItem] = useState(null);
  const [defaultHotspot, setDefaultHotspot] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mq?.matches) setReducedMotion(true);

    fetchInitialForgeData().then((data) => {
      setBackendOnline(data.online);
      setStorageMode(data.storageMode);
      setEquipment(data.equipment);
      setAddons(data.addons);
      setBundles(data.bundles);
      setHotspots(data.hotspots);
      setSightings(data.sightings);
    });

    return () => {
      spectralSynth.stopDoomDrone();
    };
  }, []);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(window.__forgeToastTimer);
    window.__forgeToastTimer = setTimeout(() => setToast(null), 3200);
  }

  const heroItem = useMemo(
    () => equipment.find((e) => e.slug === heroSlug) || equipment[0],
    [equipment, heroSlug]
  );

  const filteredEquipment = useMemo(() => {
    if (activeCategory === 'All') return equipment;
    return equipment.filter((item) => item.category === activeCategory);
  }, [equipment, activeCategory]);

  const crateCount = useMemo(
    () => crateItems.reduce((sum, entry) => sum + entry.quantity, 0),
    [crateItems]
  );

  function addItemToCrate(item, silent = false) {
    setCrateItems((prev) => {
      const existing = prev.find((c) => c.item.slug === item.slug);
      if (existing) {
        return prev.map((c) =>
          c.item.slug === item.slug ? { ...c, quantity: Math.min(10, c.quantity + 1) } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    if (!silent) showToast(`Added ${item.name} to Iron Crate`);
  }

  function updateCrateQty(slug, nextQty) {
    if (nextQty <= 0) {
      setCrateItems((prev) => prev.filter((c) => c.item.slug !== slug));
      return;
    }
    setCrateItems((prev) =>
      prev.map((c) => (c.item.slug === slug ? { ...c, quantity: Math.min(10, nextQty) } : c))
    );
  }

  function removeCrateItem(slug) {
    setCrateItems((prev) => prev.filter((c) => c.item.slug !== slug));
  }

  function loadBundleToCrate(bundle) {
    const eqBySlug = Object.fromEntries(equipment.map((e) => [e.slug, e]));
    bundle.equipmentSlugs.forEach((slug) => {
      if (eqBySlug[slug]) addItemToCrate(eqBySlug[slug], true);
    });
    showToast(`Loaded "${bundle.name}" (${bundle.equipmentSlugs.length} instruments)`);
    setCrateOpen(true);
  }

  function loadHotspotRig(spot) {
    const eqBySlug = Object.fromEntries(equipment.map((e) => [e.slug, e]));
    spot.recommendedSlugs.forEach((slug) => {
      if (eqBySlug[slug]) addItemToCrate(eqBySlug[slug], true);
    });
    setDefaultHotspot(spot.name);
    showToast(`Armed crate for ${spot.name}`);
    setCrateOpen(true);
  }

  function handleToggleDrone() {
    const active = spectralSynth.toggleDoomDrone();
    setDroneActive(active);
    showToast(active ? '55Hz A1 Sunn O))) Doom Drone Engaged' : 'Doom Amp Silenced');
  }

  function handleHeroOverdrive() {
    const next = !heroOverdrive;
    setHeroOverdrive(next);
    if (next) spectralSynth.playOverdrivePulse(heroItem.modelKey);
  }

  return (
    <div id="top" ref={appContainerRef} className="relative min-h-screen bg-[#060608] text-bone">
      <Preloader reducedMotion={reducedMotion} />

      <Navbar
        crateCount={crateCount}
        droneActive={droneActive}
        onToggleDrone={handleToggleDrone}
        lowPower={lowPower}
        onToggleLowPower={() => setLowPower((p) => !p)}
        onOpenCrate={() => setCrateOpen(true)}
        onOpenBookings={() => setBookingsOpen(true)}
        backendOnline={backendOnline}
      />

      {/* ====================================================================
          HERO: FULL-BLEED INTERACTIVE 3D ARMORY STAGE
         ==================================================================== */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />

        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-12 lg:py-14">
          {/* Left Copy & Controls */}
          <div className="relative z-20 min-w-0 lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-crimson/40 bg-crimson/10 px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-crimson">
              <MapPin className="h-3.5 w-3.5" />
              <span>Llanfairpwllgwyngyll • Anglesey, Wales</span>
            </div>

            <h1 className="mt-5 font-gothic text-4xl leading-[1.08] tracking-wide text-bone sm:text-5xl xl:text-[3.4rem]">
              HUNT THE ABYSS AT{' '}
              <span className="bg-gradient-to-r from-crimson via-[#ff6b4a] to-brass bg-clip-text text-transparent">
                FULL VOLUME
              </span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-bone/75">
              Doom-grade paranormal &amp; ghost hunting equipment rentals built for metalheads
              raiding <strong className="text-bone">Llanfairpwllgwyngyll</strong>, Church Island,
              and Bryn Celli Ddu. Every instrument features live interactive 3D inspection,
              amp-ready EVP jacks, and pickup until 03:33 GMT.
            </p>

            {/* Active Hero Instrument Mini-Spec */}
            {heroItem && (
              <div className="forge-card mt-6 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brass">
                    ACTIVE 3D RIG ON STAGE
                  </span>
                  <span className="font-mono text-xs font-bold text-ecto">
                    £{heroItem.dailyRate}/night
                  </span>
                </div>
                <div className="mt-1 font-display text-lg font-bold text-bone">{heroItem.name}</div>
                <p className="mt-1 text-xs text-bone/65">{heroItem.metalTagline}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addItemToCrate(heroItem)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-crimson px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-crimson transition hover:bg-[#ff4260]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Rent This Rig</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleHeroOverdrive}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                      heroOverdrive
                        ? 'border-ecto bg-ecto text-black shadow-ecto'
                        : 'border-brass/60 bg-brass/10 text-brass hover:bg-brass hover:text-black'
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>{heroOverdrive ? 'OVERDRIVE ON' : 'TEST FIRE'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-5 font-mono text-xs text-bone/60">
              <a
                href="#armoury"
                className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-bone transition hover:text-crimson"
              >
                <span>Browse All 6 3D Models</span>
                <ChevronRight className="h-4 w-4 text-crimson" />
              </a>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-ecto" />
                IP65 Welsh Storm Tested
              </span>
            </div>
          </div>

          {/* Right Interactive 3D Stage */}
          <div className="relative z-20 min-w-0 lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#07070a] shadow-2xl">
              <HeroStage3D
                modelKey={heroItem?.modelKey || 'emf'}
                accentColor={heroItem?.accentColor || '#ff2a4b'}
                overdrive={heroOverdrive}
                reducedMotion={reducedMotion}
                lowPower={lowPower}
                cameraPreset={heroCamera}
              />

              {/* Top-left telemetry badge */}
              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 font-mono text-[10px] tracking-widest text-bone/80 backdrop-blur">
                <Radio className="h-3.5 w-3.5 animate-pulse text-crimson" />
                <span>{heroOverdrive ? '66.6 mG SURGE ACTIVE' : 'LIVE WEBGL FORGE STAGE'}</span>
              </div>

              {/* Top-right camera presets */}
              <div className="absolute right-4 top-4 flex gap-1.5">
                {[
                  ['hero', '3/4'],
                  ['close', 'ZOOM'],
                  ['top', 'TOP'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setHeroCamera(key)}
                    className={`rounded border px-2 py-1 font-mono text-[10px] font-semibold uppercase backdrop-blur transition ${
                      heroCamera === key
                        ? 'border-crimson bg-crimson/25 text-white'
                        : 'border-white/15 bg-black/65 text-bone/70 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Bottom drag hint */}
              <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-1.5 rounded bg-black/70 px-2.5 py-1 font-mono text-[10px] text-bone/65 backdrop-blur">
                <RotateCw className="h-3 w-3 text-brass" />
                <span>Drag to rotate 360° • Scroll to zoom</span>
              </div>
            </div>

            {/* 6-Equipment Quick Switcher Pills under the 3D Hero */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {equipment.map((eq) => {
                const selected = eq.slug === heroSlug;
                return (
                  <button
                    key={eq.slug}
                    type="button"
                    onClick={() => {
                      setHeroSlug(eq.slug);
                      setHeroOverdrive(false);
                    }}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left font-mono text-[11px] transition ${
                      selected
                        ? 'border-crimson bg-crimson/15 text-white shadow-crimson'
                        : 'border-white/10 bg-iron/80 text-bone/70 hover:border-white/25 hover:text-bone'
                    }`}
                  >
                    <span className="truncate font-semibold">{eq.name.split('"')[1] || eq.name}</span>
                    <span className="ml-2 shrink-0 text-[10px] text-brass">£{eq.dailyRate}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3D EQUIPMENT CATALOG (ALL 6 INSTRUMENTS WITH LIVE 3D MODELS)
         ==================================================================== */}
      <section id="armoury" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-crimson">
              // INTERACTIVE 3D PARANORMAL ARSENAL
            </p>
            <h2 className="mt-2 font-gothic text-3xl text-bone sm:text-4xl">
              THE SPECTRAL ARMOURY
            </h2>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
                  activeCategory === cat
                    ? 'border-crimson bg-crimson text-white shadow-crimson'
                    : 'border-white/15 bg-iron text-bone/70 hover:border-white/30 hover:text-bone'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((item) => {
            const crateEntry = crateItems.find((c) => c.item.slug === item.slug);
            return (
              <EquipmentCard
                key={item.slug}
                item={item}
                reducedMotion={reducedMotion}
                onInspect={(eq) => setInspectedItem(eq)}
                onAddToCrate={addItemToCrate}
                inCrateQty={crateEntry?.quantity || 0}
              />
            );
          })}
        </div>
      </section>

      {/* Heavy Metal Loadout Bundles */}
      <BundlesSection
        bundles={bundles}
        equipment={equipment}
        onLoadBundle={loadBundleToCrate}
      />

      {/* Llanfairpwllgwyngyll & Anglesey Haunted Raid Planner */}
      <HauntedHotspots
        hotspots={hotspots}
        equipment={equipment}
        onLoadHotspotRig={loadHotspotRig}
      />

      {/* Community Haunting Field Logs */}
      <FieldLogs
        sightings={sightings}
        hotspots={hotspots}
        equipment={equipment}
        onSightingCreated={(created) => {
          setSightings((prev) => [created, ...prev]);
          showToast('Field report archived to the Llanfair Spectre Forge!');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#040406] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:px-6 md:flex-row md:text-left">
          <div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <Skull className="h-5 w-5 text-crimson" />
              <span className="font-gothic text-lg text-bone">LLANFAIR SPECTRE FORGE</span>
            </div>
            <p className="mt-1 font-mono text-xs text-bone/55">
              Bunker Unit 6, Behind Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch
              Station, Anglesey LL61 5UJ
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 font-mono text-[11px] text-bone/50 md:items-end">
            <span className="inline-flex items-center gap-1.5 text-brass">
              <Flame className="h-3.5 w-3.5 text-crimson" />
              Backend Mode: {backendOnline ? `FastAPI (${storageMode})` : 'Browser Fallback'}
            </span>
            <span>Stay Heavy. Respect the Dead. Return Gear Before Sunrise.</span>
          </div>
        </div>
      </footer>

      {/* Overlays & Modals */}
      <RentalCrateDrawer
        open={crateOpen}
        onClose={() => setCrateOpen(false)}
        crateItems={crateItems}
        addons={addons}
        hotspots={hotspots}
        defaultHotspot={defaultHotspot}
        onUpdateQty={updateCrateQty}
        onRemoveItem={removeCrateItem}
        onClearCrate={() => setCrateItems([])}
        onBookingConfirmed={(booking) => showToast(`Manifest ${booking.bookingCode} forged!`)}
      />

      <BookingsModal open={bookingsOpen} onClose={() => setBookingsOpen(false)} />

      <EquipmentInspectorModal
        item={inspectedItem}
        onClose={() => setInspectedItem(null)}
        onAddToCrate={addItemToCrate}
        reducedMotion={reducedMotion}
        lowPower={lowPower}
      />

      {/* Floating Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-xl border border-crimson/60 bg-[#0d0e14]/95 px-4 py-3 font-mono text-xs text-bone shadow-crimson backdrop-blur"
        >
          <Flame className="h-4 w-4 text-crimson" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
