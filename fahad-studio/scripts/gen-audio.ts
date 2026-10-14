// Synthesizes the studio's original sound kit (deterministic, seeded):
//   public/assets/audio/sfx/{whoosh,impact,tick,riser,shimmer}.wav
//   public/assets/audio/music/ambient-bed.wav
// 48 kHz / 16-bit stereo PCM. Peaks are normalized (SFX -3 dBFS, music
// -6 dBFS) so the timeline mix keeps headroom. Re-run: npm run gen-audio
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PUBLIC_DIR } from "./lib";

const SR = 48000;
const TAU = Math.PI * 2;

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Stereo = { L: Float32Array; R: Float32Array };
const buffer = (seconds: number): Stereo => ({ L: new Float32Array(Math.round(seconds * SR)), R: new Float32Array(Math.round(seconds * SR)) });

const normalize = (b: Stereo, peakDb: number) => {
  let peak = 0;
  for (let i = 0; i < b.L.length; i++) peak = Math.max(peak, Math.abs(b.L[i]), Math.abs(b.R[i]));
  const g = peak > 0 ? Math.pow(10, peakDb / 20) / peak : 1;
  for (let i = 0; i < b.L.length; i++) {
    b.L[i] *= g;
    b.R[i] *= g;
  }
};

// 2–3 ms fades at both ends so no file starts or ends with a click.
const declick = (b: Stereo) => {
  const n = Math.round(0.003 * SR);
  for (let i = 0; i < n; i++) {
    const g = i / n;
    b.L[i] *= g;
    b.R[i] *= g;
    b.L[b.L.length - 1 - i] *= g;
    b.R[b.R.length - 1 - i] *= g;
  }
};

const writeWav = (file: string, b: Stereo) => {
  const n = b.L.length;
  const data = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b.L[i])) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b.R[i])) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, Buffer.concat([h, data]));
  console.log(`wrote ${path.relative(PUBLIC_DIR, file)} (${(n / SR).toFixed(2)}s)`);
};

// State-variable band-pass, coefficient recomputed per sample (for sweeps).
const svf = () => {
  let low = 0;
  let band = 0;
  return (x: number, freq: number, q: number) => {
    const f = 2 * Math.sin((Math.PI * Math.min(freq, SR / 6)) / SR);
    low += f * band;
    const high = x - low - q * band;
    band += f * high;
    return { low, band, high };
  };
};

// Simple stereo feedback-delay "room" for tails.
const room = (b: Stereo, mix: number, seconds = 0.6) => {
  const taps = [0.031, 0.047, 0.071, 0.113].map((t) => Math.round(t * SR));
  const fb = Math.pow(0.001, 0.09 / seconds);
  const out: Stereo = { L: Float32Array.from(b.L), R: Float32Array.from(b.R) };
  const lines = taps.map((d) => ({ d, buf: new Float32Array(d), i: 0 }));
  for (let n = 0; n < b.L.length; n++) {
    const inp = (b.L[n] + b.R[n]) * 0.5;
    let wetL = 0;
    let wetR = 0;
    lines.forEach((ln, k) => {
      const y = ln.buf[ln.i];
      ln.buf[ln.i] = inp + y * fb * 0.5;
      ln.i = (ln.i + 1) % ln.d;
      if (k % 2 === 0) wetL += y;
      else wetR += y;
    });
    out.L[n] += wetL * mix;
    out.R[n] += wetR * mix;
  }
  return out;
};

const whoosh = () => {
  const dur = 0.9;
  const b = buffer(dur);
  const rnd = mulberry32(11);
  const fl = svf();
  const fr = svf();
  for (let i = 0; i < b.L.length; i++) {
    const t = i / SR / dur;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.25)), 2.2);
    const freq = 300 + 2600 * Math.sin(Math.PI * t);
    const nl = rnd() * 2 - 1;
    const nr = rnd() * 2 - 1;
    const pan = t; // left → right
    b.L[i] = fl(nl, freq, 0.9).band * env * (1.2 - pan * 0.7);
    b.R[i] = fr(nr, freq * 1.04, 0.9).band * env * (0.5 + pan * 0.7);
  }
  declick(b);
  normalize(b, -3);
  return b;
};

const impact = () => {
  const dur = 1.8;
  const b = buffer(dur);
  const rnd = mulberry32(23);
  const lp = svf();
  let phase = 0;
  for (let i = 0; i < b.L.length; i++) {
    const s = i / SR;
    const f = 38 + 52 * Math.exp(-s * 9); // pitch drop
    phase += (TAU * f) / SR;
    const body = Math.sin(phase) * Math.exp(-s * 2.4);
    const click = lp(rnd() * 2 - 1, 1800, 0.7).low * Math.exp(-s * 55) * 0.9;
    const v = Math.tanh((body + click) * 1.6);
    b.L[i] = v;
    b.R[i] = v;
  }
  const out = room(b, 0.18, 0.9);
  declick(out);
  normalize(out, -3);
  return out;
};

const tick = () => {
  const dur = 0.14;
  const b = buffer(dur);
  const rnd = mulberry32(5);
  const hp = svf();
  for (let i = 0; i < b.L.length; i++) {
    const s = i / SR;
    const tone = Math.sin(TAU * 2400 * s) * Math.exp(-s * 70);
    const noise = hp(rnd() * 2 - 1, 5000, 0.6).high * Math.exp(-s * 120);
    const v = tone * 0.6 + noise * 0.5;
    b.L[i] = v;
    b.R[i] = v;
  }
  declick(b);
  normalize(b, -3);
  return b;
};

const riser = () => {
  const dur = 1.5;
  const b = buffer(dur);
  const rnd = mulberry32(31);
  const f = svf();
  let ph = 0;
  for (let i = 0; i < b.L.length; i++) {
    const t = i / SR / dur;
    const env = Math.pow(t, 2.4) * (t > 0.97 ? (1 - t) / 0.03 : 1);
    const freq = 180 * Math.pow(7, t);
    ph += (TAU * freq) / SR;
    const n = f(rnd() * 2 - 1, 400 + 5000 * t, 0.8).band;
    const v = (Math.sin(ph) * 0.35 + n * 0.8) * env;
    b.L[i] = v;
    b.R[i] = v * 0.92;
  }
  declick(b);
  normalize(b, -3);
  return b;
};

const shimmer = () => {
  const dur = 2.6;
  const b = buffer(dur);
  // Inharmonic bell partials around A5, slightly detuned per channel.
  const partials = [1, 2.01, 2.76, 4.07, 5.43].map((r, k) => ({ f: 880 * r * 0.5, a: 0.5 / (k + 1), d: 1.6 + k * 0.6 }));
  for (let i = 0; i < b.L.length; i++) {
    const s = i / SR;
    let l = 0;
    let r = 0;
    partials.forEach((p) => {
      const e = Math.exp(-s * p.d) * Math.min(1, s * 200);
      l += Math.sin(TAU * p.f * s) * p.a * e;
      r += Math.sin(TAU * p.f * 1.003 * s) * p.a * e;
    });
    b.L[i] = l;
    b.R[i] = r;
  }
  const out = room(b, 0.25, 1.4);
  declick(out);
  normalize(out, -3);
  return out;
};

// Ambient bed: D minor (add9) pad from detuned saws through a slowly breathing
// low-pass, a sub-bass on D1/D2 and a soft pulse every two beats at 120 BPM.
const ambientBed = () => {
  const dur = 24;
  const b = buffer(dur);
  const notes = [73.42, 110.0, 146.83, 174.61, 220.0, 329.63]; // D2 A2 D3 F3 A3 E4
  const voices = notes.flatMap((f, k) => [-7, 0, 7].map((cents) => ({ f: f * Math.pow(2, cents / 1200), ph: (k * 0.37 + cents) % 1, pan: ((k % 3) - 1) * 0.5 })));
  const fl = svf();
  const fr = svf();
  for (let i = 0; i < b.L.length; i++) {
    const s = i / SR;
    let l = 0;
    let r = 0;
    voices.forEach((v) => {
      v.ph = (v.ph + v.f / SR) % 1;
      const saw = v.ph * 2 - 1;
      l += saw * (0.5 - v.pan * 0.5);
      r += saw * (0.5 + v.pan * 0.5);
    });
    const cutoff = 520 + 380 * Math.sin(TAU * s * 0.07) + 180 * Math.sin(TAU * s * 0.19);
    l = fl(l / voices.length, cutoff, 0.6).low;
    r = fr(r / voices.length, cutoff * 1.03, 0.6).low;
    const sub = Math.sin(TAU * 36.71 * s) * 0.22;
    const beatT = s % 1.0; // every 2 beats @120 BPM
    const pulse = Math.sin(TAU * (48 + 40 * Math.exp(-beatT * 30)) * beatT) * Math.exp(-beatT * 7) * 0.32;
    const swell = Math.min(1, s / 2);
    b.L[i] = (l * 1.6 + sub + pulse) * swell;
    b.R[i] = (r * 1.6 + sub + pulse) * swell;
  }
  const out = room(b, 0.12, 2.2);
  declick(out);
  normalize(out, -6);
  return out;
};

const sfxDir = path.join(PUBLIC_DIR, "assets/audio/sfx");
const musicDir = path.join(PUBLIC_DIR, "assets/audio/music");
writeWav(path.join(sfxDir, "whoosh.wav"), whoosh());
writeWav(path.join(sfxDir, "impact.wav"), impact());
writeWav(path.join(sfxDir, "tick.wav"), tick());
writeWav(path.join(sfxDir, "riser.wav"), riser());
writeWav(path.join(sfxDir, "shimmer.wav"), shimmer());
writeWav(path.join(musicDir, "ambient-bed.wav"), ambientBed());
