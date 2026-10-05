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

## City maps

Opening a city that has a guide dives the globe in, then cross-fades to a street map built from
OpenStreetMap: main roads with their names (English and local script), districts, and markers for
heritage sites, landmarks, cafés, restaurants, hotels, towers, offices and malls.

The data is fetched once at build time and shipped as static JSON, so the site needs no map server:

```bash
npm run build:maps            # all cities
npm run build:maps -- riyadh  # one city
```

- `scripts/city-maps.config.mjs` lists the streets, districts and extra places per city, plus aliases
  (often the Arabic or local name used in OpenStreetMap).
- Landmarks, cafés and restaurants come from the guides in `src/data/countries.ts`.
- Anything Nominatim cannot find inside the city's box is reported and left off the map — never guessed.
- Requests follow the Nominatim usage policy (1 request/second, cached in `scripts/.cache`).
- `node scripts/probe.mjs <lat> <lon> <radius> "name"…` helps find the name OpenStreetMap uses.

Map data © OpenStreetMap contributors, available under the ODbL.

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
