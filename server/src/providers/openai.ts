import type {
  ModerationProvider,
  ModerationScores,
  ModerationSignal,
  TranscribeInput,
  Transcript,
  TranscriptionProvider,
  TranslationProvider,
} from './types.js';
import { buildTranslationPrompt, parseTranslations } from './translationPrompt.js';

const API = 'https://api.openai.com/v1';
const TIMEOUT_MS = 90_000;

async function openaiFetch(apiKey: string, path: string, init: RequestInit): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    // لا نطبع جسم الطلب (قد يحتوي محتوى المستخدم)، فقط رمز الحالة
    throw new Error(`OpenAI ${path} failed with HTTP ${res.status}`);
  }
  return res.json();
}

const LANGUAGE_NAMES: Record<string, string> = {
  english: 'en', arabic: 'ar', french: 'fr', spanish: 'es', german: 'de', turkish: 'tr', urdu: 'ur', indonesian: 'id',
};

function extensionFor(mimeType: string): string {
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'm4a';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('mpeg')) return 'mp3';
  return 'webm';
}

export class OpenAITranscriptionProvider implements TranscriptionProvider {
  readonly name = 'openai';
  readonly mock = false;
  constructor(private apiKey: string, private model: string) {}

  async transcribe(input: TranscribeInput): Promise<Transcript> {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(input.audio)], { type: input.mimeType });
    form.append('file', blob, `chunk.${extensionFor(input.mimeType)}`);
    form.append('model', this.model);
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'segment');
    if (input.language !== 'auto') form.append('language', input.language);

    const data = await openaiFetch(this.apiKey, '/audio/transcriptions', { method: 'POST', body: form });
    const rawLang = String(data.language ?? input.language).toLowerCase();
    const language = LANGUAGE_NAMES[rawLang] ?? rawLang;
    const segments = Array.isArray(data.segments)
      ? data.segments
      : data.text
        ? [{ start: 0, end: input.duration, text: data.text }]
        : [];

    return {
      language,
      segments: segments
        .map((s: { start: number; end: number; text: string }) => ({
          start: input.offset + Number(s.start),
          end: input.offset + Math.min(Number(s.end), input.duration),
          text: String(s.text ?? '').trim(),
        }))
        .filter((s: { text: string }) => s.text.length > 0),
    };
  }
}

/** تحويل فئات OpenAI إلى فئات سياستنا */
function mapScores(raw: Record<string, number> = {}): ModerationScores {
  return {
    sexual: raw['sexual'] ?? 0,
    sexual_minors: raw['sexual/minors'] ?? 0,
    graphic_violence: raw['violence/graphic'] ?? 0,
    hate: Math.max(raw['hate'] ?? 0, raw['hate/threatening'] ?? 0),
    harassment: Math.max(raw['harassment'] ?? 0, raw['harassment/threatening'] ?? 0),
  };
}

export class OpenAIModerationProvider implements ModerationProvider {
  readonly name = 'openai';
  readonly mock = false;
  constructor(private apiKey: string, private model: string) {}

  private async run(input: unknown, source: 'text' | 'image'): Promise<ModerationSignal> {
    const data = await openaiFetch(this.apiKey, '/moderations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, input }),
    });
    const result = data.results?.[0];
    if (!result) throw new Error('OpenAI moderation returned no result');
    return { source, scores: mapScores(result.category_scores), flagged: Boolean(result.flagged) };
  }

  moderateText(text: string): Promise<ModerationSignal> {
    return this.run(text, 'text');
  }

  moderateImages(frames: string[]): Promise<ModerationSignal[]> {
    return Promise.all(
      frames.map((url) => this.run([{ type: 'image_url', image_url: { url } }], 'image')),
    );
  }
}

export class OpenAITranslationProvider implements TranslationProvider {
  readonly name = 'openai';
  readonly mock = false;
  constructor(private apiKey: string, private model: string) {}

  async translate(texts: string[], sourceLanguage: string, targetLanguage: string): Promise<string[]> {
    if (!texts.length) return [];
    const { system, user } = buildTranslationPrompt(texts, sourceLanguage, targetLanguage);
    const data = await openaiFetch(this.apiKey, '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'translations',
            strict: true,
            schema: {
              type: 'object',
              properties: { translations: { type: 'array', items: { type: 'string' } } },
              required: ['translations'],
              additionalProperties: false,
            },
          },
        },
      }),
    });
    return parseTranslations(data.choices?.[0]?.message?.content, texts.length);
  }
}
