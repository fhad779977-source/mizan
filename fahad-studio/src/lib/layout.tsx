// Responsive layout helpers. All sizes in scenes are authored against a
// 1080px short edge and scaled with `u`, so the same scene re-flows between
// 9:16, 16:9, 1:1 and 4:5 instead of being stretched or cropped.
import React, { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import formats from "../../presets/formats.json";
import type { Format } from "../schema/project";

type Insets = { top: number; right: number; bottom: number; left: number };

const SafeAreaContext = createContext<Format["safeArea"]>("none");

export const SafeAreaProvider: React.FC<{ safeArea: Format["safeArea"]; children: React.ReactNode }> = ({
  safeArea,
  children,
}) => <SafeAreaContext.Provider value={safeArea}>{children}</SafeAreaContext.Provider>;

export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const safeKey = useContext(SafeAreaContext);
  const frac = (formats.safeAreas as Record<string, Insets>)[safeKey] ?? formats.safeAreas.none;
  const u = Math.min(width, height) / 1080;
  const margin = 72 * u;
  const safe: Insets = {
    top: Math.max(frac.top * height, margin),
    right: Math.max(frac.right * width, margin),
    bottom: Math.max(frac.bottom * height, margin),
    left: Math.max(frac.left * width, margin),
  };
  const aspect = width / height;
  return {
    width,
    height,
    u,
    aspect,
    isPortrait: aspect < 0.9,
    isLandscape: aspect > 1.1,
    // Square and portrait frames stack content vertically instead of side by side.
    stacked: aspect <= 1.1,
    safe,
    safeRaw: frac,
    content: { x: safe.left, y: safe.top, w: width - safe.left - safe.right, h: height - safe.top - safe.bottom },
  };
};

export type Layout = ReturnType<typeof useLayout>;
