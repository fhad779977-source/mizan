import { Router } from 'express';
import type { AppContext } from '../app.js';
import { translateText } from '../services/pipeline.js';
import { toSRT, toWebVTT } from '../services/subtitles.js';
import { translateSchema } from './schemas.js';
import { parseBody } from './validate.js';

/**
 * POST /api/translate — ترجمة نص تغريدة ({text}) أو أسطر مؤقتة ({segments}).
 * الفحص إلزامي قبل الترجمة؛ المحتوى المرفوض لا يُترجم.
 */
export function translateRouter({ providers }: AppContext): Router {
  const router = Router();
  router.post('/translate', async (req, res, next) => {
    const body = parseBody(translateSchema, req, res);
    if (!body) return;
    const texts = body.segments?.length ? body.segments.map((s) => s.text) : [body.text!.trim()];
    try {
      const result = await translateText(providers, {
        texts,
        sourceLanguage: body.sourceLanguage,
        targetLanguage: body.targetLanguage,
        strict: body.strict,
        mockScenario: providers.mode === 'mock' ? body.mockScenario : undefined,
      });
      if (result.status !== 'approved') {
        res.json(result);
        return;
      }
      if (body.segments?.length) {
        const segments = body.segments.map((s, i) => ({
          start: s.start,
          end: s.end,
          original: s.text,
          translated: result.translations[i],
        }));
        res.json({
          status: 'approved',
          translationLanguage: body.targetLanguage,
          segments,
          vtt: toWebVTT(segments),
          srt: toSRT(segments),
          mock: result.mock,
        });
        return;
      }
      res.json({
        status: 'approved',
        translationLanguage: body.targetLanguage,
        translated: result.translations[0],
        mock: result.mock,
      });
    } catch (err) {
      next(err);
    }
  });
  return router;
}
