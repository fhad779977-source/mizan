import { beforeEach, describe, expect, it } from 'vitest';
import { clearFlaggedAccounts, DEFAULT_SETTINGS, flagAccount, getFlaggedAccounts, getSettings, normalizeSettings, onSettingsChanged, saveSettings } from '../../src/lib/settings';
import { resetChrome } from './setup';

describe('settings', () => {
  beforeEach(() => resetChrome());

  it('defaults: manual translation, strict moderation, unsafe content hidden', async () => {
    const s = await getSettings();
    expect(s.translationMode).toBe('manual');
    expect(s.strictModeration).toBe(true);
    expect(s.hideUnsafeContent).toBe(true);
    expect(s.deleteAfterProcessing).toBe(true);
    expect(s).toEqual(DEFAULT_SETTINGS);
  });

  it('saves and reloads settings', async () => {
    await saveSettings({ subtitleFontSize: 28, subtitleColor: '#fde047', translationMode: 'auto' });
    const s = await getSettings();
    expect(s.subtitleFontSize).toBe(28);
    expect(s.subtitleColor).toBe('#fde047');
    expect(s.translationMode).toBe('auto');
  });

  it('notifies listeners on change', async () => {
    const seen: number[] = [];
    const off = onSettingsChanged((s) => seen.push(s.subtitleFontSize));
    await saveSettings({ subtitleFontSize: 24 });
    await new Promise((r) => setTimeout(r, 0));
    off();
    expect(seen).toContain(24);
  });

  it('sanitizes invalid values', () => {
    const s = normalizeSettings({ subtitleFontSize: 999, subtitleColor: 'red; x', serverUrl: 'http://localhost:8787///' });
    expect(s.subtitleFontSize).toBe(40);
    expect(s.subtitleColor).toBe('#ffffff');
    expect(s.serverUrl).toBe('http://localhost:8787');
  });

  it('stores flagged accounts locally and can clear them', async () => {
    await flagAccount('BadUser');
    await flagAccount('baduser');
    expect(await getFlaggedAccounts()).toEqual(['baduser']);
    await clearFlaggedAccounts();
    expect(await getFlaggedAccounts()).toEqual([]);
  });
});
