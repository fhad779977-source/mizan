# قسم المواقع — Web section

The web section lives in `fahad-studio/web/` as its own npm package (Vite 8.3.1 · React 19.2 · TypeScript 5.9 · GSAP 3.15 + ScrollTrigger · sharp 0.35.5 · Playwright 1.56.1). It shares fonts, sound kit and the Remotion pipeline with the video section, but never its dependencies.

## Run it
From `fahad-studio/`:

```bash
npm run web:install          # once: npm ci inside web/
npm run web:dev              # http://127.0.0.1:5173/        (live dev server)
npm run web:build            # tsc + production build → web/dist/
npm run web:preview          # http://127.0.0.1:4173/        (serves the build)
npm run web:qa               # acceptance checks on the build → web/qa/report.md
npm run web:assets           # assets.config.json → web/public/media (+ manifest, registry)
npm run web:capture-concepts # concept screens → web/assets-src/concepts/*.png
npm run web:capture-showreel # real site footage → public/assets/video/form-*.mp4
```

Pages: `/` index · `/form/` FORM site · `/lab/` interaction lab · `/concepts/` concept screens (capture source, `?id=c01…c05`).

On another machine: Playwright needs a Chromium — either set `FAHAD_BROWSER_GUI=/path/to/chrome` or run `npx playwright install chromium` inside `web/` (one download, ~170 MB). The sites themselves need nothing but a browser.

## Where to edit
| What | File |
|---|---|
| FORM copy, nav, concept projects, method, closing, contact (optional, null = hidden) | `web/src/sites/form/content.ts` |
| FORM identity: colours, type scale, grid, spacing | `web/src/sites/form/form.css` (`:root` tokens at the top) |
| Fonts (local, OFL) | `web/public/fonts/` + `web/src/shared/styles/fonts.css` |
| Images / video used by sites | `web/assets.config.json` → `npm run web:assets` → reference by id |
| Background video (replace) | change `closing.video` id in `content.ts`, or add a new video entry in `assets.config.json` |
| Concept interfaces | `web/src/concepts/C0x*.tsx` → `npm run web:capture-concepts` → `npm run web:assets` |
| Horizon loop | Remotion composition `web-horizon-loop` (`src/compositions/HorizonLoop.tsx`) → render to `web/assets-src/video/horizon.mp4` → `npm run web:assets` |
| Reusable effects | `web/src/shared/fx/` (see `/lab/`) |

## How a site is made (workflow)
`/web-brief` → `/web-build` → `/web-review` → `/asset-prepare` as needed → `/web-showreel`. Skill details live in `.claude/skills/web-*/` with references in each `reference/` folder.

## FORM — Independent Digital Atelier (proof site)
- Idea: a gallery of interfaces in depth that turns into a body of work as you scroll.
- Type: Instrument Serif (display, italic accents) · Instrument Sans (text) · JetBrains Mono (labels) · IBM Plex Sans Arabic / Noto Kufi Arabic (Arabic lines).
- Colour: ink #0A0A0B, ivory #EFEAE0, silver #B9BCC2, one signal blue #8EA2FF taken from the horizon light.
- Sections: header · hero + pinned gallery (shelf → wall → walk) · rail (phones / reduced motion) · concept index + five detail strips · method · closing over the horizon loop with an on-device brief composer · footer.
- Asset choices: concept screens = stills (crisp, tiny AVIF, no runtime cost); shelf/wall = CSS 3D (crisp type, no WebGL); horizon = looping video (cinematic, fixed viewpoint — real-time 3D would add nothing but cost); no people imagery.
- Honest content: all five projects are labelled Concept Projects; no clients, results, awards, testimonials or contact details; the brief composer copies text locally and says nothing is sent.

## Live site vs. video timing
Live sites react to real time and input (GSAP ticker, ScrollTrigger). Video export stays frame-deterministic in Remotion. The bridge is capture mode: `/form/?capture=1` pauses GSAP's global timeline; `capture-showreel.mjs` sets scroll, advances the timeline by 1/30 s and seeks videos to the same clock before each screenshot.

## QA (what `npm run web:qa` checks)
Pages `/form/`, `/lab/`, `/` at 390×844 (touch, @2x), 768×1024 (touch, @2x), 1440×900: console errors, missing files, horizontal overflow, top/mid/bottom screenshots. Plus: keyboard order and focus ring, skip link, deep links and header anchors, mobile menu (tap, Escape, focus return), swipeable rail, reduced motion (no pin, no video download, poster), video lazy-load / play in view / pause out of view / mobile encode / poster + play button on failure, leak tests (lab remount ×5, FORM crossing the pin breakpoint ×4), idle rAF rate, LCP/CLS/requests/bytes (desktop unthrottled and mobile with CPU ×4 + slow network). Conditions are written into the report.
