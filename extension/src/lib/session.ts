import { CaptureError, type CaptureBackend, type CapturedChunk } from './capture';
import { mergeSegments } from './subtitles';
import type { ProcessChunkPayload, ProcessResult, Segment } from './types';

export type SessionStatus = 'idle' | 'processing' | 'ready' | 'stopped' | 'rejected' | 'uncertain' | 'error';

export interface SessionSnapshot {
  status: SessionStatus;
  segments: Segment[];
  /** رسالة للمستخدم (سبب الرفض أو الخطأ) */
  message?: string;
  mock: boolean;
  pending: number;
}

export interface SessionDeps {
  createCapture(video: HTMLVideoElement): CaptureBackend;
  encodeAudio(blob: Blob): Promise<string>;
  processChunk(payload: ProcessChunkPayload, requestId: string): Promise<ProcessResult>;
  abort(requestId: string): void;
  newRequestId(): string;
  describeError(err: unknown): string;
}

const EMPTY: SessionSnapshot = { status: 'idle', segments: [], mock: false, pending: 0 };

/**
 * جلسة ترجمة لمقطع واحد. تدير: الالتقاط → الإرسال على دفعات → دمج الترجمة.
 * القاعدة الصارمة: أي دفعة مرفوضة أو غير مؤكدة تُوقف كل شيء وتحذف كل الترجمة السابقة.
 */
export class VideoTranslationSession {
  private snapshot: SessionSnapshot = EMPTY;
  private listeners = new Set<() => void>();
  private capture: CaptureBackend | null = null;
  private pending = new Set<string>();
  private covered: Array<{ start: number; end: number }> = [];
  /** يزيد عند كل إيقاف/حذف حتى نتجاهل الردود المتأخرة */
  private generation = 0;

  constructor(readonly video: HTMLVideoElement, private deps: SessionDeps) {}

  getSnapshot = (): SessionSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private set(patch: Partial<SessionSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch, pending: this.pending.size };
    this.listeners.forEach((l) => l());
  }

  get isActive(): boolean {
    return this.snapshot.status === 'processing';
  }

  start(): void {
    if (this.isActive) return;
    this.generation++;
    const gen = this.generation;
    this.covered = [];
    this.set({ status: 'processing', segments: [], message: undefined });

    const capture = this.deps.createCapture(this.video);
    this.capture = capture;
    try {
      capture.start(
        (chunk) => void this.handleChunk(chunk, gen),
        (code) => this.fail(new CaptureError(code as CaptureError['code']), gen),
      );
    } catch (err) {
      this.capture = null;
      this.set({ status: 'error', message: this.deps.describeError(err) });
      return;
    }
    if (this.video.paused) void this.video.play().catch(() => undefined);
  }

  /** «إيقاف المعالجة»: يوقف الالتقاط والطلبات الجارية ويُبقي ما تُرجم */
  stop(): void {
    this.halt();
    this.set({ status: this.snapshot.segments.length ? 'ready' : 'stopped' });
  }

  /** «حذف النتيجة»: يحذف كل الترجمة من الذاكرة فورًا */
  clear(): void {
    this.halt();
    this.covered = [];
    this.set({ ...EMPTY });
  }

  retranslate(): void {
    this.clear();
    try {
      this.video.currentTime = 0;
    } catch {
      /* بعض المقاطع لا تسمح بالقفز */
    }
    this.start();
  }

  /** نتيجة محفوظة مسبقًا (عند تعطيل الحذف التلقائي) */
  restore(segments: Segment[], mock: boolean): void {
    this.set({ status: 'ready', segments, mock, message: undefined });
  }

  destroy(): void {
    this.clear();
    this.listeners.clear();
  }

  private halt(): void {
    this.generation++;
    this.capture?.stop();
    this.capture = null;
    for (const id of this.pending) this.deps.abort(id);
    this.pending.clear();
  }

  private isCovered(offset: number, duration: number): boolean {
    return this.covered.some((r) => r.start <= offset + 0.3 && r.end >= offset + duration - 0.3);
  }

  private async handleChunk(chunk: CapturedChunk, gen: number): Promise<void> {
    if (gen !== this.generation) return;
    if (this.isCovered(chunk.offset, chunk.duration)) {
      this.maybeFinish();
      return;
    }
    const requestId = this.deps.newRequestId();
    this.pending.add(requestId);
    this.set({});
    try {
      const audioBase64 = await this.deps.encodeAudio(chunk.audio);
      if (gen !== this.generation) return;
      const result = await this.deps.processChunk(
        { audioBase64, mimeType: chunk.mimeType, offset: chunk.offset, duration: chunk.duration, frames: chunk.frames },
        requestId,
      );
      if (gen !== this.generation) return;
      this.pending.delete(requestId);
      this.applyResult(result, chunk);
    } catch (err) {
      this.pending.delete(requestId);
      this.fail(err, gen);
    }
  }

  private applyResult(result: ProcessResult, chunk: CapturedChunk): void {
    if (result.status !== 'approved') {
      // رفض أو عدم تأكد: نوقف كل شيء ونحذف كل ما تُرجم من هذا المقطع
      this.halt();
      this.covered = [];
      this.set({ status: result.status, segments: [], message: result.reason, mock: Boolean(result.mock) });
      return;
    }
    const rate = chunk.playbackRate || 1;
    const window = { start: chunk.offset, end: chunk.offset + chunk.duration * rate };
    // الخادم يعيد توقيتًا بالزمن الحقيقي للتسجيل؛ نحوّله لزمن الفيديو إذا تغيّرت سرعة التشغيل
    const incoming = result.segments.map((s) => ({
      ...s,
      start: chunk.offset + (s.start - chunk.offset) * rate,
      end: Math.min(window.end, chunk.offset + (s.end - chunk.offset) * rate),
    }));
    this.covered.push(window);
    this.set({ segments: mergeSegments(this.snapshot.segments, incoming, window), mock: result.mock });
    this.maybeFinish();
  }

  /** إذا غطّت الترجمة المقطع كاملًا نوقف الالتقاط (مفيد للمقاطع التي تتكرر تلقائيًا) */
  private maybeFinish(): void {
    const total = this.video.duration;
    if (!Number.isFinite(total) || total <= 0) return;
    const sorted = [...this.covered].sort((a, b) => a.start - b.start);
    let reach = 0;
    for (const r of sorted) {
      if (r.start > reach + 0.6) break;
      reach = Math.max(reach, r.end);
    }
    if (reach >= total - 0.75 && this.pending.size === 0) {
      this.capture?.stop();
      this.capture = null;
      this.set({ status: 'ready' });
    }
  }

  private fail(err: unknown, gen: number): void {
    if (gen !== this.generation) return;
    if ((err as { aborted?: boolean })?.aborted) return;
    this.halt();
    this.set({ status: 'error', message: this.deps.describeError(err) });
  }
}
