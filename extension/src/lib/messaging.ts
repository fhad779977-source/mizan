import type { BackgroundRequest, BackgroundResponse } from './types';

export async function sendToBackground<T>(message: BackgroundRequest): Promise<T> {
  const response = (await chrome.runtime.sendMessage(message)) as BackgroundResponse<T> | undefined;
  if (!response) throw new BackgroundError('no_response');
  if (!response.ok) throw new BackgroundError(response.error, response.aborted);
  return response.data;
}

export class BackgroundError extends Error {
  constructor(public code: string, public aborted = false) {
    super(code);
    this.name = 'BackgroundError';
  }
}

export function newRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** رسائل خطأ مفهومة للمستخدم */
export function describeError(err: unknown): string {
  const code = err instanceof BackgroundError ? err.code : '';
  if (code === 'server_unreachable') return 'تعذّر الاتصال بخادم الترجمة. تأكد أنه يعمل ومن عنوانه في الإعدادات.';
  if (code === 'unauthorized') return 'رمز الوصول للخادم غير صحيح. راجع الإعدادات.';
  if (code === 'permission_missing') return 'لم تُمنح الإضافة إذن الوصول لعنوان الخادم. افتح الإعدادات واحفظ العنوان مجددًا.';
  if (code === 'protected_media') return 'هذا المقطع محمي ولا يمكن معالجته.';
  if (code === 'capture_unavailable') return 'لا يسمح المتصفح بالتقاط صوت هذا المقطع.';
  return 'تعذّرت المعالجة الآن. حاول مرة أخرى بعد قليل.';
}
