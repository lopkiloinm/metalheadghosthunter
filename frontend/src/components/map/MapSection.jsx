import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Crosshair, X } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { Button } from '../ui/Button';
import { IllustratedMap } from './IllustratedMap';
import { MapLegend } from './MapLegend';
import { HotspotKey, LayerToggle, RouteList } from './MapControls';
import { fetchRoutes } from '../../services/api';

const InteractiveMap = lazy(() => import('./InteractiveMap'));

function useNearViewport(ref) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '600px 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [near, ref]);
  return near;
}

const MapLoading = () => (
  <div data-testid="interactive-map-loading" className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-ash">
    Unrolling the live map…
  </div>
);

export function MapSection({ hotspots, sightings, pin, onInvestigate, onPinSighting }) {
  const ref = useRef(null);
  const near = useNearViewport(ref);
  const [geo, setGeo] = useState({ forge: null, routes: [] });
  const [layers, setLayers] = useState({ hotspots: true, routes: true, sightings: true });
  const [focusRoute, setFocusRoute] = useState(null);
  const [picking, setPicking] = useState(false);
  const pinned = hotspots.filter((h) => typeof h.lat === 'number');

  useEffect(() => {
    fetchRoutes().then(setGeo);
  }, []);

  function handlePick(next) {
    setPicking(false);
    onPinSighting(next);
  }

  return (
    <section id="map" ref={ref} data-testid="map-section" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="shell">
        <SectionHeader chapter="IV·II" overline="Map of the Restless" logo="The Restless" title="Charting the restless dead of Llanfairpwll">
          <p>Two charts for one village. The forge-burnt overview reads the land at a glance. The live map walks you from the Forge to every haunt along real footpaths.</p>
        </SectionHeader>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <Reveal className="min-w-0 lg:col-span-8 xl:col-span-9">
            <p className="overline mb-3 text-brass">Overview chart</p>
            <IllustratedMap hotspots={pinned} forge={geo.forge} routes={geo.routes} />
          </Reveal>
          <Reveal delay={100} className="min-w-0 space-y-4 lg:col-span-4 lg:pt-8 xl:col-span-3">
            <HotspotKey hotspots={pinned} onInvestigate={onInvestigate} />
            <MapLegend testId="illustrated-map-legend" />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <Reveal className="min-w-0 lg:col-span-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="overline text-spectral">Live map</p>
              <LayerToggle layers={layers} onToggle={(k) => setLayers((l) => ({ ...l, [k]: !l[k] }))} />
            </div>
            <div className="relative h-[440px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-pit sm:h-[500px] xl:h-[580px]">
              {near ? (
                <Suspense fallback={<MapLoading />}>
                  <InteractiveMap
                    hotspots={pinned}
                    sightings={sightings}
                    forge={geo.forge}
                    routes={geo.routes}
                    layers={layers}
                    focusRoute={focusRoute}
                    picking={picking}
                    pendingPin={pin}
                    onPick={handlePick}
                    onInvestigate={onInvestigate}
                  />
                </Suspense>
              ) : (
                <MapLoading />
              )}
              {picking && (
                <p data-testid="map-picking-hint" className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 whitespace-nowrap rounded-full border border-spectral/50 bg-void/90 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-spectral">
                  Tap where it appeared
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <Button variant={picking ? 'secondary' : 'spectral'} size="sm" className="shrink-0" data-testid="map-pin-sighting-button" onClick={() => setPicking((p) => !p)}>
                {picking ? <X className="h-4 w-4" /> : <Crosshair className="h-4 w-4" />}
                {picking ? 'Cancel pin' : 'Pin a sighting on the map'}
              </Button>
              <MapLegend testId="interactive-map-legend" compact />
            </div>
          </Reveal>
          <Reveal delay={100} className="min-w-0 lg:col-span-4 lg:pt-10">
            <p className="overline mb-3 text-ember">Walking routes from the Forge</p>
            <RouteList routes={geo.routes} hotspots={pinned} focusId={focusRoute?.id} onFocus={(r) => { setLayers((l) => ({ ...l, routes: true })); setFocusRoute(r); }} />
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-ash">Distances follow OpenStreetMap footpaths and lanes. Times assume 4.8 km/h, so add more if you're carrying the full Coven Rig.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
