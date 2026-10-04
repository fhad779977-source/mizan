// فحص ما بعد البناء: الملفات المطلوبة موجودة، ولا توجد مفاتيح API داخل الإضافة.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const required = ['manifest.json', 'content.js', 'background.js', 'options.html', 'popup.html', 'privacy.html', 'icons/icon128.png'];
const missing = required.filter((f) => !existsSync(join(dist, f)));
if (missing.length) {
  console.error('✗ ملفات ناقصة في dist:', missing.join(', '));
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(dist, 'manifest.json'), 'utf8'));
for (const file of [manifest.background.service_worker, ...manifest.content_scripts.flatMap((c) => c.js)]) {
  if (!existsSync(join(dist, file))) {
    console.error(`✗ manifest يشير إلى ملف غير موجود: ${file}`);
    process.exit(1);
  }
}

const content = readFileSync(join(dist, 'content.js'), 'utf8');
if (/^\s*import[\s{]/m.test(content)) {
  console.error('✗ content.js يحتوي import — يجب أن يكون ملفًا واحدًا (IIFE)');
  process.exit(1);
}

const SECRET_PATTERNS = [/sk-[A-Za-z0-9_-]{20,}/, /sk-ant-[A-Za-z0-9_-]{10,}/, /OPENAI_API_KEY\s*[:=]\s*["'][^"']+/, /ANTHROPIC_API_KEY\s*[:=]\s*["'][^"']+/];
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
for (const file of walk(dist).filter((f) => /\.(js|html|json|css)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  const hit = SECRET_PATTERNS.find((re) => re.test(text));
  if (hit) {
    console.error(`✗ يبدو أن هناك مفتاح API داخل ${file}`);
    process.exit(1);
  }
}
console.log('✓ build verified: all files present, no API keys inside the extension');
