# FAHAD STUDIO

Personal production studio for FAHAD (web designer), two sections:
- **Video** (this folder): Remotion 4.0.535 + React 19 + TypeScript, Three.js/R3F via `@remotion/three`, FFmpeg.
- **Web** (`web/`, own package): Vite 8 + React 19 + TypeScript + GSAP/ScrollTrigger, sharp, Playwright — motion websites, interaction lab, asset pipeline. Guide: `docs/WEB.md`.

Not a client platform: no auth, subscriptions, hosting, or uploads.

Talk to the user in clear, short Arabic. Make routine technical decisions yourself and state what you did.

## Structure
- `projects/<slug>/project.json` — all content (copy, colours, fonts, scenes, timing, audio, subtitles, assets). Schema: `src/schema/project.ts`. Templates: `projects/_templates/`.
- `src/compositions/StudioVideo.tsx` — the single composition every project renders through (one per project × format, id `<slug>-<format>`). `Library.tsx` = component preview.
- `src/scenes/` — scene types (`prompt-reveal`, `hero-title`, `type-grid`, `interface`, `three-object`, `logo-end`, `statement`, `product-hero`, `feature-cards`, `screen-recording`, `before-after`, `palette`), registered in `SceneRenderer.tsx`.
- `src/components/` reusable pieces · `src/motion/` easing + transitions · `src/three/` stage, geometry, materials · `src/lib/` fonts, brand, layout, timeline.
- `presets/` brands, formats + safe areas, render quality · `public/assets/` fonts, audio, images, video, models, subtitles · `assets-registry.json` source/licence of every asset.
- `renders/` final · `previews/` previews + contact sheets · `docs/` usage, decisions, STATUS.

## Web section (web/)
- Sites in `web/src/sites/<slug>/` with all copy in `content.ts`; shared effects in `web/src/shared/fx/` (one engine: GSAP + ScrollTrigger; CSS only for hover/focus); media by id from `web/assets.config.json` → `npm run web:assets`.
- Live sites use real time; never import web motion code into Remotion. Capture mode `?capture=1` + `npm run web:capture-showreel` makes deterministic footage for videos.
- Every effect cleans up (`useGsap` / `trackFx`), respects `prefers-reduced-motion`, has a touch/keyboard alternative, and keeps hidden-until-revealed content focusable (opacity, not visibility).
- Commands: `npm run web:dev | web:build | web:preview | web:qa | web:assets | web:capture-concepts | web:capture-showreel`. Quality is judged by looking at `web/qa/*.png`, not by a passing build.
- Skills: `/web-brief`, `/web-build`, `/web-review`, `/asset-prepare`, `/web-showreel`.

## Commands (all tested — see docs/USAGE.md)
`npm run doctor` · `npm run studio` · `npm run check` · `npm run new-project -- --template <t> --slug <s>` · `npm run preview -- <id>` · `npm run render -- <id>` · `npm run contact-sheet -- <id>` · `npm run verify -- <file>` · `npm run import-srt -- --file x.srt --project <s>` · `npm run gen-audio` · `npm run gen-assets`

## Rules
- (Video section) Time comes only from `useCurrentFrame()` / composition config. No timers, CSS animations/transitions, `useFrame()` in R3F, or unseeded randomness (`random(seed)` from remotion).
- Content never lives in scene code: change copy/colour/media in project.json. New visual behaviour = new scene type or component, driven by schema fields.
- Never split Arabic into letters. Animate Arabic per word or per line (masks keep shaping). Latin may split by grapheme.
- Every layout reads `useLayout()` (u-scale, `isPortrait`, `stacked`, safe area). Re-flow per format; never stretch or blind-crop.
- Local licensed fonts only (`src/lib/fonts.ts`). No remote URLs in projects — copy assets into `public/assets` and log them in `assets-registry.json`.
- 3D: wrap in `StudioStage`; animate camera/lights via props from the frame; describe abstract geometry honestly (not "realistic product").
- Quality bar: deep black / warm white / silver + one accent; hierarchy, alignment, readable holds. No emoji, no glow/particles to cover weak design, not fade-everything, no people imagery unless asked, no invented clients/contact data.
- Before calling work done: `npm run check`, preview, `contact-sheet`, `verify` (frames, dims, peaks < -1 dBFS, near-black report), look at the frames yourself. Say plainly what was checked automatically vs. viewed; you cannot hear audio.
- Never publish, upload assets, buy services, or call paid APIs without explicit approval. Update `docs/STATUS.md` when capabilities change.
- Official Remotion skills live in `.claude/skills/remotion-*`; studio workflow skills are `/studio-brief`, `/studio-create`, `/studio-review`, `/studio-render`, `/studio-save-preset`, `/studio-generate` (external AI footage via Higgsfield — paid, quote + approval first).
