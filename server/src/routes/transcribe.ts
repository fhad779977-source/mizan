import { Router } from 'express';
import type { AppContext } from '../app.js';
import { moderateContent } from '../moderation/moderator.js';
import { transcribeSchema } from './schemas.js';
import { decodeAudio, parseBody } from './validate.js';

/**
 * POST /api/transcribe — تفريغ الصوت إلى نص مع التوقيت.
 * حتى هنا نفحص النص قبل إرجاعه: النص الأصلي لمحتوى مرفوض لا يُعاد أبدًا.
 */
export function transcribeRouter({ providers, config }: AppContext): Router {
  const router = Router();
  router.post('/transcribe', async (req, res, next) => {
    const body = parseBody(transcribeSchema, req, res);
    if (!body) return;
    const audio = decodeAudio(body.audioBase64, config.maxAudioBytes, res);
    if (!audio) return;
    const mockScenario = providers.mode === 'mock' ? body.mockScenario : undefined;
    try {
      const transcript = await providers.transcription.transcribe({
        audio,
        mimeType: body.mimeType,
        language: body.sourceLanguage,
        offset: body.offset,
        duration: body.duration,
        mockScenario,
      });
      audio.fill(0);
      const decision = await moderateContent(providers.moderation, {
        text: transcript.segments.map((s) => s.text).join('\n'),
        requireVisual: false,
        strict: body.strict,
        mockScenario,
      });
      if (decision.status !== 'clean') {
        res.json({ status: decision.status === 'rejected' ? 'rejected' : 'uncertain', reason: decision.reason, mock: providers.mode === 'mock' });
        return;
      }
      res.json({ status: 'approved', ...transcript, mock: providers.mode === 'mock' });
    } catch (err) {
      next(err);
    }
  });
  return router;
}
