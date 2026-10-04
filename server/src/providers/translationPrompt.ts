const LANGUAGE_LABELS: Record<string, string> = {
  ar: 'Arabic', en: 'English', fr: 'French', es: 'Spanish', de: 'German', tr: 'Turkish', ur: 'Urdu', id: 'Indonesian',
};

export function buildTranslationPrompt(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string,
): { system: string; user: string } {
  const from = sourceLanguage === 'auto' ? 'the detected source language' : LANGUAGE_LABELS[sourceLanguage] ?? sourceLanguage;
  const to = LANGUAGE_LABELS[targetLanguage] ?? targetLanguage;
  const system =
    `You translate subtitle lines from ${from} into clear, natural Modern Standard ${to}. ` +
    'The lines are consecutive subtitles from one video or one social post, so keep terminology consistent across them. ' +
    'Return exactly one translation per input line, in the same order, as JSON {"translations": [...]}. ' +
    'Do not merge, split, add commentary, or transliterate unless a name has no translation.';
  const user = JSON.stringify({ lines: texts });
  return { system, user };
}

/** يتحقق أن عدد الترجمات يطابق عدد الأسطر؛ أي اختلاف = خطأ (لا نعرض توقيتًا خاطئًا) */
export function parseTranslations(raw: unknown, expected: number): string[] {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const list = (parsed as { translations?: unknown })?.translations;
  if (!Array.isArray(list) || list.length !== expected || !list.every((t) => typeof t === 'string')) {
    throw new Error('translation provider returned a malformed result');
  }
  return list as string[];
}
