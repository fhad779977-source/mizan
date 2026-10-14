// Timed captions (from SRT via `npm run import-srt`, stored in project data).
// The active caption is chosen from the current frame, never from playback time.
import type { Caption } from "@remotion/captions";
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, prog } from "../motion/easing";
import { hasArabic } from "./text";

export const Subtitles: React.FC<{
  captions: Caption[];
  bottom: number;
  maxWidth: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  background: string;
}> = ({ captions, bottom, maxWidth, fontFamily, fontSize, color, background }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const active = captions.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!active) return null;
  const startFrame = Math.round((active.startMs / 1000) * fps);
  const endFrame = Math.round((active.endMs / 1000) * fps);
  const inP = prog(frame, startFrame, 8, EASE.out);
  const outP = prog(frame, endFrame - 6, 6, EASE.in);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        dir={hasArabic(active.text) ? "rtl" : "ltr"}
        style={{
          maxWidth,
          padding: `${fontSize * 0.35}px ${fontSize * 0.7}px`,
          borderRadius: fontSize * 0.3,
          background,
          color,
          fontFamily,
          fontSize,
          lineHeight: 1.5,
          textAlign: "center",
          opacity: inP * (1 - outP),
          translate: `0 ${(1 - inP) * fontSize * 0.4}px`,
          whiteSpace: "pre-line",
        }}
      >
        {active.text}
      </div>
    </div>
  );
};
