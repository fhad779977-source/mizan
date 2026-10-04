import { describe, expect, it, vi } from 'vitest';
import type { CaptureBackend, CapturedChunk } from '../../src/lib/capture';
import { VideoTranslationSession, type SessionDeps } from '../../src/lib/session';
import type { ProcessResult } from '../../src/lib/types';

class FakeCapture implements CaptureBackend {
  onChunk: (c: CapturedChunk) => void = () => {};
  stopped = false;
  start(onChunk: (c: CapturedChunk) => void) {
    this.onChunk = onChunk;
  }
  stop() {
    this.stopped = true;
  }
  emit(offset: number, duration = 3) {
    this.onChunk({ audio: new Blob(['a']), mimeType: 'audio/webm', offset, duration, playbackRate: 1, frames: ['data:image/jpeg;base64,AA=='] });
  }
}

function setup(results: ProcessResult[]) {
  const video = document.createElement('video');
  Object.defineProperty(video, 'duration', { value: 30, configurable: true });
  Object.defineProperty(video, 'paused', { value: false, configurable: true });
  const capture = new FakeCapture();
  const processChunk = vi.fn(async () => results.shift()!);
  const abort = vi.fn();
  const deps: SessionDeps = {
    createCapture: () => capture,
    encodeAudio: async () => 'YQ==',
    processChunk,
    abort,
    newRequestId: (() => {
      let i = 0;
      return () => `r${++i}`;
    })(),
    describeError: () => 'error',
  };
  return { session: new VideoTranslationSession(video, deps), capture, processChunk, abort };
}

const approved = (start: number, text: string): ProcessResult => ({
  status: 'approved',
  language: 'en',
  translationLanguage: 'ar',
  segments: [{ start, end: start + 2.9, original: text, translated: `ع:${text}` }],
  vtt: 'WEBVTT',
  srt: '',
  mock: true,
});

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('VideoTranslationSession', () => {
  it('translates clean chunks progressively', async () => {
    const { session, capture, processChunk } = setup([approved(0, 'a'), approved(3, 'b')]);
    session.start();
    expect(session.getSnapshot().status).toBe('processing');
    capture.emit(0);
    capture.emit(3);
    await tick();
    await tick();
    expect(processChunk).toHaveBeenCalledTimes(2);
    expect(session.getSnapshot().segments.map((s) => s.translated)).toEqual(['ع:a', 'ع:b']);
    expect(session.getSnapshot().mock).toBe(true);
  });

  it('a rejected chunk stops everything and wipes previous translation', async () => {
    const { session, capture, abort } = setup([approved(0, 'a'), { status: 'rejected', reason: 'المقطع لا يطابق سياسة المحتوى النظيف' }]);
    session.start();
    capture.emit(0);
    await tick();
    await tick();
    expect(session.getSnapshot().segments).toHaveLength(1);
    capture.emit(3);
    await tick();
    await tick();
    const snap = session.getSnapshot();
    expect(snap.status).toBe('rejected');
    expect(snap.segments).toEqual([]);
    expect(capture.stopped).toBe(true);
    expect(abort).not.toHaveBeenCalledWith('r2'); // already completed
  });

  it('an uncertain chunk is blocked too', async () => {
    const { session, capture } = setup([{ status: 'uncertain', reason: 'اختر مقطعًا آخر' }]);
    session.start();
    capture.emit(0);
    await tick();
    await tick();
    expect(session.getSnapshot().status).toBe('uncertain');
    expect(session.getSnapshot().message).toContain('مقطعًا آخر');
    expect(session.getSnapshot().segments).toEqual([]);
  });

  it('stop aborts pending requests and ignores late responses', async () => {
    let resolve!: (r: ProcessResult) => void;
    const { session, capture, abort, processChunk } = setup([]);
    processChunk.mockImplementation(() => new Promise<ProcessResult>((r) => (resolve = r)));
    session.start();
    capture.emit(0);
    await tick();
    session.stop();
    expect(abort).toHaveBeenCalledWith('r1');
    resolve(approved(0, 'late'));
    await tick();
    expect(session.getSnapshot().segments).toEqual([]);
    expect(session.getSnapshot().status).toBe('stopped');
  });

  it('delete result clears memory immediately', async () => {
    const { session, capture } = setup([approved(0, 'a')]);
    session.start();
    capture.emit(0);
    await tick();
    await tick();
    session.clear();
    expect(session.getSnapshot()).toMatchObject({ status: 'idle', segments: [] });
  });

  it('does not re-send ranges that are already translated', async () => {
    const { session, capture, processChunk } = setup([approved(0, 'a')]);
    session.start();
    capture.emit(0);
    await tick();
    await tick();
    capture.emit(0); // looped playback over the same range
    await tick();
    expect(processChunk).toHaveBeenCalledTimes(1);
  });
});
