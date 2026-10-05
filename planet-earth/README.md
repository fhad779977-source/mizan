# PLANET EARTH

A cinematic, scroll-driven journey around Earth. Built with React + TypeScript, Three.js (WebGPU with automatic WebGL 2 fallback), TSL shaders and GSAP.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build in dist/
npm run preview    # serve the production build
```

## Structure

```
src/
  three/
    EarthExperience.ts  scene graph, frame loop, scroll/pointer camera, hotspot projection, FPS governor
    materials.ts        TSL node materials: earth, clouds, atmosphere, halo, procedural stars, moon, gas giant
    keyframes.ts        one camera "shot" per section (desktop + portrait variants)
    quality.ts          device tiering (high / low / none)
  audio/SoundEngine.ts  generative Web Audio ambience + UI sounds (no audio files)
  hooks/useSceneScroll.ts  maps page scroll to a continuous scene progress (0…4)
  components/           Loader, Nav, SoundToggle, SectionRail, Hero, Explore, Hotspots, Elements, Stats, Final, FallbackGlobe
  data/content.ts       places, elements, statistics copy
public/textures/        hd (4096) and sd (2048) NASA Blue Marble based maps
```

## Rendering & fallbacks

| Situation | Behaviour |
| --- | --- |
| WebGPU available | `WebGPURenderer` on the WebGPU backend |
| No WebGPU, or WebGPU fails during init | automatic retry on the WebGL 2 backend (same TSL shaders) |
| Phone / ≤4 cores / ≤4 GB / Save-Data | low tier: 2048 textures, DPR ≤ 1.5, clouds baked into the surface |
| Sustained < 34 fps | pixel ratio is lowered at runtime |
| No WebGL 2 and no WebGPU | lightweight CSS globe, full page still navigable |
| `prefers-reduced-motion` | no parallax / intro glide, slower rotation |

Debug query params: `?quality=high|low|none`, `?webgl` (skip WebGPU).

Texture maps come from the three.js examples (NASA Visible Earth / Blue Marble derived).
