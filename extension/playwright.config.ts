import { defineConfig } from '@playwright/test';

/**
 * اختبارات E2E: تحمّل الإضافة المبنية (dist) في Chromium حقيقي، وتخدم صفحة تحاكي X
 * على عناوين https://x.com و https://twitter.com، مع خادم الترجمة في وضع التجربة.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  webServer: {
    command: 'node ../server/dist/index.js',
    url: 'http://localhost:8787/api/health',
    reuseExistingServer: false,
    env: { PROVIDER_MODE: 'mock', PORT: '8787' },
    timeout: 30_000,
  },
});
