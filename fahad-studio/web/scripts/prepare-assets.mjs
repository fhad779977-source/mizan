// Web asset pipeline. For every entry in assets.config.json:
//  images → AVIF / WebP / JPEG at each width (never upscaled), dominant colour
//  videos → H.264 MP4 (+ VP9 WebM) for desktop and a lighter mobile encode,
//           muted, faststart, plus a JPEG/WebP poster
// Writes src/shared/media-manifest.json (used by <Picture>/<VideoBackground>)
// and assets-registry.json (dimensions, bytes, paths, rights).
// Run: npm run assets   (--force to re-encode everything)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { args, WEB } from "./lib.mjs";

const { flags } = args();
const cfg = JSON.parse(readFileSync(path.join(WEB, "assets.config.json"), "utf8"));
const OUT = path.join(WEB, "public", "media");
mkdirSync(OUT, { recursive: true });
const rel = (p) => path.relative(WEB, p);
const fresh = (out, src) => !flags.force && existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;
const kb = (p) => Math.round(statSync(p).size / 1024);
const manifest = { images: {}, videos: {} };
const registry = [];
const warnings = [];

for (const img of cfg.images) {
  const src = path.join(WEB, img.src);
  if (!existsSync(src)) {
    warnings.push(`missing source ${img.src} (id ${img.id})`);
    continue;
  }
  const meta = await sharp(src).metadata();
  const widths = img.widths.filter((w) => w <= meta.width);
  const { dominant } = await sharp(src).stats();
  const files = [];
  for (const w of widths) {
    const base = path.join(OUT, `${img.id}-${w}`);
    const pipe = () => sharp(src).resize({ width: w, withoutEnlargement: true });
    const targets = [
      [`${base}.avif`, (p) => pipe().avif({ quality: 52, effort: 5 }).toFile(p)],
      [`${base}.webp`, (p) => pipe().webp({ quality: 78, effort: 5 }).toFile(p)],
      [`${base}.jpg`, (p) => pipe().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(p)],
    ];
    for (const [file, make] of targets) {
      if (!fresh(file, src)) await make(file);
      files.push({ path: `/media/${path.basename(file)}`, bytes: statSync(file).size });
    }
    if (kb(`${base}.webp`) > 400) warnings.push(`${img.id}-${w}.webp is ${kb(`${base}.webp`)} KB`);
  }
  const color = `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  manifest.images[img.id] = { kind: "image", width: meta.width, height: meta.height, widths, base: `/media/${img.id}`, formats: ["avif", "webp", "jpg"], color };
  registry.push({ id: img.id, type: "image", source: img.source, license: img.license, usedIn: img.usedIn, sourceFile: img.src, width: meta.width, height: meta.height, files });
  console.log(`✓ image ${img.id}: ${meta.width}×${meta.height} → ${widths.join("/")} × avif/webp/jpg`);
}

const ffmpeg = (a) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" });
for (const v of cfg.videos) {
  const src = path.join(WEB, v.src);
  if (!existsSync(src)) {
    warnings.push(`missing source ${v.src} (id ${v.id})`);
    continue;
  }
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-of", "json", src]).toString()).streams.find((s) => s.codec_type === "video");
  const outs = {};
  for (const tier of ["desktop", "mobile"]) {
    const t = v[tier];
    const mp4 = path.join(OUT, `${v.id}-${tier}.mp4`);
    const webm = path.join(OUT, `${v.id}-${tier}.webm`);
    const scale = `scale=${t.width}:-2:flags=lanczos,format=yuv420p`;
    if (!fresh(mp4, src)) ffmpeg(["-i", src, "-an", "-vf", scale, "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", String(t.crf), "-movflags", "+faststart", mp4]);
    if (!fresh(webm, src)) ffmpeg(["-i", src, "-an", "-vf", scale, "-c:v", "libvpx-vp9", "-crf", String(t.vp9crf), "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", webm]);
    outs[tier] = { mp4: `/media/${path.basename(mp4)}`, webm: `/media/${path.basename(webm)}` };
    if (tier === "mobile" && kb(mp4) > 1500) warnings.push(`${v.id} mobile mp4 is ${kb(mp4)} KB (> 1.5 MB)`);
  }
  const posterPng = path.join(WEB, "assets-src", `${v.id}-poster.png`);
  if (!fresh(posterPng, src)) ffmpeg(["-ss", String(v.posterAt ?? 0), "-i", src, "-frames:v", "1", posterPng]);
  const posterJpg = path.join(OUT, `${v.id}-poster.jpg`);
  const posterWebp = path.join(OUT, `${v.id}-poster.webp`);
  await sharp(posterPng).resize({ width: 1600 }).jpeg({ quality: 76, mozjpeg: true, progressive: true }).toFile(posterJpg);
  await sharp(posterPng).resize({ width: 1600 }).webp({ quality: 74 }).toFile(posterWebp);
  manifest.videos[v.id] = { kind: "video", width: probe.width, height: probe.height, poster: `/media/${path.basename(posterJpg)}`, posterWebp: `/media/${path.basename(posterWebp)}`, desktop: outs.desktop, mobile: outs.mobile };
  const files = [...Object.values(outs).flatMap((o) => [o.mp4, o.webm]), `/media/${path.basename(posterJpg)}`, `/media/${path.basename(posterWebp)}`].map((p) => ({ path: p, bytes: statSync(path.join(WEB, "public", p)).size }));
  registry.push({ id: v.id, type: "video", source: v.source, license: v.license, usedIn: v.usedIn, sourceFile: v.src, width: probe.width, height: probe.height, durationSeconds: Number(probe.duration), files });
  console.log(`✓ video ${v.id}: ${probe.width}×${probe.height} ${Number(probe.duration).toFixed(1)}s → ${files.map((f) => `${path.basename(f.path)} ${Math.round(f.bytes / 1024)}KB`).join(", ")}`);
}

writeFileSync(path.join(WEB, "src", "shared", "media-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const fonts = ["InstrumentSerif-Regular", "InstrumentSerif-Italic", "InstrumentSans-400", "InstrumentSans-500", "InstrumentSans-600", "JetBrainsMono-400", "IBMPlexSansArabic-400", "IBMPlexSansArabic-600", "NotoKufiArabic-800", "NotoKufiArabic-900"].map((f) => ({
  id: `font-${f}`,
  type: "font",
  source: "@fontsource (Instrument Serif/Sans, JetBrains Mono, IBM Plex Sans Arabic) / Google Noto Kufi Arabic",
  license: "SIL OFL 1.1 — public/fonts/LICENSE-*.txt",
  files: [{ path: `/fonts/${f}.woff2`, bytes: statSync(path.join(WEB, "public", "fonts", `${f}.woff2`)).size }],
}));
const extra = [{ id: "concepts-vessel", type: "image", source: "Copy of fahad-studio/public/assets/images/vessel-study.png (studio render, abstract object)", license: "Owned by FAHAD STUDIO", usedIn: ["concept c03 capture source"], files: [{ path: "/concepts/vessel-study.png", bytes: statSync(path.join(WEB, "public", "concepts", "vessel-study.png")).size }] }];
writeFileSync(path.join(WEB, "assets-registry.json"), JSON.stringify({ $comment: "Generated by npm run assets — web assets with dimensions, sizes, paths and rights.", assets: [...registry, ...fonts, ...extra] }, null, 2) + "\n");
console.log(`manifest: ${rel(path.join(WEB, "src/shared/media-manifest.json"))} · registry: assets-registry.json`);
if (warnings.length) console.log("Warnings:\n- " + warnings.join("\n- "));
