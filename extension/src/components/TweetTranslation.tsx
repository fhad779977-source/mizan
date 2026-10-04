import { useRef, useState } from 'react';
import { healthStore, themeStore, useStore } from '../content/stores';
import { describeError, newRequestId, sendToBackground } from '../lib/messaging';
import type { TranslateTextResult } from '../lib/types';

interface Props {
  /** يقرأ النص لحظة الضغط (قد يتغير العنصر بعد التحميل) */
  getText: () => string;
  sourceLanguage: string;
  onRejected?: () => void;
}

type State =
  | { kind: 'idle' }
  | { kind: 'loading'; requestId: string }
  | { kind: 'done'; text: string; mock: boolean }
  | { kind: 'blocked'; message: string }
  | { kind: 'error'; message: string };

export function TweetTranslation({ getText, sourceLanguage, onRejected }: Props) {
  const theme = useStore(themeStore);
  const health = useStore(healthStore);
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [hidden, setHidden] = useState(false);
  const active = useRef<string | null>(null);
  const dark = theme === 'dark';

  const translate = async () => {
    const text = getText().trim();
    if (!text) return;
    const requestId = newRequestId();
    active.current = requestId;
    setHidden(false);
    setState({ kind: 'loading', requestId });
    try {
      const result = await sendToBackground<TranslateTextResult>({ type: 'xac:translate-text', requestId, text, sourceLanguage });
      if (active.current !== requestId) return;
      if (result.status === 'approved') setState({ kind: 'done', text: result.translated, mock: result.mock });
      else {
        setState({
          kind: 'blocked',
          message: result.status === 'rejected' ? 'لم تتم ترجمة هذه التغريدة لأنها لا تطابق سياسة المحتوى النظيف.' : result.reason,
        });
        if (result.status === 'rejected') onRejected?.();
      }
    } catch (err) {
      if (active.current === requestId) setState({ kind: 'error', message: describeError(err) });
    }
  };

  const cancel = () => {
    if (state.kind === 'loading') void sendToBackground({ type: 'xac:abort', requestId: state.requestId }).catch(() => undefined);
    active.current = null;
    setState({ kind: 'idle' });
  };

  const muted = dark ? 'text-[#8b98a5]' : 'text-[#536471]';
  const link = 'cursor-pointer rounded px-1 text-[13px] font-semibold text-emerald-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';

  return (
    <div className={`${dark ? 'dark' : ''} mt-1.5`} data-xac-tweet={state.kind} data-theme={theme}>
      <div className="flex items-center gap-2">
        {state.kind === 'idle' || state.kind === 'error' ? (
          <button type="button" className={link} onClick={translate} data-xac-action="translate-tweet">
            ترجم التغريدة
          </button>
        ) : state.kind === 'loading' ? (
          <>
            <span className={`text-[13px] ${muted}`}>يترجم…</span>
            <button type="button" className={link} onClick={cancel}>
              إيقاف
            </button>
          </>
        ) : state.kind === 'done' ? (
          <button type="button" className={link} onClick={() => setHidden((h) => !h)} data-xac-action="toggle-tweet">
            {hidden ? 'إظهار الترجمة' : 'إخفاء الترجمة'}
          </button>
        ) : null}
        {health?.mode === 'mock' && <span className="rounded-full bg-amber-300 px-1.5 text-[10px] font-bold text-amber-950">تجريبي</span>}
      </div>

      {!hidden && state.kind === 'done' && (
        <div
          dir="rtl"
          lang="ar"
          data-xac-tweet-translation=""
          className={`mt-1.5 rounded-xl border px-3 py-2 text-[15px] leading-7 ${dark ? 'border-[#2f3336] bg-[#16181c] text-[#e7e9ea]' : 'border-[#eff3f4] bg-[#f7f9f9] text-[#0f1419]'}`}
        >
          {state.text}
          <div className={`mt-1 flex items-center justify-between text-[11px] ${muted}`}>
            <span>{state.mock ? 'ترجمة تجريبية (وضع التجربة)' : 'ترجمة آلية'}</span>
            <button type="button" className={link} onClick={() => setState({ kind: 'idle' })} data-xac-action="delete-tweet">
              حذف
            </button>
          </div>
        </div>
      )}

      {(state.kind === 'blocked' || state.kind === 'error') && (
        <p role="status" className={`mt-1 text-[13px] ${state.kind === 'blocked' ? 'text-rose-500' : muted}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}
