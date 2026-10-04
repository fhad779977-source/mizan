import type { ServerConfig } from '../config.js';
import { AnthropicTranslationProvider } from './anthropic.js';
import { MockModerationProvider, MockTranscriptionProvider, MockTranslationProvider } from './mock.js';
import {
  OpenAIModerationProvider,
  OpenAITranscriptionProvider,
  OpenAITranslationProvider,
} from './openai.js';
import type { ProviderSet } from './types.js';

/**
 * يختار المزود لكل مرحلة حسب ملف البيئة.
 * إذا كان المفتاح المطلوب غير موجود ننتقل لوضع التجربة لتلك المرحلة مع تحذير واضح.
 * في PROVIDER_MODE=live نرفض التشغيل بدل الانتقال الصامت.
 */
export function createProviders(config: ServerConfig): ProviderSet {
  const warnings: string[] = [];
  const forceMock = config.providerMode === 'mock';

  const missing = (stage: string, key: string) => {
    const msg = `${stage}: ${key} غير موجود — تم تفعيل وضع التجربة لهذه المرحلة`;
    if (config.providerMode === 'live') throw new Error(msg);
    warnings.push(msg);
  };

  let transcription: ProviderSet['transcription'] = new MockTranscriptionProvider();
  if (!forceMock && config.transcriptionProvider === 'openai') {
    if (config.openaiApiKey) {
      transcription = new OpenAITranscriptionProvider(config.openaiApiKey, config.openaiTranscribeModel);
    } else missing('التفريغ الصوتي', 'OPENAI_API_KEY');
  }

  let moderation: ProviderSet['moderation'] = new MockModerationProvider();
  if (!forceMock && config.moderationProvider === 'openai') {
    if (config.openaiApiKey) {
      moderation = new OpenAIModerationProvider(config.openaiApiKey, config.openaiModerationModel);
    } else missing('فحص المحتوى', 'OPENAI_API_KEY');
  }

  let translation: ProviderSet['translation'] = new MockTranslationProvider();
  if (!forceMock && config.translationProvider === 'anthropic') {
    if (config.anthropicApiKey) {
      translation = new AnthropicTranslationProvider(config.anthropicApiKey, config.anthropicModel);
    } else if (config.openaiApiKey) {
      warnings.push('الترجمة: ANTHROPIC_API_KEY غير موجود — نستخدم OpenAI للترجمة');
      translation = new OpenAITranslationProvider(config.openaiApiKey, config.openaiTranslateModel);
    } else missing('الترجمة', 'ANTHROPIC_API_KEY أو OPENAI_API_KEY');
  } else if (!forceMock && config.translationProvider === 'openai') {
    if (config.openaiApiKey) {
      translation = new OpenAITranslationProvider(config.openaiApiKey, config.openaiTranslateModel);
    } else missing('الترجمة', 'OPENAI_API_KEY');
  }

  // قاعدة أمان: لا نعالج محتوى حقيقيًا بفحص تجريبي. إذا كان الفحص تجريبيًا فكل المراحل تجريبية.
  if (moderation.mock && (!transcription.mock || !translation.mock)) {
    warnings.push('فحص المحتوى يعمل في وضع التجربة، لذلك تم تحويل التفريغ والترجمة إلى وضع التجربة أيضًا');
    transcription = new MockTranscriptionProvider();
    translation = new MockTranslationProvider();
  }

  const mode = transcription.mock || moderation.mock || translation.mock ? 'mock' : 'live';
  return { transcription, moderation, translation, mode, warnings };
}
