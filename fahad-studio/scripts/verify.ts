// Automated checks for a rendered file: container/streams, duration vs.
// expected, loudness and true peak, near-black intervals, luma jumps.
//   npm run verify -- renders/digital-craft-vertical.mp4 [--expect-frames 600]
import path from "node:path";
import { args, ROOT, writeJson } from "./lib";
import { blackSegments, loudness, lumaJumps, probe } from "./media";

export const verifyVideo = (file: string, expectFrames?: number) => {
  const p = probe(file);
  const l = p.audio ? loudness(file) : null;
  const black = blackSegments(file);
  const luma = lumaJumps(file);
  const issues: string[] = [];
  if (!p.video) issues.push("no video stream");
  if (p.video && p.video.pixFmt !== "yuv420p") issues.push(`pixel format ${p.video.pixFmt} (yuv420p plays everywhere)`);
  if (expectFrames && p.video && p.video.frames !== expectFrames) issues.push(`frame count ${p.video.frames} ≠ expected ${expectFrames}`);
  if (l && l.truePeakDbfs > -1) issues.push(`true peak ${l.truePeakDbfs} dBFS exceeds -1 dBFS`);
  black.filter((b) => b.start > 0.1).forEach((b) => issues.push(`near-black ${b.start.toFixed(2)}–${b.end.toFixed(2)}s`));
  return { file: path.relative(ROOT, file), probe: p, loudness: l, black, luma, issues };
};

const isMain = process.argv[1] && path.resolve(process.argv[1]).endsWith("verify.ts");
if (isMain) {
  const { flags, positional } = args();
  const file = positional[0];
  if (!file) {
    console.error("Usage: npm run verify -- <video.mp4> [--expect-frames N]");
    process.exit(1);
  }
  const r = verifyVideo(path.resolve(ROOT, file), flags["expect-frames"] ? Number(flags["expect-frames"]) : undefined);
  console.log(JSON.stringify(r, null, 2));
  writeJson(path.resolve(ROOT, file) + ".verify.json", r);
  process.exit(r.issues.length ? 1 : 0);
}
