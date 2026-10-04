import { StrictMode, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/pages.css';
import { sendToBackground } from '../lib/messaging';
import { clearFlaggedAccounts, DEFAULT_SETTINGS, getFlaggedAccounts, getSettings, saveSettings } from '../lib/settings';
import type { HealthResult, Settings } from '../lib/types';
import { applySystemTheme } from './theme';

applySystemTheme();

const LANGUAGES: Array<[Settings['sourceLanguage'], string]> = [
  ['en', 'الإنجليزية (مدعومة بالكامل)'],
  ['auto', 'اكتشاف تلقائي'],
  ['fr', 'الفرنسية (تجريبي)'],
  ['es', 'الإسبانية (تجريبي)'],
  ['de', 'الألمانية (تجريبي)'],
  ['tr', 'التركية (تجريبي)'],
  ['ur', 'الأردية (تجريبي)'],
  ['id', 'الإندونيسية (تجريبي)'],
];

type Health = { state: 'checking' } | { state: 'ok'; data: HealthResult } | { state: 'down' };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#16181c]">
      <h2 className="mb-4 text-base font-bold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Toggle({ label, hint, checked, onChange, name }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; name: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</span>}
      </span>
      <input
        type="checkbox"
        name={name}
        className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-[#0f1419] focus:outline-none focus:ring-2 focus:ring-emerald-500';

function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [health, setHealth] = useState<Health>({ state: 'checking' });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [serverDraft, setServerDraft] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const checkHealth = async () => {
    setHealth({ state: 'checking' });
    try {
      setHealth({ state: 'ok', data: await sendToBackground<HealthResult>({ type: 'xac:health' }) });
    } catch {
      setHealth({ state: 'down' });
    }
  };

  useEffect(() => {
    void getSettings().then((s) => {
      setSettings(s);
      setServerDraft(s.serverUrl);
    });
    void getFlaggedAccounts().then((l) => setFlaggedCount(l.length));
    void checkHealth();
  }, []);

  if (!settings) return null;

  const update = async (patch: Partial<Settings>) => {
    // تحديث فوري للواجهة ثم الحفظ (حتى لا يتأخر مربع الاختيار)
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    const next = await saveSettings(patch);
    setSettings(next);
    setSavedAt(Date.now());
  };

  const saveServer = async () => {
    setPermissionError(null);
    const url = serverDraft.trim().replace(/\/+$/, '');
    const local = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url);
    if (!local) {
      if (!/^https:\/\/[^/]+$/.test(url)) {
        setPermissionError('العنوان يجب أن يكون https:// (أو http://localhost للتجربة المحلية).');
        return;
      }
      const granted = await chrome.permissions.request({ origins: [`${new URL(url).origin}/*`] });
      if (!granted) {
        setPermissionError('لم يتم منح الإذن للوصول إلى هذا الخادم.');
        return;
      }
    }
    await update({ serverUrl: url });
    void checkHealth();
  };

  const isMock = health.state === 'ok' && health.data.mode === 'mock';

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-5 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="icons/icon48.png" alt="" className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="text-xl font-bold">ترجم نظيف</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">X Arabic Clean — الإعدادات</p>
          </div>
        </div>
        <span className={`text-xs text-emerald-600 transition-opacity ${savedAt ? 'opacity-100' : 'opacity-0'}`} aria-live="polite">
          تم الحفظ ✓
        </span>
      </header>

      {isMock && (
        <div data-testid="mock-banner" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          <strong>وضع التجربة مفعّل — أضف مفاتيح API لتشغيل الترجمة الحقيقية.</strong>
          <p className="mt-1">النصوص التي تظهر فوق المقاطع الآن نصوص تجريبية ثابتة وليست ترجمة حقيقية للمقطع. الفحص بالقاموس المحلي يعمل فعليًا.</p>
        </div>
      )}
      {health.state === 'down' && (
        <div data-testid="server-down" className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm leading-6 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          تعذّر الاتصال بخادم الترجمة على <span dir="ltr">{settings.serverUrl}</span>. شغّل الخادم (npm run dev:server) ثم أعد الفحص.
        </div>
      )}

      <Section title="الترجمة">
        <Toggle name="enabled" label="تفعيل الترجمة" checked={settings.enabled} onChange={(v) => update({ enabled: v })} />
        <div className="space-y-2 text-sm">
          <span className="font-medium">طريقة الترجمة</span>
          {(
            [
              ['manual', 'الترجمة اليدوية فقط', 'لا يُرسل أي مقطع إلا بعد ضغطك «ترجم» (الافتراضي).'],
              ['auto', 'ترجمة تلقائية للمقاطع النظيفة', 'تبدأ الترجمة تلقائيًا عند تشغيلك لمقطع. المقطع يُفحص أولًا ولا يُترجم إلا إذا كان نظيفًا.'],
            ] as const
          ).map(([value, label, hint]) => (
            <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <input
                type="radio"
                name="translationMode"
                value={value}
                className="mt-1 accent-emerald-600"
                checked={settings.translationMode === value}
                onChange={() => update({ translationMode: value })}
              />
              <span>
                <span className="block font-medium">{label}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{hint}</span>
              </span>
            </label>
          ))}
        </div>
        <Field label="لغة المقاطع">
          <select className={inputClass} value={settings.sourceLanguage} onChange={(e) => update({ sourceLanguage: e.target.value as Settings['sourceLanguage'] })}>
            {LANGUAGES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="لغة الترجمة">
          <select className={inputClass} value="ar" disabled>
            <option value="ar">العربية</option>
          </select>
        </Field>
      </Section>

      <Section title="الفحص والتصفح النظيف">
        <Toggle
          name="strictModeration"
          label="الفحص الصارم"
          hint="عتبات أشد لرفض المحتوى. في كل الأحوال: أي حالة غير مؤكدة تُمنع ترجمتها."
          checked={settings.strictModeration}
          onChange={(v) => update({ strictModeration: v })}
        />
        <Toggle
          name="hideUnsafeContent"
          label="إخفاء المحتوى غير المناسب"
          hint="يغطّي المقطع أو التغريدة المرفوضة بدل عرضها."
          checked={settings.hideUnsafeContent}
          onChange={(v) => update({ hideUnsafeContent: v })}
        />
        <Toggle
          name="hideUnsafeAccounts"
          label="إخفاء الحسابات التي تنشر محتوى غير نظيف"
          hint="يحفظ اسم الحساب محليًا على جهازك فقط عند رفض محتواه، ويخفي تغريداته لاحقًا."
          checked={settings.hideUnsafeAccounts}
          onChange={(v) => update({ hideUnsafeAccounts: v })}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">حسابات محفوظة: {flaggedCount}</span>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:hover:bg-rose-950/40"
            disabled={!flaggedCount}
            onClick={async () => {
              await clearFlaggedAccounts();
              setFlaggedCount(0);
            }}
          >
            مسح القائمة
          </button>
        </div>
      </Section>

      <Section title="شكل الترجمة">
        <Field label={`حجم الترجمة (${settings.subtitleFontSize}px)`}>
          <input type="range" name="subtitleFontSize" min={12} max={40} step={1} value={settings.subtitleFontSize} onChange={(e) => update({ subtitleFontSize: Number(e.target.value) })} className="w-40 accent-emerald-600" />
        </Field>
        <Field label="لون الترجمة">
          <input type="color" name="subtitleColor" value={settings.subtitleColor} onChange={(e) => update({ subtitleColor: e.target.value })} className="h-8 w-14 cursor-pointer rounded border border-slate-300 dark:border-slate-700" />
        </Field>
        <Field label="خلفية الترجمة">
          <select className={inputClass} value={settings.subtitleBackground} onChange={(e) => update({ subtitleBackground: e.target.value as Settings['subtitleBackground'] })}>
            <option value="dark">داكنة</option>
            <option value="light">فاتحة</option>
            <option value="none">بدون</option>
          </select>
        </Field>
        <Field label="موضع الترجمة">
          <select className={inputClass} value={settings.subtitlePosition} onChange={(e) => update({ subtitlePosition: e.target.value as Settings['subtitlePosition'] })}>
            <option value="bottom">أسفل</option>
            <option value="middle">وسط</option>
            <option value="top">أعلى</option>
          </select>
        </Field>
        <Toggle name="showOriginal" label="إظهار النص الأصلي أسفل الترجمة" checked={settings.showOriginal} onChange={(v) => update({ showOriginal: v })} />
      </Section>

      <Section title="الخصوصية والبيانات">
        <Toggle
          name="deleteAfterProcessing"
          label="حذف البيانات بعد انتهاء المعالجة"
          hint="عند التعطيل تُحفظ الترجمات مؤقتًا في ذاكرة المتصفح حتى إغلاقه لتجنب إعادة المعالجة."
          checked={settings.deleteAfterProcessing}
          onChange={async (v) => {
            await update({ deleteAfterProcessing: v });
            if (v) await chrome.storage.session?.clear();
          }}
        />
        <a href="privacy.html" target="_blank" className="inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          اقرأ سياسة الخصوصية ←
        </a>
      </Section>

      <Section title="الخادم">
        <div className="space-y-2 text-sm">
          <span className="font-medium">عنوان خادم الترجمة</span>
          <div className="flex gap-2">
            <input dir="ltr" name="serverUrl" className={`${inputClass} flex-1`} value={serverDraft} onChange={(e) => setServerDraft(e.target.value)} />
            <button type="button" onClick={saveServer} className="rounded-lg bg-emerald-600 px-3 text-white hover:bg-emerald-500">
              حفظ
            </button>
          </div>
          {permissionError && <p className="text-rose-600">{permissionError}</p>}
        </div>
        <Field label="رمز الوصول (اختياري)">
          <input dir="ltr" type="password" name="accessToken" className={inputClass} value={settings.accessToken} placeholder="ACCESS_TOKEN" onChange={(e) => update({ accessToken: e.target.value })} />
        </Field>
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          رمز الوصول ليس مفتاح API — هو كلمة سر بسيطة تحمي خادمك. مفاتيح OpenAI/Anthropic توضع في ملف ‎.env على الخادم فقط.
        </p>
        <div className="flex items-center justify-between text-sm">
          <span data-testid="server-status">
            الحالة:{' '}
            {health.state === 'checking'
              ? 'جارٍ الفحص…'
              : health.state === 'down'
                ? 'غير متصل'
                : health.data.mode === 'mock'
                  ? 'متصل — وضع التجربة'
                  : 'متصل — الترجمة الحقيقية'}
          </span>
          <button type="button" onClick={checkHealth} className="rounded-lg px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40">
            إعادة الفحص
          </button>
        </div>
        {isMock && (
          <Field label="سيناريو التجربة">
            <select className={inputClass} name="mockScenario" value={settings.mockScenario} onChange={(e) => update({ mockScenario: e.target.value as Settings['mockScenario'] })}>
              <option value="clean">مقطع نظيف (يُترجم)</option>
              <option value="rejected">مقطع غير مناسب (يُرفض)</option>
              <option value="uncertain">حالة غير مؤكدة (تُمنع)</option>
            </select>
          </Field>
        )}
      </Section>

      <div className="flex justify-between pb-6 text-xs text-slate-500">
        <span>الإصدار {chrome.runtime.getManifest().version}</span>
        <button
          type="button"
          className="hover:underline"
          onClick={async () => {
            await update({ ...DEFAULT_SETTINGS, serverUrl: settings.serverUrl, accessToken: settings.accessToken });
          }}
        >
          استعادة الإعدادات الافتراضية
        </button>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
