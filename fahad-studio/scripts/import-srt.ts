// Imports an SRT file into internal caption data (@remotion/captions Caption[]).
//   npm run import-srt -- --file public/assets/subtitles/x.srt --project <slug>
//       → writes project.subtitles.items and enables subtitles
//   npm run import-srt -- --file x.srt --out public/assets/subtitles/x.captions.json
import { parseSrt } from "@remotion/captions";
import { readFileSync } from "node:fs";
import path from "node:path";
import { args, projectPath, readJson, ROOT, writeJson } from "./lib";

const { flags } = args();
const file = flags.file as string | undefined;
if (!file) {
  console.error("Usage: npm run import-srt -- --file <path.srt> (--project <slug> | --out <file.json>)");
  process.exit(1);
}
const input = readFileSync(path.resolve(ROOT, file), "utf8").replace(/\r\n/g, "\n");
const { captions } = parseSrt({ input });
if (captions.length === 0) {
  console.error("No captions parsed — check the SRT format.");
  process.exit(1);
}
const clean = captions.map((c) => ({ ...c, text: c.text.trim() }));
if (flags.project) {
  const p = projectPath(String(flags.project));
  const project = readJson<Record<string, any>>(p);
  project.subtitles = { enabled: true, items: clean };
  writeJson(p, project);
  console.log(`Imported ${clean.length} captions into ${path.relative(ROOT, p)}`);
} else if (flags.out) {
  writeJson(path.resolve(ROOT, String(flags.out)), clean);
  console.log(`Wrote ${clean.length} captions to ${flags.out}`);
} else {
  console.log(JSON.stringify(clean, null, 2));
}
