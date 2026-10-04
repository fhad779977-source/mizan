import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { FAKE_FRAME, mockApp, videoBody } from './helpers.js';

describe('GET /api/health', () => {
  it('reports mock mode clearly when no API keys exist', async () => {
    const { app } = mockApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('mock');
    expect(res.body.notice).toContain('وضع التجربة مفعّل');
  });
});

describe('POST /api/process-video', () => {
  it('approves clean mock content, keeps timing and returns WebVTT', async () => {
    const { app } = mockApp();
    const res = await request(app).post('/api/process-video').send(videoBody({ offset: 3 }));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
    expect(res.body.mock).toBe(true);
    expect(res.body.translationLanguage).toBe('ar');
    expect(res.body.segments.length).toBeGreaterThan(0);
    const [first] = res.body.segments;
    expect(first.start).toBeGreaterThanOrEqual(3);
    expect(first.end).toBeGreaterThan(first.start);
    expect(first.translated).toMatch(/[؀-ۿ]/);
    expect(res.body.vtt.startsWith('WEBVTT')).toBe(true);
    expect(res.body.vtt).toMatch(/00:00:03\.000 --> 00:00:0\d\.\d{3}/);
    expect(res.body.srt).toMatch(/00:00:03,000 --> /);
  });

  it('rejects inappropriate content and never returns original or translated text', async () => {
    const { app } = mockApp();
    const res = await request(app).post('/api/process-video').send(videoBody({ mockScenario: 'rejected' }));
    expect(res.body).toEqual({ status: 'rejected', reason: 'المقطع لا يطابق سياسة المحتوى النظيف', mock: true });
    expect(JSON.stringify(res.body)).not.toMatch(/nudity|porn|segments|vtt/i);
  });

  it('blocks uncertain content (no translation when unsure)', async () => {
    const { app } = mockApp();
    const res = await request(app).post('/api/process-video').send(videoBody({ mockScenario: 'uncertain' }));
    expect(res.body.status).toBe('uncertain');
    expect(res.body.segments).toBeUndefined();
    expect(res.body.reason).toContain('اختر مقطعًا آخر');
  });

  it('treats a missing visual check as uncertain', async () => {
    const { app } = mockApp();
    const res = await request(app).post('/api/process-video').send(videoBody({ frames: [] }));
    expect(res.body.status).toBe('uncertain');
  });

  it('validates input', async () => {
    const { app } = mockApp();
    const res = await request(app).post('/api/process-video').send({ duration: 3 });
    expect(res.status).toBe(400);
    const bad = await request(app).post('/api/process-video').send(videoBody({ frames: ['https://evil.example/x.jpg'] }));
    expect(bad.status).toBe(400);
  });

  it('rejects unknown mockScenario values', async () => {
    const { app } = mockApp();
    const res = await request(app).post('/api/process-video').send(videoBody({ mockScenario: 'bogus' }));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/translate', () => {
  it('translates clean tweet text (mock clearly labelled)', async () => {
    const { app } = mockApp();
    const res = await request(app).post('/api/translate').send({ text: 'Hello everyone' });
    expect(res.body).toMatchObject({ status: 'approved', translated: 'مرحبًا بالجميع', mock: true });
  });

  it('labels unknown text as a mock translation instead of pretending', async () => {
    const { app } = mockApp();
    const res = await request(app).post('/api/translate').send({ text: 'Some random tweet' });
    expect(res.body.translated).toContain('ترجمة تجريبية');
  });

  it('refuses to translate offensive or explicit text', async () => {
    const { app } = mockApp();
    for (const text of ['check my nudes', 'just kill yourself', 'مقطع إباحي']) {
      const res = await request(app).post('/api/translate').send({ text });
      expect(res.body.status).toBe('rejected');
      expect(res.body.translated).toBeUndefined();
    }
  });

  it('translates timed segments and returns VTT', async () => {
    const { app } = mockApp();
    const res = await request(app)
      .post('/api/translate')
      .send({ segments: [{ start: 0, end: 3.4, text: 'Hello everyone' }] });
    expect(res.body.status).toBe('approved');
    expect(res.body.segments[0]).toEqual({ start: 0, end: 3.4, original: 'Hello everyone', translated: 'مرحبًا بالجميع' });
    expect(res.body.vtt).toContain('00:00:00.000 --> 00:00:03.400');
  });
});

describe('POST /api/transcribe', () => {
  it('returns timed transcript for clean audio', async () => {
    const { app } = mockApp();
    const body = videoBody();
    const res = await request(app).post('/api/transcribe').send({ audioBase64: body.audioBase64, mimeType: body.mimeType, duration: 6 });
    expect(res.body.status).toBe('approved');
    expect(res.body.segments[0].text).toBeTruthy();
  });

  it('withholds the transcript of rejected audio', async () => {
    const { app } = mockApp();
    const body = videoBody();
    const res = await request(app)
      .post('/api/transcribe')
      .send({ audioBase64: body.audioBase64, mimeType: body.mimeType, duration: 6, mockScenario: 'rejected' });
    expect(res.body.status).toBe('rejected');
    expect(res.body.segments).toBeUndefined();
  });
});

describe('POST /api/moderate', () => {
  it('returns status only', async () => {
    const { app } = mockApp();
    const clean = await request(app).post('/api/moderate').send({ text: 'A lovely garden tutorial' });
    expect(clean.body.status).toBe('clean');
    const bad = await request(app).post('/api/moderate').send({ text: 'explicit porn' });
    expect(bad.body.status).toBe('rejected');
    expect(JSON.stringify(bad.body)).not.toContain('porn');
    const visual = await request(app).post('/api/moderate').send({ frames: [FAKE_FRAME], mockScenario: 'uncertain' });
    expect(visual.body.status).toBe('uncertain');
  });
});

describe('POST /api/create-vtt', () => {
  it('builds VTT and SRT', async () => {
    const { app } = mockApp();
    const res = await request(app)
      .post('/api/create-vtt')
      .send({ segments: [{ start: 0, end: 3.4, translated: 'مرحبًا بالجميع' }] });
    expect(res.body.vtt).toBe('WEBVTT\nLanguage: ar\n\n1\n00:00:00.000 --> 00:00:03.400\nمرحبًا بالجميع\n');
    expect(res.body.srt).toBe('1\n00:00:00,000 --> 00:00:03,400\nمرحبًا بالجميع\n');
  });
});

describe('security', () => {
  it('requires the access token when configured', async () => {
    const { app } = mockApp({ ACCESS_TOKEN: 'secret' });
    expect((await request(app).post('/api/translate').send({ text: 'Hello everyone' })).status).toBe(401);
    const ok = await request(app).post('/api/translate').set('X-XAC-Token', 'secret').send({ text: 'Hello everyone' });
    expect(ok.status).toBe(200);
    expect((await request(app).get('/api/health')).status).toBe(200);
  });

  it('allows chrome extension origins and rejects arbitrary websites', async () => {
    const { app } = mockApp();
    const ext = await request(app).get('/api/health').set('Origin', 'chrome-extension://abcdefghijklmnopabcdefghijklmnop');
    expect(ext.headers['access-control-allow-origin']).toBe('chrome-extension://abcdefghijklmnopabcdefghijklmnop');
    const site = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(site.headers['access-control-allow-origin']).toBeUndefined();
  });
});
