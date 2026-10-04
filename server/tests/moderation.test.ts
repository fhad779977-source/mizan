import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { scanLexicon } from '../src/moderation/lexicon.js';
import { decide } from '../src/moderation/policy.js';
import { createProviders } from '../src/providers/index.js';

describe('lexicon', () => {
  it('matches whole words in English and Arabic', () => {
    expect(scanLexicon('This has NUDITY in it').flagged).toBe(true);
    expect(scanLexicon('فيديو إباحي').flagged).toBe(true);
    expect(scanLexicon('فيديو إبَاحِي').flagged).toBe(true); // مع التشكيل
    expect(scanLexicon('Gardening tips for spring').flagged).toBe(false);
    expect(scanLexicon('a pornographer').flagged).toBe(false); // ليست كلمة كاملة من القاموس
  });
});

describe('policy', () => {
  const strict = { strict: true, visual: 'done' as const };
  it('rejects high scores', () => {
    expect(decide([{ source: 'image', scores: { nudity: 0.9 }, flagged: true }], strict).status).toBe('rejected');
  });
  it('marks medium scores as uncertain (blocked)', () => {
    expect(decide([{ source: 'image', scores: { sexual: 0.12 }, flagged: false }], strict).status).toBe('uncertain');
  });
  it('is stricter in strict mode than standard', () => {
    const s = [{ source: 'text' as const, scores: { sexual: 0.35 }, flagged: false }];
    expect(decide(s, strict).status).toBe('rejected');
    expect(decide(s, { strict: false, visual: 'done' }).status).toBe('uncertain');
  });
  it('blocks when the visual check is unavailable', () => {
    expect(decide([], { strict: true, visual: 'unavailable' }).status).toBe('uncertain');
  });
  it('allows clean content', () => {
    expect(decide([{ source: 'image', scores: { sexual: 0.001 }, flagged: false }], strict).status).toBe('clean');
  });
});

describe('provider selection', () => {
  it('falls back to mock without keys', () => {
    const p = createProviders(loadConfig({}));
    expect(p.mode).toBe('mock');
    expect(p.warnings.length).toBeGreaterThan(0);
  });
  it('refuses to start in live mode without keys', () => {
    expect(() => createProviders(loadConfig({ PROVIDER_MODE: 'live' }))).toThrow();
  });
  it('uses real providers when keys exist', () => {
    const p = createProviders(loadConfig({ OPENAI_API_KEY: 'sk-test', ANTHROPIC_API_KEY: 'sk-ant-test' }));
    expect(p.mode).toBe('live');
    expect(p.translation.name).toBe('anthropic');
    expect(p.moderation.name).toBe('openai');
  });
  it('never pairs real processing with mock moderation', () => {
    const p = createProviders(loadConfig({ OPENAI_API_KEY: 'sk-test', MODERATION_PROVIDER: 'mock' }));
    expect(p.transcription.mock).toBe(true);
    expect(p.translation.mock).toBe(true);
  });
});
