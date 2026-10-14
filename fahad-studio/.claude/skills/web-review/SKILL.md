---
name: web-review
description: Review a FAHAD STUDIO website visually and functionally — screenshots at 390/768/1440, console/missing files, overflow, keyboard, touch, reduced motion, video fallback, leaks and weight. Use before delivering or after changes to a site.
---

# /web-review

1. `cd web && npm run build && npm run qa` → `web/qa/report.md` + screenshots `web/qa/<page>-<width>-{top,mid,bottom}.png`, `form-1440-reduced-motion.png`, `form-1440-video-blocked.png`. Exit code 1 = failures to fix.
2. Accessibility: `npm run a11y` → `web/qa/a11y.md` (axe-core WCAG 2.1 A/AA + best practices after scrolling every reveal into its final state; text over gradients/images/video is measured against the real pixels behind it) and `web/qa/aria-*.yml` (the tree a screen reader traverses — read it for heading order, labels, `lang="ar"` on Arabic, duplicated content).
3. Look at the screenshots yourself (Read the PNGs, tile with ffmpeg if useful). Judge: one clear key visual, type hierarchy, spacing, alignment, no overlapping or clipped text, Arabic joined and right-aligned, images not distorted, nothing generic (see `/web-brief` anti-patterns).
4. For the pinned scene, take extra frames along the scroll (see `reference/manual-checks.md`).
5. Report separately: automated results (with numbers and the recorded conditions) vs. what you looked at. Never claim results on a real device or scores you did not measure. Automated checks miss visual defects (e.g. stretched glyphs) — the visual pass is mandatory.
6. Fix, rebuild, rerun until PASS. Note decisions in `docs/DECISIONS.md` and capability changes in `docs/STATUS.md`.
