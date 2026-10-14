// Contact sheet: N frames spread over the composition plus every transition
// midpoint, tiled into one labelled JPEG for review.
//   npm run contact-sheet -- <composition-id> [--count 12] [--cols 4] [--scale 0.4]
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { ProjectSchema } from "../src/schema/project";
import { buildTimeline } from "../src/lib/timeline";
import { args, capture, listProjects, projectPath, readJson, ROOT, run } from "./lib";
import { labelFont, probe } from "./media";

const { flags, positional } = args();
const id = positional[0];
if (!id) {
  console.error("Usage: npm run contact-sheet -- <composition-id> [--count 12] [--cols 4] [--scale 0.4]");
  process.exit(1);
}
const count = Number(flags.count ?? 12);
const scale = Number(flags.scale ?? 0.4);

// Resolve duration and transition points from project data when the id is a project composition.
const slug = listProjects().find((s) => id.startsWith(`${s}-`));
let total: number;
const marks: number[] = [];
if (slug) {
  const p = ProjectSchema.parse(readJson(projectPath(slug)));
  const tl = buildTimeline(p);
  total = tl.durationInFrames;
  tl.scenes.forEach((s) => s.transitionInFrames > 0 && marks.push(s.from + Math.floor(s.transitionInFrames / 2)));
} else {
  const r = capture("npx", ["remotion", "compositions"]);
  const m = r.out.split("\n").find((l) => l.trim().startsWith(id + " "));
  total = Number(m?.trim().split(/\s+/)[3] ?? 1);
}
const even = Array.from({ length: count }, (_, i) => Math.min(total - 1, Math.round((i * (total - 1)) / (count - 1))));
const frames = [...new Set([...even, ...marks])].sort((a, b) => a - b);
const cols = Number(flags.cols ?? (frames.length > 12 ? 5 : 4));

const dir = path.join(ROOT, "previews", `_frames_${id}`);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
run("npx", ["remotion", "render", id, dir, `--frames=${frames.join(",")}`, "--image-format=jpeg", `--scale=${scale}`, "--log=error"]);
const files = readdirSync(dir).filter((f) => f.endsWith(".jpeg")).sort();
const font = labelFont();
const fps = 30;
const inputs: string[] = [];
const filters: string[] = [];
files.forEach((f, i) => {
  inputs.push("-i", path.join(dir, f));
  const fr = Number(f.match(/(\d+)\.jpeg$/)?.[1] ?? 0);
  const tag = `${fr}f  ${(fr / fps).toFixed(2)}s${marks.includes(fr) ? "  TRANSITION" : ""}`;
  filters.push(
    font
      ? `[${i}]drawtext=fontfile=${font}:text='${tag}':x=12:y=h-th-12:fontsize=h/30:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6[f${i}]`
      : `[${i}]null[f${i}]`,
  );
});
const rows = Math.ceil(files.length / cols);
// Pad the grid with black cells so xstack always has a full layout.
const padCount = rows * cols - files.length;
const first = probe(path.join(dir, files[0])).video!;
for (let k = 0; k < padCount; k++) filters.push(`color=c=black:s=${first.width}x${first.height}:d=1[f${files.length + k}]`);
const n = rows * cols;
const layout = Array.from({ length: n }, (_, i) => {
  const c = i % cols;
  const r = Math.floor(i / cols);
  const x = c === 0 ? "0" : Array.from({ length: c }, () => "w0").join("+");
  const y = r === 0 ? "0" : Array.from({ length: r }, () => "h0").join("+");
  return `${x}_${y}`;
}).join("|");
filters.push(`${Array.from({ length: n }, (_, i) => `[f${i}]`).join("")}xstack=inputs=${n}:layout=${layout}:fill=black`);
const out = path.join(ROOT, "previews", `${id}.contact-sheet.jpg`);
run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-filter_complex", filters.join(";"), "-frames:v", "1", "-q:v", "3", out]);
rmSync(dir, { recursive: true, force: true });
console.log(`✓ ${path.relative(ROOT, out)} — ${files.length} frames (${marks.length} transition midpoints) of ${total}`);
