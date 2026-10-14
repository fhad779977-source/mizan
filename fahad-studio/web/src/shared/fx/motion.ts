// Motion runtime for live websites. Unlike the Remotion video section, the
// web reacts to real time and user input; this module is web-only and is
// never imported by Remotion compositions.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fine pointer + hover = mouse/trackpad. Touch devices get tap alternatives. */
export const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** ?capture=1 — deterministic mode for automated screenshots/showreels:
 *  no scrub smoothing, no lerp, so a scroll position maps to one exact frame. */
export const captureMode = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("capture");

// Capture mode: the global GSAP timeline is paused and advanced explicitly by
// the capture script (window.__capture.step), one video frame at a time.
if (captureMode()) {
  gsap.globalTimeline.pause();
  gsap.ticker.lagSmoothing(0);
  (window as Window & { __capture?: unknown }).__capture = {
    step: (dt: number) => {
      ScrollTrigger.update();
      gsap.globalTimeline.totalTime(gsap.globalTimeline.totalTime() + dt);
    },
  };
}

/** Scrub value: smoothed for people, exact for capture. */
export const scrub = (smooth = 0.8) => (captureMode() ? true : smooth);

// Debug registry: every effect registers on mount and releases on cleanup, so
// QA can assert nothing accumulates (window.__fx.active).
type FxWindow = Window & { __fx?: { active: Record<string, number>; triggers?: () => number } };
export const trackFx = (name: string) => {
  const w = window as FxWindow;
  w.__fx ??= { active: {} };
  w.__fx.triggers ??= () => ScrollTrigger.getAll().length;
  w.__fx.active[name] = (w.__fx.active[name] ?? 0) + 1;
  return () => {
    w.__fx!.active[name] -= 1;
  };
};
