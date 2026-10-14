# FAHAD STUDIO — Web section

Vite 8 + React 19 + TypeScript + GSAP 3.15 (ScrollTrigger). Separate package from the Remotion video section so their dependencies never collide.

```bash
npm ci                 # once
npm run dev            # http://127.0.0.1:5173/  (form/, lab/, concepts/)
npm run build          # tsc + production build → dist/
npm run preview        # http://127.0.0.1:4173/  serves dist/
npm run qa             # acceptance checks on dist/ → qa/report.md
npm run assets         # assets.config.json → public/media + manifest + registry
npm run capture:concepts   # concept screens → assets-src/concepts/*.png
npm run capture:showreel   # real site footage → ../public/assets/video/form-*.mp4
```

Full guide: ../docs/WEB.md
