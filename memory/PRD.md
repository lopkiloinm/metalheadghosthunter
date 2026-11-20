# Llanfair Spectre Forge — PRD

## Original problem statement
Doom-metal ghost-hunting gear-rental web app for Llanfairpwllgwyngyll (Anglesey). Phase 1: dark doom-metal redesign, wow 3D hero/inspector (Eco mode, WebGL fallback, muted synth), full rental flow, responsive, code split. Phase 2: Spectre Intel (You.com live search). Extra user requests: assembled 3D models, hero non-overlap at desktop widths, camera presets that don't fight drag, annotated maps (illustrated SVG + interactive Leaflet), CARTO key tile proxy.

## Architecture
- Frontend: React 18 + Vite + Tailwind + R3F/three + react-leaflet (lazy). Local fallbacks for data/bookings/sightings/routes.
- Backend: FastAPI + Motor (in-memory fallback). Routers: catalog (health, equipment, bundles, hotspots, routes), bookings, sightings, intel (You.com, 10-min cache), map_tiles (CARTO proxy + Esri fallback).
- Secrets (backend env only): YDC_API_KEY, CARTO_API_KEY. No auth.

## Implemented
- 2026-11 Phase 1: redesign, 3D stage/inspector, crate/booking/discount/cancel, field logs, responsive. Root E2E passed.
- 2026-11 Phase 2: POST /api/intel/search, Intel chapter, quick picks, states, Investigate from Raid Planner/map, recommended gear to crate.
- 2026-11 3D fixes: Pentagrid tripod hub/collar + grounded legs, thermal cage braces/base plate/monitor hinge, EVP dish arm + grip, spirit-box antenna ferrule, EMF strap loop, REM-pod grounded.
- 2026-11 Hero grid: stage never overlapped at 1440/1680/1920/2560; 375/768 intact.
- 2026-11 CameraRig: glide once, cancel on OrbitControls 'start', sync target/position; verified mouse + touch.
- 2026-11 Map of the Restless: illustrated SVG chart + live Leaflet map, real lat/lng, OSRM-precomputed routes (GET /api/routes), layer toggles, legend, sighting pins (hotspot or map tap), no scroll hijack.
- 2026-11 CARTO tile proxy GET /api/map/tiles/{z}/{x}/{y}.png with key validation, LRU, Esri fallback; GET /api/map/status.

## Testing
iteration_1..4 reports; backend 45/45 pytest.

## Backlog
- P1: Map marker clustering for many sightings; offline-ready map tiles
- P2: Route elevation profiles; printable raid map; vector CARTO basemap
