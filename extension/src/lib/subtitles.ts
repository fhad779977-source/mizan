import type { Segment } from './types';

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0');
}

export function formatTimestamp(seconds: number, separator: '.' | ',' = '.'): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const h = Math.floor(totalMs / 3_600_000);
  const m = Math.floor((totalMs % 3_600_000) / 60_000);
  const s = Math.floor((totalMs % 60_000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}${separator}${pad(totalMs % 1000, 3)}`;
}

const clean = (t: string) => t.replace(/-->/g, '→').trim();

export function toSRT(segments: Segment[]): string {
  return sortSegments(segments)
    .map((s, i) => `${i + 1}\n${formatTimestamp(s.start, ',')} --> ${formatTimestamp(s.end, ',')}\n${clean(s.translated)}\n`)
    .join('\n');
}

export function toWebVTT(segments: Segment[]): string {
  const cues = sortSegments(segments).map(
    (s, i) => `${i + 1}\n${formatTimestamp(s.start)} --> ${formatTimestamp(s.end)}\n${clean(s.translated)}\n`,
  );
  return ['WEBVTT', 'Language: ar', '', ...cues].join('\n');
}

export function sortSegments(segments: Segment[]): Segment[] {
  return [...segments].sort((a, b) => a.start - b.start);
}

/**
 * يدمج مقاطع جديدة: يحذف المقاطع القديمة التي تقع داخل نافذة المقطع الجديد
 * (لتجنب التكرار عند إعادة تشغيل جزء سبق ترجمته) ثم يرتّب.
 */
export function mergeSegments(existing: Segment[], incoming: Segment[], window: { start: number; end: number }): Segment[] {
  const kept = existing.filter((s) => s.end <= window.start || s.start >= window.end);
  return sortSegments([...kept, ...incoming]);
}

/** يبحث عن السطر المعروض في لحظة معينة (بحث ثنائي — سريع حتى مع مقاطع طويلة) */
export function findCue(sorted: Segment[], time: number): Segment | null {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const s = sorted[mid];
    if (time < s.start) hi = mid - 1;
    else if (time >= s.end) lo = mid + 1;
    else return s;
  }
  return null;
}
