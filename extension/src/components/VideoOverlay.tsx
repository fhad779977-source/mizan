import { useEffect, useState, useSyncExternalStore } from 'react';
import { healthStore, settingsStore, useStore } from '../content/stores';
import { saveSettings } from '../lib/settings';
import type { VideoTranslationSession } from '../lib/session';
import { toSRT } from '../lib/subtitles';
import type { Settings } from '../lib/types';
import { SubtitleView } from './SubtitleView';

const COLORS = ['#ffffff', '#fde047', '#67e8f9', '#86efac'];
const REJECT_MESSAGE = 'لم تتم ترجمة هذا المقطع لأنه لا يطابق سياسة المحتوى النظيف.';

interface Props {
  session: VideoTranslationSession;
}

function Btn(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  const { active, className = '', ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      className={`pointer-events-auto inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-40 ${active ? 'bg-white/25' : ''} ${className}`}
    />
  );
}

function MockBadge() {
  return (
    <span
      title="وضع التجربة: النص المعروض تجريبي وليس ترجمة حقيقية لهذا المقطع"
      className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950"
    >
      تجريبي
    </span>
  );
}

export function VideoOverlay({ session }: Props) {
  const snap = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const settings = useStore(settingsStore);
  const health = useStore(healthStore);
  const [visible, setVisible] = useState(true);
  const [panel, setPanel] = useState<'none' | 'style' | 'more'>('none');
  const [toast, setToast] = useState<string | null>(null);
  const isMock = snap.mock || health?.mode === 'mock';

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const update = (patch: Partial<Settings>) => void saveSettings(patch);
  const text = snap.segments.map((s) => s.translated).join('\n');
  const hasResult = snap.segments.length > 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setToast('تم نسخ النص المترجم');
    } catch {
      setToast('تعذّر النسخ');
    }
  };

  const download = () => {
    const blob = new Blob([toSRT(snap.segments)], { type: 'application/x-subrip;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translation-ar.srt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ── محتوى مرفوض ومخفي: نغطي المقطع بالكامل ──
  if (snap.status === 'rejected' && settings.hideUnsafeContent) {
    return (
      <div
        data-xac-state="rejected-hidden"
        className="pointer-events-auto absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-neutral-900 p-6 text-center text-white"
      >
        <div className="text-2xl">🛡️</div>
        <p className="max-w-xs text-sm font-semibold leading-6">{REJECT_MESSAGE}</p>
        <p className="text-xs text-white/60">تم إخفاء المقطع حسب إعداداتك.</p>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0" data-xac-state={snap.status}>
      {visible && hasResult && <SubtitleView video={session.video} segments={snap.segments} settings={settings} />}

      <div className="absolute right-2 top-2 flex max-w-[calc(100%-1rem)] flex-col items-end gap-1.5">
        {snap.status === 'idle' || snap.status === 'stopped' || snap.status === 'error' ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-xac-action="translate"
              onClick={() => session.start()}
              className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 text-[13px] font-bold text-white shadow-lg shadow-black/30 transition hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ترجم
            </button>
            {isMock && <MockBadge />}
          </div>
        ) : snap.status === 'rejected' || snap.status === 'uncertain' ? (
          <div className="xac-glass pointer-events-auto max-w-[280px] rounded-xl p-3 text-white shadow-lg" role="alert">
            <p className="text-[13px] font-semibold leading-6">
              {snap.status === 'rejected' ? REJECT_MESSAGE : snap.message}
            </p>
            <div className="mt-2 flex justify-end">
              <Btn onClick={() => session.clear()}>حسنًا</Btn>
            </div>
          </div>
        ) : (
          <div className="xac-glass pointer-events-auto flex flex-wrap items-center gap-0.5 rounded-full p-1 shadow-lg">
            <span className="px-2 text-[12px] font-semibold text-white/90" data-xac-status="">
              {snap.status === 'processing' ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  يترجم…
                </span>
              ) : (
                'مترجَم'
              )}
            </span>
            {isMock && <MockBadge />}
            {snap.status === 'processing' && (
              <Btn data-xac-action="stop" onClick={() => session.stop()} title="إيقاف المعالجة">
                إيقاف
              </Btn>
            )}
            <Btn data-xac-action="toggle" onClick={() => setVisible((v) => !v)} disabled={!hasResult}>
              {visible ? 'إخفاء الترجمة' : 'إظهار الترجمة'}
            </Btn>
            <Btn active={panel === 'style'} onClick={() => setPanel(panel === 'style' ? 'none' : 'style')} title="شكل الترجمة">
              Aa
            </Btn>
            <Btn active={panel === 'more'} onClick={() => setPanel(panel === 'more' ? 'none' : 'more')} title="المزيد" data-xac-action="more">
              ⋯
            </Btn>
          </div>
        )}

        {snap.status === 'error' && snap.message && (
          <div className="xac-glass max-w-[260px] rounded-lg px-3 py-2 text-[12px] text-white" role="status">
            {snap.message}
          </div>
        )}

        {panel === 'style' && (snap.status === 'processing' || snap.status === 'ready') && (
          <div className="xac-glass pointer-events-auto w-60 space-y-2.5 rounded-xl p-3 text-[12px] text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span>حجم الخط</span>
              <div className="flex items-center gap-1">
                <Btn onClick={() => update({ subtitleFontSize: settings.subtitleFontSize - 2 })}>−</Btn>
                <span className="w-6 text-center tabular-nums">{settings.subtitleFontSize}</span>
                <Btn onClick={() => update({ subtitleFontSize: settings.subtitleFontSize + 2 })}>+</Btn>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>لون النص</span>
              <div className="flex gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => update({ subtitleColor: c })}
                    className={`pointer-events-auto h-5 w-5 rounded-full border-2 ${settings.subtitleColor === c ? 'border-emerald-400' : 'border-white/30'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>الخلفية</span>
              <div className="flex gap-0.5">
                {(
                  [
                    ['dark', 'داكنة'],
                    ['light', 'فاتحة'],
                    ['none', 'بدون'],
                  ] as const
                ).map(([v, label]) => (
                  <Btn key={v} active={settings.subtitleBackground === v} onClick={() => update({ subtitleBackground: v })}>
                    {label}
                  </Btn>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>الموضع</span>
              <div className="flex gap-0.5">
                {(
                  [
                    ['top', 'أعلى'],
                    ['middle', 'وسط'],
                    ['bottom', 'أسفل'],
                  ] as const
                ).map(([v, label]) => (
                  <Btn key={v} active={settings.subtitlePosition === v} onClick={() => update({ subtitlePosition: v })}>
                    {label}
                  </Btn>
                ))}
              </div>
            </div>
          </div>
        )}

        {panel === 'more' && (snap.status === 'processing' || snap.status === 'ready') && (
          <div className="xac-glass pointer-events-auto flex w-52 flex-col rounded-xl p-1.5 text-white shadow-xl">
            <Btn className="justify-start rounded-lg" onClick={() => update({ showOriginal: !settings.showOriginal })}>
              {settings.showOriginal ? '✓ ' : ''}إظهار النص الأصلي
            </Btn>
            <Btn className="justify-start rounded-lg" onClick={copy} disabled={!hasResult} data-xac-action="copy">
              نسخ النص المترجم
            </Btn>
            <Btn className="justify-start rounded-lg" onClick={download} disabled={!hasResult} data-xac-action="download">
              تحميل ملف SRT
            </Btn>
            <Btn className="justify-start rounded-lg" onClick={() => { setPanel('none'); session.retranslate(); }}>
              إعادة الترجمة
            </Btn>
            <Btn className="justify-start rounded-lg text-rose-300" onClick={() => { setPanel('none'); session.clear(); }} data-xac-action="delete">
              حذف النتيجة فورًا
            </Btn>
          </div>
        )}

        {toast && <div className="xac-glass rounded-lg px-3 py-1.5 text-[12px] text-white">{toast}</div>}
      </div>
    </div>
  );
}
