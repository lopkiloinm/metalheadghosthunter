import React, { useCallback, useEffect, useState } from 'react';
import { spectralSynth } from './audio/spectralSynth';
import { useCrate } from './hooks/useCrate';
import { useForgeData } from './hooks/useForgeData';
import { usePerformanceMode } from './hooks/usePerformanceMode';
import { useToasts } from './hooks/useToasts';
import { scrollToSection } from './lib/format';
import { Preloader } from './components/layout/Preloader';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/hero/HeroSection';
import { CatalogSection } from './components/catalog/CatalogSection';
import { BundlesSection } from './components/story/BundlesSection';
import { HauntedHotspots } from './components/story/HauntedHotspots';
import { FieldLogs } from './components/story/FieldLogs';
import { IntelSection } from './components/intel/IntelSection';
import { MapSection } from './components/map/MapSection';
import { EquipmentInspectorModal } from './components/inspector/EquipmentInspectorModal';
import { RentalCrateDrawer } from './components/crate/RentalCrateDrawer';
import { BookingsModal } from './components/bookings/BookingsModal';
import { Toaster } from './components/ui/Toaster';

export default function App() {
  const perf = usePerformanceMode();
  const data = useForgeData();
  const crate = useCrate();
  const { toasts, notify, dismiss } = useToasts();

  const [droneActive, setDroneActive] = useState(false);
  const [crateOpen, setCrateOpen] = useState(false);
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [inspectedItem, setInspectedItem] = useState(null);
  const [targetHotspot, setTargetHotspot] = useState('');
  const [intelRequest, setIntelRequest] = useState(null);
  const [logPin, setLogPin] = useState(null);
  const overlayOpen = crateOpen || bookingsOpen || Boolean(inspectedItem);

  useEffect(() => () => spectralSynth.stopDoomDrone(), []);

  const openCrate = useCallback(() => setCrateOpen(true), []);
  const closeCrate = useCallback(() => setCrateOpen(false), []);
  const openBookings = useCallback(() => setBookingsOpen(true), []);
  const closeBookings = useCallback(() => setBookingsOpen(false), []);
  const closeInspector = useCallback(() => setInspectedItem(null), []);

  const addToCrate = useCallback(
    (item) => {
      crate.add(item);
      notify(`${item.name} added to your crate`, { label: 'View', onClick: openCrate });
    },
    [crate, notify, openCrate]
  );

  function loadSlugs(slugs) {
    const bySlug = Object.fromEntries(data.equipment.map((e) => [e.slug, e]));
    crate.addMany(slugs.map((s) => bySlug[s]).filter(Boolean));
  }

  function loadBundle(bundle) {
    loadSlugs(bundle.equipmentSlugs);
    notify(`Loaded ${bundle.name} (${bundle.equipmentSlugs.length} rigs)`);
    openCrate();
  }

  function armHotspot(spot) {
    loadSlugs(spot.recommendedSlugs);
    setTargetHotspot(spot.name);
    notify(`Crate armed for ${spot.name}`);
    openCrate();
  }

  function toggleDrone() {
    const on = spectralSynth.toggleDoomDrone();
    setDroneActive(on);
    notify(on ? '55 Hz doom drone engaged' : 'Doom amp silenced');
  }

  function toggleEco() {
    perf.toggleEco();
    notify(perf.eco ? 'Ultra 3D: full bloom and effects' : 'Eco 3D: lighter effects for smoother frames');
  }

  const goToArmoury = () => scrollToSection('armoury', perf.reducedMotion);

  function investigate(query) {
    setIntelRequest({ query, id: Date.now() });
    scrollToSection('intel', perf.reducedMotion);
  }

  function pinSighting(pin) {
    setLogPin({ ...pin, id: Date.now() });
    notify('Pin dropped. Finish your field report below');
    scrollToSection('field-logs', perf.reducedMotion);
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-void text-bone">
      <Preloader reducedMotion={perf.reducedMotion} />
      <ScrollProgress />
      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[55]" />

      <Navbar
        crateCount={crate.count}
        onOpenCrate={openCrate}
        onOpenBookings={openBookings}
        synth={{ active: droneActive, onToggle: toggleDrone }}
        eco={{ on: perf.eco, isAuto: perf.ecoIsAuto, onToggle: toggleEco }}
        backendOnline={data.online}
      />

      <main>
        <HeroSection equipment={data.equipment} onAddToCrate={addToCrate} onForgeCta={goToArmoury} perf={perf} paused={overlayOpen} soundOn={droneActive} />
        <CatalogSection equipment={data.equipment} crateItems={crate.items} onInspect={setInspectedItem} onAddToCrate={addToCrate} perf={perf} paused={overlayOpen} />
        <BundlesSection bundles={data.bundles} equipment={data.equipment} onLoadBundle={loadBundle} />
        <HauntedHotspots
          hotspots={data.hotspots}
          equipment={data.equipment}
          onArmHotspot={armHotspot}
          onInvestigate={investigate}
        />
        <MapSection hotspots={data.hotspots} sightings={data.sightings} pin={logPin} onInvestigate={investigate} onPinSighting={pinSighting} />
        <IntelSection hotspots={data.hotspots} equipment={data.equipment} request={intelRequest} onAddToCrate={addToCrate} />
        <FieldLogs
          sightings={data.sightings}
          hotspots={data.hotspots}
          equipment={data.equipment}
          pin={logPin}
          onRequestMapPin={() => scrollToSection('map', perf.reducedMotion)}
          onSightingCreated={(s) => {
            data.prependSighting(s);
            setLogPin(null);
            notify('Field report archived at the top of the ledger');
          }}
        />
      </main>

      <Footer backendOnline={data.online} storageMode={data.storageMode} />

      <EquipmentInspectorModal item={inspectedItem} onClose={closeInspector} onAddToCrate={addToCrate} perf={perf} soundOn={droneActive} />
      <RentalCrateDrawer
        open={crateOpen}
        onClose={closeCrate}
        crate={crate}
        addons={data.addons}
        hotspots={data.hotspots}
        targetHotspot={targetHotspot}
        onBooked={(b) => notify(`Booking ${b.bookingCode} forged`)}
        onBrowse={() => {
          closeCrate();
          goToArmoury();
        }}
        onViewBookings={() => {
          closeCrate();
          openBookings();
        }}
      />
      <BookingsModal
        open={bookingsOpen}
        onClose={closeBookings}
        onCancelled={(code) => notify(`Booking ${code} cancelled`)}
        onOpenCrate={() => {
          closeBookings();
          openCrate();
        }}
      />
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
