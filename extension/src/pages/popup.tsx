import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/pages.css';
import { sendToBackground } from '../lib/messaging';
import { getSettings, saveSettings } from '../lib/settings';
import type { HealthResult, Settings } from '../lib/types';
import { applySystemTheme } from './theme';

applySystemTheme();

function Popup() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [health, setHealth] = useState<HealthResult | 'down' | null>(null);

  useEffect(() => {
    void getSettings().then(setSettings);
    sendToBackground<HealthResult>({ type: 'xac:health' }).then(setHealth, () => setHealth('down'));
  }, []);

  if (!settings) return null;

  return (
    <main className="w-72 space-y-3 p-4">
      <header className="flex items-center gap-2">
        <img src="icons/icon48.png" alt="" className="h-8 w-8 rounded-lg" />
        <div>
          <h1 className="font-bold">ترجم نظيف</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">X Arabic Clean</p>
        </div>
      </header>

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
        <span className="font-medium">تفعيل الترجمة</span>
        <input
          type="checkbox"
          className="h-5 w-5 accent-emerald-600"
          checked={settings.enabled}
          onChange={async (e) => {
            const enabled = e.target.checked;
            setSettings({ ...settings, enabled });
            setSettings(await saveSettings({ enabled }));
          }}
        />
      </label>

      <div className="rounded-xl bg-slate-100 p-3 text-xs leading-5 dark:bg-slate-900">
        {health === null && 'جارٍ فحص الخادم…'}
        {health === 'down' && <span className="text-rose-600">الخادم غير متصل.</span>}
        {health && health !== 'down' && (health.mode === 'mock' ? (
          <span className="text-amber-700 dark:text-amber-300">وضع التجربة مفعّل — أضف مفاتيح API لتشغيل الترجمة الحقيقية.</span>
        ) : (
          <span className="text-emerald-700 dark:text-emerald-400">متصل — الترجمة الحقيقية تعمل.</span>
        ))}
        <div className="mt-1 text-slate-500">
          {settings.translationMode === 'manual' ? 'الوضع: يدوي (اضغط «ترجم» على المقطع)' : 'الوضع: تلقائي للمقاطع النظيفة'}
        </div>
      </div>

      <div className="flex gap-2 text-sm">
        <button type="button" className="flex-1 rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-500" onClick={() => chrome.runtime.openOptionsPage()}>
          الإعدادات
        </button>
        <a href="privacy.html" target="_blank" className="flex-1 rounded-lg border border-slate-300 py-2 text-center hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">
          الخصوصية
        </a>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
