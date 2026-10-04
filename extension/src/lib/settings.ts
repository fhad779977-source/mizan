import type { Settings } from './types';

export const DEFAULT_SERVER_URL = 'http://localhost:8787';

/** الوضع الافتراضي: ترجمة يدوية، فحص صارم، المحتوى غير المناسب مخفي */
export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  translationMode: 'manual',
  strictModeration: true,
  hideUnsafeContent: true,
  hideUnsafeAccounts: false,
  sourceLanguage: 'en',
  targetLanguage: 'ar',
  subtitleFontSize: 20,
  subtitleColor: '#ffffff',
  subtitleBackground: 'dark',
  subtitlePosition: 'bottom',
  showOriginal: false,
  deleteAfterProcessing: true,
  serverUrl: DEFAULT_SERVER_URL,
  accessToken: '',
  mockScenario: 'clean',
  chunkSeconds: 8,
};

const FONT_MIN = 12;
const FONT_MAX = 40;

/** يدمج القيم المخزنة مع الافتراضية ويصحح القيم غير الصالحة */
export function normalizeSettings(raw: Partial<Settings> | undefined): Settings {
  const s = { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
  s.subtitleFontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, Number(s.subtitleFontSize) || DEFAULT_SETTINGS.subtitleFontSize));
  s.chunkSeconds = Math.min(30, Math.max(3, Number(s.chunkSeconds) || DEFAULT_SETTINGS.chunkSeconds));
  if (!/^#[0-9a-f]{6}$/i.test(s.subtitleColor)) s.subtitleColor = DEFAULT_SETTINGS.subtitleColor;
  s.serverUrl = (s.serverUrl || DEFAULT_SERVER_URL).trim().replace(/\/+$/, '');
  s.targetLanguage = 'ar';
  return s;
}

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS as unknown as Record<string, unknown>);
  return normalizeSettings(stored as Partial<Settings>);
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = normalizeSettings({ ...(await getSettings()), ...patch });
  await chrome.storage.sync.set(next);
  return next;
}

export async function resetSettings(): Promise<Settings> {
  await chrome.storage.sync.clear();
  return getSettings();
}

export function onSettingsChanged(listener: (settings: Settings) => void): () => void {
  const handler = (_changes: unknown, area: string) => {
    if (area === 'sync') void getSettings().then(listener);
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}

/** الحسابات التي نشرت محتوى مرفوضًا (معرّف الحساب فقط، محليًا على الجهاز) */
const FLAGGED_KEY = 'flaggedAccounts';

export async function getFlaggedAccounts(): Promise<string[]> {
  const data = await chrome.storage.local.get({ [FLAGGED_KEY]: [] });
  return (data[FLAGGED_KEY] as string[]) ?? [];
}

export async function flagAccount(handle: string): Promise<void> {
  const h = handle.toLowerCase();
  const list = await getFlaggedAccounts();
  if (!list.includes(h)) await chrome.storage.local.set({ [FLAGGED_KEY]: [...list, h].slice(-500) });
}

export async function clearFlaggedAccounts(): Promise<void> {
  await chrome.storage.local.remove(FLAGGED_KEY);
}
