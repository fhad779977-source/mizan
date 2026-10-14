import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, prog } from "../motion/easing";

/** Small Latin caption such as "01 — DESIGN", revealed by tracking-in. */
export const IndexLabel: React.FC<{
  index?: string;
  label: string;
  start?: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  accent: string;
  style?: React.CSSProperties;
}> = ({ index, label, start = 0, fontFamily, fontSize, color, accent, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 26, EASE.out);
  return (
    <div
      dir="ltr"
      style={{
        fontFamily,
        fontSize,
        fontWeight: 500,
        letterSpacing: `${0.32 - p * 0.14}em`,
        color,
        opacity: p,
        display: "flex",
        gap: fontSize * 0.9,
        alignItems: "center",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {index ? <span style={{ color: accent, fontWeight: 600 }}>{index}</span> : null}
      <span>{label}</span>
    </div>
  );
};
