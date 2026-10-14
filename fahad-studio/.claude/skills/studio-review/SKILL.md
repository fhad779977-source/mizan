---
name: studio-review
description: Review a FAHAD STUDIO render for design, motion, Arabic text, audio and technical defects using contact sheets and automated checks. Use after a preview or before a final render.
---

# /studio-review

Separate clearly what was measured automatically from what you looked at. You cannot hear audio — report audio only from measurements and cue timing.

1. Automated: `npm run verify -- <file.mp4> --expect-frames <n>` → streams, duration, pixel format, integrated LUFS, true peak (must be < -1 dBFS), near-black intervals, largest luma jumps (flash candidates).
2. Visual: `npm run contact-sheet -- <composition-id> --count 16` (includes every transition midpoint). Read the JPEG. For suspicious moments render exact frames: `npx remotion render <id> previews/check --frames=a,b,c --image-format=jpeg --scale=0.5`.
3. Checklist — report pass/fail per item with frame numbers:
   - Opening reads within 2 s; hierarchy, alignment, margins, safe area (`showSafeArea: true` in Studio).
   - Text: no clipping, no overlaps between entering/exiting words, Arabic letters joined, marks (shadda, tanween, hamza) not cut, mixed Arabic/Latin/number order correct.
   - No unintended black frames, flashes, distorted images (object-fit), stray slivers at mask edges.
   - Motion has purpose and rhythm; transitions varied (not fade-everything); holds long enough to read.
   - 3D: lighting reveals form, camera intentional, no clipping through geometry, object fully framed.
   - Audio: cues align with cuts (scene start + cue `at`), music fades in/out, peak headroom.
4. Fix in project.json (content/timing) or components (behaviour), re-run preview, re-review. Record notable decisions in `docs/DECISIONS.md`.
