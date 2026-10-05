// يضبط توقيت المشاهد والترجمة على ملف صوت التعليق.
// الطريقة: نكتشف الوقفات في الصوت (ffmpeg silencedetect)، نوزّع جمل التعليق على زمن الكلام
// حسب طول كل جملة، ثم نلصق حدود الجمل على أقرب وقفة حقيقية.
// الاستخدام: node scripts/sync.mjs episodes/day01.json voices/day01.mp3
// الناتج: out/<id>.timed.json + out/<id>-voice.m4a (بعد قص الصمت في البداية)
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [episodePath, audioPath] = process.argv.slice(2);
if (!episodePath || !audioPath) {
  console.error('الاستخدام: node scripts/sync.mjs episodes/<id>.json voices/<id>.mp3');
  process.exit(1);
}
const ep = JSON.parse(readFileSync(resolve(episodePath), 'utf8'));
if (!ep.narration?.length) throw new Error('ملف الحلقة لا يحتوي narration');

const LEAD = 0.4; // صمت نتركه قبل أول كلمة
const TAIL = 1.8; // وقت إضافي بعد آخر كلمة للخاتمة
const SNAP = 1.3; // أقصى مسافة للصق حد الجملة على وقفة

const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audioPath]).toString());
const log = spawnSync('ffmpeg', ['-i', audioPath, '-af', 'silencedetect=noise=-35dB:d=0.3', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const silences = [];
let open = null;
for (const m of log.matchAll(/silence_(start|end): ([\d.]+)/g)) {
  if (m[1] === 'start') open = Number(m[2]);
  else { silences.push([open ?? 0, Number(m[2])]); open = null; }
}
if (open !== null) silences.push([open, duration]);

// فترات الكلام = ما بين الوقفات
const speech = [];
let cursor = 0;
for (const [a, b] of silences) {
  if (a > cursor + 0.05) speech.push([cursor, a]);
  cursor = b;
}
if (cursor < duration - 0.05) speech.push([cursor, duration]);
const speechTotal = speech.reduce((s, [a, b]) => s + (b - a), 0);

/** يحوّل زمن كلام تراكمي إلى زمن حقيقي داخل الملف */
function speechToReal(x) {
  for (const [a, b] of speech) {
    if (x <= b - a) return a + x;
    x -= b - a;
  }
  return speech.at(-1)[1];
}

const weights = ep.narration.map((l) => l.spoken.replace(/[\s،,.:!؟?]/g, '').length);
const totalW = weights.reduce((a, b) => a + b, 0);
const firstSpeech = speech[0][0];
const lastSpeech = speech.at(-1)[1];
const trim = Math.max(0, firstSpeech - LEAD);

let acc = 0;
const bounds = weights.slice(0, -1).map((w) => {
  acc += w;
  const est = speechToReal((acc / totalW) * speechTotal);
  const near = silences
    .filter(([a, b]) => a > firstSpeech && b < lastSpeech)
    .map(([a, b]) => ({ a, b, d: Math.abs((a + b) / 2 - est) }))
    .sort((x, y) => x.d - y.d)[0];
  return near && near.d <= SNAP ? { end: near.a, start: near.b } : { end: est, start: est };
});

const times = ep.narration.map((_, i) => ({
  start: (i === 0 ? firstSpeech : bounds[i - 1].start) - trim,
  end: (i === ep.narration.length - 1 ? lastSpeech + 0.3 : bounds[i].end + 0.15) - trim,
}));
const total = Math.ceil((lastSpeech - trim + TAIL) * 10) / 10;

const r2 = (n) => Math.round(n * 100) / 100;
const subtitles = ep.narration.map((l, i) => [r2(times[i].start), r2(times[i].end), l.text]);
const sceneStarts = ep.scenes.map((_, si) => {
  const idx = ep.narration.findIndex((l) => l.scene === si);
  if (idx < 0) throw new Error(`المشهد ${si} بلا جمل في narration`);
  return si === 0 ? 0 : r2(times[idx].start - 0.25);
});
const scenes = ep.scenes.map((s, i) => ({ ...s, start: sceneStarts[i], end: i + 1 < ep.scenes.length ? sceneStarts[i + 1] + 0.3 : total }));

const outDir = resolve(root, 'out');
mkdirSync(outDir, { recursive: true });
const timed = { ...ep, duration: total, scenes, subtitles, audio: resolve(outDir, `${ep.id}-voice.m4a`) };
writeFileSync(resolve(outDir, `${ep.id}.timed.json`), JSON.stringify(timed, null, 2));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(trim), '-i', audioPath, '-c:a', 'aac', '-b:a', '192k', timed.audio]);
console.log(`audio ${duration.toFixed(1)}s → video ${total}s (trimmed ${trim.toFixed(2)}s lead)`);
subtitles.forEach(([a, b, t]) => console.log(`${a.toFixed(2).padStart(6)} → ${b.toFixed(2).padStart(6)}  ${t}`));
