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
