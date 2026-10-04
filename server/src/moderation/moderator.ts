import type { MockScenario, ModerationProvider, ModerationSignal } from '../providers/types.js';
import { scanLexicon } from './lexicon.js';
import { decide, type ModerationDecision, UNCERTAIN_REASON } from './policy.js';

export interface ModerateInput {
  text: string;
  /** صور من الفيديو (data URL). فارغة للتغريدات النصية */
  frames?: string[];
  /** هل فحص الصورة إلزامي (مقاطع الفيديو = نعم) */
  requireVisual: boolean;
  strict: boolean;
  mockScenario?: MockScenario;
}

/**
 * يجمع ثلاث إشارات: القاموس المحلي، فحص النص لدى المزود، فحص الصور لدى المزود.
 * أي خطأ من المزود = uncertain (لا نترجم ما لم نتحقق منه).
 */
export async function moderateContent(
  provider: ModerationProvider,
  input: ModerateInput,
): Promise<ModerationDecision> {
  const signals: ModerationSignal[] = [];
  const text = input.text.trim();

  if (text) {
    const lexicon = scanLexicon(text);
    if (lexicon.flagged) {
      // رفض مبكر: لا حاجة لإرسال النص لمزود خارجي
      return decide([lexicon], { strict: input.strict, visual: 'not_required' });
    }
    signals.push(lexicon);
  }

  const frames = (input.frames ?? []).slice(0, 4);
  let visual: 'done' | 'unavailable' | 'not_required' = input.requireVisual ? 'unavailable' : 'not_required';

  try {
    const ctx = { mockScenario: input.mockScenario };
    const [textSignal, imageSignals] = await Promise.all([
      text ? provider.moderateText(text, ctx) : Promise.resolve(null),
      frames.length ? provider.moderateImages(frames, ctx) : Promise.resolve([]),
    ]);
    if (textSignal) signals.push(textSignal);
    signals.push(...imageSignals);
    if (frames.length && imageSignals.length === frames.length) visual = 'done';
  } catch {
    return { status: 'uncertain', reason: UNCERTAIN_REASON, categories: [] };
  }

  return decide(signals, { strict: input.strict, visual });
}
