import { z } from 'zod';
import { SUPPORTED_SOURCE_LANGUAGES, SUPPORTED_TARGET_LANGUAGES } from '../config.js';

const sourceLanguage = z.enum(SUPPORTED_SOURCE_LANGUAGES).default('en');
const targetLanguage = z.enum(SUPPORTED_TARGET_LANGUAGES).default('ar');
const mockScenario = z.enum(['clean', 'rejected', 'uncertain']).optional();
const strict = z.boolean().default(true);

/** صور JPEG/PNG/WebP فقط بصيغة data URL، وحجم معقول لكل صورة */
const frame = z
  .string()
  .max(1_500_000)
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/);

const audioBase64 = z.string().min(1).regex(/^[A-Za-z0-9+/=]+$/);
const mimeType = z.string().regex(/^audio\/[a-z0-9.+-]+(;\s*codecs=[a-z0-9.,"\s-]+)?$/i);

export const processVideoSchema = z.object({
  audioBase64,
  mimeType,
  offset: z.number().min(0).max(24 * 3600),
  duration: z.number().positive().max(120),
  sourceLanguage,
  targetLanguage,
  frames: z.array(frame).max(4).default([]),
  strict,
  mockScenario,
});

export const transcribeSchema = z.object({
  audioBase64,
  mimeType,
  offset: z.number().min(0).default(0),
  duration: z.number().positive().max(120),
  sourceLanguage,
  strict,
  mockScenario,
});

export const moderateSchema = z
  .object({
    text: z.string().max(20_000).default(''),
    frames: z.array(frame).max(4).default([]),
    requireVisual: z.boolean().default(false),
    strict,
    mockScenario,
  })
  .refine((v) => v.text.trim() || v.frames.length, { message: 'text or frames required' });

export const translateSchema = z
  .object({
    text: z.string().max(10_000).optional(),
    segments: z
      .array(z.object({ start: z.number().min(0), end: z.number().min(0), text: z.string().max(2000) }))
      .max(500)
      .optional(),
    sourceLanguage: z.enum(SUPPORTED_SOURCE_LANGUAGES).default('auto'),
    targetLanguage,
    strict,
    mockScenario,
  })
  .refine((v) => Boolean(v.text?.trim()) || Boolean(v.segments?.length), { message: 'text or segments required' });

export const createVttSchema = z.object({
  segments: z
    .array(
      z.object({
        start: z.number().min(0),
        end: z.number().min(0),
        translated: z.string().max(2000),
        original: z.string().max(2000).optional(),
      }),
    )
    .max(2000),
});
