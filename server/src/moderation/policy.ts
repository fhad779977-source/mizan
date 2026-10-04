import type { ModerationCategory, ModerationSignal } from '../providers/types.js';

export type ModerationStatus = 'clean' | 'rejected' | 'uncertain';

export interface ModerationDecision {
  status: ModerationStatus;
  /** سبب مختصر ومحترم يُعرض للمستخدم — لا يحتوي أبدًا على النص الأصلي */
  reason?: string;
  categories: ModerationCategory[];
}

export const REJECTED_REASON = 'المقطع لا يطابق سياسة المحتوى النظيف';
export const UNCERTAIN_REASON =
  'لم نتمكن من التأكد من أن المحتوى نظيف، لذلك لم تتم الترجمة. اختر مقطعًا آخر.';
export const VISUAL_UNAVAILABLE_REASON =
  'تعذّر فحص صورة المقطع، ولا نترجم مقطعًا لم نتأكد من نظافته. اختر مقطعًا آخر.';

interface Thresholds {
  reject: number;
  uncertain: number;
}

/** الفئات المحظورة وعتباتها. strict = الوضع الافتراضي. */
const STRICT: Record<ModerationCategory, Thresholds> = {
  sexual: { reject: 0.3, uncertain: 0.08 },
  nudity: { reject: 0.3, uncertain: 0.08 },
  sexual_minors: { reject: 0.05, uncertain: 0.01 },
  sexual_exploitation: { reject: 0.2, uncertain: 0.05 },
  obscene: { reject: 0.4, uncertain: 0.15 },
  graphic_violence: { reject: 0.4, uncertain: 0.15 },
  hate: { reject: 0.5, uncertain: 0.3 },
  harassment: { reject: 0.6, uncertain: 0.4 },
};

const STANDARD: Record<ModerationCategory, Thresholds> = {
  sexual: { reject: 0.5, uncertain: 0.2 },
  nudity: { reject: 0.5, uncertain: 0.2 },
  sexual_minors: { reject: 0.05, uncertain: 0.01 },
  sexual_exploitation: { reject: 0.3, uncertain: 0.1 },
  obscene: { reject: 0.6, uncertain: 0.3 },
  graphic_violence: { reject: 0.6, uncertain: 0.3 },
  hate: { reject: 0.6, uncertain: 0.4 },
  harassment: { reject: 0.7, uncertain: 0.5 },
};

export interface DecideOptions {
  strict: boolean;
  /** done = تم فحص الصورة، unavailable = مطلوب ولم يتم، not_required = نص فقط (تغريدة) */
  visual: 'done' | 'unavailable' | 'not_required';
}

/**
 * القرار النهائي. القاعدة: لا يُسمح بالترجمة إلا إذا كانت النتيجة clean.
 * أي شك (درجة متوسطة، فحص صورة ناقص) = uncertain = منع.
 */
export function decide(signals: ModerationSignal[], opts: DecideOptions): ModerationDecision {
  const table = opts.strict ? STRICT : STANDARD;
  const rejected = new Set<ModerationCategory>();
  const uncertain = new Set<ModerationCategory>();

  for (const signal of signals) {
    for (const [cat, score] of Object.entries(signal.scores) as Array<[ModerationCategory, number]>) {
      const t = table[cat];
      if (!t || typeof score !== 'number') continue;
      if (signal.source === 'lexicon' || score >= t.reject) rejected.add(cat);
      else if (score >= t.uncertain) uncertain.add(cat);
    }
    // إذا قال المزود إن المحتوى مخالف دون درجة واضحة في فئاتنا، نعتبره غير مؤكد على الأقل
    if (signal.flagged && signal.source !== 'lexicon' && rejected.size === 0) {
      const hasKnown = Object.keys(signal.scores).length > 0;
      if (!hasKnown) uncertain.add('obscene');
    }
  }

  if (rejected.size > 0) {
    return { status: 'rejected', reason: REJECTED_REASON, categories: [...rejected] };
  }
  if (uncertain.size > 0) {
    return { status: 'uncertain', reason: UNCERTAIN_REASON, categories: [...uncertain] };
  }
  if (opts.visual === 'unavailable') {
    return { status: 'uncertain', reason: VISUAL_UNAVAILABLE_REASON, categories: [] };
  }
  return { status: 'clean', categories: [] };
}
