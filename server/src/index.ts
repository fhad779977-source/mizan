import { createApp } from './app.js';
import { loadConfig, loadDotEnv } from './config.js';
import { createProviders } from './providers/index.js';

loadDotEnv();
const config = loadConfig();
const providers = createProviders(config);
const app = createApp({ config, providers });

app.listen(config.port, () => {
  console.log(`X Arabic Clean server → http://localhost:${config.port}/api/health`);
  console.log(
    providers.mode === 'mock'
      ? 'الوضع: تجريبي (Mock) — أضف مفاتيح API في .env لتشغيل الترجمة الحقيقية'
      : 'الوضع: حقيقي (Live)',
  );
  for (const w of providers.warnings) console.warn(`تنبيه: ${w}`);
});
