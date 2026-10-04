import { HOST_ATTR } from './mount';
import { isAllowedPath, scanTargets } from '../lib/x-dom';

export interface Mounted {
  host: HTMLElement;
  dispose(): void;
}

export interface ScannerHandlers {
  mountVideo(target: { video: HTMLVideoElement; container: HTMLElement; article: Element | null }): Mounted | null;
  mountTweetText(target: { element: HTMLElement; article: Element }): Mounted | null;
  /** يُستدعى لكل تغريدة في كل فحص (لإخفاء الحسابات المعلّمة مثلًا) */
  visitArticle?(article: Element): void;
  /** قبل كل فحص (تحديث الثيم مثلًا) */
  beforeScan?(): void;
}

interface VideoEntry extends Mounted {
  container: HTMLElement;
}

interface TextEntry extends Mounted {
  element: HTMLElement;
}

const SCAN_DELAY_MS = 150;

/**
 * يراقب صفحة X (تمرير لا نهائي، تنقل SPA) ويضيف واجهتنا مرة واحدة فقط لكل مقطع وتغريدة.
 * - لا تكرار: كل فيديو/نص مرتبط بعنصر واحد في Map، ونتحقق أيضًا من DOM.
 * - إذا أعاد X رسم العنصر وأزال واجهتنا نعيد إدراج نفس العنصر (تبقى حالة الترجمة).
 * - الفحص مؤجل ومجمّع (debounce) حتى لا يؤثر على سلاسة التمرير أو الفيديو.
 */
export class XScanner {
  private videos = new Map<HTMLVideoElement, VideoEntry>();
  private texts = new Map<HTMLElement, TextEntry>();
  private observer: MutationObserver | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private doc: Document,
    private handlers: ScannerHandlers,
    private isEnabled: () => boolean,
  ) {}

  start(): void {
    this.scan();
    this.observer = new MutationObserver(() => this.schedule());
    this.observer.observe(this.doc.body, { childList: true, subtree: true });
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.timer) clearTimeout(this.timer);
    this.teardown();
  }

  schedule(): void {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.scan();
    }, SCAN_DELAY_MS);
  }

  get videoCount(): number {
    return this.videos.size;
  }

  get tweetTextCount(): number {
    return this.texts.size;
  }

  scan(): void {
    const path = this.doc.defaultView?.location.pathname ?? '/';
    if (!this.isEnabled() || !isAllowedPath(path)) {
      this.teardown();
      return;
    }
    this.handlers.beforeScan?.();
    this.cleanupDetached();
    const targets = scanTargets(this.doc);

    for (const target of targets.videos) {
      const existing = this.videos.get(target.video);
      if (existing) {
        if (!existing.host.isConnected) existing.container.appendChild(existing.host);
        continue;
      }
      // حماية إضافية من التكرار: إذا كان في الحاوية واجهة لفيديو آخر قديم نزيلها
      const stale = target.container.querySelector(`:scope > [${HOST_ATTR}="video"]`);
      if (stale) this.disposeVideoHost(stale as HTMLElement);
      const mounted = this.handlers.mountVideo(target);
      if (mounted) this.videos.set(target.video, { ...mounted, container: target.container });
    }

    for (const target of targets.tweetTexts) {
      const existing = this.texts.get(target.element);
      if (existing) {
        if (!existing.host.isConnected) target.element.insertAdjacentElement('afterend', existing.host);
        continue;
      }
      if (target.element.nextElementSibling?.getAttribute(HOST_ATTR) === 'tweet') continue;
      const mounted = this.handlers.mountTweetText(target);
      if (mounted) this.texts.set(target.element, { ...mounted, element: target.element });
    }

    if (this.handlers.visitArticle) targets.articles.forEach((a) => this.handlers.visitArticle!(a));
  }

  private disposeVideoHost(host: HTMLElement): void {
    for (const [video, entry] of this.videos) {
      if (entry.host === host) {
        entry.dispose();
        this.videos.delete(video);
        return;
      }
    }
    host.remove();
  }

  /** نحرر الذاكرة ونوقف أي معالجة لعناصر خرجت من الصفحة (X يحذف التغريدات البعيدة أثناء التمرير) */
  private cleanupDetached(): void {
    for (const [video, entry] of this.videos) {
      if (!video.isConnected) {
        entry.dispose();
        this.videos.delete(video);
      }
    }
    for (const [element, entry] of this.texts) {
      if (!element.isConnected) {
        entry.dispose();
        this.texts.delete(element);
      }
    }
  }

  private teardown(): void {
    this.videos.forEach((e) => e.dispose());
    this.texts.forEach((e) => e.dispose());
    this.videos.clear();
    this.texts.clear();
  }
}
