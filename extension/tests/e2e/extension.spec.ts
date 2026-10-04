import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect, test as base, type BrowserContext, type Page, type Worker } from '@playwright/test';
import { makeFixtureVideo } from '../../scripts/make-fixture-video.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(here, '../../dist');
const FIXTURE_HTML = readFileSync(resolve(here, '../fixtures/x-timeline.html'), 'utf8');
const VIDEO = readFileSync(makeFixtureVideo());

type Fixtures = { context: BrowserContext; worker: Worker; extensionId: string };

const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: true,
      args: [`--disable-extensions-except=${DIST}`, `--load-extension=${DIST}`, '--autoplay-policy=no-user-gesture-required'],
    });
    // نخدم صفحة الاختبار على عناوين X الحقيقية (بدون الاتصال بالإنترنت)
    for (const host of ['https://x.com', 'https://twitter.com']) {
      await context.route(`${host}/**`, (route) => {
        const url = new URL(route.request().url());
        if (url.pathname === '/__fixture/clip.webm') {
          return route.fulfill({ status: 200, contentType: 'video/webm', body: VIDEO, headers: { 'Accept-Ranges': 'none' } });
        }
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: FIXTURE_HTML });
      });
    }
    await use(context);
    await context.close();
  },
  worker: async ({ context }, use) => {
    let [worker] = context.serviceWorkers();
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await use(worker);
  },
  extensionId: async ({ worker }, use) => {
    await use(new URL(worker.url()).host);
  },
});

async function setSettings(worker: Worker, patch: Record<string, unknown>) {
  await worker.evaluate(async (p) => {
    await chrome.storage.sync.set(p);
  }, patch);
}

async function openTimeline(context: BrowserContext, url = 'https://x.com/home'): Promise<Page> {
  const page = await context.newPage();
  await page.goto(url);
  await expect(page.locator('[data-xac-host="video"]').first()).toBeAttached();
  return page;
}

const hostCount = (page: Page, kind: string) => page.evaluate((k) => document.querySelectorAll(`[data-xac-host="${k}"]`).length, kind);

test('shows exactly one translate button per video on x.com and twitter.com', async ({ context }) => {
  for (const url of ['https://x.com/home', 'https://twitter.com/home']) {
    const page = await openTimeline(context, url);
    await expect(page.getByRole('button', { name: 'ترجم', exact: true })).toHaveCount(1);
    expect(await hostCount(page, 'video')).toBe(1);
    // تغريدة عربية وحساب محمي: بدون زر ترجمة
    expect(await hostCount(page, 'tweet')).toBe(1);
    await page.close();
  }
});

test('detects new videos while scrolling without duplicating buttons', async ({ context }) => {
  const page = await openTimeline(context);
  await page.evaluate(() => (window as unknown as { addVideoTweet: (n: number) => void }).addVideoTweet(1));
  await page.evaluate(() => (window as unknown as { addVideoTweet: (n: number) => void }).addVideoTweet(2));
  await expect.poll(() => hostCount(page, 'video')).toBe(3);
  // تغييرات DOM إضافية لا تكرر الأزرار
  await page.evaluate(() => document.body.appendChild(document.createElement('div')));
  await page.waitForTimeout(500);
  expect(await hostCount(page, 'video')).toBe(3);
  await expect(page.getByRole('button', { name: 'ترجم', exact: true })).toHaveCount(3);
});

test('mock translation of a clean video shows synced Arabic subtitles over the video', async ({ context, worker }) => {
  await setSettings(worker, { mockScenario: 'clean', chunkSeconds: 3 });
  const page = await openTimeline(context);
  await expect(page.getByText('تجريبي').first()).toBeVisible(); // وضع التجربة ظاهر بوضوح
  await page.getByRole('button', { name: 'ترجم', exact: true }).click();
  const subtitle = page.locator('[data-xac-subtitle]');
  await expect(subtitle).toBeVisible({ timeout: 20_000 });
  await expect(subtitle).toContainText(/[؀-ۿ]/);
  await page.locator('#t1').screenshot({ path: 'e2e-screens/clean-translation.png' });
  // التحكم: إخفاء/إظهار الترجمة
  await page.getByRole('button', { name: 'إخفاء الترجمة' }).click();
  await expect(subtitle).toHaveCount(0);
  await page.getByRole('button', { name: 'إظهار الترجمة' }).click();
  await expect(page.locator('[data-xac-subtitle]')).toBeVisible({ timeout: 10_000 });
  // حذف النتيجة فورًا
  await page.locator('[data-xac-action="more"]').click();
  await page.locator('[data-xac-action="delete"]').click();
  await expect(page.locator('[data-xac-subtitle]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'ترجم', exact: true })).toBeVisible();
});

test('rejected content is not translated and the clip is hidden', async ({ context, worker }) => {
  await setSettings(worker, { mockScenario: 'rejected', chunkSeconds: 3 });
  const page = await openTimeline(context);
  await page.getByRole('button', { name: 'ترجم', exact: true }).click();
  const hidden = page.locator('[data-xac-state="rejected-hidden"]');
  await expect(hidden).toBeVisible({ timeout: 20_000 });
  await expect(hidden).toContainText('لم تتم ترجمة هذا المقطع لأنه لا يطابق سياسة المحتوى النظيف.');
  await expect(page.locator('[data-xac-subtitle]')).toHaveCount(0);
  await page.locator('#t1').screenshot({ path: 'e2e-screens/rejected.png' });
  expect(await page.evaluate(() => (document.getElementById('v1') as HTMLVideoElement).paused)).toBe(true);
  // النص الأصلي المرفوض لا يظهر في أي مكان
  expect(await page.evaluate(() => document.documentElement.outerHTML)).not.toMatch(/nudity|porn/i);
});

test('uncertain content is blocked and asks for another clip', async ({ context, worker }) => {
  await setSettings(worker, { mockScenario: 'uncertain', chunkSeconds: 3 });
  const page = await openTimeline(context);
  await page.getByRole('button', { name: 'ترجم', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('اختر مقطعًا آخر', { timeout: 20_000 });
  await expect(page.locator('[data-xac-subtitle]')).toHaveCount(0);
});

test('translates tweet text below the tweet and can hide it', async ({ context, worker }) => {
  await setSettings(worker, { mockScenario: 'clean' });
  const page = await openTimeline(context);
  await page.getByRole('button', { name: 'ترجم التغريدة' }).click();
  const box = page.locator('[data-xac-tweet-translation]');
  await expect(box).toContainText('مرحبًا بالجميع');
  await page.getByRole('button', { name: 'إخفاء الترجمة' }).click();
  await expect(box).toHaveCount(0);
});

test('adapts to X dark mode', async ({ context }) => {
  const page = await openTimeline(context, 'https://x.com/home?theme=dark');
  await expect(page.locator('[data-xac-tweet]')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'ترجم التغريدة' }).click();
  await expect(page.locator('[data-xac-tweet-translation]')).toBeVisible();
  await page.locator('#t1').screenshot({ path: 'e2e-screens/dark-mode.png' });
  const light = await openTimeline(context, 'https://x.com/home');
  await expect(light.locator('[data-xac-tweet]')).toHaveAttribute('data-theme', 'light');
});

test('never runs on direct messages', async ({ context }) => {
  const page = await context.newPage();
  await page.goto('https://x.com/messages');
  await page.waitForTimeout(800);
  expect(await hostCount(page, 'video')).toBe(0);
  expect(await hostCount(page, 'tweet')).toBe(0);
});

test('options page shows mock mode notice and saves settings', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await expect(page.getByTestId('mock-banner')).toContainText('وضع التجربة مفعّل — أضف مفاتيح API لتشغيل الترجمة الحقيقية.');
  await expect(page.locator('input[name="translationMode"][value="manual"]')).toBeChecked();
  await expect(page.locator('input[name="strictModeration"]')).toBeChecked();
  await expect(page.locator('input[name="hideUnsafeContent"]')).toBeChecked();
  await page.locator('input[name="showOriginal"]').check();
  await page.locator('input[name="translationMode"][value="auto"]').check();
  await page.screenshot({ path: 'e2e-screens/options.png', fullPage: true });
  await page.reload();
  await expect(page.locator('input[name="showOriginal"]')).toBeChecked();
  await expect(page.locator('input[name="translationMode"][value="auto"]')).toBeChecked();
});
