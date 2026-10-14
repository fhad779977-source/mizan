# FAHAD — DIGITAL CRAFT

Proof-of-quality piece for FAHAD STUDIO. 20 s · 30 fps · 1080×1920 (Reels safe area) + 1920×1080 responsive re-layout.

## Brief
- **Goal:** show that the studio produces design, motion, interface and 3D at a premium level.
- **Audience:** potential collaborators and followers (Reels / Shorts / web).
- **Message:** «نصنع حضورًا» — we craft presence.
- **Assumptions:** no client work, contact details or people; every visual and sound is made in-studio; readable without sound.

## Visual direction
Deep black (#07070A) field, warm white type (#F2EEE6), silver hairlines and metal (#C9CBD0), one ember accent (#E4572E) used only for index numbers, the wordmark dot and interaction feedback. Noto Kufi Arabic 900 for display, IBM Plex Sans Arabic for body, Inter for Latin. Motion: fast-attack / long-settle curve, masks and hairlines instead of fades, 120 BPM pulse.

## Scene breakdown (frames at 30 fps, absolute)
| # | Scene | Frames | Image | Text | Motion | Transition out | Sound |
|---|-------|--------|-------|------|--------|----------------|-------|
| 1 | open · hero-title | 0–95 | Black field, silver horizon hairline | نصنع / حضورًا + WE CRAFT PRESENCE | Hairline draws (0–14), words rise from masks (5–45), Latin tracks in, exit up | Mask wipe up, 12f | whoosh 0s, low impact 0.15s, whoosh 2.85s |
| 2 | principles · type-grid | 84–215 | Construction grid draws; framed window with the site wireframe | تصميم / حركة / تجربة + 01 DESIGN… | Words swap on the beat (1 s) through masks; window border draws, wireframe reveals | Match frame from the window, 18f | ticks on each word, riser into the cut |
| 3 | interface · interface | 198–365 | Original concept site in a phone (browser in 16:9) | من الفكرة إلى الواجهة / FROM WIREFRAME TO INTERFACE | Device settles from a 14° tilt; divider reveals wireframe→interface; page scrolls; pointer taps CTA (frame 132 local) | Angled mask wipe left with hairline edge, 14f | soft impact, whoosh, tick on tap, whoosh out |
| 4 | dimension · three-object | 352–483 | Brushed-metal F monogram on a plinth | عمقٌ يُلمس / DEPTH YOU CAN FEEL | Camera dollies in on an arc; key light sweeps left→right across the bevels; ember fill from behind | Iris, 16f | riser |
| 5 | signature · logo-end | 468–599 | Wordmark lockup | FAHAD. · فهد · DIGITAL CRAFT · استوديو تصميم وحركة | Hairline, letter cascade, Arabic mask reveal, accent dot, 1.5 s hold | — | impact, shimmer; music fades out over 1.6 s |

## Assets
All listed in `assets-registry.json`: OFL fonts, synthesized SFX/music (`npm run gen-audio`), procedural 3D geometry, original UI component (`src/components/ui/StudioSite.tsx`).

## Horizontal version
Same project, `formatId: horizontal`. Layout re-flows via `useLayout()`: title on one line, principles beside the window, browser frame + desktop site layout, 3D object left with text right, lockup in a row. Nothing is stretched or cropped.
