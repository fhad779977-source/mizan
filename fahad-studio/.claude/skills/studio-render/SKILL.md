---
name: studio-render
description: Validate and export a FAHAD STUDIO composition — check, short test, preview, final MP4 with saved settings and verification. Use when the user asks to render, export or deliver a video.
---

# /studio-render

1. `npm run doctor` (once per machine/session) and `npm run check` — both must pass.
2. Short test before heavy work: `npm run preview -- <id> --frames 0-59` or a contact sheet.
3. Preview: `npm run preview -- <id>` → `previews/<id>.preview.mp4` (half scale, fast preset). Run `/studio-review` on it.
4. Final: `npm run render -- <id>` → `renders/<id>.mp4` — H.264 High, yuv420p BT.709, AAC 48 kHz 320k, CRF 17, x264 slow, faststart. Settings + verification saved to `renders/<id>.render.json`. Exit code 2 means verification issues — read them; justify or fix.
5. Report: path, resolution, fps, frames, duration, LUFS, true peak, render time, and any remaining issue. Quality presets live in `presets/quality.json` (raise concurrency on bigger machines; set FAHAD_GL=angle with a GPU).
6. Never upload or publish the result unless the user explicitly asks.
