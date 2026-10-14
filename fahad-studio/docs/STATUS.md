# حالة الاستوديو — STATUS

Last updated: 2026-10-14. Environment where this was built and tested: cloud Linux container (Claude Code on the web), 4 vCPU, 15 GB RAM, no GPU (WebGL via SwiftShader/swangle), Node 22.22, npm 10.9, FFmpeg 6.1.1, Chromium headless shell 1194.

Legend: **✅ works & tested** · **🟡 configured, not tested** · **🔌 needs external setup**

## Core
| Capability | State | Evidence |
|---|---|---|
| Remotion 4.0.535 + React 19 + TS project, npm lockfile | ✅ | `npm run doctor` all versions aligned; `tsc --noEmit` passes |
| Official Remotion skills (12) installed project-level for Claude Code | ✅ | `npx skills@1.7.2 add remotion-dev/skills --skill '*' --agent claude-code -y --copy`; Claude Code 2.1.299 init event lists all 12 when opened in `fahad-studio/` |
| Studio skills `/studio-brief` `/studio-create` `/studio-review` `/studio-render` `/studio-save-preset` | ✅ discovered | Same init-event check lists all 5. Their instructions reference real commands/files; not yet exercised end-to-end by a fresh session |
| Remotion Studio | ✅ | Started on port 3123, HTTP 200, opened in headless Chromium: compositions listed, schema props editable, timeline with scenes + audio. Note: "Can't save default props" is expected (props come from project.json) |
| Project schema (zod) + `npm run check` | ✅ | PASS on 4 projects + 3 templates; negative test (bad scene type) → FAIL |
| `new-project` | ✅ | Created 3 demo projects; refuses to overwrite an existing slug |
| `preview` / `render` with saved settings + verification | ✅ | See renders below |
| `contact-sheet` | ✅ | Sheets for every project in `previews/` |
| `verify` (frames, dims, pix fmt, LUFS, true peak, near-black, luma jumps) | ✅ | Caught real issues during this build (yuvj420p, two near-black gaps) which were then fixed |
| `import-srt` (SRT → caption data) | ✅ | `web-showcase.ar.srt` → `demo-web-showcase` subtitles, rendered in its preview |
| `gen-audio` (original SFX + music) | ✅ | 6 WAV files, peaks −3 / −6 dBFS |
| `gen-assets` (vessel still, site-scroll video) | ✅ | Both rendered and used |
| `doctor` | ✅ | OK, 0 blocking issues |

## Components & templates
| Item | State |
|---|---|
| KineticTitle (Arabic per word, Latin per letter), MaskReveal, Hairline, IndexLabel | ✅ rendered & reviewed |
| ProductCard, DeviceFrame (phone/browser) + real video inside, BeforeAfter, Cursor | ✅ |
| EndLockup, Subtitles, SafeAreaGuides | ✅ (safe-area guide toggled via `showSafeArea`, not rendered in deliverables) |
| Transitions: mask wipe, iris, match frame, slide | ✅ |
| 3D StudioStage: frame-driven camera, sweeping key light, rim, accent, per-material env reflections; monogram + vessel | ✅ (software GL) |
| AudioMix: music bed fades + timed SFX | ✅ measured; waveform matches cue times |
| Component library composition (`component-library`, 32.8 s) | ✅ contact sheet reviewed |
| Template: product-ad (vertical + square) | ✅ contact sheets reviewed |
| Template: web-showcase (horizontal + vertical) | ✅ preview rendered (418 f, −23.3 LUFS, TP −6.9 dBFS) |
| Template: identity-reel (square + vertical) | ✅ contact sheets reviewed |

## Proof piece — FAHAD — DIGITAL CRAFT
| File | Result |
|---|---|
| `renders/digital-craft-vertical.mp4` | 1080×1920, 30 fps, 600 frames (20.0 s video; container 20.01 s incl. AAC priming), H.264 High yuv420p BT.709, AAC 48 kHz stereo, −20.4 LUFS, true peak −2.3 dBFS, no near-black, render 235 s |
| `renders/digital-craft-horizontal.mp4` | 1920×1080, same specs, re-laid-out (not stretched), render 236 s |
| `previews/digital-craft-*.preview.mp4` | Half-scale previews, same checks |
| `previews/digital-craft-*.contact-sheet.jpg`, `*.final-frames.jpg`, `digital-craft.audio-timeline.png` | Review material |

Review method — be precise about what was done:
- **Automated:** stream/format probe, exact frame count, EBU R128 loudness + true peak, blackdetect, per-frame luma jumps (largest: 16.6/255 at the iris into the end card — a single transition, not repeated flicker).
- **Viewed (stills):** frames from start, every transition midpoint and end, taken from the final MP4s and from contact sheets. Checked Arabic joining, marks, clipping, overlaps, aspect ratio, layout per format.
- **Not done:** watching the video in real-time playback, or listening. Audio was judged only from measurements and the waveform/cue alignment.

## Needs external setup (🔌) — none required for the local pipeline
- Whisper transcription (local whisper.cpp or cloud) — not installed. See INTEGRATIONS.md.
- ElevenLabs / other TTS — no API key; paid.
- Image/video generation services — not configured.
- Blender, After Effects — not installed / not available on Linux.
- GPU rendering — set `FAHAD_GL=angle` on a machine with a GPU.

## Known limitations / next steps
- This was built in a cloud container. To run on your own computer: clone the repo, `cd fahad-studio && npm ci && npm run doctor`. Remotion will download its own headless Chrome on first render if `/opt/pw-browsers/...` is not present (one-time network access).
- Final renders and preview MP4s are git-ignored by default (see `.gitignore`).
- Studio's "save default props" does not write back to project.json; copy values into the JSON.
- Mix sits at −20 LUFS for headroom; add a loudness-normalised export (−14 LUFS) if a platform needs it.
- Product imagery is an abstract study; real product work needs real photos/models in `public/assets`.
- The opening frame 0 is intentionally almost black (the hairline starts drawing); the headline is fully readable by 1.3 s.

## Presets
- Brand: `presets/brands/fahad.json`
- Formats & safe areas: `presets/formats.json`
- Quality: `presets/quality.json` (`preview`, `final`)
