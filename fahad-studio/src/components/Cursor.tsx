// Frame-driven pointer with click rings, for interface demos.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE, prog } from "../motion/easing";

export const Cursor: React.FC<{
  keys: Array<{ f: number; x: number; y: number }>;
  clicks?: number[];
  size: number;
  color: string;
  ring: string;
}> = ({ keys, clicks = [], size, color, ring }) => {
  const frame = useCurrentFrame();
  const fs = keys.map((k) => k.f);
  const opt = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOut } as const;
  const x = interpolate(frame, fs, keys.map((k) => k.x), opt);
  const y = interpolate(frame, fs, keys.map((k) => k.y), opt);
  const appear = prog(frame, keys[0].f - 8, 10, EASE.out);
  const press = clicks.reduce((acc, c) => Math.max(acc, frame >= c && frame < c + 6 ? 1 - (frame - c) / 6 : 0), 0);
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", opacity: appear }}>
      {clicks.map((c) => {
        const p = prog(frame, c, 18, EASE.out);
        if (frame < c || p >= 1) return null;
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: size * 3,
              height: size * 3,
              translate: "-50% -50%",
              borderRadius: 999,
              border: `2px solid ${ring}`,
              scale: String(0.3 + p * 0.9),
              opacity: 1 - p,
            }}
          />
        );
      })}
      <div
        style={{
          width: size,
          height: size,
          translate: "-50% -50%",
          borderRadius: 999,
          background: color,
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          scale: String(1 - press * 0.25),
        }}
      />
    </div>
  );
};
