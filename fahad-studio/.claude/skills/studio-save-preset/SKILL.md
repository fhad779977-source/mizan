---
name: studio-save-preset
description: Save reusable FAHAD STUDIO settings — a brand (colours, fonts, logo), a format/safe area, a quality preset, or a whole project as a new template. Use when the user likes a look and wants to reuse it.
---

# /studio-save-preset

Pick the smallest preset that captures what the user wants to reuse:

- Brand → `presets/brands/<name>.json` with the `brand` object shape from `src/schema/project.ts` (colors: background, surface, foreground, muted, silver, accent; fonts: display/body/latin from `kufi|plex-arabic|inter`; logo: wordmark, arabic, tagline). Copy it into a project's `brand` field to apply.
- Format / safe area → `presets/formats.json` (`formats` and `safeAreas` as fractions of the frame). Safe-area keys must also be added to `SAFE_AREA_PRESETS` in the schema.
- Render quality → `presets/quality.json` (`scale, crf, jpegQuality, concurrency, x264Preset, audioBitrate`); use with `npm run render -- <id> --quality <name>` only for `preview|final`, or add a name and extend `scripts/render.ts`.
- Whole project → copy `projects/<slug>/project.json` to `projects/_templates/<template>.json`, replace client-specific copy with clearly marked PLACEHOLDER text, keep assets that exist in `public/assets`. Then `npm run check`.

After saving, run `npm run check`, and note the preset in `docs/STATUS.md` (Presets section).
