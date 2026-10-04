import { Router } from 'express';
import type { AppContext } from '../app.js';
import { moderateContent } from '../moderation/moderator.js';
import { moderateSchema } from './schemas.js';
import { parseBody } from './validate.js';

/** POST /api/moderate — فحص نص و/أو صور. يعيد الحالة فقط ولا يعيد المحتوى. */
export function moderateRouter({ providers }: AppContext): Router {
  const router = Router();
  router.post('/moderate', async (req, res, next) => {
    const body = parseBody(moderateSchema, req, res);
    if (!body) return;
    try {
      const decision = await moderateContent(providers.moderation, {
        text: body.text,
        frames: body.frames,
        requireVisual: body.requireVisual,
        strict: body.strict,
        mockScenario: providers.mode === 'mock' ? body.mockScenario : undefined,
      });
      res.json({ ...decision, mock: providers.mode === 'mock' });
    } catch (err) {
      next(err);
    }
  });
  return router;
}
