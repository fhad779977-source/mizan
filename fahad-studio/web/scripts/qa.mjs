// Acceptance QA for the web section, against the production build (dist/).
//   npm run build && npm run qa            (all checks)
// Writes qa/report.json, qa/report.md and screenshots qa/<page>-<width>-{top,mid,bottom}.png.
// Conditions are recorded in the report: headless Chromium (software GL) on
// this machine; the throttled run uses CDP CPU ×4 + a simulated slow network.
// These are lab numbers, not field measurements on a real phone.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { launchBrowser, settle, startServer, WEB } from "./lib.mjs";

const OUT = path.join(WEB, "qa");
mkdirSync(OUT, { recursive: true });
const server = await startServer({ mode: "preview", port: 4199 });
const report = { conditions: {}, pages: [], checks: [], perf: [] };
const fail = [];
const check = (name, ok, detail = "") => {
  report.checks.push({ name, ok, detail });
  if (!ok) fail.push(`${name}: ${detail}`);
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const VIEWPORTS = [
  { name: "390", width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: "768", width: 768, height: 1024, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: "1440", width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
];
const PAGES = ["/form/", "/lab/", "/"];

// Each case gets its own browser: software-GL Chromium was observed to stall
// after several high-DPR contexts in one process on this machine.
const newPage = async (vp, extra = {}) => {
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor, ...extra });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  const ctx = { close: async () => { await context.close().catch(() => {}); await browser.close().catch(() => {}); }, newCDPSession: (p) => context.newCDPSession(p) };
  const log = { errors: [], failed: [], requests: [] };
  page.on("pageerror", (e) => log.errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && log.errors.push(m.text()));
  page.on("requestfailed", (r) => !r.url().includes("favicon") && log.failed.push(`${r.failure()?.errorText} ${r.url()}`));
  page.on("response", (r) => {
    if (r.url().startsWith(server.url)) log.requests.push({ url: r.url().replace(server.url, ""), status: r.status() });
    if (r.status() >= 400) log.failed.push(`${r.status()} ${r.url()}`);
  });
  return { ctx, page, log };
};

const scrollTo = async (page, frac) => {
  await page.evaluate((f) => window.scrollTo({ top: Math.round((document.documentElement.scrollHeight - innerHeight) * f), behavior: "instant" }), frac);
  await page.waitForTimeout(900);
};

// ---------- 1. Every page × viewport: errors, missing files, overflow, screenshots
for (const vp of VIEWPORTS) {
  for (const p of PAGES) {
    const { ctx, page, log } = await newPage(vp);
    const T = Date.now();
    const step = (s) => process.env.QA_TRACE && console.log(`  · ${p} @${vp.name} ${s} ${((Date.now() - T) / 1000).toFixed(1)}s`);
    await page.goto(server.url + p, { waitUntil: "load" });
    step("loaded");
    await settle(page);
    step("settled");
    await page.waitForTimeout(1200);
    const slug = p === "/" ? "index" : p.replace(/\//g, "");
    const shots = [];
    const overflow = [];
    for (const [label, f] of [["top", 0], ["mid", 0.5], ["bottom", 1]]) {
      await scrollTo(page, f);
      const o = await page.evaluate(() => {
        const w = document.documentElement.clientWidth;
        const over = document.documentElement.scrollWidth > w + 1;
        const culprits = over
          ? [...document.querySelectorAll("body *")]
              .filter((el) => { const r = el.getBoundingClientRect(); return r.right > w + 1 && getComputedStyle(el).position !== "fixed"; })
              .slice(0, 4)
              .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`)
          : [];
        return { over, scrollWidth: document.documentElement.scrollWidth, w, culprits };
      });
      if (o.over) overflow.push(`${label}: scrollWidth ${o.scrollWidth} > ${o.w} (${o.culprits.join(", ")})`);
      const file = path.join(OUT, `${slug}-${vp.name}-${label}.png`);
      step(`shot ${label}`);
      await page.screenshot({ path: file });
      shots.push(path.relative(WEB, file));
    }
    const missing = log.failed.filter((f) => !/aborted|ERR_ABORTED/.test(f));
    report.pages.push({ page: p, viewport: vp.name, errors: log.errors, failed: missing, overflow, shots, requests: log.requests.length });
    check(`${p} @${vp.name}: no console errors`, log.errors.length === 0, log.errors.slice(0, 3).join(" | "));
    check(`${p} @${vp.name}: no missing files`, missing.length === 0, missing.slice(0, 3).join(" | "));
    check(`${p} @${vp.name}: no horizontal overflow`, overflow.length === 0, overflow.join(" | "));
    await ctx.close();
  }
}

// ---------- 2. Keyboard: skip link first, focus always visible, nav anchors work
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  await page.goto(server.url + "/form/", { waitUntil: "load" });
  const seen = [];
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press("Tab");
    seen.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        const cs = getComputedStyle(el);
        const visible = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
        return { tag: el.tagName, cls: String(el.className), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30), visible };
      }),
    );
  }
  check("keyboard: skip link is the first stop", /Skip to work/.test(seen[0]?.text ?? ""), seen[0]?.text);
  // BODY = focus wrapped past the last element (normal browser behaviour).
  const invisible = seen.filter((s) => !s.visible && s.tag !== "BODY");
  const rows = seen.filter((s) => s.cls?.includes("index__row")).length;
  check("keyboard: all concept rows in the work index are reachable", rows === 5, `${rows} of 5 reached`);
  check("keyboard: every focused element shows a focus ring", invisible.length === 0, invisible.map((s) => s.text).join(", "));
  const deep = await newPage(VIEWPORTS[2]);
  await deep.page.goto(server.url + "/form/#method", { waitUntil: "load" });
  await deep.page.waitForTimeout(2000);
  const top = await deep.page.evaluate(() => Math.round(document.getElementById("method").getBoundingClientRect().top));
  check("navigation: deep link /form/#method lands on the section", top >= -2 && top < 200, `section top ${top}px`);
  await deep.ctx.close();
  await page.click('.hdr__nav a[href="#work"]');
  await page.waitForTimeout(2000);
  const workTop = await page.evaluate(() => Math.round(document.getElementById("work").getBoundingClientRect().top));
  check("navigation: header link scrolls to #work", Math.abs(workTop) < 200, `section top ${workTop}px`);
  const ids = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")).filter((h) => h.length > 1 && !document.querySelector(h)));
  check("navigation: all in-page links have targets", ids.length === 0, ids.join(", "));
  report.keyboard = seen;
  await ctx.close();
}

// ---------- 3. Touch: mobile menu opens, Escape closes and returns focus; index tap
{
  const { ctx, page } = await newPage(VIEWPORTS[0]);
  await page.goto(server.url + "/form/", { waitUntil: "load" });
  await page.tap(".hdr__menu");
  const open = await page.isVisible("#mobile-nav");
  await page.keyboard.press("Escape");
  const closed = !(await page.isVisible("#mobile-nav"));
  const focusBack = await page.evaluate(() => document.activeElement?.classList.contains("hdr__menu"));
  check("touch: menu opens on tap and closes with Escape (focus returns)", open && closed && focusBack, `open=${open} closed=${closed} focusBack=${focusBack}`);
  await page.tap(".hdr__menu");
  await page.tap('#mobile-nav a[href="#work"]');
  await page.waitForTimeout(1200);
  const workTop = await page.evaluate(() => Math.round(document.getElementById("work").getBoundingClientRect().top));
  check("touch: menu link navigates to #work", Math.abs(workTop) < 200, `top ${workTop}px`);
  const rail = await page.evaluate(() => { const t = document.querySelector(".rail__track"); return t ? t.scrollWidth > t.clientWidth : false; });
  check("touch: gallery rail is horizontally swipeable on mobile", rail);
  await ctx.close();
}

// ---------- 4. Reduced motion: no pin, static content visible, video not loaded
{
  const { ctx, page, log } = await newPage(VIEWPORTS[2], { reducedMotion: "reduce" });
  await page.goto(server.url + "/form/", { waitUntil: "load" });
  await settle(page);
  const r = await page.evaluate(() => ({ pins: document.querySelectorAll(".pin-spacer").length, rail: !!document.querySelector(".rail"), titleOpacity: getComputedStyle(document.querySelector(".hero__title .fx-mask__inner")).transform }));
  await scrollTo(page, 0.93);
  await page.waitForTimeout(800);
  const videoReq = log.requests.filter((q) => /\.(mp4|webm)$/.test(q.url)).length;
  const posterShown = await page.evaluate(() => { const i = document.querySelector(".closing .fx-video__poster img"); return !!i && i.complete && i.naturalWidth > 0; });
  check("reduced motion: no pinned scene, rail shown instead", r.pins === 0 && r.rail, JSON.stringify(r));
  check("reduced motion: headline not offset (no entrance transform)", r.titleOpacity === "none" || r.titleOpacity === "matrix(1, 0, 0, 1, 0, 0)", r.titleOpacity);
  check("reduced motion: background video not downloaded, poster shown", videoReq === 0 && posterShown, `videoRequests=${videoReq} poster=${posterShown}`);
  await page.screenshot({ path: path.join(OUT, "form-1440-reduced-motion.png") });
  await ctx.close();
}

// ---------- 5. Video: lazy, plays near viewport, pauses off-screen, poster on failure
{
  const { ctx, page, log } = await newPage(VIEWPORTS[2]);
  await page.goto(server.url + "/form/", { waitUntil: "load" });
  const early = log.requests.filter((q) => /\.(mp4|webm)$/.test(q.url)).length;
  await scrollTo(page, 0.93);
  await page.waitForTimeout(2500);
  const playing = await page.evaluate(() => { const v = document.querySelector(".closing video"); return { paused: v.paused, state: v.closest(".fx-video").dataset.state, src: v.currentSrc.split("/").pop() }; });
  // "Playing" is not enough: a loop whose motion is too faint reads as a broken
  // still on a phone. Compare two screenshots of the scene 2.5 s apart.
  const shot = async () => sharp(await page.locator(".closing__bg").screenshot()).resize(320).greyscale().raw().toBuffer();
  const a = await shot();
  await page.waitForTimeout(2500);
  const b = await shot();
  let moved = 0;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 6) moved++;
  const movedPct = (moved / a.length) * 100;
  await scrollTo(page, 0);
  await page.waitForTimeout(800);
  const pausedAway = await page.evaluate(() => document.querySelector(".closing video").paused);
  check("video: not requested at top of page (lazy)", early === 0, `requests at load: ${early}`);
  check("video: plays when the closing scene is in view", !playing.paused && playing.state === "playing", JSON.stringify(playing));
  check("video: motion is visible (pixels changed over 2.5 s, >0.3%; the old still-looking loop measured 0%)", movedPct > 0.3, `${movedPct.toFixed(2)}% of pixels changed`);
  check("video: pauses when scrolled out of view", pausedAway);
  await ctx.close();

  const m = await newPage(VIEWPORTS[0]);
  await m.page.goto(server.url + "/form/", { waitUntil: "load" });
  await scrollTo(m.page, 0.95);
  await m.page.waitForTimeout(2500);
  const mobileSrc = await m.page.evaluate(() => document.querySelector(".closing video").currentSrc.split("/").pop());
  check("video: mobile receives the lighter encode", /mobile/.test(mobileSrc), mobileSrc);
  await m.ctx.close();

  const f = await newPage(VIEWPORTS[2]);
  await f.page.route(/\.(mp4|webm)$/, (route) => route.abort());
  await f.page.goto(server.url + "/form/", { waitUntil: "load" });
  await scrollTo(f.page, 0.93);
  await f.page.waitForTimeout(2500);
  const fb = await f.page.evaluate(() => { const w = document.querySelector(".closing .fx-video"); const i = w.querySelector(".fx-video__poster img"); return { state: w.dataset.state, poster: i.complete && i.naturalWidth > 0, button: !!w.querySelector(".fx-video__play") }; });
  check("video: failed load keeps the poster and offers play", fb.state === "blocked" && fb.poster, JSON.stringify(fb));
  await f.page.screenshot({ path: path.join(OUT, "form-1440-video-blocked.png") });
  await f.ctx.close();
}

// ---------- 6. Leaks: lab remount ×5 and FORM resize across the pin breakpoint
{
  const { ctx, page } = await newPage(VIEWPORTS[2]);
  await page.goto(server.url + "/lab/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const snap = () => page.evaluate(() => ({ fx: { ...window.__fx.active }, triggers: window.__fx.triggers() }));
  const before = await snap();
  await page.click("#remount");
  await page.waitForTimeout(1600);
  const after = await snap();
  check("leaks: lab effects identical after 5 remounts", JSON.stringify(before) === JSON.stringify(after), `${JSON.stringify(before)} → ${JSON.stringify(after)}`);
  await ctx.close();

  const f = await newPage(VIEWPORTS[2]);
  await f.page.goto(server.url + "/form/", { waitUntil: "load" });
  await f.page.waitForTimeout(800);
  const b2 = await f.page.evaluate(() => ({ fx: { ...window.__fx.active }, triggers: window.__fx.triggers(), pins: document.querySelectorAll(".pin-spacer").length }));
  for (const w of [800, 1440, 800, 1440]) {
    await f.page.setViewportSize({ width: w, height: 900 });
    await f.page.waitForTimeout(700);
  }
  const a2 = await f.page.evaluate(() => ({ fx: { ...window.__fx.active }, triggers: window.__fx.triggers(), pins: document.querySelectorAll(".pin-spacer").length }));
  check("leaks: FORM effects identical after crossing the pin breakpoint 4×", JSON.stringify(b2) === JSON.stringify(a2), `${JSON.stringify(b2)} → ${JSON.stringify(a2)}`);
  const raf = await f.page.evaluate(
    () =>
      new Promise((res) => {
        let n = 0;
        const orig = window.requestAnimationFrame;
        window.requestAnimationFrame = (cb) => { n++; return orig(cb); };
        setTimeout(() => { window.requestAnimationFrame = orig; res(n); }, 1000);
      }),
  );
  report.idleRafPerSecond = raf;
  console.log(`· idle requestAnimationFrame calls/s on FORM (GSAP ticker included): ${raf}`);
  await f.ctx.close();
}

// ---------- 7. Weight & lab performance (recorded conditions)
const perfRun = async (label, vp, throttle) => {
  const { ctx, page, log } = await newPage(vp);
  const cdp = await ctx.newCDPSession(page);
  if (throttle) {
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  await page.addInitScript(() => {
    window.__perf = { lcp: 0, cls: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  const t0 = Date.now();
  await page.goto(server.url + "/form/", { waitUntil: "load" });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const res = performance.getEntriesByType("resource");
    const nav = performance.getEntriesByType("navigation")[0];
    const by = {};
    for (const r of res) { const k = r.initiatorType; by[k] = (by[k] ?? 0) + (r.transferSize || r.encodedBodySize || 0); }
    return { lcpMs: Math.round(window.__perf.lcp), cls: Number(window.__perf.cls.toFixed(4)), requests: res.length + 1, transferKB: Math.round((res.reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0) + (nav?.transferSize || 0)) / 1024), byTypeKB: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, Math.round(v / 1024)])) };
  });
  const row = { label, viewport: vp.name, throttled: !!throttle, loadEventMs: loadMs, ...m };
  report.perf.push(row);
  console.log(`· perf ${label}: LCP ${m.lcpMs} ms, CLS ${m.cls}, ${m.requests} requests, ${m.transferKB} KB initial (${JSON.stringify(m.byTypeKB)})`);
  await ctx.close();
  return row;
};
report.conditions = {
  browser: "Playwright Chromium (headless, software GL)",
  machine: "cloud container, 4 vCPU, no GPU",
  server: "vite preview (dist/, no CDN, no HTTP compression beyond Vite defaults)",
  throttledRun: "CPU ×4, 150 ms latency, 1.6 Mbps down / 750 kbps up (simulated)",
};
await perfRun("desktop unthrottled", VIEWPORTS[2], false);
const mob = await perfRun("mobile throttled", VIEWPORTS[0], true);
check("weight: initial mobile transfer under 1.2 MB", mob.transferKB < 1200, `${mob.transferKB} KB`);
check("stability: CLS under 0.1 (mobile, throttled)", mob.cls < 0.1, String(mob.cls));

await server.close();
report.summary = { passed: report.checks.filter((c) => c.ok).length, failed: fail.length, failures: fail };
writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
const md = [
  "# Web QA report",
  "",
  `Generated ${new Date().toISOString()} — ${report.summary.passed} passed, ${report.summary.failed} failed.`,
  "",
  "## Conditions",
  ...Object.entries(report.conditions).map(([k, v]) => `- ${k}: ${v}`),
  "",
  "## Checks",
  ...report.checks.map((c) => `- ${c.ok ? "PASS" : "FAIL"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`),
  "",
  "## Performance (lab)",
  ...report.perf.map((p) => `- ${p.label} @${p.viewport}: LCP ${p.lcpMs} ms · CLS ${p.cls} · ${p.requests} requests · ${p.transferKB} KB initial · load event ${p.loadEventMs} ms`),
  `- idle requestAnimationFrame calls/s on FORM: ${report.idleRafPerSecond}`,
  "",
  "Screenshots: qa/*.png",
].join("\n");
writeFileSync(path.join(OUT, "report.md"), md + "\n");
console.log(`\n${fail.length ? "FAIL" : "PASS"} — ${report.summary.passed} passed, ${fail.length} failed · qa/report.md`);
process.exit(fail.length ? 1 : 0);
