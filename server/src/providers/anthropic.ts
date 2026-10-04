import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { ProviderRefusalError, type TranslationProvider } from './types.js';
import { buildTranslationPrompt, parseTranslations } from './translationPrompt.js';

const TranslationsSchema = z.object({ translations: z.array(z.string()) });

/**
 * مزود ترجمة عبر Claude.
 * - مخرجات منظمة (JSON) حتى يبقى عدد الأسطر مطابقًا للتوقيت.
 * - fallbacks: "default" — إذا رفض النموذج الطلب لأسباب أمان يعيد الخادم المحاولة على نموذج بديل.
 * - إذا انتهى الرد برفض (refusal) نعامله كحالة "غير مؤكد" ولا نترجم.
 */
export class AnthropicTranslationProvider implements TranslationProvider {
  readonly name = 'anthropic';
  readonly mock = false;
  private client: Anthropic;

  constructor(apiKey: string, private model: string) {
    this.client = new Anthropic({ apiKey, timeout: 90_000 });
  }

  async translate(texts: string[], sourceLanguage: string, targetLanguage: string): Promise<string[]> {
    if (!texts.length) return [];
    const { system, user } = buildTranslationPrompt(texts, sourceLanguage, targetLanguage);
    const response = await this.client.beta.messages.parse({
      model: this.model,
      max_tokens: 16000,
      system,
      messages: [{ role: 'user', content: user }],
      output_config: { effort: 'low', format: betaZodOutputFormat(TranslationsSchema) },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });

    if (response.stop_reason === 'refusal') throw new ProviderRefusalError();
    return parseTranslations(response.parsed_output, texts.length);
  }
}
