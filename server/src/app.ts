import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import type { ServerConfig } from './config.js';
import type { ProviderSet } from './providers/types.js';
import { createVttRouter } from './routes/createVtt.js';
import { healthRouter } from './routes/health.js';
import { moderateRouter } from './routes/moderate.js';
import { processVideoRouter } from './routes/processVideo.js';
import { transcribeRouter } from './routes/transcribe.js';
import { translateRouter } from './routes/translate.js';

export interface AppContext {
  config: ServerConfig;
  providers: ProviderSet;
}

function isAllowedOrigin(origin: string, config: ServerConfig): boolean {
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  const match = /^chrome-extension:\/\/([a-p]{32})$/.exec(origin);
  if (!match) return false;
  return config.allowedExtensionIds.length === 0 || config.allowedExtensionIds.includes(match[1]);
}

export function createApp(ctx: AppContext): express.Express {
  const { config } = ctx;
  const app = express();
  app.disable('x-powered-by');

  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || isAllowedOrigin(origin, config)),
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'X-XAC-Token'],
    }),
  );
  app.use(express.json({ limit: Math.ceil(config.maxAudioBytes * 1.4) + 6 * 1024 * 1024 }));

  // لا تخزين مؤقت لأي استجابة (قد تحتوي نصوصًا)
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // رمز وصول اختياري لحماية مفاتيح API عند نشر الخادم
  app.use('/api', (req, res, next) => {
    if (!config.accessToken || req.path === '/health') return next();
    if (req.get('X-XAC-Token') !== config.accessToken) {
      res.status(401).json({ status: 'error', error: 'unauthorized' });
      return;
    }
    next();
  });

  app.use('/api', healthRouter(ctx));
  app.use('/api', processVideoRouter(ctx));
  app.use('/api', transcribeRouter(ctx));
  app.use('/api', moderateRouter(ctx));
  app.use('/api', translateRouter(ctx));
  app.use('/api', createVttRouter());

  app.use((_req, res) => {
    res.status(404).json({ status: 'error', error: 'not_found' });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { type?: string })?.type === 'entity.too.large' ? 413 : 502;
    // نسجل نوع الخطأ فقط، دون أي محتوى من المستخدم
    console.error(`[x-arabic-clean] request failed: ${(err as Error)?.name ?? 'Error'} ${(err as Error)?.message ?? ''}`);
    res.status(status).json({
      status: 'error',
      error: status === 413 ? 'payload_too_large' : 'processing_failed',
      message: 'تعذّرت المعالجة الآن. حاول مرة أخرى بعد قليل.',
    });
  });

  return app;
}
