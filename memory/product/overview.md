# Requirements: Llanfair Spectre Forge (hackathon polish)

Existing repo: lopkiloinm/metalheadghosthunter. React 18 + Vite + Tailwind + three.js/R3F frontend (`/app/frontend`), FastAPI + Mongo backend (`/app/backend/server.py`, with in-memory fallback).

## Core Value
A doom-metal ghost-hunting gear rental experience for Llanfairpwllgwyngyll (Anglesey). The visuals should impress judges, the rental flow should feel effortless, and live You.com "Spectre Intel" should tie the gear to real haunted lore.

## Personas & Roles
- **Ghost hunter / visitor** (no login): browses gear, inspects 3D models, builds a rental crate, books, plans raids, reads and posts field logs, and searches live intel.
- **Hackathon judge**: has about a 2-minute demo, on a laptop or phone.

## Features
| id | feature | persona | phase |
|---|---|---|---|
| F-1 | Bold redesign in the same doom-metal theme: new typography, layout, motion and a cohesive design system | visitor/judge | 1 |
| F-2 | Hero 3D stage + gear inspector refined to a "wow" level, with an adaptive performance/Eco mode | judge | 1 |
| F-3 | Smooth rental flow: catalog → inspect → add to crate → dates → book → My Bookings, with clear feedback | visitor | 1 |
| F-4 | Bundles, Haunted Raid Planner and Field Logs restyled into one story-driven page narrative | visitor | 1 |
| F-5 | Fully responsive (phone, tablet, desktop) | all | 1 |
| F-6 | Clean, well-structured code: split monolith files, fix the broken SharedCatalogCanvas reference, consistent components | judge (code review) | 1 |
| F-7 | Spectre Intel: live You.com search for haunted lore/news about a hotspot or a typed location, shown as eerie "dossier" cards with sources | visitor | 2 |
| F-9 | Illustrated doom-metal overview map of Llanfairpwllgwyngyll (stylised SVG) with annotated hotspots, forge and routes | visitor/judge | 2 |
| F-10 | Real interactive dark map (Leaflet + free dark OSM/CARTO tiles, no key) with hotspot markers + lore popups + Investigate, forge pickup marker, walking routes | visitor | 2 |
| F-11 | Live field-log sightings pinned on the interactive map; new logs can carry a location | visitor | 2 |
| F-12 | Ghosts: 3D spectral wraiths in the hero + inspector, 2D cursor-reactive apparitions across sections, rare surprise apparitions (silent, classy) | visitor/judge | 3 |
| F-13 | Metal identity: album-cover chapter art, band-logo-style chapter titles, gear presented as an album tracklist (track names + runtimes) | visitor/judge | 3 |
| F-14 | Heavier reactive synth: a riff/drone that responds to Test Fire | visitor | 3 |
| F-15 | Fun interactions: devil-horns cursor, subtle headbang shake on add-to-crate, gig-ticket style booking pass | visitor | 3 |
| F-8 | Intel tied into gear: suggests matching gear for the searched haunt (rule-based from the result keywords, no LLM) | visitor | 2 |

## Phases
- **Phase 1**: Redesign, UX polish, responsiveness and code cleanup. Delivers F-1 to F-6. Docs: [phase1/requirement.md](phase1/requirement.md), [phase1/journeys.md](phase1/journeys.md)
- **Phase 2**: Spectre Intel via You.com Search API. Delivers F-7 and F-8.

## UI/UX Rules
- Keep the doom-metal / forge / spectral theme. Full redesign is allowed: new display + body fonts, new layout grid, scroll-driven motion and micro-interactions.
- Dark only. High contrast and readable body text (WCAG AA).
- Motion respects `prefers-reduced-motion`. 3D degrades gracefully (Eco mode, and auto low-power on weak devices and mobile).
- The audio synth stays muted by default.
- No emoji icons. Use lucide or custom SVG.

## Integrations
- **You.com Search API** (user's own key, `YDC_API_KEY` in backend .env). POST `https://ydc-index.io/v1/search`, header `X-API-Key`. Called server-side only. Phase 2.
- No LLM or auth.

## Edge Cases
- Backend or Mongo down → the existing local fallbacks keep the app usable.
- You.com failure, timeout or no results → a themed error/empty state. The app must never crash.
- WebGL unavailable → static fallback visuals.
- Booking with no dates or an empty crate → blocked, with a clear message.

## Seed Data
Keep the existing seed: 6 equipment items, bundles, hotspots and sightings in server.py and equipmentCatalog.js. Copy can be refined; the item count stays the same.
