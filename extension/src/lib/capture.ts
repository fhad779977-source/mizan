/**
 * التقاط صوت ولقطات المقطع أثناء تشغيله في المتصفح.
 *
 * الطريقة القانونية والمسموحة: نستخدم HTMLMediaElement.captureStream() على عنصر الفيديو
 * الذي يشغّله المستخدم بنفسه في صفحته — أي نفس الصوت الذي يسمعه. لا نحمّل الملف من
 * خوادم X ولا نتجاوز أي حماية: المقاطع المحمية بـ DRM (EME) ترفض الالتقاط ونتوقف.
 */

export interface CapturedChunk {
  audio: Blob;
  mimeType: string;
  /** موضع البداية داخل الفيديو (ثوانٍ) */
  offset: number;
  /** المدة بزمن الفيديو (ثوانٍ) */
  duration: number;
  playbackRate: number;
  frames: string[];
}

export interface CaptureBackend {
  /** يبدأ الالتقاط ويستدعي onChunk لكل مقطع مكتمل */
  start(onChunk: (chunk: CapturedChunk) => void, onError: (code: string) => void): void;
  stop(): void;
}

export class CaptureError extends Error {
  constructor(public code: 'protected_media' | 'capture_unavailable') {
    super(code);
  }
}

type CapturableVideo = HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };

export function pickAudioMimeType(): string {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return options.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) ?? 'audio/webm';
}

const FRAME_WIDTH = 320;

/** يلتقط لقطة مصغّرة JPEG من الفيديو. يعيد null إذا كانت الصورة محمية (tainted) */
export function grabFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  canvas.width = FRAME_WIDTH;
  canvas.height = Math.round((video.videoHeight / video.videoWidth) * FRAME_WIDTH);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch {
    return null;
  }
}

/**
 * الواجهة الحقيقية: MediaRecorder جديد لكل مقطع (حتى يكون كل ملف صوتي مستقلًا وقابلًا
 * للتفريغ)، ولقطتان من الصورة لكل مقطع لفحص المحتوى بصريًا.
 */
interface ChunkState {
  recorder: MediaRecorder;
  parts: Blob[];
  frames: string[];
  startedAt: number;
  rate: number;
  discard: boolean;
  /** آخر موضع مُشغَّل قبل القفز (لمعالجة التكرار التلقائي loop) */
  lastTime: number;
  endTime?: number;
}

export class MediaElementCapture implements CaptureBackend {
  private current: ChunkState | null = null;
  private audioStream: MediaStream | null = null;
  private timers: number[] = [];
  private canvas = document.createElement('canvas');
  private active = false;
  private onChunk: (c: CapturedChunk) => void = () => {};
  private onError: (code: string) => void = () => {};
  private readonly mimeType = pickAudioMimeType();

  constructor(private video: HTMLVideoElement, private chunkSeconds: number) {}

  start(onChunk: (c: CapturedChunk) => void, onError: (code: string) => void): void {
    this.onChunk = onChunk;
    this.onError = onError;
    const v = this.video as CapturableVideo;
    if (v.mediaKeys) throw new CaptureError('protected_media');
    const capture = v.captureStream ?? v.mozCaptureStream;
    if (!capture || typeof MediaRecorder === 'undefined') throw new CaptureError('capture_unavailable');
    try {
      this.audioStream = capture.call(v);
    } catch {
      throw new CaptureError('capture_unavailable');
    }
    this.active = true;
    v.addEventListener('pause', this.handlePause);
    v.addEventListener('play', this.handlePlay);
    v.addEventListener('seeking', this.handleSeeking);
    v.addEventListener('ended', this.handlePause);
    v.addEventListener('timeupdate', this.handleTimeUpdate);
    if (!v.paused) this.beginChunk();
  }

  stop(): void {
    this.active = false;
    this.finishChunk(true);
    const v = this.video;
    v.removeEventListener('pause', this.handlePause);
    v.removeEventListener('play', this.handlePlay);
    v.removeEventListener('seeking', this.handleSeeking);
    v.removeEventListener('ended', this.handlePause);
    v.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.audioStream?.getTracks().forEach((t) => t.stop());
    this.audioStream = null;
  }

  private handlePlay = () => {
    if (this.active && !this.current) this.beginChunk();
  };

  /** إيقاف مؤقت أو نهاية المقطع: نرسل ما سُجّل حتى الآن */
  private handlePause = () => this.finishChunk(false);

  private handleTimeUpdate = () => {
    if (this.current && !this.video.seeking) this.current.lastTime = this.video.currentTime;
  };

  /**
   * عند القفز داخل الفيديو نتجاهل المقطع الحالي لأن توقيته لم يعد صحيحًا.
   * استثناء: X يكرر المقاطع القصيرة تلقائيًا (loop)؛ العودة للبداية من آخر المقطع = نهاية طبيعية.
   */
  private handleSeeking = () => {
    const chunk = this.current;
    const total = this.video.duration;
    if (chunk && this.video.currentTime < 1 && Number.isFinite(total) && chunk.lastTime >= total - 1.5) {
      chunk.endTime = Math.min(total, chunk.lastTime + 0.25);
      this.finishChunk(false);
      return;
    }
    this.finishChunk(true);
  };

  private beginChunk(): void {
    if (!this.active || !this.audioStream || this.current) return;
    const tracks = this.audioStream.getAudioTracks();
    if (!tracks.length) {
      // المسار الصوتي يظهر بعد بدء التشغيل الفعلي؛ نحاول بعد لحظة
      this.timers.push(window.setTimeout(() => this.beginChunk(), 300));
      return;
    }
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(new MediaStream(tracks), { mimeType: this.mimeType });
    } catch {
      this.onError('capture_unavailable');
      return;
    }
    const chunk: ChunkState = {
      recorder,
      parts: [],
      frames: [],
      startedAt: this.video.currentTime,
      rate: this.video.playbackRate || 1,
      discard: false,
      lastTime: this.video.currentTime,
    };
    this.current = chunk;

    recorder.ondataavailable = (e) => {
      if (e.data.size) chunk.parts.push(e.data);
    };
    recorder.onstop = () => {
      const duration = Math.max(0, (chunk.endTime ?? this.video.currentTime) - chunk.startedAt);
      if (!chunk.discard && duration >= 0.5 && chunk.parts.length) {
        this.onChunk({
          audio: new Blob(chunk.parts, { type: this.mimeType }),
          mimeType: this.mimeType,
          offset: chunk.startedAt,
          duration,
          playbackRate: chunk.rate,
          frames: chunk.frames,
        });
      }
      // نبدأ المقطع التالي فورًا إن كان الفيديو ما زال يعمل
      if (this.active && !this.video.paused && !this.video.ended) this.beginChunk();
    };

    recorder.start();
    const ms = this.chunkSeconds * 1000;
    this.timers.push(
      window.setTimeout(() => this.captureFrame(), Math.min(800, ms * 0.2)),
      window.setTimeout(() => this.captureFrame(), ms * 0.65),
      window.setTimeout(() => this.finishChunk(false), ms),
    );
  }

  private captureFrame(): void {
    if (!this.current) return;
    const frame = grabFrame(this.video, this.canvas);
    if (frame) this.current.frames.push(frame);
  }

  private finishChunk(discard: boolean): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    const chunk = this.current;
    if (!chunk) return;
    if (!discard && chunk.frames.length === 0) this.captureFrame();
    chunk.discard = discard;
    this.current = null;
    if (chunk.recorder.state !== 'inactive') chunk.recorder.stop();
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
