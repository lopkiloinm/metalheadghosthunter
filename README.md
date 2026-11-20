# Llanfair Spectre Forge

**Doom-grade ghost hunting equipment rental web app for metalheads in Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, Anglesey (North Wales).**

Built as an **Emergent.sh-compatible** full-stack repository (`frontend/` React + Three.js/R3F + Tailwind CSS, `backend/` FastAPI + Motor MongoDB).

## Features

- **6 Custom Interactive 3D Equipment Models** (React Three Fiber + Three.js + GLSL Shaders + Post-Processing Bloom & Vignette):
  1. `K-II "DOOMSPIKE" EMF METER` — Studded cast-iron chassis, copper coil, dynamic 5-LED surge pips.
  2. `SBM-7 "NECRO-SWEEP" SPIRIT BOX` — Dual Marshall-style tuning dials, live GLSL OLED radio sweep waveform, 6.35mm guitar amp line-out.
  3. `SLS-X "ABYSSAL RIG" THERMAL & LIDAR` — Cinema cage, ruby germanium thermal optics, flip-out GLSL infrared silhouette monitor.
  4. `REM-POD "IRON MAIDEN" BEACON` — Hexagonal spiked tower, sequential jewel domes, animated GLSL Fresnel electromagnetic halo rings.
  5. `SLS-LASER "PENTAGRID" PROJECTOR` — Billet cooling fins, volumetric 532nm emerald laser cone, rotating matrix dot field.
  6. `EVP-8 "BLACK TAPE" PARABOLIC RIG` — Spinning brushed-steel ferric tape reels, glowing VU meters, smoked-acrylic parabolic dish.
- **Performance & Accessibility**: Capped `dpr={[1, 2]}`, `THREE.InstancedMesh` rising forge embers, shared `<View.Port />` canvas for all 6 catalog cards (keeps active WebGL contexts ≤ 2), Eco 3D toggle, `prefers-reduced-motion` support, and WebGL ErrorBoundary fallback.
- **Optional 55 Hz A1 Doom Drone Synth**: Web Audio API synthesizer + overdrive test-fire sound effects (muted by default).
- **Llanfairpwllgwyngyll Haunted Raid Planner**: Local Anglesey intel (St. Tysilio's Church Island, Marquess of Anglesey's Column, Bryn Celli Ddu, Plas Newydd Foreshore, 58-Letter Station Platform) with one-click crate loading.
- **Full-Stack Rental Crate, Manifests & Field Logs**: FastAPI `/api/*` endpoints backed by MongoDB (`MONGO_URL`) with automatic in-memory fallback for zero-config local development.

## Repository Structure (Emergent.sh Compatible)

```text
metalheadghosthunter/
├── frontend/
│   ├── index.html
│   ├── package.json         # `yarn start` runs on 0.0.0.0:3000; reads REACT_APP_BACKEND_URL
│   ├── vite.config.js       # Supports REACT_APP_ envPrefix + /api proxy
│   ├── .env.example
│   └── src/
│       ├── audio/           # Web Audio Doom Drone synthesizer
│       ├── components/3d/   # 6 procedural 3D models, GLSL shaders, HeroStage3D, SharedCatalogCanvas
│       ├── components/      # UI sections, Crate drawer, Inspector modal, Manifests, Field Logs
│       ├── data/            # Seed/fallback catalog
│       └── services/api.js  # REACT_APP_BACKEND_URL API client
├── backend/
│   ├── server.py            # FastAPI app on 0.0.0.0:8001, all routes prefixed with /api
│   ├── requirements.txt
│   └── .env.example         # MONGO_URL, DB_NAME, CORS_ORIGINS
├── .cursor/skills/          # Installed agent skills (premium-3d-website, you-com)
└── .gitignore               # Excludes .env, node_modules, build artifacts
```

## Importing into Emergent.sh

1. Push this repository to GitHub (private or public).
2. In **Emergent.sh**, start a new job and choose **Import from GitHub** (connect GitHub OAuth or paste your repo URL).
3. Emergent automatically provisions:
   - `frontend/.env` with `REACT_APP_BACKEND_URL`
   - `backend/.env` with `MONGO_URL`
   - Supervisor processes running `frontend` on port `3000` and `backend` on `0.0.0.0:8001`, routing `/api/*` to FastAPI.

## Running Locally

### 1. Backend (FastAPI on port 8001)
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
*(If MongoDB is not running locally, the server automatically falls back to an in-memory store.)*

### 2. Frontend (React + Vite on port 3000)
```bash
cd frontend
yarn install
yarn start
```
Open `http://localhost:3000`.

## API Endpoints (`/api`)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service status, village coordinates, and storage mode |
| `GET` | `/api/equipment` | List all 6 equipment rigs + ritual add-ons |
| `GET` | `/api/equipment/{slug}` | Retrieve a single instrument's specs |
| `GET` | `/api/bundles` | Pre-forged heavy metal loadout bundles |
| `GET` | `/api/hotspots` | Haunted raid zones around Llanfairpwllgwyngyll |
| `GET` | `/api/bookings` | List/filter rental manifests (`?code=` or `?email=`) |
| `POST` | `/api/bookings` | Forge a new rental booking manifest (with 15% 3+ night Riff Lord discount) |
| `DELETE` | `/api/bookings/{booking_code}` | Cancel a booking manifest |
| `GET` | `/api/sightings` | Community Anglesey haunting field logs |
| `POST` | `/api/sightings` | Publish a new haunting field report |
