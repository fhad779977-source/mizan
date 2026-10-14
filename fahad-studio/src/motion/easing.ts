// Studio motion vocabulary. Every animation in the studio reads time from
// useCurrentFrame() and these curves — never from timers or CSS animations.
import { Easing, interpolate, random, spring } from "remotion";

export const EASE = {
  // Fast attack, long settle — the house curve for reveals.
  out: Easing.bezier(0.16, 1, 0.3, 1),
  // Symmetric, decisive — camera moves, wipes.
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  // Gentle in-out for long holds and drifts.
  soft: Easing.bezier(0.45, 0, 0.55, 1),
  // Accelerating exit.
  in: Easing.bezier(0.7, 0, 0.84, 0),
} as const;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 progress for a window [start, start+duration] with easing. */
export const prog = (frame: number, start: number, duration: number, easing: (t: number) => number = EASE.out) =>
  interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], { ...CLAMP, easing });

/** Interpolate between two numbers over a window. */
export const tween = (
  frame: number,
  start: number,
  duration: number,
  from: number,
  to: number,
  easing: (t: number) => number = EASE.out,
) => from + (to - from) * prog(frame, start, duration, easing);

/** Critically damped spring starting at `delay`. */
export const settle = (frame: number, fps: number, delay = 0, stiffness = 120) =>
  spring({ frame: frame - delay, fps, config: { damping: 200, stiffness, mass: 1 } });

/** Deterministic random in [min, max) — same value in preview and render. */
export const seeded = (seed: string | number, min = 0, max = 1) => min + random(seed) * (max - min);

/** Frames per beat for a BPM at a given fps. */
export const beat = (bpm: number, fps: number) => (60 / bpm) * fps;

/** Scale an authored frame count by the project's motion speed. */
export const scaled = (frames: number, speed: number) => Math.max(1, Math.round(frames / speed));
