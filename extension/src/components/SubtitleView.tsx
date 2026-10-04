import { useEffect, useMemo, useState } from 'react';
import { findCue, sortSegments } from '../lib/subtitles';
import type { Segment, Settings } from '../lib/types';

const BACKGROUNDS: Record<Settings['subtitleBackground'], string> = {
  dark: 'rgba(0, 0, 0, 0.62)',
  light: 'rgba(255, 255, 255, 0.82)',
  none: 'transparent',
};

/** المسافة من الأسفل تترك مكانًا لشريط تحكم X حتى لا نغطي أزراره */
const POSITIONS: Record<Settings['subtitlePosition'], React.CSSProperties> = {
  bottom: { bottom: 64 },
  middle: { top: '50%', transform: 'translateY(-50%)' },
  top: { top: 56 },
};

interface Props {
  video: HTMLVideoElement;
  segments: Segment[];
  settings: Settings;
}

/**
 * يعرض السطر الحالي فقط. نستمع لـ timeupdate/seeked (خفيف جدًا) ونحدّث الحالة فقط
 * عند تغيّر السطر، فلا يتأثر أداء تشغيل الفيديو.
 */
export function SubtitleView({ video, segments, settings }: Props) {
  const sorted = useMemo(() => sortSegments(segments), [segments]);
  const [cue, setCue] = useState<Segment | null>(() => findCue(sorted, video.currentTime));

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = findCue(sorted, video.currentTime);
        setCue((prev) => (prev === next ? prev : next));
      });
    };
    update();
    video.addEventListener('timeupdate', update);
    video.addEventListener('seeked', update);
    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener('timeupdate', update);
      video.removeEventListener('seeked', update);
    };
  }, [video, sorted]);

  if (!cue) return null;
  const textColor = settings.subtitleBackground === 'light' && settings.subtitleColor.toLowerCase() === '#ffffff' ? '#0f1419' : settings.subtitleColor;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 flex justify-center px-4"
      style={POSITIONS[settings.subtitlePosition]}
      data-xac-subtitle=""
    >
      <div
        className="xac-subtitle max-w-[92%] rounded-lg px-3 py-1.5 text-center"
        style={{ background: BACKGROUNDS[settings.subtitleBackground], color: textColor, fontSize: settings.subtitleFontSize }}
      >
        <div dir="rtl" lang="ar">{cue.translated}</div>
        {settings.showOriginal && (
          <div dir="auto" className="mt-0.5 opacity-80" style={{ fontSize: Math.round(settings.subtitleFontSize * 0.72) }}>
            {cue.original}
          </div>
        )}
      </div>
    </div>
  );
}
