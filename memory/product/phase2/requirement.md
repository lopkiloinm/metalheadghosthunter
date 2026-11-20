# Phase 2: Spectre Intel (You.com live search)
Version: phase-2. See `../overview.md` (F-7, F-8). Builds on the Phase 1 design system and the Raid Planner.

## Goal
Let hunters pull live, real-world haunted lore and news for any place or hotspot via the You.com Search API. Results appear as themed dossier cards with sources, and each dossier suggests matching gear that can be added to the crate in one tap.

## Functional requirements
- REQ-22 [always] The system shall provide a "Spectre Intel" section (a new story chapter after the Raid Planner) with a search input, the placeholder "Name a haunt… e.g. Beaumaris Gaol", and a "Summon Intel" button.
- REQ-23 [event] When the user submits a query, the system shall call the backend `POST /api/intel/search`, which calls You.com `POST https://ydc-index.io/v1/search` server-side with header `X-API-Key: $YDC_API_KEY`. The query is augmented with ghost/haunted/paranormal context. (interpreted)
- REQ-24 [event] When results return, the system shall show up to 6 dossier cards, each with a title, snippet, source domain and a link opening in a new tab.
- REQ-25 [state] While a search is in flight, the system shall show a themed loading state and disable the button.
- REQ-26 [unwanted] If You.com errors, times out (>12s) or the key is missing, then the system shall show "The spirits are silent. Try again shortly." with a retry button and no crash.
- REQ-27 [unwanted] If there are zero results, then the system shall show "No echoes found for this place." with suggested hotspot chips.
- REQ-28 [unwanted] If the query is empty or under 2 chars, then the system shall block the submit and show inline validation.
- REQ-29 [event] When the user clicks "Investigate" on a Raid Planner hotspot, the system shall scroll to Spectre Intel and run the search for that hotspot name.
- REQ-30 [always] The system shall show quick-pick chips for 3–4 seeded hotspots under the search input.
- REQ-31 [event] When results return, the system shall show "Recommended Arsenal": 1–3 gear items chosen by keyword rules over the result text (e.g. voice/whisper→EVP rig or spirit box, cold/temperature→thermal rig, light/shadow/apparition→laser projector, electrical/flicker→EMF meter, touch/movement→REM-pod), with a default fallback. (interpreted)
- REQ-32 [event] When the user clicks "Add to Crate" on a recommended item, the system shall add it with the same toast and badge behavior as Phase 1.
- REQ-33 [always] The backend shall cache identical queries for 10 minutes to save API quota and speed up demos. (interpreted)
- REQ-34 [always] The API key shall never be sent to or visible in the frontend.
- REQ-35 [always] The backend shall return a normalized shape: `{query, results:[{title, url, snippet, source}], recommended:[slug], cached:bool}`.

## Quality requirements
```
Q-7  Tag: Perf.IntelLatency
     Scale: seconds from submit to cards rendered (uncached)
     Meter: browser test, 3 runs
     Must: 10  Plan: 4 (estimate)
Q-8  Tag: Trust.Relevance
     Scale: share of results for "Beaumaris Gaol" that mention the place or haunting
     Meter: human
     Must: 50%  Plan: 80%
Q-9  Tag: Security.KeyExposure
     Scale: occurrences of the key in frontend bundle or network responses
     Meter: grep build + inspect responses
     Must: 0  Plan: 0
Q-10 Tag: Visual.Dossier
     Scale: cards with overflowing or unstyled text at 375/1440
     Meter: screenshots
     Must: 0  Plan: 0
```
