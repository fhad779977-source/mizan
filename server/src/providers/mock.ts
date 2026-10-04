import type {
  ModerationContext,
  ModerationProvider,
  ModerationSignal,
  TranscribeInput,
  Transcript,
  TranscriptionProvider,
  TranslationProvider,
} from './types.js';

/**
 * وضع التجربة (Mock Mode).
 * هذه المزودات لا تستمع للصوت فعليًا ولا تترجم فعليًا — تعيد نصًا تجريبيًا ثابتًا وواضحًا
 * حتى يمكن تجربة الإضافة كاملة بدون مفاتيح API. كل نتيجة تُعلَّم بـ mock: true.
 */

export const MOCK_CLEAN_SCRIPT: Array<{ en: string; ar: string }> = [
  { en: 'Hello everyone, and welcome to today\'s lesson.', ar: 'مرحبًا بالجميع، وأهلًا بكم في درس اليوم.' },
  { en: 'Today we will learn how to plant a small garden at home.', ar: 'سنتعلم اليوم كيف نزرع حديقة صغيرة في المنزل.' },
  { en: 'First, choose a sunny spot and prepare good soil.', ar: 'أولًا، اختر مكانًا مشمسًا وجهّز تربة جيدة.' },
  { en: 'Water the plants gently every morning.', ar: 'اسقِ النباتات برفق كل صباح.' },
  { en: 'Thank you for watching, see you next time.', ar: 'شكرًا على المشاهدة، نراكم في المرة القادمة.' },
];

/** نص تجريبي يحتوي كلمات من القاموس المحظور — يثبت أن مسار الرفض يعمل فعليًا */
export const MOCK_REJECTED_SCRIPT = ['Warning: this clip contains explicit nudity and porn scenes.'];

const DICTIONARY = new Map<string, string>(MOCK_CLEAN_SCRIPT.map((l) => [l.en, l.ar]));
DICTIONARY.set('Hello everyone', 'مرحبًا بالجميع');

export const MOCK_TRANSLATION_NOTICE = 'ترجمة تجريبية — أضف مفتاح API لترجمة هذا النص فعليًا';

const SEGMENT_SECONDS = 3;

export class MockTranscriptionProvider implements TranscriptionProvider {
  readonly name = 'mock';
  readonly mock = true;

  async transcribe(input: TranscribeInput): Promise<Transcript> {
    if (!input.audio.length) return { language: 'en', segments: [] };
    const lines =
      input.mockScenario === 'rejected' ? MOCK_REJECTED_SCRIPT : MOCK_CLEAN_SCRIPT.map((l) => l.en);
    const count = Math.max(1, Math.floor(input.duration / SEGMENT_SECONDS));
    const firstIndex = Math.floor(input.offset / SEGMENT_SECONDS);
    const step = input.duration / count;
    const segments = Array.from({ length: count }, (_, i) => {
      const start = input.offset + i * step;
      return {
        start: round(start),
        end: round(Math.min(input.offset + input.duration, start + step - 0.1)),
        text: lines[(firstIndex + i) % lines.length],
      };
    });
    return { language: 'en', segments };
  }
}

export class MockModerationProvider implements ModerationProvider {
  readonly name = 'mock';
  readonly mock = true;

  /** لا يوجد نموذج حقيقي هنا؛ القاموس المحلي (lexicon) هو من يكتشف الكلمات المحظورة */
  async moderateText(_text: string, _ctx: ModerationContext): Promise<ModerationSignal> {
    return { source: 'text', scores: {}, flagged: false };
  }

  async moderateImages(frames: string[], ctx: ModerationContext): Promise<ModerationSignal[]> {
    return frames.map(() => ({
      source: 'image' as const,
      // سيناريو "غير مؤكد": درجة متوسطة لا تكفي للرفض ولا للقبول
      scores: ctx.mockScenario === 'uncertain' ? { sexual: 0.2, nudity: 0.15 } : { sexual: 0, nudity: 0 },
      flagged: false,
    }));
  }
}

export class MockTranslationProvider implements TranslationProvider {
  readonly name = 'mock';
  readonly mock = true;

  async translate(texts: string[]): Promise<string[]> {
    return texts.map((t) => DICTIONARY.get(t.trim()) ?? `[${MOCK_TRANSLATION_NOTICE}]`);
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
