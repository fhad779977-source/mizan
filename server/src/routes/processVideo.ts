import { Router } from 'express';
import type { AppContext } from '../app.js';
import { processVideoChunk } from '../services/pipeline.js';
import { processVideoSchema } from './schemas.js';
import { decodeAudio, parseBody } from './validate.js';

/** POST /api/process-video — المسار الكامل: تفريغ → فحص → ترجمة → WebVTT */
export function processVideoRouter({ providers, config }: AppContext): Router {
  const router = Router();
  router.post('/process-video', async (req, res, next) => {
    const body = parseBody(processVideoSchema, req, res);
    if (!body) return;
    const audio = decodeAudio(body.audioBase64, config.maxAudioBytes, res);
    if (!audio) return;
    try {
      const result = await processVideoChunk(providers, {
        audio,
        mimeType: body.mimeType,
        offset: body.offset,
        duration: body.duration,
        sourceLanguage: body.sourceLanguage,
        targetLanguage: body.targetLanguage,
        frames: body.frames,
        strict: body.strict,
        mockScenario: providers.mode === 'mock' ? body.mockScenario : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });
  return router;
}
