import { describe, expect, it } from 'vitest';
import { findCue, formatTimestamp, mergeSegments, toSRT, toWebVTT } from '../../src/lib/subtitles';

const segs = [
  { start: 3.4, end: 6, original: 'b', translated: 'ب' },
  { start: 0, end: 3.4, original: 'Hello everyone', translated: 'مرحبًا بالجميع' },
];

describe('subtitles', () => {
  it('formats timestamps', () => {
    expect(formatTimestamp(0)).toBe('00:00:00.000');
    expect(formatTimestamp(3.4)).toBe('00:00:03.400');
    expect(formatTimestamp(3725.5, ',')).toBe('01:02:05,500');
  });

  it('produces valid WebVTT sorted by time', () => {
    const vtt = toWebVTT(segs);
    expect(vtt.startsWith('WEBVTT\n')).toBe(true);
    expect(vtt).toContain('1\n00:00:00.000 --> 00:00:03.400\nمرحبًا بالجميع');
    expect(vtt).toContain('2\n00:00:03.400 --> 00:00:06.000\nب');
  });

  it('produces SRT', () => {
    expect(toSRT(segs)).toBe('1\n00:00:00,000 --> 00:00:03,400\nمرحبًا بالجميع\n\n2\n00:00:03,400 --> 00:00:06,000\nب\n');
  });

  it('finds the active cue (sync with speech)', () => {
    const sorted = [...segs].sort((a, b) => a.start - b.start);
    expect(findCue(sorted, 1)?.translated).toBe('مرحبًا بالجميع');
    expect(findCue(sorted, 3.4)?.translated).toBe('ب');
    expect(findCue(sorted, 7)).toBeNull();
  });

  it('merges re-translated windows without duplicates', () => {
    const merged = mergeSegments(segs, [{ start: 0, end: 3, original: 'x', translated: 'س' }], { start: 0, end: 3.4 });
    expect(merged.map((s) => s.translated)).toEqual(['س', 'ب']);
  });
});
