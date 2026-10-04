/**
 * محددات عناصر X/Twitter. نعتمد على data-testid لأنها أثبت من أسماء الفئات المولّدة.
 */
export const SELECTORS = {
  tweet: 'article[data-testid="tweet"]',
  tweetText: '[data-testid="tweetText"]',
  videoPlayer: '[data-testid="videoPlayer"]',
  videoComponent: '[data-testid="videoComponent"]',
  userName: '[data-testid="User-Name"]',
  protectedIcon: '[data-testid="icon-lock"], svg[aria-label*="Protected"], svg[aria-label*="محمي"]',
} as const;

/** صفحات لا نعمل فيها أبدًا (الرسائل الخاصة والإعدادات) */
const BLOCKED_PATHS = [/^\/messages(\/|$)/, /^\/i\/chat(\/|$)/, /^\/settings(\/|$)/, /^\/i\/flow(\/|$)/];

export function isSupportedHost(hostname: string): boolean {
  return /^(mobile\.)?(x|twitter)\.com$/.test(hostname);
}

export function isAllowedPath(pathname: string): boolean {
  return !BLOCKED_PATHS.some((re) => re.test(pathname));
}

export function isProtectedTweet(article: Element): boolean {
  return Boolean(article.querySelector(SELECTORS.protectedIcon));
}

/** صورة GIF متحركة في X تُعرض كفيديو بدون صوت — لا فائدة من ترجمتها */
export function isAnimatedGif(video: HTMLVideoElement): boolean {
  const src = video.currentSrc || video.src || video.querySelector('source')?.src || '';
  return /\/tweet_video\//.test(src);
}

export function videoContainer(video: HTMLVideoElement): HTMLElement | null {
  return (
    video.closest<HTMLElement>(SELECTORS.videoPlayer) ??
    video.closest<HTMLElement>(SELECTORS.videoComponent) ??
    video.parentElement
  );
}

export interface TweetInfo {
  tweetId?: string;
  handle?: string;
}

export function tweetInfo(article: Element | null): TweetInfo {
  if (!article) return {};
  const link = article.querySelector<HTMLAnchorElement>('a[href*="/status/"]');
  const m = link?.getAttribute('href')?.match(/^\/([^/]+)\/status\/(\d+)/);
  return m ? { handle: m[1], tweetId: m[2] } : {};
}

export interface ScanTargets {
  videos: Array<{ video: HTMLVideoElement; container: HTMLElement; article: Element | null }>;
  tweetTexts: Array<{ element: HTMLElement; article: Element }>;
  articles: Element[];
}

/** يجد المقاطع ونصوص التغريدات العامة القابلة للمعالجة */
export function scanTargets(root: ParentNode): ScanTargets {
  const result: ScanTargets = { videos: [], tweetTexts: [], articles: [] };
  const articles = Array.from(root.querySelectorAll(SELECTORS.tweet));
  result.articles = articles;
  for (const article of articles) {
    if (isProtectedTweet(article)) continue;
    for (const video of Array.from(article.querySelectorAll('video'))) {
      if (isAnimatedGif(video)) continue;
      const container = videoContainer(video);
      if (container) result.videos.push({ video, container, article });
    }
    // نص التغريدة الرئيسي فقط (وليس نص تغريدة مقتبسة داخلها)
    const text = article.querySelector<HTMLElement>(SELECTORS.tweetText);
    if (text && text.closest(SELECTORS.tweet) === article) result.tweetTexts.push({ element: text, article });
  }
  return result;
}
