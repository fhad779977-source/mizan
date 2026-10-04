import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createProviders } from '../src/providers/index.js';

export function mockApp(env: Record<string, string> = {}) {
  const config = loadConfig({ PROVIDER_MODE: 'mock', ...env });
  const providers = createProviders(config);
  return { app: createApp({ config, providers }), providers, config };
}

export const FAKE_AUDIO = Buffer.from('fake-webm-audio-bytes-for-mock-mode').toString('base64');
// صورة JPEG صغيرة (1x1) كـ data URL
export const FAKE_FRAME =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

export function videoBody(extra: Record<string, unknown> = {}) {
  return {
    audioBase64: FAKE_AUDIO,
    mimeType: 'audio/webm;codecs=opus',
    offset: 0,
    duration: 6,
    sourceLanguage: 'en',
    targetLanguage: 'ar',
    frames: [FAKE_FRAME],
    ...extra,
  };
}
