---
name: asset-prepare
description: Prepare images and video for FAHAD STUDIO websites — responsive AVIF/WebP/JPEG sizes, H.264 + VP9 desktop/mobile encodes, posters, manifest and rights registry. Use when adding or replacing any site media.
---

# /asset-prepare

1. Put the source in `web/assets-src/` (or render it: concept screens via `npm run capture:concepts`, loops via a Remotion composition, e.g. `npx remotion render web-horizon-loop web/assets-src/video/horizon.mp4 --crf=12` from `fahad-studio/`).
2. Add an entry to `web/assets.config.json` with `id`, `src`, widths or desktop/mobile encode settings, `source`, `license`, `usedIn`. Unknown licence = do not use.
3. `cd web && npm run assets` (`--force` to re-encode). Outputs go to `web/public/media/`, `src/shared/media-manifest.json` and `assets-registry.json` (dimensions, bytes, paths, rights).
4. Read the warnings: images > 400 KB WebP or mobile video > 1.5 MB need smaller settings. Mobile never gets the desktop file.
5. Reference by id: `<Picture id="…" sizes="…" alt="…" />`, `<VideoBackground id="…" label="…" />`. Details: `reference/specs.md`.
