import { getSettings } from '../lib/settings';
import type { BackgroundRequest, BackgroundResponse, Settings } from '../lib/types';

/**
 * Service Worker: الوسيط الوحيد بين صفحة X والخادم.
 * - لا يحتوي أي مفتاح API (المفاتيح على الخادم فقط).
 * - لا يرسل شيئًا إلا استجابةً لطلب صريح من content script (بعد ضغط المستخدم).
 */

const controllers = new Map<string, AbortController>();
const REQUEST_TIMEOUT_MS = 120_000;

// نسمح لـ content script بقراءة التخزين المؤقت للجلسة (يُمسح عند إغلاق المتصفح)
void chrome.storage.session?.setAccessLevel?.({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

class RequestError extends Error {
  constructor(public code: string, public aborted = false) {
    super(code);
  }
}

function isLocalServer(url: string): boolean {
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(url);
}

async function ensurePermission(serverUrl: string): Promise<void> {
  if (isLocalServer(serverUrl)) return;
  if (!/^https:\/\//.test(serverUrl)) throw new RequestError('permission_missing');
  const origin = `${new URL(serverUrl).origin}/*`;
  const granted = await chrome.permissions.contains({ origins: [origin] });
  if (!granted) throw new RequestError('permission_missing');
}

async function callServer<T>(settings: Settings, path: string, init: RequestInit, requestId?: string): Promise<T> {
  await ensurePermission(settings.serverUrl);
  const controller = new AbortController();
  if (requestId) controllers.set(requestId, controller);
  const timeout = setTimeout(() => controller.abort('timeout'), REQUEST_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (settings.accessToken) headers['X-XAC-Token'] = settings.accessToken;
    let res: Response;
    try {
      res = await fetch(`${settings.serverUrl}${path}`, { ...init, headers, signal: controller.signal });
    } catch {
      if (controller.signal.aborted && controller.signal.reason !== 'timeout') throw new RequestError('aborted', true);
      throw new RequestError('server_unreachable');
    }
    if (res.status === 401) throw new RequestError('unauthorized');
    if (!res.ok) throw new RequestError(`http_${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
    if (requestId) controllers.delete(requestId);
  }
}

async function handle(message: BackgroundRequest): Promise<unknown> {
  const settings = await getSettings();
  switch (message.type) {
    case 'xac:health':
      return callServer(settings, '/api/health', { method: 'GET' });

    case 'xac:process-chunk':
      return callServer(
        settings,
        '/api/process-video',
        {
          method: 'POST',
          body: JSON.stringify({
            ...message.payload,
            sourceLanguage: settings.sourceLanguage,
            targetLanguage: settings.targetLanguage,
            strict: settings.strictModeration,
            mockScenario: settings.mockScenario,
          }),
        },
        message.requestId,
      );

    case 'xac:translate-text':
      return callServer(
        settings,
        '/api/translate',
        {
          method: 'POST',
          body: JSON.stringify({
            text: message.text,
            sourceLanguage: message.sourceLanguage,
            targetLanguage: settings.targetLanguage,
            strict: settings.strictModeration,
            mockScenario: settings.mockScenario,
          }),
        },
        message.requestId,
      );

    case 'xac:abort':
      controllers.get(message.requestId)?.abort('user');
      controllers.delete(message.requestId);
      return { aborted: true };

    case 'xac:open-options':
      await chrome.runtime.openOptionsPage();
      return { opened: true };

    default:
      throw new RequestError('unknown_message');
  }
}

chrome.runtime.onMessage.addListener((message: BackgroundRequest, sender, sendResponse) => {
  // نقبل الرسائل من الإضافة نفسها فقط
  if (sender.id !== chrome.runtime.id) return false;
  handle(message)
    .then((data) => sendResponse({ ok: true, data } satisfies BackgroundResponse<unknown>))
    .catch((err: unknown) => {
      const e = err instanceof RequestError ? err : new RequestError('internal_error');
      sendResponse({ ok: false, error: e.code, aborted: e.aborted } satisfies BackgroundResponse<unknown>);
    });
  return true; // رد غير متزامن
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') void chrome.runtime.openOptionsPage();
});
