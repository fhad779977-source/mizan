---
name: studio-brief
description: Turn a FAHAD STUDIO video idea into a short brief, visual direction and timed scene breakdown (projects/<slug>/brief.md). Use when the user describes a new video, ad, showcase or reel.
---

# /studio-brief

Goal: a decision-ready brief, not an essay. Write in Arabic for the user; keep scene copy in the languages the video uses.

1. Extract or assume (and list assumptions): goal, audience, single message, duration, formats (`presets/formats.json`: vertical 1080×1920, horizontal 1920×1080, square, portrait), platform safe area, language/direction.
2. If a reference is given: analyse composition, type, rhythm, lighting, transitions — then propose an original treatment. Never copy logos or unlicensed material.
3. Pick a visual direction: palette (start from `presets/brands/fahad.json`: deep black, warm white, silver + one accent), display/body/latin fonts (`kufi` | `plex-arabic` | `inter`), motion speed and BPM.
4. Scene breakdown table — for each scene: id, scene type (must exist in `src/schema/project.ts` SCENE_TYPES), seconds, image, text, motion, transition out, sound. Opening must land within 2 s. Leave readable holds for text.
5. Check the arithmetic: total = Σ scene seconds − Σ transition frames / fps; match the target within 0.5 s.
6. Choose the closest template in `projects/_templates/` and note what changes.
7. Save as `projects/<slug>/brief.md` (create the folder via `/studio-create` or `npm run new-project`). Do not ask about cosmetic details — decide and note them.
