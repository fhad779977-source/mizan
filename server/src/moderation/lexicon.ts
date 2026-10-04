import type { ModerationCategory, ModerationSignal } from '../providers/types.js';

/**
 * قاموس محلي صارم يعمل قبل أي مزود خارجي.
 * أي تطابق هنا = رفض مباشر. يعمل أيضًا في وضع التجربة، لذلك نتيجة الرفض فيه حقيقية
 * وليست مصطنعة.
 *
 * ملاحظة: القاموس متعمَّد التشدد (قد يرفض أحيانًا محتوى بريئًا) لأن سياسة المنتج
 * تفضّل الرفض على السماح عند الشك.
 */
const LEXICON: Record<ModerationCategory, string[]> = {
  sexual: [
    'porn', 'porno', 'pornography', 'pornographic', 'xxx', 'nsfw', 'hentai', 'onlyfans',
    'sex tape', 'explicit sex', 'sexual intercourse', 'blowjob', 'orgasm', 'erotic', 'stripper',
    'striptease', 'camgirl', 'سكس', 'إباحي', 'اباحي', 'إباحية', 'اباحية', 'جنسي صريح', 'مقاطع جنسية',
  ],
  nudity: [
    'nude', 'nudes', 'nudity', 'naked', 'topless', 'bottomless', 'undressing',
    'عاري', 'عارية', 'عراة', 'تعري', 'تعرّي', 'التعري',
  ],
  sexual_minors: ['child porn', 'underage sex', 'loli', 'lolicon', 'shota', 'استغلال الأطفال جنسيا', 'استغلال الأطفال جنسيًا'],
  sexual_exploitation: [
    'sex trafficking', 'revenge porn', 'sextortion', 'escort service', 'اتجار بالبشر', 'ابتزاز جنسي',
  ],
  obscene: ['fuck', 'fucking', 'motherfucker', 'cunt', 'pussy', 'dick pic', 'شرموط', 'شرموطة', 'منيوك', 'كس امك'],
  graphic_violence: [
    'beheading', 'beheaded', 'decapitation', 'dismembered', 'dismemberment', 'gore', 'gory',
    'disembowel', 'قطع رأس', 'ذبح إنسان', 'أشلاء',
  ],
  hate: [],
  harassment: ['kill yourself', 'kys', 'اقتل نفسك'],
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// حدود الكلمة: نستخدم فئات Unicode لأن \b لا يعمل مع العربية
const PATTERNS: Array<{ category: ModerationCategory; re: RegExp }> = Object.entries(LEXICON).flatMap(
  ([category, terms]) =>
    terms.map((term) => ({
      category: category as ModerationCategory,
      re: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`, 'iu'),
    })),
);

/** تطبيع بسيط: إزالة التشكيل والتطويل وتوحيد المسافات */
export function normalizeText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[ً-ْـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function scanLexicon(text: string): ModerationSignal {
  const normalized = normalizeText(text);
  const scores: ModerationSignal['scores'] = {};
  for (const { category, re } of PATTERNS) {
    if (re.test(normalized)) scores[category] = 1;
  }
  return { source: 'lexicon', scores, flagged: Object.keys(scores).length > 0 };
}
