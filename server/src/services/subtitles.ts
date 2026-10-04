export interface SubtitleSegment {
  start: number;
  end: number;
  original?: string;
  translated: string;
}

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0');
}

/** 3.4 → "00:00:03.400" (VTT) أو "00:00:03,400" (SRT) */
export function formatTimestamp(seconds: number, separator: '.' | ',' = '.'): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const h = Math.floor(totalMs / 3_600_000);
  const m = Math.floor((totalMs % 3_600_000) / 60_000);
  const s = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)}${separator}${pad(ms, 3)}`;
}

/** يمنع كسر بنية الملف إذا احتوى النص على "-->" أو أسطر فارغة */
function sanitizeCueText(text: string): string {
  return text.replace(/-->/g, '→').replace(/\r?\n\s*\r?\n/g, '\n').trim();
}

function sorted(segments: SubtitleSegment[]): SubtitleSegment[] {
  return [...segments]
    .filter((s) => s.translated.trim() && s.end > s.start)
    .sort((a, b) => a.start - b.start);
}

export function toWebVTT(segments: SubtitleSegment[]): string {
  const cues = sorted(segments).map(
    (s, i) => `${i + 1}\n${formatTimestamp(s.start)} --> ${formatTimestamp(s.end)}\n${sanitizeCueText(s.translated)}`,
  );
  return ['WEBVTT', 'Language: ar', '', ...cues.flatMap((c) => [c, ''])].join('\n');
}

export function toSRT(segments: SubtitleSegment[]): string {
  return sorted(segments)
    .map(
      (s, i) =>
        `${i + 1}\n${formatTimestamp(s.start, ',')} --> ${formatTimestamp(s.end, ',')}\n${sanitizeCueText(s.translated)}\n`,
    )
    .join('\n');
}
