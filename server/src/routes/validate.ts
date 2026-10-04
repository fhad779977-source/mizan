import type { Request, Response } from 'express';
import type { z } from 'zod';

/** يتحقق من جسم الطلب؛ عند الخطأ يرد 400 بدون إعادة محتوى المستخدم */
export function parseBody<S extends z.ZodType>(schema: S, req: Request, res: Response): z.infer<S> | null {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    res.status(400).json({
      status: 'error',
      error: 'invalid_request',
      fields: result.error.issues.map((i) => i.path.join('.') || 'body'),
    });
    return null;
  }
  return result.data;
}

export function decodeAudio(base64: string, maxBytes: number, res: Response): Buffer | null {
  const audio = Buffer.from(base64, 'base64');
  if (!audio.length || audio.length > maxBytes) {
    res.status(413).json({ status: 'error', error: 'audio_too_large_or_empty' });
    return null;
  }
  return audio;
}
