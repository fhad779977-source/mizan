// Before/after comparison with an animated divider. Both layers are any React
// content of identical size; the "after" layer is revealed with a clip mask.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../motion/easing";

export const BeforeAfter: React.FC<{
  width: number;
  height: number;
  before: React.ReactNode;
  after: React.ReactNode;
  start?: number;
  duration?: number;
  hold?: number; // divider pause point (0..1)
  labels?: { before: string; after: string };
  lineColor: string;
  accent: string;
  font: string;
  style?: React.CSSProperties;
}> = ({ width, height, before, after, start = 0, duration = 60, hold = 0.5, labels, lineColor, accent, font, style }) => {
  const frame = useCurrentFrame();
  const t = (f: number) => start + f * duration;
  const pos = interpolate(frame, [t(0), t(0.4), t(0.6), t(1)], [0, hold, hold, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const showDivider = pos > 0.001 && pos < 0.999;
  const label = (text: string, side: "left" | "right", visible: number) => (
    <div
      style={{
        position: "absolute",
        top: height * 0.04,
        [side]: width * 0.04,
        padding: `${height * 0.012}px ${width * 0.022}px`,
        borderRadius: 99,
        background: "rgba(0,0,0,0.55)",
        color: "#fff",
        fontFamily: font,
        fontSize: Math.max(12, width * 0.026),
        letterSpacing: "0.14em",
        opacity: visible,
      }}
    >
      {text}
    </div>
  );
  return (
    <div style={{ width, height, position: "relative", overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", inset: 0 }}>{before}</div>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - pos) * 100}% 0 0)` }}>{after}</div>
      {labels ? label(labels.before, "right", pos < 0.9 ? 1 : 0) : null}
      {labels ? label(labels.after, "left", pos > 0.12 && pos < 0.999 ? 1 : 0) : null}
      {showDivider ? (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos * 100}%`, width: 2, background: lineColor, translate: "-1px 0" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              translate: "-50% -50%",
              width: width * 0.075,
              height: width * 0.075,
              borderRadius: 999,
              background: lineColor,
              boxShadow: `0 0 0 ${width * 0.008}px ${accent}`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
