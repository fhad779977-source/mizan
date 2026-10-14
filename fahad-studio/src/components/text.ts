export const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export const hasArabic = (s: string) => ARABIC_RE.test(s);

/** Grapheme-safe split (keeps combining marks attached). Never used for Arabic. */
export const graphemes = (s: string): string[] => {
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: object) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
  if (Seg) return Array.from(new Seg("en", { granularity: "grapheme" }).segment(s), (x) => x.segment);
  return Array.from(s);
};
