import React, { createContext, useContext } from "react";
import type { Brand, Project } from "../schema/project";
import { fontStack } from "./fonts";

type BrandTokens = Brand & {
  font: { display: string; body: string; latin: string };
  dir: "rtl" | "ltr";
  speed: number;
  bpm: number;
  /** Display weight: single-weight display faces (Instrument Serif) stay at
   *  400 so the browser never synthesizes a fake bold. */
  dw: (weight: number) => number;
};

const BrandContext = createContext<BrandTokens | null>(null);

export const BrandProvider: React.FC<{ project: Project; children: React.ReactNode }> = ({ project, children }) => {
  const value: BrandTokens = {
    ...project.brand,
    font: {
      display: fontStack(project.brand.fonts.display),
      body: fontStack(project.brand.fonts.body),
      latin: fontStack(project.brand.fonts.latin),
    },
    dir: project.direction,
    speed: project.motion.speed,
    bpm: project.motion.bpm,
    dw: (w: number) => (project.brand.fonts.display === "instrument-serif" ? 400 : w),
  };
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
};

export const useBrand = (): BrandTokens => {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand() must be used inside <BrandProvider>");
  return ctx;
};
