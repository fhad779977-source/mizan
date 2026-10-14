import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, prog } from "../motion/easing";

export const Hairline: React.FC<{
  start?: number;
  duration?: number;
  exitAt?: number;
  length: number | string;
  thickness?: number;
  color: string;
  origin?: "start" | "end" | "center";
  vertical?: boolean;
  style?: React.CSSProperties;
}> = ({ start = 0, duration = 20, exitAt, length, thickness = 2, color, origin = "start", vertical = false, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, duration, EASE.inOut);
  const x = exitAt === undefined ? 0 : prog(frame, exitAt, 14, EASE.in);
  const o = origin === "start" ? (vertical ? "top" : "left") : origin === "end" ? (vertical ? "bottom" : "right") : "center";
  const exitOrigin = origin === "start" ? (vertical ? "bottom" : "right") : origin === "end" ? (vertical ? "top" : "left") : "center";
  const s = x > 0 ? 1 - x : p;
  return (
    <div
      style={{
        width: vertical ? thickness : length,
        height: vertical ? length : thickness,
        background: color,
        transformOrigin: x > 0 ? exitOrigin : o,
        scale: vertical ? `1 ${s}` : `${s} 1`,
        ...style,
      }}
    />
  );
};
