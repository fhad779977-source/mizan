# Decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | Project lives in `fahad-studio/` inside the existing `mizan` repo; existing files untouched. | No dedicated studio project existed; the repo's Mizan files are unrelated. |
| 2 | npm (single package manager), exact versions, `package-lock.json`. | Comes with Node; Remotion docs and skills cover it. |
| 3 | Remotion 4.0.535 for every `@remotion/*` package, React 19.2, three 0.186, R3F 9.8, zod 4.5.4. | Remotion packages must share one version; R3F 9 requires React 19; zod 4.5.4 matches `@remotion/media`. |
| 4 | Licence: Remotion Free License covers individuals and companies ≤ 3 employees (commercial use allowed). | From `node_modules/remotion/LICENSE.md`; a larger company would need a Company License. |
| 5 | One `StudioVideo` composition + scene registry; content in `projects/<slug>/project.json` validated by zod. | Changing copy, colour, media or timing never requires editing scene code; Studio shows the schema as editable props. |
| 6 | Compositions are registered per project × format (`<slug>-<format>`), sized by `calculateMetadata`. | One data file drives vertical, horizontal and square versions. |
| 7 | Layout authored at a 1080 px short edge and scaled by `u`; `isPortrait` / `stacked` / safe-area insets from `presets/formats.json`. | True re-layout per format instead of stretching or cropping. |
| 8 | Fonts: Noto Kufi Arabic, IBM Plex Sans Arabic, Inter — OFL woff2 copied from `@fontsource` into `public/assets/fonts`, loaded with `@remotion/fonts` (holds the render until loaded). Arabic faces contain only Arabic glyphs; Latin falls back to Inter. | Licensed, local, identical in preview and render; consistent Latin face in mixed text. |
| 9 | Arabic is animated per word or per line, never per letter; masks have 0.22em padding and 140 % travel. | Keeps letters joined and marks uncut; removes slivers at mask edges (found in review). |
| 10 | Transitions: custom mask wipe with hairline edge, iris from a point, match-frame window; built-in slide. Fade is not used. | Brief asks for mask/motion/match transitions, not fade-everything. |
| 11 | 3D: `StudioStage` with frame-driven camera (`useLayoutEffect` before `ThreeCanvas` advances), spot key light, rim, accent fill, procedural RoomEnvironment reflections applied per material. Rendering uses `swangle` (software GL). | No GPU here; per-material env maps keep the floor/plinth dark while metal reflects. |
| 12 | Audio is synthesized by `scripts/gen-audio.ts` (seeded, 48 kHz, peaks −3 dBFS SFX / −6 dBFS music). | Original, licence-free, reproducible; no downloads or temporary links. |
| 13 | Renders: H.264, yuv420p, BT.709 TV range (`--color-space=bt709`), AAC 48 kHz, faststart remux. | JPEG frame capture otherwise produced `yuvj420p` (full range) — less compatible. |
| 14 | Verification uses FFmpeg: ebur128 (LUFS, true peak), blackdetect, signalstats luma jumps, frame count. | Objective checks for clipping, black frames and flashes; complements visual review. |
| 15 | Product imagery is an abstract vessel rendered in-studio and labelled as a study; the "website" is an original FAHAD concept site. | No fabricated products, clients, metrics or contact details. |
| 16 | Default render concurrency 3 on 4 cores; preview at 0.5 scale / CRF 28 / veryfast. | Measured: preview of 20 s ≈ 2.3 min; leaves a core for the system. |
| 17 | Final mix is −20 LUFS integrated with ~−2 dBFS true peak. | Safe headroom. Platforms normalise to ≈ −14 LUFS; a loudness-normalised delivery can be added with `ffmpeg -af loudnorm=I=-14:TP=-1` when needed. |

## Web section (added 2026-10-14)

| # | Decision | Why |
|---|----------|-----|
| W1 | Web section in `web/` with its own `package.json` and lockfile; video section untouched except additive changes. | Vite/GSAP/sharp/Playwright never collide with Remotion's pinned tree; minimal structural change (no monorepo refactor). Local restore point: git tag `pre-web-expansion` (not pushed). |
| W2 | Vite 8.3.1, @vitejs/plugin-react 6.1.1, GSAP 3.15.0, Playwright 1.56.1 pinned exactly; sharp 0.35.5 (security fix for CVE in 0.35.4's librsvg). | Mature (≥2 weeks) versions except where a security advisory required the newer patch. Playwright matches the pre-installed Chromium 1194. |
| W3 | GSAP licence: "Standard no-charge licence" — free including commercial use; it excludes building a product that competes with Webflow's visual builder. | Fine for a personal studio's sites; noted so future SaaS ideas are checked first. |
| W4 | One motion engine per site: GSAP + ScrollTrigger. CSS transitions only for hover/focus. Motion library (motion.dev) not installed. | Avoid two engines on one property; nothing needed Motion's spring/layout features yet. |
| W5 | No three.js/R3F in the web package yet. Perspective gallery is CSS 3D; the horizon is a Remotion-rendered loop video. | CSS 3D keeps screenshots crisp and costs nothing; the horizon needs no viewpoint change, so real-time WebGL would only add weight. |
| W6 | Concept screens are React components captured at 1440×900 @2x, then encoded AVIF/WebP/JPEG (640/1280/1920). | Original, honest content; ~18–40 KB per AVIF at 1280 px; one source of truth for edits. |
| W7 | VideoBackground: poster-first, lazy attach, pause off-screen/hidden tab, mobile encode, Save-Data and reduced motion keep poster, source error or 8 s stall → poster + play button; newest IntersectionObserver entry wins. | Found and fixed during QA: stale IO entry left the video unattached 1 in 4 runs; dead network left play() pending. |
| W8 | Reveal uses opacity (not visibility) for hidden-until-revealed items. | QA showed keyboard Tab skipped the whole work index because visibility:hidden items are not focusable. |
| W9 | Deep links re-resolve the hash after fonts load + ScrollTrigger.refresh(). | The pinned scene adds scroll length after the browser's first anchor jump; /form/#method landed 7,000 px short. |
| W10 | Pinned scene only at ≥900 px wide and ≥560 px tall with motion allowed; otherwise a static shelf + native swipe rail. | Long pins are hostile on phones; reduced motion must still get the full content. |
| W11 | QA and capture launch a fresh browser per case and run `vite preview` as a child process. | Software-GL Chromium stalled after several high-DPR contexts in one process on this container. |
| W12 | Capture mode pauses GSAP's global timeline and advances it by 1/30 s per frame; videos are seeked to the same clock. | Showreel frames are deterministic and match the real site, not a re-creation. |
| W13 | Video section: added `instrument-serif` font option, `b.dw()` (single-weight display faces stay at 400) and an optional serif wordmark in EndLockup. Existing projects render as before (Kufi/Inter paths unchanged). | Lets the FORM showreel carry the site's identity without faux-bold. |
| W14 | `web-horizon-loop` added to the Studio folder of Root; no existing composition or template changed. | Additive; the earlier Digital Craft video re-rendered as a regression check. |
| W15 | Accessibility audit with axe-core 4.13.0 (dev-only) plus a pixel-based contrast measurement for text over gradients/video. | axe leaves such text as "needs review"; measuring the real background turned 33–36 open items per page into pass/fail results. It found one real issue (label over the horizon glow on phones, 3.42:1) — fixed by raising the glass panel opacity to 0.56. |
| W16 | Decorative footer wordmark is an aria-hidden SVG sized to the font's natural width; background videos marked decorative (aria-hidden). Arabic text carries `lang="ar"`; the static shelf is hidden from assistive tech when the rail lists the same items; the brief preview is plain text (not a live region). | Incidental text is exempt from 1.4.3 when the name is also present as readable text; a first SVG version with spacingAndGlyphs stretched the letters — caught only by looking at the screenshots. |
