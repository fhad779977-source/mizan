// Renders the concept site scrolling at desktop size. Exported to
// public/assets/video/site-scroll.mp4 and used as a "screen recording" input,
// which exercises the real video-in-device-frame path.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import fahad from "../../presets/brands/fahad.json";
import { StudioSite, siteHeight } from "../components/ui/StudioSite";
import { fontStack } from "../lib/fonts";
import "../lib/fonts";
import { EASE } from "../motion/easing";

export const SiteScroll: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const max = siteHeight(width) - height;
  const scroll = interpolate(frame, [15, 75, 105, 165, 195, durationInFrames - 10], [0, max * 0.33, max * 0.33, max * 0.7, max * 0.7, max], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const c = fahad.colors;
  return (
    <AbsoluteFill>
      <StudioSite
        viewportWidth={width}
        viewportHeight={height}
        scroll={scroll}
        t={{
          bg: c.background,
          surface: c.surface,
          fg: c.foreground,
          muted: c.muted,
          silver: c.silver,
          accent: c.accent,
          display: fontStack("kufi"),
          body: fontStack("plex-arabic"),
          latin: fontStack("inter"),
        }}
      />
    </AbsoluteFill>
  );
};
