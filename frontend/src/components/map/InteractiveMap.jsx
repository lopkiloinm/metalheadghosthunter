import React, { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { MAP_CENTER, sightingOffsets } from './geo';
import { SigilSvg } from './MapSigil';
import { ForgePopup, HotspotPopup, SightingPopup } from './MapPopups';

import { TILE_PROXY_URL, fetchMapStatus } from '../../services/api';

// CARTO dark_all via our backend proxy (key stays server-side). Esri keyless dark canvas is the fallback.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const SOURCES = {
  carto: { base: TILE_PROXY_URL, attribution: `${OSM} &copy; <a href="https://carto.com/attributions">CARTO</a>` },
  esri: {
    base: `${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    labels: `${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
    attribution: `Tiles &copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin &middot; ${OSM}`,
  },
};

function useTileSource() {
  const [source, setSource] = useState('carto');
  const errors = useRef(0);
  useEffect(() => {
    fetchMapStatus().then((s) => s?.source === 'esri-fallback' && setSource('esri'));
  }, []);
  // Three consecutive tile failures mean the proxy is unreachable: switch to keyless Esri tiles.
  const onTileError = () => {
    errors.current += 1;
    if (errors.current >= 3) setSource('esri');
  };
  const onTileLoad = () => {
    errors.current = 0;
  };
  return { source, tiles: SOURCES[source], onTileError, onTileLoad };
}

const iconCache = new Map();
function sigilIcon(type, label = '', dx = 0, dy = 0, size = 40) {
  const key = `${type}|${label}|${dx}|${dy}|${size}`;
  if (!iconCache.has(key)) {
    iconCache.set(
      key,
      L.divIcon({
        className: 'sigil-icon',
        html: renderToStaticMarkup(<SigilSvg type={type} label={label || undefined} size={size} />),
        iconSize: [size, size],
        iconAnchor: [size / 2 - dx, size / 2 - dy],
        popupAnchor: [dx, dy - size / 2],
      })
    );
  }
  return iconCache.get(key);
}

// Wheel zoom (and touch drag) only once the user deliberately engages the map.
function EngageControl({ engaged, setEngaged, picking, onPick }) {
  const map = useMap();
  useEffect(() => {
    if (engaged) {
      map.scrollWheelZoom.enable();
      map.dragging.enable();
    } else {
      map.scrollWheelZoom.disable();
      if (L.Browser.mobile) map.dragging.disable();
    }
  }, [engaged, map]);
  useMapEvents({
    click(e) {
      if (picking) onPick({ lat: +e.latlng.lat.toFixed(5), lng: +e.latlng.lng.toFixed(5) });
      setEngaged(true);
    },
    focus: () => setEngaged(true),
    mouseout: () => !L.Browser.mobile && setEngaged(false),
  });
  return null;
}

function FitAll({ hotspots }) {
  const map = useMap();
  useEffect(() => {
    if (hotspots.length) map.fitBounds(L.latLngBounds(hotspots.map((h) => [h.lat, h.lng])), { padding: [36, 36], maxZoom: 15 });
  }, [hotspots, map]);
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyToBounds(L.latLngBounds(target.path), { padding: [40, 40], duration: 0.8, maxZoom: 16 });
  }, [target, map]);
  return null;
}

export default function InteractiveMap({ hotspots, sightings, forge, routes, layers, focusRoute, picking, pendingPin, onPick, onInvestigate }) {
  const [engaged, setEngaged] = useState(false);
  const { source, tiles, onTileError, onTileLoad } = useTileSource();
  const fanned = useMemo(() => sightingOffsets(sightings, hotspots), [sightings, hotspots]);

  return (
    <div className={`forge-map relative h-full w-full ${picking ? 'picking' : ''}`} data-testid="interactive-map" data-tile-source={source}>
      <MapContainer center={MAP_CENTER} zoom={14} minZoom={12} maxZoom={18} scrollWheelZoom={false} dragging={!L.Browser.mobile} className="h-full w-full" attributionControl>
        <TileLayer key={source} url={tiles.base} attribution={tiles.attribution} maxNativeZoom={source === 'carto' ? 18 : 16} eventHandlers={{ tileerror: onTileError, tileload: onTileLoad }} />
        {tiles.labels && <TileLayer url={tiles.labels} maxNativeZoom={16} opacity={0.85} />}
        <EngageControl engaged={engaged} setEngaged={setEngaged} picking={picking} onPick={onPick} />
        <FitAll hotspots={hotspots} />
        <FlyTo target={focusRoute} />

        {layers.routes &&
          routes.map((r) => (
            <Polyline key={r.id} positions={r.path} pathOptions={{ color: r.color, weight: focusRoute?.id === r.id ? 5 : 3.5, opacity: 0.9, dashArray: '8 7' }}>
              <Tooltip sticky>{`${r.name} · ${r.distanceKm} km · ~${r.walkMinutes} min walk`}</Tooltip>
            </Polyline>
          ))}

        {forge && (
          <Marker position={[forge.lat, forge.lng]} icon={sigilIcon('forge', '', 26, 26, 36)} zIndexOffset={900} title="The Forge">
            <Popup>
              <ForgePopup forge={forge} />
            </Popup>
          </Marker>
        )}

        {layers.hotspots &&
          hotspots.map((h, i) => (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={sigilIcon('hotspot', String(i + 1))} zIndexOffset={800} title={h.name}>
              <Tooltip direction="top" offset={[0, -18]}>{h.name}</Tooltip>
              <Popup>
                <HotspotPopup spot={h} onInvestigate={onInvestigate} />
              </Popup>
            </Marker>
          ))}

        {layers.sightings &&
          fanned.map(({ sighting, dx, dy }) => (
            <Marker key={sighting.id} position={[sighting.lat, sighting.lng]} icon={sigilIcon('sighting', '', dx, dy, 30)} title={`Sighting by ${sighting.hunterName}`}>
              <Popup>
                <SightingPopup log={sighting} />
              </Popup>
            </Marker>
          ))}

        {pendingPin && <Marker position={[pendingPin.lat, pendingPin.lng]} icon={sigilIcon('sighting', '', 0, 0, 34)} />}
      </MapContainer>

      {!engaged && (
        <button
          type="button"
          data-testid="map-engage-button"
          onClick={() => setEngaged(true)}
          className="absolute bottom-8 left-1/2 z-[500] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-void/85 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-bone backdrop-blur-md"
        >
          {L.Browser.mobile ? 'Tap to explore the map' : 'Click to enable scroll zoom'}
        </button>
      )}
      {engaged && L.Browser.mobile && (
        <button
          type="button"
          data-testid="map-release-button"
          onClick={() => setEngaged(false)}
          className="absolute bottom-8 left-1/2 z-[500] -translate-x-1/2 whitespace-nowrap rounded-full border border-ember/50 bg-void/85 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-ember backdrop-blur-md"
        >
          Done · back to scrolling
        </button>
      )}
    </div>
  );
}
