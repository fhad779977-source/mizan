import { TweetTranslation } from '../components/TweetTranslation';
import { VideoOverlay } from '../components/VideoOverlay';
import { blobToBase64, MediaElementCapture } from '../lib/capture';
import { describeError, newRequestId, sendToBackground } from '../lib/messaging';
import { VideoTranslationSession } from '../lib/session';
import { flagAccount, getFlaggedAccounts, getSettings, onSettingsChanged } from '../lib/settings';
import { detectXTheme } from '../lib/theme';
import type { HealthResult, ProcessResult, Segment } from '../lib/types';
import { isSupportedHost, tweetInfo } from '../lib/x-dom';
import { createShadowHost } from './mount';
import { XScanner, type Mounted } from './scanner';
import { healthStore, settingsStore, themeStore } from './stores';

const HIDDEN_ATTR = 'data-xac-hidden';
const CACHE_PREFIX = 'xac-result:';
let flagged = new Set<string>();

/** نمط عام صغير لإخفاء التغريدات غير المناسبة فقط (لا يغيّر تصميم X) */
function injectGlobalStyle(): void {
  if (document.getElementById('xac-global-style')) return;
  const style = document.createElement('style');
  style.id = 'xac-global-style';
  style.textContent = `
    article[${HIDDEN_ATTR}] > div { display: none !important; }
    article[${HIDDEN_ATTR}]::before {
      display: block; padding: 14px 16px; direction: rtl; font: 14px/1.6 -apple-system, "Segoe UI", Tahoma, sans-serif;
      color: rgb(113, 118, 123);
      content: "تم إخفاء هذه التغريدة لأنها لا تطابق سياسة المحتوى النظيف.";
    }
    article[${HIDDEN_ATTR}="account"]::before { content: "تم إخفاء تغريدة من حساب سبق أن نشر محتوى غير نظيف."; }
  `;
  document.head.appendChild(style);
}

function hideArticle(article: Element | null, reason: 'content' | 'account'): void {
  if (article && !article.hasAttribute(HIDDEN_ATTR)) article.setAttribute(HIDDEN_ATTR, reason);
}

async function handleRejected(article: Element | null): Promise<void> {
  const settings = settingsStore.get();
  const { handle } = tweetInfo(article);
  if (settings.hideUnsafeAccounts && handle) {
    await flagAccount(handle);
    flagged.add(handle.toLowerCase());
  }
}

async function readCache(tweetId: string | undefined): Promise<{ segments: Segment[]; mock: boolean } | null> {
  if (!tweetId || settingsStore.get().deleteAfterProcessing || !chrome.storage.session) return null;
  try {
    const data = await chrome.storage.session.get(CACHE_PREFIX + tweetId);
    return (data[CACHE_PREFIX + tweetId] as { segments: Segment[]; mock: boolean }) ?? null;
  } catch {
    return null;
  }
}

function writeCache(tweetId: string | undefined, value: { segments: Segment[]; mock: boolean } | null): void {
  if (!tweetId || !chrome.storage.session) return;
  const key = CACHE_PREFIX + tweetId;
  const op = value && !settingsStore.get().deleteAfterProcessing
    ? chrome.storage.session.set({ [key]: value })
    : chrome.storage.session.remove(key);
  void op.catch(() => undefined);
}

function mountVideo({ video, container, article }: { video: HTMLVideoElement; container: HTMLElement; article: Element | null }): Mounted {
  const info = tweetInfo(article);
  const session = new VideoTranslationSession(video, {
    createCapture: (v) => new MediaElementCapture(v, settingsStore.get().chunkSeconds),
    encodeAudio: blobToBase64,
    processChunk: (payload, requestId) => sendToBackground<ProcessResult>({ type: 'xac:process-chunk', requestId, payload }),
    abort: (requestId) => void sendToBackground({ type: 'xac:abort', requestId }).catch(() => undefined),
    newRequestId,
    describeError,
  });

  const unsubscribe = session.subscribe(() => {
    const snap = session.getSnapshot();
    if (snap.status === 'rejected') {
      if (settingsStore.get().hideUnsafeContent) video.pause();
      void handleRejected(article);
      writeCache(info.tweetId, null);
    } else if (snap.status === 'ready') {
      writeCache(info.tweetId, { segments: snap.segments, mock: snap.mock });
    } else if (snap.status === 'idle') {
      writeCache(info.tweetId, null);
    }
  });

  // الترجمة التلقائية (اختيارية ومعطلة افتراضيًا): تبدأ فقط عندما يشغّل المستخدم المقطع
  let autoStarted = false;
  const onPlay = () => {
    const s = settingsStore.get();
    if (s.enabled && s.translationMode === 'auto' && !autoStarted && session.getSnapshot().status === 'idle') {
      autoStarted = true;
      session.start();
    }
  };
  video.addEventListener('play', onPlay);

  void readCache(info.tweetId).then((cached) => {
    if (cached && session.getSnapshot().status === 'idle') session.restore(cached.segments, cached.mock);
  });

  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  const mounted = createShadowHost('video', <VideoOverlay session={session} />, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '3',
  });
  container.appendChild(mounted.host);

  return {
    host: mounted.host,
    dispose() {
      video.removeEventListener('play', onPlay);
      unsubscribe();
      session.destroy();
      mounted.unmount();
    },
  };
}

function mountTweetText({ element, article }: { element: HTMLElement; article: Element }): Mounted | null {
  const lang = element.getAttribute('lang') ?? '';
  // لا حاجة لترجمة نص عربي
  if (lang === 'ar' || !element.textContent?.trim()) return null;
  const settings = settingsStore.get();
  const sourceLanguage = lang && lang !== 'und' && lang !== 'zxx' ? lang : settings.sourceLanguage;
  const mounted = createShadowHost(
    'tweet',
    <TweetTranslation
      getText={() => element.innerText || element.textContent || ''}
      sourceLanguage={['en', 'fr', 'es', 'de', 'tr', 'ur', 'id'].includes(sourceLanguage) ? sourceLanguage : 'auto'}
      onRejected={() => {
        if (settingsStore.get().hideUnsafeContent) hideArticle(article, 'content');
        void handleRejected(article);
      }}
    />,
    { display: 'block' },
  );
  element.insertAdjacentElement('afterend', mounted.host);
  return { host: mounted.host, dispose: () => mounted.unmount() };
}

function visitArticle(article: Element): void {
  if (!settingsStore.get().hideUnsafeAccounts || flagged.size === 0) return;
  const { handle } = tweetInfo(article);
  if (handle && flagged.has(handle.toLowerCase())) hideArticle(article, 'account');
}

async function refreshHealth(): Promise<void> {
  try {
    const health = await sendToBackground<HealthResult>({ type: 'xac:health' });
    healthStore.set({ mode: health.mode });
  } catch {
    healthStore.set(null);
  }
}

async function main(): Promise<void> {
  if (!isSupportedHost(location.hostname)) return;
  settingsStore.set(await getSettings());
  flagged = new Set(await getFlaggedAccounts());
  injectGlobalStyle();

  const scanner = new XScanner(
    document,
    {
      mountVideo,
      mountTweetText,
      visitArticle,
      beforeScan: () => themeStore.set(detectXTheme()),
    },
    () => settingsStore.get().enabled,
  );
  scanner.start();
  void refreshHealth();

  onSettingsChanged(async (settings) => {
    const wasEnabled = settingsStore.get().enabled;
    settingsStore.set(settings);
    flagged = new Set(await getFlaggedAccounts());
    if (!settings.hideUnsafeAccounts) {
      document.querySelectorAll(`article[${HIDDEN_ATTR}="account"]`).forEach((a) => a.removeAttribute(HIDDEN_ATTR));
    }
    if (wasEnabled !== settings.enabled) scanner.scan();
    void refreshHealth();
  });
}

void main();
