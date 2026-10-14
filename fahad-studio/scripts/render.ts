// Renders a composition with a quality preset, then remuxes for fast start,
// verifies the file and saves the exact settings next to the output.
//   npm run render  -- <composition-id>            → renders/<id>.mp4 (final)
//   npm run preview -- <composition-id>            → previews/<id>.preview.mp4
//   options: --quality preview|final  --out <file>  --frames 0-89  --concurrency N
import { renameSync } from "node:fs";
import path from "node:path";
import quality from "../presets/quality.json";
import { args, capture, ROOT, run, writeJson } from "./lib";
import { verifyVideo } from "./verify";

const { flags, positional } = args();
const id = positional[0];
if (!id) {
  console.error("Usage: npm run render -- <composition-id> [--quality preview|final] [--out file] [--frames a-b]");
  process.exit(1);
}
const q = (flags.quality === "preview" ? "preview" : "final") as keyof typeof quality & ("preview" | "final");
const preset = quality[q];
const out = path.resolve(ROOT, String(flags.out ?? (q === "preview" ? `previews/${id}.preview.mp4` : `renders/${id}.mp4`)));
const tmp = out.replace(/\.mp4$/, ".tmp.mp4");
const cliArgs = [
  "remotion",
  "render",
  id,
  tmp,
  "--codec=h264",
  "--pixel-format=yuv420p",
  // BT.709 + TV range: correct colour tags and yuv420p for broad playback.
  "--color-space=bt709",
  "--audio-codec=aac",
  `--audio-bitrate=${preset.audioBitrate}`,
  `--crf=${preset.crf}`,
  `--x264-preset=${preset.x264Preset}`,
  `--jpeg-quality=${preset.jpegQuality}`,
  `--scale=${preset.scale}`,
  `--concurrency=${flags.concurrency ?? preset.concurrency}`,
  "--log=warn",
];
if (flags.frames) cliArgs.push(`--frames=${flags.frames}`);
console.log(`▶ ${q} render: ${id} → ${path.relative(ROOT, out)}`);
const t0 = Date.now();
run("npx", cliArgs);
const seconds = (Date.now() - t0) / 1000;
// Move the moov atom to the front so the file starts playing before it fully loads.
run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", tmp, "-c", "copy", "-movflags", "+faststart", out]);
renameSync(tmp, tmp + ".done");
capture("rm", ["-f", tmp + ".done"]);
const report = verifyVideo(out);
const settings = {
  composition: id,
  quality: q,
  preset,
  output: path.relative(ROOT, out),
  renderedAt: new Date().toISOString(),
  renderSeconds: seconds,
  remotion: capture("node", ["-p", "require('remotion/package.json').version"]).out,
  command: `npx ${cliArgs.join(" ")}`,
  verification: report,
};
writeJson(out.replace(/\.mp4$/, ".render.json"), settings);
const v = report.probe.video!;
console.log(
  `✓ ${v.width}×${v.height} ${v.fps}fps ${v.frames} frames ${report.probe.duration.toFixed(2)}s | audio ${report.probe.audio ? `${report.probe.audio.codec} ${report.probe.audio.sampleRate}Hz` : "none"} | ` +
    `${report.loudness ? `${report.loudness.integratedLufs} LUFS, true peak ${report.loudness.truePeakDbfs} dBFS` : ""} | ${seconds.toFixed(0)}s`,
);
if (report.issues.length) {
  console.log("Issues:\n- " + report.issues.join("\n- "));
  process.exit(2);
}
