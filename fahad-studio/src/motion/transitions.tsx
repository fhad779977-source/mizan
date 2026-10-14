// Custom TransitionSeries presentations: mask wipes with a hairline edge,
// an iris from any point, and a "match frame" that grows a rectangle from the
// outgoing scene into the incoming one (shared-element style).
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import { AbsoluteFill } from "remotion";
import type { Transition } from "../schema/project";
import { EASE } from "./easing";

type Dir = "left" | "right" | "up" | "down";
type Rect = { x: number; y: number; w: number; h: number }; // fractions 0..1

/* ---------- Mask wipe: angled edge + hairline + parallax on the outgoing scene */
type MaskWipeProps = { direction: Dir; edgeColor: string; skew: number };

const MaskWipe: React.FC<TransitionPresentationComponentProps<MaskWipeProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: { direction, edgeColor, skew },
}) => {
  const horizontal = direction === "left" || direction === "right";
  // Edge position along the travel axis, in %; incoming covers from the far side.
  const edge = (100 + skew) - p * (100 + 2 * skew);
  if (presentationDirection === "exiting") {
    const shift = -p * 8;
    const translate =
      direction === "left" ? `${shift}% 0` : direction === "right" ? `${-shift}% 0` : direction === "up" ? `0 ${shift}%` : `0 ${-shift}%`;
    return <AbsoluteFill style={{ translate, filter: `brightness(${1 - p * 0.5})` }}>{children}</AbsoluteFill>;
  }
  let poly: string;
  let line: [number, number, number, number];
  if (horizontal) {
    const e = direction === "left" ? edge : 100 - edge;
    const a = e + skew;
    const b = e - skew;
    poly = direction === "left" ? `polygon(${a}% 0, 100% 0, 100% 100%, ${b}% 100%)` : `polygon(0 0, ${a}% 0, ${b}% 100%, 0 100%)`;
    line = [a, 0, b, 100];
  } else {
    const e = direction === "up" ? edge : 100 - edge;
    const a = e - skew;
    const b = e + skew;
    poly = direction === "up" ? `polygon(0 ${a}%, 100% ${b}%, 100% 100%, 0 100%)` : `polygon(0 0, 100% 0, 100% ${b}%, 0 ${a}%)`;
    line = [0, a, 100, b];
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: poly }}>{children}</AbsoluteFill>
      {p > 0 && p < 1 ? (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <line x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} stroke={edgeColor} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

export const maskWipe = (props: MaskWipeProps): TransitionPresentation<MaskWipeProps> => ({ component: MaskWipe, props });

/* ---------- Iris from an arbitrary point */
type IrisProps = { cx: number; cy: number };

const Iris: React.FC<TransitionPresentationComponentProps<IrisProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: { cx, cy },
}) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ scale: String(1 + p * 0.06), filter: `brightness(${1 - p * 0.3})` }}>{children}</AbsoluteFill>;
  }
  // 150% radius guarantees full coverage from any origin.
  return <AbsoluteFill style={{ clipPath: `circle(${p * 150}% at ${cx * 100}% ${cy * 100}%)` }}>{children}</AbsoluteFill>;
};

export const iris = (props: IrisProps): TransitionPresentation<IrisProps> => ({ component: Iris, props });

/* ---------- Match frame: incoming scene is revealed through a rectangle that
   starts where an element of the outgoing scene sits and grows to full frame. */
type MatchFrameProps = { from: Rect; edgeColor: string; radius: number };

const MatchFrame: React.FC<TransitionPresentationComponentProps<MatchFrameProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: { from, edgeColor, radius },
}) => {
  if (presentationDirection === "exiting") {
    // Push into the window: the outgoing scene scales around the rect's center.
    const ox = (from.x + from.w / 2) * 100;
    const oy = (from.y + from.h / 2) * 100;
    return (
      <AbsoluteFill style={{ transformOrigin: `${ox}% ${oy}%`, scale: String(1 + p * 0.35), opacity: 1 - p * 0.6 }}>
        {children}
      </AbsoluteFill>
    );
  }
  const top = from.y * (1 - p) * 100;
  const left = from.x * (1 - p) * 100;
  const right = (1 - from.x - from.w) * (1 - p) * 100;
  const bottom = (1 - from.y - from.h) * (1 - p) * 100;
  const r = radius * (1 - p);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(${top}% ${right}% ${bottom}% ${left}% round ${r}px)` }}>{children}</AbsoluteFill>
      {p < 1 ? (
        <div
          style={{
            position: "absolute",
            top: `${top}%`,
            left: `${left}%`,
            right: `${right}%`,
            bottom: `${bottom}%`,
            border: `2px solid ${edgeColor}`,
            borderRadius: r,
            opacity: 1 - p,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const matchFrame = (props: MatchFrameProps): TransitionPresentation<MatchFrameProps> => ({
  component: MatchFrame,
  props,
});

/* ---------- Mapping from project data to presentation + timing */
const slideDir = { left: "from-right", right: "from-left", up: "from-bottom", down: "from-top" } as const;

const DEFAULT_MATCH: Rect = { x: 0.2, y: 0.3, w: 0.6, h: 0.4 };

/**
 * Match-frame rectangle from a scene's `variant`, as fractions of the frame:
 * "match:x,y,w,h" or "match:x,y,w,h|x,y,w,h" (portrait | landscape).
 */
export const parseMatchRect = (variant: string | undefined, portrait: boolean): Rect => {
  const spec = variant?.match(/match:([\d.,|]+)/)?.[1];
  if (!spec) return DEFAULT_MATCH;
  const [p, l] = spec.split("|");
  const n = (portrait ? p : (l ?? p)).split(",").map(Number);
  if (n.length !== 4 || n.some((v) => Number.isNaN(v))) return DEFAULT_MATCH;
  return { x: n[0], y: n[1], w: n[2], h: n[3] };
};

export const resolveTransition = (
  t: Transition,
  colors: { edge: string },
  matchRect: Rect,
): { presentation: TransitionPresentation<Record<string, unknown>>; timing: ReturnType<typeof linearTiming> } | null => {
  if (t.type === "cut" || t.durationInFrames === 0) return null;
  const timing = linearTiming({ durationInFrames: t.durationInFrames, easing: EASE.inOut });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cast = (p: TransitionPresentation<any>) => p as TransitionPresentation<Record<string, unknown>>;
  switch (t.type) {
    case "maskWipe":
      return { presentation: cast(maskWipe({ direction: t.direction, edgeColor: colors.edge, skew: 12 })), timing };
    case "slide":
      return { presentation: cast(slide({ direction: slideDir[t.direction] })), timing };
    case "iris":
      return { presentation: cast(iris({ cx: 0.5, cy: 0.5 })), timing };
    case "matchFrame":
      return { presentation: cast(matchFrame({ from: matchRect, edgeColor: colors.edge, radius: 24 })), timing };
  }
};
