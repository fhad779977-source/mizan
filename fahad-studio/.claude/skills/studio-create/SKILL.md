---
name: studio-create
description: Produce a FAHAD STUDIO project from a brief — scaffold from a template, fill project.json, prepare assets, build keyframe stills and a preview. Use after /studio-brief or when the user asks to make a video.
---

# /studio-create

1. Scaffold: `npm run new-project -- --template <product-ad|web-showcase|identity-reel> --slug <kebab> --name "<Title>"` (refuses to overwrite). For the digital-craft style, copy `projects/digital-craft/project.json` into a new folder and run `npm run registry`.
2. Fill `projects/<slug>/project.json` from the brief: brief, brand, formats, scenes (type, seconds, text, items, media, transitionOut, sfx cues in scene-relative seconds), audio, assets. Content only — do not touch scene code for copy/colour changes.
3. Assets: put files in `public/assets/{images,video,audio,models,subtitles}`, list them in project `assets`, and add source + licence to `assets-registry.json`. Subtitles: `npm run import-srt -- --file <srt> --project <slug>`. Never invent a missing file or link — say what is missing.
4. Need a new behaviour? Add a scene type (`src/scenes`, register in `SceneRenderer.tsx` and `SCENE_TYPES`) or component, following CLAUDE.md rules (frame-driven, Arabic per word/line, `useLayout()` re-flow).
5. `npm run check -- --project <slug>` until PASS.
6. Keyframe stills to judge design before motion: `npm run contact-sheet -- <slug>-<format>` and read the JPEG.
7. `npm run preview -- <slug>-<format>`, then run `/studio-review`.
