// Validates every project: schema, timeline, target duration and assets;
// verifies the asset registry; regenerates the project registry; runs tsc.
//   npm run check            (all projects)
//   npm run check -- --project digital-craft
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { ProjectSchema } from "../src/schema/project";
import { buildTimeline, validateTimeline } from "../src/lib/timeline";
import { args, capture, listProjects, projectPath, PUBLIC_DIR, readJson, ROOT, TEMPLATES_DIR, writeRegistry } from "./lib";

const { flags } = args();
let errors = 0;
let warnings = 0;
const err = (m: string) => {
  errors++;
  console.log(`  ✗ ${m}`);
};
const warn = (m: string) => {
  warnings++;
  console.log(`  ! ${m}`);
};

const referencedAssets = (p: ReturnType<typeof ProjectSchema.parse>) => {
  const set = new Set<string>(p.assets);
  p.scenes.forEach((s) => {
    s.sfx.forEach((c) => set.add(c.src));
    if (s.media) s.media.split("|").forEach((m) => set.add(m));
  });
  if (p.audio.music) set.add(p.audio.music.src);
  return [...set];
};

const checkProject = (label: string, file: string) => {
  console.log(`• ${label}`);
  const parsed = ProjectSchema.safeParse(readJson(file));
  if (!parsed.success) {
    parsed.error.issues.forEach((i) => err(`${i.path.join(".")}: ${i.message}`));
    return;
  }
  const p = parsed.data;
  validateTimeline(p).forEach(err);
  const ids = new Set<string>();
  p.scenes.forEach((s) => (ids.has(s.id) ? err(`duplicate scene id "${s.id}"`) : ids.add(s.id)));
  const { durationInFrames } = buildTimeline(p);
  const seconds = durationInFrames / p.fps;
  if (Math.abs(seconds - p.targetDurationInSeconds) > 0.5) warn(`timeline is ${seconds.toFixed(2)}s, target ${p.targetDurationInSeconds}s`);
  for (const a of referencedAssets(p)) {
    if (/^https?:/.test(a)) err(`remote asset "${a}" — copy it into public/assets and log it in assets-registry.json`);
    else if (!existsSync(path.join(PUBLIC_DIR, a))) err(`missing asset public/${a}`);
    else if (statSync(path.join(PUBLIC_DIR, a)).size === 0) err(`empty asset public/${a}`);
  }
  console.log(`  ✓ ${p.scenes.length} scenes, ${durationInFrames} frames (${seconds.toFixed(2)}s @ ${p.fps}fps), formats: ${p.formats.map((f) => `${f.id} ${f.width}×${f.height}`).join(", ")}`);
};

const only = flags.project ? [String(flags.project)] : listProjects();
console.log("Projects");
only.forEach((slug) => checkProject(slug, projectPath(slug)));
if (!flags.project) {
  console.log("Templates");
  readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".json"))
    .forEach((f) => checkProject(`_templates/${f}`, path.join(TEMPLATES_DIR, f)));
}

console.log("Asset registry");
const registry = readJson<{ assets: Array<{ path: string; source: string; license: string }> }>(path.join(ROOT, "assets-registry.json"));
const registered = new Set(registry.assets.map((a) => a.path));
registry.assets.forEach((a) => {
  if (!existsSync(path.join(PUBLIC_DIR, a.path))) err(`registry lists missing file public/${a.path}`);
  if (!a.source || !a.license) err(`registry entry ${a.path} needs source and license`);
});
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
walk(path.join(PUBLIC_DIR, "assets"))
  .map((f) => path.relative(PUBLIC_DIR, f))
  .filter((f) => !/\.(md|txt|gitkeep)$/.test(f) && !path.basename(f).startsWith("LICENSE"))
  .forEach((f) => {
    if (!registered.has(f)) warn(`unregistered asset public/${f} — add it to assets-registry.json`);
  });
console.log(`  ✓ ${registry.assets.length} registered assets`);

console.log("Registry");
console.log(`  ✓ registered compositions for: ${writeRegistry().join(", ")}`);

console.log("TypeScript");
const tsc = capture("npx", ["tsc", "--noEmit", "-p", "."]);
if (tsc.ok) console.log("  ✓ tsc --noEmit passed");
else {
  console.log(tsc.out);
  err("TypeScript errors");
}

console.log(`\n${errors === 0 ? "PASS" : "FAIL"} — ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors === 0 ? 0 : 1);
