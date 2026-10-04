import { Router } from 'express';
import { toSRT, toWebVTT } from '../services/subtitles.js';
import { createVttSchema } from './schemas.js';
import { parseBody } from './validate.js';

/** POST /api/create-vtt — تحويل مقاطع مترجمة إلى WebVTT وSRT */
export function createVttRouter(): Router {
  const router = Router();
  router.post('/create-vtt', (req, res) => {
    const body = parseBody(createVttSchema, req, res);
    if (!body) return;
    res.json({ vtt: toWebVTT(body.segments), srt: toSRT(body.segments) });
  });
  return router;
}
