import { useEffect, useRef } from 'react';

export interface SceneScroll {
  /** Fractional section index: whole numbers while a section holds, fractions while travelling. */
  progress: number;
  /** 0..1 progress through the pinned part of each section (for tall, sticky sections). */
  local: number[];
}

/**
 * Maps native page scroll to a continuous "scene progress".
 * A section holds its shot while its sticky content is pinned; the
 * following viewport-height of scrolling travels to the next shot.
 */
export function useSceneScroll(sectionIds: readonly string[], onChange: (state: SceneScroll) => void) {
  const callback = useRef(onChange);
  callback.current = onChange;

  useEffect(() => {
    let frame = 0;
    const state: SceneScroll = { progress: 0, local: sectionIds.map(() => 0) };

    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      const y = window.scrollY;
      let progress = 0;
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (!el) continue;
        const top = el.offsetTop;
        const holdEnd = top + Math.max(0, el.offsetHeight - vh);
        state.local[i] = holdEnd > top ? Math.min(Math.max((y - top) / (holdEnd - top), 0), 1) : y >= top ? 1 : 0;
        if (y >= top) {
          progress = y <= holdEnd ? i : i + Math.min((y - holdEnd) / vh, 1);
        }
      }
      state.progress = Math.min(progress, sectionIds.length - 1);
      callback.current(state);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [sectionIds]);
}

/** Absolute scroll position at which a section (optionally a fraction into its pinned range) is shown. */
export function scrollTargetFor(id: string, fraction = 0): number {
  const el = document.getElementById(id);
  if (!el) return 0;
  const pinned = Math.max(0, el.offsetHeight - window.innerHeight);
  return el.offsetTop + pinned * fraction;
}
