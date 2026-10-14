// Shared helpers for web scripts: paths, a temporary Vite server, browser.
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const STUDIO = path.resolve(WEB, "..");

export const args = (argv = process.argv.slice(2)) => {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      if (v !== undefined) flags[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) flags[k] = argv[++i];
      else flags[k] = true;
    } else positional.push(a);
  }
  return { flags, positional };
};

/** Starts Vite (dev) or serves the built dist (preview). Returns {url, close}.
 *  preview runs as a child process so screenshots/encoding in this process
 *  never stall the server. */
export const startServer = async ({ mode = "dev", port = 5199 } = {}) => {
  const vite = await import("vite");
  if (mode === "preview") {
    const { spawn } = await import("node:child_process");
    const child = spawn(process.execPath, [path.join(WEB, "node_modules", "vite", "bin", "vite.js"), "preview", "--port", String(port), "--strictPort", "--host", "127.0.0.1"], { cwd: WEB, stdio: "ignore" });
    const url = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(url + "/")).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    return { url, close: async () => child.kill() };
  }
  if (mode === "preview-inprocess") {
    const server = await vite.preview({ root: WEB, preview: { port, strictPort: true, host: "127.0.0.1" }, logLevel: "warn" });
    return { url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.httpServer.close(r)) };
  }
  const server = await vite.createServer({ root: WEB, server: { port, strictPort: true, host: "127.0.0.1" }, logLevel: "warn" });
  await server.listen();
  return { url: `http://127.0.0.1:${port}`, close: () => server.close() };
};

/** Chromium for capture/QA: FAHAD_BROWSER_GUI, a pre-installed Playwright
 *  build, or Playwright's own download (npx playwright install chromium). */
export const launchBrowser = async (opts = {}) => {
  const { chromium } = await import("playwright");
  const candidates = [process.env.FAHAD_BROWSER_GUI, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].filter(Boolean);
  const executablePath = candidates.find((p) => existsSync(p));
  return chromium.launch({ executablePath, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"], ...opts });
};

/** Waits for web fonts, images and (optionally) videos to be ready. */
export const settle = async (page, timeoutMs = 8000) => {
  await page.evaluate(async (timeoutMs) => {
    const work = (async () => {
      await document.fonts.ready;
      // Only images the browser will load now: eager ones, or lazy ones
      // already in the viewport. Lazy images further down load on scroll.
      const pending = [...document.images].filter((i) => {
        if (i.complete) return false;
        const r = i.getBoundingClientRect();
        return i.loading !== "lazy" || (r.bottom > 0 && r.top < innerHeight);
      });
      await Promise.all(
        pending.map((img) => new Promise((r) => { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); })),
      );
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    })();
    await Promise.race([work, new Promise((r) => setTimeout(r, timeoutMs))]);
  }, timeoutMs);
};
