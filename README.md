# Llanfair Spectre Forge

**Doom-grade ghost hunting gear rentals for metalheads in Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, Anglesey (North Wales).**

A full-stack app with a React 18 + Vite + Tailwind + three.js/R3F frontend and a FastAPI + Motor (MongoDB) backend. If Mongo can't be reached, the backend falls back to an in-memory store. If the backend can't be reached, the frontend falls back to local seed data and localStorage.

## Features

- **Redesigned story-driven page** in six chapters: I Hero forge stage → II Armoury → III Coven Loadouts → IV Haunted Raid Planner → IV·II Map of the Restless → V Spectre Intel → VI Field Logs. It has scroll-driven reveals, a scroll progress bar, film grain and micro-interactions.
- **Design system**: Pirata One is the blackletter font, used for headlines and accents only. Big Shoulders Display is the display font, Atkinson Hyperlegible is the body font and IBM Plex Mono is used for telemetry. Colour tokens (`void`, `pit`, `iron`, `ember`, `spectral`, `brass`, `bone`, `ash`) live in `tailwind.config.js`, and the shared `.btn`, `.card-forge`, `.input-forge`, `.chip` and `.overline` components live in `src/index.css`. The app is dark only, and text meets WCAG AA contrast.
- **Six procedural 3D gear models** (React Three Fiber + GLSL shaders):
  - EMF meter
  - Spirit box
  - Thermal/LiDAR rig
  - REM-Pod
  - Laser grid
  - EVP parabolic rig
- **Hero stage and inspector**: Lightformer studio environment, rotating rune halo, ectoplasm rift floor shader, instanced embers, spectral sparkles, and bloom, chromatic aberration, noise and vignette post-processing. Camera presets glide between angles, and Test Fire triggers an overdrive mode.
- **Adaptive Eco mode**:
  - Turns on automatically below 768px wide, and on low-power devices (≤2 cores, ≤2 GB RAM, or Save-Data enabled).
  - Can be toggled manually.
  - When on, the stage renders at DPR 1, drops post-processing and sparkles, and uses fewer embers.
- **Graceful degradation and accessibility**:
  - If WebGL is unavailable, a static themed fallback replaces the 3D canvas. Add `?webgl=off` to the URL to force it.
  - `prefers-reduced-motion` turns off auto-rotation, reveals and animations.
  - The doom-drone synth is muted by default and has a visible toggle.
- **Rental flow**: Add to Crate shows a toast and bumps the navbar badge. The crate drawer validates the pickup and return dates inline, and the book button stays disabled until they're valid. Bookings of 3+ nights get a 15% discount line. An empty crate shows a CTA back to the catalogue. A successful booking shows its reference, and My Bookings (codes are stored on this device) lists bookings with a cancel button.
- **Spectre Intel (You.com live search)**: search any Anglesey haunt (quick-pick hotspot chips or free text, 2+ characters). The backend queries You.com, caches results for 10 minutes and returns up to 6 sources. Rule-based matching (no LLM) recommends 1-3 rigs, which you can add straight to the crate. Investigate on a Raid Planner dossier scrolls here and runs the search. If the upstream search fails you get a themed error and a retry button. Search results are shown as untrusted evidence.
- **Map of the Restless**:
  - Illustrated overview chart (custom SVG): Menai Strait shoreline, A5/A4080, railway and the 58-letter station sign, the Column, St Mary's Church, Britannia Bridge, a compass rose and a legend. Hotspot sigils show a label on hover or tap, and dashed walking routes are plotted on top.
  - Live Leaflet map (react-leaflet, lazy-loaded when the section is near the viewport): the same sigils for the hotspots (the popup shows lore and dread level, and Investigate opens Spectre Intel), the Forge pickup point and field-log sightings (pulse markers that fan out so they don't overlap). It has Hotspots / Routes / Sightings layer toggles and a route list with distance and walking time. Scroll-wheel zoom turns on only after you click the map, and on touch devices you tap first to pan.
  - Tiles: CARTO `dark_all` comes through the backend proxy `GET /api/map/tiles/{z}/{x}/{y}.png`, which uses `CARTO_API_KEY` server-side (`?key=`). The proxy keeps a 600-tile LRU cache and sends `Cache-Control: public, max-age=86400`. Once every 10 minutes the backend fetches a probe tile and compares it with CARTO's keyless "API KEY REQUIRED" watermark. If the key is missing or rejected, or the upstream fails, the proxy serves Esri World Dark Gray tiles instead (no key needed). Keyless CARTO only returns watermark tiles now, so it can't be the fallback. If the proxy itself can't be reached, Leaflet switches to Esri directly. `GET /api/map/status` reports which source is in use, and the attribution follows it.
  - Walking routes were precomputed once with OSRM foot routing (routing.openstreetmap.de) and are stored in `backend/routes_seed.py`, so the app doesn't call a routing service at runtime.
  - Field logs can take an optional pin: either at the chosen haunt, or tap "Pin a sighting on the map". New pinned logs appear on the live map straight away.
- **Camera control**: a camera preset glides once, then hands control back to OrbitControls. Dragging, zooming or touching cancels the glide straight away.
- **Field logs**: the form validates inline, and new logs appear at the top of the list.
- **Responsive** at 375, 768 and 1440px. On mobile, the menu holds the navigation links, crate, bookings, synth and Eco controls.

## Repository structure

```text
frontend/
├── index.html                # Google Fonts, meta
├── tailwind.config.js        # Design tokens (colours, fonts, shadows, keyframes)
├── vite.config.js            # REACT_APP_ envPrefix, /api dev proxy
└── src/
    ├── App.jsx               # Page composition + overlay orchestration
    ├── index.css             # Design-system component classes, reveal, grain
    ├── audio/spectralSynth.js
    ├── data/equipmentCatalog.js   # Local fallback seed (6 items, bundles, hotspots, sightings)
    ├── services/api.js       # API client + localStorage fallbacks
    ├── hooks/                # useCrate, useForgeData, usePerformanceMode, useToasts
    ├── lib/                  # format, pricing (dates/discount/totals), webgl detection
    └── components/
        ├── ui/               # Button, Overlay (Modal/Drawer), Field, Reveal, SectionHeader, Toaster, ThreatMeter
        ├── layout/           # Navbar, NavControls, MobileMenu, Footer, Preloader, ScrollProgress
        ├── hero/             # HeroSection, HeroStagePanel (camera presets, gear switcher)
        ├── catalog/          # CatalogSection, EquipmentCard
        ├── inspector/        # EquipmentInspectorModal
        ├── crate/            # RentalCrateDrawer, CrateBookingForm, CrateFields, CrateLineItems, CrateSummary, CrateEmptyState, BookingSuccess
        ├── bookings/         # BookingsModal, BookingCard
        ├── map/              # MapSection, IllustratedMap (SVG), InteractiveMap (Leaflet, lazy), MapSigil, MapLegend, MapControls, geo
        ├── intel/            # IntelSection, IntelSearchForm, IntelStates, IntelResults
        ├── story/            # BundlesSection, HauntedHotspots, HotspotDossier, FieldLogs, FieldLogForm, FieldLogCard
        └── 3d/               # HeroStage3D, EquipmentCardViewport, EquipmentModel, CameraRig,
                              # StageAtmosphere, StageEffects, GearFallback, Shaders.js, models/* (parts.jsx = Strut helper)
backend/
├── server.py                 # App wiring, CORS, /api router, OpenAPI at /api/openapi.json
├── routers/                  # catalog.py, bookings.py, sightings.py, intel.py, map_tiles.py
├── intel_service.py          # You.com client, 10-min TTL cache, defensive parsing
├── intel_rules.py            # Keyword → gear-slug recommendation rules
├── models.py                 # Pydantic request/response models
├── pricing.py                # Booking pricing (15% for 3+ nights)
├── storage.py                # Motor client + in-memory fallback
└── seed.py                   # Equipment, bundles, hotspots, add-ons, seed sightings
```

Each catalogue card renders its own `EquipmentCardViewport` canvas, and that canvas only exists while the card is near the viewport.

## Environment

- `backend/.env`: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `YDC_API_KEY` (You.com, backend only), `CARTO_API_KEY` (CARTO basemaps, backend only)
- `frontend/.env`: `REACT_APP_BACKEND_URL`. Leave it empty to use the Vite `/api` proxy locally.

## Running locally

```bash
cd backend && pip install -r requirements.txt && uvicorn server:app --host 0.0.0.0 --port 8001 --reload
cd frontend && yarn install && yarn start   # http://localhost:3000
```

## API (`/api`)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/openapi.json` | OpenAPI spec (Swagger UI at `/api/docs`) |
| `GET` | `/api/health` | Status + storage mode |
| `GET` | `/api/equipment` | 6 rigs + ritual add-ons (`?category=`) |
| `GET` | `/api/equipment/{slug}` | Single rig |
| `GET` | `/api/bundles` | Loadout bundles |
| `GET` | `/api/hotspots` | Haunted raid zones |
| `GET` | `/api/bookings` | Filter by `?code=`, `?codes=A,B` or `?email=` |
| `POST` | `/api/bookings` | Create a booking (`pickupDate`, optional `returnDate` → nights; 15% off at 3+ nights) |
| `DELETE` | `/api/bookings/{booking_code}` | Cancel a booking |
| `GET` | `/api/sightings` | Field logs, newest first |
| `POST` | `/api/sightings` | Publish a field log (optional `hotspotId` or `lat`+`lng` pin) |
| `GET` | `/api/map/status` | Basemap source in use: `{source: carto|esri-fallback, keyConfigured, keyValid}` |
| `GET` | `/api/map/tiles/{z}/{x}/{y}.png` | CARTO dark tile proxy (LRU-cached, Esri fallback) |
| `GET` | `/api/routes` | Forge location + walking routes `{id,name,hotspotIds,color,distanceKm,walkMinutes,path[[lat,lng]]}` |
| `POST` | `/api/intel/search` | `{query}` → `{query, results[≤6]{title,url,snippet,source}, recommended[slug], cached}`. Returns 502 with a friendly message if the upstream search fails |
