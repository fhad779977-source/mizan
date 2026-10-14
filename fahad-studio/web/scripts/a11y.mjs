// Accessibility audit: axe-core (WCAG 2.0/2.1 A + AA + best practices) on the
// production build, after scrolling the whole page so revealed content is in
// its final state; plus the ARIA tree a screen reader would traverse.
//   npm run build && npm run a11y   → qa/a11y.md, qa/a11y.json, qa/aria-*.yml
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";
import { launchBrowser, settle, startServer, WEB } from "./lib.mjs";

const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// For text axe cannot judge (gradients, images, video): hide the text, take
// the real pixels behind it and compute the worst-case contrast against the
// text colour (lightest pixel for dark text, darkest for light text, using the
// 2nd/98th percentile to ignore anti-aliasing).
const pixelContrast = async (page, selector) => {
  const el = page.locator(selector).first();
  if (!(await el.count())) return null;
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(150);
  await page.addStyleTag({ content: "[data-a11y-check]::placeholder{color:transparent!important}[data-a11y-check],[data-a11y-check] *{transition:none!important}" });
  const info = await el.evaluate((node) => {
    const cs = getComputedStyle(node);
    // Outlined text (transparent fill + stroke) is judged by its stroke colour.
    const colour = cs.color.startsWith("rgba") && cs.color.endsWith(", 0)") && parseFloat(cs.webkitTextStrokeWidth) > 0 ? cs.webkitTextStrokeColor : cs.color;
    const m = colour.match(/[\d.]+/g).map(Number);
    const inset = { l: parseFloat(cs.borderLeftWidth) + 2, t: parseFloat(cs.borderTopWidth) + 2, r: parseFloat(cs.borderRightWidth) + 2, b: parseFloat(cs.borderBottomWidth) + 2 };
    node.setAttribute("data-a11y-check", "");
    void node.offsetWidth; // apply transition:none before changing colour
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const prev = node.getAttribute("style") ?? "";
    node.setAttribute("data-a11y-prev", prev);
    node.style.setProperty("color", "transparent", "important");
    node.style.setProperty("-webkit-text-stroke", "0", "important");
    node.style.setProperty("text-shadow", "none", "important");
    for (const c of node.querySelectorAll("*")) c.style.setProperty("color", "transparent", "important");
    return { rgb: m.slice(0, 3), alpha: m[3] ?? 1, large: size >= 24 || (bold && size >= 18.66), inset };
  });
  const box = await el.boundingBox();
  let result = null;
  if (box && box.width > 8 && box.height > 8) {
    // Padding box only: borders are not the background the text sits on.
    const i = info.inset;
    const clip = { x: Math.max(0, box.x + i.l), y: Math.max(0, box.y + i.t), width: Math.min(box.width - i.l - i.r, 2000), height: Math.min(box.height - i.t - i.b, 1200) };
    const buf = await page.screenshot({ clip });
    const { data, info: im } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    const ls = [];
    for (let i = 0; i < data.length; i += im.channels) ls.push(lum([data[i], data[i + 1], data[i + 2]]));
    ls.sort((a, b) => a - b);
    const lo = ls[Math.floor(ls.length * 0.02)];
    const hi = ls[Math.floor(ls.length * 0.98)];
    const fg = lum(info.rgb);
    const worst = fg > (lo + hi) / 2 ? ratio(fg, hi) : ratio(fg, lo);
    result = { worst: Number(worst.toFixed(2)), required: info.large ? 3 : 4.5, large: info.large };
  }
  await el.evaluate((node) => {
    node.removeAttribute("data-a11y-check");
    node.setAttribute("style", node.getAttribute("data-a11y-prev") ?? "");
    node.removeAttribute("data-a11y-prev");
    for (const c of node.querySelectorAll("*")) c.style.removeProperty("color");
  });
  return result;
};

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const OUT = path.join(WEB, "qa");
mkdirSync(OUT, { recursive: true });
const CASES = [
  { page: "/form/", width: 1440, height: 900, mobile: false },
  { page: "/form/", width: 390, height: 844, mobile: true },
  { page: "/form/", width: 1440, height: 900, mobile: false, reduced: true },
  { page: "/lab/", width: 1440, height: 900, mobile: false },
  { page: "/", width: 1440, height: 900, mobile: false },
];

const server = await startServer({ mode: "preview", port: 4185 });
const results = [];
let serious = 0;
for (const c of CASES) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: c.width, height: c.height }, isMobile: c.mobile, hasTouch: c.mobile, deviceScaleFactor: 1, reducedMotion: c.reduced ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  await page.goto(server.url + c.page, { waitUntil: "load" });
  await settle(page);
  // Walk the page so every scroll-triggered reveal reaches its end state.
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += Math.round(c.height * 0.6)) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(600);
  await page.addScriptTag({ content: axeSource });
  const r = await page.evaluate(async () =>
    // eslint-disable-next-line no-undef
    axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }, resultTypes: ["violations", "incomplete"] }),
  );
  const label = `${c.page} @${c.width}${c.reduced ? " reduced-motion" : ""}`;
  const pixelChecks = [];
  for (const item of r.incomplete.filter((x) => x.id === "color-contrast")) {
    for (const n of item.nodes) {
      const sel = n.target[0];
      const pc = await pixelContrast(page, sel);
      if (pc) pixelChecks.push({ selector: sel, ...pc, ok: pc.worst >= pc.required });
    }
  }
  const pixelFails = pixelChecks.filter((p) => !p.ok);
  serious += pixelFails.length;
  const v = r.violations.map((x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.slice(0, 4).map((n) => `${n.target.join(" ")} — ${n.failureSummary?.split("\n")[1]?.trim() ?? ""}`), count: x.nodes.length }));
  serious += v.filter((x) => x.impact === "serious" || x.impact === "critical").length;
  results.push({ label, violations: v, incomplete: r.incomplete.map((x) => ({ id: x.id, count: x.nodes.length })), pixelChecks });
  console.log(`${v.length ? "✗" : "✓"} ${label}: ${v.length} violation types${v.length ? " — " + v.map((x) => `${x.id}(${x.impact}×${x.count})`).join(", ") : ""}`);
  console.log(`${pixelFails.length ? "✗" : "✓"} ${label}: pixel contrast on ${pixelChecks.length} gradient/image/video texts, lowest ${Math.min(...pixelChecks.map((p) => p.worst / p.required)).toFixed(2)}× of required${pixelFails.length ? " — " + pixelFails.map((p) => `${p.selector} ${p.worst}:1`).join(", ") : ""}`);
  if (!c.reduced) {
    const slug = c.page === "/" ? "index" : c.page.replace(/\//g, "");
    writeFileSync(path.join(OUT, `aria-${slug}-${c.width}.yml`), await page.locator("body").ariaSnapshot());
  }
  await browser.close();
}
await server.close();
writeFileSync(path.join(OUT, "a11y.json"), JSON.stringify(results, null, 2));
const md = ["# Accessibility audit (axe-core 4.13, WCAG 2.1 A/AA + best practices)", "", ...results.flatMap((r) => [`## ${r.label}`, ...(r.violations.length ? r.violations.flatMap((v) => [`- **${v.id}** (${v.impact}, ${v.count}) — ${v.help}`, ...v.nodes.map((n) => `  - ${n}`)]) : ["- no violations"]), r.incomplete.length ? `- axe could not decide: ${r.incomplete.map((i) => `${i.id}×${i.count}`).join(", ")}` : "", r.pixelChecks.length ? `- pixel contrast (worst case vs. real background): ${r.pixelChecks.filter((p) => p.ok).length}/${r.pixelChecks.length} pass; lowest ${r.pixelChecks.map((p) => p.worst).sort((a, b) => a - b)[0]}:1` : "", ...r.pixelChecks.filter((p) => !p.ok).map((p) => `  - FAIL ${p.selector}: ${p.worst}:1 (needs ${p.required}:1)`), ""])];
writeFileSync(path.join(OUT, "a11y.md"), md.join("\n") + "\n");
console.log(`${serious ? "FAIL" : "PASS"} — ${serious} serious/critical violation type(s) · qa/a11y.md`);
process.exit(serious ? 1 : 0);
