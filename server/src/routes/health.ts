import { Router } from 'express';
import type { AppContext } from '../app.js';
import { SUPPORTED_SOURCE_LANGUAGES, SUPPORTED_TARGET_LANGUAGES } from '../config.js';

export function healthRouter({ providers }: AppContext): Router {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      mode: providers.mode,
      providers: {
        transcription: providers.transcription.name,
        moderation: providers.moderation.name,
        translation: providers.translation.name,
      },
      languages: { source: SUPPORTED_SOURCE_LANGUAGES, target: SUPPORTED_TARGET_LANGUAGES },
      notice:
        providers.mode === 'mock'
          ? 'وضع التجربة مفعّل — أضف مفاتيح API لتشغيل الترجمة الحقيقية.'
          : undefined,
    });
  });
  return router;
}
