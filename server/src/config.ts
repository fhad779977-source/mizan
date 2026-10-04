import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export type ProviderChoice = 'openai' | 'anthropic' | 'mock';

export interface ServerConfig {
  port: number;
  providerMode: 'auto' | 'mock' | 'live';
  openaiApiKey?: string;
  anthropicApiKey?: string;
  transcriptionProvider: ProviderChoice;
  moderationProvider: ProviderChoice;
  translationProvider: ProviderChoice;
  openaiTranscribeModel: string;
  openaiModerationModel: string;
  openaiTranslateModel: string;
  anthropicModel: string;
  accessToken?: string;
  allowedExtensionIds: string[];
  maxAudioBytes: number;
}

/** يحمّل .env من server/ أولًا ثم من جذر المشروع (أيهما موجود) */
export function loadDotEnv(): void {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [path.resolve(here, '../.env'), path.resolve(here, '../../.env')];
  for (const file of candidates) {
    if (fs.existsSync(file)) dotenv.config({ path: file, quiet: true });
  }
}

function choice(value: string | undefined, fallback: ProviderChoice): ProviderChoice {
  const v = (value ?? '').trim().toLowerCase();
  return v === 'openai' || v === 'anthropic' || v === 'mock' ? v : fallback;
}

function nonEmpty(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const mode = (env.PROVIDER_MODE ?? 'auto').trim().toLowerCase();
  return {
    port: Number(env.PORT) || 8787,
    providerMode: mode === 'mock' || mode === 'live' ? mode : 'auto',
    openaiApiKey: nonEmpty(env.OPENAI_API_KEY),
    anthropicApiKey: nonEmpty(env.ANTHROPIC_API_KEY),
    transcriptionProvider: choice(env.TRANSCRIPTION_PROVIDER, 'openai'),
    moderationProvider: choice(env.MODERATION_PROVIDER, 'openai'),
    translationProvider: choice(env.TRANSLATION_PROVIDER, 'anthropic'),
    openaiTranscribeModel: nonEmpty(env.OPENAI_TRANSCRIBE_MODEL) ?? 'whisper-1',
    openaiModerationModel: nonEmpty(env.OPENAI_MODERATION_MODEL) ?? 'omni-moderation-latest',
    openaiTranslateModel: nonEmpty(env.OPENAI_TRANSLATE_MODEL) ?? 'gpt-4o-mini',
    anthropicModel: nonEmpty(env.ANTHROPIC_MODEL) ?? 'claude-opus-5-5',
    accessToken: nonEmpty(env.ACCESS_TOKEN),
    allowedExtensionIds: (env.ALLOWED_EXTENSION_IDS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    maxAudioBytes: (Number(env.MAX_AUDIO_MB) || 10) * 1024 * 1024,
  };
}

export const SUPPORTED_SOURCE_LANGUAGES = ['auto', 'en', 'fr', 'es', 'de', 'tr', 'ur', 'id'] as const;
export const SUPPORTED_TARGET_LANGUAGES = ['ar'] as const;
