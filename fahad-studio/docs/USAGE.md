# دليل الاستخدام — FAHAD STUDIO

All commands run from the `fahad-studio/` folder. Each one below was executed and checked on 2026-10-14 (Linux, 4 cores, 15 GB, Node 22.22, npm 10.9, FFmpeg 6.1, software WebGL).

## First time on a machine
```bash
npm ci              # exact versions from package-lock.json
npm run doctor      # system, toolchain, Remotion versions, skills, fonts, sound kit, optional tools
```
On a machine with a GPU: `FAHAD_GL=angle npm run render -- <id>` is faster. To use a specific Chrome: `FAHAD_BROWSER=/path/to/chrome`.

## Daily commands
| Command | What it does | Output |
|---|---|---|
| `npm run studio` | Remotion Studio at http://localhost:3000 (Projects / Studio folders, editable props in the right sidebar) | — |
| `npm run check` | Validates every project and template (schema, timeline, target duration, assets exist, no remote URLs), asset registry, regenerates the project registry, runs `tsc` | PASS/FAIL, exit 1 on errors |
| `npm run check -- --project <slug>` | Same for one project | |
| `npm run new-project -- --template <product-ad\|web-showcase\|identity-reel> --slug <kebab-case> --name "Title"` | Copies a template to `projects/<slug>/` with a `brief.md` skeleton and registers it. Never overwrites. | compositions `<slug>-<format>` |
| `npm run preview -- <composition-id>` | Half-scale, fast H.264 preview + verification | `previews/<id>.preview.mp4` + `.render.json` |
| `npm run render -- <composition-id>` | Final: H.264 High, yuv420p BT.709, CRF 17, x264 slow, AAC 320k, faststart, verification | `renders/<id>.mp4` + `.render.json` |
| `npm run contact-sheet -- <composition-id> [--count 12] [--cols 4] [--scale 0.4]` | Frames spread over the timeline + every transition midpoint, labelled with frame/time | `previews/<id>.contact-sheet.jpg` |
| `npm run verify -- <file.mp4> [--expect-frames N]` | Streams, frames, pixel format, LUFS, true peak, near-black intervals, luma jumps | JSON + `<file>.verify.json` |
| `npm run import-srt -- --file <file.srt> --project <slug>` | SRT → caption data inside the project (enables subtitles) | |
| `npm run import-srt -- --file <file.srt> --out <file.json>` | SRT → standalone caption JSON | |
| `npm run gen-audio` | Re-synthesizes the original SFX + music bed | `public/assets/audio/` |
| `npm run gen-assets` | Re-renders the vessel still and the concept-site scroll video | `public/assets/images`, `public/assets/video` |
| `npm run typecheck` | `tsc --noEmit` only | |

Extra render options: `--frames 0-59` (render a range), `--concurrency 2`, `--out path.mp4`.

Composition ids: `form-showreel-vertical` (site film for FORM), `web-horizon-loop` (web background loop), `digital-craft-vertical`, `digital-craft-horizontal`, `demo-product-ad-vertical`, `demo-product-ad-square`, `demo-web-showcase-horizontal`, `demo-web-showcase-vertical`, `demo-identity-reel-square`, `demo-identity-reel-vertical`, `component-library`, `object-still`, `site-scroll`.

## Editing a video
- **Text, colours, fonts, media, timing, sounds:** edit `projects/<slug>/project.json`, then `npm run check`. Studio hot-reloads.
- **Try values live:** in Studio select a composition → right sidebar shows the project schema (colour pickers for brand colours). Live edits preview immediately; because props come from project.json, copy the values you like back into the JSON to keep them.
- **Safe area:** set `"showSafeArea": true` to draw the platform guide; `formats[].safeArea` picks `reels | tiktok | shorts | feed | youtube | none` (`presets/formats.json`).
- **Pacing:** `motion.speed` (1 = default, 1.2 = 20 % faster in-scene animation); scene `durationInSeconds`; `transitionOut` type and frames.
- **Sound:** scene `sfx` cues use seconds from that scene's start; `audio.music` sets bed volume and fades. Peaks are checked after render.
- **Match-frame transition:** the outgoing scene's `variant` holds the window rect, `"match:x,y,w,h|x,y,w,h"` (portrait | landscape, fractions of the frame).

## Scene types
`hero-title`, `type-grid`, `interface`, `three-object`, `logo-end`, `statement`, `product-hero`, `feature-cards`, `screen-recording`, `before-after`, `palette` — fields used: `eyebrow`, `headline` (use `\n` for line breaks), `headlineLatin`, `body`, `items[] {label, latin, value}`, `media`, `variant`.

## Adding assets
1. Copy the file into `public/assets/<type>/`.
2. Add it to the project's `assets` (or reference it from `media` / `sfx` / `audio.music`).
3. Add an entry to `assets-registry.json` (path, type, source, license, usedIn). `npm run check` fails for missing files and warns for unregistered ones.

## With Claude Code
Open Claude Code inside `fahad-studio/`. Studio skills: `/studio-brief`, `/studio-create`, `/studio-review`, `/studio-render`, `/studio-save-preset`. Official Remotion skills: `/remotion-best-practices` (router) and the other `remotion-*` skills.

## Web section
See [WEB.md](WEB.md). Short form, from this folder: `npm run web:install` once, then `npm run web:dev` (live) or `npm run web:build && npm run web:preview` (production build at http://127.0.0.1:4173/form/), `npm run web:qa` for acceptance checks.
