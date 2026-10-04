import { moderateContent } from '../moderation/moderator.js';
import { UNCERTAIN_REASON, type ModerationDecision } from '../moderation/policy.js';
import { ProviderRefusalError, type MockScenario, type ProviderSet, type TranscriptSegment } from '../providers/types.js';
import { toSRT, toWebVTT, type SubtitleSegment } from './subtitles.js';

export type ProcessResult =
  | {
      status: 'approved';
      language: string;
      translationLanguage: string;
      segments: Required<SubtitleSegment>[];
      vtt: string;
      srt: string;
      mock: boolean;
    }
  | { status: 'rejected' | 'uncertain'; reason: string; mock: boolean };

export interface ProcessVideoInput {
  audio: Buffer;
  mimeType: string;
  offset: number;
  duration: number;
  sourceLanguage: string;
  targetLanguage: string;
  frames: string[];
  strict: boolean;
  mockScenario?: MockScenario;
}

function blocked(decision: ModerationDecision, mock: boolean): ProcessResult {
  // لا نعيد أي نص أصلي أو مترجم للمحتوى المرفوض
  return {
    status: decision.status === 'rejected' ? 'rejected' : 'uncertain',
    reason: decision.reason ?? UNCERTAIN_REASON,
    mock,
  };
}

async function translateSegments(
  providers: ProviderSet,
  segments: TranscriptSegment[],
  sourceLanguage: string,
  targetLanguage: string,
): Promise<string[]> {
  if (sourceLanguage === targetLanguage) return segments.map((s) => s.text);
  return providers.translation.translate(
    segments.map((s) => s.text),
    sourceLanguage,
    targetLanguage,
  );
}

/**
 * مسار معالجة مقطع واحد من الفيديو:
 * تفريغ → فحص (نص + صور) → (إن كان نظيفًا فقط) ترجمة → WebVTT/SRT.
 * كل البيانات تبقى في الذاكرة لمدة الطلب فقط، ولا يُكتب شيء على القرص.
 */
export async function processVideoChunk(providers: ProviderSet, input: ProcessVideoInput): Promise<ProcessResult> {
  const mock = providers.mode === 'mock';
  try {
    const transcript = await providers.transcription.transcribe({
      audio: input.audio,
      mimeType: input.mimeType,
      language: input.sourceLanguage,
      offset: input.offset,
      duration: input.duration,
      mockScenario: input.mockScenario,
    });

    const decision = await moderateContent(providers.moderation, {
      text: transcript.segments.map((s) => s.text).join('\n'),
      frames: input.frames,
      requireVisual: true,
      strict: input.strict,
      mockScenario: input.mockScenario,
    });
    if (decision.status !== 'clean') return blocked(decision, mock);

    const translated = await translateSegments(providers, transcript.segments, transcript.language, input.targetLanguage);
    const segments = transcript.segments.map((s, i) => ({
      start: s.start,
      end: s.end,
      original: s.text,
      translated: translated[i],
    }));

    return {
      status: 'approved',
      language: transcript.language,
      translationLanguage: input.targetLanguage,
      segments,
      vtt: toWebVTT(segments),
      srt: toSRT(segments),
      mock,
    };
  } catch (err) {
    if (err instanceof ProviderRefusalError) {
      return { status: 'uncertain', reason: UNCERTAIN_REASON, mock };
    }
    throw err;
  } finally {
    // تحرير المرجع للصوت فورًا بعد المعالجة
    input.audio.fill(0);
  }
}

export interface TranslateTextInput {
  texts: string[];
  sourceLanguage: string;
  targetLanguage: string;
  strict: boolean;
  mockScenario?: MockScenario;
}

export type TranslateTextResult =
  | { status: 'approved'; translations: string[]; mock: boolean }
  | { status: 'rejected' | 'uncertain'; reason: string; mock: boolean };

/** ترجمة نص (تغريدة أو أسطر) مع فحص إلزامي قبل الترجمة */
export async function translateText(providers: ProviderSet, input: TranslateTextInput): Promise<TranslateTextResult> {
  const mock = providers.mode === 'mock';
  const decision = await moderateContent(providers.moderation, {
    text: input.texts.join('\n'),
    requireVisual: false,
    strict: input.strict,
    mockScenario: input.mockScenario,
  });
  if (decision.status !== 'clean') {
    return { status: decision.status === 'rejected' ? 'rejected' : 'uncertain', reason: decision.reason ?? UNCERTAIN_REASON, mock };
  }
  try {
    const translations = await providers.translation.translate(input.texts, input.sourceLanguage, input.targetLanguage);
    return { status: 'approved', translations, mock };
  } catch (err) {
    if (err instanceof ProviderRefusalError) return { status: 'uncertain', reason: UNCERTAIN_REASON, mock };
    throw err;
  }
}
