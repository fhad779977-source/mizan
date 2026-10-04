/**
 * عقود المزودين (Providers).
 * كل مرحلة (تفريغ، فحص، ترجمة) لها واجهة مستقلة حتى يمكن تبديل المزود من ملف البيئة
 * دون تعديل بقية الخادم.
 */

export type MockScenario = 'clean' | 'rejected' | 'uncertain';

export interface TranscriptSegment {
  /** بالثواني، نسبةً لبداية الفيديو (وليس بداية المقطع الصوتي) */
  start: number;
  end: number;
  text: string;
}

export interface Transcript {
  language: string;
  segments: TranscriptSegment[];
}

export interface TranscribeInput {
  audio: Buffer;
  mimeType: string;
  /** 'auto' أو رمز لغة ISO-639-1 */
  language: string;
  /** موضع بداية المقطع الصوتي داخل الفيديو بالثواني */
  offset: number;
  duration: number;
  mockScenario?: MockScenario;
}

export interface TranscriptionProvider {
  readonly name: string;
  readonly mock: boolean;
  transcribe(input: TranscribeInput): Promise<Transcript>;
}

export type ModerationCategory =
  | 'sexual'
  | 'nudity'
  | 'sexual_minors'
  | 'sexual_exploitation'
  | 'obscene'
  | 'graphic_violence'
  | 'hate'
  | 'harassment';

export type ModerationScores = Partial<Record<ModerationCategory, number>>;

export interface ModerationSignal {
  source: 'text' | 'image' | 'lexicon';
  scores: ModerationScores;
  /** هل اعتبر المزود المحتوى مخالفًا صراحةً */
  flagged: boolean;
}

export interface ModerationContext {
  mockScenario?: MockScenario;
}

export interface ModerationProvider {
  readonly name: string;
  readonly mock: boolean;
  moderateText(text: string, ctx: ModerationContext): Promise<ModerationSignal>;
  /** frames: صور JPEG بصيغة data URL */
  moderateImages(frames: string[], ctx: ModerationContext): Promise<ModerationSignal[]>;
}

export interface TranslationProvider {
  readonly name: string;
  readonly mock: boolean;
  /** يترجم مصفوفة نصوص ويعيد مصفوفة بنفس الطول والترتيب */
  translate(texts: string[], sourceLanguage: string, targetLanguage: string): Promise<string[]>;
}

export interface ProviderSet {
  transcription: TranscriptionProvider;
  moderation: ModerationProvider;
  translation: TranslationProvider;
  /** live فقط إذا كانت كل المراحل تعمل بمزود حقيقي */
  mode: 'live' | 'mock';
  warnings: string[];
}

/** خطأ يرفعه المزود عندما يرفض النموذج المعالجة لأسباب تتعلق بالسياسة */
export class ProviderRefusalError extends Error {
  constructor(message = 'provider refused the request') {
    super(message);
    this.name = 'ProviderRefusalError';
  }
}
