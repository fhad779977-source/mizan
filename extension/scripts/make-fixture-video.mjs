// يولّد مقطع اختبار (WebM: VP8 + Opus) بنغمة صوتية — يتطلب ffmpeg.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function makeFixtureVideo() {
  const out = resolve(dirname(fileURLToPath(import.meta.url)), '../tests/fixtures/clip.webm');
  if (existsSync(out)) return out;
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'lavfi', '-i', 'testsrc=size=640x360:rate=24:duration=7',
    '-f', 'lavfi', '-i', 'sine=frequency=440:duration=7',
    '-c:v', 'libvpx', '-b:v', '400k', '-c:a', 'libopus', '-shortest', out,
  ]);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(makeFixtureVideo());
