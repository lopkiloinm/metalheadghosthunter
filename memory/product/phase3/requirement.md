# Phase 3: Haunted & Metal makeover
Version: phase-3. See `../overview.md` (F-12 to F-15). Tone: **moody and atmospheric, classy for judges**, not cartoonish and not "dialed to 11".

## Goal
Make the site feel genuinely haunted and unmistakably metal, using ghosts, album-cover art, tracklist gear and reactive sound, while keeping the experience smooth, readable and fast.

## Functional requirements
- REQ-36 [always] The system shall render 3D translucent spectral wraiths (shader-based, cloth/smoke-like, slow drift) in the hero stage.
- REQ-37 [event] When the inspector is open, the system shall show at least one wraith drifting in the background of the model scene.
- REQ-38 [always] The system shall show 2D apparitions that drift through story sections behind the content.
- REQ-39 [event] When the cursor nears a 2D apparition, the system shall make it recoil or fade away (desktop only).
- REQ-40 [event] When the user has been on the page for a random interval (60–150s), the system shall show one rare surprise apparition (a brief silent fade-in/out, max once per interval). (interpreted)
- REQ-41 [unwanted] If a modal, drawer or form input is focused, then the system shall suppress surprise apparitions.
- REQ-42 [optional] Where the "Haunting" toggle in the ⋯ menu is off, the system shall hide all ghosts.
- REQ-43 [state] While prefers-reduced-motion or Eco mode is active, the system shall show static or very reduced ghosts and no surprise apparitions.
- REQ-44 [always] The system shall show album-cover style artwork for each story chapter (generated, dark, stylised, consistent series).
- REQ-45 [always] The system shall render chapter titles in a band-logo style (custom lettering / SVG treatment), with a readable plain-text title kept for accessibility.
- REQ-46 [always] The system shall present the 6 gear items as an album tracklist, with track numbers, a metal "track name", a runtime (e.g. "04:44") and the real product name visible.
- REQ-47 [event] When the user clicks Test Fire with the synth on, the system shall play a heavier riff/drone burst tied to that rig (with distortion and a low end).
- REQ-48 [unwanted] If audio is muted or the AudioContext is blocked, then the system shall stay silent and show no error.
- REQ-49 [always] The system shall keep the synth muted by default.
- REQ-50 [state] While on a pointer device hovering an interactive element, the system shall show a devil-horns cursor.
- REQ-51 [unwanted] If the device is touch-only, then the system shall use the default cursor behaviour.
- REQ-52 [event] When an item is added to the crate, the system shall play a short subtle "headbang" shake on the crate button (no full-page shake).
- REQ-53 [event] When a booking succeeds, the system shall show it as a gig-ticket style pass (perforated stub, booking reference, dates, gear "setlist", barcode-style graphic).
- REQ-54 [always] All existing Phase 1/2 features and data-testids shall keep working.

## Quality requirements
```
Q-11 Tag: Visual.Tone
     Scale: elements judged cartoonish, cheesy or clashing
     Meter: human + screenshots
     Must: 0  Plan: 0
Q-12 Tag: Perf.Smoothness
     Scale: FPS scrolling with ghosts on, on a mid laptop
     Meter: human
     Must: 30  Plan: 55
Q-13 Tag: UX.Readability
     Scale: text blocks obscured by ghosts/art
     Meter: screenshots at 375/1440
     Must: 0  Plan: 0
Q-14 Tag: Perf.Load
     Scale: KB added by chapter art (total, webp)
     Meter: build output
     Must: 900  Plan: 500 (estimate)
```
