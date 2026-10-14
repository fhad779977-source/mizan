// Reveals any content (including shaped Arabic lines, images, UI) through an
// animated clip mask. The content is never split, so text shaping is intact.
import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, prog } from "../motion/easing";

export type RevealFrom = "bottom" | "top" | "left" | "right" | "center";

export const MaskReveal: React.FC<{
  start?: number;
  duration?: number;
  from?: RevealFrom;
  exitAt?: number;
  exitDuration?: number;
  parallax?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ start = 0, duration = 24, from = "bottom", exitAt, exitDuration = 16, parallax = 0.12, style, children }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, duration, EASE.out);
  const x = exitAt === undefined ? 0 : prog(frame, exitAt, exitDuration, EASE.in);
  const hidden = (1 - p) * 100;
  const gone = x * 100;
  // inset(top right bottom left)
  const inset =
    from === "bottom"
      ? `${hidden}% 0 ${gone}% 0`
      : from === "top"
        ? `${gone}% 0 ${hidden}% 0`
        : from === "left"
          ? `0 ${hidden}% 0 ${gone}%`
          : from === "right"
            ? `0 ${gone}% 0 ${hidden}%`
            : `${hidden / 2 + gone / 2}% ${hidden / 2 + gone / 2}% ${hidden / 2 + gone / 2}% ${hidden / 2 + gone / 2}%`;
  const shift = (1 - p) * parallax * 100;
  const translate =
    from === "bottom" ? `0 ${shift}%` : from === "top" ? `0 ${-shift}%` : from === "left" ? `${-shift}% 0` : from === "right" ? `${shift}% 0` : "0 0";
  return (
    <div style={{ clipPath: `inset(${inset})`, ...style }}>
      <div style={{ translate, scale: from === "center" ? String(1 + (1 - p) * 0.08) : undefined }}>{children}</div>
    </div>
  );
};
