// يحوّل ملف حلقة (episodes/*.json) إلى فيديو MP4 عمودي للتيك توك.
// الاستخدام:
//   node scripts/render.mjs episodes/day01-haaland-record.json            ← فيديو كامل
//   node scripts/render.mjs episodes/day01-haaland-record.json --preview  ← صور معاينة فقط
//   node scripts/render.mjs episodes/day01.json --audio voice.mp3         ← مع تعليق صوتي
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const episodePath = args.find((a) => a.endsWith('.json'));
if (!episodePath) {
  console.error('حدد ملف الحلقة: node scripts/render.mjs episodes/<name>.json');
  process.exit(1);
}
const preview = args.includes('--preview');
const audioIdx = args.indexOf('--audio');
const audio = audioIdx >= 0 ? resolve(args[audioIdx + 1]) : null;
// ملف timed.json الناتج من sync.mjs يحمل مسار الصوت بنفسه
const FPS = 30;

const episode = JSON.parse(readFileSync(resolve(episodePath), 'utf8'));
const outDir = resolve(root, 'out');
const framesDir = resolve(outDir, `${episode.id}-frames`);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium', headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.addInitScript((ep) => { window.EPISODE = ep; }, episode);
await page.goto(pathToFileURL(resolve(root, 'template/video.html')).href);
await page.evaluate(() => document.fonts.ready);

if (preview) {
  const shots = episode.scenes.map((s) => Math.min(s.end - 0.5, s.start + (s.end - s.start) * 0.75));
  const files = [];
  for (const t of shots) {
    await page.evaluate((t) => window.render(t), t);
    const file = resolve(outDir, `${episode.id}-preview-${t.toFixed(1)}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 85 });
    files.push(file);
  }
  await browser.close();
  const sheet = resolve(outDir, `${episode.id}-preview.jpg`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]),
    '-filter_complex', `${files.map((_, i) => `[${i}]`).join('')}hstack=${files.length},scale=${files.length * 270}:-1`, sheet]);
  files.forEach((f) => rmSync(f));
  console.log('preview →', sheet);
  process.exit(0);
}

rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });
const total = Math.round(episode.duration * FPS);
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.render(t), i / FPS);
  await page.screenshot({ path: resolve(framesDir, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
  if (i % (FPS * 10) === 0) console.log(`frames ${i}/${total}`);
}
await browser.close();

const out = resolve(outDir, `${episode.id}.mp4`);
const ffArgs = ['-v', 'error', '-y', '-framerate', String(FPS), '-i', resolve(framesDir, 'f%05d.jpg')];
const voice = audio ?? episode.audio ?? null;
if (voice) ffArgs.push('-i', voice, '-af', 'apad', '-c:a', 'aac', '-b:a', '192k', '-shortest'); // apad: لا يُقص آخر الفيديو إذا انتهى الصوت قبله
else ffArgs.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-c:a', 'aac', '-shortest');
ffArgs.push('-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '18', '-r', String(FPS), '-movflags', '+faststart', out);
execFileSync('ffmpeg', ffArgs);
rmSync(framesDir, { recursive: true, force: true });
console.log('video →', out, `(${basename(episodePath)})`);
