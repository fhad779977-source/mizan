// Deterministic capture of the real FORM site for the showreel.
// Drives scroll + the paused GSAP timeline frame by frame (?capture=1) and
// seeks background videos to the same clock, then encodes MP4s into the
// video section: ../public/assets/video/form-{desktop,mobile}.mp4
//   npm run build && npm run capture:showreel
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { launchBrowser, settle, startServer, STUDIO, WEB } from "./lib.mjs";

const FPS = 30;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Scroll keyframes as [seconds, target] where target is px or "#id" (section top).
const PLANS = {
  desktop: { viewport: { width: 1440, height: 900 }, dpr: 1, mobile: false, seconds: 7.2, keys: [[0, 0], [1.0, 0], [6.4, 2520], [7.2, 2520]] },
  mobile: { viewport: { width: 390, height: 844 }, dpr: 2, mobile: true, seconds: 6.4, keys: [[0, 0], [1.7, 0], [3.3, "#rail-title"], [3.9, "#rail-title"], [5.6, "#work"], [6.4, "#work"]] },
  // Full-page walkthrough (phone): every section, ending on the closing scene.
  //   npm run capture:showreel -- tour
  tour: { viewport: { width: 390, height: 844 }, dpr: 2, mobile: true, seconds: 30, keys: [[0, 0], [2.0, 0], [4.5, "#rail-title"], [7.0, "#rail-title"], [9.5, "#work"], [11.5, "#work"], [16.5, "#c03"], [19.0, "#method"], [21.5, "#method"], [24.0, "#atelier"], [27.0, "#atelier"], [28.5, "max"], [30, "max"]], explicit: true },
};

const server = await startServer({ mode: "preview", port: 4196 });
const browser = await launchBrowser();
try {
  // Optional CLI filter: npm run capture:showreel -- mobile
  const only = process.argv.slice(2).filter((a) => a in PLANS);
  for (const [name, plan] of Object.entries(PLANS).filter(([n, p]) => (only.length ? only.includes(n) : !p.explicit))) {
    const dir = path.join(WEB, "assets-src", "showreel", name);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({ viewport: plan.viewport, deviceScaleFactor: plan.dpr, isMobile: plan.mobile, hasTouch: plan.mobile });
    const page = await ctx.newPage();
    await page.goto(`${server.url}/form/?capture=1`, { waitUntil: "load" });
    await settle(page);
    const keys = await page.evaluate(
      (keys) => keys.map(([t, v]) => [t, typeof v === "number" ? v : v === "max" ? document.documentElement.scrollHeight - innerHeight : Math.round(document.querySelector(v).getBoundingClientRect().top + scrollY - 70)]),
      plan.keys,
    );
    const frames = Math.round(plan.seconds * FPS);
    for (let f = 0; f < frames; f++) {
      const t = f / FPS;
      let k = keys.findIndex(([kt], i) => i < keys.length - 1 && t >= kt && t <= keys[i + 1][0]);
      if (k < 0) k = keys.length - 2;
      const [t0, y0] = keys[k];
      const [t1, y1] = keys[k + 1];
      const y = y0 + (y1 - y0) * ease(Math.min(1, Math.max(0, (t - t0) / (t1 - t0 || 1))));
      await page.evaluate(
        async ({ y, t }) => {
          window.scrollTo({ top: y, behavior: "instant" });
          window.__capture.step(1 / 30);
          const vids = [...document.querySelectorAll("video")].filter((v) => v.currentSrc);
          await Promise.all(
            vids.map((v) => {
              v.pause();
              const target = t % (v.duration || 10);
              if (Math.abs(v.currentTime - target) < 0.001) return null;
              return new Promise((r) => { v.addEventListener("seeked", r, { once: true }); v.currentTime = target; });
            }),
          );
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        },
        { y, t },
      );
      await page.screenshot({ path: path.join(dir, `f${String(f).padStart(4, "0")}.jpg`), type: "jpeg", quality: 92 });
    }
    await ctx.close();
    const out = path.join(STUDIO, "public", "assets", "video", `form-${name}.mp4`);
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-framerate", String(FPS), "-i", path.join(dir, "f%04d.jpg"), "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
    console.log(`✓ ${name}: ${frames} frames → ${path.relative(STUDIO, out)}`);
  }
} finally {
  await browser.close();
  await server.close();
}
