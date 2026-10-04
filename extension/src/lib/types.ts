export type MockScenario = 'clean' | 'rejected' | 'uncertain';
export type SubtitlePosition = 'bottom' | 'middle' | 'top';
export type SubtitleBackground = 'dark' | 'light' | 'none';
export type SourceLanguage = 'auto' | 'en' | 'fr' | 'es' | 'de' | 'tr' | 'ur' | 'id';

export interface Settings {
  /** تفعيل الإضافة بالكامل */
  enabled: boolean;
  /** manual = لا يُرسل شيء إلا بضغط «ترجم». auto = ترجمة تلقائية للمقطع الذي يشغّله المستخدم */
  translationMode: 'manual' | 'auto';
  strictModeration: boolean;
  hideUnsafeContent: boolean;
  hideUnsafeAccounts: boolean;
  sourceLanguage: SourceLanguage;
  targetLanguage: 'ar';
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleBackground: SubtitleBackground;
  subtitlePosition: SubtitlePosition;
  showOriginal: boolean;
  /** حذف النتائج فور انتهاء الجلسة وعدم الاحتفاظ بأي نسخة */
  deleteAfterProcessing: boolean;
  serverUrl: string;
  accessToken: string;
  /** يُستخدم فقط عندما يعمل الخادم في وضع التجربة */
  mockScenario: MockScenario;
  /** طول المقطع الصوتي المرسل في كل طلب (ثوانٍ) */
  chunkSeconds: number;
}

export interface Segment {
  start: number;
  end: number;
  original: string;
  translated: string;
}

export type ProcessResult =
  | {
      status: 'approved';
      language: string;
      translationLanguage: string;
      segments: Segment[];
      vtt: string;
      srt: string;
      mock: boolean;
    }
  | { status: 'rejected' | 'uncertain'; reason: string; mock?: boolean };

export type TranslateTextResult =
  | { status: 'approved'; translated: string; translationLanguage: string; mock: boolean }
  | { status: 'rejected' | 'uncertain'; reason: string; mock?: boolean };

export interface HealthResult {
  status: 'ok';
  mode: 'live' | 'mock';
  notice?: string;
  providers: Record<string, string>;
}

export interface ProcessChunkPayload {
  audioBase64: string;
  mimeType: string;
  offset: number;
  duration: number;
  frames: string[];
}

/** رسائل content script ↔ background */
export type BackgroundRequest =
  | { type: 'xac:health' }
  | { type: 'xac:process-chunk'; requestId: string; payload: ProcessChunkPayload }
  | { type: 'xac:translate-text'; requestId: string; text: string; sourceLanguage: string }
  | { type: 'xac:abort'; requestId: string }
  | { type: 'xac:open-options' };

export type BackgroundResponse<T> = { ok: true; data: T } | { ok: false; error: string; aborted?: boolean };
