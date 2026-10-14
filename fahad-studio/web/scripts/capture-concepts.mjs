// Captures the concept screens (/concepts/?id=…) at 1440×900 @2x into
// assets-src/concepts/<id>.png. Run: npm run capture:concepts
import { mkdirSync } from "node:fs";
import path from "node:path";
import { launchBrowser, settle, startServer, WEB } from "./lib.mjs";

const ids = ["c01", "c02", "c03", "c04", "c05"];
const out = path.join(WEB, "assets-src", "concepts");
mkdirSync(out, { recursive: true });
const server = await startServer({ port: 5199 });
const browser = await launchBrowser();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const id of ids) {
    await page.goto(`${server.url}/concepts/?id=${id}`, { waitUntil: "load" });
    await settle(page);
    const file = path.join(out, `${id}.png`);
    await page.locator("#capture").screenshot({ path: file });
    console.log(`✓ ${path.relative(WEB, file)}`);
  }
  if (errors.length) {
    console.error("Console errors:\n" + errors.join("\n"));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  await server.close();
}
