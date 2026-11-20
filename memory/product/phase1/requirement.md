# Phase 1: Redesign, UX polish, responsive, code cleanup
Version: phase-1. See `../overview.md` (F-1 to F-6).

## Goal
Turn the existing app into a cohesive, hackathon-winning experience with a bold redesign in the same theme, a frictionless rental flow, full responsiveness and clean modular code, without losing any existing feature.

## Functional requirements
- REQ-1 [always] The system shall render a redesigned hero with a 3D gear stage, a headline, and a primary CTA "Forge Your Crate" that scrolls to the catalog.
- REQ-2 [always] The system shall use a new design system (display font + body font, color tokens, spacing scale) applied consistently across all sections. (interpreted)
- REQ-3 [always] The system shall show all 6 equipment items in the catalog, each with name, price per night and an interactive 3D preview.
- REQ-4 [event] When the user opens an item, the system shall show the inspector with a rotatable 3D model, specs and an "Add to Crate" button.
- REQ-5 [unwanted] If WebGL is unavailable, then the system shall show a static themed fallback instead of a blank canvas.
- REQ-6 [event] When the user adds an item to the crate, the system shall increment the crate count badge in the navbar and show a toast confirming the item name.
- REQ-7 [event] When the crate holds items for 3+ nights, the system shall show the 15% multi-night discount line in the total.
- REQ-8 [event] When the user confirms a booking with valid dates and name, the system shall create the booking and show a success state with a booking reference.
- REQ-9 [unwanted] If dates are missing or the end is before the start, then the system shall disable booking and show an inline message.
- REQ-10 [unwanted] If the crate is empty, then the system shall show a themed empty state with a CTA back to the catalog.
- REQ-11 [event] When the user opens My Bookings, the system shall list their bookings with a cancel option.
- REQ-12 [always] The system shall present Bundles, Haunted Raid Planner and Field Logs as restyled sections in a story-like page flow.
- REQ-13 [event] When the user submits a field log, the system shall add it to the top of the list.
- REQ-14 [unwanted] If the field log form is incomplete, then the system shall show inline validation and not submit.
- REQ-15 [always] The system shall be fully usable at 375px, 768px and 1440px widths with no horizontal scroll.
- REQ-16 [state] While on mobile or a low-power device, the system shall enable Eco 3D mode automatically. (interpreted)
- REQ-17 [state] While `prefers-reduced-motion` is set, the system shall disable non-essential animations.
- REQ-18 [always] The system shall keep the drone synth muted by default, with a visible toggle.
- REQ-19 [unwanted] If the backend is unreachable, then the system shall fall back to local data without errors on screen.
- REQ-20 [always] The system shall have modular code: no file over ~300 lines where it can be split sensibly, no dangling references (e.g. SharedCatalogCanvas), and a backend split into routers/models/seed modules. (interpreted)
- REQ-21 [always] The backend shall expose its OpenAPI spec at `/api/openapi.json`.

## Quality requirements
```
Q-1  Tag: Perf.FirstPaint
     Scale: seconds from load to hero visible (preloader done)
     Meter: browser test, 3 runs
     Must: 5  Plan: 2.5 (estimate)
Q-2  Tag: Perf.Smoothness
     Scale: FPS while scrolling the catalog on a mid laptop
     Meter: human
     Must: 30  Plan: 55
Q-3  Tag: Layout.Responsive
     Scale: number of overflow or overlap defects at 375/768/1440
     Meter: screenshots at 3 widths
     Must: 0  Plan: 0
Q-4  Tag: UX.Clarity
     Scale: minutes for a first-time user to book one item unaided
     Meter: human
     Must: 2  Plan: 1
Q-5  Tag: Visual.Quality
     Scale: stretched, blurry, or unstyled elements seen
     Meter: screenshots
     Must: 0  Plan: 0
Q-6  Tag: Reliability.Console
     Scale: uncaught errors in console during the full journey run
     Meter: browser test
     Must: 0  Plan: 0
```
