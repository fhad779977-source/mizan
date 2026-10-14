// Environment and studio health check. Read-only: installs nothing.
//   npm run doctor
import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { capture, PUBLIC_DIR, readJson, ROOT } from "./lib";

type Row = [status: "ok" | "warn" | "fail" | "info", item: string, detail: string];
const rows: Row[] = [];
const add = (...r: Row) => rows.push(r);
const ver = (cmd: string, a: string[], re: RegExp) => {
  const r = capture(cmd, a);
  return r.ok ? (r.out.match(re)?.[1] ?? r.out.split("\n")[0]) : null;
};

// System
add("info", "OS", `${os.type()} ${os.release()} ${os.arch()}`);
add("info", "CPU", `${os.cpus()[0]?.model ?? "?"} × ${os.cpus().length}`);
add("info", "Memory", `${(os.totalmem() / 2 ** 30).toFixed(1)} GB total, ${(os.freemem() / 2 ** 30).toFixed(1)} GB free`);
const df = capture("df", ["-Pk", ROOT]).out.split("\n")[1]?.split(/\s+/);
if (df) {
  const freeGb = Number(df[3]) / 2 ** 20;
  add(freeGb > 5 ? "ok" : "warn", "Disk free", `${freeGb.toFixed(1)} GB at ${df[5]}`);
}

// Toolchain
const node = process.versions.node;
add(Number(node.split(".")[0]) >= 18 ? "ok" : "fail", "Node.js", node);
const npm = ver("npm", ["-v"], /([\d.]+)/);
add(npm ? "ok" : "fail", "npm", npm ?? "not found");
const git = ver("git", ["--version"], /version ([\d.]+)/);
add(git ? "ok" : "warn", "Git", git ?? "not found");
const ff = ver("ffmpeg", ["-version"], /ffmpeg version (\S+)/);
add(ff ? "ok" : "fail", "FFmpeg", ff ?? "not found — install FFmpeg for verify/contact-sheet");
const fp = ver("ffprobe", ["-version"], /ffprobe version (\S+)/);
add(fp ? "ok" : "fail", "ffprobe", fp ?? "not found");
const browser = [process.env.FAHAD_BROWSER, "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"].find((p) => p && existsSync(p));
add("ok", "Render browser", browser ? `${browser}` : "Remotion-managed Chrome Headless Shell (downloaded on first render)");
add("info", "WebGL renderer", process.env.FAHAD_GL ?? "swangle (software; set FAHAD_GL=angle on a GPU machine)");

// Packages — all @remotion/* must share one version.
const pkg = readJson<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }>(path.join(ROOT, "package.json"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const remotionVersions = Object.entries(deps).filter(([k]) => k === "remotion" || k.startsWith("@remotion/"));
const installed = remotionVersions.map(([k]) => {
  const p = path.join(ROOT, "node_modules", k, "package.json");
  return [k, existsSync(p) ? readJson<{ version: string }>(p).version : "missing"] as const;
});
const unique = new Set(installed.map(([, v]) => v));
add(unique.size === 1 && !unique.has("missing") ? "ok" : "fail", "Remotion packages", installed.map(([k, v]) => `${k}@${v}`).join(", "));
["react", "three", "@react-three/fiber", "zod", "typescript"].forEach((k) => {
  const p = path.join(ROOT, "node_modules", k, "package.json");
  add(existsSync(p) ? "ok" : "fail", k, existsSync(p) ? readJson<{ version: string }>(p).version : "missing — run npm ci");
});
add(existsSync(path.join(ROOT, "package-lock.json")) ? "ok" : "warn", "Lockfile", "package-lock.json");

// Skills
const skillsDir = path.join(ROOT, ".claude", "skills");
const skills = existsSync(skillsDir) ? readdirSync(skillsDir).filter((d) => existsSync(path.join(skillsDir, d, "SKILL.md"))) : [];
const official = skills.filter((s) => s.startsWith("remotion-"));
const studio = skills.filter((s) => s.startsWith("studio-"));
add(official.length ? "ok" : "warn", "Remotion skills", `${official.length}: ${official.join(", ")}`);
add(studio.length >= 5 ? "ok" : "warn", "Studio skills", `${studio.length}: ${studio.join(", ")}`);
const webSkills = skills.filter((s) => s.startsWith("web-") || s === "asset-prepare");
add(webSkills.length >= 5 ? "ok" : "warn", "Web skills", `${webSkills.length}: ${webSkills.join(", ")}`);

// Web section (separate package in web/)
const webPkg = path.join(ROOT, "web", "package.json");
if (existsSync(webPkg)) {
  const wv = (k: string) => {
    const p = path.join(ROOT, "web", "node_modules", k, "package.json");
    return existsSync(p) ? readJson<{ version: string }>(p).version : null;
  };
  const parts = ["vite", "react", "gsap", "sharp", "playwright"].map((k) => `${k}@${wv(k) ?? "missing"}`);
  add(parts.every((x) => !x.endsWith("missing")) ? "ok" : "warn", "Web section", parts.join(", ") + (parts.some((x) => x.endsWith("missing")) ? " — run npm run web:install" : ""));
  const media = existsSync(path.join(ROOT, "web", "public", "media")) ? readdirSync(path.join(ROOT, "web", "public", "media")).length : 0;
  add(media > 0 ? "ok" : "warn", "Web media", `${media} prepared files in web/public/media`);
}

// Assets
const fonts = readdirSync(path.join(PUBLIC_DIR, "assets/fonts")).filter((f) => f.endsWith(".woff2"));
add(fonts.length >= 3 ? "ok" : "fail", "Local fonts", `${fonts.length} woff2 files`);
const audio = ["sfx/whoosh.wav", "sfx/impact.wav", "sfx/tick.wav", "sfx/riser.wav", "sfx/shimmer.wav", "music/ambient-bed.wav"].filter(
  (f) => !existsSync(path.join(PUBLIC_DIR, "assets/audio", f)),
);
add(audio.length === 0 ? "ok" : "warn", "Sound kit", audio.length ? `missing ${audio.join(", ")} — npm run gen-audio` : "6 files");

// Optional integrations (detected, never installed)
const which = (bin: string) => capture("sh", ["-c", `command -v ${bin}`]).ok;
add(which("whisper-cli") || which("whisper") || existsSync(path.join(ROOT, "whisper.cpp")) ? "ok" : "info", "Whisper (local transcription)", which("whisper-cli") || which("whisper") ? "found" : "not installed — optional, see docs/INTEGRATIONS.md");
add(process.env.ELEVENLABS_API_KEY ? "ok" : "info", "ElevenLabs (TTS)", process.env.ELEVENLABS_API_KEY ? "API key present (not validated, paid API)" : "no ELEVENLABS_API_KEY — optional, paid");
add(which("blender") ? "ok" : "info", "Blender", which("blender") ? capture("blender", ["--version"]).out.split("\n")[0] : "not installed — optional");
add("info", "After Effects", os.platform() === "linux" ? "not available on Linux" : "not detected by doctor — optional");

const icon = { ok: "✓", warn: "!", fail: "✗", info: "·" };
const w = Math.max(...rows.map((r) => r[1].length));
rows.forEach(([s, k, d]) => console.log(`${icon[s]} ${k.padEnd(w)}  ${d}`));
const fails = rows.filter((r) => r[0] === "fail").length;
console.log(`\n${fails ? "FAIL" : "OK"} — ${fails} blocking issue(s)`);
process.exit(fails ? 1 : 0);
