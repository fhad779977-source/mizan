---
name: web-showreel
description: Produce a 15–20 s video of a real FAHAD STUDIO website using the existing Remotion video section — deterministic browser capture, then a project in projects/ rendered with the standard pipeline. Use when the user wants a site presentation film.
---

# /web-showreel

1. Build the site: `cd web && npm run build`.
2. Capture real footage: edit the scroll plan in `web/scripts/capture-showreel.mjs` (`PLANS`: viewport, seconds, scroll keys), then `npm run capture:showreel`. It drives `?capture=1` (paused GSAP timeline advanced 1/30 s per frame, videos seeked to the same clock) and writes `public/assets/video/<name>.mp4` in the video section.
3. Create/edit `projects/<slug>/project.json` (see `projects/form-showreel/project.json`): `screen-recording` scenes with `media` set to the captured clips (`variant: "phone"` for mobile), brand from the site (fonts may use `instrument-serif`), studio sound kit. Do not modify existing approved templates.
4. From `fahad-studio/`: `npm run check`, `npm run contact-sheet -- <slug>-vertical`, `npm run preview -- <slug>-vertical`, review, then `npm run render -- <slug>-vertical`.
5. Log the captured clips in `assets-registry.json` and report frame counts, LUFS/peak and what was reviewed.
