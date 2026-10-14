# Choosing the asset type per scene

| Use | When | In this studio |
|---|---|---|
| Still image | The shot is the message; no motion needed; fastest | `assets.config.json` images → AVIF/WebP/JPEG via `npm run assets` |
| Looping video | Cinematic shot, fixed viewpoint (e.g. a glowing horizon, a slow product turn) | Render in Remotion (`src/compositions/*Loop.tsx`), encode with `npm run assets` (desktop + mobile + poster) |
| SVG / CSS | Type, lines, diagrams, UI, gradients; must stay crisp at any size | Inline in components; CSS 3D for perspective (see PerspectiveShelf) |
| Canvas / shader | Procedural fields that react to input and are cheap to draw | Only with a pause-when-hidden loop and reduced-motion fallback |
| Real 3D (three.js / R3F) | The visitor must rotate, configure or explore the object | Add `three`/`@react-three/fiber` to web/ only when needed; render loop paused off-screen |

Rules: a primitive shape is never presented as a realistic product; if a key asset is missing, change the direction to something that can be made well and say so; never hotlink or reuse reference material.
