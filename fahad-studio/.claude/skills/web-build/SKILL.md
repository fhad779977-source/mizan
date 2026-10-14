---
name: web-build
description: Build a website in the FAHAD STUDIO web section (fahad-studio/web, Vite + React + TypeScript + GSAP) from a brief — content file, still composition first, then motion, responsive and accessible. Use after /web-brief or when the user asks to build/modify a site.
---

# /web-build

Work in `fahad-studio/web`. Read `reference/structure.md` first.

1. New site: add `web/<slug>/index.html` + `web/src/sites/<slug>/{main.tsx,App.tsx,content.ts,<slug>.css,sections/}` and register the entry in `web/vite.config.ts`. Copy the FORM site's patterns, not its look.
2. All copy, links, image/video ids live in `content.ts`. Components never hard-code copy.
3. Assets: add sources to `web/assets.config.json`, run `npm run assets` (see `/asset-prepare`). Use `<Picture>` and `<VideoBackground>` from `src/shared/fx`.
4. Still first: build layout, type and imagery with motion off; screenshot 390/768/1440 (`npm run qa` or the dev server) and fix composition before animating.
5. Motion: one engine per site (GSAP + ScrollTrigger via `src/shared/fx/motion.ts`). Use the shared components (`MaskHeadline`, `Reveal`, `Parallax`, `PinnedScene`, `PerspectiveShelf`, `CursorReveal`, `VideoBackground`). Every effect cleans up through `useGsap` / `trackFx`. Rules in `reference/motion-rules.md`.
6. Arabic: whole words/lines only, `dir="rtl"` on the element, Plex Arabic / Kufi Display faces, no letter-spacing on Arabic.
7. `npm run build` (tsc + vite) must pass, then run `/web-review`.
