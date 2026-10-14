// ffprobe / ffmpeg measurements shared by render, verify and doctor.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const sh = (cmd: string, a: string[]) => {
  const r = spawnSync(cmd, a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};

export type Probe = {
  duration: number;
  video?: { codec: string; width: number; height: number; fps: number; pixFmt: string; frames: number };
  audio?: { codec: string; sampleRate: number; channels: number };
};

export const probe = (file: string): Probe => {
  const r = sh("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-count_frames", "-of", "json", file]);
  if (!r.ok) throw new Error(`ffprobe failed for ${file}: ${r.out}`);
  const j = JSON.parse(r.out);
  const v = j.streams.find((s: { codec_type: string }) => s.codec_type === "video");
  const a = j.streams.find((s: { codec_type: string }) => s.codec_type === "audio");
  const [n, d] = String(v?.r_frame_rate ?? "0/1").split("/").map(Number);
  return {
    duration: Number(j.format.duration),
    video: v ? { codec: v.codec_name, width: v.width, height: v.height, fps: n / d, pixFmt: v.pix_fmt, frames: Number(v.nb_read_frames) } : undefined,
    audio: a ? { codec: a.codec_name, sampleRate: Number(a.sample_rate), channels: a.channels } : undefined,
  };
};

export const loudness = (file: string) => {
  const r = sh("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true,volumedetect", "-f", "null", "-"]);
  // ebur128 logs per-frame values first; the summary block comes last.
  const summary = r.out.slice(r.out.lastIndexOf("Summary:"));
  const num = (re: RegExp) => {
    const m = summary.match(re) ?? r.out.match(re);
    return m ? Number(m[1]) : NaN;
  };
  return {
    integratedLufs: num(/I:\s+(-?[\d.]+) LUFS/),
    truePeakDbfs: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/),
    maxVolumeDb: num(/max_volume:\s+(-?[\d.]+) dB/),
  };
};

/** Near-black intervals (pixel luma < 6%, ≥ 98% of the picture, ≥ 2 frames). */
export const blackSegments = (file: string) => {
  const r = sh("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vf", "blackdetect=d=0.06:pix_th=0.06", "-an", "-f", "null", "-"]);
  return [...r.out.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => ({ start: Number(m[1]), end: Number(m[2]) }));
};

/** Mean luma per frame; reports the largest frame-to-frame jumps (flash/flicker candidates). */
export const lumaJumps = (file: string, top = 5) => {
  const r = sh("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-", "-an", "-f", "null", "-"]);
  const y = [...r.out.matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
  if (y.length === 0) throw new Error(`luma analysis produced no data for ${file}`);
  const jumps = y.slice(1).map((v, i) => ({ frame: i + 1, delta: Math.abs(v - y[i]) }));
  return { frames: y.length, minLuma: Math.min(...y), maxLuma: Math.max(...y), top: jumps.sort((a, b) => b.delta - a.delta).slice(0, top) };
};

export const LABEL_FONTS = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  "C:/Windows/Fonts/arialbd.ttf",
];
export const labelFont = () => LABEL_FONTS.find((f) => existsSync(f));
