---
name: web-brief
description: Turn a website request into a one-page brief and art direction for the FAHAD STUDIO web section (message, key visual, type, colour, grid, imagery, motion, section map). Use when the user asks for a new site, landing page or interactive experience.
---

# /web-brief

Write in Arabic for the user; site copy in the site's language. Decide routine things yourself; ask only one question if the answer would change the whole direction.

1. Brief (≤10 lines): goal, audience, single message, the one image the visitor must remember, pages/sections, languages (RTL?), constraints. List assumptions.
2. Key visual: choose one dominant idea and say why. Pick the asset type per scene with a one-line reason — read `reference/asset-types.md`.
3. Art direction: display / text / label fonts (licensed, local — see `web/public/fonts` or add via @fontsource), palette (start ink/ivory/silver + one accent, change if the idea needs it), grid (12-col, margins), image treatment, motion vocabulary (one engine per site: GSAP+ScrollTrigger by default).
4. Section map: each section's job in one line. Exactly one pinned scroll scene unless there is a strong reason.
5. Avoid the default template (centered headline + purple gradient + three cards + glow). No invented clients, testimonials, awards, metrics, contact details or fake working forms.
6. Save to `web/src/sites/<slug>/BRIEF.md`, then continue with `/web-build`.
